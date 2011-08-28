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
            
            // First sort the package list to make it easier to detect changes
            var package_list = data.sort() ;
            
            // Connect to the MongoDB server and check for changes
            db.open(function(err, db) {
              if(!err) {
                console.log("Connected to MongoDB server.");
                
                var current_package_list = ['void'] ; // make sure there is always something in here
                
                //
                var packageName = '' ;
                
                
                console.log('New package found: ' + packageName) ;
                
                // Get the metadata for this new package and insert into the db
                var full_request_url = repo_url + '?' 
                                    + querystring.stringify( packageName ); 
                
              } else {
                console.log("Failed to connect to MongoDB server.");
              }
            });
            
    });
    
}


// Get package details from the database
exports.npmjsGetPackageDetails = function () {
    
}
