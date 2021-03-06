/**
 Starting with version 2.0, this file "boots" Jasmine, performing all of the necessary initialization before executing the loaded environment and all of a project's specs. This file should be loaded after `jasmine.js`, but before any project source files or spec files are loaded. Thus this file can also be used to customize Jasmine for a project.

 If a project is using Jasmine via the standalone distribution, this file can be customized directly. If a project is using Jasmine via the [Ruby gem][jasmine-gem], this file can be copied into the support directory via `jasmine copy_boot_js`. Other environments (e.g., Python) will have different mechanisms.

 The location of `boot.js` can be specified and/or overridden in `jasmine.yml`.

 [jasmine-gem]: http://github.com/pivotal/jasmine-gem
 */

/* global exports, console, jasmineRequire, jasmineReporters */

(function() {

  /**
   * ## Require &amp; Instantiate
   *
   * Require Jasmine's core files. Specifically, this requires and attaches all of Jasmine's code to the `jasmine` reference.
   */
  window.jasmine = jasmineRequire.core(jasmineRequire);

  /**
   * Since this is being run in a browser and the results should populate to an HTML page, require the HTML-specific Jasmine code, injecting the same reference.
   */
  jasmineRequire.html(jasmine);

  /**
   * Create the Jasmine environment. This is used to run all specs in a project.
   */
  var env = jasmine.getEnv();

  /**
   * ## The Global Interface
   *
   * Build up the functions that will be exposed as the Jasmine public interface. A project can customize, rename or alias any of these functions as desired, provided the implementation remains unchanged.
   */
  var jasmineInterface = jasmineRequire.interface(jasmine, env);

  /**
   * Helper function for readability.
   */
  function extend(destination, source) {
    for (var property in source) {
        if (source.hasOwnProperty(property)) {
            destination[property] = source[property];
        }
    }
    return destination;
  }

  /**
   * Add all of the Jasmine global/public interface to the proper global, so a project can use the public interface directly. For example, calling `describe` in specs instead of `jasmine.getEnv().describe`.
   */
  if (typeof window === 'undefined' && typeof exports === 'object') {
    extend(exports, jasmineInterface);
  } else {
    extend(window, jasmineInterface);
  }

  /**
   * ## Runner Parameters
   *
   * More browser specific code - wrap the query string in an object and to allow for getting/setting parameters from the runner user interface.
   */

  var queryString = new jasmine.QueryString({
    getWindowLocation: function() { return window.location; }
  });

  var catchingExceptions = queryString.getParam('catch');
  env.catchExceptions(typeof catchingExceptions === 'undefined' ? true : catchingExceptions);

  /**
   * ## Reporters
   * The `ConsoleReporter` reports tests results to the HTML browser console
   */
  var consoleReporter = new jasmineRequire.ConsoleReporter()({
    print: function(msg) {
      console.log(msg);
    }
  });

  var HtmlReporter = new jasmineRequire.HtmlReporter(jasmine);
  var htmlReporter = new HtmlReporter({
    env: env,
    onRaiseExceptionsClick: function() { queryString.setParam('catch', !env.catchingExceptions()); },
    getContainer: function() {
      var el = document.getElementById('autoPaw_results');
      if (!el) {
        throw new Error('Jasmine results iframe not found. #autoPaw_results');
      }
      var ifrm = (el.contentWindow) ? el.contentWindow : (el.contentDocument.document) ? el.contentDocument.document : el.contentDocument;
      var ibody = ifrm.document.body;
      return ibody;
    },
    createElement: function() { return document.createElement.apply(document, arguments); },
    createTextNode: function() { return document.createTextNode.apply(document, arguments); },
    timer: new jasmine.Timer()
  });
  htmlReporter.initialize();

  var allDoneReporter = new jasmineRequire.DoneReporter()();

  /**
   * The `jsApiReporter` also receives spec results, and is used by any environment that needs to extract the results  from JavaScript.
   */
  env.addReporter(jasmineInterface.jsApiReporter);
  env.addReporter(htmlReporter);
  env.addReporter(consoleReporter);
  env.addReporter(allDoneReporter);

  // instantiate JSReporter on the jasmine global and add a new reporter
  jasmineRequire.JSReporter2();
  env.addReporter(new jasmine.JSReporter2());

  // instantiate junit reporter
  var junitReporter = new jasmineReporters.JUnitXmlReporter();
  env.addReporter(junitReporter);

  /**
   * Filter which specs will be run by matching the start of the full name against the `spec` query param.
   */
  var specFilter = new jasmine.HtmlSpecFilter({
    filterString: function() { return queryString.getParam('spec'); }
  });

  env.specFilter = function(spec) {
    return specFilter.matches(spec.getFullName());
  };

  /**
   * Setting up timing functions to be able to be overridden. Certain browsers (Safari, IE 8, phantomjs) require this hack.
   */
  window.setTimeout = window.setTimeout;
  window.setInterval = window.setInterval;
  window.clearTimeout = window.clearTimeout;
  window.clearInterval = window.clearInterval;

}());
