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
});

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

//returns database results for a query
var getDB = function(query, callback){
    // var q = {keywords = query};

    console.log("finding db");
    
    db.collection('segue1').findOne(function(err, doc){
        if (err) throw err;
        callback(doc);
    });
}

/*-------------- APP --------------*/
io.on('connection', function(socket) {
    /*––––––––––– SOCKET.IO starts here –––––––––––––––*/

    console.log('A new user has connected: ' + socket.id);

    // Listeners
    socket.on("find-match", function(data){
        getDB(db, data, function(doc){ 
            algorithm.init("potato", doc, function(){
                console.log(doc);
            });
        });
    })

    // Disconnecting
    socket.on('disconnect', function() {
        io.sockets.emit('bye', 'See you, ' + socket.id + '!');
    });
});

