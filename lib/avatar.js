import sharp from 'sharp';

async function download(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.183 Safari/537.36'
    }
  });
  const arrayBuf = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuf);

  const output = await sharp(buffer)
    .resize(96, 96)
    .jpeg()
    .toBuffer();
  return output.toString('base64');
}

export default download;
