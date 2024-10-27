const { program } = require('commander');
const http = require("http")
const fs = require('fs').promises;
const path = require('path');
const superagent = require('superagent');

program
.requiredOption("-h, --host <host>, the server's adress")
.requiredOption("-p, --port <port>, the server's port")
.requiredOption("-c, --cache <cache>, the way to cashe files")
.parse(process.argv);

const options = program.opts();

const server = http.createServer(requestListener);

server.listen(options.port, options.host, () => {
    console.log(`Server workink at http://${options.host}:${options.port}/`);
});