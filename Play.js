const fetch = require('node-fetch');

module.exports = (bot) => {
  bot.command('play', async (ctx) => {
    const args = ctx.message.text.split(' ').slice(1).join(' ');
    const chatId = ctx.chat.id;

    if (!args) return ctx.reply('❌ Masukkan judul lagu.\nContoh: /sound baby shark');

    await ctx.reply('🔎 Sedang mencari lagu...');

    try {
      const res = await fetch(`https://api.nekorinn.my.id/downloader/ytplay-savetube?q=${encodeURIComponent(args)}`);
      if (!res.ok) return ctx.reply('❌ Gagal mengambil data dari API.');

      const data = await res.json();
      if (!data.status) return ctx.reply('❌ Lagu tidak ditemukan.');

      const { title, channel, duration, imageUrl, link } = data.result.metadata;
      const downloadUrl = data.result.downloadUrl;

      await ctx.replyWithAudio({ url: downloadUrl }, {
        title,
        performer: channel,
        caption: `🎶 *${title}*\n📺 ${channel} • ${duration}\n🔗 [YouTube Link](${link})`,
        parse_mode: 'Markdown'
      });
    } catch (e) {
      console.error('Error saat memproses lagu:', e);
      ctx.reply('❌ Terjadi kesalahan saat memproses lagu.');
    }
  });
};
