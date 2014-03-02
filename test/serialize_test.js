
var assert = require('assert');
var serialize = require('../serialize/serialize');
var util = require('util');
var RES_TABLE = require('./test_data').RES_TABLE;

describe('Serialize', function() {
    it('should serialize to the specific string', function() {
        RES_TABLE.forEach(function(element) {
            assert.equal( element.str,
                serialize.serializeToString(element.obj).toString());
        });
    });
    it('should deserialize from the specific string', function() {
        RES_TABLE.forEach(function(element) {
            assert.deepEqual( element.obj,
                serialize.deserializeFromString(element.str));
        });
    });
});