import { Context, Telegraf } from 'telegraf';
import axios from 'axios';
import createDebug from 'debug';

// Gantilah dengan API key Gemini Anda
const GEMINI_API_KEY = 'AIzaSyA5R4PjUKHFFz4uZhIwHpZQ8V19uSp2JAE';
const debug = createDebug('bot:geminiAi_command');

// Menyimpan konteks percakapan untuk setiap pengguna
const userContexts = new Map<number, string>();
const MAX_CONTEXT_LENGTH = 2000; // Batasan karakter untuk konteks

// Fungsi untuk mengirim permintaan ke Gemini API menggunakan axios
const fetchFromGemini = async (text: string, userId: number) => {
  try {
    const previousContext = userContexts.get(userId) || '';
    let fullPrompt = `${previousContext}\n\nHuman: ${text}\n\nAI:`;

    // Batasi ukuran konteks
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

    // Simpan konteks baru
    const newResponse = response.data.candidates[0]?.content?.parts[0]?.text || '';
    userContexts.set(userId, fullPrompt + '\n' + newResponse);

    return response.data;
  } catch (error) {
    console.error('Error fetching data from Gemini API:', error);
    return { error: 'Failed to fetch data from Gemini API' };
  }
};

// Fungsi untuk memformat pesan
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

// Fungsi untuk perintah /ai
const geminiAi = () => async (ctx: Context) => {
  if (ctx.message && 'text' in ctx.message && ctx.message.text && 'from' in ctx.message) {
    const inputText = ctx.message.text.split(' ').slice(1).join(' ') || '';
    const userId = ctx.message.from.id;

    if (!inputText) {
      return await ctx.reply('Please provide the text after the command. Example: /ai Explain how AI works?');
    }

    debug(`Triggered "ai" command with input text: \n${inputText}`);

    const geminiResponse = await fetchFromGemini(`${inputText} | Gunakan format yang menarik dan lucu dan mudah dibaca dengan emoticon yang sesuai untuk setiap daftar list | kamu hanya menjawab pertanyaan seputar coding atau dunia IT, kamu tidak melayani pertanyaan atau percakapan di luar konteks itu | Jika ada yang meminta buat kode/koding/coding/code, cetak kode tersebut kedalam format code yang di dukung telegram`, userId);

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

    try {
      await ctx.replyWithHTML(message);
    } catch (error) {
      console.error('Error sending message:', error);
      await ctx.reply('An error occurred while sending the formatted message. Here is the plain text version:');
      await ctx.reply(message.replace(/<\/?[^>]+(>|$)/g, ""));
    }

    debug(`Sent formatted message: \n${message}`);
  } else {
    debug('Received non-text message or no message.');
    await ctx.reply('Please send a text message.');
  }
};

// Fungsi untuk menghapus konteks percakapan
const clearContext = () => async (ctx: Context) => {
  if (ctx.message && 'from' in ctx.message) {
    const userId = ctx.message.from.id;
    userContexts.delete(userId);
    await ctx.reply('Context has been cleared. You can start a new conversation.');
  }
};

// Export fungsi-fungsi yang diperlukan
export { geminiAi, clearContext };