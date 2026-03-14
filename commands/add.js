// commands/add.js
async function addCommand(sock, chatId, message, userMessage) {
    try {
        if (!chatId.endsWith('@g.us')) {
            return await sock.sendMessage(chatId, { text: '❌ This command can only be used in groups.' });
        }

        const number = userMessage.slice(4).trim().replace(/[^0-9]/g, '');
        if (!number) {
            return await sock.sendMessage(chatId, { text: '❌ Please provide a number to add.\nExample: .add 2347030626048' });
        }

        const jid = number + '@s.whatsapp.net';
        
        await sock.groupParticipantsUpdate(chatId, [jid], 'add');
        
        await sock.sendMessage(chatId, { 
            text: `✪ \`\`\`User Added Successfully\`\`\`\n\n@${number} has been added to the group.`,
            mentions: [jid]
        }, { quoted: message });
    } catch (error) {
        console.error('Error in add command:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to add user. Make sure the number is valid and the bot has permission.' });
    }
}

module.exports = addCommand;