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
        'node_modules/jasmine-core/lib/jasmine-core/jasmine.js',
        'node_modules/jasmine-core/lib/console/console.js',
        'node_modules/jasmine-core/lib/jasmine-core/jasmine-html.js',
        'src/jasmineDoneReporter.js',
        'src/jasmine-jsreporter.js',
        'src/junit_reporter.js',
        'src/boot.js',
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
    src: ['src/autoPaw.js', 'node_modules/jasmine-core/lib/jasmine-core/jasmine.css'],
    dest: 'dist/'
}));
