var lazy = require("lazy"),
        fs = require("fs"),
        mongo = require('mongoskin'),
        db = mongo.db('mongodb://heroku:b7828f91799ed3e4a3874288d7043823@alex.mongohq.com:10020/app1717097?auto_reconnect=true');

db.bind('prices');

new lazy(fs.createReadStream('vic_suburb.txt')).lines.forEach(function(line) {
    var lineStr = line.toString();
    var suburb = lineStr.split(':')[0];
    var boundary = lineStr.split(':')[1];
    var searchKey = {suburb:suburb, state:'VIC'};
    db.prices.findOne(searchKey, function(err, updated_suburb) {
        if (updated_suburb) {
            var points = boundary.split(',');
            var latLongs = [];
            for (var i = 0; i < points.length; i++) {
                var latLong = points[i].replace(/^\s+|\s+$/g, '').split(' ');
                var lat = latLong[1] * 1;
                var long = latLong[0] * 1;
                latLongs.push([lat, long]);
            }
            db.prices.update(searchKey, {$set: {boundary:latLongs}}, function(err) {
                if (err) {
                    console.log('update error', err);
                } else {
                    console.log(suburb);
                }
            });
        }
    });
});