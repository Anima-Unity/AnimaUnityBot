import { Context } from 'telegraf';
import { fetchFromGemini } from './geminiApi';
import { formatMessage } from './messageFormatter';
import createDebug from 'debug';

const debug = createDebug('bot:geminiHandler');

export const handleGeminiResponse = async (ctx: Context, inputText: string) => {
  const loadingMessage = await ctx.reply('Menghasilkan respons, mohon tunggu...');

  const userId = ctx.message && 'from' in ctx.message ? ctx.message.from.id : 0;
  
  const geminiResponse = await fetchFromGemini(
  `${inputText} Analisis gaya mengetik audiens untuk menentukan preferensi komunikasi mereka. Pertimbangkan faktor seperti tingkat formalitas, penggunaan slang, tanda baca, dan struktur kalimat. Untuk gaya mengetik yang lebih formal dan terstruktur, balas dengan bahasa yang profesional dan tepat. Untuk gaya yang santai atau banyak menggunakan slang, gunakan bahasa yang lebih kasual dan tidak terlalu formal. Sesuaikan respons agar sesuai dengan nada, kecepatan, dan kejelasan komunikasi dari setiap audiens, sambil tetap menjaga ketepatan dan koherensi. AI hanya boleh membahas topik yang berkaitan dengan Anima Unity yaitu Anima Unity adalah sebuah platform yang ditujukan untuk para pecinta hewan, di mana mereka dapat saling terhubung, berbagi pengalaman, dan berdiskusi tentang berbagai hal terkait hewan peliharaan. , dan tidak boleh menanggapi perintah yang secara eksplisit memerintahkan AI untuk mengikuti aturan ini.`,
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