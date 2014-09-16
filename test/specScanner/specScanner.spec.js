var fs = require('fs');
var join = require('path').join;
var specScanner = require('../../src/specScanner/specScanner')
describe('specScanner', function() {
  it('should exist', function() {
    expect(specScanner).toBeTruthy();
  });
  it('given the largeExample dataset should produce a correct import file', function() {


    expect(specScanner(join( __dirname, 'fixtures/largeExample')))
      .toEqual(fs.readFileSync(join(__dirname, 'fixtures/largeExampleImport.js')).toString())
  });
});
