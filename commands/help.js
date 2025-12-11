const settings = require('../settings');
const fs = require('fs');
const path = require('path');

async function helpCommand(sock, chatId, message) {
    const helpMessage = `
━━━━━━━━━━━━━━━━━┈⊷
┃✮│➣ *🌹 ${settings.botName || 'TUNZY-MD'}*  
┃✮│➣ Version: *${settings.version || '1.0.0'}*
➣ by ${settings.botOwner || 'TUNZY x CODEBREAKER'}
➣ YT : ${global.ytch}
━━━━━━━━━━━━━━━━━┈⊷

╭━━〔𝙶𝙴𝙽𝙴𝚁𝙰𝙻 𝙼𝙴𝙽𝚄 〕━┈⊷
┃➣ .help / .menu
┃➣ .ping
┃➣ .alive
┃➣ .tts <text>
┃➣ .owner
┃➣ .joke
┃➣ .quote
┃➣ .fact
┃➣ .news
┃➣ .attp <text>
┃➣ .weather <city>
┃➣ .lyrics <song title>
┃➣ .8ball <question>
┃➣ .groupinfo
┃➣ .staff / .admins
┃➣ .vv
┃➣ .trt <text> <lang>
┃➣ .ss <link>
┃➣ .jid
┃➣ .url
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━━〔𝙰𝙳𝙼𝙸𝙽 𝙼𝙴𝙽𝚄 〕━━┈⊷
┃➣ .ban 
┃➣ .promote
┃➣ .demote
┃➣ .mute
┃➣ .unmute
┃➣ .del
┃➣ .kick
┃➣ .warnings
┃➣ .warn
┃➣ .antilink
┃➣ .antibadword
┃➣ .clear
┃➣ .tag
┃➣ .tagall
┃➣ .tagnotadmin
┃➣ .hidetag
┃➣ .chatbot
┃➣ .resetlink
┃➣ .antitag
┃➣ .welcome 
┃➣ .goodbye
┃➣ .setgdesc <description>
┃➣ .setgname <new name>
┃➣ .setgpp
┃➣ .accept all
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━━〔𝙾𝚆𝙽𝙴𝚁 𝙼𝙴𝙽𝚄 〕━━┈⊷
┃➣ .mode (public/self>
┃➣ .clearsession
┃➣ .antidelete
┃➣ .cleartmp
┃➣ .update
┃➣ .settings
┃➣ .setpp <reply to image>
┃➣ .autoreact
┃➣ .autostatus
┃➣ .autostatus react
┃➣ .autoread
┃➣ .autotyping
┃➣ .anticall
┃➣ .pmblocker
┃➣ .pmblocker setmsg
┃➣ .setmention <reply 2 msg>
┃➣ .mention
╰━━━━━━━━━━━━━━━━━┈⊷

╭━〔IMG/STICKER MENU〕━⊷
┃➣ .blur <reply to image>
┃➣ .simage <reply to sticker>
┃➣ .removebg
┃➣ .sticker
┃➣ .tgsticker
┃➣ .crop
┃➣ .meme
┃➣ .take 
┃➣ .emojimix
┃➣ .igs <insta link>
┃➣ .igsc <insta link>
┃➣ .hd<reply to image>
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━━〔PIES MENU 〕━━┈⊷
┃➣ .pies <country>
┃➣ .japan
┃➣ .korean
┃➣ .indonesia
┃➣ .china
┃➣ .hijab
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━━〔 GAME MENU 〕━━┈⊷
┃➣ .tictactoe @user
┃➣ .hangman
┃➣ .guess <letter>
┃➣ .trivia
┃➣ .answer <answer>
┃➣ .truth
┃➣ .dare
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━━〔 AI MENU 〕━━┈⊷ 
┃➣ .gpt <question>
┃➣ .gemini <question>
┃➣ .imagine <question>
┃➣ .flux <question>
┃➣ .sora <question>
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━━〔 GIT MENU 〕━━┈⊷
┃➣ .git
┃➣ .github
┃➣ .sc
┃➣ .script
┃➣ .repo
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━━〔 AI MENU〕━━┈⊷
┃➣ .nom
┃➣ .poke
┃➣ .cry
┃➣ .kiss
┃➣ .pat
┃➣ .hug
┃➣ .wink
┃➣ .facepalm
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━━〔 MISC MENU 〕
┃➣ .heart
┃➣ .horny
┃➣ .lgbt
┃➣ .circle
┃➣ .lolice
┃➣ .its-so-stupid
┃➣ .namecard
┃➣ .oogway
┃➣ .tweet
┃➣ .ytcomment
┃➣ .comrade 
┃➣ .gay
┃➣ .glass
┃➣ .jail
┃➣ .passed
┃➣ .triggered 
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━━〔 FUN MENU 〕━━┈⊷
┃➣ .compliment @user
┃➣ .insult @user
┃➣ .flirt
┃➣ .shayari
┃➣ .goodnight
┃➣ .roseday
┃➣ .character @user
┃➣ .wasted @user
┃➣ .ship @user
┃➣ .simp @user
┃➣ .stupid @user [txt] 
╰━━━━━━━━━━━━━━━━━┈⊷

╭━〔 TXT MAKER MENU〕━┈⊷
┃➣ .metalic <txt>
┃➣ .ice <txt>
┃➣ .snow <txt
┃➣ .impressive 
┃➣ .matrix <txt>
┃➣ .light <txt>
┃➣ .neon <txt>
┃➣ .devil <txt>
┃➣ .purple <txt>
┃➣ .thunder <txt>
┃➣ .hacker <txt>
┃➣ .sand <txt>
┃➣ .leaves <txt>
┃➣ .1917 <txt>
┃➣ .arena <txt>
┃➣ .blackpink <txt>
┃➣ .glitch <txt>
┃➣ .fire <txt>
╰━━━━━━━━━━━━━━━━┈⊷

╭━━〔 DOWNLOAD MENU 〕━━┈⊷
┃➣ .song <song name>
┃➣ .play <song name>
┃➣ .spotify <song name> 
┃➣ .instagram <link>
┃➣ .facebook <link>
┃➣ .tiktok <link>
┃➣ .video <song
╰━━━━━━━━━━━━━━━━━┈⊷
╭━━━━〔 𝚄𝙿𝙳𝙰𝚃𝙴𝚂 〕━━━┈⊷
➣ Join Channel 👇👇
━━━━━━━━━━━━━━━━━┈⊷`;

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
                        newsletterJid: '120363418965183791@newsletter',
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
                        newsletterJid: '120363418965183791@newsletter',
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