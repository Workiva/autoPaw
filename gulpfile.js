var gulp = require('gulp');

// Override default options (such as path) here
var customizedOptions = {
    build_tasks: [['copy:js', 'concat', 'copy:dist']],
    dist_tasks: ["clean", "build", "bundle"]
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
        'node_modules/paw/bower_components/q/q.js',
        'node_modules/paw/src/WheelEventSimulator.js',
        'node_modules/paw/src/ViewportRelative.js',
        'node_modules/paw/src/Gestures.js',
        'node_modules/paw/src/Train.js',
        'node_modules/paw/src/Paw.js',
        'src/autoPawRunner.js'
    ],
    outfile: 'autoPawRunner.js'
}));

gulp.task('copy:dist', wGulp.copy({
    src: ['src/autoPaw.js', 'lib/jasmine-2.0.2/jasmine.css'],
    dest: 'dist/'
}));
