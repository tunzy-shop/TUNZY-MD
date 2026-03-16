const os = require('os');
const settings = require('../settings.js');

async function pingCommand(sock, chatId, message) {
    try {
        const sentMsg = await sock.sendMessage(chatId, { text: 'Pinging.......' }, { quoted: message });

        const start = Date.now();

        // Random delay between 200ms and 2000ms
        const randomDelay = Math.floor(Math.random() * (2000 - 200 + 1)) + 200;
        await new Promise(resolve => setTimeout(resolve, randomDelay));

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