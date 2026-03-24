const { checkAdmin, reply } = require('./_helper');

module.exports = async (sock, chatId, message) => {
    if (!chatId.endsWith('@g.us')) return reply(sock, chatId, '❌ Groups only.', message);
    if (!await checkAdmin(sock, chatId, message)) return reply(sock, chatId, '❌ Admins only.', message);

    const meta = await sock.groupMetadata(chatId);
    let vcf = '';

    meta.participants.forEach(p => {
        const num = p.id.split('@')[0];
        vcf += `BEGIN:VCARD\nVERSION:3.0\nFN:+${num}\nTEL;type=CELL;waid=${num}:+${num}\nEND:VCARD\n`;
    });

    await sock.sendMessage(chatId, {
        document: Buffer.from(vcf),
        fileName: `${meta.subject}_contacts.vcf`,
        mimetype: 'text/vcard',
        caption: `📋 *${meta.subject}*\n${meta.participants.length} contacts exported\n\n_@jadex_`
    }, { quoted: message });
};