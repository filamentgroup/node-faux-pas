:warning: This project is archived and the repository is no longer maintained.

# node-faux-pas

A command line utility to test a URL for faux web font rendering and mismatched web font code.

* Uses the [`faux-pas`](https://github.com/filamentgroup/faux-pas) package, which requires the environment to have the CSS Font Loading API. In other words, this will not work in PhantomJS.
* Instead, uses [headless Chrome](https://developers.google.com/web/updates/2017/04/headless-chrome), and therefore requires Chrome 59+ (or Chrome Canary) to be installed for use.
* Waits until the `document.fonts.ready` promise resolves before it runs, to make sure all the web fonts have finished loading.

## Installation

```
npm install -g node-faux-pas
```

## Usage

```
$ fauxpas MY_URL_HERE
```

## Options

```
  -u, --url url   The url to test.
  -h, --help      Display this help documentation.
```
