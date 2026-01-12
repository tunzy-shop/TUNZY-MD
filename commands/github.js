const moment = require('moment-timezone');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

async function githubCommand(sock, chatId, message) {
  try {
    const res = await fetch('https://api.github.com/repos/tunzy-shop/TUNZY-MD');
    if (!res.ok) throw new Error('Error fetching repository data');
    const json = await res.json();

    let txt = `*乂  TUNZY - MD 乂*\n\n`;
    txt += `✪   *Name* : ${json.name}\n`;
    txt += `✪   *Watchers* : ${json.watchers_count}\n`;
    txt += `✪   *Size* : ${(json.size / 1024).toFixed(2)} MB\n`;
    txt += `✪   *Last Updated* : ${moment(json.updated_at).format('DD/MM/YY - HH:mm:ss')}\n`;
    txt += `✪   *URL* : ${json.html_url}\n`;
    txt += `✪   *Forks* : ${json.forks_count}\n`;
    txt += `✪   *Stars* : ${json.stargazers_count}\n\n`;
    txt += `*_TUNZY-MD_*`;

    // Use the repo_image.jpg file
    const imgPath = path.join(__dirname, '../assets/repo_image.jpg');
    
    // Check if file exists
    if (!fs.existsSync(imgPath)) {
      throw new Error('repo_image.jpg not found');
    }
    
    const imgBuffer = fs.readFileSync(imgPath);

    // Send image with HD quality by setting ptt: false and proper image properties
    await sock.sendMessage(chatId, { 
      image: imgBuffer, 
      caption: txt,
      // Optional: You can add more options for better quality
      // jpegThumbnail: imgBuffer, // Thumbnail if needed
      // mimetype: 'image/jpeg',
      // caption: txt,
      // fileName: 'repo_image.jpg',
      // ptt: false // Important: false for non-voice messages
    }, { 
      quoted: message,
      // Additional media upload options for quality
      upload: {
        // You can try adding upload options if your library supports it
        // mediaUploadTimeoutMs: 60000
      }
    });
  } catch (error) {
    console.error('Error in github command:', error);
    await sock.sendMessage(chatId, { 
      text: `❌ Error: ${error.message || 'Failed to fetch repository information.'}` 
    }, { quoted: message });
  }
}

module.exports = githubCommand;