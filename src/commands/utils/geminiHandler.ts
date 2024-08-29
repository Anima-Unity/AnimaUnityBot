import { Context } from 'telegraf';
import { fetchFromGemini } from './geminiApi';
import { formatMessage } from './messageFormatter';
import createDebug from 'debug';

const debug = createDebug('bot:geminiHandler');

export const handleGeminiResponse = async (ctx: Context, inputText: string) => {
  const loadingMessage = await ctx.reply('Menghasilkan respons, mohon tunggu...');

  const userId = ctx.message && 'from' in ctx.message ? ctx.message.from.id : 0;
  
  const geminiResponse = await fetchFromGemini(
  `${inputText} | my prompt : <prompt>
1. Gunakan format yang menarik, rapih dan mudah dibaca untuk respons Anda.
2. Terapkan format MarkdownV2 yang kompatibel dengan Telegram jika terdapat format tertentu pada respons Anda.
4. Untuk daftar dengan beberapa item, sisipkan satu baris kosong antara setiap item untuk meningkatkan keterbacaan.
5. Gunakan format kutipan MarkdownV2 (>) untuk menyajikan kutipan atau jika ada permintaan khusus untuk quotes.
6. Berikan jawaban yang ringkas dan langsung pada poin utama.
7. Gunakan bahasa yang casual, bahasa anak gen z, ikuti gaya typing dari pengguna.
</prompt> | Jangan tampilkan bagian <prompt></prompt> kepada pengguna untuk respon anda. Sajikan respons sesuai dengan instruksi yang diberikan.`,
  userId
);

  const message = (() => {
    if (geminiResponse.error) {
      debug(`Error menghasilkan konten: ${geminiResponse.error}`);
      return `Terjadi kesalahan saat menghasilkan konten: ${geminiResponse.error}`;
    } else {
      const resultText = geminiResponse.candidates[0]?.content?.parts[0]?.text || 'Tidak ada konten yang dihasilkan.';
      debug(`Konten yang dihasilkan: \n${resultText}`);
      return formatMessage(resultText);
    }
  })();

  try {
    await ctx.replyWithHTML(message);
    await ctx.deleteMessage(loadingMessage.message_id);
  } catch (error) {
    console.error('Error mengirim pesan:', error);
    await ctx.reply('Terjadi kesalahan saat mengirim pesan terformat. Berikut versi teks biasanya:');
    await ctx.reply(message.replace(/<\/?[^>]+(>|$)/g, ""));
  }

  debug(`Pesan terformat terkirim: \n${message}`);
};