// commands/leave.js
const isOwnerOrSudo = require('../lib/isOwner');

async function leaveCommand(sock, chatId, message) {
    try {
        // Check if sender is owner/sudo
        const senderId = message.key.participant || message.key.remoteJid;
        const senderIsOwner = await isOwnerOrSudo(senderId, sock, chatId);
        
        if (!message.key.fromMe && !senderIsOwner) {
            return await sock.sendMessage(chatId, { 
                text: '❌ This command is only for the owner/sudo.' 
            }, { quoted: message });
        }

        if (!chatId.endsWith('@g.us')) {
            return await sock.sendMessage(chatId, { text: '❌ This command can only be used in groups.' });
        }

        await sock.sendMessage(chatId, { 
            text: '✪ ```Goodbye!```\n\nBot is leaving the group as requested.' 
        });
        
        // Wait a moment to send the message before leaving
        setTimeout(async () => {
            await sock.groupLeave(chatId);
        }, 2000);
        
    } catch (error) {
        console.error('Error in leave command:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to leave group.' });
    }
}

module.exports = leaveCommand;