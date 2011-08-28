/**
*  The main server that runs the npmviz app.
*  
*  This is an entry in the 2011 Node Knockout for team Node Noodles.
*  
*  The app displays a graph visualization of the dependencies between packages
*  found in the main NPM package registry at npmjs.org. Uses the Express
*  framework with Jade page templates. On the backend it uses MongoDB, which for
*  the duration of the competition was hosted on MongoHQ. JSON REST API calls
*  are made with restler.
*  
*  @author axiomsofchoice
*/

var http = require('http')
    , sys = require('sys')
    , express = require('express')
    , jade = require('jade')
    , fs = require('fs')
    , rest = require('restler')
    , mongo = require('mongodb')
    , npmjsapi = require('./npmjs-api')
    , nko = require('nko')('Eg3lmCJD7aocos0E');

// MongDB stuff
//mongodb://axiomsofchoice:kiu3y&djh3D@staff.mongohq.com:10061/node-noodles

var Server = mongo.Server,
    Db = mongo.Db;

var server = new Server('staff.mongohq.com', 10061, {auto_reconnect: true});
var db = new Db('node-noodles', server);


/*db.open(function(err, db) {
    db.authenticate('axiomsofchoice', 'kiu3y&djh3D', function(err,foo) {
      if(!err) {
        console.log("We are connected");
        // Setup pseudo-cron job to poll npm registry for changes and update mongodb
        // Poll every 5 minutes
        //var npmjsapi_cron = setInterval(npmjsapi.npmjsCronJob, 300000, db);
        // TO TEST!!
        console.log('Testing the insert.') ;
        npmjsapi.npmjsCronJob(db);
      } else {
	  console.log('Failed to connect to MongoDB.') ;
      }
    });
});*/

var app = express.createServer();

/*app.set('view engine', 'html');
app.register('.html', jade );
app.set('views', __dirname+'/pages');
app.set('view options', { layout: false });

app.get('/', function(req, res){
	res.render('templt.jade',{pageTitle:'Search',youAreUsingJade:'Hello World!'});
});*/

//static files
app.get('/force.html', function(req, res){
    fs.readFile('./pages/force.html', function(error, content) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content, 'utf-8');
    });
});
app.get('/d3.js', function(req, res){
    fs.readFile('./pages/d3.js', function(error, content) {
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        res.end(content, 'utf-8');
    });
});
app.get('/style.css', function(req, res){
    fs.readFile('./pages/style.css', function(error, content) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content, 'utf-8');
    });
});
app.get('/syntax.css', function(req, res){
    fs.readFile('./pages/syntax.css', function(error, content) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content, 'utf-8');
    });
});
app.get('/force.css', function(req, res){
    fs.readFile('./pages/force.css', function(error, content) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content, 'utf-8');
    });
});
app.get('/d3.layout.js', function(req, res){
    fs.readFile('./pages/d3.layout.js', function(error, content) {
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        res.end(content, 'utf-8');
    });
});
app.get('/d3.geom.js', function(req, res){
    fs.readFile('./pages/d3.geom.js', function(error, content) {
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        res.end(content, 'utf-8');
    });
});
app.get('/force.js', function(req, res){
    fs.readFile('./pages/force.js', function(error, content) {
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        res.end(content, 'utf-8');
    });
});

// The search by keyword interface
app.get('/search', function(req, res){
	console.log('Params: ' + JSON.stringify(req)) ;
    /*odoar.odoarloookup( req.params.srchkwd, function(data) {
        res.render('search-results.jade',{results:data});
    });*/
});

app.listen(process.env.NODE_ENV === 'production' ? 80 : 8000, function() {
  console.log('Ready');

  // if run as root, downgrade to the owner of this file
  if (process.getuid() === 0)
    require('fs').stat(__filename, function(err, stats) {
      if (err) return console.log(err)
      process.setuid(stats.uid);
    });
});

