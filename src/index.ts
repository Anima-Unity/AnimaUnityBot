import { Telegraf } from 'telegraf';
import { about, geminiAi, clearContext } from './commands';
import { greeting, reportHandler } from './text';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { development, production } from './core';

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const ENVIRONMENT = process.env.NODE_ENV || '';
const ADMIN_ID = process.env.ADMIN_ID || '';

const bot = new Telegraf(BOT_TOKEN);
const adminId = ADMIN_ID; // Ganti dengan ID Telegram kamu

bot.command('about', about());
bot.command('ai', geminiAi());
bot.command('clear', clearContext());


bot.on('message', (ctx) => {
  greeting()(ctx);
  reportHandler(bot, ctx, adminId); // Panggil sendReport setiap kali ada pesan
});

// prod mode (Vercel)
export const startVercel = async (req: VercelRequest, res: VercelResponse) => {
  await production(req, res, bot);
};

// dev mode
if (ENVIRONMENT !== 'production') {
  development(bot);
}