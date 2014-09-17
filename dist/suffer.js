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
            if (val === undefined) {
                val = 1;
            }
            parms[keyvals[0]] = val;
        }
        return parms;
    }

    function load() {
        // load SufferRunner via script tag injection
        var runnerPath = getScriptPathRelativeTo('sufferRunner.js', 'suffer.js');

        var runnerLoader = document.createElement('script');
        runnerLoader.type = 'text/javascript';
        runnerLoader.src = runnerPath;
        runnerLoader.onload = runSuffer;
        var head = document.getElementsByTagName('head')[0];
        head.appendChild(runnerLoader);
    }

    function runSuffer() {
        /* jshint ignore:start */
        var specsToRun = [
            './functionalTest/index'
        ];
        var runner = new SufferRunner(specsToRun);
        /* jshint ignore:end */
    }

    function checkReady() {
        if (window.readyToTest || Date.now() > endTime) {
            load();
            return;
        }
        console.log("not ready");
        setTimeout(checkReady,CHECK_READY_INTERVAL);
    }

    function loadWhenReady() {
        // initialize it if it isn't defined on window
        if (!('readyToTest' in window)) {
            window.readyToTest = false;
        }
        startTime = Date.now();
        endTime = startTime + TIMEOUT_AFTER;
        checkReady();
    }

    // checks for the URL param to run automated tests
    function loadIfEnabled() {
        qs = parseQueryString();
        if (qs.runTests) {
            setTimeout(loadWhenReady,0);
        }
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
                if (scriptSrc.indexOf(name)) {
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
            return;
        }
        return scriptElement.src.split(name).join('');
    }

    function getScriptPathRelativeTo(newSrc, nextToSrc) {
        var path = getScriptPathOf(nextToSrc);
        return path + newSrc;
    }

    window.addEventListener('load', loadIfEnabled);

})();
