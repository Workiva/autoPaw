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
        // load Jasmine2
        // load specs
        // run specs
        // report to HTML / xunit

        /* jshint ignore:start */
        var runner = new SufferRunner();
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

    window.addEventListener('load', loadIfEnabled);



})();
