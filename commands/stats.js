// commands/stats.js
const os = require('os');

function formatUptime(uptimeSeconds) {
    const days = Math.floor(uptimeSeconds / 86400);
    const hours = Math.floor((uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);
    
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

async function statsCommand(sock, chatId, message) {
    try {
        const uptime = process.uptime();
        const memoryUsed = (process.memoryUsage().rss / 1024 / 1024).toFixed(0);
        
        const statsMessage = `╭──━──━──━──━──━──╮
│   📊 BOT STATS   │
╰──━──━──━──━──━──╯

📌 *Platform*
└─ ${os.type()} ${os.release()}

⏱️ *Uptime*
└─ ${formatUptime(uptime)}

💾 *Memory Usage*
└─ ${memoryUsed} MB

⚙️ *Node Version*
└─ ${process.version}`;

        await sock.sendMessage(chatId, { text: statsMessage }, { quoted: message });
        
    } catch (error) {
        console.error('Error in stats command:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to get bot statistics.' });
    }
}

module.exports = statsCommand;