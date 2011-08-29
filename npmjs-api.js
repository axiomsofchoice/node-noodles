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
    , mongo = require('mongodb')
    , rest = require('restler') ;


var repo_url = 'http://registry.npmjs.org/' ;

// The pseudo-cron job
exports.npmjsCronJob = function (db) {
    
    console.log('Checking the repository for changes.');
    
    rest.get(repo_url).on('complete', function(data) {
        
        // First sort the package list to make it easier to detect changes
        var package_list = data.sort() ;
        
        // Get the packages collection
        db.collection('npm_packages', function(err, collection) {
            
            // Get current list of packages, which is a special doc
	   collection.findOne({_id: new db.bson_serializer.ObjectID('4e5a85d99643f10007000005')}, 
              function(err, current_package_list) {
                
                  if(err) {
                      console.log('Error finding package list doc. Aborting') ;
                      return;
                  }
                
                //console.log('current_package_list:' + JSON.stringify(current_package_list));
                
                // Find out if we already have them
                package_list.forEach( function(packageName) {
                    if(current_package_list['package_list'].indexOf(packageName)==-1){
                        console.log('New package found: ' + packageName) ;
                        
                        // Get the metadata for this new package and insert into the db
                        var full_request_url = repo_url + querystring.escape( packageName );
                        console.log('Requesting: '+full_request_url) ;
                        rest.get(full_request_url).on('complete',
                          function(packageMetadata) {
                            
                            try {
                                var ins_obj = {
                                    "name": packageName,
                                    "description": packageMetadata["description"],
                                    "dependencies": packageMetadata["versions"][packageMetadata["dist-tags"]["latest"]]["dependencies"]
                                };
                            } catch (err) {
                                console.log('Problem getting information about dependencies: ' + TypeError);
                                console.log('Aborting this package...');
                                return;
                            }
                            
                            //console.log('Original package metadata:'+JSON.stringify(packageMetadata));
                            //console.log('New package metadata:'+JSON.stringify(ins_obj));
                            collection.insert(ins_obj, {safe:true},
                              function(err, result) {
                                  if(err) {
                                    console.log("Failed to insert new package metadata for: " + packageName);
                                    console.log("Error: " + err) ;
                                  } else {
                                      // Also update the list of packages
                                      collection.update({_id: new db.bson_serializer.ObjectID('4e5a85d99643f10007000005')},
                                                        {$push:{package_list:packageName}},
                                                            {safe:true}, function(err, result) {
                                                            if(err) {
                                                                console.log("Error adding package to list: " + packageName);
                                                                }
                                                            });
                                  };
                               });
                          });
                    }
                });
              });
        });
    });
}


// Get package details from the database
exports.npmjsGetPackageDetails = function (db, cb) {
    
    db.collection('npm_packages', function(err, collection) {
        
        var myJson = {"nodes":[],"links":[]};
        
        collection.find({ "dependencies" : { $exists : true } }).toArray( 
          function(err, package_detail) {
            
            // Note that is construct implies that if a package doesn't have
            // any dependencies then it won't be included.
            for(var package_name in package_detail) {
                if(package_detail.hasOwnProperty(package_name)) {
                    if(myJson["nodes"].indexOf(package_name)==-1)
                        // Everything is grouped into one group
                        myJson["nodes"].push({"name":package_name,"group":1}) ;
                    
                    myJson["links"].push({"source":myJson["nodes"].indexOf(package_detail["name"]),
                                          "target":myJson["nodes"].indexOf(package_name),
                                          "value":1}) ;
                }
            }
          });
          
          cb(JSON.stringify(myJson));
    });
}
