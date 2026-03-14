// commands/add.js
const isAdmin = require('../lib/isAdmin');

async function addCommand(sock, chatId, message, userMessage) {
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

        // Check if bot is admin
        if (!adminStatus.isBotAdmin) {
            return await sock.sendMessage(chatId, { 
                text: '❌ Please make the bot an admin first.' 
            }, { quoted: message });
        }

        const number = userMessage.slice(4).trim().replace(/[^0-9]/g, '');
        if (!number) {
            return await sock.sendMessage(chatId, { 
                text: '❌ Please provide a number to add.\nExample: .add 2347030626048' 
            }, { quoted: message });
        }

        const jid = number + '@s.whatsapp.net';
        
        await sock.groupParticipantsUpdate(chatId, [jid], 'add');
        
        await sock.sendMessage(chatId, { 
            text: `✪ \`\`\`User Added Successfully\`\`\`\n\n@${number} has been added to the group.`,
            mentions: [jid]
        }, { quoted: message });
    } catch (error) {
        console.error('Error in add command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Failed to add user. Make sure the number is valid and the bot has permission.' 
        }, { quoted: message });
    }
}

module.exports = addCommand;