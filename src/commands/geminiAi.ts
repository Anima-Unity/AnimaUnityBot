import { Context } from 'telegraf';
import { handleGeminiResponse } from './utils/geminiHandler';
import createDebug from 'debug';

const debug = createDebug('bot:commands');

export const geminiAi = () => async (ctx: Context) => {
  if (ctx.message && 'text' in ctx.message && ctx.message.text) {
    const inputText = ctx.message.text.split(' ').slice(1).join(' ') || '';

    if (!inputText) {
      return await ctx.reply('Mohon berikan teks setelah perintah. Contoh: /ai Jelaskan bagaimana AI bekerja?');
    }

    debug(`Perintah "ai" dipicu dengan teks input: \n${inputText}`);
    await handleGeminiResponse(ctx, inputText);
  } else {
    debug('Menerima pesan non-teks atau tidak ada pesan.');
    await ctx.reply('Mohon kirim pesan teks.');
  }
};