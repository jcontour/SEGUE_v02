/*---------- BASIC SETUP ----------*/
var express     = require('express'),
    bodyParser  = require('body-parser'),
    mongo       = require('mongodb'),
    MongoClient = require('mongodb').MongoClient,
    ObjectID = require('mongodb').ObjectID,
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
        // console.log(doc);
        callback(doc);
    });
}

var getDocArray = function(whichdb, query, callback){
    console.log("querying db");
    var docArray = []

    db.collection(whichdb).find(query).each(function(err, doc) {
        if (err) throw err;
        if (doc != null) {
            docArray.push(doc)
        } else {
            callback(docArray);
        }    
    });

    // callback(docArray);
}

/*-------------- APP --------------*/
io.on('connection', function(socket) {
    /*––––––––––– SOCKET.IO starts here –––––––––––––––*/

    console.log('A new user has connected: ' + socket.id);
    //init articles

    getArticle("trend", {}, function(startdoc){
        //console.log(startdoc);
        getDocArray("segue", {}, function(docArray){
            // console.log(docArray);
            algorithm.start(startdoc.keywords, docArray, function(matching_ids){
                // console.log(matching_ids);
                socket.emit("return-article", {
                    article: startdoc,
                    nextLinks: matching_ids
                });
            });
        });
    });

    // Listeners
        

    socket.on("find-next", function(data){
        var obj_id = new ObjectID(data);
        getArticle("segue", {_id : obj_id}, function(doc){ 
            getDocArray("segue", {}, function(docArray){
                algorithm.start(doc.keywords, docArray, function(matching_ids){
                    socket.emit("return-article", {
                    article: doc,
                    nextLinks: matching_ids
                    });
                });
            });
        });
    });

    // var articleRead = 0;
    var userPath = []
    socket.on("track-articles", function(data){
        console.log("tracking articles read")
        var obj_id = new ObjectID(data.id);
        getArticle("segue", {_id : obj_id}, function(doc){ 
            var currentArticle = {
                // articleRead : articleRead,
                articleId : obj_id,
                articleTitle : doc.title,
                articleKeyword : data.keyword
                }
            userPath.push(currentArticle);
            console.log(userPath);
        });
    })

    socket.on("get-profile", function(){
        socket.emit("show-profile", userPath);
    })

    // Disconnecting
    socket.on('disconnect', function() {
        io.sockets.emit('bye', 'See you, ' + socket.id + '!');
    });
});

