var autoPawRunner = (function () {   // jshint ignore:line

    'use strict';

    function autoPawRunner(specsToRun) {
        this.specList = specsToRun.slice(0);
    }

    autoPawRunner.prototype = {

        startTests: function(/*consoleEcho*/) {

            // dynamically load a spec file
            function importIt(x) {
                return System.import(x);    // jshint ignore:line
            }

            var self = this;

            Promise.all(self.specList.map(importIt)).then(function(){
                // run tests when all have been loaded
                jasmine.getEnv().execute();
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
        },

        getJUnitTestResults: function() {
            if (jasmine.junitReport) {
                return jasmine.junitReport;
            }
            return '';
        }

    };

    return autoPawRunner;
})();
