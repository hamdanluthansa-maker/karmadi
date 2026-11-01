import { createWorker } from 'tesseract.js';
import { parsePosterText } from './imageExtractor.js';

const files = [
  'C:/Users/USER/Pictures/Capture12.PNG',
  'C:/Users/USER/Pictures/Capture13.PNG',
  'C:/Users/USER/Pictures/Capture14.PNG',
  'C:/Users/USER/Pictures/Capture17.PNG'
];

async function testExtraction() {
  const worker = await createWorker('ind+eng');
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const ret = await worker.recognize(f);
    const rawText = ret.data.text || '';
    const lower = rawText.toLowerCase();
    
    console.log(`\n=================== FILE ${i+1}: ${f} ===================`);
    
    // Check Kasus 1: Hermina
    if (lower.includes('hermina') || (lower.includes('perawat') && (lower.includes('ners') || lower.includes('btcls')))) {
      console.log('MATCH: Kasus Hermina (1 job)');
      continue;
    }
    // Check Kasus 2: Patzy
    if (lower.includes('patzy') || lower.includes('petshop') || lower.includes('accouning') || lower.includes('accounting') || lower.includes('akutansi') || lower.includes('akuntansi') || lower.includes('careeratpatzy') || lower.includes('keuangan dari transaksi')) {
      console.log('MATCH: Kasus Patzy (1 job)');
      continue;
    }
    // Check Kasus 3: Maju Hardware
    if (lower.includes('maju hardware') || (lower.includes('kasir') && lower.includes('driver')) || lower.includes('3t49rldfmqqlqioca') || lower.includes('fl kasir') || lower.includes('gayungan')) {
      console.log('MATCH: Kasus Maju Hardware (2 jobs)');
      continue;
    }
    // Check Kasus 4: Yammy
    if (lower.includes('yammy') || lower.includes('ice cream') || lower.includes('go-day') || lower.includes('goday') || lower.includes('tendean') || lower.includes('banjarejo') || (lower.includes('driver') && lower.includes('pengiriman')) || (lower.includes('driver') && (lower.includes('sim a') || lower.includes('ice')))) {
      console.log('MATCH: Kasus Yammy (1 job)');
      continue;
    }
    // Check Kasus 5: Forklift
    if (lower.includes('forklift') || lower.includes('mekanik') || lower.includes('asia prima') || lower.includes('konjac') || lower.includes('hrjoeconsultan')) {
      console.log('MATCH: Kasus Forklift (1 job)');
      continue;
    }
    // Check Kasus 6: Checker
    if (lower.includes('checker') || lower.includes('cahaya adin') || lower.includes('depo distribusi aqua') || lower.includes('081252487609') || (lower.includes('gudang') && lower.includes('aqua'))) {
      console.log('MATCH: Kasus Checker (1 job)');
      continue;
    }
    // Check Kasus 7: Office Boy
    if (lower.includes('office boy') || lower.includes('cleaning service') || lower.includes('cleaning') || lower.includes('pria muslim') || lower.includes('taat beribadah') || lower.includes('kebersihan') || lower.includes('fasilitas prima') || (lower.includes('ob') && (lower.includes('shift') || lower.includes('muslim') || lower.includes('rohani')))) {
      console.log('MATCH: Kasus Office Boy (1 job)');
      continue;
    }
    // Check Kasus 8: Luck Milk
    if (lower.includes('luck milk') || lower.includes('motoris') || lower.includes('kanvas') || (lower.includes('sales') && lower.includes('ngawi'))) {
      console.log('MATCH: Kasus Luck Milk (1 job)');
      continue;
    }

    // Check Multi roles
    const commonMultiTitles = [
      'Kasir', 'Driver', 'Admin', 'Staff Gudang', 'Barista', 'Waiter',
      'Cook', 'Sales', 'Teknisi', 'Security', 'Customer Service'
    ];
    const detectedRoles = [];
    for (const role of commonMultiTitles) {
      if (new RegExp(`\\b${role}\\b`, 'i').test(rawText)) {
        detectedRoles.push(role);
      }
    }
    if (detectedRoles.length >= 2) {
      console.log('MATCH: Common Multi Titles ->', detectedRoles);
      continue;
    }

    const parsed = parsePosterText(rawText);
    console.log('MATCH: Single fallback ->', parsed.posisi, '|', parsed.nama_perusahaan);
  }
  await worker.terminate();
}

testExtraction();
