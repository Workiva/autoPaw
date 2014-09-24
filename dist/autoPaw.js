(function() {

    var CHECK_READY_INTERVAL = 1000;
    var TIMEOUT_AFTER = 4000; // prod value, mobile can take a while to load
    var startTime;
    var endTime;
    var qs; // the query string params
    var iframe;

    function parseQueryString(url) {
        var parms = {};
        var query = String(url).split('?')[1] || '';
        var pairs = query.split('&');
        for (var i = 0; i < pairs.length; i++) {
            var keyvals = pairs[i].split('=');
            var val = keyvals[1];
            var key = keyvals[0];
            if (key) {
                parms[key] = val || null; // prevent key -> undefined
            }
        }
        return parms;
    }

    function load() {
        // load autoPawRunner via script tag injection
        var runnerPath = getPathTo('autoPaw.js', qs.runnerPath);
        var runnerLoader = document.createElement('script');
        runnerLoader.type = 'text/javascript';
        runnerLoader.src = runnerPath + 'autoPawRunner.js';
        runnerLoader.onload = runautoPaw;
        var head = document.getElementsByTagName('head')[0];


        iframe = document.getElementById('autoPaw_results');
        if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.id = 'autoPaw_results';
            iframe.style.position = 'absolute';
            iframe.style.top = '0px';
            iframe.style.left = '0px';
            iframe.style.bottom = '0px';
            iframe.style.right = '0px';
            iframe.width = '100%';
            iframe.height = '100%';
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
        }
        var iwindow = (iframe.contentWindow) ? iframe.contentWindow : (iframe.contentDocument.document) ? iframe.contentDocument.document : iframe.contentDocument;
        var ibody = iwindow.document.body;

        var css = iwindow.document.createElement('link');
        css.rel = 'stylesheet';
        css.href = runnerPath + 'jasmine.css';
        iwindow.document.body.appendChild(css);
        var mainWindow = window;
        ibody.addEventListener('click', function(ev) {
            var target = ev.target;
            ev.preventDefault();
            var linkQs = parseQueryString(target.href);
            var key;
            for (key in qs) {
                if (linkQs[key] === undefined && key !== 'spec') {
                    linkQs[key] = qs[key];
                }
            }
            var newQuery = '';
            for (key in linkQs) {
                newQuery = newQuery + key + '=' + linkQs[key] + '&';
            }
            var newUrl = target.href.split('?')[0] + '?' + newQuery;
            mainWindow.location = newUrl;
        });
        var base = iwindow.document.createElement('base');
        base.target = '_parent';
        iwindow.document.body.appendChild(base);

        head.appendChild(runnerLoader);
    }

    function runautoPaw() {
        var specList = qs.testIndexFile || './functionalTest/index';
        var idx = specList.lastIndexOf('.js');
        if (idx > 0 && idx == specList.length - 3) {
            specList = specList.substr(0, specList.length - 3);
        }
        var specsToRun = [specList];
        var runner = new autoPawRunner(specsToRun); // jshint ignore:line
        runner.startTests();
        window.testsDone.then(function() {
            iframe.style.display = 'block';
            if (qs.reportURL) {
                var xml = runner.getJUnitTestResults();
                postTestResults(xml, qs.reportURL);
            }
        });

    }

    /**
     * Post test results to a listening URL (typically, a running wf-catcher)
     * @param  {Object} results JSON-serializable test results or XML string
     * @param  {String} reportURL  URL suitable for posting to
     */
    function postTestResults(results, reportURL) {

        if (!reportURL) {
            throw new Error('endpoint url unspecified');
        }

        var request = new XMLHttpRequest();
        request.open('POST', reportURL, true);
        if (typeof results === 'string') {
            request.setRequestHeader('Content-Type', 'text/xml; charset=UTF-8');
            request.send(results);
        }
        else {
            request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
            request.send(JSON.stringify(results));
        }
    }

    function checkReady() {
        if (window.readyToTest || Date.now() > endTime) {
            load();
            return;
        }
        setTimeout(checkReady, CHECK_READY_INTERVAL);
    }

    // checks for the URL param to run automated tests
    function loadIfEnabled() {
        qs = parseQueryString(window.location);
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
        }
        catch (x) {
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

    function getPathTo(src, def) {
        var path = def || getScriptPathOf(src);
        if (path === undefined) {
            throw new Error('Can\'t find script tag for ' + src);
        }
        return path;
    }

    loadIfEnabled();

})();
