function myFunc(n, m) {
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      _myAssertFunction(i * j >= 0);
    }
  }
}