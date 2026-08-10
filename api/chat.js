export default async function handler(req, res) {
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
        const systemPrompt = `Tu es l'assistant virtuel de l'essai "Méditation sur la vie de l'homme et son langage" rédigé par Folly Valère Tossou (CRDH). 
        Le livre est disponible au tarif de 10.000 F CFA via commande WhatsApp. Sois courtois, philosophique et concis.`;

        const apiKey = process.env.GEMINI_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const apiResponse = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                system_instruction: {
                    parts: [{ text: systemPrompt }]
                },
                contents: [
                    {
                        parts: [{ text: message }]
                    }
                ]
            })
        });

        const data = await apiResponse.json();

        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
            const botReply = data.candidates[0].content.parts[0].text;
            return res.status(200).json({ reply: botReply });
        } else {
            console.error('Erreur Gemini:', data);
            return res.status(500).json({ error: 'Erreur lors de la réponse de Gemini.' });
        }

    } catch (error) {
        console.error('Erreur API Chat :', error);
        return res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
}
