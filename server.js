var fs = require('fs'),
        http = require('http'),
        https = require('https'),
        url = require('url'),
        mongo = require('mongoskin'),
        db = mongo.db('127.0.0.1:27017/mydb?auto_reconnect=true'),
        querystring = require('querystring'),
        PORT = 8090,
        BASE_DIR = ".";

db.bind('prices');

http.createServer(
        function(req, resp) {
            var file = BASE_DIR + req.url;
            var contentType;
            if (file.match(/html$/)) {
                contentType = 'text/html';
            } else if (file.match(/js$/)) {
                contentType = 'text/javascript';
            } else if (file.match(/css$/)) {
                contentType = 'text/css';
            } else {
                contentType = 'text/plain';
            }
            console.log(file);
            if (file.match(/.\/subs/)) {
                var query = querystring.parse(file);
                search(query, resp);
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


function search(query, resp) {
    var searchKey = {state: 'VIC'};
    if (query['./subs?type'] == 'house') {
        searchKey['house_price'] = {};
        if (query['min-price']) {
            searchKey['house_price']['$gte'] = query['min-price'] * 1;
        }
        if (query['max-price']) {
            searchKey['house_price']['$lte'] = query['max-price'] * 1;
        }
    } else {
        searchKey['unit_price'] = {};
        if (query['min-price']) {
            searchKey['unit_price']['$gte'] = query['min-price'] * 1;
        }
        if (query['max-price']) {
            searchKey['unit_price']['$lte'] = query['max-price'] * 1;
        }
    }

    db.prices.findOne(searchKey, function(err, suburb) {
        if (suburb) {
            console.log(suburb);
            resp.writeHeader(200, {"Content-Type": "text/plain"});
            resp.write(JSON.stringify(suburb));
            resp.end();
        }
    });
}