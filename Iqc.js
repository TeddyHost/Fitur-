module.exports = (bot) => {
bot.command('iqc', async (ctx) => {
    try {
        const text = ctx.message.text.split(' ').slice(1).join(' ');
        
        // Pastikan ada teks yang dikirim
        if (!text) {
            return ctx.reply('Format salah! Gunakan:\n/iqc jam|batre|pesan\nContoh: /iqc 18:00|40|hai hai');
        }

        // Pisahkan parameter
        const parts = text.split('|');
        if (parts.length < 3) {
            return ctx.reply('Format salah! Gunakan:\n/iqc jam|batre|Paketnya|pesan\nContoh:\n/iqc 18:00|40|Axis|hai hai');
        }

        const [time, battery, paket, ...messageParts] = parts;
        const message = messageParts.join('|').trim();

        // Validasi input
        if (!time || !paket || !battery || !message) {
            return ctx.reply('Format tidak lengkap! Pastikan mengisi jam, batre, dan pesan');
        }

        await ctx.reply('🚀 Otw Anjg,\nGak Sabar Mati Aja Lu Bangke....');

        const encodedTime = encodeURIComponent(time);
        const encodedMessage = encodeURIComponent(message);
        const url = `https://brat.siputzx.my.id/iphone-quoted?time=${encodedTime}&batteryPercentage=${battery}&carrierName=${paket}&messageText=${encodedMessage}&emojiStyle=apple`;

        const axios = require('axios');
        const response = await axios.get(url, { responseType: 'arraybuffer' });

        if (!response.data) {
            throw new Error('Gagal mendapatkan gambar dari server');
        }

        await ctx.replyWithPhoto({ source: Buffer.from(response.data) }, {
            caption: 'Pesan iPhone quote berhasil dibuat.\nCreated By Nted Crasher Bot\nSince 2k24'
        });

    } catch (error) {
        console.error('Error di iqc:', error);
        ctx.reply(`❌ Error: ${error.message || 'Terjadi kesalahan saat memproses'}`);
    }
});
};
