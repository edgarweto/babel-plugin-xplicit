class Sphere {
  constructor(r) {
    this._radius = r;
  }

  setRadius (r) {
    console.assert(this._radius > 0);
    this._radius = r;
  }
}