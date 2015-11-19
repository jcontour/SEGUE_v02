/*---------- BASIC SETUP ----------*/
var express     = require('express'),
    bodyParser  = require('body-parser'),
    mongo = require('mongodb'),
    MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server;   // helper for parsing HTTP requests
var app = express();                        // our Express app
var PORT = 4000;

// Body Parser
app.use(bodyParser.urlencoded({ extended: false }));// parse application/x-www-form-urlencoded
app.use(bodyParser.json());                         // parse application/json

// Express server
app.use(function(req, res, next) {
    // Setup a Cross Origin Resource sharing
    // See CORS at https://en.wikipedia.org/wiki/Cross-origin_resource_sharing
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log('incoming request from ---> ' + ip);
    var url = req.originalUrl;
    console.log('### requesting ---> ' + url);  // Show the URL user just hit by user
    next();
});

app.use('/', express.static(__dirname + '/views'));

// -----> Mongo setup
var mongoServer = new MongoClient(new Server("localhost", 27017));
var db = mongoServer.db('thesis');


// -----> Socket.io setup
var server = require('http').Server(app);
var io = require('socket.io')(server);

// -----> Starting up servers
mongoServer.open(function(err, mongoServer) {
    if(err) throw err;
    server.listen(PORT, function(){
        console.log('Express server is running at ' + PORT);
    });
});


/*-------------- APP --------------*/
io.on('connection', function(socket) {
    /*––––––––––– SOCKET.IO starts here –––––––––––––––*/

    console.log('A new user has connected: ' + socket.id);

    // Listeners

    // Disconnecting
    socket.on('disconnect', function() {
        io.sockets.emit('bye', 'See you, ' + socket.id + '!');
        leaveAllRooms(socket);
    });
});