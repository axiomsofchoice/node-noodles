// server.js 
var http = require('http')
    , sys = require('sys')
    , rest = require('restler')
    , nko = require('nko')('Eg3lmCJD7aocos0E');

var app = http.createServer(function (req, res) { 
	res.writeHead(200, { 'Content-Type': 'text/html' }); 
	res.end('Hello, World'); 
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

//console.log('Listening on ' + app.address().port);

// Test the server making http requests to a web service
rest.get('http://eprints.nottingham.ac.uk/cgi/oai2?verb=Identify').on('complete', function(data) {
	sys.puts(data);
});

