var SufferRunner = (function () {

    'use strict';

    function SufferRunner() {
        /* jshint ignore:start */

        // attach the JSReporter to get JSON test results
        jasmine.getEnv().addReporter(new jasmine.JSReporter2());

        // to load an array of specs
        var specsToRun = [
            './functionalTest/index'
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

        /* jshint ignore:end */
    }

    return SufferRunner;
})();
