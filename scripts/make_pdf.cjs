const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 1. Helper to convert image to Base64
function getBase64Image(filePath) {
  try {
    const ext = path.extname(filePath).replace('.', '');
    const mime = ext === 'png' ? 'image/png' : ext === 'svg' ? 'image/svg+xml' : 'image/jpeg';
    const data = fs.readFileSync(filePath).toString('base64');
    return `data:${mime};base64,${data}`;
  } catch (e) {
    console.error('Error loading image:', filePath, e.message);
    return '';
  }
}

const mockupImg = getBase64Image('c:/Users/USER/Downloads/SICAKER/public/assets/karmadi_mockup_devices.jpg');
const logoImg = getBase64Image('c:/Users/USER/Downloads/SICAKER/public/assets/logo-karmadi.png');
const spgImg = getBase64Image('C:/Users/USER/.gemini/antigravity/brain/dfaecf15-343e-408f-8c40-7193143ef936/.user_uploaded/media_1793421577018_3294d9bd.png');
const bakeshopImg = getBase64Image('C:/Users/USER/.gemini/antigravity/brain/dfaecf15-343e-408f-8c40-7193143ef936/.user_uploaded/media_1793436471164_b2a05c9f.png');

console.log('Images loaded successfully.');

const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Karmadi - Client Pitch Presentation</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@600;700&display=swap');

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #EDEAF8;
      color: #0F172A;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    @page {
      size: 16in 9in;
      margin: 0;
    }

    .slide {
      width: 16in;
      height: 9in;
      position: relative;
      page-break-after: always;
      break-after: page;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 0.75in 0.9in;
      background-color: #FFFFFF;
    }

    /* Colors */
    :root {
      --primary-purple: #3B30C8;
      --deep-purple: #271E82;
      --electric-lime: #D4FF00;
      --soft-lavender: #F4F3FF;
      --card-bg: #FFFFFF;
      --text-dark: #0F172A;
      --text-muted: #64748B;
    }

    /* Typography Utilities */
    .title-giant {
      font-size: 3.2rem;
      font-weight: 900;
      line-height: 1.1;
      letter-spacing: -0.03em;
      color: #3B30C8;
    }

    .title-large {
      font-size: 2.5rem;
      font-weight: 900;
      line-height: 1.15;
      letter-spacing: -0.02em;
    }

    .title-section {
      font-size: 1.1rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: #3B30C8;
      margin-bottom: 0.4rem;
    }

    /* Components */
    .badge-lime {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background-color: #D4FF00;
      color: #0F172A;
      font-size: 1.1rem;
      font-weight: 800;
      padding: 0.7rem 1.6rem;
      border-radius: 9999px;
      width: fit-content;
      box-shadow: 0 4px 14px rgba(212, 255, 0, 0.4);
    }

    .btn-circle {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      background: #0F172A;
      color: #FFFFFF;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
      margin-left: 0.4rem;
    }

    .card-purple {
      background: #3B30C8;
      color: #FFFFFF;
      border-radius: 2rem;
      padding: 1.8rem;
    }

    .card-lime {
      background: #D4FF00;
      color: #0F172A;
      border-radius: 2rem;
      padding: 1.8rem;
    }

    .card-lavender {
      background: #F4F3FF;
      border-radius: 2rem;
      padding: 1.8rem;
      border: 2px solid #E0E7FF;
    }

    .slide-footer-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 0.4in;
      border-top: 1px solid #E2E8F0;
      font-size: 0.95rem;
      font-weight: 700;
      color: #64748B;
    }

    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      align-items: center;
    }

    .grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 1.8rem;
      height: 100%;
      align-items: stretch;
    }

    .grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
    }

    /* Floating Pill Badge on corners */
    .top-logo-badge {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      margin-bottom: 0.5rem;
    }
  </style>
</head>
<body>

  <!-- ==========================================
       SLIDE 1: COVER (Desain Persis Template Utama Canva)
       ========================================== -->
  <div class="slide" style="background: #FFFFFF;">
    <!-- Top Header -->
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div class="top-logo-badge">
        <img src="${logoImg}" style="height: 3rem; width: auto; border-radius: 0.8rem; box-shadow: 0 4px 10px rgba(59,48,200,0.15);" />
        <div>
          <div style="font-size: 1.4rem; font-weight: 900; color: #3B30C8; letter-spacing: -0.02em;">Karmadi</div>
          <div style="font-size: 0.8rem; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em;">Info Lowongan Kerja Seputar Karesidenan Madiun</div>
        </div>
      </div>
      <div style="background: #F4F3FF; padding: 0.5rem 1.2rem; border-radius: 9999px; font-size: 0.9rem; font-weight: 800; color: #3B30C8; border: 1px solid #E0E7FF;">
        🚀 Pitch Deck &amp; Investment Overview
      </div>
    </div>

    <!-- Main Content Grid -->
    <div style="display: grid; grid-template-columns: 1.1fr 1fr; gap: 3rem; align-items: center; margin-top: 1rem;">
      <!-- Left Column: Big Bold Text + Lime CTA + Purple Sub-Card -->
      <div>
        <h1 class="title-giant" style="margin-bottom: 1.5rem;">
          Solusi Karir Terpadu<br>
          <span style="color: #0F172A;">untuk Madiun Raya</span>
        </h1>

        <div style="display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2rem;">
          <div class="badge-lime">
            Mulai Bermitra
            <span class="btn-circle">→</span>
          </div>
          <span style="font-size: 1rem; font-weight: 700; color: #64748B;">Platform Karir Hyperlokal #1</span>
        </div>

        <!-- Floating Purple Card exactly as Canva template -->
        <div class="card-purple" style="display: flex; align-items: center; justify-content: space-between; max-width: 90%; box-shadow: 0 20px 35px rgba(59,48,200,0.25); border-radius: 2.2rem;">
          <div style="max-width: 75%;">
            <div style="font-size: 1.3rem; font-weight: 800; line-height: 1.3;">
              Solusi terbaik untuk pertumbuhan bisnis &amp; rekrutmen lokal.
            </div>
          </div>
          <div style="width: 3.5rem; height: 3.5rem; border-radius: 50%; background: #D4FF00; display: flex; align-items: center; justify-content: center; font-size: 1.6rem;">
            🔔
          </div>
        </div>
      </div>

      <!-- Right Column: Mockup Photo with Asymmetric Organic Rounded Corners -->
      <div style="position: relative;">
        <div style="position: absolute; -top: 1rem; -right: 1rem; width: 6rem; height: 6rem; background: #D4FF00; border-radius: 50%; z-index: 1;"></div>
        <div style="width: 100%; height: 5.2in; border-radius: 3rem 6rem 3rem 3rem; overflow: hidden; box-shadow: 0 25px 50px rgba(15,23,42,0.2); position: relative; z-index: 2; border: 6px solid #FFFFFF;">
          <img src="${mockupImg}" style="width: 100%; height: 100%; object-fit: cover; object-position: center;" />
        </div>
        <div style="position: absolute; bottom: 1.5rem; left: -1.5rem; background: #0F172A; color: #FFFFFF; padding: 1rem 1.6rem; border-radius: 1.5rem; z-index: 3; box-shadow: 0 10px 25px rgba(0,0,0,0.3); font-size: 0.95rem; font-weight: 800;">
          ⚡ Mode Web &amp; Mode HP Ready
        </div>
      </div>
    </div>

    <!-- Bottom Meta -->
    <div class="slide-footer-meta">
      <div>Presented by: <span style="color: #3B30C8; font-weight: 900;">Tim Pengembang Karmadi</span></div>
      <div>Presented to: <span style="color: #0F172A; font-weight: 900;">Klien, Mitra Usaha &amp; UMKM Madiun</span></div>
      <div>Wilayah: <span style="color: #0F172A;">Karesidenan Madiun (Kota/Kab Madiun, Magetan, Ngawi, Ponorogo)</span></div>
    </div>
  </div>

  <!-- ==========================================
       SLIDE 2: ABOUT US / VISION
       ========================================== -->
  <div class="slide" style="background: #F8FAFC;">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div class="title-section">TENTANG KARMADI</div>
        <h2 class="title-large" style="color: #0F172A;">Menjembatani Dunia Kerja Lokal dengan Teknologi</h2>
      </div>
      <div class="badge-lime" style="font-size: 0.95rem; padding: 0.5rem 1.2rem;">
        Visi &amp; Misi 2026
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1.2fr; gap: 2.5rem; margin-top: 1.5rem; flex: 1;">
      <!-- Left Card Purple with High Contrast Stats -->
      <div class="card-purple" style="display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 15px 35px rgba(59,48,200,0.2);">
        <div>
          <div style="font-size: 1.8rem; font-weight: 900; margin-bottom: 1rem;">Platform Hyperlokal Masa Depan</div>
          <p style="font-size: 1.05rem; line-height: 1.6; opacity: 0.9;">
            Karmadi dibangun dari keresahan nyata: banyaknya lowongan kerja potensial di Madiun Raya yang hanya beredar sekilas di pamflet Instagram story dan hilang begitu saja. Kami mengarsipkannya, mengekstraknya dengan AI, dan membuka aksesnya secara luas tanpa biaya.
          </p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1.5rem;">
          <div style="background: rgba(255,255,255,0.15); padding: 1.2rem; border-radius: 1.2rem; backdrop-filter: blur(10px);">
            <div style="font-size: 2.4rem; font-weight: 900; color: #D4FF00;">100%</div>
            <div style="font-size: 0.85rem; font-weight: 700;">Fokus Karesidenan Madiun</div>
          </div>
          <div style="background: rgba(255,255,255,0.15); padding: 1.2rem; border-radius: 1.2rem; backdrop-filter: blur(10px);">
            <div style="font-size: 2.4rem; font-weight: 900; color: #D4FF00;">&lt; 5s</div>
            <div style="font-size: 0.85rem; font-weight: 700;">Waktu Ekstraksi AI</div>
          </div>
        </div>
      </div>

      <!-- Right Column: 3 Pillars -->
      <div style="display: flex; flex-direction: column; justify-content: space-around;">
        <div class="card-lavender" style="display: flex; align-items: flex-start; gap: 1.5rem; background: #FFFFFF;">
          <div style="width: 3.2rem; height: 3.2rem; border-radius: 1rem; background: #3B30C8; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 900; shrink: 0;">
            1
          </div>
          <div>
            <div style="font-size: 1.25rem; font-weight: 800; color: #0F172A; margin-bottom: 0.3rem;">Agregasi Poster Visual</div>
            <div style="font-size: 0.95rem; color: #64748B; line-height: 1.5;">
              Mengkoleksi poster flyer lowongan UMKM (toko, resto, klinik, distributor) dari berbagai sumber menjadi satu direktori rapi.
            </div>
          </div>
        </div>

        <div class="card-lavender" style="display: flex; align-items: flex-start; gap: 1.5rem; background: #FFFFFF;">
          <div style="width: 3.2rem; height: 3.2rem; border-radius: 1rem; background: #D4FF00; color: #0F172A; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 900; shrink: 0;">
            2
          </div>
          <div>
            <div style="font-size: 1.25rem; font-weight: 800; color: #0F172A; margin-bottom: 0.3rem;">Zero-Barrier to Apply</div>
            <div style="font-size: 0.95rem; color: #64748B; line-height: 1.5;">
              Pencari kerja tidak perlu registrasi panjang atau upload CV bahasa Inggris. Akses instan langsung ke formulir pendaftaran atau kontak HRD.
            </div>
          </div>
        </div>

        <div class="card-lavender" style="display: flex; align-items: flex-start; gap: 1.5rem; background: #FFFFFF;">
          <div style="width: 3.2rem; height: 3.2rem; border-radius: 1rem; background: #0F172A; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 900; shrink: 0;">
            3
          </div>
          <div>
            <div style="font-size: 1.25rem; font-weight: 800; color: #0F172A; margin-bottom: 0.3rem;">Otomasi Surat Lamaran &amp; Cetak PDF</div>
            <div style="font-size: 0.95rem; color: #64748B; line-height: 1.5;">
              Membantu pelamar menyusun surat lamaran formal dan mengonversinya menjadi dokumen fisik A4 PDF siap print dalam hitungan detik.
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer-meta">
      <div>Karmadi Pitch Deck 2026</div>
      <div>Slide 02 / 11</div>
    </div>
  </div>

  <!-- ==========================================
       SLIDE 3: PROBLEM (Desain 3 Blok Warna: Lime, Purple, White)
       ========================================== -->
  <div class="slide" style="background: #FFFFFF;">
    <div>
      <div class="title-section">TANTANGAN RIIL PASAR (THE PROBLEM)</div>
      <h2 class="title-large" style="color: #0F172A;">Kenapa Merekrut &amp; Melamar di Daerah Begitu Sulit?</h2>
    </div>

    <!-- 3 High Contrast Blocks matching Canva template "Key Challenges Identified 01, 02, 03" -->
    <div class="grid-3" style="margin-top: 1.8rem; flex: 1;">
      <!-- Card 01: Neon Lime -->
      <div class="card-lime" style="display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 15px 30px rgba(212,255,0,0.3);">
        <div>
          <div style="font-size: 4rem; font-weight: 900; line-height: 1; letter-spacing: -0.04em; margin-bottom: 1.5rem; color: #0F172A;">
            01.
          </div>
          <div style="font-size: 1.5rem; font-weight: 900; margin-bottom: 1rem; color: #0F172A;">
            Loker Tercecer di Medsos
          </div>
          <p style="font-size: 1rem; line-height: 1.6; color: #1E293B;">
            85% lowongan kerja UMKM di Madiun hanya diunggah sebagai Story Instagram atau broadcast grup WhatsApp. Informasi hilang dalam waktu 24 jam tanpa ada riwayat pencarian yang jelas.
          </p>
        </div>
        <div style="background: rgba(0,0,0,0.08); padding: 0.8rem 1.2rem; border-radius: 1rem; font-size: 0.85rem; font-weight: 800;">
          ⚠️ Banyak kandidat potensial terlewat info
        </div>
      </div>

      <!-- Card 02: Royal Purple -->
      <div class="card-purple" style="display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 15px 30px rgba(59,48,200,0.3);">
        <div>
          <div style="font-size: 4rem; font-weight: 900; line-height: 1; letter-spacing: -0.04em; margin-bottom: 1.5rem; color: #D4FF00;">
            02.
          </div>
          <div style="font-size: 1.5rem; font-weight: 900; margin-bottom: 1rem; color: #FFFFFF;">
            Format Lamar Membingungkan
          </div>
          <p style="font-size: 1rem; line-height: 1.6; color: #E0E7FF;">
            Ada flyer yang minta isi link Google Form/Bitly, ada yang minta chat WA HRD, ada yang kirim email, dan banyak yang wajib Walk-In fisik ke toko. Pelamar sering salah kirim berkas.
          </p>
        </div>
        <div style="background: rgba(255,255,255,0.15); padding: 0.8rem 1.2rem; border-radius: 1rem; font-size: 0.85rem; font-weight: 800; color: #FFFFFF;">
          ⚠️ HRD kelelahan melayani chat yang salah jalur
        </div>
      </div>

      <!-- Card 03: Soft Lavender / Deep Border -->
      <div class="card-lavender" style="display: flex; flex-direction: column; justify-content: space-between; border: 3px solid #3B30C8; background: #FAF9FF;">
        <div>
          <div style="font-size: 4rem; font-weight: 900; line-height: 1; letter-spacing: -0.04em; margin-bottom: 1.5rem; color: #3B30C8;">
            03.
          </div>
          <div style="font-size: 1.5rem; font-weight: 900; margin-bottom: 1rem; color: #0F172A;">
            Platform Korporat Tidak Cocok
          </div>
          <p style="font-size: 1rem; line-height: 1.6; color: #475569;">
            Platform nasional (JobStreet, Glints) terlalu mahal bagi UMKM daerah dan mewajibkan profil CV bahasa Inggris rumit yang menyulitkan posisi staf operasional, kasir, driver, atau sales.
          </p>
        </div>
        <div style="background: #EDEAF8; padding: 0.8rem 1.2rem; border-radius: 1rem; font-size: 0.85rem; font-weight: 800; color: #3B30C8;">
          ⚠️ UMKM lokal akhirnya kembali posting manual
        </div>
      </div>
    </div>

    <div class="slide-footer-meta">
      <div>Karmadi Pitch Deck 2026</div>
      <div>Slide 03 / 11</div>
    </div>
  </div>

  <!-- ==========================================
       SLIDE 4: THE SOLUTION OVERVIEW
       ========================================== -->
  <div class="slide" style="background: #F8FAFC;">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div class="title-section">SOLUSI TERPADU (THE SOLUTION)</div>
        <h2 class="title-large" style="color: #0F172A;">Karmadi: Platform Karir Pintar Serba Otomatis</h2>
      </div>
      <div class="badge-lime" style="font-size: 0.95rem; padding: 0.5rem 1.2rem;">
        Terintegrasi &amp; Siap Pakai
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1.1fr 1fr; gap: 2.5rem; align-items: center; margin-top: 1.5rem; flex: 1;">
      <!-- Left side: 3 Solution Feature Pills -->
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <div class="card-lavender" style="background: #FFFFFF; box-shadow: 0 10px 25px rgba(0,0,0,0.04);">
          <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
            <div style="background: #3B30C8; color: #FFFFFF; padding: 0.4rem 0.8rem; border-radius: 0.8rem; font-weight: 900; font-size: 0.9rem;">FITUR 01</div>
            <div style="font-size: 1.3rem; font-weight: 900; color: #0F172A;">AI Multimodal Poster Extraction</div>
          </div>
          <p style="font-size: 0.95rem; color: #64748B; line-height: 1.5;">
            Cukup unggah gambar flyer lowongan; AI membaca teks dan layout secara otomatis untuk mempublikasikan loker dalam &lt; 5 detik tanpa ketik manual.
          </p>
        </div>

        <div class="card-lavender" style="background: #FFFFFF; box-shadow: 0 10px 25px rgba(0,0,0,0.04);">
          <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
            <div style="background: #D4FF00; color: #0F172A; padding: 0.4rem 0.8rem; border-radius: 0.8rem; font-weight: 900; font-size: 0.9rem;">FITUR 02</div>
            <div style="font-size: 1.3rem; font-weight: 900; color: #0F172A;">Smart Application Routing</div>
          </div>
          <p style="font-size: 0.95rem; color: #64748B; line-height: 1.5;">
            Deteksi otomatis kanal pendaftaran: jika ada Bitly langsung membuka form; jika WA/Email membuka chat formal; jika Walk-In menampilkan alamat fisik secara jelas.
          </p>
        </div>

        <div class="card-lavender" style="background: #FFFFFF; box-shadow: 0 10px 25px rgba(0,0,0,0.04);">
          <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
            <div style="background: #0F172A; color: #FFFFFF; padding: 0.4rem 0.8rem; border-radius: 0.8rem; font-weight: 900; font-size: 0.9rem;">FITUR 03</div>
            <div style="font-size: 1.3rem; font-weight: 900; color: #0F172A;">Smart Cover Letter &amp; PDF Print</div>
          </div>
          <p style="font-size: 0.95rem; color: #64748B; line-height: 1.5;">
            Generator draf lamaran kerja profesional berbahasa Indonesia standar dan pembuatan dokumen surat fisik format resmi A4 PDF yang siap dicetak dalam 1 klik.
          </p>
        </div>
      </div>

      <!-- Right side: Visual Showcase -->
      <div style="background: #FFFFFF; border-radius: 2.5rem; padding: 1.5rem; box-shadow: 0 20px 40px rgba(59,48,200,0.12); border: 3px solid #E0E7FF; text-align: center;">
        <img src="${mockupImg}" style="width: 100%; height: 4.2in; object-fit: cover; border-radius: 1.8rem;" />
        <div style="display: flex; justify-content: space-around; margin-top: 1rem; font-size: 0.95rem; font-weight: 800; color: #3B30C8;">
          <span>💻 Mode Desktop (HRD)</span>
          <span>•</span>
          <span>📱 Mode Smartphone (Pelamar)</span>
        </div>
      </div>
    </div>

    <div class="slide-footer-meta">
      <div>Karmadi Pitch Deck 2026</div>
      <div>Slide 04 / 11</div>
    </div>
  </div>

  <!-- ==========================================
       SLIDE 5: FEATURE 1 - AI POSTER SCANNER
       ========================================== -->
  <div class="slide" style="background: #FFFFFF;">
    <div>
      <div class="title-section">CORE ENGINE 01</div>
      <h2 class="title-large" style="color: #0F172A;">AI Multimodal Poster Extraction</h2>
    </div>

    <div style="display: grid; grid-template-columns: 0.9fr 1.1fr; gap: 2.5rem; margin-top: 1.5rem; flex: 1; align-items: center;">
      <!-- Left: Real Sample Flyer (SPG Heaven Scent Madiun) -->
      <div style="background: #F8FAFC; border-radius: 2rem; padding: 1.2rem; border: 2px solid #E2E8F0; text-align: center;">
        <div style="font-size: 0.85rem; font-weight: 800; color: #3B30C8; text-transform: uppercase; margin-bottom: 0.8rem;">
          📸 Contoh Poster Flyer Asli dari UMKM Madiun
        </div>
        <img src="${spgImg}" style="max-height: 4.8in; max-width: 100%; border-radius: 1.2rem; box-shadow: 0 10px 25px rgba(0,0,0,0.1);" />
      </div>

      <!-- Right: AI Breakdown & JSON Output -->
      <div style="display: flex; flex-direction: column; gap: 1.2rem;">
        <div class="card-purple" style="padding: 1.5rem;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.8rem;">
            <span style="font-size: 1.1rem; font-weight: 800;">Ekstraksi Otomatis Gemini Vision AI</span>
            <span class="badge-lime" style="font-size: 0.75rem; padding: 0.3rem 0.8rem;">Kecepatan &lt; 3 Detik</span>
          </div>
          <p style="font-size: 0.95rem; line-height: 1.5; opacity: 0.9;">
            AI secara cerdas mendeteksi teks di dalam gambar tanpa memerlukan input manual berbelit:
          </p>
        </div>

        <div style="background: #0F172A; border-radius: 1.5rem; padding: 1.5rem; color: #F8FAFC; font-family: monospace; font-size: 0.9rem; line-height: 1.6; box-shadow: 0 15px 30px rgba(0,0,0,0.2);">
          <div style="color: #D4FF00; font-weight: 800; margin-bottom: 0.5rem;">// Hasil Output Terstruktur Sistem:</div>
          <div><span style="color: #93C5FD;">"posisi"</span>: <span style="color: #86EFAC;">"SPG (Sales Promotion Girl)"</span>,</div>
          <div><span style="color: #93C5FD;">"perusahaan"</span>: <span style="color: #86EFAC;">"Heaven Scent"</span>,</div>
          <div><span style="color: #93C5FD;">"lokasi"</span>: <span style="color: #86EFAC;">"Suncity Mall Madiun"</span>,</div>
          <div><span style="color: #93C5FD;">"gaji"</span>: <span style="color: #86EFAC;">"Rp 2.500.000 + Bonus"</span>,</div>
          <div><span style="color: #93C5FD;">"linkPendaftaran"</span>: <span style="color: #FDE047;">"https://bit.ly/LAMARHSJATENG"</span>,</div>
          <div><span style="color: #93C5FD;">"action"</span>: <span style="color: #F472B6;">"ROUTED_TO_FORM_BUTTON"</span></div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="card-lavender" style="padding: 1rem; text-align: center;">
            <div style="font-size: 1.8rem; font-weight: 900; color: #3B30C8;">95%</div>
            <div style="font-size: 0.8rem; font-weight: 700; color: #64748B;">Hemat Waktu Posting</div>
          </div>
          <div class="card-lavender" style="padding: 1rem; text-align: center;">
            <div style="font-size: 1.8rem; font-weight: 900; color: #16A34A;">0 Kesalahan</div>
            <div style="font-size: 0.8rem; font-weight: 700; color: #64748B;">Akurasi Link Pendaftaran</div>
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer-meta">
      <div>Karmadi Pitch Deck 2026</div>
      <div>Slide 05 / 11</div>
    </div>
  </div>

  <!-- ==========================================
       SLIDE 6: FEATURE 2 - SMART APPLICATION ROUTING
       ========================================== -->
  <div class="slide" style="background: #F8FAFC;">
    <div>
      <div class="title-section">CORE ENGINE 02</div>
      <h2 class="title-large" style="color: #0F172A;">Smart Application Routing</h2>
    </div>

    <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 2.5rem; margin-top: 1.5rem; flex: 1; align-items: center;">
      <!-- Left: 4 Smart Routing Channels -->
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <div class="card-lavender" style="background: #FFFFFF; display: flex; align-items: center; gap: 1.5rem;">
          <div style="width: 3rem; height: 3rem; border-radius: 1rem; background: #3B30C8; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; shrink: 0;">🔗</div>
          <div>
            <div style="font-size: 1.15rem; font-weight: 800; color: #0F172A;">1. Direct Web Form Detection</div>
            <div style="font-size: 0.9rem; color: #64748B;">Jika flyer memuat link Bit.ly / Google Form, tombol berubah otomatis menjadi <strong>"Isi Formulir Pendaftaran"</strong>.</div>
          </div>
        </div>

        <div class="card-lavender" style="background: #FFFFFF; display: flex; align-items: center; gap: 1.5rem;">
          <div style="width: 3rem; height: 3rem; border-radius: 1rem; background: #22C55E; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; shrink: 0;">💬</div>
          <div>
            <div style="font-size: 1.15rem; font-weight: 800; color: #0F172A;">2. Direct WhatsApp HRD</div>
            <div style="font-size: 0.9rem; color: #64748B;">Membuka chat WhatsApp HRD dengan format pesan perkenalan resmi tanpa perlu simpan kontak manual.</div>
          </div>
        </div>

        <div class="card-lavender" style="background: #FFFFFF; display: flex; align-items: center; gap: 1.5rem;">
          <div style="width: 3rem; height: 3rem; border-radius: 1rem; background: #2563EB; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; shrink: 0;">✉️</div>
          <div>
            <div style="font-size: 1.15rem; font-weight: 800; color: #0F172A;">3. Direct Email HRD</div>
            <div style="font-size: 0.9rem; color: #64748B;">Mempersiapkan email lamaran lengkap dengan subjek standar (<em>Lamaran - Posisi - Nama</em>) dan body surat.</div>
          </div>
        </div>

        <div class="card-lavender" style="background: #FFFBEB; border: 2px solid #F59E0B; display: flex; align-items: center; gap: 1.5rem;">
          <div style="width: 3rem; height: 3rem; border-radius: 1rem; background: #F59E0B; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; shrink: 0;">📍</div>
          <div>
            <div style="font-size: 1.15rem; font-weight: 800; color: #92400E;">4. Walk-In &amp; Datang Langsung Guard</div>
            <div style="font-size: 0.9rem; color: #78350F;">Menampilkan banner peringatan besar alamat toko/kantor dan tombol cetak surat fisik untuk pelamar.</div>
          </div>
        </div>
      </div>

      <!-- Right: Real Case Study (Bakeshop Bakery Walk-In) -->
      <div class="card-purple" style="box-shadow: 0 15px 35px rgba(59,48,200,0.25); text-align: center;">
        <div style="font-size: 0.9rem; font-weight: 800; color: #D4FF00; text-transform: uppercase; margin-bottom: 0.5rem;">Studi Kasus Riil: Walk-In</div>
        <div style="font-size: 1.25rem; font-weight: 900; margin-bottom: 1rem;">Bakeshop Bakery Madiun</div>
        <img src="${bakeshopImg}" style="max-height: 2.8in; border-radius: 1.2rem; box-shadow: 0 10px 20px rgba(0,0,0,0.2); margin-bottom: 1rem;" />
        <div style="background: rgba(255,255,255,0.15); padding: 0.8rem; border-radius: 1rem; font-size: 0.85rem; line-height: 1.4;">
          Instruksi flyer: <em>"Lamaran ditujukan ke H.A.Salim 128 Madiun"</em>.<br>
          <strong>Respon Sistem:</strong> Otomatis membuat banner Walk-In &amp; tombol cetak surat lamaran fisik A4!
        </div>
      </div>
    </div>

    <div class="slide-footer-meta">
      <div>Karmadi Pitch Deck 2026</div>
      <div>Slide 06 / 11</div>
    </div>
  </div>

  <!-- ==========================================
       SLIDE 7: FEATURE 3 - SMART COVER LETTER & PDF PRINT
       ========================================== -->
  <div class="slide" style="background: #FFFFFF;">
    <div>
      <div class="title-section">CORE ENGINE 03</div>
      <h2 class="title-large" style="color: #0F172A;">Smart Cover Letter &amp; Instant PDF Generator</h2>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; margin-top: 1.5rem; flex: 1; align-items: center;">
      <!-- Left: Problem & Solution in Cover Letter -->
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <div class="card-lime" style="box-shadow: 0 10px 25px rgba(212,255,0,0.3);">
          <div style="font-size: 1.25rem; font-weight: 900; margin-bottom: 0.5rem; color: #0F172A;">Solusi untuk Format Lamaran Berantakan</div>
          <p style="font-size: 0.95rem; line-height: 1.5; color: #1E293B;">
            Banyak pelamar lokal berkualitas yang ditolak hanya karena mengirim chat tidak sopan atau tidak tahu cara menyusun surat lamaran. Karmadi menyelesaikan friksi ini secara instan.
          </p>
        </div>

        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <div style="display: flex; align-items: flex-start; gap: 1rem;">
            <div style="background: #3B30C8; color: #FFFFFF; width: 2.2rem; height: 2.2rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; shrink: 0;">✓</div>
            <div>
              <div style="font-size: 1.1rem; font-weight: 800; color: #0F172A;">Bahasa Indonesia Baku &amp; Santun</div>
              <div style="font-size: 0.9rem; color: #64748B;">Format salam pembuka, perkenalan diri, dan penutup tersusun otomatis sesuai etika bisnis.</div>
            </div>
          </div>

          <div style="display: flex; align-items: flex-start; gap: 1rem;">
            <div style="background: #3B30C8; color: #FFFFFF; width: 2.2rem; height: 2.2rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; shrink: 0;">✓</div>
            <div>
              <div style="font-size: 1.1rem; font-weight: 800; color: #0F172A;">Draf WhatsApp Siap Kirim</div>
              <div style="font-size: 0.9rem; color: #64748B;">Tombol konfirmasi kirim langsung membuka WhatsApp dengan draft teks lengkap siap kirim.</div>
            </div>
          </div>

          <div style="display: flex; align-items: flex-start; gap: 1rem;">
            <div style="background: #3B30C8; color: #FFFFFF; width: 2.2rem; height: 2.2rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; shrink: 0;">✓</div>
            <div>
              <div style="font-size: 1.1rem; font-weight: 800; color: #0F172A;">Cetak Fisik Format Resmi A4 PDF</div>
              <div style="font-size: 0.9rem; color: #64748B;">Dilengkapi tanggal hari ini, tujuan HRD, perihal, dan tanda tangan pelamar siap cetak di tempat fotokopi.</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Document Mockup -->
      <div style="background: #F8FAFC; border: 3px solid #E2E8F0; border-radius: 2rem; padding: 2rem; box-shadow: 0 20px 40px rgba(0,0,0,0.08); font-family: 'Times New Roman', serif;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #E2E8F0; padding-bottom: 0.8rem; margin-bottom: 1.2rem; font-family: 'Plus Jakarta Sans', sans-serif;">
          <div style="font-weight: 800; color: #3B30C8; font-size: 0.95rem;">📄 Dokumen Resmi Hasil Unduhan:</div>
          <div style="background: #D4FF00; color: #0F172A; font-size: 0.75rem; font-weight: 800; padding: 0.3rem 0.8rem; border-radius: 9999px;">A4 Landscape / Portrait PDF</div>
        </div>

        <div style="font-size: 0.95rem; line-height: 1.6; color: #1E293B;">
          <div style="text-align: right; margin-bottom: 1rem; color: #64748B;">Madiun, 31 Oktober 2026</div>
          <div style="margin-bottom: 0.8rem;">
            <strong>Hal:</strong> Permohonan Lamaran Pekerjaan<br>
            <strong>Lampiran:</strong> 1 Berkas Dokumen
          </div>
          <div style="margin-bottom: 1rem;">
            Kepada Yth.<br>
            <strong>Pimpinan / HRD Bakeshop Bakery Madiun</strong><br>
            Jl. H.A. Salim No. 128, Madiun
          </div>
          <p style="font-size: 0.9rem; color: #334155; margin-bottom: 1rem;">
            Dengan hormat,<br>
            Sehubungan dengan informasi lowongan kerja yang saya peroleh melalui <strong>Karmadi</strong>, bersama surat ini saya bermaksud mengajukan diri untuk bergabung sebagai <strong>Baker</strong>...
          </p>
          <div style="text-align: right; margin-top: 1.5rem;">
            Hormat saya,<br><br>
            <strong>( Budi Santoso )</strong>
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer-meta">
      <div>Karmadi Pitch Deck 2026</div>
      <div>Slide 07 / 11</div>
    </div>
  </div>

  <!-- ==========================================
       SLIDE 8: MULTI-DEVICE EXPERIENCE (WEB & HP MODE)
       ========================================== -->
  <div class="slide" style="background: #F4F3FF;">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div class="title-section">MULTI-DEVICE EXPERIENCE</div>
        <h2 class="title-large" style="color: #0F172A;">Dua Mode Sempurna: Web Desktop &amp; Smartphone</h2>
      </div>
      <div class="badge-lime" style="font-size: 0.95rem; padding: 0.5rem 1.2rem;">
        100% Responsif &amp; Ringan
      </div>
    </div>

    <div style="margin-top: 1.5rem; flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center;">
      <div style="width: 100%; max-width: 13in; height: 5.2in; border-radius: 2.5rem; overflow: hidden; box-shadow: 0 25px 60px rgba(59,48,200,0.25); border: 6px solid #FFFFFF;">
        <img src="${mockupImg}" style="width: 100%; height: 100%; object-fit: cover; object-position: center;" />
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; width: 100%; max-width: 13in; margin-top: 1.2rem;">
        <div class="card-lavender" style="background: #FFFFFF; display: flex; align-items: center; gap: 1.2rem; padding: 1.2rem 1.8rem;">
          <div style="width: 3rem; height: 3rem; border-radius: 1rem; background: #3B30C8; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">💻</div>
          <div>
            <div style="font-size: 1.15rem; font-weight: 800; color: #0F172A;">Mode Web (Desktop / Laptop)</div>
            <div style="font-size: 0.9rem; color: #64748B;">Dirancang khusus untuk HRD &amp; pemilik bisnis: multi-kolom luas, filter kategori chip, dan pratinjau flyer resolusi tinggi.</div>
          </div>
        </div>

        <div class="card-lavender" style="background: #FFFFFF; display: flex; align-items: center; gap: 1.2rem; padding: 1.2rem 1.8rem;">
          <div style="width: 3rem; height: 3rem; border-radius: 1rem; background: #D4FF00; color: #0F172A; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">📱</div>
          <div>
            <div style="font-size: 1.15rem; font-weight: 800; color: #0F172A;">Mode HP (Mobile Smartphone)</div>
            <div style="font-size: 0.9rem; color: #64748B;">Dirancang ramah jempol untuk pencari kerja: load super cepat, hemat kuota internet, dan terintegrasi langsung ke WhatsApp HP.</div>
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer-meta">
      <div>Karmadi Pitch Deck 2026</div>
      <div>Slide 08 / 11</div>
    </div>
  </div>

  <!-- ==========================================
       SLIDE 9: BUSINESS MODEL & MONETIZATION
       ========================================== -->
  <div class="slide" style="background: #FFFFFF;">
    <div>
      <div class="title-section">MODEL BISNIS &amp; MONETISASI</div>
      <h2 class="title-large" style="color: #0F172A;">Potensi Pendapatan Berkelanjutan yang Terbukti</h2>
    </div>

    <div class="grid-4" style="margin-top: 2rem; flex: 1; align-items: stretch;">
      <!-- Stream 1 -->
      <div class="card-purple" style="display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 15px 30px rgba(59,48,200,0.25);">
        <div>
          <div style="width: 3.5rem; height: 3.5rem; border-radius: 1rem; background: #D4FF00; color: #0F172A; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; margin-bottom: 1.2rem;">⭐</div>
          <div style="font-size: 1.3rem; font-weight: 900; margin-bottom: 0.8rem;">1. Featured &amp; Pin Loker</div>
          <p style="font-size: 0.95rem; line-height: 1.5; color: #E0E7FF;">
            Penempatan lowongan di baris teratas dengan lencana "Prioritas / Urgent" agar segera dilamar kandidat terbaik.
          </p>
        </div>
        <div style="background: rgba(255,255,255,0.15); padding: 0.8rem 1rem; border-radius: 1rem; font-size: 0.9rem; font-weight: 800; color: #D4FF00; margin-top: 1rem;">
          Rp 50.000 – 150.000 / loker
        </div>
      </div>

      <!-- Stream 2 -->
      <div class="card-lime" style="display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 15px 30px rgba(212,255,0,0.3);">
        <div>
          <div style="width: 3.5rem; height: 3.5rem; border-radius: 1rem; background: #0F172A; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; margin-bottom: 1.2rem;">🛡️</div>
          <div style="font-size: 1.3rem; font-weight: 900; margin-bottom: 0.8rem;">2. Verified Employer</div>
          <p style="font-size: 0.95rem; line-height: 1.5; color: #1E293B;">
            Langganan bulanan bagi UMKM untuk mendapatkan centang biru resmi, posting tanpa batas, dan dashboard analitik pelamar.
          </p>
        </div>
        <div style="background: rgba(0,0,0,0.08); padding: 0.8rem 1rem; border-radius: 1rem; font-size: 0.9rem; font-weight: 800; color: #0F172A; margin-top: 1rem;">
          SaaS Bulanan UMKM
        </div>
      </div>

      <!-- Stream 3 -->
      <div class="card-lavender" style="display: flex; flex-direction: column; justify-content: space-between; border: 2px solid #E0E7FF; background: #FAF9FF;">
        <div>
          <div style="width: 3.5rem; height: 3.5rem; border-radius: 1rem; background: #3B30C8; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; margin-bottom: 1.2rem;">👥</div>
          <div style="font-size: 1.3rem; font-weight: 900; margin-bottom: 0.8rem; color: #0F172A;">3. Talent Sourcing Fee</div>
          <p style="font-size: 0.95rem; line-height: 1.5; color: #64748B;">
            Jasa pra-seleksi dan kurasi kandidat siap kerja bagi pemilik toko/klinik yang tidak punya staf HRD internal.
          </p>
        </div>
        <div style="background: #EDEAF8; padding: 0.8rem 1rem; border-radius: 1rem; font-size: 0.9rem; font-weight: 800; color: #3B30C8; margin-top: 1rem;">
          Success Fee per Rekrutmen
        </div>
      </div>

      <!-- Stream 4 -->
      <div class="card-lavender" style="display: flex; flex-direction: column; justify-content: space-between; border: 2px solid #E0E7FF; background: #FAF9FF;">
        <div>
          <div style="width: 3.5rem; height: 3.5rem; border-radius: 1rem; background: #0F172A; color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; margin-bottom: 1.2rem;">📢</div>
          <div style="font-size: 1.3rem; font-weight: 900; margin-bottom: 0.8rem; color: #0F172A;">4. Iklan Pelatihan Lokal</div>
          <p style="font-size: 0.95rem; line-height: 1.5; color: #64748B;">
            Slot banner iklan untuk LPK (Lembaga Pelatihan Kerja), kursus bahasa, sertifikasi barista, dan sejenisnya di Madiun.
          </p>
        </div>
        <div style="background: #EDEAF8; padding: 0.8rem 1rem; border-radius: 1rem; font-size: 0.9rem; font-weight: 800; color: #0F172A; margin-top: 1rem;">
          Slot Sponsor Banner
        </div>
      </div>
    </div>

    <div class="slide-footer-meta">
      <div>Karmadi Pitch Deck 2026</div>
      <div>Slide 09 / 11</div>
    </div>
  </div>

  <!-- ==========================================
       SLIDE 10: COMPETITIVE MATRIX
       ========================================== -->
  <div class="slide" style="background: #F8FAFC;">
    <div>
      <div class="title-section">ANALISIS PASAR &amp; KOMPETISI</div>
      <h2 class="title-large" style="color: #0F172A;">Keunggulan Kompetitif Karmadi</h2>
    </div>

    <div style="margin-top: 1.8rem; flex: 1; display: flex; flex-direction: column; justify-content: center;">
      <table style="width: 100%; border-collapse: separate; border-spacing: 0 0.8rem; font-size: 1.05rem;">
        <thead>
          <tr style="text-align: left; color: #64748B; font-weight: 800;">
            <th style="padding: 0.8rem 1.5rem;">Fitur / Parameter</th>
            <th style="padding: 0.8rem 1.5rem;">Instagram / FB Medsos</th>
            <th style="padding: 0.8rem 1.5rem;">JobStreet / Glints</th>
            <th style="padding: 0.8rem 1.5rem; background: #3B30C8; color: #FFFFFF; border-radius: 1.2rem 1.2rem 0 0;">Karmadi (Platform Kita)</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background: #FFFFFF; box-shadow: 0 4px 10px rgba(0,0,0,0.02);">
            <td style="padding: 1rem 1.5rem; font-weight: 800; border-radius: 1rem 0 0 1rem;">Fokus Wilayah</td>
            <td style="padding: 1rem 1.5rem; color: #64748B;">Lokal tapi berserakan</td>
            <td style="padding: 1rem 1.5rem; color: #64748B;">Nasional (kota besar)</td>
            <td style="padding: 1rem 1.5rem; font-weight: 900; color: #3B30C8; background: #EEF2FF; border-left: 3px solid #3B30C8; border-right: 3px solid #3B30C8;">100% Hyperlokal Madiun Raya</td>
          </tr>
          <tr style="background: #FFFFFF; box-shadow: 0 4px 10px rgba(0,0,0,0.02);">
            <td style="padding: 1rem 1.5rem; font-weight: 800; border-radius: 1rem 0 0 1rem;">Kecepatan Input Loker</td>
            <td style="padding: 1rem 1.5rem; color: #64748B;">Manual screenshot</td>
            <td style="padding: 1rem 1.5rem; color: #64748B;">Form rumit (15-20 menit)</td>
            <td style="padding: 1rem 1.5rem; font-weight: 900; color: #3B30C8; background: #EEF2FF; border-left: 3px solid #3B30C8; border-right: 3px solid #3B30C8;">&lt; 5 Detik dengan AI Vision</td>
          </tr>
          <tr style="background: #FFFFFF; box-shadow: 0 4px 10px rgba(0,0,0,0.02);">
            <td style="padding: 1rem 1.5rem; font-weight: 800; border-radius: 1rem 0 0 1rem;">Barrier untuk Pelamar</td>
            <td style="padding: 1rem 1.5rem; color: #64748B;">DM / Chat tanpa struktur</td>
            <td style="padding: 1rem 1.5rem; color: #EF4444; font-weight: 700;">Wajib CV bahasa Inggris</td>
            <td style="padding: 1rem 1.5rem; font-weight: 900; color: #16A34A; background: #EEF2FF; border-left: 3px solid #3B30C8; border-right: 3px solid #3B30C8;">Zero-Barrier (Langsung Lamar)</td>
          </tr>
          <tr style="background: #FFFFFF; box-shadow: 0 4px 10px rgba(0,0,0,0.02);">
            <td style="padding: 1rem 1.5rem; font-weight: 800; border-radius: 1rem 0 0 1rem;">Dukungan Loker Walk-In</td>
            <td style="padding: 1rem 1.5rem; color: #64748B;">Hanya info teks flyer</td>
            <td style="padding: 1rem 1.5rem; color: #EF4444; font-weight: 700;">Tidak didukung</td>
            <td style="padding: 1rem 1.5rem; font-weight: 900; color: #3B30C8; background: #EEF2FF; border-left: 3px solid #3B30C8; border-right: 3px solid #3B30C8;">Didukung + Cetak PDF A4</td>
          </tr>
          <tr style="background: #FFFFFF; box-shadow: 0 4px 10px rgba(0,0,0,0.02);">
            <td style="padding: 1rem 1.5rem; font-weight: 800; border-radius: 1rem 0 0 1rem;">Dukungan WhatsApp &amp; Form</td>
            <td style="padding: 1rem 1.5rem; color: #64748B;">Manual salin nomor</td>
            <td style="padding: 1rem 1.5rem; color: #EF4444; font-weight: 700;">Dipaksa apply di dalam app</td>
            <td style="padding: 1rem 1.5rem; font-weight: 900; color: #3B30C8; background: #EEF2FF; border-radius: 0 0 1.2rem 1.2rem; border-left: 3px solid #3B30C8; border-right: 3px solid #3B30C8; border-bottom: 3px solid #3B30C8;">Auto-routing ke WA, Form &amp; Email</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="slide-footer-meta">
      <div>Karmadi Pitch Deck 2026</div>
      <div>Slide 10 / 11</div>
    </div>
  </div>

  <!-- ==========================================
       SLIDE 11: CLOSING / CALL TO ACTION (Desain "Thank You" Canva Template)
       ========================================== -->
  <div class="slide" style="background: #3B30C8; color: #FFFFFF;">
    <!-- Top Bar inside Purple Slide -->
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div class="top-logo-badge">
        <img src="${logoImg}" style="height: 3.2rem; width: auto; border-radius: 0.8rem; background: #FFFFFF; padding: 0.2rem;" />
        <div style="font-size: 1.6rem; font-weight: 900; color: #FFFFFF;">Karmadi</div>
      </div>
      <div class="badge-lime" style="font-size: 0.9rem; padding: 0.5rem 1.2rem;">
        Kemitraan Terbuka 2026
      </div>
    </div>

    <!-- Center Content -->
    <div style="display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 3rem; align-items: center; margin-top: 1rem; flex: 1;">
      <div>
        <h1 class="title-giant" style="color: #FFFFFF; margin-bottom: 1.5rem;">
          Terima Kasih.<br>
          <span style="color: #D4FF00;">Mari Tumbuh Bersama.</span>
        </h1>
        <p style="font-size: 1.25rem; line-height: 1.6; color: #E0E7FF; max-width: 90%; margin-bottom: 2rem;">
          Aplikasi Karmadi sudah 100% siap pakai dan siap didemokan langsung di depan Anda. Buka akses kesempatan kerja yang lebih luas bagi ribuan masyarakat di Karesidenan Madiun.
        </p>

        <div style="display: flex; gap: 1.2rem;">
          <div class="badge-lime" style="font-size: 1.1rem; padding: 0.8rem 1.8rem;">
            Jadwalkan Live Demo
            <span class="btn-circle">→</span>
          </div>
        </div>
      </div>

      <!-- Right Photo Frame with Asymmetric Border Radius -->
      <div style="position: relative;">
        <div style="width: 100%; height: 4.8in; border-radius: 4rem 2rem 4rem 2rem; overflow: hidden; border: 6px solid #FFFFFF; box-shadow: 0 30px 60px rgba(0,0,0,0.4);">
          <img src="${mockupImg}" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
        <div style="position: absolute; bottom: 1.5rem; right: -1.5rem; background: #D4FF00; color: #0F172A; padding: 1.2rem 1.8rem; border-radius: 1.8rem; font-weight: 900; font-size: 1.1rem; box-shadow: 0 15px 30px rgba(0,0,0,0.3);">
          ⚡ Siap Digunakan Sekarang
        </div>
      </div>
    </div>

    <!-- Bottom Meta -->
    <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 0.3in; border-top: 1px solid rgba(255,255,255,0.2); font-size: 0.95rem; font-weight: 700; color: #CBD5E1;">
      <div>Website: <strong style="color: #FFFFFF;">localhost:5173</strong></div>
      <div>Platform: <strong style="color: #FFFFFF;">Karmadi - Info Loker Karesidenan Madiun</strong></div>
      <div>Status: <span style="color: #D4FF00; font-weight: 900;">Production Ready</span></div>
    </div>
  </div>

</body>
</html>
`;

const htmlFilePath = path.join(__dirname, 'presentation.html');
fs.writeFileSync(htmlFilePath, htmlContent, 'utf-8');
console.log('HTML presentation generated at:', htmlFilePath);

// Target PDF outputs
const outputPdfPath = 'c:/Users/USER/Downloads/SICAKER/Karmadi_Pitch_Deck.pdf';
const artifactPdfPath = 'C:/Users/USER/.gemini/antigravity/brain/dfaecf15-343e-408f-8c40-7193143ef936/Karmadi_Pitch_Deck.pdf';

const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const fileUri = 'file:///' + htmlFilePath.replace(/\\/g, '/');

console.log('Rendering PDF via Chrome Headless...');
const chromeCmd = '"' + chromePath + '" --headless=new --disable-gpu --no-sandbox --no-pdf-header-footer --print-to-pdf="' + outputPdfPath + '" "' + fileUri + '"';

try {
  execSync(chromeCmd, { stdio: 'inherit' });
  console.log('Primary PDF created at:', outputPdfPath);
  fs.copyFileSync(outputPdfPath, artifactPdfPath);
  console.log('Artifact PDF copied to:', artifactPdfPath);
  console.log('PDF generation finished successfully!');
} catch (err) {
  console.error('Error generating PDF:', err.message);
  process.exit(1);
}
