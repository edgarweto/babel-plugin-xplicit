class Sphere {
  constructor(r) {
    _myAssertLogFn(r > 0, {line:3, column:12});

    this._radius = r;
  }

  setRadius (r) {
    _myAssertLogFn(this._radius > 0, {line:9, column:12});
    _myAssertLogFn(r > 0, {line:10, column:12});

    this._radius = r;
  }
}