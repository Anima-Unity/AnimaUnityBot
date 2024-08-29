import axios from 'axios';
import createDebug from 'debug';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Ambil dari .env
const debug = createDebug('bot:geminiAi_command');

const userContexts = new Map<number, string>();
const MAX_CONTEXT_LENGTH = 2000;

const fetchFromGemini = async (text: string, userId: number) => {
  try {
    const previousContext = userContexts.get(userId) || '';
    let fullPrompt = `${previousContext}\n\nHuman: ${text}\n\nAI:`;

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
    userContexts.set(userId, fullPrompt + '\n' + newResponse);

    return response.data;
  } catch (error) {
    console.error('Error fetching data from Gemini API:', error);
    return { error: 'Failed to fetch data from Gemini API' };
  }
};

export { fetchFromGemini, userContexts, MAX_CONTEXT_LENGTH };