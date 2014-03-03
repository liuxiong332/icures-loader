
var assert = require('assert');
var icures = require('../serialize/icures_rw');
var RES_TABLE = require('./test_data').RES_TABLE;
var async = require('async');

describe('icu resource load and save', function() {
    describe('load from file and write into file', function() {
        var FILE_NAME = "test.txt";
        function testReadWrite(element) {
            it('write into file successfully', function(done) {
                async.waterfall([
                    function(callback) {
                        icures._writeIntoFile(element.obj,FILE_NAME,callback);
                    },
                    function(callback) {
                        icures._loadFromFile(FILE_NAME,callback);
                    }
                ], function(err,table) {
                    if(err) {
                        done(err);
                    } else {
                        assert.deepEqual(element.obj, table);
                        done();
                    }

                });

            });
        }

        RES_TABLE.forEach( function(element) {
            testReadWrite(element);
        });
    });
    describe('package process', function() {
        it('get package name', function() {
            assert.equal(icures._processPackageName("Package_zh.txt"),"Package");
            assert.equal(icures._processPackageName("Package.txt"),"Package");
            assert.equal(icures._processPackageName("Package"),"Package");
        });
    });
    describe('find file names by package name', function() {
        it('all filename match the package name should return', function() {
            var files = ['package_cn.txt','package_en.txt'];
            var langs = ['cn','en'];
            icures._findMatchFileNameByPackageName(files,'package',function(file,index,langKey) {
                assert(file in files);
                assert.equal(langs[index],langKey);
            });
        });
    });
    describe('get package name by specific file name', function() {
        it('should get the package name', function() {
            var packNameMap = [{fileName:"C:\\nimei\\package_zh.txt",packName:"package"},
                {fileName:".\\package.txt",packName:"package"}];
            packNameMap.forEach(function(element) {
                assert.equal(icures._getPackNameByFileName(element.fileName),element.packName);
            });
        });
    });
});