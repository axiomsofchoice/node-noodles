/* This module will interface with the OpenDOAR API:
http://www.opendoar.org/tools/api13manual.html
*/

var rest = require('restler') ;


var service_url = 'http://www.opendoar.org/api.php' ;

// Test the server making http requests to a web service
// based on keyword
function odoarloookup(keyword, callback) {
    
    var params = { 'kwd':keyword, 'show':'max'}
    
    var full_request_url = service_url + '?' + querystring.stringify(params); 
    
    rest.get(full_request_url).on('complete', callback);
    
}

