define(function() {
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

    // Example usage
    var viewer = new DocumentViewer();
    viewer.onPageReceived(function(data) {
        window.console.log(data);
    });
    viewer.load();

    return DocumentViewer;
});