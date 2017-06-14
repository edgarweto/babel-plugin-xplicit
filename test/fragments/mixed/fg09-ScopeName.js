class Sphere {
  constructor(r) {
    assert: r > 0;
    this._radius = r;
  }

  setRadius (r) {
    assert: this._radius > 0;

    this._radius = r;
  }
}

function myFunc (n, m) {
  assert: n > m;

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      assert: this._radius > 0;
    }
  }
}

