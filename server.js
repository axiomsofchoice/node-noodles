// server.js 

var http = require('http')
    , express = require('express')
    , jade = require('jade')
    , sys = require('sys')
    , rest = require('restler')
    , odoar = require('./OpenDOAR-api')
    , nko = require('nko')('Eg3lmCJD7aocos0E');


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


