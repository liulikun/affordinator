var lazy = require("lazy"),
        fs = require("fs"),
        mongo = require('mongoskin'),
        db = mongo.db('127.0.0.1:27017/mydb?auto_reconnect=true');

db.bind('prices');

new lazy(fs.createReadStream('vic_suburb.txt')).lines.forEach(function(line) {
    var lineStr = line.toString();
    var suburb = lineStr.split(':')[0];
    var boundary = lineStr.split(':')[1];
    var searchKey = {suburb:suburb, state:'VIC'};
    db.prices.findOne(searchKey, function(err, updated_suburb) {
        if (updated_suburb) {
            db.prices.update(searchKey, {$set: {boundary:boundary}}, function(err) {
                if (err) {
                    console.log('update error', err);
                } else {
                    console.log(suburb);
                }
            });
        }
    });
});