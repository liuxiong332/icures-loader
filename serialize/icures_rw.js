
var fs = require('fs');
var async = require('async');
var serialize = require('./serialize');
var path = require('path');

//when the table object load completely, callback will be invoked
//callback's signature is function(err,table)
function  loadFromFile(fileName, callback) {
    async.waterfall([
        function(callback) {
            fs.readFile(fileName,{encoding:'utf8'},callback);
        },
        function(data,callback) {
            if(typeof data !== 'string') {
                callback(new Error());
            } else {
                callback(null,serialize.deserializeFromString(data));
            }
        }
    ], callback);
}

//serialize obj and write into file, when complete, callback will invoke
//callback's signature is function(err)
function writeIntoFile(obj, fileName, callback) {
    var strOut = serialize.serializeToString(obj);
    fs.writeFile(fileName, strOut,callback);
}

//get the package name by the file name
//for example, the package name of "Package_zh.txt" and "Package_en.txt" is Package
function processPackageName(packName) {
    var index = packName.search(/_|\./);
    if(index === -1) {
        return packName;
    }
    return packName.slice(0,index);
}

//get all the package file name
//fileName : package file path
//callback: function(err,files)
function getAllPackageFileNames(fileName, callback) {
    var dirName = path.dirname(fileName);
    var baseName = path.basename(fileName);
    var packageName = processPackageName(baseName);
    fs.readdir(dirName, function(err,files) {
        if(err) return callback(err);
        var matchReg = new RegExp('^'+packageName);
        files.forEach(function(file) {
            var baseName = path.basename(file);
            if( matchReg.test(file) ) {
                
            }
        }

    })
}

exports._writeIntoFile = writeIntoFile;
exports._loadFromFile = loadFromFile;
exports._processPackageName = processPackageName;