class Sphere {
  constructor(r) {
    toBeIgnored: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit';
    this._radius = r;
  }

  setRadius (r) {
    _dbg_assert && console.assert(this._radius > 0, {line:9, column:12});

    this._radius = r;
  }

  myFunc (n, m) {
    _dbg_assert && _myAssert(n > m, {line:16, column:19});
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {
        _dbg_assert && _myAssert2(this._radius > 0, {line:20, column:19});
      }
    }
  }
}
