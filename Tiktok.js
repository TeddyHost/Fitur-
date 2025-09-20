const axios = require('axios');
const moment = require('moment-timezone');

async function tiktokDl(url) {
  try {
    function formatNumber(integer) {
      let numb = parseInt(integer);
      return Number(numb).toLocaleString().replace(/,/g, '.');
    }

    function formatDate(n, locale = 'id') {
      let d = new Date(n * 1000); // TikTok pakai UNIX timestamp (detik)
      return d.toLocaleDateString(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      });
    }

    let domain = 'https://www.tikwm.com/api/';
    let { data } = await axios.post(domain, null, {
      headers: {
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Origin': 'https://www.tikwm.com',
        'Referer': 'https://www.tikwm.com/',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; Mobile) Chrome/116.0.0.0 Mobile Safari/537.36',
        'X-Requested-With': 'XMLHttpRequest'
      },
      params: {
        url: url,
        count: 12,
        cursor: 0,
        web: 1,
        hd: 1
      }
    });

    let res = data.data;
    if (!res) throw new Error("Tidak ada respon dari server.");

    let media = [];
    if (res.duration === 0 && res.images) {
      res.images.forEach((v, i) => {
        media.push({ type: 'photo', url: v });
      });
    } else {
      media.push(
        { type: 'watermark', url: 'https://www.tikwm.com' + (res?.wmplay || '') },
        { type: 'nowatermark', url: 'https://www.tikwm.com' + (res?.play || '') },
        { type: 'nowatermark_hd', url: 'https://www.tikwm.com' + (res?.hdplay || '') }
      );
    }

    return {
      status: true,
      title: res.title,
      taken_at: formatDate(res.create_time),
      region: res.region,
      id: res.id,
      durations: res.duration,
      duration: res.duration + ' detik',
      cover: 'https://www.tikwm.com' + res.cover,
      size_wm: res.wm_size,
      size_nowm: res.size,
      size_nowm_hd: res.hd_size,
      data: media,
      music_info: {
        id: res.music_info?.id,
        title: res.music_info?.title,
        author: res.music_info?.author,
        album: res.music_info?.album || null,
        url: 'https://www.tikwm.com' + (res.music || res.music_info?.play || '')
      },
      stats: {
        views: formatNumber(res.play_count),
        likes: formatNumber(res.digg_count),
        comment: formatNumber(res.comment_count),
        share: formatNumber(res.share_count),
        download: formatNumber(res.download_count)
      },
      author: {
        id: res.author?.id,
        fullname: res.author?.unique_id,
        nickname: res.author?.nickname,
        avatar: 'https://www.tikwm.com' + res.author?.avatar
      }
    };
  } catch (e) {
    return { status: false, msg: e.message };
  }
}

module.exports = (bot) => {
  bot.command('tiktok', async (ctx) => {
    const url = ctx.message.text.split(' ')[1];
    if (!url || !url.startsWith('http')) {
      return ctx.reply('❌ Masukkan link TikTok yang valid.');
    }

    await ctx.reply('⏳ Mengambil video...');

    try {
      const result = await tiktokDl(url);
      if (!result.status) return ctx.reply('❌ Gagal mengambil data: ' + result.msg);

      if (result.durations === 0) {
        for (let i = 0; i < result.data.length; i++) {
          await ctx.replyWithPhoto({ url: result.data[i].url }, {
            caption: `📷 Slide ke-${i + 1}`,
            parse_mode: 'Markdown'
          });
        }
      } else {
        const video = result.data.find(v => v.type === 'nowatermark_hd' && v.url || v.type === 'nowatermark' && v.url);
        if (!video) return ctx.reply('❌ Video tidak tersedia.');

        await ctx.replyWithVideo({ url: video.url }, {
          caption: `✅ *Sukses*\n🎵 ${result.music_info.title} - ${result.music_info.author}`,
          parse_mode: 'Markdown'
        });
      }
    } catch (e) {
      console.log(e);
      ctx.reply('❌ Terjadi kesalahan saat mengunduh video.');
    }
  });
};
