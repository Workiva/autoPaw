// Pseudo Code
/*
Given a directory read scan through it recursively find all spec files and then
create an import point.
*/

var join = require('path').join;
var glob = require('glob');
var chdir = process.chdir;
module.exports = function(srcDir) {
  console.log(srcDir);
  chdir(srcDir);
  var specs = glob.sync('**/*.spec.js').map(function(file) {
    return("require('" + file.split('.js')[0] + "');");
  });
  console.log(specs);
  return specs.join('\n') + '\n';
};
