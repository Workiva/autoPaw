System.config({
  "paths": {
    "paw/*":"node_modules/paw/src/*.js",
    "*": "*.js",
    "github:*": "jspm_packages/github/*.js",
    "npm:*": "jspm_packages/npm/*.js"
  }
});

System.config({
  "map": {
    "Q": "node_modules/paw/bower_components/q/q"
  }
});