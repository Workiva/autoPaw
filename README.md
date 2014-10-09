autoPaw
================================================================================

> Injectable functional test runner using:
> - [Jasmine](http://jasmine.github.io/) - JavaScript testing framework
> - [Paw](https://github.com/Workiva/paw) - simulation of user interaction/touch events
> - [SystemJS](https://github.com/systemjs/systemjs) - dynamic JavaScript module loader

![autoPaw](http://33.media.tumblr.com/tumblr_m8sk90pwcJ1qdlh1io1_400.gif)

Using autoPaw
--------------------------------------------------------------------------------

To use autoPaw, simply append `autoPaw.js` to your existing HTML page/app via script tag.  autoPaw relies on SystemJS for dynamic JavaScript module loading, so a script tag is required for that as well.

```
<script src="../jspm_packages/system@0.8.js"></script>
<script async="true" defer="true" src="../dist/autoPaw.js"></script>
```

`autoPaw` does nothing unless triggered by query string parameter.  Once triggered by the appropriate query string parameters, autoPaw dynamically loads the jasmine testing framework and the specified functional test spec files, and executes the tests. Test results are output to the screen and can optionally be POSTed to a URL.

### Query String Parameters

autoPaw execution is controlled by the following query string parameters:

- `runTests` - Triggers the test run
  - If test execution needs to be delayed (e.g. html needs longer load time before tests run), an integer value can be specified to delay test execution (expressed in milliseconds - `runTests=500`).
- `testIndexFile` - [optional] Specify the JavaScript index file to use when loading test specs
  - This file contains only `require` statements for each test spec [see example](https://github.com/Workiva/autoPaw/blob/master/example/functionalTest/index.js). If not specified, autoPaw will use `./functionalTest/index`.
- `reportURL` - [optional] Specify URL to POST xml test results to
  - Since the web browser is unable to write test results to the local file system, an external server is needed to receive the XML output. [catcher](https://github.com/Workiva/catcher) is a simple server that serves this purpose.
- `runnerPath` - [optional] Specify explicit path to `autoPaw.js` location
  - By default, autoPaw infers its dynamic dependency file locations [autoPawRunner.js, etc.] based on the src path specified in the `autoPaw.js` script tag. If `autoPaw.js` is injected into the page via some other means (perhaps via some external test automation framework like [NightWatch](http://nightwatchjs.org/)), this inference will fail and the path must be explicitly supplied.


Development: Getting Started
--------------------------------------------------------------------------------

```bash
# clone the repo
$ git clone git@github.com:Workiva/autoPaw.git
$ cd autoPaw

# install global tools if you haven't already
$ npm install -g gulp
$ npm install -g jspm

# run init script
$ ./init.sh
```

The init script will initialize your local environment
and ensure that you have all global and local dependencies installed.

#### Quality Assurance

##### For Developers

To get started developing:

```bash
# ensure everything is working when checking out a new branch:
$ gulp

# setup lint and test watches and serve as you develop:
$ gulp watch:test
```

#### Project Structure

- `./src` - TypeScript or JavaScript source code
- `./test` - TypeScript or JavaScript test specs, written with Jasmine 2
- `./build` - Assets generated via build
    - `./build/src` - Destination for transpiled/copied source code (from `./src`)
    - `./build/test` - Destination for transpiled/copied test spec code (from `./test`)
- `./dist` - Destination for generated distribution assets
- `./docs` - Destination for generated documentation
- `./report` - Destination for generated reports (coverage, complexity, test)
- `node_modules` libraries distributed by [NPM][NPM]
- `jspm_packages` libraries distributed by [JSPM][JSPM]


#### Managing Dependencies

Familiarize yourself with the package managers we use:

- [NPM][NPM] manages [Node][Node] dependencies.
- [JSPM][JSPM] manages web dependencies (like jquery, lodash, etc.).


Development: Process
--------------------------------------------------------------------------------

This project uses [wGulp](https://github.com/Workiva/wGulp).
Please see that repo for more information.

[Node]: http://nodejs.org/api/
[NPM]: https://npmjs.org/
[JSPM]: http://jspm.io/
