// Exemple de fonction Serverless (compatible Vercel / Express)
export default async function handler(req, res) {
    // Gestion des CORS (si l'API et le frontend sont sur des domaines différents)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Méthode non autorisée. Utilisez POST.' });
    }

    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Le champ message est requis.' });
    }

    try {
        // Contexte donné à l'IA pour répondre en tant qu'assistant de l'ouvrage
        const systemPrompt = `Tu es l'assistant virtuel de l'essai "Méditation sur la vie de l'homme et son langage" rédigé par Folly Valère Tossou (CRDH). 
        Le livre est disponible au tarif de 10.000 F CFA via commande WhatsApp. Sois courtois, philosophique et concis.`;

        /* 
           Exemple avec l'API OpenAI (Nécessite la clé OPENAI_API_KEY en variable d'environnement)
           Si tu utilises un autre fournisseur (Gemini, Mistral, Render Python), adapte cet appel.
        */
        const apiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: message }
                ],
                max_tokens: 250,
                temperature: 0.7
            })
        });

        const data = await apiResponse.json();

        if (data.choices && data.choices.length > 0) {
            const botReply = data.choices[0].message.content;
            return res.status(200).json({ reply: botReply });
        } else {
            return res.status(500).json({ error: 'Erreur lors de la génération de la réponse.' });
        }

    } catch (error) {
        console.error('Erreur API Chat :', error);
        return res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
}