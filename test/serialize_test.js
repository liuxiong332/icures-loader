
var assert = require('assert');
var serialize = require('../serialize/serialize');
var util = require('util');

var RES_TABLE = [
    { hello: "你妹" }, 'hello{"你妹"}',
    { world:{ni:"ni","da":"汉子"}}, 'world{ni{"ni"}da{"汉子"}}'
]  ;

describe('Serialize', function() {
    it('should serialize to the specific string', function() {
        var index = 0;
        while(index<RES_TABLE.length) {
            assert.equal( RES_TABLE[index+1],
                serialize.serializeToString(RES_TABLE[index]).toString());
            index = index+2;
        }
    });
    it('should deserialize from the specific string', function() {
        var index = 0;
        while(index<RES_TABLE.length) {
            assert.deepEqual( RES_TABLE[index],serialize.deserializeFromString(RES_TABLE[index+1]));
            index = index + 2;
        }
    })
});