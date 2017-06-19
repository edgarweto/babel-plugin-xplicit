
Javascript Assertions with xplicit
====

## Assert javascript code

```js
class Sphere {

  constructor (r) {
    assert: r > 0;

    this._radius = r;
  }

  setRadius (r) {
    assert: this._radius > 0, {filter: 'jrambo'};
    assert: r > 0;

    this._radius = r;
  }
}
```


## This repository
Xplicit is a babel plugin that enables a simple assertion aproach for javascript. It was inspired by Charles Pick's use of javascript labeled statement in his [babel-plugin-contracts](https://github.com/codemix/babel-plugin-contracts).

[Babel](https://babeljs.io/) enables us to transform our assertion expressions, add some log information and probably the most important point, to strip code.


[![Build Status](https://travis-ci.org/edgarweto/babel-plugin-xplicit.svg)](https://travis-ci.org/edgarweto/babel-plugin-xplicit)


## Asserting javascript code
 Asserting is a simplified aproach to [design by contract](https://en.wikipedia.org/wiki/Design_by_contract), but strong enough to enable programmers to write consistent code. With this plugin, it is possible to write pre and post conditions and invariants, but the responsibility of writing them at the right place is left to the programmer.

 You may be interested in some tips for [javascript assertion](http://privaliait.blogspot.com.es/2017/04/javascript-assert-best-practices.html).


### Installation
Just like other babel plugins:

```sh
npm install --save-dev babel-plugin-xplicit
```

### Asserting your code

```js
class Sphere {

  constructor (r) {
    assert: r > 0;

    this._radius = r;
  }

  setRadius (r) {
    assert: this._radius > 0, {filter: 'jrambo'};
    assert: r > 0, {filter: 'jfive'};

    this._radius = r;
  }
}
```

This can be transpiled, depending on the options, to:

```js
class Sphere {

  constructor (r) {
    console.assert(r > 0);

    this._radius = r;
  }

  setRadius (r) {
    console.assert(r > 0);

    this._radius = r;
  }
}
```


#### Option: strip assertions
Probably one of the most important options is simply to strip all assertions in production environments.

```json
{
  "strip": true
}
```

#### Option: verbs
This is the way you can customize the actual assertion function. It also allows you to specify the labels that you are going to use to assert. So you could use something like this:

```json
{
  "verbs": {
    "assert": "console.assert",
    "assert_log": "myAssertFunction"
  }
}
```

Then you can use these labels to assert:

```js
setRadius (r) {
  assert: r > 0;
  
  this._radius = r;

  assert_log: this._radius > 0;
}
```

This would transpile to this:


```js
setRadius (r) {
  console.assert(r > 0);
  
  this._radius = r;

  myAssertFunction(this._radius > 0);
}
```


#### Option: filters
When assertions of one programmer affect other programmer (because it is continuously failing), we can filter
them. This option strips all assertions except the ones we mark with an alias.

```json
{
  "filter": [
    "jrambo"
  ]
}
```

Then, only asserts with 'jrambo' filter will survive:


```js
setRadius (r) {
  assert: r > 0;
  
  this._radius = r;

  assert: this._radius > 0, {filter: 'jrambo'};
}
```

This would transpile to this:


```js
setRadius (r) {
  this._radius = r;

  console.assert(this._radius > 0);
}
```

#### Option: conditional

It is also possible to activate assertions in runtime (if the strip option is not used) using a global activation variable:

```json
{
  "conditional": "_dbg_assert"
}
```
Then in the transpiled code, assertions will be checked only if the variable is evaluated as true:

```js
setRadius (r) {
  this._radius = r;

  _dbg_assert && console.assert(this._radius > 0);
}
```
You should define and assign a value to it.


#### Option: position
This option adds information about where the assert is located, adding an object indicating line and column to the assertion call:

```json
{
  "position": true
}
```

Once transpiled:


```js
setRadius (r) {
  this._radius = r;

  console.assert(this._radius > 0, {line: 19, column: 4});
}
```


### Contributing

Please see [Contributing to Xplicit](/CONTRIBUTING.md) for the most up-to-date information on contributing this repository.