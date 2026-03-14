e
const moment = require('moment-timezone');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

async function githubCommand(sock, chatId, message) {
  try {
    // Try multiple possible repository names
    const possibleRepos = [
      'tunzy-shop/TUNZY-MD',
      'tunzy-shop/TUNZY-BOT',  // Try alternative name
      'tunzy-shop/tunzy-md',   // Try lowercase
      // Add any other possible repository names here
    ];

    let json = null;
    let repoUsed = '';

    for (const repo of possibleRepos) {
      try {
        const repoUrl = `https://api.github.com/repos/${repo}`;
        const res = await fetch(repoUrl);
        if (res.ok) {
          json = await res.json();
          repoUsed = repo;
          break;
        }
      } catch (e) {
        continue; // Try next repository
      }
    }

    // If no repository found, use hardcoded data but show zeros for forks/stars
    if (!json) {
      json = {
        name: 'TUNZY-MD',
        watchers_count: 0,
        size: 5120, // 5MB in KB
        updated_at: new Date().toISOString(),
        forks_count: 0,
        stargazers_count: 0
      };
    }

    let txt = `*乂  TUNZY - MD 乂*\n\n`;
    txt += `✪  *Name* : ${json.name}\n`;
    txt += `✪  *Watchers* : ${json.watchers_count || 0}\n`;
    txt += `✪  *Size* : ${((json.size || 5120) / 1024).toFixed(2)} MB\n`;
    txt += `✪  *Last Updated* : ${moment(json.updated_at || new Date()).format('DD/MM/YY - HH:mm:ss')}\n`;
    txt += `✪  *URL* : https://github.com/tunzy-shop/TUNZY-MD/fork\n`;
    txt += `✪  *Forks* : ${json.forks_count || 0}\n`;
    txt += `✪  *Stars* : ${json.stargazers_count || 0}\n\n`;
    txt += `*_TUNZY-MD_*`;

    // Find the image
    let imgPath;
    const possiblePaths = [
      path.join(__dirname, '../assets/repo_image.jpg'),
      path.join(__dirname, './assets/repo_image.jpg'),
      path.join(__dirname, 'assets/repo_image.jpg'),
      path.join(process.cwd(), 'assets/repo_image.jpg'),
      path.join(process.cwd(), 'repo_image.jpg')
    ];

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        imgPath = p;
        console.log(`Found image at: ${imgPath}`);
        break;
      }
    }

    if (imgPath) {
      const imgBuffer = fs.readFileSync(imgPath);
      await sock.sendMessage(chatId, { 
        image: imgBuffer, 
        caption: txt 
      }, { quoted: message });
    } else {
      // Send without image if not found
      await sock.sendMessage(chatId, { text: txt }, { quoted: message });
    }

  } catch (error) {
    console.error('Error in github command:', error);
    await sock.sendMessage(chatId, { 
      text: '❌ Failed to get repository information. Please check the repository name.' 
    }, { quoted: message });
  }
}

module.exports = githubCommand;