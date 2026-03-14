// commands/mute-user.js
const mutedUsers = new Map(); // Store muted users: { jid: expiryTime }

async function muteUserCommand(sock, chatId, message, userMessage) {
    try {
        if (!chatId.endsWith('@g.us')) {
            return await sock.sendMessage(chatId, { text: '❌ This command can only be used in groups.' });
        }

        const mentioned = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
        if (mentioned.length === 0) {
            return await sock.sendMessage(chatId, { text: '❌ Please mention the user to mute.\nExample: .mute-user @user' });
        }

        const targetJid = mentioned[0];
        const args = userMessage.split(' ');
        let duration = 0; // 0 = permanent
        
        if (args[2]) {
            const time = parseInt(args[2]);
            const unit = args[3] || 'm';
            
            if (unit === 'h') duration = time * 60 * 60 * 1000;
            else if (unit === 'd') duration = time * 24 * 60 * 60 * 1000;
            else duration = time * 60 * 1000; // default minutes
        }

        mutedUsers.set(targetJid, {
            expiry: duration > 0 ? Date.now() + duration : null,
            groupId: chatId
        });

        const response = `✪ \`\`\`User Muted\`\`\`\n\n@${targetJid.split('@')[0]} has been muted ${duration ? 'for ' + args[2] + (args[3] || 'm') : 'permanently'}.`;
        
        await sock.sendMessage(chatId, { 
            text: response,
            mentions: [targetJid]
        }, { quoted: message });
    } catch (error) {
        console.error('Error in mute-user command:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to mute user.' });
    }
}

// Function to check if user is muted
function isUserMuted(jid, groupId) {
    const muted = mutedUsers.get(jid);
    if (!muted || muted.groupId !== groupId) return false;
    if (muted.expiry && Date.now() > muted.expiry) {
        mutedUsers.delete(jid);
        return false;
    }
    return true;
}

module.exports = { muteUserCommand, isUserMuted, mutedUsers };