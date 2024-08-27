import { Telegraf, Context } from 'telegraf';

const reportHandler = (bot: Telegraf, ctx: Context, adminId: string): void => {
  const chat = ctx.chat;
  const user = ctx.from;

  // Memastikan chat dan user ada
  if (!chat || !user) {
    return;
  }

  // Mendapatkan nama bot
  bot.telegram.getMe().then((botInfo) => {
    const botName = botInfo.first_name;

    // Mempersiapkan pesan laporan
    let reportMessage = `Bot ${botName} menerima pesan dari @${user.username || user.first_name}`;
    reportMessage += `\nNama: ${user.first_name} ${user.last_name || ''}`;
    
    // Jika chat adalah grup, supergroup, atau channel, tambahkan nama grup
    if (chat.type === 'group' || chat.type === 'supergroup' || chat.type === 'channel') {
      reportMessage += `\nGrup: ${chat.title || 'Tidak ada judul grup'}`;
    }

    // Mengirimkan laporan ke akun pribadi
    bot.telegram.sendMessage(adminId, reportMessage);
  }).catch((error) => {
    console.error('Error getting bot info:', error);
  });
};

export { reportHandler };