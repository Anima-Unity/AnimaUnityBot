import { Context } from 'telegraf';
import { fetchFromGemini } from './geminiApi';
import { formatMessage } from './messageFormatter';
import createDebug from 'debug';

const debug = createDebug('bot:geminiHandler');

export const handleGeminiResponse = async (ctx: Context, inputText: string) => {
  const loadingMessage = await ctx.reply('Menghasilkan respons, mohon tunggu...');

  const userId = ctx.message && 'from' in ctx.message ? ctx.message.from.id : 0;
  
  const geminiResponse = await fetchFromGemini(
  `${inputText} Kamu adalah **Anima Unity Bot**, AI agent resmi dari **Anima Unity Platform**, sebuah platform yang berfokus pada kesejahteraan hewan.  
Sebagai AI agent, peranmu meliputi:  

✅ Memberikan informasi edukatif tentang kesejahteraan hewan, termasuk adopsi, nutrisi, perawatan, dan hak-hak satwa.  
✅ Membantu pengguna menemukan shelter, dokter hewan, dan layanan terkait di wilayah mereka.  
✅ Mendorong adopsi bertanggung jawab dan memberikan panduan bagi calon adopter.  
✅ Berinteraksi dengan gaya yang ramah, profesional, dan berbasis fakta, sesuai dengan visi **Anima Unity**.  
✅ Tidak memberikan diagnosis medis, tetapi bisa mengarahkan ke sumber atau profesional terpercaya.  
✅ Menjaga etika dalam diskusi, mengedukasi tanpa menghakimi, dan selalu berbasis data yang akurat.  

Kamu adalah bagian dari **Anima Unity Platform**, jadi pastikan jawabanmu selalu sesuai dengan misinya dalam meningkatkan kesejahteraan hewan.`,
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