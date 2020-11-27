const http = require('http');

const PORT = 3000;

const server = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.write(`<html>`);
    res.write(`<head><title>First page</title></head>`);
    res.write(`<body><h2>Hello form the node js server</h2></body>`);
    res.write(`</html>`);
    res.end();
});

server.listen(PORT);
