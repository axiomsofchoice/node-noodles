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
    
    rest.get(repo_url).on('complete', function(package_list) {
        
        // Get the packages collection
        db.collection('npm_packages', function(err, collection) {
            
            if(err) {
                console.log('Could not find the npm_packages collection. Aborting') ;
                return;
            }
            
            // Get current list of packages, which is a special doc
            collection.findOne({_id: new db.bson_serializer.ObjectID('4e5a85d99643f10007000005')}, 
              function(err, current_package_list) {
                
                if(err || current_package_list==null) {
                    console.log('Error finding package list doc. Aborting') ;
                    return;
                }
                
                console.log('current_package_list:' + JSON.stringify(current_package_list));
                
                // Find out if we already have them
                package_list.forEach( function(packageName) {
                    if(current_package_list['package_list'].indexOf(packageName)==-1){
                        console.log('New package found: ' + packageName) ;
                        
                        // Get the metadata for this new package and insert into the db
                        var full_request_url = repo_url + querystring.escape( packageName );
                        //console.log('Requesting: '+full_request_url) ;
                        rest.get(full_request_url).on('complete',
                          function(packageMetadata) {
                            
                            // Convert the dependency list from an object to an array
                            // This is necessary since the keys retruned from the repo
                            // contain characters that cannot be directly inserted into
                            // MongoDB
                            // Note that at present we only get the dist-tag "latest"
                            // Sometimes this isn't present, so we catch the exception
                            var deps_list = [] ;
                            try {
                                var deps = packageMetadata["versions"][packageMetadata["dist-tags"]["latest"]]["dependencies"] ;
                                for(var package_name in deps) {
                                    if(deps.hasOwnProperty(package_name)) {
                                        deps_list.push(package_name) ;
                                    }
                                }
                            } catch (err) {
                                console.log('Problem getting information about dependencies: ' + TypeError);
                                console.log('Aborting this package...but keeping package name on the list.');
                            }
                            
                            var ins_obj = {
                                "name": packageName,
                                "description": packageMetadata["description"],
                                "dependencies": deps_list
                            };
                            
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
        var packages_index = [] ;
        var stream = collection.find({ "dependencies" : { $exists : true } }).streamRecords();
        
        stream.on("data", 
          function(package_detail) {
            
            // Note that is construct implies that if a package doesn't have
            // any dependencies then it won't be included.
            package_detail["dependencies"].forEach( function(dep_name) {
                // Test both the source and target
                if(packages_index.indexOf(package_detail["name"])==-1) {
                    // Everything is grouped into one group
                    myJson["nodes"].push({"name":package_detail["name"],"group":1}) ;
                    packages_index.push(package_detail["name"]) ;
                }
                if(packages_index.indexOf(dep_name)==-1) {
                    // Everything is grouped into one group
                    myJson["nodes"].push({"name":dep_name,"group":1}) ;
                    packages_index.push(dep_name) ;
                }
                
                myJson["links"].push({"source": packages_index.indexOf(package_detail["name"]),
                                      "target": packages_index.indexOf(dep_name),
                                      "value":1}) ;
            });
          });
          
          stream.on("end", function() {
              cb(JSON.stringify(myJson));
          });
    });
}
