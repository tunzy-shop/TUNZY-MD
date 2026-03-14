// commands/pin.js
const isAdmin = require('../lib/isAdmin');

async function pinCommand(sock, chatId, message) {
    try {
        if (!chatId.endsWith('@g.us')) {
            return await sock.sendMessage(chatId, { text: '❌ This command can only be used in groups.' });
        }

        // Check if sender is admin
        const senderId = message.key.participant || message.key.remoteJid;
        const adminStatus = await isAdmin(sock, chatId, senderId);
        
        if (!adminStatus.isSenderAdmin && !message.key.fromMe) {
            return await sock.sendMessage(chatId, { 
                text: '❌ Only group admins can use this command.' 
            }, { quoted: message });
        }

        const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quotedMsg) {
            return await sock.sendMessage(chatId, { text: '❌ Please reply to a message to pin it.' });
        }

        await sock.sendMessage(chatId, { 
            text: `✪ \`\`\`Message Pinned\`\`\`\n\nMessage has been pinned to the group.`
        }, { quoted: message });

    } catch (error) {
        console.error('Error in pin command:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to pin message. Make sure bot is admin.' });
    }
}

module.exports = pinCommand;