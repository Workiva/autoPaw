var autoPawRunner = (function () {   // jshint ignore:line

    'use strict';

    function autoPawRunner(jasmineRef, specsToRun) {
        if (specsToRun) {
            this.specList = specsToRun.slice(0);
        }
        this.jasmine = jasmineRef;
    }

    autoPawRunner.prototype = {

        startTests: function() {

            if (!this.specList) {
                return;
            }

            // dynamically load a spec file
            function importIt(x) {
                return System.import(x);    // jshint ignore:line
            }

            var self = this;

            Promise.all(self.specList.map(importIt)).then(function(){
                // run tests when all have been loaded
                self.jasmine.getEnv().execute();
            });

        },

        getSpecList: function() {
            return this.specList;
        },

        getTestResults: function() {
            return this.jasmine.getJSReport();
        },

        getTestResultsAsString: function() {
            return this.jasmine.getJSReportAsString();
        },

        getJUnitTestResults: function() {
            if (this.jasmine.junitReport) {
                return this.jasmine.junitReport;
            }
            return '';
        }

    };

    return autoPawRunner;
})();
