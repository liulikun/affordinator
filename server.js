var fs = require('fs'),
        http = require('http'),
        https = require('https'),
        url = require('url'),
        querystring = require('querystring'),
        PORT = 8090,
        BASE_DIR = ".";

http.createServer(
        function(req, resp) {
            var file = BASE_DIR + req.url,
                    contentType = file.match(/html$/) ? 'text/html' : 'text/plain';
            console.log(file);
            if (file == './tags') {
                resp.writeHeader(200, {"Content-Type":contentType});
                resp.write(JSON.stringify(BUCKET.slice(BUCKET.length - TAG_BATCH_SIZE)));
                resp.end();
            } else {
                fs.readFile(file, function (err, data) {
                    if (err) {
                        console.log(err);
                        resp.writeHeader(500, {"Content-Type": "text/plain"});
                        resp.write(err + "\n");
                        resp.end();
                    } else {
                        resp.writeHeader(200, {"Content-Type":contentType});
                        resp.write(data);
                        resp.end();
                    }
                });
            }
        }).listen(PORT);

console.log("Server running on port " + PORT);
