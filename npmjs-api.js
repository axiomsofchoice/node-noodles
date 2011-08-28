/**
*  Interface with http://registry.npmjs.org/ to interrogate it for packages
*  
*  Details of the API are given at: https://github.com/isaacs/npmjs.org
*  
*  This runs as a pseudo-cron, polling the main registry for changes every 5mins
*/

var querystring = require('querystring')
    , rest = require('restler') ;


var repo_url = 'http://registry.npmjs.org/' ;

// The pseudo-cron job
exports.npmjsCronJob = function (db) {
    
    console.log('Checking the repository for changes.');
    
    rest.get(repo_url).on('complete', function(data) {
            
            var list_of_repos = [] ;
            var current_elem = ['void'] ; // make sure there is always something in here
            
            //
            var packageName = '' ;
            
            var full_request_url = repo_url + '?' + querystring.stringify( packageName ); 
            
            console.log('New package found: ' + packageName) ;
            
            
    });
    
}


// Update details
exports.npmjsIntialize = function () {
    console.log('Initializing database.');
}

// Get package details from the database
exports.npmjsGetPackageDetails = function () {
    
}
