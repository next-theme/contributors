import fs from 'fs';
import download from './lib/avatar.js';
import image from './lib/image.js';

async function request(repo, query = '') {
  const res = await fetch(`https://api.github.com/repos/${repo}/contributors?per_page=100${query}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1.1 Safari/605.1.15'
    }
  });
  const data = await res.json();
  console.log("Request", repo, query, data.length);

  // If more than 100 contributors, find them in the next page
  const linkHeader = res.headers.get('link');
  if (linkHeader) {
    const links = linkHeader.split(',').reduce((acc, link) => {
      const match = link.match(/<([^>]+)>; rel="([^"]+)"/);
      if (match) acc[match[2]] = match[1];
      return acc;
    }, {});
    if (links.next) {
      return [data, links.next];
    }
  }
  return [data, null];
}

function parse(contributors) {
  const db = [];
  contributors.forEach(({ login, avatar_url, type, contributions }) => {
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

  const iissnanIndex = db.findIndex(user => user.login === 'iissnan');
  const iissnan = iissnanIndex > -1 ? db.splice(iissnanIndex, 1)[0] : null;

  const ivanNginxIndex = db.findIndex(user => user.login === 'ivan-nginx');
  const ivanNginx = ivanNginxIndex > -1 ? db.splice(ivanNginxIndex, 1)[0] : null;

  db.sort((a, b) => b.contributions - a.contributions);

  if (ivanNginx) db.unshift(ivanNginx);
  if (iissnan) db.unshift(iissnan);

  Promise.all(db.map(data => download(data.avatar_url))).then(avatars => {
    avatars.forEach((avatar, index) => {
      db[index].avatar = avatar;
      fs.writeFileSync('./contributors.svg', image(db));
    });
  })
  .catch(error => {
    console.error(error);
  });
}

async function main() {
  const repos = [
    'iissnan/hexo-theme-next',
    'theme-next/hexo-theme-next',
    'next-theme/hexo-theme-next'
  ];
  const contributors = [];
  for (let repo of repos) {
    let data, next;
    do {
      [data, next] = await request(repo, next ? `&${next.split('?')[1]}` : '');
      contributors.push(...data);
    } while (next);
  }
  console.log(contributors.length);
  parse(contributors);
}

main();
