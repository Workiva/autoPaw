var gulp = require('gulp');

// Override default options (such as path) here
var customizedOptions = {
    build_tasks: [['copy:js', 'concat', 'copy:dist']]
};

var wGulp = require('wGulp')(gulp, customizedOptions);

// Add your own tasks here
gulp.task('concat', wGulp.concat({
    src: [
        'lib/jasmine-2.0.2/jasmine.js',
        'lib/jasmine-2.0.2/console.js',
        'lib/jasmineDoneReporter.js',
        'lib/jasmine-2.0.2/jasmine-html.js',
        'lib/jasmine-jsreporter/jasmine-jsreporter.js',
        'lib/junit_reporter/junit_reporter.js',
        'lib/jasmine-2.0.2/boot.js',
        'src/sufferRunner.js'
    ],
    outfile: 'sufferRunner.js'
}));

gulp.task('copy:dist', wGulp.copy({
    src: ['src/suffer.js', 'lib/jasmine-2.0.2/jasmine.css'],
    dest: 'dist/'
}));
