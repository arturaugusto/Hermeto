const parabolic = function(f, x) {
  `Quadratic interpolation for estimating the true position of an
  inter-sample maximum when nearby samples are known.
 
  f is a vector and x is an index for that vector.
 
  Returns (vx, vy), the coordinates of the vertex of a parabola that goes
  through point x and its two neighbors.
 
  Example:
  Defining a vector f with a local maximum at index 3 (= 6), find local
  maximum if points 2, 3, and 4 actually defined a parabola.
 
  In [3]: f = [2, 3, 1, 6, 4, 2, 3, 1]
 
  In [4]: parabolic(f, argmax(f))
  Out[4]: (3.2142857142857144, 6.1607142857142856)
 
  `
  let xv = 1/2. * (f[x-1] - f[x+1]) / (f[x-1] - 2 * f[x] + f[x+1]) + x
  let yv = f[x] - 1/4. * (f[x-1] - f[x+1]) * (xv - x)
  return [xv, yv]
}

const argmax = function(arr) {
  return arr.reduce((a, c, i) => {if(c>a[1]){a[0]=i;a[1]=c;};return a}, [undefined, -Infinity])[0]
}

// borrowed from https://github.com/sebleier/spectrogram.js/blob/master/spectrogram.js#L78
const color = function(value) {

  var rgb = {R: 0, G: 0, B: 0};

  if (0 <= value && value <= 1 / 8) {
    rgb.R = 0;
    rgb.G = 0;
    rgb.B = 4 * value + .5; // .5 - 1 // b = 1/2
  } else if (1 / 8 < value && value <= 3 / 8) {
    rgb.R = 0;
    rgb.G = 4 * value - .5; // 0 - 1 // b = - 1/2
    rgb.B = 0;
  } else if (3 / 8 < value && value <= 5 / 8) {
    rgb.R = 4*value - 1.5; // 0 - 1 // b = - 3/2
    rgb.G = 1;
    rgb.B = -4 * value + 2.5; // 1 - 0 // b = 5/2
  } else if (5 / 8 < value && value <= 7 / 8) {
    rgb.R = 1;
    rgb.G = -4 * value + 3.5; // 1 - 0 // b = 7/2
    rgb.B = 0;
  } else if (7 / 8 < value && value <= 1) {
    rgb.R = -4*value + 4.5; // 1 - .5 // b = 9/2
    rgb.G = 0;
    rgb.B = 0;
  } else {    // should never happen - value > 1
    rgb.R = .5;
    rgb.G = 0;
    rgb.B = 0;
  }
  return [rgb.R, rgb.G, rgb.B, 1].map(function(d) { return parseInt(d * 255, 10)})
}

const max = (arr) => {
  let res = -Infinity
  for (var i = arr.length - 1; i >= 0; i--) {
    if (arr[i] > res) res = arr[i]
  }
  return res
}

const min = (arr) => {
  let res = Infinity
  for (var i = arr.length - 1; i >= 0; i--) {
    if (arr[i] < res) res = arr[i]
  }
  return res
}


const getSize = () => {
  return {
    width: window.innerWidth - 40,
    height: window.innerHeight - 200,
  }
}