var gulp = require('gulp');

// Override default options (such as path) here
var customizedOptions = {};

var wGulp = require('wGulp')(gulp, customizedOptions);

// Add your own tasks here
gulp.task('concat', wGulp.concat({
    src: [
        'lib/jasmine-2.0.2/jasmine.js',
        'lib/jasmine-2.0.2/console.js',
        'lib/jasmine-2.0.2/boot.js',
        'lib/jasmine-jsreporter/jasmine-jsreporter.js',
        'src/sufferRunner.js',
        'src/suffer.js'
    ],
    outfile: 'suffer.js'
}));
