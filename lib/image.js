function image(db) {
  const row = 17;
  const defs = [];
  const images = [];
  db.forEach(({ login, avatar }, index) => {
    const x = (index % row) * 51 + 3;
    const cx = x + 24;
    const y = Math.floor(index / row) * 51 + 3;
    const cy = y + 24;
    defs.push(`
      <clipPath id="clip-${index}">
        <circle cx="${cx}" cy="${cy}" r="24"/>
      </clipPath>`);
    images.push(`<a xlink:href="https://github.com/${login}" class="opencollective-svg" target="_blank" id="${login}"><image x="${x}" y="${y}" width="48" height="48" xlink:href="data:image/jpg;base64,${avatar}" clip-path="url(#clip-${index})"/></a>`);
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="890" height="${Math.ceil(db.length / row) * 51 + 3}">
    <defs>
      ${defs.join('')}.join('')
    </defs>
    <style>.opencollective-svg { cursor: pointer; }</style>
    ${images.join('')}
  </svg>`;
}

module.exports = image;
