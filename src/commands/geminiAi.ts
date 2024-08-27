import { Context } from 'telegraf';
import axios from 'axios';
import createDebug from 'debug';
import * as googleTTS from 'google-tts-api';

const GEMINI_API_KEY = 'AIzaSyA5R4PjUKHFFz4uZhIwHpZQ8V19uSp2JAE';
const debug = createDebug('bot:geminiAi_command');

const userContexts = new Map<number, string>();
const MAX_CONTEXT_LENGTH = 2000;
const MAX_TEXT_LENGTH = 200; // Panjang maksimum untuk setiap permintaan audio

const fetchFromGemini = async (text: string, userId: number) => {
  try {
    const previousContext = userContexts.get(userId) || '';
    let fullPrompt = `${previousContext}\n\nHuman: ${text}\n\nAI:`;

    // Batasi panjang konteks
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
    
    // Simpan hanya respons baru untuk konteks
    userContexts.set(userId, `${text}\n${newResponse}`);

    return response.data;
  } catch (error) {
    console.error('Error fetching data from Gemini API:', error);
    return { error: 'Failed to fetch data from Gemini API' };
  }
};

const formatMessage = (text: string): string => {
  let formattedText = '<pre>result</pre>\n\n';
  const lines = text.split('\n');
  let insideCodeBlock = false;
  let codeBlock = '';

  lines.forEach(line => {
    line = line.trim();

    if (line.startsWith('```')) {
      insideCodeBlock = !insideCodeBlock;
      if (!insideCodeBlock) {
        formattedText += `<pre>${codeBlock.trim()}</pre>\n`;
        codeBlock = '';
      }
    } else if (insideCodeBlock) {
      codeBlock += `${line}\n`;
    } else if (line.startsWith('**') && line.endsWith('**')) {
      formattedText += `<b>${line.replace(/\*\*/g, '')}</b>\n`;
    } else if (line.startsWith('*')) {
      formattedText += `• ${line.substring(1).trim()}\n`;
    } else if (line.includes('**')) {
      const parts = line.split('**');
      formattedText += parts.map((part, index) => 
        index % 2 === 1 ? `<b>${part}</b>` : part
      ).join('') + '\n';
    } else {
      formattedText += `${line}\n`;
    }
  });

  if (insideCodeBlock) {
    formattedText += `<pre>${codeBlock.trim()}</pre>\n`;
  }

  return formattedText.trim();
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
      // Kirim pesan loading
      const loadingMessage = await ctx.reply('Generating response, please wait...');

      // Ambil respons dari Gemini
      const geminiResponse = await fetchFromGemini(inputText, userId);

      // Format pesan
      const message = (() => {
        if (geminiResponse.error) {
          debug(`Error generating content: ${geminiResponse.error}`);
          return `An error occurred while generating content: ${geminiResponse.error}`;
        } else {
          const resultText = geminiResponse.candidates[0]?.content?.parts[0]?.text || 'No content generated.';
          debug(`Generated content: \n${resultText}`);
          return formatMessage(resultText);
        }
      })();

      // Kirim pesan baru dengan hasil
      await ctx.reply(message, { parse_mode: 'HTML' });

      // Hapus pesan loading jika berhasil
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