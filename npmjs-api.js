/**
*  Interface with http://registry.npmjs.org/ to interrogate it for packages
*  
*  Details of the API are given at: https://github.com/isaacs/npmjs.org
*  
*  This runs as a pseudo-cron, polling the main registry for changes every 5mins
*  
*  TODO: Also check for updates to packages, not just new ones.
*  
*  @author axiomsofchoice
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
        
        // Get the packages collection
        db.collection('node-packages', function(err, collection) {
            
            // Get current list of packages, which is a special doc
            collection.findOne({_id:"4e5a85d99643f10007000005"}, 
              function(err, current_package_list) {
                
                if(err) console.log('Error finding package list doc.') ;
                
                console.log('current_package_list:' + current_package_list);
                
                // FOR TESTING ONLY!!
                var packageName = current_package_list.package_list[0] ;
                
                console.log('New package found: ' + packageName) ;
                
                // Get the metadata for this new package and insert into the db
                var full_request_url = repo_url + '?' 
                                + querystring.stringify( packageName );
                
                rest.get(full_request_url).on('complete',
                  function(packageMetadata) {
                    collection.insert(packageMetadata, {safe:true},
                      function(err, result) {
                        console.log("Failed to insert new" +
                                    "package metadata for: " + packageName);
                       });
                  });
              });
        });
    });
}


// Get package details from the database
exports.npmjsGetPackageDetails = function () {
    
}
