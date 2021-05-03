import https from 'https';
import fs from 'fs';
import download from './lib/avatar.js';
import image from './lib/image.js';

function request(repo, query = '') {
  return new Promise((resolve, reject) => {
    https.get(`https://api.github.com/repos/${repo}/contributors?per_page=100${query}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.183 Safari/537.36'
      }
    }, res => {
      let data = '';
      res.on('data', chunk => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode === 200) {
          data = JSON.parse(data);
          resolve(data);
        }
      });
    }).on('error', err => {
      console.error('Failded to download release messages.');
      reject(err);
    });
  });
}

const repos = [
  ['iissnan/hexo-theme-next'],
  ['iissnan/hexo-theme-next', '&page=2'],
  ['theme-next/hexo-theme-next'],
  ['next-theme/hexo-theme-next']
].map(repo => request(...repo));

function parse() {
  Promise.all(repos).then(values => {
    console.log(values);
    values.forEach(value => {
      console.log(value.length);
    });
    const db = [];
    values.flat().forEach(({ login, avatar_url, type, contributions }) => {
      if (type === 'Bot') return;
      const target = db.find(item => item.login === login);
      if (!target) {
        db.push({
          login,
          avatar_url,
          contributions
        });
      } else {
        target.contributions += contributions;
      }
    });
    db.sort((a, b) => b.contributions - a.contributions);
    console.log(db, Object.keys(db).length);
    Promise.all(db.map(data => download(data.avatar_url))).then(avatars => {
      avatars.forEach((avatar, index) => {
        db[index].avatar = avatar;
        fs.writeFileSync('./cache/db.json', JSON.stringify(db));
        fs.writeFileSync('./contributors.svg', image(db));
      });
    })
    .catch(error => {
      console.error(error);
    });
  })
  .catch(error => {
    console.error(error);
  });
}

parse();
