define(function(require) {
    'use strict';
    var AsyncSpec = require('../src/AsyncSpec')
    var DocumentViewer = require('../src/DocumentViewer');
    jasmine.clock = function() {
        return {
            install: jasmine.Clock.useMock,
            tick: jasmine.Clock.tick,
            uninstall: function() {},
        };
    };

    describe('DocumentViewer', function() {
        var async = new AsyncSpec(this);

        describe('#load', function() {
            it('should call getPageAsync', function () {
                // ARRANGE
                var viewer = new DocumentViewer();
                // var viewer = Object.create(DocumentViewer.prototype);
                // var viewer = jasmine.createSpyObj('DocumentViewer', ['getPageAsync']);
                spyOn(viewer, 'getPageAsync');

                // ACT
                viewer.load();

                // ASSERT
                expect(viewer.getPageAsync).toHaveBeenCalled();
                expect(viewer.getPageAsync).toHaveBeenCalledWith(jasmine.any(Function));

                var firstCall = viewer.getPageAsync.calls[0];
                expect(firstCall.args[0]).toEqual(jasmine.any(Function)); // NOTE: not toBe
                expect(firstCall.args.length).toEqual(1);
                expect(typeof firstCall.args[0]).toEqual('function');
            });

            it('should call the onPageReceived callback when done', function () {
                var viewer = new DocumentViewer();
                var pageReceivedCallback = jasmine.createSpy('pageReceivedCallback');
                viewer.onPageReceived(pageReceivedCallback)
                spyOn(viewer, 'getPageAsync').andCallFake(function(callback) {
                    // Instead of making a slow request, finish immediately
                    callback();
                })

                viewer.load();

                expect(pageReceivedCallback).toHaveBeenCalled();
                expect(pageReceivedCallback).toHaveBeenCalledWith('page received');
            });

            // Jasmine 1.3 with jasmine.async lib to use 'done' callback
            async.it('should get the page asynchronously', function (done) {
                var viewer = new DocumentViewer();
                viewer.onPageReceived(function() {
                    // Implicitly expecting the test to fail if this callback
                    // isn't called
                    expect('got here').toBeTruthy();
                    done();
                });

                viewer.load();
            });

            // Jasmine 1.3 with runs/waits[For] async syntax
            it('should get the page asynchronously the old way', function () {
                jasmine.defaultTimeoutInterval = 10100; // up the timeout
                var viewer = new DocumentViewer();
                var called = false;
                viewer.onPageReceived(function() {
                    called = true;
                });

                viewer.load();

                waitsFor(function() {
                    return called;
                }, 6000, 'Waited 6s for callback to be called but it was not');
                runs(function() {
                    expect(called).toBeTruthy();
                });
            });

            describe('clock manipulation in 1.3: http://jasmine.github.io/1.3/introduction.html#section-Mocking_the_JavaScript_Clock', function() {
                beforeEach(function () {
                    jasmine.Clock.useMock();
                });
                it('should get the page asynchronously by clock manipulation', function () {
                    jasmine.defaultTimeoutInterval = 10100; // up the timeout
                    var viewer = new DocumentViewer();
                    var called = false;
                    viewer.onPageReceived(function() {
                        called = true;
                    });

                    viewer.load();
                    jasmine.Clock.tick(1001);

                    expect(called).toBeTruthy('callback to be called');
                });
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
});