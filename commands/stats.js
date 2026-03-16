// commands/stats.js
const os = require('os');
const fs = require('fs');
const path = require('path');

// File to store stats
const STATS_FILE = path.join(__dirname, '../bot_stats.json');

// Initialize stats file
function initStatsFile() {
    if (!fs.existsSync(STATS_FILE)) {
        const initialStats = {
            messages: 0,
            commands: 0,
            startTime: Date.now()
        };
        fs.writeFileSync(STATS_FILE, JSON.stringify(initialStats, null, 2));
    }
}

// Get current stats
function getStats() {
    initStatsFile();
    return JSON.parse(fs.readFileSync(STATS_FILE));
}

// Save stats
function saveStats(stats) {
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
}

// Update message count
function updateMessageCount() {
    const stats = getStats();
    stats.messages += 1;
    saveStats(stats);
}

// Update command count
function updateCommandCount() {
    const stats = getStats();
    stats.commands += 1;
    saveStats(stats);
}

// Format number to K format (e.g., 4400 -> 4.4K)
function formatNumber(num) {
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Get current time in HH:MM AM/PM format
function getCurrentTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 12-hour format
    return `${hours}:${minutes} ${ampm}`;
}

// Main stats command function
async function statsCommand(sock, chatId, message) {
    try {
        // Update command count when stats command is run
        updateCommandCount();
        
        const stats = getStats();
        const memoryUsed = (process.memoryUsage().rss / 1024 / 1024).toFixed(0);
        const cpuUsage = (os.loadavg()[0] * 100).toFixed(0);
        
        // Format exactly like your image
        const statsMessage = `TUNZY-MD2 Stats

Msgs Count  
${formatNumber(stats.messages)}  

Cmds Runned  
${stats.commands}  

Memory Usage (MB)  
${memoryUsed}  

CPU (%)  
${cpuUsage}  

${getCurrentTime()}`;

        await sock.sendMessage(chatId, { text: statsMessage }, { quoted: message });
        
    } catch (error) {
        console.error('Error in stats command:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to get bot statistics.' });
    }
}

// Auto-initialize when file is loaded
initStatsFile();

// Export everything
module.exports = { 
    statsCommand,
    updateMessageCount,
    updateCommandCount,
    getStats,
    formatNumber,
    getCurrentTime
};