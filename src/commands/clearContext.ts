import { Context } from 'telegraf';
import { userContexts } from './utils/geminiApi';

const clearContext = () => async (ctx: Context) => {
  if (ctx.message && 'from' in ctx.message) {
    const userId = ctx.message.from.id;
    userContexts.delete(userId);
    await ctx.reply('Context has been cleared. You can start a new conversation.');
  }
};

export { clearContext };