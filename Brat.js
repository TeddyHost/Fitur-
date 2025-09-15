const axios = require("axios");

module.exports = (bot) => {
  bot.command('brat', async (ctx) => {
    const text = ctx.message.text.split(' ').slice(1).join(' ');
    if (!text) return ctx.reply('❌ Masukkan teks!');

    try {
      const apiURL = `https://api.siputzx.my.id/api/m/brat?text=${encodeURIComponent(text)}&isVideo=false`;
      const res = await axios.get(apiURL, { responseType: 'arraybuffer' });

      await ctx.replyWithSticker({ source: Buffer.from(res.data) });
    } catch (e) {
      console.error('Error saat membuat stiker:', e);
      ctx.reply('❌ Gagal membuat stiker brat.');
    }
  });
};
