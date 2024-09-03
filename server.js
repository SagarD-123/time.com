const http = require('http');
const https = require('https');

// Config
const PORT = 3000;
const TARGET_URL = 'https://time.com';
const MAX_STORIES = 6;

// Create server
const server = http.createServer(handleRequest);

// Main request handler
function handleRequest(req, res) {
  if (req.url === '/getTimeStories' && req.method === 'GET') {
    fetchTimeStories(res);
  } else {
    sendNotFound(res);
  }
}

// Fetch stories from Time.com
function fetchTimeStories(res) {
  https.get(TARGET_URL, (response) => {
    let rawData = '';
    response.on('data', chunk => { rawData += chunk; });
    response.on('end', () => processTimeData(rawData, res));
  }).on('error', err => handleFetchError(err, res));
}

// Process the fetched HTML data
function processTimeData(htmlData, res) {
  try {
    const stories = parseStories(htmlData);
    sendJsonResponse(res, 200, stories);
  } catch (err) {
    console.error('Error parsing stories:', err);
    sendJsonResponse(res, 500, { error: 'Failed to parse stories' });
  }
}

// Parse HTML to extract stories
function parseStories(html) {
  const storyPattern = /<li class="latest-stories__item">\s*<a href="([^"]+)">\s*<h3 class="latest-stories__item-headline">([^<]+)<\/h3>/g;
  const stories = [];
  let match;

  while ((match = storyPattern.exec(html)) !== null && stories.length < MAX_STORIES) {
    stories.push({
      title: match[2].trim(),
      link: TARGET_URL + match[1]
    });
  }

  return stories;
}

// Helper function to send JSON response
function sendJsonResponse(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

// Handle 404 Not Found
function sendNotFound(res) {
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('404 Not Found');
}

// Handle fetch errors
function handleFetchError(err, res) {
  console.error('Error fetching from Time.com:', err);
  sendJsonResponse(res, 500, { error: 'Failed to fetch stories' });
}

// Start server
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// get the output on http://localhost:3000/getTimeStories