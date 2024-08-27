// Import modul yang diperlukan
import { Context } from 'telegraf';
import createDebug from 'debug';

// Impor informasi proyek dari file JSON
import { author, name, version, description, homepage } from '../../project-info.json';

// Buat objek debug untuk logging
const debug = createDebug('bot:about_command');

// Fungsi untuk menangani perintah "/about"
const about = () => async (ctx: Context) => {
// Buat pesan yang akan dikirimkan sebagai respons terhadap perintah "/about"
const message =
`*🤖 Welcome to ${name} v${version}!*

${description} - A powerful and easy-to-use Telegram Bot.

🚀 *Features*:
- 🧠 Ai.

Thank you for using *${name}*! Feel free to visit our [homepage](${homepage}) for more information.

👨‍💻 *Developed by*: [${author}](t.me/jdoeflix)
`;

// Log pesan ke konsol untuk debugging
debug('Triggered "about" command with message \n${message}');

// Kirimkan pesan ke pengguna dengan format MarkdownV2
await ctx.replyWithMarkdownV2(message.trim(), { parse_mode: 'Markdown' });
};

// Ekspor fungsi about agar dapat digunakan di bagian lain dari kode
export { about };