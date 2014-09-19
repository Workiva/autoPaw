
function getJasmineRequireObj() {
  if (typeof module !== 'undefined' && module.exports) {
    return exports;
  } else {
    window.jasmineRequire = window.jasmineRequire || {};
    return window.jasmineRequire;
  }
}

getJasmineRequireObj().done = function(jRequire, j$) {
  j$.ConsoleReporter = jRequire.ConsoleReporter();
};

getJasmineRequireObj().DoneReporter = function() {

  function DoneReporter() {

    var resolver = null;

    window.testsDone = new Promise(function(resolve) {
      resolver = resolve;
    });

    this.jasmineDone = function() {
      resolver();
    };

    return this;
  }

  return DoneReporter;
};
