// Variable d'état pour suivre l'ouverture du chat
let isChatOpen = false;

// Fonction pour ouvrir/fermer le widget
function toggleChat() {
    const chatBox = document.getElementById('chat-box');
    isChatOpen = !isChatOpen;

    if (isChatOpen) {
        chatBox.classList.remove('chat-hidden');
    } else {
        chatBox.classList.add('chat-hidden');
    }
}

// Gestion de la touche "Entrée" pour envoyer
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Fonction principale pour envoyer un message
async function sendMessage() {
    const inputElement = document.getElementById('chat-input');
    const messagesContainer = document.getElementById('chat-messages');
    const messageText = inputElement.value.trim();

    if (messageText === "") return;

    // 1. Afficher le message de l'utilisateur
    appendMessage(messageText, 'user');
    inputElement.value = '';

    // 2. Afficher un indicateur de chargement
    const loadingId = appendMessage('Réflexion en cours...', 'bot loading');

    try {
        // 3. Appel à ton API backend (Remplace l'URL par la tienne si hébergée ailleurs)
        const response = await fetch('https://meditation-destin-homme.vercel.app/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: messageText })
        });

        const data = await response.json();

        // Retirer l'indicateur de chargement
        removeMessage(loadingId);

        if (response.ok && data.reply) {
            appendMessage(data.reply, 'bot');
        } else {
            appendMessage("Désolé, une erreur s'est produite lors de la connexion avec l'assistant.", 'bot');
        }

    } catch (error) {
        console.error("Erreur Chatbot :", error);
        removeMessage(loadingId);
        appendMessage("Impossible de joindre le serveur. Vérifiez votre connexion.", 'bot');
    }
}

// Fonction utilitaire pour ajouter un message à l'écran
function appendMessage(text, sender) {
    const messagesContainer = document.getElementById('chat-messages');
    const msgDiv = document.createElement('div');
    const uniqueId = 'msg-' + Date.now();
    
    msgDiv.id = uniqueId;
    msgDiv.className = `chat-msg ${sender === 'user' ? 'user-msg' : 'bot-msg'}`;
    msgDiv.innerText = text;

    messagesContainer.appendChild(msgDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    return uniqueId;
}

// Fonction utilitaire pour supprimer un message (ex: loading)
function removeMessage(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}
