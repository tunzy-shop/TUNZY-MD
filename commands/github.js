const moment = require('moment-timezone');
const fs = require('fs');
const path = require('path');

async function githubCommand(sock, chatId, message) {
  try {
    // Simple text with the repo link
    let txt = `*TUNZY-MD REPO* \n\n`;
    txt += `\`\`\`Repo : https://github.com/tunzy-shop/TUNZY-MD/fork\`\`\`\n\n`;
    txt += `\`\`\`Kindly fork and star the repo\`\`\`\n\n`;
    txt += `> DEV : TUNZY SHOP ✪`;

    // Find the HD image
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
        console.log(`✅ Found repo image at: ${imgPath}`);
        break;
      }
    }

    // Send with image if found, otherwise just text
    if (imgPath) {
      const imgBuffer = fs.readFileSync(imgPath);
      await sock.sendMessage(chatId, { 
        image: imgBuffer, 
        caption: txt,
        mimetype: 'image/jpeg'
      }, { quoted: message });
    } else {
      // Send without image if not found
      await sock.sendMessage(chatId, { text: txt }, { quoted: message });
    }

  } catch (error) {
    console.error('Error in github command:', error);
    // Simple fallback without any API calls
    await sock.sendMessage(chatId, { 
      text: `*TUNZY-MD REPO* \n\n\`\`\`Repo : https://github.com/tunzy-shop/TUNZY-MD/fork\`\`\`\n\n\`\`\`Kindly fork and star the repo\`\`\`\n\n> DEV : TUNZY SHOP ✪`
    }, { quoted: message });
  }
}

module.exports = githubCommand;