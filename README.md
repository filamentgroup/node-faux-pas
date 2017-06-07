# node-faux-pas

A command line utility to test a URL for faux web font rendering and mismatched web font code. It waits until the `document.fonts.ready` promise resolves before it runs, to make sure all the web fonts have loaded.

## Installation

```
npm install -g node-faux-pas
```

## Usage

```
$> fauxpas MY_URL_HERE
```

## Options

```
  -u, --url url   The url to test.
  -h, --help      Display this help documentation.
```