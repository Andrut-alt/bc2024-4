const { program } = require('commander');
const http = require("http")
const fs = require('fs').promises;
const path = require('path');
const superagent = require('superagent');

program
.requiredOption("-h, --host <host>, the server's adress")
.requiredOption("-p, --port <port>, the server's port")
.requiredOption("-c, --cache <cache>, the way to caсhe files")
.parse(process.argv);

const options = program.opts();

async function requestListener(req, res) {
    const urlParts = req.url.split('/');
    const code = urlParts[1];
    const filePath = `${cache}/${code}.jpg`;

    switch (req.method) {
        case 'GET':
            try {                    
                const image = await fs.readFile(filePath); // Спробуйте прочитати зображення з кешу
                res.writeHead(200, { 'Content-Type': 'image/jpeg' });
                res.end(image); // Надіслати зображення, якщо знайдено
            } catch (error) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Image not found'); // Повернути повідомлення про те, що не знайдено
            }
            break;

        







const server = http.createServer(requestListener);

server.listen(options.port, options.host, () => {
    console.log(`Server workink at http://${options.host}:${options.port}/`);
});