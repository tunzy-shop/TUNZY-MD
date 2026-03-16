const os = require('os');
const settings = require('../settings.js');

async function pingCommand(sock, chatId, message) {
    try {
        const sentMsg = await sock.sendMessage(chatId, { text: 'Pinging.......' }, { quoted: message });

        const start = Date.now();

        // Delay to make ping reach ~2000ms
        await new Promise(resolve => setTimeout(resolve, 2000));

        const end = Date.now();
        const speed = Math.round(end - start);

        const botInfo = `✪ \`\`\`Pong! ${speed} ms\`\`\``;

        await sock.sendMessage(chatId, { 
            text: botInfo,
            edit: sentMsg.key 
        });

    } catch (error) {
        console.error('Error in ping command:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to get bot status.' });
    }
}

module.exports = pingCommand;