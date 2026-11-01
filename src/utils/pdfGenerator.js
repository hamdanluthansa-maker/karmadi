import { jsPDF } from 'jspdf';

/**
 * Menghasilkan file PDF Surat Lamaran Kerja resmi standar Indonesia (Ukuran A4)
 * yang langsung diunduh ke komputer pengguna untuk kemudian dicetak/diprint.
 */
export function generateCoverLetterPdf({
  applicantName = '',
  birthPlaceDate = '',
  education = '',
  applicantPhone = '',
  applicantAddress = '',
  jobPosition = '',
  companyName = '',
  jobLocation = ''
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const name = applicantName.trim() || 'Nama Pelamar';
  const birth = birthPlaceDate.trim() || '-';
  const edu = education.trim() || 'SMA / SMK Sederajat';
  const phone = applicantPhone.trim() || '-';
  const address = applicantAddress.trim() || 'Karesidenan Madiun';
  const comp = companyName.trim() || 'Pimpinan / HRD Perusahaan';
  const pos = jobPosition.trim() || 'Staff';
  const loc = jobLocation.trim() || 'Madiun';

  const today = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Margin & layout
  const marginX = 25;
  let curY = 25;
  const pageWidth = 210;
  const contentWidth = pageWidth - (marginX * 2);

  // Set font Times
  doc.setFont('times', 'normal');

  // 1. Tanggal Surat (Kanan atas)
  doc.setFontSize(11);
  const dateStr = `Madiun, ${today}`;
  doc.text(dateStr, pageWidth - marginX, curY, { align: 'right' });
  curY += 10;

  // 2. Perihal & Lampiran (Kiri)
  doc.text('Hal       : Lamaran Pekerjaan', marginX, curY);
  curY += 5.5;
  doc.text('Lampiran  : 1 (Satu) Berkas', marginX, curY);
  curY += 9;

  // 3. Alamat Tujuan
  doc.text('Kepada Yth.', marginX, curY);
  curY += 5.5;
  doc.setFont('times', 'bold');
  doc.text(`Pimpinan / HRD ${comp}`, marginX, curY);
  curY += 5.5;
  doc.setFont('times', 'normal');
  doc.text(loc, marginX, curY);
  curY += 9;

  // 4. Salam Pembuka
  doc.text('Dengan hormat,', marginX, curY);
  curY += 6;

  // 5. Paragraf Pembuka
  const openingText = `Sehubungan dengan informasi lowongan pekerjaan yang saya peroleh mengenai posisi ${pos} di ${comp}, melalui surat ini saya bermaksud untuk mengajukan diri guna mengisi posisi pekerjaan tersebut.`;
  const splitOpening = doc.splitTextToSize(openingText, contentWidth);
  doc.text(splitOpening, marginX, curY);
  curY += (splitOpening.length * 5.5) + 3;

  // 6. Data Diri Pelamar
  doc.text('Berikut adalah data diri singkat saya:', marginX, curY);
  curY += 6;

  const dataFields = [
    { label: 'Nama Lengkap', val: name },
    { label: 'Tempat, Tgl Lahir', val: birth },
    { label: 'Pendidikan Terakhir', val: edu },
    { label: 'Nomor Telepon / WA', val: phone },
    { label: 'Alamat Domisili', val: address }
  ];

  dataFields.forEach((item) => {
    doc.text(item.label, marginX + 4, curY);
    doc.text(':', marginX + 46, curY);
    doc.text(item.val, marginX + 49, curY);
    curY += 5.5;
  });
  curY += 3;

  // 7. Paragraf Deskripsi & Integritas
  const bodyText = `Saya dalam kondisi sehat jasmani dan rohani, memiliki dedikasi dan integritas kerja yang tinggi, serta siap bekerja secara mandiri maupun bekerja sama dalam tim untuk memberikan kontribusi terbaik bagi kemajuan ${comp}.`;
  const splitBody = doc.splitTextToSize(bodyText, contentWidth);
  doc.text(splitBody, marginX, curY);
  curY += (splitBody.length * 5.5) + 3;

  // 8. Berkas Lampiran
  doc.text('Sebagai bahan pertimbangan dan kelengkapan administrasi, bersama surat ini saya lampirkan:', marginX, curY);
  curY += 6;

  const attachments = [
    '1. Curriculum Vitae (CV) Terbaru',
    '2. Salinan Ijazah dan Transkrip Nilai Terakhir',
    '3. Salinan Kartu Tanda Penduduk (KTP)',
    '4. Pas Foto Terbaru',
    '5. Salinan Berkas dan Sertifikat Pendukung Lainnya'
  ];

  attachments.forEach((att) => {
    doc.text(att, marginX + 4, curY);
    curY += 5;
  });
  curY += 3;

  // 9. Paragraf Penutup
  const closingText = `Besar harapan saya untuk diberikan kesempatan mengikuti tahapan wawancara atau seleksi selanjutnya agar dapat menjelaskan potensi diri saya lebih mendalam. Demikian surat lamaran pekerjaan ini saya sampaikan, atas perhatian dan kebijaksanaan Bapak/Ibu saya ucapkan terima kasih.`;
  const splitClosing = doc.splitTextToSize(closingText, contentWidth);
  doc.text(splitClosing, marginX, curY);
  curY += (splitClosing.length * 5.5) + 8;

  // 10. Tanda Tangan (Kanan Bawah)
  const signX = pageWidth - marginX - 45;
  doc.text('Hormat saya,', signX, curY);
  curY += 22; // Tempat tanda tangan
  doc.setFont('times', 'bold');
  doc.text(`( ${name} )`, signX, curY);

  // Simpan dan unduh otomatis file PDF
  const safeFilename = `Surat_Lamaran_${pos.replace(/[^a-zA-Z0-9]/g, '_')}_${name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  doc.save(safeFilename);
}
