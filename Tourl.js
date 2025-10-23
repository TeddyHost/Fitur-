const axios = require("axios");
const FormData = require("form-data");

module.exports = (bot) => {
  bot.command("tourl", async (ctx) => {
    const repliedMsg = ctx.message.reply_to_message;

    // Validasi pesan reply
    if (
      !repliedMsg ||
      (!repliedMsg.document && !repliedMsg.photo && !repliedMsg.video)
    ) {
      return ctx.reply(
        "Bro? Foto/Videonya yang mau dijadikan link mana?\n\n📌 *Contoh:* reply foto, lalu ketik `/tourl`",
        { parse_mode: "Markdown" }
      );
    }

    let fileId, fileName;

    if (repliedMsg.document) {
      fileId = repliedMsg.document.file_id;
      fileName = repliedMsg.document.file_name || `file_${Date.now()}`;
    } else if (repliedMsg.photo) {
      const photos = repliedMsg.photo;
      fileId = photos[photos.length - 1].file_id;
      fileName = `photo_${Date.now()}.jpg`;
    } else if (repliedMsg.video) {
      fileId = repliedMsg.video.file_id;
      fileName = `video_${Date.now()}.mp4`;
    }

    try {
      const processingMsg = await ctx.reply("⏳ Proses bentar yak...\nGak sabar? mati aja anjg 😎");

      // Ambil link file Telegram
      const file = await ctx.telegram.getFile(fileId);
      const fileLink = `https://api.telegram.org/file/bot${bot.token}/${file.file_path}`;

      // Ambil file dalam bentuk stream
      const fileStream = await axios.get(fileLink, { responseType: "stream" });

      // Upload ke Catbox
      const form = new FormData();
      form.append("reqtype", "fileupload");
      form.append("fileToUpload", fileStream.data, fileName);

      const { data: catboxUrl } = await axios.post(
        "https://catbox.moe/user/api.php",
        form,
        { headers: form.getHeaders() }
      );

      // Validasi hasil
      if (!catboxUrl.startsWith("https://")) {
        throw new Error("Catbox tidak mengembalikan URL yang valid");
      }

      // Edit pesan hasil upload
      await ctx.telegram.editMessageText(
        ctx.chat.id,
        processingMsg.message_id,
        null,
        `✅ *Berhasil dijadikan link!*\n\n🌐 URL:\n${catboxUrl}\n\n_By Nted Crasher - Bot Bug_`,
        { parse_mode: "Markdown" }
      );
    } catch (error) {
      console.error("Upload error:", error?.response?.data || error.message);
      ctx.reply("❌ Gagal mengupload file ke Catbox, coba lagi nanti.");
    }
  });
};
