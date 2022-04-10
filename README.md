# ESMultiloader
> Node.js ESM loader for chaining multiple custom loaders.

- Zero dependencies
- No configuration required, but configurable if needed
- Usage compliant with Node's own [loader middleware chaining proposal](https://github.com/nodejs/loaders/blob/main/doc/design/proposal-chaining-middleware.md)

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
