import { Context, Telegraf } from 'telegraf';
import { handleGeminiResponse } from '../commands/utils/geminiHandler';
import { reportHandler } from './reportHandler';
import createDebug from 'debug';

const debug = createDebug('bot:mentionHandler');
const ADMIN_ID = process.env.ADMIN_ID || '';

export const handleMention = async (ctx: Context, bot: Telegraf) => {
  try {
    const message = ctx.message as any; // Assert as 'any'
    const messageText = message?.text;
    const botUsername = bot.botInfo?.username;

    if (!messageText || !botUsername) {
      debug('Pesan atau nama pengguna bot tidak ditemukan');
      return;
    }

    // Regex untuk menangani mention dengan atau tanpa teks tambahan
    const mentionRegex = new RegExp(`^@${botUsername}(?:\\s+(.*))?`, 'i');
    debug(`Mencocokkan pesan dengan pola: ${mentionRegex}`);
    const match = messageText.match(mentionRegex);

    if (match) {
      // Pastikan match[1] ada sebelum memanggil trim
      const inputText = match[1] ? match[1].trim() : null;
      debug(`Bot di-mention dengan teks input: \n${inputText || 'tidak ada teks tambahan'}`);

      // Panggil reportHandler
      reportHandler(bot, ctx, ADMIN_ID);

      // Jika ada teks tambahan, proses dengan handleGeminiResponse
      if (inputText) {
        await handleGeminiResponse(ctx, inputText);
      } else {
        // Tangani kasus di mana hanya mention tanpa teks tambahan
        debug('Hanya mention tanpa teks tambahan');
        await handleGeminiResponse(ctx, inputText);
      }
    } else {
      debug('Pesan bukan mention bot, memproses sebagai pesan biasa');
      // Jika diperlukan, aktifkan geminiAi untuk pesan biasa
      // await geminiAi()(ctx);
    }
  } catch (error: any) {
    debug(`Error: ${error.message}`);
  }
};