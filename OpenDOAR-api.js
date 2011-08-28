/* This module will interface with the OpenDOAR API:
http://www.opendoar.org/tools/api13manual.html
*/

var querystring = require('querystring')
    , xml = require('node-xml')
    , rest = require('restler') ;


var service_url = 'http://www.opendoar.org/api.php' ;

// Test the server making http requests to a web service
// based on keyword
exports.odoarloookup = function (keyword, result_list_action) {
    
    var params = { 'kwd':keyword, 'show':'max'}
    
    var full_request_url = service_url + '?' + querystring.stringify(params); 
    
    rest.get(full_request_url).on('complete', function(data) {
            
            var list_of_repos = [] ;
            var current_elem = ['void'] ; // make sure there is always something in here
            
            // A SAX2 parser for the XML docuements returned from search in the
            var parser = new xml.SaxParser(function(cb) {
              cb.onStartDocument(function() {
              
              });
              cb.onEndDocument(function() {
                  result_list_action(list_of_repos) ;
              });
              cb.onStartElementNS(function(elem, attrs, prefix, uri, namespaces) {
                  //sys.puts("=> Started: " + elem + " uri="+uri +" (Attributes: " + JSON.stringify(attrs) + " )");
                  current_elem.push(elem) ;
              });
              cb.onEndElementNS(function(elem, prefix, uri) {
                  //sys.puts("<= End: " + elem + " uri="+uri + "\n");
                  //parser.pause();// pause the parser
                  //setTimeout(function (){parser.resume();}, 200); //resume the parser
                  current_elem.pop() ;
              });
              cb.onCharacters(function(chars) {
                  //sys.puts('<CHARS>'+chars+"</CHARS>");
                  if (current_elem[current_elem.lenth-1] == 'rName')
                      list_of_repos.push(elem.value);
              });
              cb.onCdata(function(cdata) {
                  //sys.puts('<CDATA>'+cdata+"</CDATA>");
              });
              cb.onComment(function(msg) {
                  //sys.puts('<COMMENT>'+msg+"</COMMENT>");
              });
              cb.onWarning(function(msg) {
                  //sys.puts('<WARNING>'+msg+"</WARNING>");
              });
              cb.onError(function(msg) {
                  //sys.puts('<ERROR>'+JSON.stringify(msg)+"</ERROR>");
              });
            });
            
            // 
            parser.parseString(data);
            
    });
    
}

