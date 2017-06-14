class Sphere {
  constructor(r) {
    assert: r > 0;

    this._radius = r;
  }

  setRadius (r) {
    assert: this._radius > 0;
    assert: r > 0;

    this._radius = r;
  }
}