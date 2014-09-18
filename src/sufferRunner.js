var SufferRunner = (function () {   // jshint ignore:line

    'use strict';

    function SufferRunner(specsToRun) {
        this.specList = specsToRun.slice(0);
    }

    SufferRunner.prototype = {

        runTests: function(/*consoleEcho*/) {

            // dynamically load a spec file
            function importIt(x) {
                return System.import(x);    // jshint ignore:line
            }

            var self = this;
            return new Promise(function(resolve) {
                Promise.all(self.specList.map(importIt)).then(function(){
                    // run tests when all have been loaded
                    jasmine.getEnv().execute();
                    resolve(self.getTestResults());
                });
            });

        },

        getSpecList: function() {
            return this.specList;
        },

        getTestResults: function() {
            return jasmine.getJSReport();
        },

        getTestResultsAsString: function() {
            return jasmine.getJSReportAsString();
        }

    };

    return SufferRunner;
})();
