
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
});