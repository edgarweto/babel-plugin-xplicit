class Sphere {
  constructor(r) {
    console.assert(r > 0);
    this._radius = r;
  }

  setRadius (r) {
    console.assert(this._radius > 0);

    this._radius = r;
  }
}

function myFunc (n, m) {
  console.assert(n > m);

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      console.assert(this._radius > 0);
    }
  }
}

