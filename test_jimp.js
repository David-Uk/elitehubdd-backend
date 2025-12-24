import { Jimp } from 'jimp';

console.log('Jimp imported successfully');
try {
  if (typeof Jimp.read === 'function') {
    console.log('Jimp.read is available');
  } else {
    console.log('Jimp.read is NOT available. Keys:', Object.keys(Jimp));
  }
} catch (e) {
  console.error(e);
}
