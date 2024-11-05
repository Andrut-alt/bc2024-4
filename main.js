const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const { program } = require('commander');
const superagent = require('superagent');

program
  .requiredOption('-h, --host <host>', 'Адреса сервера')
  .requiredOption('-p, --port <port>', 'Порт сервера')
  .requiredOption('-c, --cache <cache>', 'Шлях до кешу')
  .parse(process.argv);

const options = program.opts();

const server = http.createServer(async (req, res) => {
    const urlParts = req.url.split('/');
    const httpCode = urlParts[1];
    const imagePath = path.join(options.cache, `${httpCode}.jpg`);

    if (req.method === 'GET') {
        try {
            const image = await fs.readFile(imagePath); // Спробуйте прочитати зображення з кешу
            res.writeHead(200, { 'Content-Type': 'image/jpeg' });
            res.end(image); // Відправте зображення, якщо воно знайдено
        } catch (error) {
            try {
                // Якщо файл не знайдено у кеші, робимо запит на http.cat
                const response = await superagent.get(`https://http.cat/${httpCode}`);
                const image = response.body;

                // Зберігаємо отримане зображення у кеш
                await fs.writeFile(imagePath, image);

                res.writeHead(200, { 'Content-Type': 'image/jpeg' });
                res.end(image); // Відправляємо зображення з http.cat
            } catch (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Image not found');
            }
        }
    } else if (req.method === 'PUT') {
        try {
            // Перевіряємо, чи є дані в тілі запиту
            const data = await new Promise((resolve, reject) => {
                const chunks = [];
                req.on('data', chunk => chunks.push(chunk));
                req.on('end', () => resolve(Buffer.concat(chunks)));
                req.on('error', reject);
            });

            if (data.length > 0) {
                // Якщо дані надійшли, зберігаємо їх у кеш
                await fs.writeFile(imagePath, data);
                res.writeHead(201, { 'Content-Type': 'text/plain' });
                res.end('Image saved');
            } else {
                // Якщо дані не надійшли, робимо запит на http.cat
                const response = await superagent.get(`https://http.cat/${httpCode}`);
                const image = response.body;

                // Зберігаємо отримане зображення у кеш
                await fs.writeFile(imagePath, image);

                res.writeHead(201, { 'Content-Type': 'image/jpeg' });
                res.end(image);
            }
        } catch (error) {
            console.error('Error saving image:', error); // Логування помилки
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Error saving image');
        }
    } else if (req.method === 'DELETE') {
        try {
            await fs.unlink(imagePath);
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Image deleted');
        } catch (error) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Image not found');
        }
    } else {
        res.writeHead(405, { 'Content-Type': 'text/plain' });
        res.end('Method not allowed');
    }
});

server.listen(options.port, options.host, () => {
    console.log(`Server running at http://${options.host}:${options.port}/`);
});
