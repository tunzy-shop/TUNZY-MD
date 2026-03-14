// commands/stats.js
const os = require('os');
const { performance } = require('perf_hooks');

async function statsCommand(sock, chatId, message) {
    try {
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor((uptime % 86400) / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        
        const memoryUsed = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);
        const totalMemory = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
        const freeMemory = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
        
        const stats = `✪ \`\`\`BOT STATISTICS\`\`\`

📊 *System Info*
• OS: ${os.type()} ${os.release()}
• Platform: ${os.platform()}
• CPU: ${os.cpus()[0].model}
• Cores: ${os.cpus().length}

💾 *Memory Usage*
• Used: ${memoryUsed} MB
• Free: ${freeMemory} GB / ${totalMemory} GB
• RAM: ${((memoryUsed / (totalMemory * 1024)) * 100).toFixed(1)}%

⏱️ *Uptime*
• ${days}d ${hours}h ${minutes}m ${seconds}s

🤖 *Bot Info*
• Node: ${process.version}
• Version: 1.0.0`;

        await sock.sendMessage(chatId, { text: stats }, { quoted: message });
    } catch (error) {
        console.error('Error in stats command:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to get bot statistics.' });
    }
}

module.exports = statsCommand;