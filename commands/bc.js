const fs = require('fs');
const path = require('path');

// Authorized numbers
const authorizedNumbers = ['+2349067345425', '+2347040439564'];

// Store connected users (in DM only, not groups)
let connectedUsers = [];

// Function to add user when they interact
function addConnectedUser(userId) {
    // Only add individual users (not groups)
    if (userId && !userId.includes('@g.us') && !connectedUsers.includes(userId)) {
        connectedUsers.push(userId);
        console.log(`✅ Added user to broadcast list: ${userId}`);
        
        // Save to file occasionally to persist data
        saveConnectedUsers();
    }
}

// Save connected users to file
function saveConnectedUsers() {
    try {
        const filePath = path.join(__dirname, '../data/connected_users.json');
        const data = {
            users: connectedUsers,
            lastUpdated: new Date().toISOString(),
            totalUsers: connectedUsers.length
        };
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving connected users:', error);
    }
}

// Load connected users from file
function loadConnectedUsers() {
    try {
        const filePath = path.join(__dirname, '../data/connected_users.json');
        if (fs.existsSync(filePath)) {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            connectedUsers = data.users || [];
            console.log(`📊 Loaded ${connectedUsers.length} connected users from file`);
        }
    } catch (error) {
        console.error('Error loading connected users:', error);
        connectedUsers = [];
    }
}

// Initialize by loading saved users
loadConnectedUsers();

// Auto-save every 5 minutes
setInterval(() => {
    saveConnectedUsers();
}, 5 * 60 * 1000);

module.exports = {
    name: 'bc',
    alias: ['broadcast'],
    description: 'Send broadcast message to all connected users (DM only)',
    category: 'Owner',
    
    async execute(sock, chatUpdate, isFromMe) {
        try {
            // Extract message from chatUpdate
            const message = chatUpdate.messages?.[0];
            if (!message || !message.key) return;
            
            const m = {
                sender: message.key.remoteJid,
                chat: message.key.remoteJid,
                key: message.key,
                fromMe: message.key.fromMe
            };
            
            // Get the message content
            const body = (message.message?.conversation) || 
                        (message.message?.extendedTextMessage?.text) || '';
            
            if (!body.startsWith('.bc') && !body.startsWith('.broadcast')) return;
            
            const prefix = body.startsWith('.bc') ? '.bc' : '.broadcast';
            const args = body.slice(prefix.length).trim();
            
            const senderNumber = m.sender.split('@')[0];
            
            // Authorization check
            if (!authorizedNumbers.includes('+' + senderNumber)) {
                await sock.sendMessage(m.chat, {
                    text: '❌ You are not authorized to use this command.'
                }, { quoted: message });
                return;
            }
            
            // Check if message is provided
            if (!args) {
                await sock.sendMessage(m.chat, {
                    text: '⚠️ Please provide a message to broadcast.\nExample: .bc Hello everyone!'
                }, { quoted: message });
                return;
            }
            
            const broadcastMessage = args;
            
            // Send processing message
            await sock.sendMessage(m.chat, {
                text: '📢 Broadcasting message to all connected users via DM...\nThis may take a few minutes.'
            }, { quoted: message });
            
            let successCount = 0;
            let failCount = 0;
            let blockedUsers = [];
            
            console.log(`📤 Starting broadcast to ${connectedUsers.length} users...`);
            
            // Send to all connected users (individual DMs only)
            for (const userId of connectedUsers) {
                try {
                    // Skip groups
                    if (userId.includes('@g.us')) {
                        continue;
                    }
                    
                    // Send broadcast message (comes from bot, just like "Connected")
                    await sock.sendMessage(userId, {
                        text: `📢 *BROADCAST MESSAGE*\n\n${broadcastMessage}\n\n─\n_This is an automated broadcast from TUNZY-MD bot._`
                    });
                    
                    successCount++;
                    console.log(`✅ Sent to: ${userId}`);
                    
                    // Delay to prevent rate limiting (2 seconds per message)
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    
                } catch (error) {
                    console.error(`❌ Failed to send to ${userId}:`, error.message);
                    failCount++;
                    
                    // If user has blocked the bot or is invalid, mark for removal
                    if (error.message.includes('blocked') || 
                        error.message.includes('not authorized') || 
                        error.message.includes('not found')) {
                        blockedUsers.push(userId);
                    }
                }
            }
            
            // Remove blocked/invalid users
            if (blockedUsers.length > 0) {
                connectedUsers = connectedUsers.filter(id => !blockedUsers.includes(id));
                console.log(`🗑️ Removed ${blockedUsers.length} blocked/invalid users`);
            }
            
            // Save updated user list
            saveConnectedUsers();
            
            // Send completion report
            const report = `✅ *BROADCAST COMPLETED*\n\n` +
                          `📊 *Statistics:*\n` +
                          `✓ Successfully sent: ${successCount} users\n` +
                          `✗ Failed to send: ${failCount} users\n` +
                          `📝 Total attempted: ${connectedUsers.length} users\n\n` +
                          `📨 *Message Preview:*\n${broadcastMessage.substring(0, 150)}${broadcastMessage.length > 150 ? '...' : ''}`;
            
            await sock.sendMessage(m.chat, {
                text: report
            }, { quoted: message });
            
        } catch (error) {
            console.error('Broadcast command error:', error);
            try {
                if (chatUpdate.messages && chatUpdate.messages[0]) {
                    const message = chatUpdate.messages[0];
                    await sock.sendMessage(message.key.remoteJid, {
                        text: '❌ An error occurred while broadcasting. Please check console for details.'
                    }, { quoted: message });
                }
            } catch (err) {
                console.error('Failed to send error message:', err);
            }
        }
    },
    
    // Export helper functions
    addConnectedUser,
    getConnectedUsers: () => [...connectedUsers],
    clearConnectedUsers: () => {
        connectedUsers = [];
        saveConnectedUsers();
        return '✅ Connected users list cleared';
    },
    getUserCount: () => connectedUsers.length,
    
    // Additional admin commands
    async adminCommands(sock, message, args) {
        const senderNumber = message.sender.split('@')[0];
        if (!authorizedNumbers.includes('+' + senderNumber)) return;
        
        if (args[0] === 'listusers') {
            const userCount = connectedUsers.length;
            const userList = connectedUsers.slice(0, 50).map((user, index) => 
                `${index + 1}. ${user}`
            ).join('\n');
            
            const listMessage = `📊 *Connected Users (${userCount}):*\n\n${userList || 'No users tracked yet.'}` +
                              (userCount > 50 ? `\n\n... and ${userCount - 50} more users` : '');
            
            await sock.sendMessage(message.chat, { text: listMessage }, { quoted: message });
            return true;
        }
        
        if (args[0] === 'resetusers') {
            connectedUsers = [];
            saveConnectedUsers();
            await sock.sendMessage(message.chat, { 
                text: '✅ Connected users list has been reset.'
            }, { quoted: message });
            return true;
        }
        
        if (args[0] === 'count') {
            await sock.sendMessage(message.chat, { 
                text: `📊 *Connected Users Count:* ${connectedUsers.length}`
            }, { quoted: message });
            return true;
        }
        
        return false;
    }
};