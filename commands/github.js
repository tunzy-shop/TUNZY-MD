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
    txt += `✩  *Name* : ${json.name}\n`;
    txt += `✩  *Watchers* : ${json.watchers_count}\n`;
    txt += `✩  *Size* : ${(json.size / 1024).toFixed(2)} MB\n`;
    txt += `✩  *Last Updated* : ${moment(json.updated_at).format('DD/MM/YY - HH:mm:ss')}\n`;
    txt += `✩  *URL* : ${json.html_url}\n`;
    txt += `✩  *Forks* : ${json.forks_count}\n`;
    txt += `✩  *Stars* : ${json.stargazers_count}\n\n`;
    txt += `*_TUNZY-MD_*`;

    // Try different possible paths for the image
    let imgPath;
    const possiblePaths = [
      path.join(__dirname, '../assets/repo_image.jpg'),
      path.join(__dirname, './assets/repo_image.jpg'),
      path.join(__dirname, 'assets/repo_image.jpg'),
      path.join(process.cwd(), 'assets/repo_image.jpg'),
      path.join(process.cwd(), 'repo_image.jpg')
    ];

    // Find the first existing path
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        imgPath = p;
        console.log(`Found image at: ${imgPath}`);
        break;
      }
    }

    if (!imgPath) {
      throw new Error('repo_image.jpg not found in any of the expected locations');
    }

    const imgBuffer = fs.readFileSync(imgPath);

    // Send the message
    await sock.sendMessage(chatId, { 
      image: imgBuffer, 
      caption: txt 
    }, { 
      quoted: message 
    });
    
  } catch (error) {
    console.error('Error in github command:', error);
    
    // Try to send without image if image loading fails
    try {
      const res = await fetch('https://api.github.com/repos/tunzy-shop/TUNZY-MD/fork');
      if (res.ok) {
        const json = await res.json();
        let txt = `*乂  TUNZY - MD 乂*\n\n`;
        txt += `✩  *Name* : ${json.name}\n`;
        txt += `✩  *Watchers* : ${json.watchers_count}\n`;
        txt += `✩  *Size* : ${(json.size / 1024).toFixed(2)} MB\n`;
        txt += `✩  *Last Updated* : ${moment(json.updated_at).format('DD/MM/YY - HH:mm:ss')}\n`;
        txt += `✩  *URL* : ${json.html_url}\n`;
        txt += `✩  *Forks* : ${json.forks_count}\n`;
        txt += `✩  *Stars* : ${json.stargazers_count}\n\n`;
        txt += `*_TUNZY-MD_*\n\n`;
        txt += `⚠️ *Note:* Could not load repo_image.jpg`;
        
        await sock.sendMessage(chatId, { text: txt }, { quoted: message });
      }
    } catch (fetchError) {
      await sock.sendMessage(chatId, { 
        text: `❌ Error: ${error.message || 'Failed to fetch repository information.'}` 
      }, { quoted: message });
    }
  }
}

module.exports = githubCommand;