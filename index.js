const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

const GITHUB_REPO_URL = 'https://raw.githubusercontent.com/Rahmat1320/Fastest-Osm/main'; // Replace with your GitHub repo URL
const CDN_URL = 'http://ubistatic-a.akamaihd.net/0098/79875413'; // Replace with your CDN URL

const server = http.createServer((req, res) => {
    if (req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Nothing');
    } else {
        const filePath = path.join(__dirname, req.url);
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                // File not found locally, fetch from GitHub
                const githubFileUrl = `${GITHUB_REPO_URL}${req.url}`;
                https.get(githubFileUrl, (githubRes) => {
                    if (githubRes.statusCode === 200) {
                        const contentType = req.url.endsWith('.xml') ? 'application/xml' : 'application/octet-stream';
                        res.writeHead(200, { 'Content-Type': contentType });
                        githubRes.pipe(res);
                    } else {
                        // File not found on GitHub, fetch from CDN
                        const cdnFileUrl = `${CDN_URL}${req.url}`;
                        https.get(cdnFileUrl, (cdnRes) => {
                            if (cdnRes.statusCode === 200) {
                                const contentType = req.url.endsWith('.xml') ? 'application/xml' : 'application/octet-stream';
                                res.writeHead(200, { 'Content-Type': contentType });
                                cdnRes.pipe(res);
                            } else {
                                res.writeHead(404, { 'Content-Type': 'text/plain' });
                                res.end('Not Found');
                            }
                        }).on('error', () => {
                            res.writeHead(500, { 'Content-Type': 'text/plain' });
                            res.end('Error fetching file from CDN');
                        });
                    }
                }).on('error', () => {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Error fetching file from GitHub');
                });
            } else {
                // Serve file locally
                const contentType = req.url.endsWith('.xml') ? 'application/xml' : 'application/octet-stream';
                res.writeHead(200, { 'Content-Type': contentType });
                const fileStream = fs.createReadStream(filePath);
                fileStream.pipe(res);
            }
        });
    }
});

server.listen(5, '0.0.0.0', () => {
    console.log('Online port 5');
});
