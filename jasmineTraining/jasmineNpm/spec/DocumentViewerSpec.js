'use strict';
function DocumentViewer() {
    this.onPageReceived = function(callback) {
        if (callback) {
            this.callback = callback;
        }
        return this.callback;
    };
}
DocumentViewer.prototype = {
    getPageAsync: function(doneCallback) {
        // Fake a long-running request
        setTimeout(doneCallback, 1000);
    },
    load: function() {
        var self = this;
        this.getPageAsync(function getPageDone() {
            self.callback('page received');
        });
    },
};

describe('DocumentViewer', function() {
    describe('#load', function() {
        it('should call getPageAsync', function () {
            var viewer = new DocumentViewer();
            spyOn(viewer, 'getPageAsync');
            viewer.load();
            expect(viewer.getPageAsync).toHaveBeenCalled();
            expect(viewer.getPageAsync).toHaveBeenCalledWith(jasmine.any(Function));
            var firstCall = viewer.getPageAsync.calls.first(); // SYNTAX CHANGE
            expect(firstCall.args[0]).toEqual(jasmine.any(Function)); // NOTE: not toBe
            expect(viewer.getPageAsync.calls.argsFor(0)[0]).toEqual(jasmine.any(Function));
            expect(typeof firstCall.args[0]).toEqual('function');
        });

        it('should call the onPageReceived callback when done', function () {
            var viewer = new DocumentViewer();
            var pageReceivedCallback = jasmine.createSpy();
            viewer.onPageReceived(pageReceivedCallback)
            spyOn(viewer, 'getPageAsync').and.callFake(function(callback) {
                // Instead of making a slow request, finish immediately
                callback();
            })
            viewer.load();
            expect(pageReceivedCallback).toHaveBeenCalled();
        });

        // Jasmine 2 with 'done' callback
        it('should get the page asynchronously', function (done) {
            var viewer = new DocumentViewer();
            viewer.onPageReceived(function() {
                // Implicitly expecting the test to fail if this callback
                // isn't called
                expect('got here').toBeTruthy();
                done();
            });
            viewer.load();
        });

        describe('clock manipulation in 2: http://jasmine.github.io/2.0/introduction.html#section-Mocking_the_JavaScript_Timeout_Functions', function() {
            beforeEach(function () {
                jasmine.clock().install();
            });
            afterEach(function() {
                jasmine.clock().uninstall();
            });
            it('should get the page asynchronously by clock manipulation', function () {
                jasmine.defaultTimeoutInterval = 10100; // up the timeout
                var viewer = new DocumentViewer();
                var called = false;
                viewer.onPageReceived(function() {
                    called = true;
                });
                viewer.load();

                jasmine.clock().tick(1001);

                expect(called).toBeTruthy();
            });
        });
    });
});

