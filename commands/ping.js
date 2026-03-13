const os = require('os');
const settings = require('../settings.js');

async function pingCommand(sock, chatId, message) {
    try {
        // Send initial "pinging....." message
        const sentMsg = await sock.sendMessage(chatId, { text: 'pinging.....' }, { quoted: message });
        
        const start = Date.now();
        
        // Small delay to make the ping measurement more meaningful
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const end = Date.now();
        const ping = Math.round(end - start);

        // Simple ping response without uptime
        const botInfo = `Pong! ${ping} ms`;

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