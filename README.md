autoPaw
================================================================================

> Injectable functional test runner using Jasmine and the [Paw](https://github.com/Workiva/paw) library.

![autoPaw](http://33.media.tumblr.com/tumblr_m8sk90pwcJ1qdlh1io1_400.gif)

Consuming This Library
--------------------------------------------------------------------------------

- Distribution is through jspm. _Don't forget to add the version to the end of the URL!_

```bash
# install jspm if you haven't already
$ npm install -g jspm

# install this package
$ jspm install autoPaw=github:Workiva/autoPaw@{version}
```


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
$ grunt watch:test
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
