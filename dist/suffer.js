(function() {

    var CHECK_READY_INTERVAL = 1000;
    var TIMEOUT_AFTER = 4000; // prod value, mobile can take a while to load
    var startTime;
    var endTime;
    var qs; // the query string params

    function parseQueryString() {
        var parms = {};
        var query = String(window.location).split('?')[1] || '';
        var pairs = query.split('&');
        for (var i = 0; i < pairs.length; i++) {
            var keyvals = pairs[i].split('=');
            var val = keyvals[1];
            parms[keyvals[0]] = val || null; // prevent key -> undefined
        }
        return parms;
    }

    function load() {
        // load SufferRunner via script tag injection
        var runnerPath = qs.runnerPath || getScriptPathRelativeTo('sufferRunner.js', 'suffer.js');
        var runnerLoader = document.createElement('script');
        runnerLoader.type = 'text/javascript';
        runnerLoader.src = runnerPath;
        runnerLoader.onload = runSuffer;
        var head = document.getElementsByTagName('head')[0];
        head.appendChild(runnerLoader);
    }

    function runSuffer() {

        var specsToRun = [
            './functionalTest/index'
        ];
        var runner = new SufferRunner(specsToRun);      // jshint ignore:line
        runner.runTests().then(function(testResults){
            console.log('Test Results:');               // jshint ignore:line
            console.log(testResults);                   // jshint ignore:line
        });

    }

    function checkReady() {
        if (window.readyToTest || Date.now() > endTime) {
            load();
            return;
        }
        setTimeout(checkReady,CHECK_READY_INTERVAL);
    }

    // checks for the URL param to run automated tests
    function loadIfEnabled() {
        qs = parseQueryString();
        if (qs.runTests === undefined) {
            // do nothing
            return;
        }
        qs.runTests = Number(qs.runTests);
        if (isNaN(qs.runTests)) {
            qs.runTests = TIMEOUT_AFTER;
        }
        if (qs.runTests < 0) {
            qs.runTests = 9999999;
        }
        // initialize it if it isn't defined on window
        if (!('readyToTest' in window)) {
            window.readyToTest = false;
        }
        startTime = Date.now();
        endTime = startTime + qs.runTests;
        checkReady();
    }

    function getScriptElementFor(name) {
        var selfScript = null;
        try {
            selfScript = document.querySelector('script[src*="' + name + '"]');
        } catch (x) {
            // ignore
        }
        // If a browser doesn't support *= attribute selectors, check all scripts
        if (!selfScript) {
            var scripts = document.querySelectorAll('script');
            for (var i = 0; i < scripts.length; i++) {
                var scriptSrc = scripts[i].src;
                if (scriptSrc.indexOf(name) >= 0) {
                    selfScript = scripts[i];
                    break;
                }
            }
        }
        return selfScript;
    }

    function getScriptPathOf(name) {
        var scriptElement = getScriptElementFor(name);
        if (!scriptElement || !name) {
            return undefined;
        }
        return scriptElement.src.split(name).join('');
    }

    function getScriptPathRelativeTo(newSrc, nextToSrc) {
        var path = getScriptPathOf(nextToSrc);
        if (path === undefined) {
            throw new Error('Can\'t find script tag for ' + nextToSrc);
        }
        return path + newSrc;
    }

    loadIfEnabled();

})();
