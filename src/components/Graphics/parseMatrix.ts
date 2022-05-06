export interface Matrix {
  translateX: number,
  translateY: number,
  rotate: number,
  skew: number,
  scaleX: number,
  scaleY: number
}

/**
  * Unmatrix
  *
  * @param {Element} el
  * @return {Object}
  */

export default function parseMatrix(transform: string): Matrix | null {
  return parse(transform);
}

/**
  * Unmatrix: parse the values of the matrix
  *
  * Algorithm from:
  *
  * - http://hg.mozilla.org/mozilla-central/file/7cb3e9795d04/layout/style/nsStyleAnimation.cpp
  *
  * @param {String} str
  * @return {Object}
  * @api public
  */

function parse(str: string) {
  if (!str.length || str === 'none') return null;
  const m = stom(str);

  let A = m[0];
  let B = m[1];
  let C = m[2];
  let D = m[3];

  if (A * D === B * C) throw new Error('transform#unmatrix: matrix is singular');

  // step (3)
  let scaleX = Math.sqrt(A * A + B * B);
  A /= scaleX;
  B /= scaleX;

  // step (4)
  let skew = A * C + B * D;
  C -= A * skew;
  D -= B * skew;

  // step (5)
  const scaleY = Math.sqrt(C * C + D * D);
  C /= scaleY;
  D /= scaleY;
  skew /= scaleY;

  // step (6)
  if (A * D < B * C) {
    A = -A;
    B = -B;
    skew = -skew;
    scaleX = -scaleX;
  }

  return {
    translateX: m[4],
    translateY: m[5],
    rotate: rtod(Math.atan2(B, A)),
    skew: rtod(Math.atan(skew)),
    scaleX: round(scaleX),
    scaleY: round(scaleY),
  };
};


/**
  * String to matrix
  *
  * @param {String} style
  * @return {Array}
  * @api private
  */

function stom(str: string) {
  const m: number[] = [];
  let domMatrixTemp: DOMMatrix;

  if (window.WebKitCSSMatrix) {
    domMatrixTemp = new window.WebKitCSSMatrix(str);
    return ['a', 'b', 'c', 'd', 'e', 'f'].map(key => domMatrixTemp[key as keyof DOMMatrix]) as number[];
  }

  // eslint-disable-next-line no-useless-escape
  const rdigit = /[\d\.\-]+/g;
  let n;

  // eslint-disable-next-line no-cond-assign
  while (n = rdigit.exec(str)) {
    m.push(+n);
  }

  return m;
};

/**
  * Radians to degrees
  *
  * @param {Number} radians
  * @return {Number} degrees
  * @api private
  */

function rtod(radians: number) {
  const deg = radians * 180 / Math.PI;
  return round(deg);
}

/**
  * Round to the nearest hundredth
  *
  * @param {Number} n
  * @return {Number}
  * @api private
  */

function round(n: number) {
  return Math.round(n * 100) / 100;
}
