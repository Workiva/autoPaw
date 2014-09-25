var autoPawRunner = require('../src/autoPawRunner').autoPawRunner;

describe('autoPawRunner', function() {

    var envMock = {
        execute: function() {}
    };
    var jasmineMock = {
        getJSReport: function() { return 'JSON Report'; },
        getJSReportAsString: function() { return 'JSON Report String'; },
        junitReport: 'JUnit Report',
        getEnv: function() {
            return envMock;
        }
    };

    it('should exist', function() {
        expect(autoPawRunner).toBeDefined();
    });

    it('should save and return the spec list provided', function() {
        var specList = [
            'spec1',
            'spec2',
            'spec3'
        ];
        var runner = new autoPawRunner(jasmineMock, specList);
        expect(runner.getSpecList()).toEqual(specList);
    });

    it('should import all specs and trigger jasmine execution', function(done) {
        var specList = [
            'spec1',
            'spec2',
            'spec3'
        ];
        var runner = new autoPawRunner(jasmineMock, specList);

        spyOn(System, 'import');
        spyOn(envMock, 'execute').and.callFake(function() {
            for (var i = 0; i < specList.length; i++) {
                expect(System.import).toHaveBeenCalledWith(specList[i]);
            }

            // test is not complete until async 'execute' is triggered
            done();
        });

        runner.startTests();
    });

    describe('test results', function() {

        it('should return JSON test report', function() {
            var runner = new autoPawRunner(jasmineMock);
            var results = runner.getTestResults();
            expect(results).toEqual('JSON Report');
        });

        it('should return JSON test report string', function() {
            var runner = new autoPawRunner(jasmineMock);
            var results = runner.getTestResultsAsString();
            expect(results).toEqual('JSON Report String');
        });

        it('should return JUnit test report', function() {
            var runner = new autoPawRunner(jasmineMock);
            var results = runner.getJUnitTestResults();
            expect(results).toEqual('JUnit Report');
        });

    });

});
