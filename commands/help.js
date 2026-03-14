const settings = require('../settings');
const fs = require('fs');
const path = require('path');

async function helpCommandEdited(sock, chatId, message) {
    // Get user info
    const sender = message.key.participant || message.key.remoteJid;
    
    // Try to get pushname (contact name)
    let userName = 'User';
    if (message.pushName) {
        userName = message.pushName;
    } else {
        try {
            // Try to fetch contact info
            const contact = await sock.getContact(sender);
            if (contact && contact.name) {
                userName = contact.name;
            } else if (contact && contact.notify) {
                userName = contact.notify;
            }
        } catch (e) {
            // Fallback to a friendly name
            userName = 'Dear User';
        }
    }
    
    // Hidden "read more" to collapse WhatsApp message
    const readMore = String.fromCharCode(8206).repeat(4000);

    // Prepare caption
    const caption = `
╭══〘 *TUNZY-MD* 〙══⊷
┃ *OH Hayoo :* ${userName}
┃ *Version :* 1.0.0
┃ *Owner :* TUNZY SHOP
┃ *YouTube :* Tunzy Shop
╰═══════════════════════⊷
${readMore}

╭━━━━━━❮ *CORE* ❯━⊷
┃✪ .menu / .help
┃✪ .ping
┃✪ .uptime
┃✪ .alive
┃✪ .owner
┃✪ .jid
┃✪ .url
┃✪ .tts
┃✪ .joke
┃✪ .quote
┃✪ .fact
┃✪ .news
┃✪ .weather
┃✪ .lyrics
┃✪ .8ball
┃✪ .groupinfo
┃✪ .admins / .staff
┃✪ .vv
┃✪ .trt
┃✪ .ss
┃✪ .attp
╰━━━━━━━━━━━━━━━━━━━━⊷

╭━━━━❮ *GROUP ADMIN* ❯━⊷
┃✪ .ban
┃✪ .kick
┃✪ .mute / .unmute
┃✪ .promote / .demote
┃✪ .del
┃✪ .warn
┃✪ .warnings
┃✪ .clear
┃✪ .tag
┃✪ .tagall
┃✪ .tagnotadmin
┃✪ .hidetag
┃✪ .antilink
┃✪ .antibadword
┃✪ .antitag
┃✪ .chatbot
┃✪ .welcome
┃✪ .goodbye
┃✪ .resetlink
┃✪ .setgname
┃✪ .setgdesc
┃✪ .setgpp
┃✪ .accept all
╰━━━━━━━━━━━━━━━━━━━━⊷

╭━━━━❮ *OWNER CONTROL* ❯━⊷
┃✪ .mode
┃✪ .update
┃✪ .settings
┃✪ .clearsession
┃✪ .cleartmp
┃✪ .antidelete
┃✪ .anticall
┃✪ .setpp
┃✪ .setmention
┃✪ .mention
┃✪ .autoread
┃✪ .autoreact
┃✪ .autotyping
┃✪ .autostatus
┃✪ .autostatus react
┃✪ .pmblocker
┃✪ .pmblocker setmsg
┃✪ .savestatus
╰━━━━━━━━━━━━━━━━━━━━⊷

╭━━━━❮ *MEDIA/STICKERS* ❯━⊷
┃✪ .sticker
┃✪ .tgsticker
┃✪ .simage
┃✪ .blur
┃✪ .crop
┃✪ .removebg
┃✪ .meme
┃✪ .take
┃✪ .emojimix
┃✪ .igs
┃✪ .igsc
┃✪ .hd
╰━━━━━━━━━━━━━━━━━━━━⊷

╭━━━━❮ *IMAGE SEARCH* ❯━⊷
┃✪ .pies
┃✪ .japan
┃✪ .korean
┃✪ .indonesia
┃✪ .china
┃✪ .hijab
╰━━━━━━━━━━━━━━━━━━━━⊷

╭━━━━❮ *GAMES* ❯━⊷
┃✪ .tictactoe
┃✪ .hangman
┃✪ .guess
┃✪ .trivia
┃✪ .answer
┃✪ .truth
┃✪ .dare
╰━━━━━━━━━━━━━━━━━━━━⊷

╭━━━━❮ *AI INTELLIGENCE* ❯━⊷
┃✪ .gpt
┃✪ .gemini
┃✪ .imagine
┃✪ .flux
┃✪ .sora
╰━━━━━━━━━━━━━━━━━━━━⊷

╭━━━━❮ *SOURCES/REPO* ❯━⊷
┃✪ .git
┃✪ .github
┃✪ .repo
┃✪ .sc
┃✪ .script
╰━━━━━━━━━━━━━━━━━━━━⊷

╭━━━━❮ *REACTION* ❯━⊷
┃✪ .nom
┃✪ .poke
┃✪ .cry
┃✪ .kiss
┃✪ .pat
┃✪ .hug
┃✪ .wink
┃✪ .facepalm
╰━━━━━━━━━━━━━━━━━━━━⊷

╭━━━━❮ *EFFECTS* ❯━⊷
┃✪ .heart
┃✪ .horny
┃✪ .lgbt
┃✪ .circle
┃✪ .lolice
┃✪ .its-so-stupid
┃✪ .namecard
┃✪ .oogway
┃✪ .tweet
┃✪ .ytcomment
┃✪ .comrade
┃✪ .gay
┃✪ .glass
┃✪ .jail
┃✪ .passed
┃✪ .triggered
╰━━━━━━━━━━━━━━━━━━━━⊷

╭━━━━❮ *FUN/SOCIAL* ❯━⊷
┃✪ .compliment
┃✪ .insult
┃✪ .flirt
┃✪ .shayari
┃✪ .goodnight
┃✪ .roseday
┃✪ .character
┃✪ .wasted
┃✪ .ship
┃✪ .simp
┃✪ .stupid
╰━━━━━━━━━━━━━━━━━━━━⊷

╭━━━━❮ *TEXT DESIGN* ❯━⊷
┃✪ .metalic
┃✪ .ice
┃✪ .snow
┃✪ .impressive
┃✪ .matrix
┃✪ .light
┃✪ .neon
┃✪ .devil
┃✪ .purple
┃✪ .thunder
┃✪ .hacker
┃✪ .sand
┃✪ .leaves
┃✪ .1917
┃✪ .arena
┃✪ .blackpink
┃✪ .glitch
┃✪ .fire
╰━━━━━━━━━━━━━━━━━━━━⊷

╭━━━━❮ *MEDIA DOWNLOAD* ❯━⊷
┃✪ .song
┃✪ .play
┃✪ .spotify
┃✪ .video
┃✪ .instagram
┃✪ .facebook
┃✪ .tiktok
╰━━━━━━━━━━━━━━━━━━━━⊷

╭━━━━❮ *SYSTEM UPDATE* ❯━⊷
┃✪ Join Official Channel 👇
╰━━━━━━━━━━━━━━━━━━━━⊷

> *TUNZY-MD* © 2026
    `;

    // Check if bot_picture.jpg exists
    const imagePath = path.join(__dirname, '../assets/bot_picture.jpg');

    // Context info for forwarded appearance
    const contextInfo = {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363422591784062@newsletter',
            newsletterName: 'TUNZY-MD'
        }
        // No mentionedJid needed since we're not using @ mentions
    };

    try {
        // Send image with caption if exists - REPLIED to the original .menu message
        if (fs.existsSync(imagePath)) {
            // Send image with caption and reply to the original message
            await sock.sendMessage(chatId, {
                image: { url: imagePath },
                caption: caption.trim(),
                mimetype: 'image/jpeg',
                contextInfo: contextInfo
            }, {
                quoted: message  // This makes it a reply to the .menu command
            });
        } else {
            // Send only text if image doesn't exist - REPLIED to the original .menu message
            await sock.sendMessage(chatId, {
                text: caption,
                contextInfo: contextInfo
            }, {
                quoted: message  // This makes it a reply to the .menu command
            });
        }
    } catch (error) {
        console.error('Error sending menu:', error);
        // If image fails to send, try sending just the text - as a reply
        await sock.sendMessage(chatId, {
            text: `⚠️ Failed to load image\n\n${caption}`,
            contextInfo: contextInfo
        }, {
            quoted: message  // Reply to the .menu command even on error
        });
    }
}

module.exports = helpCommandEdited;