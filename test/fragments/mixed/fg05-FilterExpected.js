class Sphere {
  constructor(r) {
    console.assert(r > 0);
    this._radius = r;
  }

  setRadius (r) {
    console.assert(this._radius > 0);
    console.assert(r > 0);
    this._radius = r;
  }
}