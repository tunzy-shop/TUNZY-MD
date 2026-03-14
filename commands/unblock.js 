// commands/unblock.js
const isOwnerOrSudo = require('../lib/isOwner');

async function unblockCommand(sock, chatId, message) {
    try {
        // Check if sender is owner/sudo
        const senderId = message.key.participant || message.key.remoteJid;
        const senderIsOwner = await isOwnerOrSudo(senderId, sock, chatId);
        
        if (!message.key.fromMe && !senderIsOwner) {
            return await sock.sendMessage(chatId, { 
                text: '❌ This command is only for the owner/sudo.' 
            }, { quoted: message });
        }

        const mentioned = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
        let targetJid = mentioned[0];

        if (!targetJid) {
            return await sock.sendMessage(chatId, { 
                text: '❌ Please mention the user to unblock.\nExample: .unblock @user' 
            });
        }

        await sock.updateBlockStatus(targetJid, 'unblock');
        
        await sock.sendMessage(chatId, { 
            text: `✪ \`\`\`User Unblocked\`\`\`\n\n@${targetJid.split('@')[0]} has been unblocked.`,
            mentions: [targetJid]
        }, { quoted: message });
    } catch (error) {
        console.error('Error in unblock command:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to unblock user.' });
    }
}

module.exports = unblockCommand;