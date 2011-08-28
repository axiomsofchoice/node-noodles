/**
*  
*
*
*/

var http = require('http')
    , sys = require('sys')
    , express = require('express')
    , jade = require('jade')
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

db.open(function(err, db) {
  if(!err) {
    console.log("We are connected");
  }
});


// As the server starts up it needs to check the database is correctly init'd
npmjsapi.npmjsIntialize();

// Setup pseudo-cron job to poll npm registry for changes and update mongodb
// Poll every 5 minutes
var npmjsapi_cron = setInterval(npmjsapi.npmjsCronJob, 300000, db);


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


