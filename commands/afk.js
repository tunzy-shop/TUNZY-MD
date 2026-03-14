// commands/afk.js
const afkUsers = new Map(); // Store AFK users: { reason, timestamp }

async function afkCommand(sock, chatId, message, userMessage) {
    try {
        const sender = message.key.participant || message.key.remoteJid;
        const reason = userMessage.slice(4).trim() || 'Away from keyboard';
        
        afkUsers.set(sender, {
            reason: reason,
            timestamp: Date.now()
        });

        const response = `✪ \`\`\`AFK Mode Activated\`\`\`\n\n📝 *Reason:* ${reason}\n\nYou will be marked as AFK. Anyone mentioning you will be notified.`;
        
        await sock.sendMessage(chatId, { text: response }, { quoted: message });
    } catch (error) {
        console.error('Error in afk command:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to set AFK status.' });
    }
}

// Function to check if user is AFK (call this from main.js when someone is mentioned)
function checkAFK(userJid) {
    return afkUsers.get(userJid);
}

// Function to remove AFK status
function removeAFK(userJid) {
    return afkUsers.delete(userJid);
}

module.exports = { afkCommand, checkAFK, removeAFK, afkUsers };