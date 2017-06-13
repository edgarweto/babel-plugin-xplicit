class Sphere {
  constructor(r) {
    _dbg_assert && console.assert(r > 0);

    this._radius = r;
  }

  setRadius (r) {
    _dbg_assert && console.assert(this._radius > 0);
    _dbg_assert && console.assert(r > 0);

    this._radius = r;
  }
}