describe("pawSpec", function() {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

    var paw;
    var rect;
    var start;
    var end;
    var duration = 1500;

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
        var imgd, color, idx;
        var x = end.x - 20;

        paw.gesture(start, end, duration)
            .wait(100)
            .gesture(end, start, duration)
            .wait(600)
            .then(function() {
                // verify that canvas area beneath the cut is uniformly empty
                x = x - 60;
                imgd = context.getImageData(0, 0, rect.width, rect.height).data;
                for (var y = startY; y <= endY; y++) {
                    idx = (y * rect.width + x) * 4;
                    color = [imgd[idx], imgd[idx+1], imgd[idx+2], imgd[idx+3]];
                    expect(color).toEqual([0,0,0,0]);
                }
        }).then(done);
    });
});