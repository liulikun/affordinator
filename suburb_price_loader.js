var fs = require('fs');
var mongo = require('mongoskin'),
        db = mongo.db('mongodb://heroku:b7828f91799ed3e4a3874288d7043823@alex.mongohq.com:10020/app1717097?auto_reconnect=true');

var sax = require("sax");
var saxStream = sax.createStream(true);
var suburb, state, postcode;
var year, month, type, price;
var byMonth = false, currentTag;

db.bind('prices');
saxStream.on("error", function (e) {
    // unhandled errors will throw, since this is a proper node
    // event emitter.
    console.error("error!", e)
    // clear the error
    this._parser.error = null;
    this._parser.resume();
});

saxStream.on("opentag", function (node) {
    // same object as above
    currentTag = node.name;
    if (currentTag == 'PropertyTypeGroup') {
        type = node.attributes.type;
    } else if (currentTag == 'MedianPricesByYear') {
        byMonth = false;
    } else if (currentTag == 'MedianPricesByMonth') {
        byMonth = true;
    }
});

saxStream.on("text", function (t) {
    // same object as above
    if (t == "\n") {
        return;
    }
    if (currentTag == 'Suburb') {
        suburb = t;
    } else if (currentTag == 'Postcode') {
        postcode = t;
    } else if (currentTag == 'State') {
        state = t;
    } else if (byMonth) {
        if (currentTag == 'Year') {
            year = t;
        } else if (currentTag == 'Month') {
            month = t;
        } else if (currentTag == 'Price') {
            if (state == 'VIC' && year == '2011' && month == 'Aug' && type.toLowerCase() == (process.argv[2] || 'house')) {
                price = t;

                var priceKey = [type];

                var recKey = {suburb:suburb, state:state, postcode:postcode};
                var rec = {suburb:suburb, state:state, postcode:postcode};
                rec[priceKey[0].toLowerCase() + '_price'] = price * 1;
                var priceOnly = {}
                priceOnly[priceKey[0].toLowerCase() + '_price'] = price * 1;
                console.log(rec);
                db.prices.findOne(recKey, function(err, updated_user) {
                    if (updated_user) {
                        db.prices.update(recKey, {$set: priceOnly}, function(err) {
                            if (err) {
                                console.log('update error', err);
                            }
                        });
                    } else {
                        db.prices.insert(rec, function(err) {
                            if (err) {
                                console.log('inser error', err);
                            }
                        });
                    }
                });

                year = month = '';
            }
        }
    }
});


//pipe is supported, and it's readable/writable
//same chunks coming in also go out.
fs.createReadStream("20111021-SuburbProfile.xml").pipe(saxStream);
//fs.createReadStream("short.xml").pipe(saxStream);


