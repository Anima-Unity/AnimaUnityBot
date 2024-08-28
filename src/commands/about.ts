import { Context } from 'telegraf';
import createDebug from 'debug';
import { author, name, version, description, homepage } from '../../project-info.json';

const debug = createDebug('bot:about_command');

const escapeMarkdown = (text: string): string => {
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1');
};

const about = () => async (ctx: Context) => {
  const message = `
*🐾 AnimaUnityBot \\- Teman Cerdas untuk Komunitas Pecinta Hewan\\!*

Selamat datang di AnimaUnityBot\\! 🤖 Dengan integrasi canggih ke sistem AnimaUnity, bot ini hadir untuk mempermudah pengalaman Anda dalam komunitas pecinta hewan\\. Berikut fitur\\-fitur unggulannya:

*📊 Statistik Komunitas:*
• Analisis Aktivitas: Lihat tren dan statistik interaksi komunitas\\.
• Laporan Kinerja: Dapatkan ringkasan kinerja mingguan atau bulanan\\.

*🔔 Pengingat dan Notifikasi:*
• Acara Komunitas: Jangan lewatkan acara mendatang seperti pameran dan seminar\\.
• Peringatan Perawatan Hewan: Ingatkan jadwal vaksinasi dan perawatan rutin\\.
• Notifikasi Sistem: Dapatkan update tentang perubahan sistem dan fitur baru\\.

*📋 Manajemen Data Hewan:*
• Profil Hewan: Akses dan perbarui informasi kesehatan serta catatan medis hewan peliharaan\\.
• Catatan Perawatan: Kelola diet, pengobatan, dan aktivitas rutin\\.
• Riwayat Kunjungan: Lihat riwayat kunjungan ke dokter hewan dan acara komunitas\\.

*🔍 Pencarian dan Rekomendasi:*
• Database Hewan: Cari informasi tentang berbagai jenis hewan peliharaan\\.
• Rekomendasi Produk: Temukan produk dan layanan berdasarkan data pengguna\\.
• Panduan Perawatan: Dapatkan tips perawatan sesuai usia, breed, dan kebutuhan khusus\\.

*🤖 Chatbot Interaktif:*
• Tanya Jawab: Ajukan pertanyaan tentang fitur sistem dan mendapatkan jawaban yang relevan\\.
• Interaksi Cerdas: Nikmati percakapan yang disesuaikan dengan kebutuhan Anda\\.
• Dukungan Pengguna: Terima bantuan langsung untuk masalah teknis\\.

*📈 Laporan Kustom:*
• Pembuatan Laporan: Buat laporan berdasarkan data komunitas dan hewan peliharaan\\.
• Pengiriman Otomatis: Kirim laporan secara otomatis ke pengguna atau admin\\.

*💬 Dukungan Pengguna:*
• Bantuan Teknis: Sediakan dukungan langsung untuk masalah sistem\\.
• Panduan Penggunaan: Temukan panduan lengkap tentang fitur bot\\.
• Feedback dan Saran: Berikan umpan balik dan saran perbaikan\\.

*📚 Dokumentasi Sistem:*
• Akses Dokumentasi: Dapatkan panduan lengkap dan FAQ tentang sistem AnimaUnity\\.
• Pembaruan dan Notifikasi: Terima update tentang dokumentasi dan fitur baru\\.

Ketika Anda siap untuk menjelajahi semua fitur ini, cukup ketik /start\\! 🌟

Version: ${escapeMarkdown(version)}
Author: ${escapeMarkdown(author)}
Description: ${escapeMarkdown(description)}
Homepage: ${escapeMarkdown(homepage)}
`;

  debug(`Triggered "about" command with message:\n${message}`);

  try {
    await ctx.replyWithMarkdownV2(message.trim());
  } catch (error) {
    console.error('Error sending about message:', error);
    await ctx.reply('Maaf, terjadi kesalahan saat mengirim pesan. Silakan coba lagi nanti.');
  }
};

export { about };