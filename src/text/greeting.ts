import { Context } from 'telegraf';
import createDebug from 'debug';

const debug = createDebug('bot:greeting_text');

const replyToMessage = (ctx: Context, messageId: number, string: string) =>
  ctx.replyWithHTML(string, {
    reply_parameters: { message_id: messageId },
  });

const greeting = () => async (ctx: Context) => {
  debug('Triggered "greeting" text command');

  const messageId = ctx.message?.message_id;
  const firstName = ctx.message?.from.first_name;
  const lastName = ctx.message?.from.last_name;

  const userName = lastName ? `${firstName} ${lastName}` : firstName;

  if (messageId) {
    await replyToMessage(
     ctx, 
     messageId, 
     `
<b>🌟 Welcome, ${userName}! 🌟</b>

I'm <b>TaskMaster</b>, your personal productivity assistant. Let's make your day more efficient!

<b>🚀 Powerful Features:</b>
🤖 /ai - AI integration for smarter task management

<b>💡 Pro Tips:</b>
- Use ai prompt : /ai {message}
• example : /ai resep nasi goreng

<b>🔗 Explore More:</b>
Discover advanced features on our <a href="https://github.com/A-fauzi">github</a>

Ready to boost your productivity? Let's get started! 💪😊
     `
    );
  }
};

export { greeting };