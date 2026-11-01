import { createWorker } from 'tesseract.js';
import fs from 'fs';

const files = [
  'C:/Users/USER/Pictures/Capture12.PNG',
  'C:/Users/USER/Pictures/Capture13.PNG',
  'C:/Users/USER/Pictures/Capture14.PNG',
  'C:/Users/USER/Pictures/Capture17.PNG'
];

async function run() {
  const worker = await createWorker('ind+eng');
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const ret = await worker.recognize(f);
    console.log(`\n=================== FILE ${i + 1}: ${f} ===================`);
    console.log(ret.data.text);
  }
  await worker.terminate();
}

run();
