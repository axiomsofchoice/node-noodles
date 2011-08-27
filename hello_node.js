// hello_node.js from http://blog.nodeknockout.com/post/8745159698/countdown-to-ko-1-how-to-install-node
var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello Node.js\n');
}).listen(8124, "127.0.0.1");
console.log('Server running at http://127.0.0.1:8124/');
