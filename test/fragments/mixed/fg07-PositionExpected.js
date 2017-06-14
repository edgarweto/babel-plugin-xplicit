class Sphere {
  constructor(r) {
    console.assert(r > 0, {line:3, column:12});

    this._radius = r;
  }

  setRadius (r) {
    console.assert(this._radius > 0, {line:9, column:12});
    console.assert(r > 0, {line:10, column:12});

    this._radius = r;
  }
}