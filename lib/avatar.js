const https = require('https');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

function resizer() {
  return sharp()
    .resize(96, 96)
    .jpeg();
}

const roundedCorners = Buffer.from(
  '<svg><rect x="0" y="0" width="96" height="96" rx="48" ry="48"/></svg>'
);

const resizerRounded =
  sharp()
    .resize(96, 96)
    .composite([{
      input: roundedCorners,
      blend: 'dest-in'
    }])
    .png();

function download(url) {
  return new Promise((resolve, reject) => {
    const file = path.resolve(__dirname, '../cache', `${url.split('/u/')[1].split('?v=4')[0]}.jpg`);
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.183 Safari/537.36'
      }
    }, res => {
      const chunks = [];
      res
        .pipe(resizer())
        .on('data', function(chunk) {
          chunks.push(chunk);
          console.log('chunk:', chunk.length);
        })
        .on('end', function() {
          const result = Buffer.concat(chunks);
          fs.writeFileSync(file, result);
          resolve(result.toString('base64'));
        })
        .on('error', error => {
          reject(error);
        });
    }).on('error', err => {
      console.error('Failded to download avatar.');
      reject(err);
    });
  });
}

module.exports = download;
