// commands/uptime.js

function formatTime(seconds) {
    const days = Math.floor(seconds / (24 * 60 * 60));
    seconds = seconds % (24 * 60 * 60);
    const hours = Math.floor(seconds / (60 * 60));
    seconds = seconds % (60 * 60);
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);

    let time = '';
    if (days > 0) time += `${days}d `;
    if (hours > 0) time += `${hours}h `;
    if (minutes > 0) time += `${minutes}m `;
    if (seconds > 0 || time === '') time += `${seconds}s`;

    return time.trim();
}

async function uptimeCommand(sock, chatId, message) {
    try {
        const uptimeInSeconds = process.uptime();
        const uptimeFormatted = formatTime(uptimeInSeconds);
        
        const response = `🤖 *Bot Uptime*\n\n📊 ${uptimeFormatted}`;
        
        await sock.sendMessage(chatId, { text: response }, { quoted: message });
    } catch (error) {
        console.error('Error in uptime command:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to get uptime.' });
    }
}

module.exports = uptimeCommand;