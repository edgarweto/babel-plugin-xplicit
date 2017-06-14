class Sphere {
  constructor(r) {
    assert: r > 0;
    toBeIgnored: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit';
    this._radius = r;
  }

  setRadius (r) {
    assert: this._radius > 0, {filter: 'jrambo'};
    myAssert3: r > 0, {filter: 'jfive'};

    this._radius = r;
  }

  myFunc (n, m) {
    myAssertLabel: n > m, {filter: 'jtwo'};

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {
        myAssert2: this._radius > 0, {filter: 'jrambo'};
      }
    }
  }
}
