const settings = require('../settings');
const fs = require('fs');
const path = require('path');

async function helpCommand(sock, chatId, message) {
    const helpMessage = `
━━━━━━━━━━━━━━━━━┈⊷
|✦ ${settings.botName || 'TUNZY-MD '}*  
|✦ Version: *${settings.version || '1.0.0'}*
|✦ by ${settings.botOwner || 'TUNZY'}
|✦ YouTube : ${global.ytch}
━━━━━━━━━━━━━━━━━┈⊷ 
╭━━〔 📌 CORE COMMANDS 〕━━┈⊷
│  ✪ .menu / .help
│  ✪ .ping
│  ✪ .alive
│  ✪ .owner
│  ✪ .jid
│  ✪ .url
│  ✪ .tts <text>
│  ✪ .joke
│  ✪ .quote
│  ✪ .fact
│  ✪ .news
│  ✪ .weather <city>
│  ✪ .lyrics <song>
│  ✪ .8ball <question>
│  ✪ .groupinfo
│  ✪ .admins / .staff
│  ✪ .vv
│  ✪ .trt <text> <lang>
│  ✪ .ss <link>
│  ✪ .attp <text>
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 🛡️ GROUP ADMINISTRATION 〕━━┈⊷
│  ✪ .ban
│  ✪ .kick
│  ✪ .mute / .unmute
│  ✪ .promote / .demote
│  ✪ .del
│  ✪ .warn
│  ✪ .warnings
│  ✪ .clear
│  ✪ .tag
│  ✪ .tagall
│  ✪ .tagnotadmin
│  ✪ .hidetag
│  ✪ .antilink
│  ✪ .antibadword
│  ✪ .antitag
│  ✪ .chatbot
│  ✪ .welcome
│  ✪ .goodbye
│  ✪ .resetlink
│  ✪ .setgname <name>
│  ✪ .setgdesc <desc>
│  ✪ .setgpp
│  ✪ .accept all
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 👑 OWNER CONTROL PANEL 〕━━┈⊷
│  ✪ .mode <public/self>
│  ✪ .update
│  ✪ .settings
│  ✪ .clearsession
│  ✪ .cleartmp
│  ✪ .antidelete
│  ✪ .anticall
│  ✪ .setpp <reply image>
│  ✪ .setmention <reply msg>
│  ✪ .mention
│  ✪ .autoread
│  ✪ .autoreact
│  ✪ .autotyping
│  ✪ .autostatus
│  ✪ .autostatus react
│  ✪ .pmblocker
│  ✪ .pmblocker setmsg
│  ✪ .save
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 🖼️ MEDIA & STICKERS 〕━━┈⊷
│  ✪ .sticker
│  ✪ .tgsticker
│  ✪ .simage <reply sticker>
│  ✪ .blur <reply image>
│  ✪ .crop
│  ✪ .removebg
│  ✪ .meme
│  ✪ .take
│  ✪ .emojimix
│  ✪ .igs <insta link>
│  ✪ .igsc <insta link>
│  ✪ .hd <reply image>
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 🌍 IMAGE SEARCH (PIES) 〕━━┈⊷
│  ✪ .pies <country>
│  ✪ .japan
│  ✪ .korean
│  ✪ .indonesia
│  ✪ .china
│  ✪ .hijab
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 🎮 GAMES & ENTERTAINMENT 〕━━┈⊷
│  ✪ .tictactoe @user
│  ✪ .hangman
│  ✪ .guess <letter>
│  ✪ .trivia
│  ✪ .answer <answer>
│  ✪ .truth
│  ✪ .dare
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 🤖 AI INTELLIGENCE HUB 〕━━┈⊷
│  ✪ .gpt <question>
│  ✪ .gemini <question>
│  ✪ .imagine <prompt>
│  ✪ .flux <prompt>
│  ✪ .sora <prompt>
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 💻 SOURCE & REPOSITORY 〕━━┈⊷
│  ✪ .git
│  ✪ .github
│  ✪ .repo
│  ✪ .sc
│  ✪ .script
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 🎭 REACTIONS & EMOTES 〕━━┈⊷
│  ✪ .nom
│  ✪ .poke
│  ✪ .cry
│  ✪ .kiss
│  ✪ .pat
│  ✪ .hug
│  ✪ .wink
│  ✪ .facepalm
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 🎨 EFFECTS & GENERATORS 〕━━┈⊷
│  ✪ .heart
│  ✪ .horny
│  ✪ .lgbt
│  ✪ .circle
│  ✪ .lolice
│  ✪ .its-so-stupid
│  ✪ .namecard
│  ✪ .oogway
│  ✪ .tweet
│  ✪ .ytcomment
│  ✪ .comrade
│  ✪ .gay
│  ✪ .glass
│  ✪ .jail
│  ✪ .passed
│  ✪ .triggered
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 😄 FUN & SOCIAL 〕━━┈⊷
│  ✪ .compliment @user
│  ✪ .insult @user
│  ✪ .flirt
│  ✪ .shayari
│  ✪ .goodnight
│  ✪ .roseday
│  ✪ .character @user
│  ✪ .wasted @user
│  ✪ .ship @user
│  ✪ .simp @user
│  ✪ .stupid @user <text>
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 ✍️ TEXT DESIGNER 〕━━┈⊷
│  ✪ .metalic
│  ✪ .ice
│  ✪ .snow
│  ✪ .impressive
│  ✪ .matrix
│  ✪ .light
│  ✪ .neon
│  ✪ .devil
│  ✪ .purple
│  ✪ .thunder
│  ✪ .hacker
│  ✪ .sand
│  ✪ .leaves
│  ✪ .1917
│  ✪ .arena
│  ✪ .blackpink
│  ✪ .glitch
│  ✪ .fire
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 ⬇️ MEDIA DOWNLOADS 〕━━┈⊷
│  ✪ .song <name>
│  ✪ .play <name>
│  ✪ .spotify <name>
│  ✪ .video <name>
│  ✪ .instagram <link>
│  ✪ .facebook <link>
│  ✪ .tiktok <link>
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 🔔 SYSTEM UPDATES 〕━━┈⊷
│  ✪ Join Official Channel 👇👇
╰━━━━━━━━━━━━━━━━━┈⊷`;

    try {
        const imagePath = path.join(__dirname, '../assets/bot_image.jpg');
        
        if (fs.existsSync(imagePath)) {
            const imageBuffer = fs.readFileSync(imagePath);
            
            await sock.sendMessage(chatId, {
                image: imageBuffer,
                caption: helpMessage,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363422591784062@newsletter',
                        newsletterName: 'TUNZY-MD',
                        serverMessageId: -1
                    }
                }
            },{ quoted: message });
        } else {
            console.error('Bot image not found at:', imagePath);
            await sock.sendMessage(chatId, { 
                text: helpMessage,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363422591784062@newsletter',
                        newsletterName: 'TUNZY-MD by CODEBREAKER x TUNZY',
                        serverMessageId: -1
                    } 
                }
            });
        }
    } catch (error) {
        console.error('Error in help command:', error);
        await sock.sendMessage(chatId, { text: helpMessage });
    }
}

module.exports = helpCommand;