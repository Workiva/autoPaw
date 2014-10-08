module.exports = function(grunt) {
    require('wf-grunt').init(grunt, {
        options: {
            wwwPort: 9100,
            coverageThresholds: {
                statements: 0,
                branches: 0,
                functions: 0,
                lines: 0
            },
        },
    });
};
