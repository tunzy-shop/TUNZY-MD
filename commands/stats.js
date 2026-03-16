// commands/stats.js
const os = require('os');

async function statsCommand(sock, chatId, message) {
    try {
        // Get message count from database/storage (you need to implement this)
        const msgCount = 4400; // Example static value - replace with actual count from your DB
        const cmdRunned = 11; // Example static value - replace with actual count from your DB
        
        const memoryUsed = (process.memoryUsage().rss / 1024 / 1024).toFixed(0);
        const cpuUsage = (os.loadavg()[0] * 100).toFixed(0);

        const stats = ````TUNZY-MD``` Stats

*Msgs Count*
${msgCount}

*Cmds Runned*
${cmdRunned}

*Memory Usage (MB)*
${memoryUsed}

*CPU (%)*
${cpuUsage}

*System Info*
${os.type()} ${os.release()}, ${os.platform()}`;

        await sock.sendMessage(chatId, { text: stats }, { quoted: message });
    } catch (error) {
        console.error('Error in stats command:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to get bot statistics.' });
    }
}

module.exports = statsCommand;