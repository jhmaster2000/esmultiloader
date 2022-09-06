# ESMultiloader
> Node.js ESM loader for chaining multiple custom loaders.

> **Warning**
> **This package has been deprecated**
>
> Multiple loaders are [natively supported by Node.js v18.6+](https://nodejs.org/api/esm.html#loaders), you may still use this package for Node.js v16.12 to v18.5, but it will not be being maintained.

[![license][license-image]][license-url]
[![GitHub version][github-image]][github-url]
[![npm release][npm-image]][npm-url]
[![node-current][node-image]][node-url]

- Fast and lightweight
- No configuration required, but configurable if needed
- Usage compliant with Node's own [loader middleware chaining proposal](https://github.com/nodejs/loaders/blob/main/doc/design/proposal-chaining-middleware.md)
- Supports all three `resolve`, `load` and `globalPreload` loader hooks

## Install
```sh
npm i esmultiloader
```

## Usage
```sh
node --loader loader2 --loader ./loader1.js --loader esmultiloader file.js
```

### Optional Configuration
Options can be passed to `esmultiloader` to configure it's behavior using the following `/` separated list syntax:
```sh
node --loader esmultiloader/booleanoption/option=123/...
```
Where:
- `booleanoption` is a `true`/`false` option which is implicitly `true` when passed as an option.
- `option` is an option with a required value to be passed after the `=`, default values for these options vary per option.
- The first instance of a duplicated option takes precedence.
- A trailing slash does not matter.

Option | Type | Default | Description
-|-|-|-
`iterative` or `ltr` | Boolean | `false` | Chain loaders from left-to-right as described by the [iterative chaining proposal](https://github.com/nodejs/loaders/blob/main/doc/design/proposal-chaining-iterative.md) instead of right-to-left. (Mutually exclusive with the option below)
`middleware` or `rtl` | Boolean | `true` | Chain loaders from right-to-left as described by the [middleware chaining proposal](https://github.com/nodejs/loaders/blob/main/doc/design/proposal-chaining-middleware.md) instead of left-to-right. (Mutually exclusive with the option above)
`debug` | Boolean | `false` | Enable printing of `esmultiloader` debug logs.

[github-url]:https://github.com/jhmaster2000/esmultiloader
[github-image]:https://img.shields.io/github/package-json/v/jhmaster2000/esmultiloader.svg
[license-url]:https://github.com/jhmaster2000/esmultiloader/blob/master/LICENSE
[license-image]:https://img.shields.io/npm/l/esmultiloader.svg
[npm-url]:http://npmjs.org/package/esmultiloader
[npm-image]:https://img.shields.io/npm/v/esmultiloader.svg?color=darkred&label=npm%20release
[node-url]:https://nodejs.org/en/download
[node-image]:https://img.shields.io/node/v/esmultiloader.svg
