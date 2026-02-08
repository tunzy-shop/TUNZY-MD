const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const USER_GROUP_DATA = path.join(__dirname, '../data/userGroupData.json');

// In-memory storage for chat history and user info
const chatMemory = {
    messages: new Map(), // Stores last 20 messages per user
    userInfo: new Map()  // Stores user information
};

// Load user group data
function loadUserGroupData() {
    try {
        if (!fs.existsSync(USER_GROUP_DATA)) {
            const defaultData = { groups: [], chatbot: {} };
            fs.writeFileSync(USER_GROUP_DATA, JSON.stringify(defaultData, null, 2));
            return defaultData;
        }
        return JSON.parse(fs.readFileSync(USER_GROUP_DATA, 'utf8'));
    } catch (error) {
        console.error('❌ Error loading user group data:', error.message);
        return { groups: [], chatbot: {} };
    }
}

// Save user group data
function saveUserGroupData(data) {
    try {
        fs.writeFileSync(USER_GROUP_DATA, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('❌ Error saving user group data:', error.message);
    }
}

// Add random delay between 1-4 seconds (more natural)
function getRandomDelay() {
    return Math.floor(Math.random() * 3000) + 1000;
}

// Add typing indicator
async function showTyping(sock, chatId) {
    try {
        await sock.presenceSubscribe(chatId);
        await sock.sendPresenceUpdate('composing', chatId);
        await new Promise(resolve => setTimeout(resolve, getRandomDelay()));
    } catch (error) {
        console.error('Typing indicator error:', error);
    }
}

// Stop typing indicator
async function stopTyping(sock, chatId) {
    try {
        await sock.sendPresenceUpdate('paused', chatId);
    } catch (error) {
        console.error('Stop typing error:', error);
    }
}

// Extract user information from messages (improved)
function extractUserInfo(message, senderId) {
    const info = chatMemory.userInfo.get(senderId) || {};
    const lowerMessage = message.toLowerCase();
    
    // Extract name
    if (lowerMessage.includes('my name is')) {
        const namePart = message.split(/my name is/i)[1].trim();
        info.name = namePart.split(/[,\s.!?]/)[0];
    }
    
    // Extract age
    const ageMatch = message.match(/(?:i am|i'm) (\d+)(?:\s*years? old)?/i);
    if (ageMatch) {
        info.age = ageMatch[1];
    }
    
    // Extract location
    const locationMatch = message.match(/(?:i (?:live in|am from) )(.+?)(?:[,.!?]|$)/i);
    if (locationMatch) {
        info.location = locationMatch[1].trim();
    }
    
    return info;
}

async function handleChatbotCommand(sock, chatId, message, match) {
    if (!match) {
        await showTyping(sock, chatId);
        await stopTyping(sock, chatId);
        return sock.sendMessage(chatId, {
            text: `🤖 *CHATBOT SETUP*\n\n*.chatbot on* - Enable chatbot in this group\n*.chatbot off* - Disable chatbot in this group\n*.chatbot status* - Check chatbot status`,
            quoted: message
        });
    }

    const data = loadUserGroupData();
    const sender = message.key.participant || message.key.remoteJid;
    const isGroup = chatId.endsWith('@g.us');
    
    // For private chats, only bot owner can control
    if (!isGroup) {
        // Check if sender is bot owner (you need to define bot owner in your config)
        const botOwner = process.env.BOT_OWNER || 'YOUR_NUMBER@s.whatsapp.net';
        if (sender !== botOwner) {
            await sock.sendMessage(chatId, {
                text: '❌ Only the bot owner can control chatbot in private chat.',
                quoted: message
            });
            return;
        }
        
        if (match === 'on') {
            data.chatbot[chatId] = true;
            saveUserGroupData(data);
            await sock.sendMessage(chatId, { 
                text: '✅ Chatbot enabled for this chat',
                quoted: message
            });
        } else if (match === 'off') {
            delete data.chatbot[chatId];
            saveUserGroupData(data);
            await sock.sendMessage(chatId, { 
                text: '✅ Chatbot disabled for this chat',
                quoted: message
            });
        } else if (match === 'status') {
            const status = data.chatbot[chatId] ? 'enabled' : 'disabled';
            await sock.sendMessage(chatId, {
                text: `Chatbot status: ${status}`,
                quoted: message
            });
        }
        return;
    }

    // For groups, check admin status
    let isAdmin = false;
    try {
        const groupMetadata = await sock.groupMetadata(chatId);
        const participant = groupMetadata.participants.find(p => p.id === sender);
        isAdmin = participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
    } catch (e) {
        console.warn('⚠️ Could not fetch group metadata:', e.message);
    }

    if (!isAdmin) {
        await sock.sendMessage(chatId, {
            text: '❌ Only group admins can use this command.',
            quoted: message
        });
        return;
    }

    if (match === 'on') {
        if (data.chatbot[chatId]) {
            await sock.sendMessage(chatId, { 
                text: '🤖 Chatbot is already enabled in this group',
                quoted: message
            });
        } else {
            data.chatbot[chatId] = true;
            saveUserGroupData(data);
            await sock.sendMessage(chatId, { 
                text: '✅ Chatbot has been enabled for this group',
                quoted: message
            });
        }
    } else if (match === 'off') {
        if (!data.chatbot[chatId]) {
            await sock.sendMessage(chatId, { 
                text: '🤖 Chatbot is already disabled in this group',
                quoted: message
            });
        } else {
            delete data.chatbot[chatId];
            saveUserGroupData(data);
            await sock.sendMessage(chatId, { 
                text: '✅ Chatbot has been disabled for this group',
                quoted: message
            });
        }
    } else if (match === 'status') {
        const status = data.chatbot[chatId] ? 'enabled' : 'disabled';
        await sock.sendMessage(chatId, {
            text: `🤖 Chatbot status: ${status}`,
            quoted: message
        });
    } else {
        await sock.sendMessage(chatId, {
            text: '❌ Invalid command. Use: .chatbot [on/off/status]',
            quoted: message
        });
    }
}

async function handleChatbotResponse(sock, chatId, message, userMessage, senderId) {
    const data = loadUserGroupData();
    if (!data.chatbot[chatId]) return;

    try {
        // Get bot's number
        const botNumber = sock.user.id.split(':')[0];
        
        // Check if message is for bot
        const isMentioned = userMessage.includes(`@${botNumber}`);
        const isReply = message.message?.extendedTextMessage?.contextInfo?.participant;
        const isDirectMessage = !chatId.endsWith('@g.us'); // Private chat
        
        // If not mentioned, not a reply to bot, and not in private chat, ignore
        if (!isDirectMessage && !isMentioned && !isReply) {
            return;
        }
        
        // Clean the message
        let cleanedMessage = userMessage;
        if (isMentioned) {
            cleanedMessage = cleanedMessage.replace(new RegExp(`@${botNumber}`, 'g'), '').trim();
        }
        
        // Remove command prefix if present
        cleanedMessage = cleanedMessage.replace(/^[\.!\/]/, '').trim();
        
        // If message is empty after cleaning, return
        if (!cleanedMessage) return;

        // Initialize user's chat memory if not exists
        if (!chatMemory.messages.has(senderId)) {
            chatMemory.messages.set(senderId, []);
            chatMemory.userInfo.set(senderId, {});
        }

        // Extract and update user information
        const userInfo = extractUserInfo(cleanedMessage, senderId);
        if (Object.keys(userInfo).length > 0) {
            chatMemory.userInfo.set(senderId, {
                ...chatMemory.userInfo.get(senderId),
                ...userInfo
            });
        }

        // Add message to history (keep last 10 messages)
        const messages = chatMemory.messages.get(senderId);
        messages.push({ role: 'user', content: cleanedMessage });
        if (messages.length > 10) {
            messages.shift();
        }
        chatMemory.messages.set(senderId, messages);

        // Show typing indicator
        await showTyping(sock, chatId);

        // Get AI response with context
        const response = await getAIResponse(cleanedMessage, {
            messages: chatMemory.messages.get(senderId),
            userInfo: chatMemory.userInfo.get(senderId),
            chatType: isDirectMessage ? 'private' : 'group'
        });

        if (!response) {
            await stopTyping(sock, chatId);
            await sock.sendMessage(chatId, { 
                text: "Hmm, let me think about that... 🤔\nI'm having trouble processing your request right now.",
                quoted: message
            });
            return;
        }

        // Add human-like delay
        await new Promise(resolve => setTimeout(resolve, getRandomDelay()));
        await stopTyping(sock, chatId);

        // Send response
        await sock.sendMessage(chatId, {
            text: response,
            mentions: isMentioned ? [senderId] : []
        }, {
            quoted: message
        });

        // Add bot's response to memory
        const botMessages = chatMemory.messages.get(senderId);
        botMessages.push({ role: 'assistant', content: response });
        if (botMessages.length > 10) {
            botMessages.shift();
        }

    } catch (error) {
        console.error('❌ Error in chatbot response:', error);
        await stopTyping(sock, chatId);
        
        // Don't send error messages for session errors
        if (error.message && error.message.includes('session')) {
            console.error('Session error - skipping response');
            return;
        }

        try {
            await sock.sendMessage(chatId, { 
                text: "Oops! 😅 I got a bit confused there. Could you try asking that again?",
                quoted: message
            });
        } catch (sendError) {
            console.error('Failed to send chatbot error message:', sendError.message);
        }
    }
}

async function getAIResponse(userMessage, context) {
    try {
        // Format conversation history
        let conversationHistory = '';
        if (context.messages && context.messages.length > 0) {
            conversationHistory = context.messages.map(msg => {
                const role = msg.role === 'user' ? 'User' : 'You';
                return `${role}: ${msg.content}`;
            }).join('\n');
        }

        // Format user info
        let userInfoStr = '';
        if (context.userInfo) {
            const info = context.userInfo;
            userInfoStr = `User info:\n${info.name ? `Name: ${info.name}\n` : ''}${info.age ? `Age: ${info.age}\n` : ''}${info.location ? `Location: ${info.location}\n` : ''}`.trim();
        }

        const prompt = `You are ALASTOR-XD, a human chatting on WhatsApp. Be casual, use Hinglish naturally, and keep responses short (1-2 lines).

${userInfoStr ? userInfoStr + '\n\n' : ''}
Recent conversation:
${conversationHistory}

User: ${userMessage}

ALASTOR-XD:`;

        const response = await fetch("https://zellapi.autos/ai/chatbot?text=" + encodeURIComponent(prompt));
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data || !data.result) {
            throw new Error("Invalid API response");
        }

        // Clean response
        let cleanedResponse = data.result.trim();
        
        // Remove any remaining prompt text
        cleanedResponse = cleanedResponse
            .replace(/^(ALASTOR-XD|Bot|AI|Assistant):\s*/i, '')
            .replace(/^.*?(?:said|replied|responded):\s*/i, '')
            .trim();
            
        // If response is empty or too long, return default
        if (!cleanedResponse || cleanedResponse.length > 500) {
            return "Hmm, interesting! 😊";
        }
        
        return cleanedResponse;

    } catch (error) {
        console.error("AI API error:", error.message);
        return null;
    }
}

// Clear chat memory periodically (optional, to prevent memory buildup)
function clearOldChatMemory() {
    setInterval(() => {
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        
        // This is a basic implementation - you might want to add timestamps to messages
        for (const [userId] of chatMemory.messages) {
            // Simple: clear memory if user hasn't interacted in a while
            // In production, you'd want to track last interaction time
            if (Math.random() < 0.1) { // 10% chance to clear old entries
                chatMemory.messages.delete(userId);
                chatMemory.userInfo.delete(userId);
            }
        }
    }, 30 * 60 * 1000); // Every 30 minutes
}

// Start memory cleanup
clearOldChatMemory();

module.exports = {
    handleChatbotCommand,
    handleChatbotResponse,
    loadUserGroupData,
    saveUserGroupData
};