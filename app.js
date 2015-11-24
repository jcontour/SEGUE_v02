/*---------- BASIC SETUP ----------*/
var express     = require('express'),
    bodyParser  = require('body-parser'),
    mongo       = require('mongodb'),
    MongoClient = require('mongodb').MongoClient,
    Server      = require('mongodb').Server,
    algorithm   = require('./algorithm/algorithm.js');  //article matching algorithm
var app = express();
var PORT = 8080;

// -----> Body Parser
app.use(bodyParser.urlencoded({ extended: false }));    // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                             // parse application/json

// -----> Express server
app.use(function(req, res, next) {
    // Setup a Cross Origin Resource sharing
    // See CORS at https://en.wikipedia.org/wiki/Cross-origin_resource_sharing
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log('incoming request from ---> ' + ip);
    var url = req.originalUrl;
    console.log('### requesting ---> ' + url);
    next();
});[]

app.use('/', express.static(__dirname + '/views'));

// -----> Mongo setup
var mongoclient = new MongoClient(new Server("localhost", 27017));
var db = mongoclient.db('thesis');


// -----> Socket.io setup
var server = require('http').Server(app);
var io = require('socket.io')(server);

// -----> Starting up servers
mongoclient.open(function(err, mongoclient) {
    if(err) throw err;
    console.log("started mongo server");

    server.listen(PORT, function(){
        console.log('Express server is running at ' + PORT);
    });
});

// Calls to DB
var getArticle = function(whichdb, query, callback){
    db.collection(whichdb).findOne(query, function(err, doc){
        if (err) throw err;
        callback(doc);
    });
}

var getDocArray = function(whichdb, query, callback){
    console.log("querying db");

    var docArray = db.collection(whichdb).find(query).toArray(function(err, docs) {
        if (err) throw err;
    });
}

/*-------------- APP --------------*/
io.on('connection', function(socket) {
    /*––––––––––– SOCKET.IO starts here –––––––––––––––*/

    console.log('A new user has connected: ' + socket.id);

    // Listeners
    socket.on("start", function(data){
        getArticle("trend1", {}, function(startdoc){
            getDocArray("segue1", {}, function(docArray){
                algorithm.start(data.keywords, docArray, function(matching_ids){
                    socket.emit("return-first", {
                        article: startdoc,
                        nextLinks: matching_ids
                    })
                });
            })
        })
    });

    socket.on("find-next", function(data){
        getDocArray("segue1", data, function(docArray){ 
            algorithm.start("potato", docArray, function(doc){
                socket.emit("return-next", doc)
            });
        });
    })

    // Disconnecting
    socket.on('disconnect', function() {
        io.sockets.emit('bye', 'See you, ' + socket.id + '!');
    });
});

