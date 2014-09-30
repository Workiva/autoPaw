/*
 * Copyright 2014 Workiva, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* global System */
/* exported AutoPawRunner */

var AutoPawRunner = (function () {

    'use strict';

    function AutoPawRunner(jasmineRef, specsToRun) {
        if (specsToRun) {
            this.specList = specsToRun.slice(0);
        }
        this.jasmine = jasmineRef;
    }

    AutoPawRunner.prototype = {

        startTests: function() {

            if (!this.specList) {
                return;
            }

            // dynamically load a spec file
            function importIt(x) {
                return System.import(x);
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

    return AutoPawRunner;
})();
