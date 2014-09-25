/*
Copyright (c) 2008-2014 Pivotal Labs

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
function getJasmineRequireObj() {
  if (typeof module !== 'undefined' && module.exports) {
    return exports;
  } else {
    window.jasmineRequire = window.jasmineRequire || {};
    return window.jasmineRequire;
  }
}

getJasmineRequireObj().core = function(jRequire) {
  var j$ = {};

  jRequire.base(j$);
  j$.util = jRequire.util();
  j$.Any = jRequire.Any();
  j$.CallTracker = jRequire.CallTracker();
  j$.MockDate = jRequire.MockDate();
  j$.Clock = jRequire.Clock();
  j$.DelayedFunctionScheduler = jRequire.DelayedFunctionScheduler();
  j$.Env = jRequire.Env(j$);
  j$.ExceptionFormatter = jRequire.ExceptionFormatter();
  j$.Expectation = jRequire.Expectation();
  j$.buildExpectationResult = jRequire.buildExpectationResult();
  j$.JsApiReporter = jRequire.JsApiReporter();
  j$.matchersUtil = jRequire.matchersUtil(j$);
  j$.ObjectContaining = jRequire.ObjectContaining(j$);
  j$.pp = jRequire.pp(j$);
  j$.QueueRunner = jRequire.QueueRunner(j$);
  j$.ReportDispatcher = jRequire.ReportDispatcher();
  j$.Spec = jRequire.Spec(j$);
  j$.SpyStrategy = jRequire.SpyStrategy();
  j$.Suite = jRequire.Suite();
  j$.Timer = jRequire.Timer();
  j$.version = jRequire.version();

  j$.matchers = jRequire.requireMatchers(jRequire, j$);

  return j$;
};

getJasmineRequireObj().requireMatchers = function(jRequire, j$) {
  var availableMatchers = [
      'toBe',
      'toBeCloseTo',
      'toBeDefined',
      'toBeFalsy',
      'toBeGreaterThan',
      'toBeLessThan',
      'toBeNaN',
      'toBeNull',
      'toBeTruthy',
      'toBeUndefined',
      'toContain',
      'toEqual',
      'toHaveBeenCalled',
      'toHaveBeenCalledWith',
      'toMatch',
      'toThrow',
      'toThrowError'
    ],
    matchers = {};

  for (var i = 0; i < availableMatchers.length; i++) {
    var name = availableMatchers[i];
    matchers[name] = jRequire[name](j$);
  }

  return matchers;
};

getJasmineRequireObj().base = (function (jasmineGlobal) {
  if (typeof module !== 'undefined' && module.exports) {
    jasmineGlobal = global;
  }

  return function(j$) {
    j$.unimplementedMethod_ = function() {
      throw new Error('unimplemented method');
    };

    j$.MAX_PRETTY_PRINT_DEPTH = 40;
    j$.MAX_PRETTY_PRINT_ARRAY_LENGTH = 100;
    j$.DEFAULT_TIMEOUT_INTERVAL = 5000;

    j$.getGlobal = function() {
      return jasmineGlobal;
    };

    j$.getEnv = function(options) {
      var env = j$.currentEnv_ = j$.currentEnv_ || new j$.Env(options);
      //jasmine. singletons in here (setTimeout blah blah).
      return env;
    };

    j$.isArray_ = function(value) {
      return j$.isA_('Array', value);
    };

    j$.isString_ = function(value) {
      return j$.isA_('String', value);
    };

    j$.isNumber_ = function(value) {
      return j$.isA_('Number', value);
    };

    j$.isA_ = function(typeName, value) {
      return Object.prototype.toString.apply(value) === '[object ' + typeName + ']';
    };

    j$.isDomNode = function(obj) {
      return obj.nodeType > 0;
    };

    j$.any = function(clazz) {
      return new j$.Any(clazz);
    };

    j$.objectContaining = function(sample) {
      return new j$.ObjectContaining(sample);
    };

    j$.createSpy = function(name, originalFn) {

      var spyStrategy = new j$.SpyStrategy({
          name: name,
          fn: originalFn,
          getSpy: function() { return spy; }
        }),
        callTracker = new j$.CallTracker(),
        spy = function() {
          callTracker.track({
            object: this,
            args: Array.prototype.slice.apply(arguments)
          });
          return spyStrategy.exec.apply(this, arguments);
        };

      for (var prop in originalFn) {
        if (prop === 'and' || prop === 'calls') {
          throw new Error('Jasmine spies would overwrite the \'and\' and \'calls\' properties on the object being spied upon');
        }

        spy[prop] = originalFn[prop];
      }

      spy.and = spyStrategy;
      spy.calls = callTracker;

      return spy;
    };

    j$.isSpy = function(putativeSpy) {
      if (!putativeSpy) {
        return false;
      }
      return putativeSpy.and instanceof j$.SpyStrategy &&
        putativeSpy.calls instanceof j$.CallTracker;
    };

    j$.createSpyObj = function(baseName, methodNames) {
      if (!j$.isArray_(methodNames) || methodNames.length === 0) {
        throw 'createSpyObj requires a non-empty array of method names to create spies for';
      }
      var obj = {};
      for (var i = 0; i < methodNames.length; i++) {
        obj[methodNames[i]] = j$.createSpy(baseName + '.' + methodNames[i]);
      }
      return obj;
    };
  };
})(this);

getJasmineRequireObj().util = function() {

  var util = {};

  util.inherit = function(childClass, parentClass) {
    var Subclass = function() {
    };
    Subclass.prototype = parentClass.prototype;
    childClass.prototype = new Subclass();
  };

  util.htmlEscape = function(str) {
    if (!str) {
      return str;
    }
    return str.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  };

  util.argsToArray = function(args) {
    var arrayOfArgs = [];
    for (var i = 0; i < args.length; i++) {
      arrayOfArgs.push(args[i]);
    }
    return arrayOfArgs;
  };

  util.isUndefined = function(obj) {
    return obj === void 0;
  };

  util.arrayContains = function(array, search) {
    var i = array.length;
    while (i--) {
      if (array[i] == search) {
        return true;
      }
    }
    return false;
  };

  return util;
};

getJasmineRequireObj().Spec = function(j$) {
  function Spec(attrs) {
    this.expectationFactory = attrs.expectationFactory;
    this.resultCallback = attrs.resultCallback || function() {};
    this.id = attrs.id;
    this.description = attrs.description || '';
    this.fn = attrs.fn;
    this.beforeFns = attrs.beforeFns || function() { return []; };
    this.afterFns = attrs.afterFns || function() { return []; };
    this.onStart = attrs.onStart || function() {};
    this.exceptionFormatter = attrs.exceptionFormatter || function() {};
    this.getSpecName = attrs.getSpecName || function() { return ''; };
    this.expectationResultFactory = attrs.expectationResultFactory || function() { };
    this.queueRunnerFactory = attrs.queueRunnerFactory || function() {};
    this.catchingExceptions = attrs.catchingExceptions || function() { return true; };

    if (!this.fn) {
      this.pend();
    }

    this.result = {
      id: this.id,
      description: this.description,
      fullName: this.getFullName(),
      failedExpectations: [],
      passedExpectations: []
    };
  }

  Spec.prototype.addExpectationResult = function(passed, data) {
    var expectationResult = this.expectationResultFactory(data);
    if (passed) {
      this.result.passedExpectations.push(expectationResult);
    } else {
      this.result.failedExpectations.push(expectationResult);
    }
  };

  Spec.prototype.expect = function(actual) {
    return this.expectationFactory(actual, this);
  };

  Spec.prototype.execute = function(onComplete) {
    var self = this;

    this.onStart(this);

    if (this.markedPending || this.disabled) {
      complete();
      return;
    }

    var allFns = this.beforeFns().concat(this.fn).concat(this.afterFns());

    this.queueRunnerFactory({
      fns: allFns,
      onException: onException,
      onComplete: complete,
      enforceTimeout: function() { return true; }
    });

    function onException(e) {
      if (Spec.isPendingSpecException(e)) {
        self.pend();
        return;
      }

      self.addExpectationResult(false, {
        matcherName: '',
        passed: false,
        expected: '',
        actual: '',
        error: e
      });
    }

    function complete() {
      self.result.status = self.status();
      self.resultCallback(self.result);

      if (onComplete) {
        onComplete();
      }
    }
  };

  Spec.prototype.disable = function() {
    this.disabled = true;
  };

  Spec.prototype.pend = function() {
    this.markedPending = true;
  };

  Spec.prototype.status = function() {
    if (this.disabled) {
      return 'disabled';
    }

    if (this.markedPending) {
      return 'pending';
    }

    if (this.result.failedExpectations.length > 0) {
      return 'failed';
    } else {
      return 'passed';
    }
  };

  Spec.prototype.getFullName = function() {
    return this.getSpecName(this);
  };

  Spec.pendingSpecExceptionMessage = '=> marked Pending';

  Spec.isPendingSpecException = function(e) {
    return !!(e && e.toString && e.toString().indexOf(Spec.pendingSpecExceptionMessage) !== -1);
  };

  return Spec;
};

if (typeof window == void 0 && typeof exports == 'object') {
  exports.Spec = jasmineRequire.Spec;
}

getJasmineRequireObj().Env = function(j$) {
  function Env(options) {
    options = options || {};

    var self = this;
    var global = options.global || j$.getGlobal();

    var totalSpecsDefined = 0;

    var catchExceptions = true;

    var realSetTimeout = j$.getGlobal().setTimeout;
    var realClearTimeout = j$.getGlobal().clearTimeout;
    this.clock = new j$.Clock(global, new j$.DelayedFunctionScheduler(), new j$.MockDate(global));

    var runnableLookupTable = {};

    var spies = [];

    var currentSpec = null;
    var currentSuite = null;

    var reporter = new j$.ReportDispatcher([
      'jasmineStarted',
      'jasmineDone',
      'suiteStarted',
      'suiteDone',
      'specStarted',
      'specDone'
    ]);

    this.specFilter = function() {
      return true;
    };

    var equalityTesters = [];

    var customEqualityTesters = [];
    this.addCustomEqualityTester = function(tester) {
      customEqualityTesters.push(tester);
    };

    j$.Expectation.addCoreMatchers(j$.matchers);

    var nextSpecId = 0;
    var getNextSpecId = function() {
      return 'spec' + nextSpecId++;
    };

    var nextSuiteId = 0;
    var getNextSuiteId = function() {
      return 'suite' + nextSuiteId++;
    };

    var expectationFactory = function(actual, spec) {
      return j$.Expectation.Factory({
        util: j$.matchersUtil,
        customEqualityTesters: customEqualityTesters,
        actual: actual,
        addExpectationResult: addExpectationResult
      });

      function addExpectationResult(passed, result) {
        return spec.addExpectationResult(passed, result);
      }
    };

    var specStarted = function(spec) {
      currentSpec = spec;
      reporter.specStarted(spec.result);
    };

    var beforeFns = function(suite) {
      return function() {
        var befores = [];
        while(suite) {
          befores = befores.concat(suite.beforeFns);
          suite = suite.parentSuite;
        }
        return befores.reverse();
      };
    };

    var afterFns = function(suite) {
      return function() {
        var afters = [];
        while(suite) {
          afters = afters.concat(suite.afterFns);
          suite = suite.parentSuite;
        }
        return afters;
      };
    };

    var getSpecName = function(spec, suite) {
      return suite.getFullName() + ' ' + spec.description;
    };

    // TODO: we may just be able to pass in the fn instead of wrapping here
    var buildExpectationResult = j$.buildExpectationResult,
        exceptionFormatter = new j$.ExceptionFormatter(),
        expectationResultFactory = function(attrs) {
          attrs.messageFormatter = exceptionFormatter.message;
          attrs.stackFormatter = exceptionFormatter.stack;

          return buildExpectationResult(attrs);
        };

    // TODO: fix this naming, and here's where the value comes in
    this.catchExceptions = function(value) {
      catchExceptions = !!value;
      return catchExceptions;
    };

    this.catchingExceptions = function() {
      return catchExceptions;
    };

    var maximumSpecCallbackDepth = 20;
    var currentSpecCallbackDepth = 0;

    function clearStack(fn) {
      currentSpecCallbackDepth++;
      if (currentSpecCallbackDepth >= maximumSpecCallbackDepth) {
        currentSpecCallbackDepth = 0;
        realSetTimeout(fn, 0);
      } else {
        fn();
      }
    }

    var catchException = function(e) {
      return j$.Spec.isPendingSpecException(e) || catchExceptions;
    };

    var queueRunnerFactory = function(options) {
      options.catchException = catchException;
      options.clearStack = options.clearStack || clearStack;
      options.timer = {setTimeout: realSetTimeout, clearTimeout: realClearTimeout};

      new j$.QueueRunner(options).execute();
    };

    var topSuite = new j$.Suite({
      env: this,
      id: getNextSuiteId(),
      description: 'Jasmine__TopLevel__Suite',
      queueRunner: queueRunnerFactory,
      resultCallback: function() {} // TODO - hook this up
    });
    runnableLookupTable[topSuite.id] = topSuite;
    currentSuite = topSuite;

    this.topSuite = function() {
      return topSuite;
    };

    this.execute = function(runnablesToRun) {
      runnablesToRun = runnablesToRun || [topSuite.id];

      var allFns = [];
      for(var i = 0; i < runnablesToRun.length; i++) {
        var runnable = runnableLookupTable[runnablesToRun[i]];
        allFns.push((function(runnable) { return function(done) { runnable.execute(done); }; })(runnable));
      }

      reporter.jasmineStarted({
        totalSpecsDefined: totalSpecsDefined
      });

      queueRunnerFactory({fns: allFns, onComplete: reporter.jasmineDone});
    };

    this.addReporter = function(reporterToAdd) {
      reporter.addReporter(reporterToAdd);
    };

    this.addMatchers = function(matchersToAdd) {
      j$.Expectation.addMatchers(matchersToAdd);
    };

    this.spyOn = function(obj, methodName) {
      if (j$.util.isUndefined(obj)) {
        throw new Error('spyOn could not find an object to spy upon for ' + methodName + '()');
      }

      if (j$.util.isUndefined(obj[methodName])) {
        throw new Error(methodName + '() method does not exist');
      }

      if (obj[methodName] && j$.isSpy(obj[methodName])) {
        //TODO?: should this return the current spy? Downside: may cause user confusion about spy state
        throw new Error(methodName + ' has already been spied upon');
      }

      var spy = j$.createSpy(methodName, obj[methodName]);

      spies.push({
        spy: spy,
        baseObj: obj,
        methodName: methodName,
        originalValue: obj[methodName]
      });

      obj[methodName] = spy;

      return spy;
    };

    var suiteFactory = function(description) {
      var suite = new j$.Suite({
        env: self,
        id: getNextSuiteId(),
        description: description,
        parentSuite: currentSuite,
        queueRunner: queueRunnerFactory,
        onStart: suiteStarted,
        resultCallback: function(attrs) {
          reporter.suiteDone(attrs);
        }
      });

      runnableLookupTable[suite.id] = suite;
      return suite;
    };

    this.describe = function(description, specDefinitions) {
      var suite = suiteFactory(description);

      var parentSuite = currentSuite;
      parentSuite.addChild(suite);
      currentSuite = suite;

      var declarationError = null;
      try {
        specDefinitions.call(suite);
      } catch (e) {
        declarationError = e;
      }

      if (declarationError) {
        this.it('encountered a declaration exception', function() {
          throw declarationError;
        });
      }

      currentSuite = parentSuite;

      return suite;
    };

    this.xdescribe = function(description, specDefinitions) {
      var suite = this.describe(description, specDefinitions);
      suite.disable();
      return suite;
    };

    var specFactory = function(description, fn, suite) {
      totalSpecsDefined++;

      var spec = new j$.Spec({
        id: getNextSpecId(),
        beforeFns: beforeFns(suite),
        afterFns: afterFns(suite),
        expectationFactory: expectationFactory,
        exceptionFormatter: exceptionFormatter,
        resultCallback: specResultCallback,
        getSpecName: function(spec) {
          return getSpecName(spec, suite);
        },
        onStart: specStarted,
        description: description,
        expectationResultFactory: expectationResultFactory,
        queueRunnerFactory: queueRunnerFactory,
        fn: fn
      });

      runnableLookupTable[spec.id] = spec;

      if (!self.specFilter(spec)) {
        spec.disable();
      }

      return spec;

      function removeAllSpies() {
        for (var i = 0; i < spies.length; i++) {
          var spyEntry = spies[i];
          spyEntry.baseObj[spyEntry.methodName] = spyEntry.originalValue;
        }
        spies = [];
      }

      function specResultCallback(result) {
        removeAllSpies();
        j$.Expectation.resetMatchers();
        customEqualityTesters = [];
        currentSpec = null;
        reporter.specDone(result);
      }
    };

    var suiteStarted = function(suite) {
      reporter.suiteStarted(suite.result);
    };

    this.it = function(description, fn) {
      var spec = specFactory(description, fn, currentSuite);
      currentSuite.addChild(spec);
      return spec;
    };

    this.xit = function(description, fn) {
      var spec = this.it(description, fn);
      spec.pend();
      return spec;
    };

    this.expect = function(actual) {
      if (!currentSpec) {
        throw new Error('\'expect\' was used when there was no current spec, this could be because an asynchronous test timed out');
      }

      return currentSpec.expect(actual);
    };

    this.beforeEach = function(beforeEachFunction) {
      currentSuite.beforeEach(beforeEachFunction);
    };

    this.afterEach = function(afterEachFunction) {
      currentSuite.afterEach(afterEachFunction);
    };

    this.pending = function() {
      throw j$.Spec.pendingSpecExceptionMessage;
    };
  }

  return Env;
};

getJasmineRequireObj().JsApiReporter = function() {

  var noopTimer = {
    start: function(){},
    elapsed: function(){ return 0; }
  };

  function JsApiReporter(options) {
    var timer = options.timer || noopTimer,
        status = 'loaded';

    this.started = false;
    this.finished = false;

    this.jasmineStarted = function() {
      this.started = true;
      status = 'started';
      timer.start();
    };

    var executionTime;

    this.jasmineDone = function() {
      this.finished = true;
      executionTime = timer.elapsed();
      status = 'done';
    };

    this.status = function() {
      return status;
    };

    var suites = {};

    this.suiteStarted = function(result) {
      storeSuite(result);
    };

    this.suiteDone = function(result) {
      storeSuite(result);
    };

    function storeSuite(result) {
      suites[result.id] = result;
    }

    this.suites = function() {
      return suites;
    };

    var specs = [];
    this.specStarted = function(result) { };

    this.specDone = function(result) {
      specs.push(result);
    };

    this.specResults = function(index, length) {
      return specs.slice(index, index + length);
    };

    this.specs = function() {
      return specs;
    };

    this.executionTime = function() {
      return executionTime;
    };

  }

  return JsApiReporter;
};

getJasmineRequireObj().Any = function() {

  function Any(expectedObject) {
    this.expectedObject = expectedObject;
  }

  Any.prototype.jasmineMatches = function(other) {
    if (this.expectedObject == String) {
      return typeof other == 'string' || other instanceof String;
    }

    if (this.expectedObject == Number) {
      return typeof other == 'number' || other instanceof Number;
    }

    if (this.expectedObject == Function) {
      return typeof other == 'function' || other instanceof Function;
    }

    if (this.expectedObject == Object) {
      return typeof other == 'object';
    }
    
    if (this.expectedObject == Boolean) {
      return typeof other == 'boolean';
    }

    return other instanceof this.expectedObject;
  };

  Any.prototype.jasmineToString = function() {
    return '<jasmine.any(' + this.expectedObject + ')>';
  };

  return Any;
};

getJasmineRequireObj().CallTracker = function() {

  function CallTracker() {
    var calls = [];

    this.track = function(context) {
      calls.push(context);
    };

    this.any = function() {
      return !!calls.length;
    };

    this.count = function() {
      return calls.length;
    };

    this.argsFor = function(index) {
      var call = calls[index];
      return call ? call.args : [];
    };

    this.all = function() {
      return calls;
    };

    this.allArgs = function() {
      var callArgs = [];
      for(var i = 0; i < calls.length; i++){
        callArgs.push(calls[i].args);
      }

      return callArgs;
    };

    this.first = function() {
      return calls[0];
    };

    this.mostRecent = function() {
      return calls[calls.length - 1];
    };

    this.reset = function() {
      calls = [];
    };
  }

  return CallTracker;
};

getJasmineRequireObj().Clock = function() {
  function Clock(global, delayedFunctionScheduler, mockDate) {
    var self = this,
      realTimingFunctions = {
        setTimeout: global.setTimeout,
        clearTimeout: global.clearTimeout,
        setInterval: global.setInterval,
        clearInterval: global.clearInterval
      },
      fakeTimingFunctions = {
        setTimeout: setTimeout,
        clearTimeout: clearTimeout,
        setInterval: setInterval,
        clearInterval: clearInterval
      },
      installed = false,
      timer;


    self.install = function() {
      replace(global, fakeTimingFunctions);
      timer = fakeTimingFunctions;
      installed = true;

      return self;
    };

    self.uninstall = function() {
      delayedFunctionScheduler.reset();
      mockDate.uninstall();
      replace(global, realTimingFunctions);

      timer = realTimingFunctions;
      installed = false;
    };

    self.mockDate = function(initialDate) {
      mockDate.install(initialDate);
    };

    self.setTimeout = function(fn, delay, params) {
      if (legacyIE()) {
        if (arguments.length > 2) {
          throw new Error('IE < 9 cannot support extra params to setTimeout without a polyfill');
        }
        return timer.setTimeout(fn, delay);
      }
      return Function.prototype.apply.apply(timer.setTimeout, [global, arguments]);
    };

    self.setInterval = function(fn, delay, params) {
      if (legacyIE()) {
        if (arguments.length > 2) {
          throw new Error('IE < 9 cannot support extra params to setInterval without a polyfill');
        }
        return timer.setInterval(fn, delay);
      }
      return Function.prototype.apply.apply(timer.setInterval, [global, arguments]);
    };

    self.clearTimeout = function(id) {
      return Function.prototype.call.apply(timer.clearTimeout, [global, id]);
    };

    self.clearInterval = function(id) {
      return Function.prototype.call.apply(timer.clearInterval, [global, id]);
    };

    self.tick = function(millis) {
      if (installed) {
        mockDate.tick(millis);
        delayedFunctionScheduler.tick(millis);
      } else {
        throw new Error('Mock clock is not installed, use jasmine.clock().install()');
      }
    };

    return self;

    function legacyIE() {
      //if these methods are polyfilled, apply will be present
      return !(realTimingFunctions.setTimeout || realTimingFunctions.setInterval).apply;
    }

    function replace(dest, source) {
      for (var prop in source) {
        dest[prop] = source[prop];
      }
    }

    function setTimeout(fn, delay) {
      return delayedFunctionScheduler.scheduleFunction(fn, delay, argSlice(arguments, 2));
    }

    function clearTimeout(id) {
      return delayedFunctionScheduler.removeFunctionWithId(id);
    }

    function setInterval(fn, interval) {
      return delayedFunctionScheduler.scheduleFunction(fn, interval, argSlice(arguments, 2), true);
    }

    function clearInterval(id) {
      return delayedFunctionScheduler.removeFunctionWithId(id);
    }

    function argSlice(argsObj, n) {
      return Array.prototype.slice.call(argsObj, n);
    }
  }

  return Clock;
};

getJasmineRequireObj().DelayedFunctionScheduler = function() {
  function DelayedFunctionScheduler() {
    var self = this;
    var scheduledLookup = [];
    var scheduledFunctions = {};
    var currentTime = 0;
    var delayedFnCount = 0;

    self.tick = function(millis) {
      millis = millis || 0;
      var endTime = currentTime + millis;

      runScheduledFunctions(endTime);
      currentTime = endTime;
    };

    self.scheduleFunction = function(funcToCall, millis, params, recurring, timeoutKey, runAtMillis) {
      var f;
      if (typeof(funcToCall) === 'string') {
        /* jshint evil: true */
        f = function() { return eval(funcToCall); };
        /* jshint evil: false */
      } else {
        f = funcToCall;
      }

      millis = millis || 0;
      timeoutKey = timeoutKey || ++delayedFnCount;
      runAtMillis = runAtMillis || (currentTime + millis);

      var funcToSchedule = {
        runAtMillis: runAtMillis,
        funcToCall: f,
        recurring: recurring,
        params: params,
        timeoutKey: timeoutKey,
        millis: millis
      };

      if (runAtMillis in scheduledFunctions) {
        scheduledFunctions[runAtMillis].push(funcToSchedule);
      } else {
        scheduledFunctions[runAtMillis] = [funcToSchedule];
        scheduledLookup.push(runAtMillis);
        scheduledLookup.sort(function (a, b) {
          return a - b;
        });
      }

      return timeoutKey;
    };

    self.removeFunctionWithId = function(timeoutKey) {
      for (var runAtMillis in scheduledFunctions) {
        var funcs = scheduledFunctions[runAtMillis];
        var i = indexOfFirstToPass(funcs, function (func) {
          return func.timeoutKey === timeoutKey;
        });

        if (i > -1) {
          if (funcs.length === 1) {
            delete scheduledFunctions[runAtMillis];
            deleteFromLookup(runAtMillis);
          } else {
            funcs.splice(i, 1);
          }

          // intervals get rescheduled when executed, so there's never more
          // than a single scheduled function with a given timeoutKey
          break;
        }
      }
    };

    self.reset = function() {
      currentTime = 0;
      scheduledLookup = [];
      scheduledFunctions = {};
      delayedFnCount = 0;
    };

    return self;

    function indexOfFirstToPass(array, testFn) {
      var index = -1;

      for (var i = 0; i < array.length; ++i) {
        if (testFn(array[i])) {
          index = i;
          break;
        }
      }

      return index;
    }

    function deleteFromLookup(key) {
      var value = Number(key);
      var i = indexOfFirstToPass(scheduledLookup, function (millis) {
        return millis === value;
      });

      if (i > -1) {
        scheduledLookup.splice(i, 1);
      }
    }

    function reschedule(scheduledFn) {
      self.scheduleFunction(scheduledFn.funcToCall,
        scheduledFn.millis,
        scheduledFn.params,
        true,
        scheduledFn.timeoutKey,
        scheduledFn.runAtMillis + scheduledFn.millis);
    }

    function runScheduledFunctions(endTime) {
      if (scheduledLookup.length === 0 || scheduledLookup[0] > endTime) {
        return;
      }

      do {
        currentTime = scheduledLookup.shift();

        var funcsToRun = scheduledFunctions[currentTime];
        delete scheduledFunctions[currentTime];

        for (var i = 0; i < funcsToRun.length; ++i) {
          var funcToRun = funcsToRun[i];
          funcToRun.funcToCall.apply(null, funcToRun.params || []);

          if (funcToRun.recurring) {
            reschedule(funcToRun);
          }
        }
      } while (scheduledLookup.length > 0 &&
              // checking first if we're out of time prevents setTimeout(0)
              // scheduled in a funcToRun from forcing an extra iteration
                 currentTime !== endTime  &&
                 scheduledLookup[0] <= endTime);
    }
  }

  return DelayedFunctionScheduler;
};

getJasmineRequireObj().ExceptionFormatter = function() {
  function ExceptionFormatter() {
    this.message = function(error) {
      var message = '';

      if (error.name && error.message) {
        message += error.name + ': ' + error.message;
      } else {
        message += error.toString() + ' thrown';
      }

      if (error.fileName || error.sourceURL) {
        message += ' in ' + (error.fileName || error.sourceURL);
      }

      if (error.line || error.lineNumber) {
        message += ' (line ' + (error.line || error.lineNumber) + ')';
      }

      return message;
    };

    this.stack = function(error) {
      return error ? error.stack : null;
    };
  }

  return ExceptionFormatter;
};

getJasmineRequireObj().Expectation = function() {

  var matchers = {};

  function Expectation(options) {
    this.util = options.util || { buildFailureMessage: function() {} };
    this.customEqualityTesters = options.customEqualityTesters || [];
    this.actual = options.actual;
    this.addExpectationResult = options.addExpectationResult || function(){};
    this.isNot = options.isNot;

    for (var matcherName in matchers) {
      this[matcherName] = matchers[matcherName];
    }
  }

  Expectation.prototype.wrapCompare = function(name, matcherFactory) {
    return function() {
      var args = Array.prototype.slice.call(arguments, 0),
        expected = args.slice(0),
        message = '';

      args.unshift(this.actual);

      var matcher = matcherFactory(this.util, this.customEqualityTesters),
          matcherCompare = matcher.compare;

      function defaultNegativeCompare() {
        var result = matcher.compare.apply(null, args);
        result.pass = !result.pass;
        return result;
      }

      if (this.isNot) {
        matcherCompare = matcher.negativeCompare || defaultNegativeCompare;
      }

      var result = matcherCompare.apply(null, args);

      if (!result.pass) {
        if (!result.message) {
          args.unshift(this.isNot);
          args.unshift(name);
          message = this.util.buildFailureMessage.apply(null, args);
        } else {
          if (Object.prototype.toString.apply(result.message) === '[object Function]') {
            message = result.message();
          } else {
            message = result.message;
          }
        }
      }

      if (expected.length == 1) {
        expected = expected[0];
      }

      // TODO: how many of these params are needed?
      this.addExpectationResult(
        result.pass,
        {
          matcherName: name,
          passed: result.pass,
          message: message,
          actual: this.actual,
          expected: expected // TODO: this may need to be arrayified/sliced
        }
      );
    };
  };

  Expectation.addCoreMatchers = function(matchers) {
    var prototype = Expectation.prototype;
    for (var matcherName in matchers) {
      var matcher = matchers[matcherName];
      prototype[matcherName] = prototype.wrapCompare(matcherName, matcher);
    }
  };

  Expectation.addMatchers = function(matchersToAdd) {
    for (var name in matchersToAdd) {
      var matcher = matchersToAdd[name];
      matchers[name] = Expectation.prototype.wrapCompare(name, matcher);
    }
  };

  Expectation.resetMatchers = function() {
    for (var name in matchers) {
      delete matchers[name];
    }
  };

  Expectation.Factory = function(options) {
    options = options || {};

    var expect = new Expectation(options);

    // TODO: this would be nice as its own Object - NegativeExpectation
    // TODO: copy instead of mutate options
    options.isNot = true;
    expect.not = new Expectation(options);

    return expect;
  };

  return Expectation;
};

//TODO: expectation result may make more sense as a presentation of an expectation.
getJasmineRequireObj().buildExpectationResult = function() {
  function buildExpectationResult(options) {
    var messageFormatter = options.messageFormatter || function() {},
      stackFormatter = options.stackFormatter || function() {};

    return {
      matcherName: options.matcherName,
      expected: options.expected,
      actual: options.actual,
      message: message(),
      stack: stack(),
      passed: options.passed
    };

    function message() {
      if (options.passed) {
        return 'Passed.';
      } else if (options.message) {
        return options.message;
      } else if (options.error) {
        return messageFormatter(options.error);
      }
      return '';
    }

    function stack() {
      if (options.passed) {
        return '';
      }

      var error = options.error;
      if (!error) {
        try {
          throw new Error(message());
        } catch (e) {
          error = e;
        }
      }
      return stackFormatter(error);
    }
  }

  return buildExpectationResult;
};

getJasmineRequireObj().MockDate = function() {
  function MockDate(global) {
    var self = this;
    var currentTime = 0;

    if (!global || !global.Date) {
      self.install = function() {};
      self.tick = function() {};
      self.uninstall = function() {};
      return self;
    }

    var GlobalDate = global.Date;

    self.install = function(mockDate) {
      if (mockDate instanceof GlobalDate) {
        currentTime = mockDate.getTime();
      } else {
        currentTime = new GlobalDate().getTime();
      }

      global.Date = FakeDate;
    };

    self.tick = function(millis) {
      millis = millis || 0;
      currentTime = currentTime + millis;
    };

    self.uninstall = function() {
      currentTime = 0;
      global.Date = GlobalDate;
    };

    createDateProperties();

    return self;

    function FakeDate() {
      switch(arguments.length) {
        case 0:
          return new GlobalDate(currentTime);
        case 1:
          return new GlobalDate(arguments[0]);
        case 2:
          return new GlobalDate(arguments[0], arguments[1]);
        case 3:
          return new GlobalDate(arguments[0], arguments[1], arguments[2]);
        case 4:
          return new GlobalDate(arguments[0], arguments[1], arguments[2], arguments[3]);
        case 5:
          return new GlobalDate(arguments[0], arguments[1], arguments[2], arguments[3],
                                arguments[4]);
        case 6:
          return new GlobalDate(arguments[0], arguments[1], arguments[2], arguments[3],
                                arguments[4], arguments[5]);
        case 7:
          return new GlobalDate(arguments[0], arguments[1], arguments[2], arguments[3],
                                arguments[4], arguments[5], arguments[6]);
      }
    }

    function createDateProperties() {

      FakeDate.now = function() {
        if (GlobalDate.now) {
          return currentTime;
        } else {
          throw new Error('Browser does not support Date.now()');
        }
      };

      FakeDate.toSource = GlobalDate.toSource;
      FakeDate.toString = GlobalDate.toString;
      FakeDate.parse = GlobalDate.parse;
      FakeDate.UTC = GlobalDate.UTC;
    }
	}

  return MockDate;
};

getJasmineRequireObj().ObjectContaining = function(j$) {

  function ObjectContaining(sample) {
    this.sample = sample;
  }

  ObjectContaining.prototype.jasmineMatches = function(other, mismatchKeys, mismatchValues) {
    if (typeof(this.sample) !== 'object') { throw new Error('You must provide an object to objectContaining, not \''+this.sample+'\'.'); }

    mismatchKeys = mismatchKeys || [];
    mismatchValues = mismatchValues || [];

    var hasKey = function(obj, keyName) {
      return obj !== null && !j$.util.isUndefined(obj[keyName]);
    };

    for (var property in this.sample) {
      if (!hasKey(other, property) && hasKey(this.sample, property)) {
        mismatchKeys.push('expected has key \'' + property + '\', but missing from actual.');
      }
      else if (!j$.matchersUtil.equals(other[property], this.sample[property])) {
        mismatchValues.push('\'' + property + '\' was \'' + (other[property] ? j$.util.htmlEscape(other[property].toString()) : other[property]) + '\' in actual, but was \'' + (this.sample[property] ? j$.util.htmlEscape(this.sample[property].toString()) : this.sample[property]) + '\' in expected.');
      }
    }

    return (mismatchKeys.length === 0 && mismatchValues.length === 0);
  };

  ObjectContaining.prototype.jasmineToString = function() {
    return '<jasmine.objectContaining(' + j$.pp(this.sample) + ')>';
  };

  return ObjectContaining;
};

getJasmineRequireObj().pp = function(j$) {

  function PrettyPrinter() {
    this.ppNestLevel_ = 0;
    this.seen = [];
  }

  PrettyPrinter.prototype.format = function(value) {
    this.ppNestLevel_++;
    try {
      if (j$.util.isUndefined(value)) {
        this.emitScalar('undefined');
      } else if (value === null) {
        this.emitScalar('null');
      } else if (value === 0 && 1/value === -Infinity) {
        this.emitScalar('-0');
      } else if (value === j$.getGlobal()) {
        this.emitScalar('<global>');
      } else if (value.jasmineToString) {
        this.emitScalar(value.jasmineToString());
      } else if (typeof value === 'string') {
        this.emitString(value);
      } else if (j$.isSpy(value)) {
        this.emitScalar('spy on ' + value.and.identity());
      } else if (value instanceof RegExp) {
        this.emitScalar(value.toString());
      } else if (typeof value === 'function') {
        this.emitScalar('Function');
      } else if (typeof value.nodeType === 'number') {
        this.emitScalar('HTMLNode');
      } else if (value instanceof Date) {
        this.emitScalar('Date(' + value + ')');
      } else if (j$.util.arrayContains(this.seen, value)) {
        this.emitScalar('<circular reference: ' + (j$.isArray_(value) ? 'Array' : 'Object') + '>');
      } else if (j$.isArray_(value) || j$.isA_('Object', value)) {
        this.seen.push(value);
        if (j$.isArray_(value)) {
          this.emitArray(value);
        } else {
          this.emitObject(value);
        }
        this.seen.pop();
      } else {
        this.emitScalar(value.toString());
      }
    } finally {
      this.ppNestLevel_--;
    }
  };

  PrettyPrinter.prototype.iterateObject = function(obj, fn) {
    for (var property in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, property)) { continue; }
      fn(property, obj.__lookupGetter__ ? (!j$.util.isUndefined(obj.__lookupGetter__(property)) &&
          obj.__lookupGetter__(property) !== null) : false);
    }
  };

  PrettyPrinter.prototype.emitArray = j$.unimplementedMethod_;
  PrettyPrinter.prototype.emitObject = j$.unimplementedMethod_;
  PrettyPrinter.prototype.emitScalar = j$.unimplementedMethod_;
  PrettyPrinter.prototype.emitString = j$.unimplementedMethod_;

  function StringPrettyPrinter() {
    PrettyPrinter.call(this);

    this.string = '';
  }

  j$.util.inherit(StringPrettyPrinter, PrettyPrinter);

  StringPrettyPrinter.prototype.emitScalar = function(value) {
    this.append(value);
  };

  StringPrettyPrinter.prototype.emitString = function(value) {
    this.append('\'' + value + '\'');
  };

  StringPrettyPrinter.prototype.emitArray = function(array) {
    if (this.ppNestLevel_ > j$.MAX_PRETTY_PRINT_DEPTH) {
      this.append('Array');
      return;
    }
    var length = Math.min(array.length, j$.MAX_PRETTY_PRINT_ARRAY_LENGTH);
    this.append('[ ');
    for (var i = 0; i < length; i++) {
      if (i > 0) {
        this.append(', ');
      }
      this.format(array[i]);
    }
    if(array.length > length){
      this.append(', ...');
    }
    this.append(' ]');
  };

  StringPrettyPrinter.prototype.emitObject = function(obj) {
    if (this.ppNestLevel_ > j$.MAX_PRETTY_PRINT_DEPTH) {
      this.append('Object');
      return;
    }

    var self = this;
    this.append('{ ');
    var first = true;

    this.iterateObject(obj, function(property, isGetter) {
      if (first) {
        first = false;
      } else {
        self.append(', ');
      }

      self.append(property);
      self.append(': ');
      if (isGetter) {
        self.append('<getter>');
      } else {
        self.format(obj[property]);
      }
    });

    this.append(' }');
  };

  StringPrettyPrinter.prototype.append = function(value) {
    this.string += value;
  };

  return function(value) {
    var stringPrettyPrinter = new StringPrettyPrinter();
    stringPrettyPrinter.format(value);
    return stringPrettyPrinter.string;
  };
};

getJasmineRequireObj().QueueRunner = function(j$) {

  function once(fn) {
    var called = false;
    return function() {
      if (!called) {
        called = true;
        fn();
      }
    };
  }

  function QueueRunner(attrs) {
    this.fns = attrs.fns || [];
    this.onComplete = attrs.onComplete || function() {};
    this.clearStack = attrs.clearStack || function(fn) {fn();};
    this.onException = attrs.onException || function() {};
    this.catchException = attrs.catchException || function() { return true; };
    this.enforceTimeout = attrs.enforceTimeout || function() { return false; };
    this.userContext = {};
    this.timer = attrs.timeout || {setTimeout: setTimeout, clearTimeout: clearTimeout};
  }

  QueueRunner.prototype.execute = function() {
    this.run(this.fns, 0);
  };

  QueueRunner.prototype.run = function(fns, recursiveIndex) {
    var length = fns.length,
        self = this,
        iterativeIndex;

    for(iterativeIndex = recursiveIndex; iterativeIndex < length; iterativeIndex++) {
      var fn = fns[iterativeIndex];
      if (fn.length > 0) {
        return attemptAsync(fn);
      } else {
        attemptSync(fn);
      }
    }

    var runnerDone = iterativeIndex >= length;

    if (runnerDone) {
      this.clearStack(this.onComplete);
    }

    function attemptSync(fn) {
      try {
        fn.call(self.userContext);
      } catch (e) {
        handleException(e);
      }
    }

    function attemptAsync(fn) {
      var clearTimeout = function () {
          Function.prototype.apply.apply(self.timer.clearTimeout, [j$.getGlobal(), [timeoutId]]);
        },
        next = once(function () {
          clearTimeout(timeoutId);
          self.run(fns, iterativeIndex + 1);
        }),
        timeoutId;

      if (self.enforceTimeout()) {
        timeoutId = Function.prototype.apply.apply(self.timer.setTimeout, [j$.getGlobal(), [function() {
          self.onException(new Error('Timeout - Async callback was not invoked within timeout specified by jasmine.DEFAULT_TIMEOUT_INTERVAL.'));
          next();
        }, j$.DEFAULT_TIMEOUT_INTERVAL]]);
      }

      try {
        fn.call(self.userContext, next);
      } catch (e) {
        handleException(e);
        next();
      }
    }

    function handleException(e) {
      self.onException(e);
      if (!self.catchException(e)) {
        //TODO: set a var when we catch an exception and
        //use a finally block to close the loop in a nice way..
        throw e;
      }
    }
  };

  return QueueRunner;
};

getJasmineRequireObj().ReportDispatcher = function() {
  function ReportDispatcher(methods) {

    var dispatchedMethods = methods || [];

    for (var i = 0; i < dispatchedMethods.length; i++) {
      var method = dispatchedMethods[i];
      this[method] = (function(m) {
        return function() {
          dispatch(m, arguments);
        };
      }(method));
    }

    var reporters = [];

    this.addReporter = function(reporter) {
      reporters.push(reporter);
    };

    return this;

    function dispatch(method, args) {
      for (var i = 0; i < reporters.length; i++) {
        var reporter = reporters[i];
        if (reporter[method]) {
          reporter[method].apply(reporter, args);
        }
      }
    }
  }

  return ReportDispatcher;
};


getJasmineRequireObj().SpyStrategy = function() {

  function SpyStrategy(options) {
    options = options || {};

    var identity = options.name || 'unknown',
        originalFn = options.fn || function() {},
        getSpy = options.getSpy || function() {},
        plan = function() {};

    this.identity = function() {
      return identity;
    };

    this.exec = function() {
      return plan.apply(this, arguments);
    };

    this.callThrough = function() {
      plan = originalFn;
      return getSpy();
    };

    this.returnValue = function(value) {
      plan = function() {
        return value;
      };
      return getSpy();
    };

    this.throwError = function(something) {
      var error = (something instanceof Error) ? something : new Error(something);
      plan = function() {
        throw error;
      };
      return getSpy();
    };

    this.callFake = function(fn) {
      plan = fn;
      return getSpy();
    };

    this.stub = function(fn) {
      plan = function() {};
      return getSpy();
    };
  }

  return SpyStrategy;
};

getJasmineRequireObj().Suite = function() {
  function Suite(attrs) {
    this.env = attrs.env;
    this.id = attrs.id;
    this.parentSuite = attrs.parentSuite;
    this.description = attrs.description;
    this.onStart = attrs.onStart || function() {};
    this.resultCallback = attrs.resultCallback || function() {};
    this.clearStack = attrs.clearStack || function(fn) {fn();};

    this.beforeFns = [];
    this.afterFns = [];
    this.queueRunner = attrs.queueRunner || function() {};
    this.disabled = false;

    this.children = [];

    this.result = {
      id: this.id,
      status: this.disabled ? 'disabled' : '',
      description: this.description,
      fullName: this.getFullName()
    };
  }

  Suite.prototype.getFullName = function() {
    var fullName = this.description;
    for (var parentSuite = this.parentSuite; parentSuite; parentSuite = parentSuite.parentSuite) {
      if (parentSuite.parentSuite) {
        fullName = parentSuite.description + ' ' + fullName;
      }
    }
    return fullName;
  };

  Suite.prototype.disable = function() {
    this.disabled = true;
    this.result.status = 'disabled';
  };

  Suite.prototype.beforeEach = function(fn) {
    this.beforeFns.unshift(fn);
  };

  Suite.prototype.afterEach = function(fn) {
    this.afterFns.unshift(fn);
  };

  Suite.prototype.addChild = function(child) {
    this.children.push(child);
  };

  Suite.prototype.execute = function(onComplete) {
    var self = this;

    this.onStart(this);

    if (this.disabled) {
      complete();
      return;
    }

    var allFns = [];

    for (var i = 0; i < this.children.length; i++) {
      allFns.push(wrapChildAsAsync(this.children[i]));
    }

    this.queueRunner({
      fns: allFns,
      onComplete: complete
    });

    function complete() {
      self.resultCallback(self.result);

      if (onComplete) {
        onComplete();
      }
    }

    function wrapChildAsAsync(child) {
      return function(done) { child.execute(done); };
    }
  };

  return Suite;
};

if (typeof window == void 0 && typeof exports == 'object') {
  exports.Suite = jasmineRequire.Suite;
}

getJasmineRequireObj().Timer = function() {
  var defaultNow = (function(Date) {
    return function() { return new Date().getTime(); };
  })(Date);

  function Timer(options) {
    options = options || {};

    var now = options.now || defaultNow,
      startTime;

    this.start = function() {
      startTime = now();
    };

    this.elapsed = function() {
      return now() - startTime;
    };
  }

  return Timer;
};

getJasmineRequireObj().matchersUtil = function(j$) {
  // TODO: what to do about jasmine.pp not being inject? move to JSON.stringify? gut PrettyPrinter?

  return {
    equals: function(a, b, customTesters) {
      customTesters = customTesters || [];

      return eq(a, b, [], [], customTesters);
    },

    contains: function(haystack, needle, customTesters) {
      customTesters = customTesters || [];

      if (Object.prototype.toString.apply(haystack) === '[object Array]') {
        for (var i = 0; i < haystack.length; i++) {
          if (eq(haystack[i], needle, [], [], customTesters)) {
            return true;
          }
        }
        return false;
      }
      return !!haystack && haystack.indexOf(needle) >= 0;
    },

    buildFailureMessage: function() {
      var args = Array.prototype.slice.call(arguments, 0),
        matcherName = args[0],
        isNot = args[1],
        actual = args[2],
        expected = args.slice(3),
        englishyPredicate = matcherName.replace(/[A-Z]/g, function(s) { return ' ' + s.toLowerCase(); });

      var message = 'Expected ' +
        j$.pp(actual) +
        (isNot ? ' not ' : ' ') +
        englishyPredicate;

      if (expected.length > 0) {
        for (var i = 0; i < expected.length; i++) {
          if (i > 0) {
            message += ',';
          }
          message += ' ' + j$.pp(expected[i]);
        }
      }

      return message + '.';
    }
  };

  // Equality function lovingly adapted from isEqual in
  //   [Underscore](http://underscorejs.org)
  function eq(a, b, aStack, bStack, customTesters) {
    var result = true;

    for (var i = 0; i < customTesters.length; i++) {
      var customTesterResult = customTesters[i](a, b);
      if (!j$.util.isUndefined(customTesterResult)) {
        return customTesterResult;
      }
    }

    if (a instanceof j$.Any) {
      result = a.jasmineMatches(b);
      if (result) {
        return true;
      }
    }

    if (b instanceof j$.Any) {
      result = b.jasmineMatches(a);
      if (result) {
        return true;
      }
    }

    if (b instanceof j$.ObjectContaining) {
      result = b.jasmineMatches(a);
      if (result) {
        return true;
      }
    }

    if (a instanceof Error && b instanceof Error) {
      return a.message == b.message;
    }

    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) { return a !== 0 || 1 / a == 1 / b; }
    // A strict comparison is necessary because `null == undefined`.
    if (a === null || b === null) { return a === b; }
    var className = Object.prototype.toString.call(a);
    if (className != Object.prototype.toString.call(b)) { return false; }
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a === 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
          a.global == b.global &&
          a.multiline == b.multiline &&
          a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') { return false; }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) { return bStack[length] == b; }
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack, customTesters))) { break; }
        }
      }
    } else {
      // Objects with different constructors are not equivalent, but `Object`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(isFunction(aCtor) && (aCtor instanceof aCtor) &&
        isFunction(bCtor) && (bCtor instanceof bCtor))) {
        return false;
      }
      // Deep compare objects.
      for (var key in a) {
        if (has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = has(b, key) && eq(a[key], b[key], aStack, bStack, customTesters))) { break; }
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (has(b, key) && !(size--)) { break; }
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();

    return result;

    function has(obj, key) {
      return obj.hasOwnProperty(key);
    }

    function isFunction(obj) {
      return typeof obj === 'function';
    }
  }
};

getJasmineRequireObj().toBe = function() {
  function toBe() {
    return {
      compare: function(actual, expected) {
        return {
          pass: actual === expected
        };
      }
    };
  }

  return toBe;
};

getJasmineRequireObj().toBeCloseTo = function() {

  function toBeCloseTo() {
    return {
      compare: function(actual, expected, precision) {
        if (precision !== 0) {
          precision = precision || 2;
        }

        return {
          pass: Math.abs(expected - actual) < (Math.pow(10, -precision) / 2)
        };
      }
    };
  }

  return toBeCloseTo;
};

getJasmineRequireObj().toBeDefined = function() {
  function toBeDefined() {
    return {
      compare: function(actual) {
        return {
          pass: (void 0 !== actual)
        };
      }
    };
  }

  return toBeDefined;
};

getJasmineRequireObj().toBeFalsy = function() {
  function toBeFalsy() {
    return {
      compare: function(actual) {
        return {
          pass: !!!actual
        };
      }
    };
  }

  return toBeFalsy;
};

getJasmineRequireObj().toBeGreaterThan = function() {

  function toBeGreaterThan() {
    return {
      compare: function(actual, expected) {
        return {
          pass: actual > expected
        };
      }
    };
  }

  return toBeGreaterThan;
};


getJasmineRequireObj().toBeLessThan = function() {
  function toBeLessThan() {
    return {

      compare: function(actual, expected) {
        return {
          pass: actual < expected
        };
      }
    };
  }

  return toBeLessThan;
};
getJasmineRequireObj().toBeNaN = function(j$) {

  function toBeNaN() {
    return {
      compare: function(actual) {
        var result = {
          pass: (actual !== actual)
        };

        if (result.pass) {
          result.message = 'Expected actual not to be NaN.';
        } else {
          result.message = function() { return 'Expected ' + j$.pp(actual) + ' to be NaN.'; };
        }

        return result;
      }
    };
  }

  return toBeNaN;
};

getJasmineRequireObj().toBeNull = function() {

  function toBeNull() {
    return {
      compare: function(actual) {
        return {
          pass: actual === null
        };
      }
    };
  }

  return toBeNull;
};

getJasmineRequireObj().toBeTruthy = function() {

  function toBeTruthy() {
    return {
      compare: function(actual) {
        return {
          pass: !!actual
        };
      }
    };
  }

  return toBeTruthy;
};

getJasmineRequireObj().toBeUndefined = function() {

  function toBeUndefined() {
    return {
      compare: function(actual) {
        return {
          pass: void 0 === actual
        };
      }
    };
  }

  return toBeUndefined;
};

getJasmineRequireObj().toContain = function() {
  function toContain(util, customEqualityTesters) {
    customEqualityTesters = customEqualityTesters || [];

    return {
      compare: function(actual, expected) {

        return {
          pass: util.contains(actual, expected, customEqualityTesters)
        };
      }
    };
  }

  return toContain;
};

getJasmineRequireObj().toEqual = function() {

  function toEqual(util, customEqualityTesters) {
    customEqualityTesters = customEqualityTesters || [];

    return {
      compare: function(actual, expected) {
        var result = {
          pass: false
        };

        result.pass = util.equals(actual, expected, customEqualityTesters);

        return result;
      }
    };
  }

  return toEqual;
};

getJasmineRequireObj().toHaveBeenCalled = function(j$) {

  function toHaveBeenCalled() {
    return {
      compare: function(actual) {
        var result = {};

        if (!j$.isSpy(actual)) {
          throw new Error('Expected a spy, but got ' + j$.pp(actual) + '.');
        }

        if (arguments.length > 1) {
          throw new Error('toHaveBeenCalled does not take arguments, use toHaveBeenCalledWith');
        }

        result.pass = actual.calls.any();

        result.message = result.pass ?
          'Expected spy ' + actual.and.identity() + ' not to have been called.' :
          'Expected spy ' + actual.and.identity() + ' to have been called.';

        return result;
      }
    };
  }

  return toHaveBeenCalled;
};

getJasmineRequireObj().toHaveBeenCalledWith = function(j$) {

  function toHaveBeenCalledWith(util, customEqualityTesters) {
    return {
      compare: function() {
        var args = Array.prototype.slice.call(arguments, 0),
          actual = args[0],
          expectedArgs = args.slice(1),
          result = { pass: false };

        if (!j$.isSpy(actual)) {
          throw new Error('Expected a spy, but got ' + j$.pp(actual) + '.');
        }

        if (!actual.calls.any()) {
          result.message = function() { return 'Expected spy ' + actual.and.identity() + ' to have been called with ' + j$.pp(expectedArgs) + ' but it was never called.'; };
          return result;
        }

        if (util.contains(actual.calls.allArgs(), expectedArgs, customEqualityTesters)) {
          result.pass = true;
          result.message = function() { return 'Expected spy ' + actual.and.identity() + ' not to have been called with ' + j$.pp(expectedArgs) + ' but it was.'; };
        } else {
          result.message = function() { return 'Expected spy ' + actual.and.identity() + ' to have been called with ' + j$.pp(expectedArgs) + ' but actual calls were ' + j$.pp(actual.calls.allArgs()).replace(/^\[ | \]$/g, '') + '.'; };
        }

        return result;
      }
    };
  }

  return toHaveBeenCalledWith;
};

getJasmineRequireObj().toMatch = function() {

  function toMatch() {
    return {
      compare: function(actual, expected) {
        var regexp = new RegExp(expected);

        return {
          pass: regexp.test(actual)
        };
      }
    };
  }

  return toMatch;
};

getJasmineRequireObj().toThrow = function(j$) {

  function toThrow(util) {
    return {
      compare: function(actual, expected) {
        var result = { pass: false },
          threw = false,
          thrown;

        if (typeof actual != 'function') {
          throw new Error('Actual is not a Function');
        }

        try {
          actual();
        } catch (e) {
          threw = true;
          thrown = e;
        }

        if (!threw) {
          result.message = 'Expected function to throw an exception.';
          return result;
        }

        if (arguments.length == 1) {
          result.pass = true;
          result.message = function() { return 'Expected function not to throw, but it threw ' + j$.pp(thrown) + '.'; };

          return result;
        }

        if (util.equals(thrown, expected)) {
          result.pass = true;
          result.message = function() { return 'Expected function not to throw ' + j$.pp(expected) + '.'; };
        } else {
          result.message = function() { return 'Expected function to throw ' + j$.pp(expected) + ', but it threw ' +  j$.pp(thrown) + '.'; };
        }

        return result;
      }
    };
  }

  return toThrow;
};

getJasmineRequireObj().toThrowError = function(j$) {
  function toThrowError (util) {
    return {
      compare: function(actual) {
        var threw = false,
          pass = {pass: true},
          fail = {pass: false},
          thrown,
          errorType,
          message,
          regexp,
          name,
          constructorName;

        if (typeof actual != 'function') {
          throw new Error('Actual is not a Function');
        }

        extractExpectedParams.apply(null, arguments);

        try {
          actual();
        } catch (e) {
          threw = true;
          thrown = e;
        }

        if (!threw) {
          fail.message = 'Expected function to throw an Error.';
          return fail;
        }

        if (!(thrown instanceof Error)) {
          fail.message = function() { return 'Expected function to throw an Error, but it threw ' + j$.pp(thrown) + '.'; };
          return fail;
        }

        if (arguments.length == 1) {
          pass.message = 'Expected function not to throw an Error, but it threw ' + fnNameFor(thrown) + '.';
          return pass;
        }

        if (errorType) {
          name = fnNameFor(errorType);
          constructorName = fnNameFor(thrown.constructor);
        }

        if (errorType && message) {
          if (thrown.constructor == errorType && util.equals(thrown.message, message)) {
            pass.message = function() { return 'Expected function not to throw ' + name + ' with message ' + j$.pp(message) + '.'; };
            return pass;
          } else {
            fail.message = function() { return 'Expected function to throw ' + name + ' with message ' + j$.pp(message) +
              ', but it threw ' + constructorName + ' with message ' + j$.pp(thrown.message) + '.'; };
            return fail;
          }
        }

        if (errorType && regexp) {
          if (thrown.constructor == errorType && regexp.test(thrown.message)) {
            pass.message = function() { return 'Expected function not to throw ' + name + ' with message matching ' + j$.pp(regexp) + '.'; };
            return pass;
          } else {
            fail.message = function() { return 'Expected function to throw ' + name + ' with message matching ' + j$.pp(regexp) +
              ', but it threw ' + constructorName + ' with message ' + j$.pp(thrown.message) + '.'; };
            return fail;
          }
        }

        if (errorType) {
          if (thrown.constructor == errorType) {
            pass.message = 'Expected function not to throw ' + name + '.';
            return pass;
          } else {
            fail.message = 'Expected function to throw ' + name + ', but it threw ' + constructorName + '.';
            return fail;
          }
        }

        if (message) {
          if (thrown.message == message) {
            pass.message = function() { return 'Expected function not to throw an exception with message ' + j$.pp(message) + '.'; };
            return pass;
          } else {
            fail.message = function() { return 'Expected function to throw an exception with message ' + j$.pp(message) +
              ', but it threw an exception with message ' + j$.pp(thrown.message) + '.'; };
            return fail;
          }
        }

        if (regexp) {
          if (regexp.test(thrown.message)) {
            pass.message = function() { return 'Expected function not to throw an exception with a message matching ' + j$.pp(regexp) + '.'; };
            return pass;
          } else {
            fail.message = function() { return 'Expected function to throw an exception with a message matching ' + j$.pp(regexp) +
              ', but it threw an exception with message ' + j$.pp(thrown.message) + '.'; };
            return fail;
          }
        }

        function fnNameFor(func) {
            return func.name || func.toString().match(/^\s*function\s*(\w*)\s*\(/)[1];
        }

        function extractExpectedParams() {
          if (arguments.length == 1) {
            return;
          }

          if (arguments.length == 2) {
            var expected = arguments[1];

            if (expected instanceof RegExp) {
              regexp = expected;
            } else if (typeof expected == 'string') {
              message = expected;
            } else if (checkForAnErrorType(expected)) {
              errorType = expected;
            }

            if (!(errorType || message || regexp)) {
              throw new Error('Expected is not an Error, string, or RegExp.');
            }
          } else {
            if (checkForAnErrorType(arguments[1])) {
              errorType = arguments[1];
            } else {
              throw new Error('Expected error type is not an Error.');
            }

            if (arguments[2] instanceof RegExp) {
              regexp = arguments[2];
            } else if (typeof arguments[2] == 'string') {
              message = arguments[2];
            } else {
              throw new Error('Expected error message is not a string or RegExp.');
            }
          }
        }

        function checkForAnErrorType(type) {
          if (typeof type !== 'function') {
            return false;
          }

          var Surrogate = function() {};
          Surrogate.prototype = type.prototype;
          return (new Surrogate()) instanceof Error;
        }
      }
    };
  }

  return toThrowError;
};

getJasmineRequireObj().interface = function(jasmine, env) {
  var jasmineInterface = {
    describe: function(description, specDefinitions) {
      return env.describe(description, specDefinitions);
    },

    xdescribe: function(description, specDefinitions) {
      return env.xdescribe(description, specDefinitions);
    },

    it: function(desc, func) {
      return env.it(desc, func);
    },

    xit: function(desc, func) {
      return env.xit(desc, func);
    },

    beforeEach: function(beforeEachFunction) {
      return env.beforeEach(beforeEachFunction);
    },

    afterEach: function(afterEachFunction) {
      return env.afterEach(afterEachFunction);
    },

    expect: function(actual) {
      return env.expect(actual);
    },

    pending: function() {
      return env.pending();
    },

    spyOn: function(obj, methodName) {
      return env.spyOn(obj, methodName);
    },

    jsApiReporter: new jasmine.JsApiReporter({
      timer: new jasmine.Timer()
    }),

    jasmine: jasmine
  };

  jasmine.addCustomEqualityTester = function(tester) {
    env.addCustomEqualityTester(tester);
  };

  jasmine.addMatchers = function(matchers) {
    return env.addMatchers(matchers);
  };

  jasmine.clock = function() {
    return env.clock;
  };

  return jasmineInterface;
};

getJasmineRequireObj().version = function() {
  return '2.0.4';
};

/*
Copyright (c) 2008-2014 Pivotal Labs

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
function getJasmineRequireObj() {
  if (typeof module !== 'undefined' && module.exports) {
    return exports;
  } else {
    window.jasmineRequire = window.jasmineRequire || {};
    return window.jasmineRequire;
  }
}

getJasmineRequireObj().console = function(jRequire, j$) {
  j$.ConsoleReporter = jRequire.ConsoleReporter();
};

getJasmineRequireObj().ConsoleReporter = function() {

  var noopTimer = {
    start: function(){},
    elapsed: function(){ return 0; }
  };

  function ConsoleReporter(options) {
    var print = options.print,
      showColors = options.showColors || false,
      onComplete = options.onComplete || function() {},
      timer = options.timer || noopTimer,
      specCount,
      failureCount,
      failedSpecs = [],
      pendingCount,
      ansi = {
        green: '\x1B[32m',
        red: '\x1B[31m',
        yellow: '\x1B[33m',
        none: '\x1B[0m'
      };

    this.jasmineStarted = function() {
      specCount = 0;
      failureCount = 0;
      pendingCount = 0;
      print('Started');
      printNewline();
      timer.start();
    };

    this.jasmineDone = function() {
      printNewline();
      for (var i = 0; i < failedSpecs.length; i++) {
        specFailureDetails(failedSpecs[i]);
      }

      if(specCount > 0) {
        printNewline();

        var specCounts = specCount + ' ' + plural('spec', specCount) + ', ' +
          failureCount + ' ' + plural('failure', failureCount);

        if (pendingCount) {
          specCounts += ', ' + pendingCount + ' pending ' + plural('spec', pendingCount);
        }

        print(specCounts);
      } else {
        print('No specs found');
      }

      printNewline();
      var seconds = timer.elapsed() / 1000;
      print('Finished in ' + seconds + ' ' + plural('second', seconds));

      printNewline();

      onComplete(failureCount === 0);
    };

    this.specDone = function(result) {
      specCount++;

      if (result.status == 'pending') {
        pendingCount++;
        print(colored('yellow', '*'));
        return;
      }

      if (result.status == 'passed') {
        print(colored('green', '.'));
        return;
      }

      if (result.status == 'failed') {
        failureCount++;
        failedSpecs.push(result);
        print(colored('red', 'F'));
      }
    };

    return this;

    function printNewline() {
      print('\n');
    }

    function colored(color, str) {
      return showColors ? (ansi[color] + str + ansi.none) : str;
    }

    function plural(str, count) {
      return count == 1 ? str : str + 's';
    }

    function repeat(thing, times) {
      var arr = [];
      for (var i = 0; i < times; i++) {
        arr.push(thing);
      }
      return arr;
    }

    function indent(str, spaces) {
      var lines = (str || '').split('\n');
      var newArr = [];
      for (var i = 0; i < lines.length; i++) {
        newArr.push(repeat(' ', spaces).join('') + lines[i]);
      }
      return newArr.join('\n');
    }

    function specFailureDetails(result) {
      printNewline();
      print(result.fullName);

      for (var i = 0; i < result.failedExpectations.length; i++) {
        var failedExpectation = result.failedExpectations[i];
        printNewline();
        print(indent(failedExpectation.message, 2));
        print(indent(failedExpectation.stack, 2));
      }

      printNewline();
    }
  }

  return ConsoleReporter;
};

/*
Copyright (c) 2008-2014 Pivotal Labs

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
jasmineRequire.html = function(j$) {
  j$.ResultsNode = jasmineRequire.ResultsNode();
  j$.HtmlReporter = jasmineRequire.HtmlReporter(j$);
  j$.QueryString = jasmineRequire.QueryString();
  j$.HtmlSpecFilter = jasmineRequire.HtmlSpecFilter();
};

jasmineRequire.HtmlReporter = function(j$) {

  var noopTimer = {
    start: function() {},
    elapsed: function() { return 0; }
  };

  function HtmlReporter(options) {
    var env = options.env || {},
      getContainer = options.getContainer,
      createElement = options.createElement,
      createTextNode = options.createTextNode,
      onRaiseExceptionsClick = options.onRaiseExceptionsClick || function() {},
      timer = options.timer || noopTimer,
      results = [],
      specsExecuted = 0,
      failureCount = 0,
      pendingSpecCount = 0,
      htmlReporterMain,
      symbols;

    this.initialize = function() {
      clearPrior();
      htmlReporterMain = createDom('div', {className: 'jasmine_html-reporter'},
        createDom('div', {className: 'banner'},
          createDom('a', {className: 'title', href: 'http://jasmine.github.io/', target: '_blank'}),
          createDom('span', {className: 'version'}, j$.version)
        ),
        createDom('ul', {className: 'symbol-summary'}),
        createDom('div', {className: 'alert'}),
        createDom('div', {className: 'results'},
          createDom('div', {className: 'failures'})
        )
      );
      getContainer().appendChild(htmlReporterMain);

      symbols = find('.symbol-summary');
    };

    var totalSpecsDefined;
    this.jasmineStarted = function(options) {
      totalSpecsDefined = options.totalSpecsDefined || 0;
      timer.start();
    };

    var summary = createDom('div', {className: 'summary'});

    var topResults = new j$.ResultsNode({}, '', null),
      currentParent = topResults;

    this.suiteStarted = function(result) {
      currentParent.addChild(result, 'suite');
      currentParent = currentParent.last();
    };

    this.suiteDone = function(result) {
      if (currentParent == topResults) {
        return;
      }

      currentParent = currentParent.parent;
    };

    this.specStarted = function(result) {
      currentParent.addChild(result, 'spec');
    };

    var failures = [];
    this.specDone = function(result) {
      if(noExpectations(result) && console && console.error) {
        console.error('Spec \'' + result.fullName + '\' has no expectations.');
      }

      if (result.status != 'disabled') {
        specsExecuted++;
      }

      symbols.appendChild(createDom('li', {
          className: noExpectations(result) ? 'empty' : result.status,
          id: 'spec_' + result.id,
          title: result.fullName
        }
      ));

      if (result.status == 'failed') {
        failureCount++;

        var failure =
          createDom('div', {className: 'spec-detail failed'},
            createDom('div', {className: 'description'},
              createDom('a', {title: result.fullName, href: specHref(result)}, result.fullName)
            ),
            createDom('div', {className: 'messages'})
          );
        var messages = failure.childNodes[1];

        for (var i = 0; i < result.failedExpectations.length; i++) {
          var expectation = result.failedExpectations[i];
          messages.appendChild(createDom('div', {className: 'result-message'}, expectation.message));
          messages.appendChild(createDom('div', {className: 'stack-trace'}, expectation.stack));
        }

        failures.push(failure);
      }

      if (result.status == 'pending') {
        pendingSpecCount++;
      }
    };

    this.jasmineDone = function() {
      var banner = find('.banner');
      banner.appendChild(createDom('span', {className: 'duration'}, 'finished in ' + timer.elapsed() / 1000 + 's'));

      var alert = find('.alert');

      alert.appendChild(createDom('span', { className: 'exceptions' },
        createDom('label', { className: 'label', 'for': 'raise-exceptions' }, 'raise exceptions'),
        createDom('input', {
          className: 'raise',
          id: 'raise-exceptions',
          type: 'checkbox'
        })
      ));
      var checkbox = find('#raise-exceptions');

      checkbox.checked = !env.catchingExceptions();
      checkbox.onclick = onRaiseExceptionsClick;

      if (specsExecuted < totalSpecsDefined) {
        var skippedMessage = 'Ran ' + specsExecuted + ' of ' + totalSpecsDefined + ' specs - run all';
        alert.appendChild(
          createDom('span', {className: 'bar skipped'},
            createDom('a', {href: '?', title: 'Run all specs'}, skippedMessage)
          )
        );
      }
      var statusBarMessage = '';
      var statusBarClassName = 'bar ';

      if (totalSpecsDefined > 0) {
        statusBarMessage += pluralize('spec', specsExecuted) + ', ' + pluralize('failure', failureCount);
        if (pendingSpecCount) { statusBarMessage += ', ' + pluralize('pending spec', pendingSpecCount); }
        statusBarClassName += (failureCount > 0) ? 'failed' : 'passed';
      } else {
        statusBarClassName += 'skipped';
        statusBarMessage += 'No specs found';
      }

      alert.appendChild(createDom('span', {className: statusBarClassName}, statusBarMessage));

      var results = find('.results');
      results.appendChild(summary);

      summaryList(topResults, summary);

      function summaryList(resultsTree, domParent) {
        var specListNode;
        for (var i = 0; i < resultsTree.children.length; i++) {
          var resultNode = resultsTree.children[i];
          if (resultNode.type == 'suite') {
            var suiteListNode = createDom('ul', {className: 'suite', id: 'suite-' + resultNode.result.id},
              createDom('li', {className: 'suite-detail'},
                createDom('a', {href: specHref(resultNode.result)}, resultNode.result.description)
              )
            );

            summaryList(resultNode, suiteListNode);
            domParent.appendChild(suiteListNode);
          }
          if (resultNode.type == 'spec') {
            if (domParent.getAttribute('class') != 'specs') {
              specListNode = createDom('ul', {className: 'specs'});
              domParent.appendChild(specListNode);
            }
            var specDescription = resultNode.result.description;
            if(noExpectations(resultNode.result)) {
              specDescription = 'SPEC HAS NO EXPECTATIONS ' + specDescription;
            }
            specListNode.appendChild(
              createDom('li', {
                  className: resultNode.result.status,
                  id: 'spec-' + resultNode.result.id
                },
                createDom('a', {href: specHref(resultNode.result)}, specDescription)
              )
            );
          }
        }
      }

      if (failures.length) {
        alert.appendChild(
          createDom('span', {className: 'menu bar spec-list'},
            createDom('span', {}, 'Spec List | '),
            createDom('a', {className: 'failures-menu', href: '#'}, 'Failures')));
        alert.appendChild(
          createDom('span', {className: 'menu bar failure-list'},
            createDom('a', {className: 'spec-list-menu', href: '#'}, 'Spec List'),
            createDom('span', {}, ' | Failures ')));

        find('.failures-menu').onclick = function() {
          setMenuModeTo('failure-list');
        };
        find('.spec-list-menu').onclick = function() {
          setMenuModeTo('spec-list');
        };

        setMenuModeTo('failure-list');

        var failureNode = find('.failures');
        for (var i = 0; i < failures.length; i++) {
          failureNode.appendChild(failures[i]);
        }
      }
    };

    return this;

    function find(selector) {
      return getContainer().querySelector('.jasmine_html-reporter ' + selector);
    }

    function clearPrior() {
      // return the reporter
      var oldReporter = find('');
      
      if(oldReporter) {
        getContainer().removeChild(oldReporter);
      }
    }

    function createDom(type, attrs, childrenVarArgs) {
      var el = createElement(type);

      for (var i = 2; i < arguments.length; i++) {
        var child = arguments[i];

        if (typeof child === 'string') {
          el.appendChild(createTextNode(child));
        } else {
          if (child) {
            el.appendChild(child);
          }
        }
      }

      for (var attr in attrs) {
        if (attr == 'className') {
          el[attr] = attrs[attr];
        } else {
          el.setAttribute(attr, attrs[attr]);
        }
      }

      return el;
    }

    function pluralize(singular, count) {
      var word = (count == 1 ? singular : singular + 's');

      return '' + count + ' ' + word;
    }

    function specHref(result) {
      return '?spec=' + encodeURIComponent(result.fullName);
    }

    function setMenuModeTo(mode) {
      htmlReporterMain.setAttribute('class', 'jasmine_html-reporter ' + mode);
    }

    function noExpectations(result) {
      return (result.failedExpectations.length + result.passedExpectations.length) === 0 &&
        result.status === 'passed';
    }
  }

  return HtmlReporter;
};

jasmineRequire.HtmlSpecFilter = function() {
  function HtmlSpecFilter(options) {
    var filterString = options && options.filterString() && options.filterString().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    var filterPattern = new RegExp(filterString);

    this.matches = function(specName) {
      return filterPattern.test(specName);
    };
  }

  return HtmlSpecFilter;
};

jasmineRequire.ResultsNode = function() {
  function ResultsNode(result, type, parent) {
    this.result = result;
    this.type = type;
    this.parent = parent;

    this.children = [];

    this.addChild = function(result, type) {
      this.children.push(new ResultsNode(result, type, this));
    };

    this.last = function() {
      return this.children[this.children.length - 1];
    };
  }

  return ResultsNode;
};

jasmineRequire.QueryString = function() {
  function QueryString(options) {

    this.setParam = function(key, value) {
      var paramMap = queryStringToParamMap();
      paramMap[key] = value;
      options.getWindowLocation().search = toQueryString(paramMap);
    };

    this.getParam = function(key) {
      return queryStringToParamMap()[key];
    };

    return this;

    function toQueryString(paramMap) {
      var qStrPairs = [];
      for (var prop in paramMap) {
        qStrPairs.push(encodeURIComponent(prop) + '=' + encodeURIComponent(paramMap[prop]));
      }
      return '?' + qStrPairs.join('&');
    }

    function queryStringToParamMap() {
      var paramStr = options.getWindowLocation().search.substring(1),
        params = [],
        paramMap = {};

      if (paramStr.length > 0) {
        params = paramStr.split('&');
        for (var i = 0; i < params.length; i++) {
          var p = params[i].split('=');
          var value = decodeURIComponent(p[1]);
          if (value === 'true' || value === 'false') {
            value = JSON.parse(value);
          }
          paramMap[decodeURIComponent(p[0])] = value;
        }
      }

      return paramMap;
    }

  }

  return QueryString;
};


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

/*
  This file is part of the Jasmine JSReporter project from Ivan De Marino.

  Copyright (C) 2011-2014 Ivan De Marino <http://ivandemarino.me>
  Copyright (C) 2014 Alex Treppass <http://alextreppass.co.uk>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of the <organization> nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL IVAN DE MARINO BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
/*
This is a slightly modified version of the JSReporter2 available from:
https://github.com/detro/jasmine-jsreporter
*/

getJasmineRequireObj().JSReporter2 = function() {

  // ------------------------------------------------------------------------
  // Jasmine JSReporter for Jasmine 2.0
  // ------------------------------------------------------------------------

  /*
    Simple timer implementation
  */
  var Timer = function () {};

  Timer.prototype.start = function () {
    this.startTime = new Date().getTime();
    return this;
  };

  Timer.prototype.elapsed = function () {
    if (this.startTime == null) {
      return -1;
    }
    return new Date().getTime() - this.startTime;
  };

  /*
    Utility methods
  */
  var _extend = function (obj1, obj2) {
    for (var prop in obj2) {
      obj1[prop] = obj2[prop];
    }
    return obj1;
  };
  var _clone = function (obj) {
    if (obj !== Object(obj)) {
      return obj;
    }
    return _extend({}, obj);
  };

  jasmine.JSReporter2 = function () {
    this.specs  = {};
    this.suites = {};
    this.rootSuites = [];
    this.suiteStack = [];

    // export methods under jasmine namespace
    jasmine.getJSReport = this.getJSReport;
    jasmine.getJSReportAsString = this.getJSReportAsString;
  };

  var JSR = jasmine.JSReporter2.prototype;

  // Reporter API methods
  // --------------------

  JSR.suiteStarted = function (suite) {
    suite = this._cacheSuite(suite);
    // build up suite tree as we go
    suite.specs = [];
    suite.suites = [];
    suite.passed = true;
    suite.parentId = this.suiteStack.slice(this.suiteStack.length -1)[0];
    if (suite.parentId) {
      this.suites[suite.parentId].suites.push(suite);
    } else {
      this.rootSuites.push(suite.id);
    }
    this.suiteStack.push(suite.id);
    suite.timer = new Timer().start();
  };

  JSR.suiteDone = function (suite) {
    suite = this._cacheSuite(suite);
    suite.duration = suite.timer.elapsed();
    suite.durationSec = suite.duration / 1000;
    this.suiteStack.pop();

    // maintain parent suite state
    var parent = this.suites[suite.parentId];
    if (parent) {
      parent.passed = parent.passed && suite.passed;
    }

    // keep report representation clean
    delete suite.timer;
    delete suite.id;
    delete suite.parentId;
    delete suite.fullName;
  };

  JSR.specStarted = function (spec) {
    spec = this._cacheSpec(spec);
    spec.timer = new Timer().start();
    // build up suites->spec tree as we go
    spec.suiteId = this.suiteStack.slice(this.suiteStack.length -1)[0];
    this.suites[spec.suiteId].specs.push(spec);
  };

  JSR.specDone = function (spec) {
    spec = this._cacheSpec(spec);

    spec.duration = spec.timer.elapsed();
    spec.durationSec = spec.duration / 1000;

    spec.skipped = spec.status === 'pending';
    spec.passed = spec.skipped || spec.status === 'passed';

    spec.totalCount = spec.passedExpectations.length + spec.failedExpectations.length;
    spec.passedCount = spec.passedExpectations.length;
    spec.failedCount = spec.failedExpectations.length;
    spec.failures = [];

    for (var i = 0, j = spec.failedExpectations.length; i < j; i++) {
      var fail = spec.failedExpectations[i];
      spec.failures.push({
        type: 'expect',
        expected: fail.expected,
        passed: false,
        message: fail.message,
        matcherName: fail.matcherName,
        trace: {
          stack: fail.stack
        }
      });
    }

    // maintain parent suite state
    var parent = this.suites[spec.suiteId];
    if (spec.failed) {
      parent.failingSpecs.push(spec);
    }
    parent.passed = parent.passed && spec.passed;

    // keep report representation clean
    delete spec.timer;
    delete spec.totalExpectations;
    delete spec.passedExpectations;
    delete spec.suiteId;
    delete spec.fullName;
    delete spec.id;
    delete spec.status;
    delete spec.failedExpectations;
  };

  JSR.jasmineDone = function () {
    this._buildReport();
  };

  JSR.getJSReport = function () {
    if (jasmine.jsReport) {
      return jasmine.jsReport;
    }
  };

  JSR.getJSReportAsString = function () {
    if (jasmine.jsReport) {
      return JSON.stringify(jasmine.jsReport);
    }
  };

  // Private methods
  // ---------------

  JSR._haveSpec = function (spec) {
    return this.specs[spec.id] != null;
  };

  JSR._cacheSpec = function (spec) {
    var existing = this.specs[spec.id];
    if (existing == null) {
      existing = this.specs[spec.id] = _clone(spec);
    } else {
      _extend(existing, spec);
    }
    return existing;
  };

  JSR._haveSuite = function (suite) {
    return this.suites[suite.id] != null;
  };

  JSR._cacheSuite = function (suite) {
    var existing = this.suites[suite.id];
    if (existing == null) {
      existing = this.suites[suite.id] = _clone(suite);
    } else {
      _extend(existing, suite);
    }
    return existing;
  };

  JSR._buildReport = function () {
    var overallDuration = 0;
    var overallPassed = true;
    var overallSuites = [];

    for (var i = 0, j = this.rootSuites.length; i < j; i++) {
      var suite = this.suites[this.rootSuites[i]];
      overallDuration += suite.duration;
      overallPassed = overallPassed && suite.passed;
      overallSuites.push(suite);
    }

    jasmine.jsReport = {
      passed: overallPassed,
      durationSec: overallDuration / 1000,
      suites: overallSuites
    };
  };

};

/*
The MIT License

Copyright (c) 2010 Larry Myers

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
/*
This is a slightly modified version of the JUnitXmlReporter available from:
https://github.com/larrymyers/jasmine-reporters
*/

/* global java, __phantom_writeFile */
(function(global) {
    var UNDEFINED,
        exportObject;

    if (typeof module !== "undefined" && module.exports) {
        exportObject = exports;
    } else {
        exportObject = global.jasmineReporters = global.jasmineReporters || {};
    }

    function trim(str) { return str.replace(/^\s+/, "" ).replace(/\s+$/, "" ); }
    function elapsed(start, end) { return (end - start)/1000; }
    function isFailed(obj) { return obj.status === "failed"; }
    function isSkipped(obj) { return obj.status === "pending"; }
    function pad(n) { return n < 10 ? '0'+n : n; }
    function extend(dupe, obj) { // performs a shallow copy of all props of `obj` onto `dupe`
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                dupe[prop] = obj[prop];
            }
        }
        return dupe;
    }
    function ISODateString(d) {
        return d.getFullYear() + '-' +
            pad(d.getMonth()+1) + '-' +
            pad(d.getDate()) + 'T' +
            pad(d.getHours()) + ':' +
            pad(d.getMinutes()) + ':' +
            pad(d.getSeconds());
    }
    function escapeInvalidXmlChars(str) {
        return str.replace(/</g, "&lt;")
            .replace(/\>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/\'/g, "&apos;")
            .replace(/\&/g, "&amp;");
    }
    function getQualifiedFilename(path, filename, separator) {
        if (path && path.substr(-1) !== separator && filename.substr(0) !== separator) {
            path += separator;
        }
        return path + filename;
    }
    function log(str) {
        var con = global.console || console;
        if (con && con.log) {
            con.log(str);
        }
    }


    /**
     * Generates JUnit XML for the given spec run. There are various options
     * to control where the results are written, and the default values are
     * set to create as few .xml files as possible. It is possible to save a
     * single XML file, or an XML file for each top-level `describe`, or an
     * XML file for each `describe` regardless of nesting.
     *
     * Usage:
     *
     * jasmine.getEnv().addReporter(new jasmineReporters.JUnitXmlReporter(options);
     *
     * @param {object} [options]
     * @param {string} [savePath] directory to save the files (default: '')
     * @param {boolean} [consolidateAll] whether to save all test results in a
     *   single file (default: true)
     *   NOTE: if true, {filePrefix} is treated as the full filename (excluding
     *     extension)
     * @param {boolean} [consolidate] whether to save nested describes within the
     *   same file as their parent (default: true)
     *   NOTE: true does nothing if consolidateAll is also true.
     *   NOTE: false also sets consolidateAll to false.
     * @param {boolean} [useDotNotation] whether to separate suite names with
     *   dots instead of spaces, ie "Class.init" not "Class init" (default: true)
     * @param {string} [filePrefix] is the string value that is prepended to the
     *   xml output file (default: junitresults-)
     *   NOTE: if consolidateAll is true, the default is simply "junitresults" and
     *     this becomes the actual filename, ie "junitresults.xml"
     */
    exportObject.JUnitXmlReporter = function(options) {
        var self = this;
        self.started = false;
        self.finished = false;
        // sanitize arguments
        options = options || {};
        self.savePath = options.savePath || '';
        self.consolidate = options.consolidate === UNDEFINED ? true : options.consolidate;
        self.consolidateAll = self.consolidate !== false && (options.consolidateAll === UNDEFINED ? true : options.consolidateAll);
        self.useDotNotation = options.useDotNotation === UNDEFINED ? true : options.useDotNotation;
        self.filePrefix = options.filePrefix || (self.consolidateAll ? 'junitresults' : 'junitresults-');

        var suites = [],
            currentSuite = null,
            totalSpecsExecuted = 0,
            totalSpecsDefined;

        var __suites = {}, __specs = {};
        function getSuite(suite) {
            __suites[suite.id] = extend(__suites[suite.id] || {}, suite);
            return __suites[suite.id];
        }
        function getSpec(spec) {
            __specs[spec.id] = extend(__specs[spec.id] || {}, spec);
            return __specs[spec.id];
        }

        self.jasmineStarted = function(summary) {
            totalSpecsDefined = summary && summary.totalSpecsDefined || NaN;
            exportObject.startTime = new Date();
            self.started = true;
        };
        self.suiteStarted = function(suite) {
            suite = getSuite(suite);
            suite._startTime = new Date();
            suite._specs = [];
            suite._suites = [];
            suite._failures = 0;
            suite._skipped = 0;
            suite._parent = currentSuite;
            if (!currentSuite) {
                suites.push(suite);
            } else {
                currentSuite._suites.push(suite);
            }
            currentSuite = suite;
        };
        self.specStarted = function(spec) {
            spec = getSpec(spec);
            spec._startTime = new Date();
            spec._suite = currentSuite;
            currentSuite._specs.push(spec);
        };
        self.specDone = function(spec) {
            spec = getSpec(spec);
            spec._endTime = new Date();
            if (isSkipped(spec)) { spec._suite._skipped++; }
            if (isFailed(spec)) { spec._suite._failures++; }
            totalSpecsExecuted++;
        };
        self.suiteDone = function(suite) {
            suite = getSuite(suite);
            // disabled suite (xdescribe) -- suiteStarted was never called
            if (suite._parent === UNDEFINED) {
                self.suiteStarted(suite);
                suite._disabled = true;
            }
            suite._endTime = new Date();
            currentSuite = suite._parent;
        };
        self.jasmineDone = function() {
            var output = '';
            for (var i = 0; i < suites.length; i++) {
                output += self.getOrWriteNestedOutput(suites[i]);
            }
            // if we have anything to write here, write out the consolidated file
            if (output) {
                wrapOutputAndWriteFile(self.filePrefix, output);
            }
            //log("Specs skipped but not reported (entire suite skipped)", totalSpecsDefined - totalSpecsExecuted);

            self.finished = true;
            // this is so phantomjs-testrunner.js can tell if we're done executing
            exportObject.endTime = new Date();
        };

        self.getOrWriteNestedOutput = function(suite) {
            var output = suiteAsXml(suite);
            for (var i = 0; i < suite._suites.length; i++) {
                output += self.getOrWriteNestedOutput(suite._suites[i]);
            }
            if (self.consolidateAll || self.consolidate && suite._parent) {
                return output;
            } else {
                // if we aren't supposed to consolidate output, just write it now
                wrapOutputAndWriteFile(generateFilename(suite), output);
                return '';
            }
        };

        self.writeFile = function(filename, text) {
            var errors = [];
            var path = self.savePath;

            function phantomWrite(path, filename, text) {
                // turn filename into a qualified path
                filename = getQualifiedFilename(path, filename, window.fs_path_separator);
                // write via a method injected by phantomjs-testrunner.js
                __phantom_writeFile(filename, text);
            }

            function nodeWrite(path, filename, text) {
                var fs = require("fs");
                var nodejs_path = require("path");
                require("mkdirp").sync(path); // make sure the path exists
                var filepath = nodejs_path.join(path, filename);
                var xmlfile = fs.openSync(filepath, "w");
                fs.writeSync(xmlfile, text, 0);
                fs.closeSync(xmlfile);
                return;
            }
            // Attempt writing with each possible environment.
            // Track errors in case no write succeeds
            try {
                phantomWrite(path, filename, text);
                return;
            } catch (e) { errors.push('  PhantomJs attempt: ' + e.message); }
            try {
                nodeWrite(path, filename, text);
                return;
            } catch (f) { errors.push('  NodeJS attempt: ' + f.message); }

            /*
            // If made it here, no write succeeded.  Let user know.
            log("Warning: writing junit report failed for '" + path + "', '" +
                filename + "'. Reasons:\n" +
                errors.join("\n")
            );
            */
            // put the final report where browser code can access it
            jasmine.junitReport = text;
        };

        /******** Helper functions with closure access for simplicity ********/
        function generateFilename(suite) {
            return self.filePrefix + getFullyQualifiedSuiteName(suite, true) + '.xml';
        }

        function getFullyQualifiedSuiteName(suite, isFilename) {
            var fullName;
            if (self.useDotNotation || isFilename) {
                fullName = suite.description;
                for (var parent = suite._parent; parent; parent = parent._parent) {
                    fullName = parent.description + '.' + fullName;
                }
            } else {
                fullName = suite.fullName;
            }

            // Either remove or escape invalid XML characters
            if (isFilename) {
                var fileName = "",
                    rFileChars = /[\w\.]/,
                    chr;
                while (fullName.length) {
                    chr = fullName[0];
                    fullName = fullName.substr(1);
                    if (rFileChars.test(chr)) {
                        fileName += chr;
                    }
                }
                return fileName;
            } else {
                return escapeInvalidXmlChars(fullName);
            }
        }

        function suiteAsXml(suite) {
            var xml = '\n <testsuite name="' + getFullyQualifiedSuiteName(suite) + '"';
            xml += ' timestamp="' + ISODateString(suite._startTime) + '"';
            xml += ' hostname="localhost"'; // many CI systems like Jenkins don't care about this, but junit spec says it is required
            xml += ' time="' + elapsed(suite._startTime, suite._endTime) + '"';
            xml += ' errors="0"';
            xml += ' tests="' + suite._specs.length + '"';
            xml += ' skipped="' + suite._skipped + '"';
            // Because of JUnit's flat structure, only include directly failed tests (not failures for nested suites)
            xml += ' failures="' + suite._failures + '"';
            xml += '>';

            for (var i = 0; i < suite._specs.length; i++) {
                xml += specAsXml(suite._specs[i]);
            }
            xml += '\n </testsuite>';
            return xml;
        }
        function specAsXml(spec) {
            var xml = '\n  <testcase classname="' + getFullyQualifiedSuiteName(spec._suite) + '"';
            xml += ' name="' + escapeInvalidXmlChars(spec.description) + '"';
            xml += ' time="' + elapsed(spec._startTime, spec._endTime) + '"';
            xml += '>';

            if (isSkipped(spec)) {
                xml += '<skipped />';
            } else if (isFailed(spec)) {
                for (var i = 0, failure; i < spec.failedExpectations.length; i++) {
                    failure = spec.failedExpectations[i];
                    xml += '\n   <failure type="' + (failure.matcherName || "exception") + '"';
                    xml += ' message="' + trim(escapeInvalidXmlChars(failure.message))+ '"';
                    xml += '>';
                    xml += '<![CDATA[' + trim(failure.stack || failure.message) + ']]>';
                    xml += '\n   </failure>';
                }
            }
            xml += '\n  </testcase>';
            return xml;
        }

        // To remove complexity and be more DRY about the silly preamble and <testsuites> element
        var prefix = '<?xml version="1.0" encoding="UTF-8" ?>';
        prefix += '\n<testsuites>';
        var suffix = '\n</testsuites>';
        function wrapOutputAndWriteFile(filename, text) {
            if (filename.substr(-4) !== '.xml') { filename += '.xml'; }
            self.writeFile(filename, (prefix + text + suffix));
        }
    };
})(this);

/**
 Starting with version 2.0, this file "boots" Jasmine, performing all of the necessary initialization before executing the loaded environment and all of a project's specs. This file should be loaded after `jasmine.js`, but before any project source files or spec files are loaded. Thus this file can also be used to customize Jasmine for a project.

 If a project is using Jasmine via the standalone distribution, this file can be customized directly. If a project is using Jasmine via the [Ruby gem][jasmine-gem], this file can be copied into the support directory via `jasmine copy_boot_js`. Other environments (e.g., Python) will have different mechanisms.

 The location of `boot.js` can be specified and/or overridden in `jasmine.yml`.

 [jasmine-gem]: http://github.com/pivotal/jasmine-gem
 */

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
   * Add all of the Jasmine global/public interface to the proper global, so a project can use the public interface directly. For example, calling `describe` in specs instead of `jasmine.getEnv().describe`.
   */
  if (typeof window == "undefined" && typeof exports == "object") {
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

  var catchingExceptions = queryString.getParam("catch");
  env.catchExceptions(typeof catchingExceptions === "undefined" ? true : catchingExceptions);

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
    onRaiseExceptionsClick: function() { queryString.setParam("catch", !env.catchingExceptions()); },
    // getContainer: function() { return document.body; },
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
    filterString: function() { return queryString.getParam("spec"); }
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

  /**
   * Helper function for readability above.
   */
  function extend(destination, source) {
    for (var property in source) destination[property] = source[property];
    return destination;
  }

}());

// vim:ts=4:sts=4:sw=4:
/*!
 *
 * Copyright 2009-2012 Kris Kowal under the terms of the MIT
 * license found at http://github.com/kriskowal/q/raw/master/LICENSE
 *
 * With parts by Tyler Close
 * Copyright 2007-2009 Tyler Close under the terms of the MIT X license found
 * at http://www.opensource.org/licenses/mit-license.html
 * Forked at ref_send.js version: 2009-05-11
 *
 * With parts by Mark Miller
 * Copyright (C) 2011 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

(function (definition) {
    // Turn off strict mode for this function so we can assign to global.Q
    /* jshint strict: false */

    // This file will function properly as a <script> tag, or a module
    // using CommonJS and NodeJS or RequireJS module formats.  In
    // Common/Node/RequireJS, the module exports the Q API and when
    // executed as a simple <script>, it creates a Q global instead.

    // Montage Require
    if (typeof bootstrap === "function") {
        bootstrap("promise", definition);

    // CommonJS
    } else if (typeof exports === "object") {
        module.exports = definition();

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
        define(definition);

    // SES (Secure EcmaScript)
    } else if (typeof ses !== "undefined") {
        if (!ses.ok()) {
            return;
        } else {
            ses.makeQ = definition;
        }

    // <script>
    } else {
        Q = definition();
    }

})(function () {
"use strict";

var hasStacks = false;
try {
    throw new Error();
} catch (e) {
    hasStacks = !!e.stack;
}

// All code after this point will be filtered from stack traces reported
// by Q.
var qStartingLine = captureLine();
var qFileName;

// shims

// used for fallback in "allResolved"
var noop = function () {};

// Use the fastest possible means to execute a task in a future turn
// of the event loop.
var nextTick =(function () {
    // linked list of tasks (single, with head node)
    var head = {task: void 0, next: null};
    var tail = head;
    var flushing = false;
    var requestTick = void 0;
    var isNodeJS = false;

    function flush() {
        /* jshint loopfunc: true */

        while (head.next) {
            head = head.next;
            var task = head.task;
            head.task = void 0;
            var domain = head.domain;

            if (domain) {
                head.domain = void 0;
                domain.enter();
            }

            try {
                task();

            } catch (e) {
                if (isNodeJS) {
                    // In node, uncaught exceptions are considered fatal errors.
                    // Re-throw them synchronously to interrupt flushing!

                    // Ensure continuation if the uncaught exception is suppressed
                    // listening "uncaughtException" events (as domains does).
                    // Continue in next event to avoid tick recursion.
                    if (domain) {
                        domain.exit();
                    }
                    setTimeout(flush, 0);
                    if (domain) {
                        domain.enter();
                    }

                    throw e;

                } else {
                    // In browsers, uncaught exceptions are not fatal.
                    // Re-throw them asynchronously to avoid slow-downs.
                    setTimeout(function() {
                       throw e;
                    }, 0);
                }
            }

            if (domain) {
                domain.exit();
            }
        }

        flushing = false;
    }

    nextTick = function (task) {
        tail = tail.next = {
            task: task,
            domain: isNodeJS && process.domain,
            next: null
        };

        if (!flushing) {
            flushing = true;
            requestTick();
        }
    };

    if (typeof process !== "undefined" && process.nextTick) {
        // Node.js before 0.9. Note that some fake-Node environments, like the
        // Mocha test runner, introduce a `process` global without a `nextTick`.
        isNodeJS = true;

        requestTick = function () {
            process.nextTick(flush);
        };

    } else if (typeof setImmediate === "function") {
        // In IE10, Node.js 0.9+, or https://github.com/NobleJS/setImmediate
        if (typeof window !== "undefined") {
            requestTick = setImmediate.bind(window, flush);
        } else {
            requestTick = function () {
                setImmediate(flush);
            };
        }

    } else if (typeof MessageChannel !== "undefined") {
        // modern browsers
        // http://www.nonblocking.io/2011/06/windownexttick.html
        var channel = new MessageChannel();
        // At least Safari Version 6.0.5 (8536.30.1) intermittently cannot create
        // working message ports the first time a page loads.
        channel.port1.onmessage = function () {
            requestTick = requestPortTick;
            channel.port1.onmessage = flush;
            flush();
        };
        var requestPortTick = function () {
            // Opera requires us to provide a message payload, regardless of
            // whether we use it.
            channel.port2.postMessage(0);
        };
        requestTick = function () {
            setTimeout(flush, 0);
            requestPortTick();
        };

    } else {
        // old browsers
        requestTick = function () {
            setTimeout(flush, 0);
        };
    }

    return nextTick;
})();

// Attempt to make generics safe in the face of downstream
// modifications.
// There is no situation where this is necessary.
// If you need a security guarantee, these primordials need to be
// deeply frozen anyway, and if you don’t need a security guarantee,
// this is just plain paranoid.
// However, this does have the nice side-effect of reducing the size
// of the code by reducing x.call() to merely x(), eliminating many
// hard-to-minify characters.
// See Mark Miller’s explanation of what this does.
// http://wiki.ecmascript.org/doku.php?id=conventions:safe_meta_programming
var call = Function.call;
function uncurryThis(f) {
    return function () {
        return call.apply(f, arguments);
    };
}
// This is equivalent, but slower:
// uncurryThis = Function_bind.bind(Function_bind.call);
// http://jsperf.com/uncurrythis

var array_slice = uncurryThis(Array.prototype.slice);

var array_reduce = uncurryThis(
    Array.prototype.reduce || function (callback, basis) {
        var index = 0,
            length = this.length;
        // concerning the initial value, if one is not provided
        if (arguments.length === 1) {
            // seek to the first value in the array, accounting
            // for the possibility that is is a sparse array
            do {
                if (index in this) {
                    basis = this[index++];
                    break;
                }
                if (++index >= length) {
                    throw new TypeError();
                }
            } while (1);
        }
        // reduce
        for (; index < length; index++) {
            // account for the possibility that the array is sparse
            if (index in this) {
                basis = callback(basis, this[index], index);
            }
        }
        return basis;
    }
);

var array_indexOf = uncurryThis(
    Array.prototype.indexOf || function (value) {
        // not a very good shim, but good enough for our one use of it
        for (var i = 0; i < this.length; i++) {
            if (this[i] === value) {
                return i;
            }
        }
        return -1;
    }
);

var array_map = uncurryThis(
    Array.prototype.map || function (callback, thisp) {
        var self = this;
        var collect = [];
        array_reduce(self, function (undefined, value, index) {
            collect.push(callback.call(thisp, value, index, self));
        }, void 0);
        return collect;
    }
);

var object_create = Object.create || function (prototype) {
    function Type() { }
    Type.prototype = prototype;
    return new Type();
};

var object_hasOwnProperty = uncurryThis(Object.prototype.hasOwnProperty);

var object_keys = Object.keys || function (object) {
    var keys = [];
    for (var key in object) {
        if (object_hasOwnProperty(object, key)) {
            keys.push(key);
        }
    }
    return keys;
};

var object_toString = uncurryThis(Object.prototype.toString);

function isObject(value) {
    return value === Object(value);
}

// generator related shims

// FIXME: Remove this function once ES6 generators are in SpiderMonkey.
function isStopIteration(exception) {
    return (
        object_toString(exception) === "[object StopIteration]" ||
        exception instanceof QReturnValue
    );
}

// FIXME: Remove this helper and Q.return once ES6 generators are in
// SpiderMonkey.
var QReturnValue;
if (typeof ReturnValue !== "undefined") {
    QReturnValue = ReturnValue;
} else {
    QReturnValue = function (value) {
        this.value = value;
    };
}

// Until V8 3.19 / Chromium 29 is released, SpiderMonkey is the only
// engine that has a deployed base of browsers that support generators.
// However, SM's generators use the Python-inspired semantics of
// outdated ES6 drafts.  We would like to support ES6, but we'd also
// like to make it possible to use generators in deployed browsers, so
// we also support Python-style generators.  At some point we can remove
// this block.
var hasES6Generators;
try {
    /* jshint evil: true, nonew: false */
    new Function("(function* (){ yield 1; })");
    hasES6Generators = true;
} catch (e) {
    hasES6Generators = false;
}

// long stack traces

var STACK_JUMP_SEPARATOR = "From previous event:";

function makeStackTraceLong(error, promise) {
    // If possible, transform the error stack trace by removing Node and Q
    // cruft, then concatenating with the stack trace of `promise`. See #57.
    if (hasStacks &&
        promise.stack &&
        typeof error === "object" &&
        error !== null &&
        error.stack &&
        error.stack.indexOf(STACK_JUMP_SEPARATOR) === -1
    ) {
        var stacks = [];
        for (var p = promise; !!p; p = p.source) {
            if (p.stack) {
                stacks.unshift(p.stack);
            }
        }
        stacks.unshift(error.stack);

        var concatedStacks = stacks.join("\n" + STACK_JUMP_SEPARATOR + "\n");
        error.stack = filterStackString(concatedStacks);
    }
}

function filterStackString(stackString) {
    var lines = stackString.split("\n");
    var desiredLines = [];
    for (var i = 0; i < lines.length; ++i) {
        var line = lines[i];

        if (!isInternalFrame(line) && !isNodeFrame(line) && line) {
            desiredLines.push(line);
        }
    }
    return desiredLines.join("\n");
}

function isNodeFrame(stackLine) {
    return stackLine.indexOf("(module.js:") !== -1 ||
           stackLine.indexOf("(node.js:") !== -1;
}

function getFileNameAndLineNumber(stackLine) {
    // Named functions: "at functionName (filename:lineNumber:columnNumber)"
    // In IE10 function name can have spaces ("Anonymous function") O_o
    var attempt1 = /at .+ \((.+):(\d+):(?:\d+)\)$/.exec(stackLine);
    if (attempt1) {
        return [attempt1[1], Number(attempt1[2])];
    }

    // Anonymous functions: "at filename:lineNumber:columnNumber"
    var attempt2 = /at ([^ ]+):(\d+):(?:\d+)$/.exec(stackLine);
    if (attempt2) {
        return [attempt2[1], Number(attempt2[2])];
    }

    // Firefox style: "function@filename:lineNumber or @filename:lineNumber"
    var attempt3 = /.*@(.+):(\d+)$/.exec(stackLine);
    if (attempt3) {
        return [attempt3[1], Number(attempt3[2])];
    }
}

function isInternalFrame(stackLine) {
    var fileNameAndLineNumber = getFileNameAndLineNumber(stackLine);

    if (!fileNameAndLineNumber) {
        return false;
    }

    var fileName = fileNameAndLineNumber[0];
    var lineNumber = fileNameAndLineNumber[1];

    return fileName === qFileName &&
        lineNumber >= qStartingLine &&
        lineNumber <= qEndingLine;
}

// discover own file name and line number range for filtering stack
// traces
function captureLine() {
    if (!hasStacks) {
        return;
    }

    try {
        throw new Error();
    } catch (e) {
        var lines = e.stack.split("\n");
        var firstLine = lines[0].indexOf("@") > 0 ? lines[1] : lines[2];
        var fileNameAndLineNumber = getFileNameAndLineNumber(firstLine);
        if (!fileNameAndLineNumber) {
            return;
        }

        qFileName = fileNameAndLineNumber[0];
        return fileNameAndLineNumber[1];
    }
}

function deprecate(callback, name, alternative) {
    return function () {
        if (typeof console !== "undefined" &&
            typeof console.warn === "function") {
            console.warn(name + " is deprecated, use " + alternative +
                         " instead.", new Error("").stack);
        }
        return callback.apply(callback, arguments);
    };
}

// end of shims
// beginning of real work

/**
 * Constructs a promise for an immediate reference, passes promises through, or
 * coerces promises from different systems.
 * @param value immediate reference or promise
 */
function Q(value) {
    // If the object is already a Promise, return it directly.  This enables
    // the resolve function to both be used to created references from objects,
    // but to tolerably coerce non-promises to promises.
    if (isPromise(value)) {
        return value;
    }

    // assimilate thenables
    if (isPromiseAlike(value)) {
        return coerce(value);
    } else {
        return fulfill(value);
    }
}
Q.resolve = Q;

/**
 * Performs a task in a future turn of the event loop.
 * @param {Function} task
 */
Q.nextTick = nextTick;

/**
 * Controls whether or not long stack traces will be on
 */
Q.longStackSupport = false;

/**
 * Constructs a {promise, resolve, reject} object.
 *
 * `resolve` is a callback to invoke with a more resolved value for the
 * promise. To fulfill the promise, invoke `resolve` with any value that is
 * not a thenable. To reject the promise, invoke `resolve` with a rejected
 * thenable, or invoke `reject` with the reason directly. To resolve the
 * promise to another thenable, thus putting it in the same state, invoke
 * `resolve` with that other thenable.
 */
Q.defer = defer;
function defer() {
    // if "messages" is an "Array", that indicates that the promise has not yet
    // been resolved.  If it is "undefined", it has been resolved.  Each
    // element of the messages array is itself an array of complete arguments to
    // forward to the resolved promise.  We coerce the resolution value to a
    // promise using the `resolve` function because it handles both fully
    // non-thenable values and other thenables gracefully.
    var messages = [], progressListeners = [], resolvedPromise;

    var deferred = object_create(defer.prototype);
    var promise = object_create(Promise.prototype);

    promise.promiseDispatch = function (resolve, op, operands) {
        var args = array_slice(arguments);
        if (messages) {
            messages.push(args);
            if (op === "when" && operands[1]) { // progress operand
                progressListeners.push(operands[1]);
            }
        } else {
            nextTick(function () {
                resolvedPromise.promiseDispatch.apply(resolvedPromise, args);
            });
        }
    };

    // XXX deprecated
    promise.valueOf = deprecate(function () {
        if (messages) {
            return promise;
        }
        var nearerValue = nearer(resolvedPromise);
        if (isPromise(nearerValue)) {
            resolvedPromise = nearerValue; // shorten chain
        }
        return nearerValue;
    }, "valueOf", "inspect");

    promise.inspect = function () {
        if (!resolvedPromise) {
            return { state: "pending" };
        }
        return resolvedPromise.inspect();
    };

    if (Q.longStackSupport && hasStacks) {
        try {
            throw new Error();
        } catch (e) {
            // NOTE: don't try to use `Error.captureStackTrace` or transfer the
            // accessor around; that causes memory leaks as per GH-111. Just
            // reify the stack trace as a string ASAP.
            //
            // At the same time, cut off the first line; it's always just
            // "[object Promise]\n", as per the `toString`.
            promise.stack = e.stack.substring(e.stack.indexOf("\n") + 1);
        }
    }

    // NOTE: we do the checks for `resolvedPromise` in each method, instead of
    // consolidating them into `become`, since otherwise we'd create new
    // promises with the lines `become(whatever(value))`. See e.g. GH-252.

    function become(newPromise) {
        resolvedPromise = newPromise;
        promise.source = newPromise;

        array_reduce(messages, function (undefined, message) {
            nextTick(function () {
                newPromise.promiseDispatch.apply(newPromise, message);
            });
        }, void 0);

        messages = void 0;
        progressListeners = void 0;
    }

    deferred.promise = promise;
    deferred.resolve = function (value) {
        if (resolvedPromise) {
            return;
        }

        become(Q(value));
    };

    deferred.fulfill = function (value) {
        if (resolvedPromise) {
            return;
        }

        become(fulfill(value));
    };
    deferred.reject = function (reason) {
        if (resolvedPromise) {
            return;
        }

        become(reject(reason));
    };
    deferred.notify = function (progress) {
        if (resolvedPromise) {
            return;
        }

        array_reduce(progressListeners, function (undefined, progressListener) {
            nextTick(function () {
                progressListener(progress);
            });
        }, void 0);
    };

    return deferred;
}

/**
 * Creates a Node-style callback that will resolve or reject the deferred
 * promise.
 * @returns a nodeback
 */
defer.prototype.makeNodeResolver = function () {
    var self = this;
    return function (error, value) {
        if (error) {
            self.reject(error);
        } else if (arguments.length > 2) {
            self.resolve(array_slice(arguments, 1));
        } else {
            self.resolve(value);
        }
    };
};

/**
 * @param resolver {Function} a function that returns nothing and accepts
 * the resolve, reject, and notify functions for a deferred.
 * @returns a promise that may be resolved with the given resolve and reject
 * functions, or rejected by a thrown exception in resolver
 */
Q.promise = promise;
function promise(resolver) {
    if (typeof resolver !== "function") {
        throw new TypeError("resolver must be a function.");
    }
    var deferred = defer();
    try {
        resolver(deferred.resolve, deferred.reject, deferred.notify);
    } catch (reason) {
        deferred.reject(reason);
    }
    return deferred.promise;
}

// XXX experimental.  This method is a way to denote that a local value is
// serializable and should be immediately dispatched to a remote upon request,
// instead of passing a reference.
Q.passByCopy = function (object) {
    //freeze(object);
    //passByCopies.set(object, true);
    return object;
};

Promise.prototype.passByCopy = function () {
    //freeze(object);
    //passByCopies.set(object, true);
    return this;
};

/**
 * If two promises eventually fulfill to the same value, promises that value,
 * but otherwise rejects.
 * @param x {Any*}
 * @param y {Any*}
 * @returns {Any*} a promise for x and y if they are the same, but a rejection
 * otherwise.
 *
 */
Q.join = function (x, y) {
    return Q(x).join(y);
};

Promise.prototype.join = function (that) {
    return Q([this, that]).spread(function (x, y) {
        if (x === y) {
            // TODO: "===" should be Object.is or equiv
            return x;
        } else {
            throw new Error("Can't join: not the same: " + x + " " + y);
        }
    });
};

/**
 * Returns a promise for the first of an array of promises to become fulfilled.
 * @param answers {Array[Any*]} promises to race
 * @returns {Any*} the first promise to be fulfilled
 */
Q.race = race;
function race(answerPs) {
    return promise(function(resolve, reject) {
        // Switch to this once we can assume at least ES5
        // answerPs.forEach(function(answerP) {
        //     Q(answerP).then(resolve, reject);
        // });
        // Use this in the meantime
        for (var i = 0, len = answerPs.length; i < len; i++) {
            Q(answerPs[i]).then(resolve, reject);
        }
    });
}

Promise.prototype.race = function () {
    return this.then(Q.race);
};

/**
 * Constructs a Promise with a promise descriptor object and optional fallback
 * function.  The descriptor contains methods like when(rejected), get(name),
 * set(name, value), post(name, args), and delete(name), which all
 * return either a value, a promise for a value, or a rejection.  The fallback
 * accepts the operation name, a resolver, and any further arguments that would
 * have been forwarded to the appropriate method above had a method been
 * provided with the proper name.  The API makes no guarantees about the nature
 * of the returned object, apart from that it is usable whereever promises are
 * bought and sold.
 */
Q.makePromise = Promise;
function Promise(descriptor, fallback, inspect) {
    if (fallback === void 0) {
        fallback = function (op) {
            return reject(new Error(
                "Promise does not support operation: " + op
            ));
        };
    }
    if (inspect === void 0) {
        inspect = function () {
            return {state: "unknown"};
        };
    }

    var promise = object_create(Promise.prototype);

    promise.promiseDispatch = function (resolve, op, args) {
        var result;
        try {
            if (descriptor[op]) {
                result = descriptor[op].apply(promise, args);
            } else {
                result = fallback.call(promise, op, args);
            }
        } catch (exception) {
            result = reject(exception);
        }
        if (resolve) {
            resolve(result);
        }
    };

    promise.inspect = inspect;

    // XXX deprecated `valueOf` and `exception` support
    if (inspect) {
        var inspected = inspect();
        if (inspected.state === "rejected") {
            promise.exception = inspected.reason;
        }

        promise.valueOf = deprecate(function () {
            var inspected = inspect();
            if (inspected.state === "pending" ||
                inspected.state === "rejected") {
                return promise;
            }
            return inspected.value;
        });
    }

    return promise;
}

Promise.prototype.toString = function () {
    return "[object Promise]";
};

Promise.prototype.then = function (fulfilled, rejected, progressed) {
    var self = this;
    var deferred = defer();
    var done = false;   // ensure the untrusted promise makes at most a
                        // single call to one of the callbacks

    function _fulfilled(value) {
        try {
            return typeof fulfilled === "function" ? fulfilled(value) : value;
        } catch (exception) {
            return reject(exception);
        }
    }

    function _rejected(exception) {
        if (typeof rejected === "function") {
            makeStackTraceLong(exception, self);
            try {
                return rejected(exception);
            } catch (newException) {
                return reject(newException);
            }
        }
        return reject(exception);
    }

    function _progressed(value) {
        return typeof progressed === "function" ? progressed(value) : value;
    }

    nextTick(function () {
        self.promiseDispatch(function (value) {
            if (done) {
                return;
            }
            done = true;

            deferred.resolve(_fulfilled(value));
        }, "when", [function (exception) {
            if (done) {
                return;
            }
            done = true;

            deferred.resolve(_rejected(exception));
        }]);
    });

    // Progress propagator need to be attached in the current tick.
    self.promiseDispatch(void 0, "when", [void 0, function (value) {
        var newValue;
        var threw = false;
        try {
            newValue = _progressed(value);
        } catch (e) {
            threw = true;
            if (Q.onerror) {
                Q.onerror(e);
            } else {
                throw e;
            }
        }

        if (!threw) {
            deferred.notify(newValue);
        }
    }]);

    return deferred.promise;
};

/**
 * Registers an observer on a promise.
 *
 * Guarantees:
 *
 * 1. that fulfilled and rejected will be called only once.
 * 2. that either the fulfilled callback or the rejected callback will be
 *    called, but not both.
 * 3. that fulfilled and rejected will not be called in this turn.
 *
 * @param value      promise or immediate reference to observe
 * @param fulfilled  function to be called with the fulfilled value
 * @param rejected   function to be called with the rejection exception
 * @param progressed function to be called on any progress notifications
 * @return promise for the return value from the invoked callback
 */
Q.when = when;
function when(value, fulfilled, rejected, progressed) {
    return Q(value).then(fulfilled, rejected, progressed);
}

Promise.prototype.thenResolve = function (value) {
    return this.then(function () { return value; });
};

Q.thenResolve = function (promise, value) {
    return Q(promise).thenResolve(value);
};

Promise.prototype.thenReject = function (reason) {
    return this.then(function () { throw reason; });
};

Q.thenReject = function (promise, reason) {
    return Q(promise).thenReject(reason);
};

/**
 * If an object is not a promise, it is as "near" as possible.
 * If a promise is rejected, it is as "near" as possible too.
 * If it’s a fulfilled promise, the fulfillment value is nearer.
 * If it’s a deferred promise and the deferred has been resolved, the
 * resolution is "nearer".
 * @param object
 * @returns most resolved (nearest) form of the object
 */

// XXX should we re-do this?
Q.nearer = nearer;
function nearer(value) {
    if (isPromise(value)) {
        var inspected = value.inspect();
        if (inspected.state === "fulfilled") {
            return inspected.value;
        }
    }
    return value;
}

/**
 * @returns whether the given object is a promise.
 * Otherwise it is a fulfilled value.
 */
Q.isPromise = isPromise;
function isPromise(object) {
    return isObject(object) &&
        typeof object.promiseDispatch === "function" &&
        typeof object.inspect === "function";
}

Q.isPromiseAlike = isPromiseAlike;
function isPromiseAlike(object) {
    return isObject(object) && typeof object.then === "function";
}

/**
 * @returns whether the given object is a pending promise, meaning not
 * fulfilled or rejected.
 */
Q.isPending = isPending;
function isPending(object) {
    return isPromise(object) && object.inspect().state === "pending";
}

Promise.prototype.isPending = function () {
    return this.inspect().state === "pending";
};

/**
 * @returns whether the given object is a value or fulfilled
 * promise.
 */
Q.isFulfilled = isFulfilled;
function isFulfilled(object) {
    return !isPromise(object) || object.inspect().state === "fulfilled";
}

Promise.prototype.isFulfilled = function () {
    return this.inspect().state === "fulfilled";
};

/**
 * @returns whether the given object is a rejected promise.
 */
Q.isRejected = isRejected;
function isRejected(object) {
    return isPromise(object) && object.inspect().state === "rejected";
}

Promise.prototype.isRejected = function () {
    return this.inspect().state === "rejected";
};

//// BEGIN UNHANDLED REJECTION TRACKING

// This promise library consumes exceptions thrown in handlers so they can be
// handled by a subsequent promise.  The exceptions get added to this array when
// they are created, and removed when they are handled.  Note that in ES6 or
// shimmed environments, this would naturally be a `Set`.
var unhandledReasons = [];
var unhandledRejections = [];
var unhandledReasonsDisplayed = false;
var trackUnhandledRejections = true;
function displayUnhandledReasons() {
    if (
        !unhandledReasonsDisplayed &&
        typeof window !== "undefined" &&
        !window.Touch &&
        window.console
    ) {
        console.warn("[Q] Unhandled rejection reasons (should be empty):",
                     unhandledReasons);
    }

    unhandledReasonsDisplayed = true;
}

function logUnhandledReasons() {
    for (var i = 0; i < unhandledReasons.length; i++) {
        var reason = unhandledReasons[i];
        console.warn("Unhandled rejection reason:", reason);
    }
}

function resetUnhandledRejections() {
    unhandledReasons.length = 0;
    unhandledRejections.length = 0;
    unhandledReasonsDisplayed = false;

    if (!trackUnhandledRejections) {
        trackUnhandledRejections = true;

        // Show unhandled rejection reasons if Node exits without handling an
        // outstanding rejection.  (Note that Browserify presently produces a
        // `process` global without the `EventEmitter` `on` method.)
        if (typeof process !== "undefined" && process.on) {
            process.on("exit", logUnhandledReasons);
        }
    }
}

function trackRejection(promise, reason) {
    if (!trackUnhandledRejections) {
        return;
    }

    unhandledRejections.push(promise);
    if (reason && typeof reason.stack !== "undefined") {
        unhandledReasons.push(reason.stack);
    } else {
        unhandledReasons.push("(no stack) " + reason);
    }
    displayUnhandledReasons();
}

function untrackRejection(promise) {
    if (!trackUnhandledRejections) {
        return;
    }

    var at = array_indexOf(unhandledRejections, promise);
    if (at !== -1) {
        unhandledRejections.splice(at, 1);
        unhandledReasons.splice(at, 1);
    }
}

Q.resetUnhandledRejections = resetUnhandledRejections;

Q.getUnhandledReasons = function () {
    // Make a copy so that consumers can't interfere with our internal state.
    return unhandledReasons.slice();
};

Q.stopUnhandledRejectionTracking = function () {
    resetUnhandledRejections();
    if (typeof process !== "undefined" && process.on) {
        process.removeListener("exit", logUnhandledReasons);
    }
    trackUnhandledRejections = false;
};

resetUnhandledRejections();

//// END UNHANDLED REJECTION TRACKING

/**
 * Constructs a rejected promise.
 * @param reason value describing the failure
 */
Q.reject = reject;
function reject(reason) {
    var rejection = Promise({
        "when": function (rejected) {
            // note that the error has been handled
            if (rejected) {
                untrackRejection(this);
            }
            return rejected ? rejected(reason) : this;
        }
    }, function fallback() {
        return this;
    }, function inspect() {
        return { state: "rejected", reason: reason };
    });

    // Note that the reason has not been handled.
    trackRejection(rejection, reason);

    return rejection;
}

/**
 * Constructs a fulfilled promise for an immediate reference.
 * @param value immediate reference
 */
Q.fulfill = fulfill;
function fulfill(value) {
    return Promise({
        "when": function () {
            return value;
        },
        "get": function (name) {
            return value[name];
        },
        "set": function (name, rhs) {
            value[name] = rhs;
        },
        "delete": function (name) {
            delete value[name];
        },
        "post": function (name, args) {
            // Mark Miller proposes that post with no name should apply a
            // promised function.
            if (name === null || name === void 0) {
                return value.apply(void 0, args);
            } else {
                return value[name].apply(value, args);
            }
        },
        "apply": function (thisp, args) {
            return value.apply(thisp, args);
        },
        "keys": function () {
            return object_keys(value);
        }
    }, void 0, function inspect() {
        return { state: "fulfilled", value: value };
    });
}

/**
 * Converts thenables to Q promises.
 * @param promise thenable promise
 * @returns a Q promise
 */
function coerce(promise) {
    var deferred = defer();
    nextTick(function () {
        try {
            promise.then(deferred.resolve, deferred.reject, deferred.notify);
        } catch (exception) {
            deferred.reject(exception);
        }
    });
    return deferred.promise;
}

/**
 * Annotates an object such that it will never be
 * transferred away from this process over any promise
 * communication channel.
 * @param object
 * @returns promise a wrapping of that object that
 * additionally responds to the "isDef" message
 * without a rejection.
 */
Q.master = master;
function master(object) {
    return Promise({
        "isDef": function () {}
    }, function fallback(op, args) {
        return dispatch(object, op, args);
    }, function () {
        return Q(object).inspect();
    });
}

/**
 * Spreads the values of a promised array of arguments into the
 * fulfillment callback.
 * @param fulfilled callback that receives variadic arguments from the
 * promised array
 * @param rejected callback that receives the exception if the promise
 * is rejected.
 * @returns a promise for the return value or thrown exception of
 * either callback.
 */
Q.spread = spread;
function spread(value, fulfilled, rejected) {
    return Q(value).spread(fulfilled, rejected);
}

Promise.prototype.spread = function (fulfilled, rejected) {
    return this.all().then(function (array) {
        return fulfilled.apply(void 0, array);
    }, rejected);
};

/**
 * The async function is a decorator for generator functions, turning
 * them into asynchronous generators.  Although generators are only part
 * of the newest ECMAScript 6 drafts, this code does not cause syntax
 * errors in older engines.  This code should continue to work and will
 * in fact improve over time as the language improves.
 *
 * ES6 generators are currently part of V8 version 3.19 with the
 * --harmony-generators runtime flag enabled.  SpiderMonkey has had them
 * for longer, but under an older Python-inspired form.  This function
 * works on both kinds of generators.
 *
 * Decorates a generator function such that:
 *  - it may yield promises
 *  - execution will continue when that promise is fulfilled
 *  - the value of the yield expression will be the fulfilled value
 *  - it returns a promise for the return value (when the generator
 *    stops iterating)
 *  - the decorated function returns a promise for the return value
 *    of the generator or the first rejected promise among those
 *    yielded.
 *  - if an error is thrown in the generator, it propagates through
 *    every following yield until it is caught, or until it escapes
 *    the generator function altogether, and is translated into a
 *    rejection for the promise returned by the decorated generator.
 */
Q.async = async;
function async(makeGenerator) {
    return function () {
        // when verb is "send", arg is a value
        // when verb is "throw", arg is an exception
        function continuer(verb, arg) {
            var result;
            if (hasES6Generators) {
                try {
                    result = generator[verb](arg);
                } catch (exception) {
                    return reject(exception);
                }
                if (result.done) {
                    return result.value;
                } else {
                    return when(result.value, callback, errback);
                }
            } else {
                // FIXME: Remove this case when SM does ES6 generators.
                try {
                    result = generator[verb](arg);
                } catch (exception) {
                    if (isStopIteration(exception)) {
                        return exception.value;
                    } else {
                        return reject(exception);
                    }
                }
                return when(result, callback, errback);
            }
        }
        var generator = makeGenerator.apply(this, arguments);
        var callback = continuer.bind(continuer, "next");
        var errback = continuer.bind(continuer, "throw");
        return callback();
    };
}

/**
 * The spawn function is a small wrapper around async that immediately
 * calls the generator and also ends the promise chain, so that any
 * unhandled errors are thrown instead of forwarded to the error
 * handler. This is useful because it's extremely common to run
 * generators at the top-level to work with libraries.
 */
Q.spawn = spawn;
function spawn(makeGenerator) {
    Q.done(Q.async(makeGenerator)());
}

// FIXME: Remove this interface once ES6 generators are in SpiderMonkey.
/**
 * Throws a ReturnValue exception to stop an asynchronous generator.
 *
 * This interface is a stop-gap measure to support generator return
 * values in older Firefox/SpiderMonkey.  In browsers that support ES6
 * generators like Chromium 29, just use "return" in your generator
 * functions.
 *
 * @param value the return value for the surrounding generator
 * @throws ReturnValue exception with the value.
 * @example
 * // ES6 style
 * Q.async(function* () {
 *      var foo = yield getFooPromise();
 *      var bar = yield getBarPromise();
 *      return foo + bar;
 * })
 * // Older SpiderMonkey style
 * Q.async(function () {
 *      var foo = yield getFooPromise();
 *      var bar = yield getBarPromise();
 *      Q.return(foo + bar);
 * })
 */
Q["return"] = _return;
function _return(value) {
    throw new QReturnValue(value);
}

/**
 * The promised function decorator ensures that any promise arguments
 * are settled and passed as values (`this` is also settled and passed
 * as a value).  It will also ensure that the result of a function is
 * always a promise.
 *
 * @example
 * var add = Q.promised(function (a, b) {
 *     return a + b;
 * });
 * add(Q(a), Q(B));
 *
 * @param {function} callback The function to decorate
 * @returns {function} a function that has been decorated.
 */
Q.promised = promised;
function promised(callback) {
    return function () {
        return spread([this, all(arguments)], function (self, args) {
            return callback.apply(self, args);
        });
    };
}

/**
 * sends a message to a value in a future turn
 * @param object* the recipient
 * @param op the name of the message operation, e.g., "when",
 * @param args further arguments to be forwarded to the operation
 * @returns result {Promise} a promise for the result of the operation
 */
Q.dispatch = dispatch;
function dispatch(object, op, args) {
    return Q(object).dispatch(op, args);
}

Promise.prototype.dispatch = function (op, args) {
    var self = this;
    var deferred = defer();
    nextTick(function () {
        self.promiseDispatch(deferred.resolve, op, args);
    });
    return deferred.promise;
};

/**
 * Gets the value of a property in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of property to get
 * @return promise for the property value
 */
Q.get = function (object, key) {
    return Q(object).dispatch("get", [key]);
};

Promise.prototype.get = function (key) {
    return this.dispatch("get", [key]);
};

/**
 * Sets the value of a property in a future turn.
 * @param object    promise or immediate reference for object object
 * @param name      name of property to set
 * @param value     new value of property
 * @return promise for the return value
 */
Q.set = function (object, key, value) {
    return Q(object).dispatch("set", [key, value]);
};

Promise.prototype.set = function (key, value) {
    return this.dispatch("set", [key, value]);
};

/**
 * Deletes a property in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of property to delete
 * @return promise for the return value
 */
Q.del = // XXX legacy
Q["delete"] = function (object, key) {
    return Q(object).dispatch("delete", [key]);
};

Promise.prototype.del = // XXX legacy
Promise.prototype["delete"] = function (key) {
    return this.dispatch("delete", [key]);
};

/**
 * Invokes a method in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of method to invoke
 * @param value     a value to post, typically an array of
 *                  invocation arguments for promises that
 *                  are ultimately backed with `resolve` values,
 *                  as opposed to those backed with URLs
 *                  wherein the posted value can be any
 *                  JSON serializable object.
 * @return promise for the return value
 */
// bound locally because it is used by other methods
Q.mapply = // XXX As proposed by "Redsandro"
Q.post = function (object, name, args) {
    return Q(object).dispatch("post", [name, args]);
};

Promise.prototype.mapply = // XXX As proposed by "Redsandro"
Promise.prototype.post = function (name, args) {
    return this.dispatch("post", [name, args]);
};

/**
 * Invokes a method in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of method to invoke
 * @param ...args   array of invocation arguments
 * @return promise for the return value
 */
Q.send = // XXX Mark Miller's proposed parlance
Q.mcall = // XXX As proposed by "Redsandro"
Q.invoke = function (object, name /*...args*/) {
    return Q(object).dispatch("post", [name, array_slice(arguments, 2)]);
};

Promise.prototype.send = // XXX Mark Miller's proposed parlance
Promise.prototype.mcall = // XXX As proposed by "Redsandro"
Promise.prototype.invoke = function (name /*...args*/) {
    return this.dispatch("post", [name, array_slice(arguments, 1)]);
};

/**
 * Applies the promised function in a future turn.
 * @param object    promise or immediate reference for target function
 * @param args      array of application arguments
 */
Q.fapply = function (object, args) {
    return Q(object).dispatch("apply", [void 0, args]);
};

Promise.prototype.fapply = function (args) {
    return this.dispatch("apply", [void 0, args]);
};

/**
 * Calls the promised function in a future turn.
 * @param object    promise or immediate reference for target function
 * @param ...args   array of application arguments
 */
Q["try"] =
Q.fcall = function (object /* ...args*/) {
    return Q(object).dispatch("apply", [void 0, array_slice(arguments, 1)]);
};

Promise.prototype.fcall = function (/*...args*/) {
    return this.dispatch("apply", [void 0, array_slice(arguments)]);
};

/**
 * Binds the promised function, transforming return values into a fulfilled
 * promise and thrown errors into a rejected one.
 * @param object    promise or immediate reference for target function
 * @param ...args   array of application arguments
 */
Q.fbind = function (object /*...args*/) {
    var promise = Q(object);
    var args = array_slice(arguments, 1);
    return function fbound() {
        return promise.dispatch("apply", [
            this,
            args.concat(array_slice(arguments))
        ]);
    };
};
Promise.prototype.fbind = function (/*...args*/) {
    var promise = this;
    var args = array_slice(arguments);
    return function fbound() {
        return promise.dispatch("apply", [
            this,
            args.concat(array_slice(arguments))
        ]);
    };
};

/**
 * Requests the names of the owned properties of a promised
 * object in a future turn.
 * @param object    promise or immediate reference for target object
 * @return promise for the keys of the eventually settled object
 */
Q.keys = function (object) {
    return Q(object).dispatch("keys", []);
};

Promise.prototype.keys = function () {
    return this.dispatch("keys", []);
};

/**
 * Turns an array of promises into a promise for an array.  If any of
 * the promises gets rejected, the whole array is rejected immediately.
 * @param {Array*} an array (or promise for an array) of values (or
 * promises for values)
 * @returns a promise for an array of the corresponding values
 */
// By Mark Miller
// http://wiki.ecmascript.org/doku.php?id=strawman:concurrency&rev=1308776521#allfulfilled
Q.all = all;
function all(promises) {
    return when(promises, function (promises) {
        var countDown = 0;
        var deferred = defer();
        array_reduce(promises, function (undefined, promise, index) {
            var snapshot;
            if (
                isPromise(promise) &&
                (snapshot = promise.inspect()).state === "fulfilled"
            ) {
                promises[index] = snapshot.value;
            } else {
                ++countDown;
                when(
                    promise,
                    function (value) {
                        promises[index] = value;
                        if (--countDown === 0) {
                            deferred.resolve(promises);
                        }
                    },
                    deferred.reject,
                    function (progress) {
                        deferred.notify({ index: index, value: progress });
                    }
                );
            }
        }, void 0);
        if (countDown === 0) {
            deferred.resolve(promises);
        }
        return deferred.promise;
    });
}

Promise.prototype.all = function () {
    return all(this);
};

/**
 * Waits for all promises to be settled, either fulfilled or
 * rejected.  This is distinct from `all` since that would stop
 * waiting at the first rejection.  The promise returned by
 * `allResolved` will never be rejected.
 * @param promises a promise for an array (or an array) of promises
 * (or values)
 * @return a promise for an array of promises
 */
Q.allResolved = deprecate(allResolved, "allResolved", "allSettled");
function allResolved(promises) {
    return when(promises, function (promises) {
        promises = array_map(promises, Q);
        return when(all(array_map(promises, function (promise) {
            return when(promise, noop, noop);
        })), function () {
            return promises;
        });
    });
}

Promise.prototype.allResolved = function () {
    return allResolved(this);
};

/**
 * @see Promise#allSettled
 */
Q.allSettled = allSettled;
function allSettled(promises) {
    return Q(promises).allSettled();
}

/**
 * Turns an array of promises into a promise for an array of their states (as
 * returned by `inspect`) when they have all settled.
 * @param {Array[Any*]} values an array (or promise for an array) of values (or
 * promises for values)
 * @returns {Array[State]} an array of states for the respective values.
 */
Promise.prototype.allSettled = function () {
    return this.then(function (promises) {
        return all(array_map(promises, function (promise) {
            promise = Q(promise);
            function regardless() {
                return promise.inspect();
            }
            return promise.then(regardless, regardless);
        }));
    });
};

/**
 * Captures the failure of a promise, giving an oportunity to recover
 * with a callback.  If the given promise is fulfilled, the returned
 * promise is fulfilled.
 * @param {Any*} promise for something
 * @param {Function} callback to fulfill the returned promise if the
 * given promise is rejected
 * @returns a promise for the return value of the callback
 */
Q.fail = // XXX legacy
Q["catch"] = function (object, rejected) {
    return Q(object).then(void 0, rejected);
};

Promise.prototype.fail = // XXX legacy
Promise.prototype["catch"] = function (rejected) {
    return this.then(void 0, rejected);
};

/**
 * Attaches a listener that can respond to progress notifications from a
 * promise's originating deferred. This listener receives the exact arguments
 * passed to ``deferred.notify``.
 * @param {Any*} promise for something
 * @param {Function} callback to receive any progress notifications
 * @returns the given promise, unchanged
 */
Q.progress = progress;
function progress(object, progressed) {
    return Q(object).then(void 0, void 0, progressed);
}

Promise.prototype.progress = function (progressed) {
    return this.then(void 0, void 0, progressed);
};

/**
 * Provides an opportunity to observe the settling of a promise,
 * regardless of whether the promise is fulfilled or rejected.  Forwards
 * the resolution to the returned promise when the callback is done.
 * The callback can return a promise to defer completion.
 * @param {Any*} promise
 * @param {Function} callback to observe the resolution of the given
 * promise, takes no arguments.
 * @returns a promise for the resolution of the given promise when
 * ``fin`` is done.
 */
Q.fin = // XXX legacy
Q["finally"] = function (object, callback) {
    return Q(object)["finally"](callback);
};

Promise.prototype.fin = // XXX legacy
Promise.prototype["finally"] = function (callback) {
    callback = Q(callback);
    return this.then(function (value) {
        return callback.fcall().then(function () {
            return value;
        });
    }, function (reason) {
        // TODO attempt to recycle the rejection with "this".
        return callback.fcall().then(function () {
            throw reason;
        });
    });
};

/**
 * Terminates a chain of promises, forcing rejections to be
 * thrown as exceptions.
 * @param {Any*} promise at the end of a chain of promises
 * @returns nothing
 */
Q.done = function (object, fulfilled, rejected, progress) {
    return Q(object).done(fulfilled, rejected, progress);
};

Promise.prototype.done = function (fulfilled, rejected, progress) {
    var onUnhandledError = function (error) {
        // forward to a future turn so that ``when``
        // does not catch it and turn it into a rejection.
        nextTick(function () {
            makeStackTraceLong(error, promise);
            if (Q.onerror) {
                Q.onerror(error);
            } else {
                throw error;
            }
        });
    };

    // Avoid unnecessary `nextTick`ing via an unnecessary `when`.
    var promise = fulfilled || rejected || progress ?
        this.then(fulfilled, rejected, progress) :
        this;

    if (typeof process === "object" && process && process.domain) {
        onUnhandledError = process.domain.bind(onUnhandledError);
    }

    promise.then(void 0, onUnhandledError);
};

/**
 * Causes a promise to be rejected if it does not get fulfilled before
 * some milliseconds time out.
 * @param {Any*} promise
 * @param {Number} milliseconds timeout
 * @param {String} custom error message (optional)
 * @returns a promise for the resolution of the given promise if it is
 * fulfilled before the timeout, otherwise rejected.
 */
Q.timeout = function (object, ms, message) {
    return Q(object).timeout(ms, message);
};

Promise.prototype.timeout = function (ms, message) {
    var deferred = defer();
    var timeoutId = setTimeout(function () {
        deferred.reject(new Error(message || "Timed out after " + ms + " ms"));
    }, ms);

    this.then(function (value) {
        clearTimeout(timeoutId);
        deferred.resolve(value);
    }, function (exception) {
        clearTimeout(timeoutId);
        deferred.reject(exception);
    }, deferred.notify);

    return deferred.promise;
};

/**
 * Returns a promise for the given value (or promised value), some
 * milliseconds after it resolved. Passes rejections immediately.
 * @param {Any*} promise
 * @param {Number} milliseconds
 * @returns a promise for the resolution of the given promise after milliseconds
 * time has elapsed since the resolution of the given promise.
 * If the given promise rejects, that is passed immediately.
 */
Q.delay = function (object, timeout) {
    if (timeout === void 0) {
        timeout = object;
        object = void 0;
    }
    return Q(object).delay(timeout);
};

Promise.prototype.delay = function (timeout) {
    return this.then(function (value) {
        var deferred = defer();
        setTimeout(function () {
            deferred.resolve(value);
        }, timeout);
        return deferred.promise;
    });
};

/**
 * Passes a continuation to a Node function, which is called with the given
 * arguments provided as an array, and returns a promise.
 *
 *      Q.nfapply(FS.readFile, [__filename])
 *      .then(function (content) {
 *      })
 *
 */
Q.nfapply = function (callback, args) {
    return Q(callback).nfapply(args);
};

Promise.prototype.nfapply = function (args) {
    var deferred = defer();
    var nodeArgs = array_slice(args);
    nodeArgs.push(deferred.makeNodeResolver());
    this.fapply(nodeArgs).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Passes a continuation to a Node function, which is called with the given
 * arguments provided individually, and returns a promise.
 * @example
 * Q.nfcall(FS.readFile, __filename)
 * .then(function (content) {
 * })
 *
 */
Q.nfcall = function (callback /*...args*/) {
    var args = array_slice(arguments, 1);
    return Q(callback).nfapply(args);
};

Promise.prototype.nfcall = function (/*...args*/) {
    var nodeArgs = array_slice(arguments);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.fapply(nodeArgs).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Wraps a NodeJS continuation passing function and returns an equivalent
 * version that returns a promise.
 * @example
 * Q.nfbind(FS.readFile, __filename)("utf-8")
 * .then(console.log)
 * .done()
 */
Q.nfbind =
Q.denodeify = function (callback /*...args*/) {
    var baseArgs = array_slice(arguments, 1);
    return function () {
        var nodeArgs = baseArgs.concat(array_slice(arguments));
        var deferred = defer();
        nodeArgs.push(deferred.makeNodeResolver());
        Q(callback).fapply(nodeArgs).fail(deferred.reject);
        return deferred.promise;
    };
};

Promise.prototype.nfbind =
Promise.prototype.denodeify = function (/*...args*/) {
    var args = array_slice(arguments);
    args.unshift(this);
    return Q.denodeify.apply(void 0, args);
};

Q.nbind = function (callback, thisp /*...args*/) {
    var baseArgs = array_slice(arguments, 2);
    return function () {
        var nodeArgs = baseArgs.concat(array_slice(arguments));
        var deferred = defer();
        nodeArgs.push(deferred.makeNodeResolver());
        function bound() {
            return callback.apply(thisp, arguments);
        }
        Q(bound).fapply(nodeArgs).fail(deferred.reject);
        return deferred.promise;
    };
};

Promise.prototype.nbind = function (/*thisp, ...args*/) {
    var args = array_slice(arguments, 0);
    args.unshift(this);
    return Q.nbind.apply(void 0, args);
};

/**
 * Calls a method of a Node-style object that accepts a Node-style
 * callback with a given array of arguments, plus a provided callback.
 * @param object an object that has the named method
 * @param {String} name name of the method of object
 * @param {Array} args arguments to pass to the method; the callback
 * will be provided by Q and appended to these arguments.
 * @returns a promise for the value or error
 */
Q.nmapply = // XXX As proposed by "Redsandro"
Q.npost = function (object, name, args) {
    return Q(object).npost(name, args);
};

Promise.prototype.nmapply = // XXX As proposed by "Redsandro"
Promise.prototype.npost = function (name, args) {
    var nodeArgs = array_slice(args || []);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Calls a method of a Node-style object that accepts a Node-style
 * callback, forwarding the given variadic arguments, plus a provided
 * callback argument.
 * @param object an object that has the named method
 * @param {String} name name of the method of object
 * @param ...args arguments to pass to the method; the callback will
 * be provided by Q and appended to these arguments.
 * @returns a promise for the value or error
 */
Q.nsend = // XXX Based on Mark Miller's proposed "send"
Q.nmcall = // XXX Based on "Redsandro's" proposal
Q.ninvoke = function (object, name /*...args*/) {
    var nodeArgs = array_slice(arguments, 2);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    Q(object).dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

Promise.prototype.nsend = // XXX Based on Mark Miller's proposed "send"
Promise.prototype.nmcall = // XXX Based on "Redsandro's" proposal
Promise.prototype.ninvoke = function (name /*...args*/) {
    var nodeArgs = array_slice(arguments, 1);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

/**
 * If a function would like to support both Node continuation-passing-style and
 * promise-returning-style, it can end its internal promise chain with
 * `nodeify(nodeback)`, forwarding the optional nodeback argument.  If the user
 * elects to use a nodeback, the result will be sent there.  If they do not
 * pass a nodeback, they will receive the result promise.
 * @param object a result (or a promise for a result)
 * @param {Function} nodeback a Node.js-style callback
 * @returns either the promise or nothing
 */
Q.nodeify = nodeify;
function nodeify(object, nodeback) {
    return Q(object).nodeify(nodeback);
}

Promise.prototype.nodeify = function (nodeback) {
    if (nodeback) {
        this.then(function (value) {
            nextTick(function () {
                nodeback(null, value);
            });
        }, function (error) {
            nextTick(function () {
                nodeback(error);
            });
        });
    } else {
        return this;
    }
};

// All code before this point will be filtered from stack traces.
var qEndingLine = captureLine();

return Q;

});

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

/* global module */
(function(root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory();
    }
    else if (typeof define === 'function' && define.amd) {
        define('paw/WheelEventSimulator', [], factory);
    }
    else {
        root.WheelEventSimulator = factory();
    }
}(this, function() {

    /**
     * WheelEventSimulator is designed for use in modern browsers (FF6+, IE9+).
     * Polyfill CustomEvent support for use when dispatching events.
     *
     * https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent#Browser_compatibility
     */
    (function polyfillCustomEventConstructor() {
        try {
            return new CustomEvent('?');
        }
        catch (error) {
            function CustomEventPolyfill(event, params) {
                params = params || { bubbles: false, cancelable: false, detail: undefined };
                var evt = document.createEvent('CustomEvent');
                evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
                return evt;
            }

            CustomEventPolyfill.prototype = window.Event.prototype;

            window.CustomEvent = CustomEventPolyfill;
        }
    }());

    var defaultDependencies = {
        window: window
    };

    /**
     * Good reading:
     * https://developer.mozilla.org/en-US/docs/Web/Reference/Events/wheel#bc1
     * http://stackoverflow.com/questions/10821985/detecting-mousewheel-on-the-x-axis-left-and-right-with-javascript
     *
     * Cut-and-pasted from wf-common. Depending on wf-common would introduce
     * a lot of pain bringing in its dependencies and switching the UMD headers
     * used here.
     */
    function detectMouseWheelEvent(document) {
        // Modern browsers support "wheel", even IE9+;
        // however, IE will return false when checking for 'onwheel', so
        // we need to check the documentMode property.
        if ('onwheel' in document || document.documentMode >= 9) {
            return 'wheel';
        }
        // Webkit and IE8- support at least 'mousewheel'
        else if ('onmousewheel' in document) {
            return 'mousewheel';
        }
        // let's assume that remaining browsers are older Firefox
        else {
            return 'DOMMouseScroll';
        }
    }

    /**
     * WheelEventSimulator is a utility to create and dispatch browser-specific wheel events.
     *
     * @constructor
     */
    var WheelEventSimulator = function(dependencies) {
        dependencies = dependencies || {};
        var settings = {
            window: dependencies.window || defaultDependencies.window
        };

        this.window = settings.window;
        this.eventName = detectMouseWheelEvent(settings.window.document);
    };

    WheelEventSimulator.prototype = {

        /**
         * Dispatch a wheel event on the targetOrPoint with the given options.
         *
         * @param {HTMLElement|{x:Number, y:Number}} targetOrPoint
         *     An HTMLElement or the screen position to target.
         * @param {Object} [options]
         * @param {Number} [options.deltaX] The wheel delta along the x-axis.
         * @param {Number} [options.deltaY] The wheel delta along the y-axis.
         */
        dispatch: function(targetOrPoint, options) {
            options = options || {};
            var settings = {
                deltaX: options.deltaX || 0,
                deltaY: options.deltaY || 0
            };

            var evt;
            var eventName = this.eventName;

            if (eventName === 'wheel') {
                // CF: https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent
                // delta values are signed such that positive is up.
                evt = new CustomEvent(eventName, { bubbles: true, cancelable: true });
                evt.delta = settings.deltaX || settings.deltaY;
                evt.deltaX = settings.deltaX;
                evt.deltaY = settings.deltaY;
                evt.deltaZ = 0;
                evt.deltaMode = 0x00;
            }
            else if (eventName === 'mousewheel') {
                // cf: https://developer.mozilla.org/en-US/docs/Web/API/MouseWheelEvent
                // wheelDelta values are inverted and signed such that negative is up.
                evt = new CustomEvent(eventName);
                evt.wheelDelta = -(settings.deltaX || settings.deltaY);
                evt.wheelDeltaX = -settings.deltaX;
                evt.wheelDeltaY = -settings.deltaY;
            }
            else {
                throw new Error('Your browser is not supported by WheelEventSimulator.');
            }

            var target;
            if (targetOrPoint instanceof HTMLElement) {
                target = targetOrPoint;
            }
            else {
                target = document.elementFromPoint(targetOrPoint.x, targetOrPoint.y);
            }
            target.dispatchEvent(evt);
        }
    };

    return WheelEventSimulator;
}));

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

/* global module */
(function(root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory();
    }
    else if (typeof define === 'function' && define.amd) {
        define('paw/ViewportRelative', [], factory);
    }
    else {
        root.ViewportRelative = factory();
    }
}(this, function() {

    'use strict';

    var supportedWords = {
        'x': {
            'left': 0,
            'right': 1,
            'center': 0.5
        },
        'y': {
            'top': 0,
            'bottom': 1,
            'center': 0.5
        }
    };

    function normalizePoint(point) {
        if (!point) {
            point = {
                x: 'center',
                y: 'center'
            };
        }
        if (typeof(point) === 'string') {
            var pointSplit = point.trim().split(/\s+/g);
            point = {
                x: (pointSplit[0]).toLowerCase(),
                y: (pointSplit[1] || '').toLowerCase()
            };
            point.y = point.y || 'center';
        }
        return point;
    }

    function isOrderReversed(point) {
        var xVal = supportedWords.x[point.x];
        var yVal = supportedWords.y[point.y];
        var yRevVal = supportedWords.y[point.x];
        var xRevVal = supportedWords.x[point.y];

        // see if the word gives away the position
        // these will be true if definitely the right word
        // false if not, and null if maybe aka could be either (ie center)

        var xIsX = xVal    === 1 || xVal    === 0; // left or right are first
        var yIsY = yVal    === 1 || yVal    === 0; // top or bottom are second
        var xIsY = yRevVal === 1 || yRevVal === 0; // top or bottom are first
        var yIsX = xRevVal === 1 || xRevVal === 0; // left or right are second

        // update with 'center' being indeterminate
        if (xVal === 0.5) {
            xIsX = null;
        }
        if (yVal === 0.5) {
            yIsY = null;
        }
        if (xRevVal === 0.5) {
            yIsX = null;
        }
        if (yRevVal === 0.5) {
            xIsY = null;
        }

        // we return true if we can for sure say that the arguments
        // are reversed, otherwise assume they are in x,y order
        if (xIsY === true && !yIsY) {
            return true;
        }
        if (yIsX === true && !xIsY) {
            return true;
        }
        return false;
    }

    function valueToPixels(maybeRelativeValue, axis, viewportDimensions) {
        var type = typeof(maybeRelativeValue);
        var max;
        var percent;
        var result;
        var wordMultiplier;

        if (type === 'number') {
            return maybeRelativeValue;
        }

        var num = Number(maybeRelativeValue);
        if (!isNaN(num)) {
            return num;
        }

        // check our inputs
        if (!viewportDimensions || typeof viewportDimensions !== 'object') {
            // throw 'Viewport Dimensions are required';
            return undefined;
        }
        if (!(viewportDimensions.width >= 0 && viewportDimensions.height >= 0)) {
            //throw 'Viewport width and height must be >= 0';
            return undefined;
        }
        if (!(axis === 'x' || axis === 'y')) {
            //throw 'Axis must be either x or y';
            return undefined;
        }
        if (type === 'string') {
            // trim and lowercase the input
            maybeRelativeValue = maybeRelativeValue.trim().toLowerCase();
            max = axis === 'x' ? viewportDimensions.width : viewportDimensions.height;

            // if it is a percentage
            if (maybeRelativeValue.indexOf('%') === maybeRelativeValue.length - 1) {
                maybeRelativeValue = maybeRelativeValue.replace('%', '');
                percent = Number(maybeRelativeValue) / 100.0;
                if (isNaN(percent)) {
                    //throw 'Relative value not in expected ##% format';
                    return undefined;
                }

                result = Math.round(max * percent * 1000) / 1000;
            } else if (maybeRelativeValue.indexOf('px') === maybeRelativeValue.length - 2) {
                maybeRelativeValue = maybeRelativeValue.replace('px', '');
                result = Number(maybeRelativeValue);
                if (isNaN(result)) {
                    return undefined;
                }
            } else {
                wordMultiplier = supportedWords[axis][maybeRelativeValue];
                // if it is a supported word
                if (wordMultiplier !== undefined) {
                    result = wordMultiplier * max;
                } else {
                    maybeRelativeValue = Number(maybeRelativeValue);
                    if (!isNaN(maybeRelativeValue)) {
                        result = maybeRelativeValue;
                    }
                }
            }
        }

        return result;
    }

    /*
     * @param {object} point the point to convert
     * @return a point that has x,y properties as pixels
     */
    function pointToPixels(point, viewportDimensions) {
        point = normalizePoint(point);

        var xAxis = 'x';
        var yAxis = 'y';
        var reversed = isOrderReversed(point);
        if (reversed) {
            xAxis = 'y';
            yAxis = 'x';
        }
        var xVal = valueToPixels(point.x, xAxis, viewportDimensions);
        var yVal = valueToPixels(point.y, yAxis, viewportDimensions);

        // if the order is reversed, swap variables
        if (reversed) {
            var temp = xVal;
            xVal = yVal;
            yVal = temp;
        }
        // set the x,y values
        point.x = xVal;
        point.y = yVal;

        return point;
    }

    function pointToPercent(point, viewportDimensions) {
        point = normalizePoint(point);
        point.x = (point.x / viewportDimensions.width * 100);
        point.y = (point.y / viewportDimensions.height * 100);
        point.x = (Math.round(point.x * 1000) / 1000) + '%';
        point.y = (Math.round(point.y * 1000) / 1000) + '%';
        return point;
    }

    function pointToString(point) {
        if (!point) {
            return undefined;
        }
        if (point && point.x !== null && point.x !== undefined && point.y !== null && point.y !== undefined) {
            if (typeof point.x === 'number') {
                point.x = point.x + 'px';
            }
            if (typeof point.y === 'number') {
                point.y = point.y + 'px';
            }
            return point.x + ' ' + point.y;
        }
        return point;
    }

    // export an object with the public functions on it
    return {
        normalizePoint: normalizePoint,
        isOrderReversed: isOrderReversed,
        valueToPixels: valueToPixels,
        pointToPixels: pointToPixels,
        pointToPercent: pointToPercent,
        pointToString: pointToString
    };

}));

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

/* global module */
(function(root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory(require('paw/WheelEventSimulator'));
    }
    else if (typeof define === 'function' && define.amd) {
        define('paw/Gestures', ['paw/WheelEventSimulator'], factory);
    }
    else {
        root.Gestures = factory(root.WheelEventSimulator);
    }
}(this, function(WheelEventSimulator) {

    /**
     * This provides functionality for Paw and not meant to be used separately
     *
     * @mixin
     * @exports paw/Gestures
     */
    var Gestures = {

        /**
         * Touch at a certain location or locations
         *
         * @chainable
         * @method
         * @param {object} [where] Either an object with an x and y property
         *   or an array of objects each with x and y properties
         *   The array indicates the number of fingers to touch with
         *   Ex: {x: 100, y: 100} or [{x: 100, y: 100}, {x: 400, y: 200}]
         */
        touch: function(where) {
            where = where || this.getDefaultTouchLocation();
            this.setTouches(where);
            this._triggerStart();
        },

        /**
         * Same as touch, but doesn't remove existing touches
         *
         * @chainable
         * @method
         * @param {(object|string)} where a where expression
         */
        addTouch: function(where) {
            if (!where) {
                throw new Error('"where" parameter can not be empty when adding a touch');
            }
            where = this._buildTouches(where);
            this.touches = this.touches.concat(where);
            this._triggerStart();
        },

        /**
         * Remove a touch
         *
         * @chainable
         * @method
         * @param {Number} [fingerNumber] The 0 based finger number to remove
         */
        removeTouch: function(fingerNumber) {
            if (!this.touches.length) {
                return;
            }

            // use the last touch as the finger if the finger number is invalid
            if (fingerNumber !== 0 && !fingerNumber) {
                fingerNumber = this.touches.length - 1;
            }

            if (0 <= fingerNumber && fingerNumber < this.touches.length) {
                this.touches.splice(fingerNumber, 1);
                this.clearTouchIndicators();
                this.indicateTouches(this.touches);
            }
        },

        /**
         * Moves the existing touches to the next location without releasing
         * The move is "instantaneous" and not over a duration.
         * Multiple moves make up a swipe.
         *
         * @chainable
         * @method
         * @param {object|string|object[]} toWhere a where expression
         */
        move: function(toWhere) {
            if (!this.touches || this.touches.length === 0) {
                throw new Error('There are no current touches to move from.');
            }
            this.setTouches(toWhere);
            this._triggerMove();
        },

        /**
         * Moves the currently set touches to new positions, in multiple moves over a duration.
         * If the duration is omitted or <= zero, the drag is instantaneous
         * otherwise the drag is spread out over the duration given
         *
         * @chainable
         * @method
         * @param {(object|string)} toWhere A where expression Ex: {x: 100, y: 100, duration: 300} or {duration: 300, end: [{x: 100, y: 100}, {x: 400, y: 200}] }
         * @param {Number} [duration] How long the swipe will take
         */
        drag: function(toWhere, duration, done) {
            var self = this;
            var deltas = [];
            var deltaX;
            var deltaY;
            var interval = 16;
            var segments;
            var k = 0;
            var i = 0;
            var point;
            var len = 0;

            duration = Math.max(0, duration >= 0 ? duration : this.getDefaultDuration());
            segments = Math.floor(duration / interval);

            // do an instantaneous move with no extra work
            if (duration === 0) {
                self.setTouches(toWhere);
                self._triggerMove();
                done();
            }

            var endWhere = self._buildTouches(toWhere);
            len = self.touches.length;
            for (i = 0; i < len; i++) {
                point = self.touches[i];
                if (i < endWhere.length) {
                    deltaX = (endWhere[i].x - point.x) / segments;
                    deltaY = (endWhere[i].y - point.y) / segments;
                    deltas.push({
                        x: deltaX,
                        y: deltaY
                    });
                }
            }

            function eachSegment() {
                if (k >= segments) {
                    self.setTouches(endWhere);
                    self._triggerMove();
                    done();
                    return;
                }
                else {
                    for (i = 0; i < self.touches.length; i++) {
                        self.touches[i].x += deltas[i].x;
                        self.touches[i].y += deltas[i].y;
                    }
                    self._triggerMove();
                    k++;
                    setTimeout(eachSegment, interval);
                }
            }
            eachSegment();
        },

        /**
         * Trigger a touch release event
         *
         * @chainable
         * @method
         */
        release: function() {
            this._triggerEnd();
        },

        /**
         * Waits for a duration
         *
         * @chainable
         * @method
         * @param {Number} [duration] in milliseconds. Ex: 100
         */
        wait: function(duration, done) {
            duration = duration || this.getDefaultDuration();
            if (typeof(duration) !== 'number') {
                throw new TypeError('duration should be a number');
            }

            var start = Date.now();
            var end = start + duration;

            function checkDone() {
                var timeLeft = (end - Date.now());
                if (timeLeft <= 1) {
                    done();
                }
                else {
                    setTimeout(checkDone, timeLeft);
                }
            }
            setTimeout(checkDone, duration);
        },

        /**
         * Touch and release. If touch is not available on the device, it will use mouse events.
         *
         * @chainable
         * @method
         * @param {object|string} [where] Example: {x: 100, y: 100} or [{x: 100, y: 100},{x: 100, y: 100}]
         * where can also be a string DOM selector,
         * or a single DOM node or an array of DOM nodes
         * or relative 'top left', '10% 40%' style strings
         */
        tap: function(where) {
            where = where || this.getDefaultTouchLocation();
            if (this.isTouchSupported) {
                this.touch(where).release();
            }
            else {
                this.click(where);
            }
        },

        /**
         * Tap, wait for a duration, and then tap again
         *
         * @chainable
         * @method
         * @param {object} where Example: {x: 100, y: 100 } | '100 100' | 'center center'
         * @param {Number} [msBetweenTaps] the number of milliseconds to wait between taps
         */
        doubleTap: function(where, msBetweenTaps, done) {
            msBetweenTaps = Number(msBetweenTaps) || this.getDefaultDoubleTapDuration();
            this.tap(where).wait(msBetweenTaps).tap(where).then(done);
        },

        /**
         * Touch and hold for a duration, and then release
         *
         * @chainable
         * @method
         * @param {object|string} where  Example: {x: 100, y: 100} | 'top center' | '#selector'
         * @param {Number} [msToHold] How lond to hold the touch
         */
        hold: function(where, msToHold, done) {
            msToHold = Number(msToHold) || this.getDefaultDuration();
            this.touch(where).wait(msToHold).release().then(done);
        },

        /**
         * Click at a certain location(s)
         *
         * @chainable
         * @method
         * @param {object} [where] Either an object with an x and y property
         *   or an array of objects each with x and y properties
         *   The array indicates the number of fingers to touch with
         *   Ex: {x: 100, y: 100} or [{x: 100, y: 100}, {x: 400, y: 200}]
         */
        click: function(where) {
            this.setTouches(where || this.getDefaultTouchLocation());
            this._triggerClick();
        },

        /**
         * Performs any gesture by touching at the fromWhere location(s)
         * dragging to the toWhere locations, and releasing.
         * This is a shortcut for paw.touch(fromWhere).drag(toWhere, duration).release();
         *
         * @chainable
         * @method
         * @param {object|object[]|string} fromWhere
         * @param {object|object[]|string} toWhere
         * @param {number} duration
         **/
        gesture: function(fromWhere, toWhere, duration, done) {
            this.touch(fromWhere).drag(toWhere, duration).release().then(done);
        },

        /**
         * Perform a swipe up gesture by swiping from the default swipe
         * location in array position zero, to position one.
         *
         * @chainable
         * @method
         **/
        swipeUp: function(duration, done) {
            var def = this.getDefaultSwipeLocations();
            this.touch(def[1]).drag(def[0], duration).release().then(done);
        },

        /**
         * Perform a swipe down gesture by swiping from the default swipe
         * location in array position one, to position zero.
         *
         * @chainable
         * @method
         **/
        swipeDown: function(duration, done) {
            var def = this.getDefaultSwipeLocations();
            this.touch(def[0]).drag(def[1], duration).release().then(done);
        },

        /**
         * Perform a pinch out gesture. Usually results in a zoom in.
         *
         * @chainable
         * @method
         **/
        pinchOut: function(duration, done) {
            var def = this.getDefaultPinchLocations();
            this.touch(def[0]).drag(def[1], duration).release().then(done);
        },

        /**
         * Perform a pinch in gesture. Usually results in a zoom out.
         *
         * @chainable
         * @method
         **/
        pinchIn: function(duration, done) {
            var def = this.getDefaultPinchLocations();
            this.touch(def[1]).drag(def[0], duration).release().then(done);
        },

        /**
         * Run any function in the call chain. If you want
         * to do something asynchronous the function should take 1 param a done function
         *
         * @chainable
         * @method
         * @param {function} func - The function to call
         **/
        then: function(func, done) {
            if (func.length > 0) {
                func(done);
            }
            else {
                func();
                done();
            }
        },

        /**
         * Simulate a wheel event.
         * @param {(Object|String)} where an object with x and y, or a string "where" expression
         * @param {Object} [deltas]
         * @param {Number} [deltas.deltaX] The wheel delta along the x-axis.
         * @param {Number} [deltas.deltaY] The wheel delta along the y-axis.
         * @param {Function} [done] Callback invoked after the simulated events are dispatched.
         **/
        wheel: function(where, deltas, done) {
            where = this._buildTouches(where);
            var simulator = new WheelEventSimulator();
            simulator.dispatch(where[0], deltas);
            done();
        }
    };

    return Gestures;
}));

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

/* global module */
(function(root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory(require('Q'));
    }
    else if (typeof define === 'function' && define.amd) {
        define('paw/Train', ['Q'], factory);
    }
    else {
        root.Train = factory(root.Q);
    }
}(this, function(Q) {

    'use strict';
    var Train = {};


    // borrowed from angular injector that looks at parameter names
    var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
    var FN_ARG_SPLIT = /,/;
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

    // Extract param names from the function definition

    function getParamNames(fn) {
        var fnText,
            argDecl,
            paramNames;

        if (typeof fn === 'function') {
            if (!(paramNames = fn.$params)) {
                paramNames = [];
                fnText = fn.toString().replace(STRIP_COMMENTS, '');
                argDecl = fnText.match(FN_ARGS);
                var list = argDecl[1].split(FN_ARG_SPLIT);
                for (var i = 0; i < list.length; i++) {
                    paramNames.push(list[i].trim());
                }
            }
        }
        return paramNames;
    }

    function makeObjectChainable(target) {
        if (!target || target.__mix) {
            return;
        }
        target.__mix = {
            deferredStack: [],
            deferreds: [],

            /*
             * Cleans up the deferred chain
             */
            cleanQueue: function() {
                var self = target;
                while (self.__mix.deferreds.length > 0 && self.__mix.deferreds[0].promise.isFulfilled()) {
                    self.__mix.deferreds.shift();
                }
            },

            /*
             * Clear out the wait queue. Should not normally be needed unless a gesture never calls done
             */
            reset: function() {
                var self = target;
                var len = self.__mix.deferreds.length;
                for (var i = 0; i < len; ++i) {
                    self.__mix.deferreds[i].resolve(this);
                }
                self.__mix.deferreds.length = 0;
            },

            toString: function() {
                var self = target;
                var result = '',
                    s, d;
                var len = self.__mix.deferreds.length;
                for (var i = 0; i < len; ++i) {
                    d = self.__mix.deferreds[i];
                    s = d.promise.inspect();
                    result += ' ' + String(d.NAME) + ':' + String(s.state);
                }
                return result.trim();
            }

        };
    }

    /*
     * Add a function to target that is wrapped and chainable.
     * The function should take 2 arguments an options and a
     * done method to call when finished.
     * @param {object} target
     * @param {string} name
     * @param {function} func
     * @returns {boolean} If the function was mixed in, false if not
     */
    Train.mixFunctionInto = function(target, name, func) {
        if (!target || !name || !func) {
            return false;
        }

        if (target[name]) {
            return false; // should we overwrite or not. Right now we only mix once.
        }

        makeObjectChainable(target);
        var params = getParamNames(func);

        target[name] = function() {
            var self = this;
            var d = Q.defer();
            d.NAME = name;

            function done() {
                if (d.queue && d.queue.length) {
                    // wait for other things in this sub-queue to finish before resolving
                    Q.all(d.queue).then(function() {
                        d.resolve();
                        setTimeout(function() {
                            self.__mix.cleanQueue();
                        }, 0);
                    });
                }
                else {
                    d.resolve();
                    setTimeout(function() {
                        self.__mix.cleanQueue();
                    }, 0);
                }
            }

            // build up the arguments to call the wrapped function with
            var args = [];
            var matchedDone = false;

            for (var i = 0; i < func.length; i++) {
                // magic to automatically pass the done func to the param named done
                if (params[i] === 'done') {
                    matchedDone = true;
                    args[i] = done;
                }
                else {
                    args[i] = arguments[i];
                }
            }

            function task() {
                self.__mix.deferredStack.push(d);
                func.apply(self, args);
                // auto call done if the function doesn't take a done callback
                if (func.length < args.length || !matchedDone) {
                    done();
                }
                self.__mix.deferredStack.pop();
            }

            self.__mix.cleanQueue.call(self);

            var taskQueue = self.__mix.deferreds;
            if (self.__mix.deferredStack.length > 0) {
                var top = self.__mix.deferredStack[self.__mix.deferredStack.length - 1];
                top.queue = top.queue || [];
                taskQueue = top.queue;
            }

            // if there are existing pending promises, chain it on the end
            var lastDeferred = taskQueue[taskQueue.length - 1];
            taskQueue.push(d);

            if (lastDeferred && d !== lastDeferred) {
                lastDeferred.promise.then(task);
            }
            else {
                task();
            }

            return self;
        };
        target[name].$params = params;
        target[name].$orig = func;
        return true;
    };

    /*
     * Adds all of the functions from source onto target as wrapped chainable functions
     * @param {object} source
     */
    Train.mixObjectInto = function(target, source) {
        if (!source || typeof source !== 'object') {
            return false;
        }
        var keys = Object.keys(source);
        var len = keys.length;
        var i = 0;
        var key = '';
        for (; i < len; ++i) {
            key = keys[i];
            if (typeof source[key] === 'function') {
                Train.mixFunctionInto(target, key, source[key]);
            }
        }
        return true;
    };

    /*
     * Create a new object by mixing together all of the passed in objects
     * @param object[] arguments
     */
    Train.create = function() {
        var result = function() {};
        var len = arguments.length;
        var i = 0;
        var arg;
        for (; i < len; ++i) {
            arg = arguments[i];
            if (typeof arg === 'object') {
                Train.mixObjectInto(result, arg);
            }
        }
        return result;
    };

    return Train;
}));

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

/* global module, DocumentTouch, NodeList */
(function(root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory(require('paw/Train'), require('paw/Gestures'), require('paw/ViewportRelative'));
    }
    else if (typeof define === 'function' && define.amd) {
        define('paw/Paw', ['paw/Train', 'paw/Gestures', 'paw/ViewportRelative'], factory);
    }
    else {
        root.Paw = factory(root.Train, root.Gestures, root.ViewportRelative);
    }
}(this, function(Train, Gestures, ViewportRelative) {

    'use strict';

    var POINT_REGEX = /^\s*(top|left|right|center|bottom|\d+\.?\d*(px|%))\s+(top|left|right|center|bottom|\d+\.?\d*(px|%))\s*$/i;

    /*
     * Polyfill Array.isArray is if isn't there
     * From: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray
     */
    if (!Array.isArray) {
        Array.isArray = function(vArg) {
            var isArray;
            isArray = vArg instanceof Array;
            return isArray;
        };
    }

    /*
     * A config of the differet types of mouse events
     */
    var MOUSE_EVENTS = {
        start: 'mousedown',
        move: 'mousemove',
        end: 'mouseup',
        click: 'click'
    };

    /**
     * Create a Paw instance
     *
     * @class
     * @mixes Gestures
     * @constructor
     * @param {(object|object[])} mixins Objects whose functions will be mixed in to this Paw instance
     */

    function Paw(mixins) {
        this.showTouches = true;
        this.clearTouchIndicatorsAfter = 0; // > 0 will clear touch indicators that haven't been cleared after this much time
        this.touches = [];
        this.touchIndicators = [];
        this.isTouchSupported = (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) ? true : false;
        this.hasMultiTouch = true;
        Train.mixObjectInto(this, Gestures);
        if (mixins) {
            if (!Array.isArray(mixins)) {
                mixins = [mixins];
            }
            for (var i = 0; i < mixins.length; i++) {
                if (typeof(mixins[i]) === 'object') {
                    Train.mixObjectInto(this, mixins[i]);
                }
            }
        }
        this.relativePositions = {};

        // Defaults for single finger gestures
        this.DEFAULT_TOUCH_LOCATION = '70% center';

        // Defaults for swipes
        this.DEFAULT_SWIPE_LOCATIONS = [
            ['70% 45%'],
            ['70% 95%']
        ];

        // Defaults for pinches
        this.DEFAULT_PINCH_LOCATIONS = [
            ['70% 45%', '70% 55%'],
            ['70% 40%', '70% 60%']
        ];

        // Default duration
        this.DEFAULT_DURATION = 300;

        // Default double tap duration
        this.DEFAULT_DOUBLE_TAP_DURATION = 120;
    }

    Paw.prototype.getDefaultTouchLocation = function() {
        return this.DEFAULT_TOUCH_LOCATION;
    };

    Paw.prototype.getDefaultSwipeLocations = function() {
        return this.DEFAULT_SWIPE_LOCATIONS;
    };

    Paw.prototype.getDefaultPinchLocations = function() {
        return this.DEFAULT_PINCH_LOCATIONS;
    };

    Paw.prototype.getDefaultDuration = function() {
        return this.DEFAULT_DURATION;
    };

    Paw.prototype.getDefaultDoubleTapDuration = function() {
        return this.DEFAULT_DOUBLE_TAP_DURATION;
    };

    /*
     * @param {(string|object)} where The default touch location. Used for tap, doubleTap, touch
     */
    Paw.prototype.setDefaultTouchLocation = function(where) {
        if (this.isPoint(where) || POINT_REGEX.test(where)) {
            this.DEFAULT_TOUCH_LOCATION = where;
        }
    };

    /*
     * @param {(string[]|object[])} arrayOfArrayOfPoints The default swipe locations. Used for swipe swipeUp swipeDown
     */
    Paw.prototype.setDefaultSwipeLocations = function(arrayOfArrayOfPoints) {
        this.DEFAULT_SWIPE_LOCATIONS = arrayOfArrayOfPoints;
    };

    /*
     * @param {(string[]|object[])} arrayOfArrayOfPoints The default pinch locations. Used for pinchIn pinchOut
     */
    Paw.prototype.setDefaultPinchLocations = function(arrayOfArrayOfPoints) {
        this.DEFAULT_PINCH_LOCATIONS = arrayOfArrayOfPoints;
    };

    /*
     * @param {Number} duration The default duration Used for swipe pinch wait
     */
    Paw.prototype.setDefaultDuration = function(duration) {
        if (duration >= 0) {
            this.DEFAULT_DURATION = duration;
        }
    };

    /*
     * @param {Number} duration The default duration Used for doubleTap
     */
    Paw.prototype.setDefaultDoubleTapDuration = function(duration) {
        if (duration >= 0) {
            this.DEFAULT_DOUBLE_TAP_DURATION = duration;
        }
    };

    /*
     * Make a copy of an object by serializing and deserializing it
     * @param {object} obj - The object to copy
     */
    Paw.prototype._copy = function(obj) {
        return JSON.parse(JSON.stringify(obj));
    };

    Paw.prototype.clearTouchIndicators = function() {
        for (var i = this.touchIndicators.length - 1; i >= 0; i--) {
            if (this.touchIndicators[i]) {
                this.touchIndicators[i].style.opacity = 0;
            }
        }
    };

    /*
     * Show the touches on screen.
     * @param object[] touches - Array of points
     * If touches is falsy or an empty array, it will remove the touch indicators from view
     */
    Paw.prototype.indicateTouches = function(touches) {
        var self = this,
            touch, i, id, ti, len;
        var cti = function() {
            self.clearTouchIndicators();
        };
        if (!this.showTouches) {
            return;
        }
        if (!touches || touches.length === 0) {
            setTimeout(cti, 60);
            return;
        }
        len = touches.length;

        for (i = 0; i < len; i++) {
            touch = touches[i];
            id = 'paw_touch_' + i;
            ti = this.touchIndicators[i];
            if (!ti) {
                ti = document.createElement('div');
                document.body.appendChild(ti);
                this.touchIndicators[i] = ti;
                ti.id = id;
                ti.className = 'finger';
                ti.style.position = 'absolute';
                ti.style.top = '0px';
                ti.style.left = '0px';
                ti.style.zIndex = '9999';
                ti.style.height = '30px';
                ti.style.width = '30px';
                ti.style.backgroundColor = 'red';
                ti.style.border = 'solid 2px #FFAAAA';
                ti.style.borderRadius = '20px';
                ti.style.pointerEvents = 'none';
            }
            if (ti.style.opacity !== '0.6') {
                ti.style.opacity = '0.6';
            }
            ti.style.transform = 'translate(' + (touch.x - 15) + 'px, ' + (touch.y - 15) + 'px)';

            if (self.clearTouchIndicatorsAfter > 0) {
                clearTimeout(ti.timeout);
                ti.timeout = setTimeout(cti, self.clearTouchIndicatorsAfter);
            }
        } // end loop
    };

    Paw.prototype._triggerClick = function() {
        this.indicateTouches(this.touches);
        this._triggerMouse('start');
        this._triggerMouse('end');
        this._triggerMouse('click');
        this.indicateTouches(); // clears touch indicators
    };

    Paw.prototype._triggerStart = function() {
        this.indicateTouches(this.touches);
        this._triggerTouch('start');
    };

    Paw.prototype._triggerEnd = function() {
        this._triggerTouch('end');
        if (this.touches.length > 0) {
            var point = this.touches[0];
            var el = document.elementFromPoint(point.x, point.y);
            this.element = el;
        }
        this.setTouches(); // removes touches
        this.indicateTouches(); // clears touch indicators
    };

    Paw.prototype._triggerMove = function() {
        this._triggerTouch('move');
        this.indicateTouches(this.touches);
    };

    /**
     * Creates a list of touches that is compatible with the browser.
     * It will use the built in document.createTouchList if available.
     *
     * @private
     * @method
     * @param {object[]} points An array of points
     * @returns {object[]}
     */
    Paw.prototype._createTouchList = function(points) {
        var len = points.length;
        var i = 0;
        var point;

        // Get the element to dispatch touches based on the location of the first touch
        if (len > 0) {
            point = points[0];
            var el = document.elementFromPoint(point.x, point.y);
            this.element = el;
        }

        if (document.createTouchList) {
            var _touches = [];
            for (; i < len; ++i) {
                point = points[i];
                var touch = document.createTouch(window,
                    this.element,
                    i,
                    point.x, point.y,
                    point.x, point.y
                );

                _touches.push(touch);
            }
            var result = document.createTouchList.apply(document, _touches);
            return result;
        }
        else {
            var touchlist = [];
            for (; i < len; ++i) {
                point = points[i];
                touchlist.push({
                    target: this.element,
                    identifier: Date.now() + i,
                    pageX: point.x,
                    pageY: point.y,
                    screenX: point.x,
                    screenY: point.y,
                    clientX: point.x,
                    clientY: point.y
                });
            }
            return touchlist;
        }
    };

    /*
     * trigger touch event
     * @param {string} type
     * @returns {Boolean}
     */
    Paw.prototype._triggerTouch = function(type) {
        var event = document.createEvent('Event');
        var touchlist = this._createTouchList((type === 'end' || type === 'cancel') ? [] : this.touches);

        event.initEvent('touch' + type, true, true);
        event.touches = touchlist;
        event.targetTouches = touchlist;
        event.changedTouches = touchlist;
        this.element = this.element || document.body;
        return this.element.dispatchEvent(event);
    };

    /*
     * trigger mouse event
     * @param {string} type
     * @returns {Boolean}
     */
    Paw.prototype._triggerMouse = function(type) {
        var touchList = this._createTouchList(this.touches);
        for (var i = 0; i < touchList.length; i++) {
            var ev = document.createEvent('MouseEvent');
            ev.initMouseEvent(MOUSE_EVENTS[type], true, true, window, 0,
                touchList[i].pageX, touchList[i].pageY, touchList[i].clientX, touchList[i].clientY,
                false, false, false, false,
                0, null);

            this.element = document.elementFromPoint(touchList[i].pageX, touchList[i].pageY) || document.body;
            this.element.dispatchEvent(ev);
        }
    };

    Paw.prototype.isDOMNode = function(obj) {
        return obj &&
            typeof obj === 'object' &&
            obj.nodeType &&
            obj.nodeType === 1;
    };

    Paw.prototype.isDOMNodeArray = function(obj) {
        return obj instanceof NodeList ||
            (Array.isArray(obj) &&
            obj.length > 0 &&
            this.isDOMNode(obj[0]));
    };

    Paw.prototype.isPoint = function(obj) {
        return typeof obj === 'object' &&
            obj.x !== null &&
            obj.x !== undefined &&
            obj.y !== null &&
            obj.y !== undefined;
    };

    // obj can be a string DOM selector, a DOM node, and array of DOM nodes, or a jQuery object

    Paw.prototype._getElements = function(obj) {
        var selection;
        var selector;
        if (typeof obj === 'string') {
            selection = document.querySelectorAll(obj);
            selector = obj;
        }
        // Allow obj to be a DOM node
        else if (this.isDOMNode(obj)) {
            selection = [obj];
            selector = obj;
        }
        // or a jQuery selector
        else if (obj.selector && obj.each) {
            selector = obj.selector;
            selection = [];
            obj.each(function(i, el) {
                selection.push(el);
            });
        }
        // or an array of DOM nodes
        else if (this.isDOMNodeArray(obj)) {
            selection = obj;
            selector = obj;
        }

        if (!selector || selection.length === 0) {
            throw new Error('Selector did not match anything:', selector);
        }
        return selection;
    };

    /*
     * Convert a string or jquery selector into touches
     */
    Paw.prototype._buildTouches = function(where) {
        var selection, i, k, wherek, vd;
        if (!where) {
            throw new Error('Parameter "where" is empty when building touches');
        }

        // make it an array if it is not
        if (!Array.isArray(where)) {
            where = [where];
        }

        // get the viewport dimensions once upfront
        vd = this.getViewportDimensions();

        for (k = 0; k < where.length; k++) {
            wherek = where[k];

            // if it looks like a point-string, convert relative values to pixels
            if (this.isPoint(wherek) || POINT_REGEX.test(wherek)) {
                where[k] = ViewportRelative.pointToPixels(wherek, vd);

                // assume it is a selector, or DOM node
            }
            else {
                selection = this._getElements(wherek);
                where.splice(k, 1); // remove the selector from the list

                // insert matched elements in the right spot
                for (i = 0; i < selection.length; i++) {
                    var bounds = selection[i].getBoundingClientRect();
                    where.splice(k, 0, {
                        x: bounds.left + (bounds.width / 2),
                        y: bounds.top + (bounds.height / 2)
                    });
                }
                k = k + (selection.length - 1);

            }
        }
        return where;
    };

    /*
     * Set touches
     * @param {object} touches Ex: {x: 1, y: 2} or [{x: 1, y: 2}, {x: 1, y: 2}]
     */
    Paw.prototype.setTouches = function(touches) {
        if (!touches) {
            this.touches.length = 0;
            return;
        }
        this.touches = this._copy(this._buildTouches(touches)); // copy
        return this.touches;
    };

    Paw.prototype.getViewportWidth = function() {
        if (window && window.innerWidth) {
            return window.innerWidth;
        }
        else if (window && window.document && window.document.body && window.document.body.offsetWidth) {
            return window.document.body.offsetWidth;
        }
        else {
            return 0;
        }
    };

    Paw.prototype.getViewportHeight = function() {
        if (window && window.innerHeight) {
            return window.innerHeight;
        }
        else if (window && window.document && window.document.body && window.document.body.offsetHeight) {
            return window.document.body.offsetHeight;
        }
        else {
            return 0;
        }
    };

    Paw.prototype.getViewportDimensions = function() {
        return {
            width: this.getViewportWidth(),
            height: this.getViewportHeight()
        };
    };

    return Paw;
}));

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
