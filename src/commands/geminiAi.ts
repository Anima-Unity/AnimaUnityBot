import { Context } from 'telegraf';
import axios from 'axios';
import createDebug from 'debug';

const GEMINI_API_KEY = 'AIzaSyA5R4PjUKHFFz4uZhIwHpZQ8V19uSp2JAE';
const debug = createDebug('bot:geminiAi_command');

const userContexts = new Map<number, string>();
const MAX_CONTEXT_LENGTH = 2000;
const MAX_TEXT_LENGTH = 4096;

const formatMarkdown = (text: string): string => {
  let formatted = text.replace(/([_*[\]()~`>#+\-=|{}.!\\])/g, '\\$1');

  formatted = formatted.replace(/\\`\\`\\`(\w*)\n([\s\S]*?)\\`\\`\\`/g, (_, lang, code) => {
    return '```' + lang + '\n' + code.replace(/\\/g, '') + '```';
  });

  formatted = formatted.replace(/\\`([^`]+)\\`/g, '`$1`');

  formatted = formatted.replace(/\n((?:\s*\|.*\|\s*\n)+)/g, (match) => {
    return match.replace(/\\\|/g, '|').replace(/\\_/g, '_');
  });

  formatted = formatted.replace(/\\\[(.*?)\\\]\\\((.*?)\\\)/g, '[$1]($2)');

  return formatted;
};

const fetchFromGemini = async (text: string, userId: number) => {
  try {
    const previousContext = userContexts.get(userId) || '';
    let fullPrompt = `${previousContext}\n\nHuman: ${text}\n\nAI: "Please respond in a way that aligns with the user's personality traits. Use MarkdownV2 formatting for your reply, including code blocks, tables, links, and other Markdown features.".\n\n`;

    if (fullPrompt.length > MAX_CONTEXT_LENGTH) {
      fullPrompt = fullPrompt.slice(-MAX_CONTEXT_LENGTH);
    }

    const payload = {
      contents: [
        {
          parts: [
            {
              text: fullPrompt
            }
          ]
        }
      ]
    };

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      payload,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    const newResponse = response.data.candidates[0]?.content?.parts[0]?.text || '';
    const formattedText = formatMarkdown(newResponse);
    userContexts.set(userId, `${text}\n${formattedText}`);

    return { ...response.data, formattedText };
  } catch (error) {
    console.error('Error fetching data from Gemini API:', error);
    return { error: 'Failed to fetch data from Gemini API' };
  }
};

const splitMessage = (message: string) => {
  const chunks: string[] = [];
  let currentChunk = '';
  let inCodeBlock = false;

  message.split('\n').forEach(line => {
    if (line.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
    }

    if (currentChunk.length + line.length + 1 > MAX_TEXT_LENGTH && !inCodeBlock) {
      chunks.push(currentChunk);
      currentChunk = '';
    }
    currentChunk += (currentChunk ? '\n' : '') + line;
  });

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
};

const geminiAi = () => async (ctx: Context) => {
  if (ctx.message && 'text' in ctx.message && ctx.message.text && 'from' in ctx.message) {
    const inputText = ctx.message.text.split(' ').slice(1).join(' ') || '';
    const userId = ctx.message.from.id;

    if (!inputText) {
      return await ctx.reply('Please provide the text after the command. Example: /ai Explain how AI works?');
    }

    debug(`Triggered "ai" command with input text: \n${inputText}`);

    try {
      const loadingMessage = await ctx.reply('Generating response, please wait...');

      const geminiResponse = await fetchFromGemini(inputText, userId);

      const message = (() => {
        if (geminiResponse.error) {
          debug(`Error generating content: ${geminiResponse.error}`);
          return `An error occurred while generating content: ${geminiResponse.error}`;
        } else {
          debug(`Generated content: \n${geminiResponse.formattedText}`);
          return geminiResponse.formattedText || 'No content generated.';
        }
      })();

      const messages = splitMessage(message);

      for (const msg of messages) {
        try {
          await ctx.replyWithMarkdownV2(msg);
        } catch (error) {
          console.error('Error sending markdown message:', error);
          await ctx.reply('Error sending formatted message. Here\'s the plain text:');
          await ctx.reply(msg);
        }
      }

      await ctx.deleteMessage(loadingMessage.message_id);
    } catch (error) {
      console.error('Error sending message:', error);
      await ctx.reply('An error occurred while sending the message.');
    }

    debug('Completed processing.');
  } else {
    debug('Received non-text message or no message.');
    await ctx.reply('Please send a text message.');
  }
};

const clearContext = () => async (ctx: Context) => {
  if (ctx.message && 'from' in ctx.message) {
    const userId = ctx.message.from.id;
    userContexts.delete(userId);
    await ctx.reply('Context has been cleared. You can start a new conversation.');
  }
};

export { geminiAi, clearContext };