const yts = require('yt-search');
const axios = require('axios');

async function playCommand(sock, chatId, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const input = text.split(' ').slice(1).join(' ').trim();

        if (!input) {
            return await sock.sendMessage(chatId, { 
                text: "What song do you want to download?"
            });
        }

        // Use the specific URL you provided
        const videoUrl = "https://youtube.com/watch?v=hmdX6X2MOik";

        // Fetch audio from API
        const apiUrl = `https://apis-keith.vercel.app/download/dlmp3?url=${encodeURIComponent(videoUrl)}`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data?.status || !data?.result?.downloadUrl) {
            throw new Error("API returned invalid data");
        }

        const audioUrl = data.result.downloadUrl;
        const title = data.result.title || "MONTAGEM SUPERSONIC SLO...";

        // Send ONLY the audio - no text messages, no reactions, no loading messages
        await sock.sendMessage(chatId, {
            audio: { url: audioUrl },
            mimetype: "audio/mpeg",
            fileName: `${title}.mp3`,
            ptt: false
        }, { quoted: message });

    } catch (error) {
        console.error('Error in playCommand:', error);
        // Only log error, don't send any message to user
    }
}

module.exports = playCommand;