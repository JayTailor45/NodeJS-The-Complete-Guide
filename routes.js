const requestHandler = (req, res) => {

    const url = req.url;
    const method = req.method;

    if (url === '/') {
        res.setHeader('Content-Type', 'text/html');
        res.write(`<html>`);
        res.write(`<head><title>Hello World!</title></head>`);
        res.write(`<body><h3>Hello World!</h3><form action="/create-user" method="POST"><input type="text" name="user"><button type="submit">Send</button></form></body>`);
        res.write(`</html>`);
        return res.end();
    }
    if (url === '/users') {
        res.setHeader('Content-Type', 'text/html');
        res.write(`<html>`);
        res.write(`<head><title>Users</title></head>`);
        res.write(`<body><ul><li>Jay</li><li>Jhon Doe</li></ul></body>`);
        res.write(`</html>`);
        return res.end();
    }
    if (url === '/create-user' && method === 'POST') {
        const body = [];
        req.on('data', (chunk) => {
            body.push(chunk);
        });
        return req.on('end', () => {
            const parsedBody = Buffer.concat(body).toString();
            const username = parsedBody.split('=')[1];
            console.log(`User : ${username}`)
            res.statusCode = 302;
            res.setHeader('Location', '/');
            return res.end();
        });
    }
    res.setHeader('Content-Type', 'text/html');
    res.write(`<html>`);
    res.write(`<head><title>First page</title></head>`);
    res.write(`<body><h2>Hello form the node js server</h2></body>`);
    res.write(`</html>`);
    res.end();
};

module.exports = requestHandler;
