
var icu_table = require('../serialize/icu_table');
var TABLE_MAP = require('./test_data').TABLE_MAP;
var assert = require('assert');

describe('analyzeTable should', function() {
    it('return the globalTable and local tables', function() {
        var globalTable = new icu_table.GlobalTable( Object.keys(TABLE_MAP.transTable) );
        var localTables = new icu_table.LocalTables();
        icu_table._analyzeTable(TABLE_MAP.transTable,globalTable,localTables);
        console.log(localTables);
        assert.deepEqual(globalTable, TABLE_MAP.mapTable);
        assert.deepEqual(localTables, TABLE_MAP.localMapTable);
    });
});
