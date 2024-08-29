// File: src/index.ts
import { Telegraf } from 'telegraf';
import { about, geminiAi, clearContext } from './commands';
import { greeting, reportHandler, handleMention } from './text';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { development, production } from './core';
import createDebug from 'debug';

const debug = createDebug('bot:main');

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const ENVIRONMENT = process.env.NODE_ENV || '';
const ADMIN_ID = process.env.ADMIN_ID || '';

const bot = new Telegraf(BOT_TOKEN);
const adminId = ADMIN_ID;

bot.command('about', about());
bot.command('ai', geminiAi());
bot.command('clear', clearContext());

bot.on('message', async (ctx) => {
  debug('Pesan diterima:', ctx.message);
  //greeting()(ctx);
  //reportHandler(bot, ctx, adminId);

  if ('text' in ctx.message && ctx.message.text) {
    debug('Memanggil handleMention');
    await handleMention(ctx, bot);
  }
});

// mode produksi (Vercel)
export const startVercel = async (req: VercelRequest, res: VercelResponse) => {
  await production(req, res, bot);
};

// mode pengembangan
if (ENVIRONMENT !== 'production') {
  development(bot);
}