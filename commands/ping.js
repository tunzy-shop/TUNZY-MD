const os = require('os');
const settings = require('../settings.js');

async function pingCommand(sock, chatId, message) {
    try {
        const start = Date.now();
        
        // Send initial "Pinging......." message
        const sentMsg = await sock.sendMessage(chatId, { text: 'Pinging.......' }, { quoted: message });
        
        // Measure actual network round-trip time by sending a receipt or typing indicator
        // This will show real latency that can go up to 1900ms or more
        await sock.sendPresenceUpdate('composing', chatId);
        
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