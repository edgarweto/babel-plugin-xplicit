
Javascript Assertions
====

### Assert javascript code

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
Xplicit is a babel plugin that enables a clean assertion aproach for javascript. I was inspired by Charles Pick's use of javascript label statement in his [babel-plugin-contracts](https://github.com/codemix/babel-plugin-contracts)


[Babel](https://babeljs.io/) enables us to transform our assertion expressions, add some log information and probably the most important point, to strip code.


[![Build Status](https://travis-ci.org/edgarweto/babel-plugin-xplicit.svg)](https://travis-ci.org/edgarweto/babel-plugin-xplicit)


## Asserting javascript code
 Asserting is a simplification aproach to [design by contract](https://en.wikipedia.org/wiki/Design_by_contract), but it still is a strong way to write consistent code.

 Why to remove pre, post and invariants: because they are replicable with only one assertion functionality, leaving to the programmer the responsibility to use it well.

 This plugin is a minimum implementation for [javascript assertion](http://privaliait.blogspot.com.es/2017/04/javascript-assert-best-practices.html).


### Installation
As you are going to use it while developing only, install it with npm --save-dev:

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

#### Option: verbs
This is the way you can personalize the actual assertion function. It also allows you to specify the labels that you are going to use to assert. So you could use something like this:

```json
{
  verbs: {
    assert: "console.assert",
    assert_log: "myAssertFunction"
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

This enables customization of both labels and functions that actually manage assertion violation (where you can throw an exception, or log, or simply notify the developer via other ways).


```js
setRadius (r) {
  console.assert(r > 0);
  
  this._radius = r;

  myAssertFunction(this._radius > 0);
}
```



#### Option: filters

#### Option: conditional

#### Option: position



### Contributing

Please see [Contributing to Xplicit](/CONTRIBUTING.md) for the most up-to-date information on contributing this repository.