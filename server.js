// server.js 

var http = require('http')
    , sys = require('sys')
    , express = require('express')
    , jade = require('jade')
    , rest = require('restler')
    , mongodb = require('mongodb')
    , odoar = require('./OpenDOAR-api')
    , nko = require('nko')('Eg3lmCJD7aocos0E');

// MongDB stuff
var Server = mongo.Server,
    Db = mongo.Db;

//mongodb://axiomsofchoice:kiu3y&djh3D@staff.mongohq.com:10061/node-noodles

var server = new Server('staff.mongohq.com', 10061, {auto_reconnect: true});
var db = new Db('node-noodles', server);

db.open(function(err, db) {
  if(!err) {
    console.log("We are connected");
  }
});
    
var app = express.createServer();

app.set('view engine', 'html');
app.register('.html', jade );
app.set('views', __dirname+'/pages');
app.set('view options', {
	layout: false
	    });

app.get('/', function(req, res){
	res.render('templt.jade',{pageTitle:'Search',youAreUsingJade:'Hello World!'});
});

// The search by keyword interface
app.get('/search', function(req, res){
	console.log('Params: ' + JSON.stringify(req)) ;
    odoar.odoarloookup( req.params.srchkwd, function(data) {
        res.render('search-results.jade',{results:data});
    });
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


