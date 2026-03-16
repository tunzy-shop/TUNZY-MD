const os = require('os');
const settings = require('../settings.js');

async function pingCommand(sock, chatId, message) {
    try {
        const start = Date.now();
        
        // Send initial "Pinging......." message
        const sentMsg = await sock.sendMessage(chatId, { text: 'Pinging.......' }, { quoted: message });
        
        // Send a lightweight read receipt or just wait for network round-trip
        // This sends a read receipt without showing typing
        if (message?.key) {
            await sock.readMessages([message.key]);
        }
        
        const end = Date.now();
        const speed = Math.round(end - start);

        // Response with ✪ bullet and MD format
        const botInfo = `✪ \`\`\`Pong! ${speed} ms\`\`\``;

        // Edit the previous message with the result
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