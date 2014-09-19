var Paw = require('paw/Paw');
var Train = require('paw/Train');

describe("pawSpec", function() {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

    var paw;
    var rect;
    var start;
    var end;
    var duration = 1500;

    // handy function
    function pixelColorAt(ctx, x, y) {
        return ctx.getImageData(x, y, 1, 1).data;
    }

    beforeEach(function() {
        paw = new Paw();
        rect = canvas.getBoundingClientRect();
        var y = rect.top + (rect.height / 4);
        start = {
            x: rect.left,
            y: y
        };
        end = {
            x: rect.right - (rect.width / 2),
            y: y
        };
        // you could mix in some app specific things into this paw instance
        var extraStuff = {
            extra: function(done) {
                this.tap('#theButton2');
                done();
            }
        };
        Train.mixObjectInto(paw, extraStuff);
    });

    it("should use have extra stuff", function() {
        expect(paw.extra).toBeDefined();
    });

    it("should click theButton2", function() {
        paw.extra();
        expect(window._clicked).toBe('theButton2');
    });

    it("should cut the cloth", function(done) {
        var context = canvas.getContext('2d');
        var startY = start.y + 30;
        var endY = startY + 20;
        var color;
        var x = end.x - 20;

        paw.gesture(start, end, duration)
            .wait(100)
            .gesture(end, start, duration)
            .wait(600)
            .then(function() {
                x = x - 60;

                for (var y = startY; y <= endY; y++) {
                    color = pixelColorAt(context, x, y);
                    //console.log(color);
                    if (color[0] != 0) {
                        //expect(129 <= color[0] && color[0] <= 150).toBe(true);
                    // expect(color[1]).toBeCloseTo(137, 2);
                    // expect(color[2]).toBeCloseTo(137, 2);
                    }
                };
        }).then(done);
    });
});