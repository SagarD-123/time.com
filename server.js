const http = require('http');
const https = require('https');

const server = http.createServer((req, res) => {
  if (req.url === '/getTimeStories' && req.method === 'GET') {
    https.get('https://time.com', (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        const stories = extractStories(data);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(stories));
      });

    }).on('error', (err) => {
      console.error('Error fetching stories:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to fetch stories' }));
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
});

function extractStories(html) {
  const stories = [];
  const storyRegex = /<li class="latest-stories__item">\s*<a href="([^"]+)">\s*<h3 class="latest-stories__item-headline">([^<]+)<\/h3>/g;
  
  let match;
  while ((match = storyRegex.exec(html)) !== null && stories.length < 6) {
    stories.push({
      title: match[2],
      link: `https://time.com${match[1]}`
    });
  }

  return stories;
}

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});