var SufferRunner = (function () {

    'use strict';

    function SufferRunner() {
        /* jshint ignore:start */

        // wait for SystemJS to complete loading before continuing
        System.import('./lib/jasmine-2.0.2/jasmine').then(function(module) {

            window.jasmineRequire = module;

            System.import('./lib/jasmine-2.0.2/console').then(function(module) {
                System.import('./lib/jasmine-2.0.2/boot').then(function(module) {
                    System.import('./lib/jasmine-jsreporter/jasmine-jsreporter').then(function(module) {

                        // attach the JSReporter to get JSON test results
                        jasmine.getEnv().addReporter(new jasmine.JSReporter2());

                        // to load an array of specs
                        var specsToRun = [
                            './lilSpec',
                            './anotherSpec'
                        ];
                        function importIt(x) {
                            return System.import(x);
                        }
                        Promise.all(specsToRun.map(importIt)).then(function(){
                            var env = jasmine.getEnv();
                            env.execute();

                            // echo out the JSON test results
                            var testResults = env.getJSReport();
                            console.log(testResults);
                        });
                    });
                });
            });
        });

        /* jshint ignore:end */
    }

    return SufferRunner;
})();

module.exports = SufferRunner;
