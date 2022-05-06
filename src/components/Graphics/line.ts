type Point = Graphics.Point;
type LineEquation = Graphics.LineEquation;

export enum PointOnLineEquation {
  On = 'on',
  Down = 'down',
  Up = 'up',
}

/**
 *
 * @param pointOne Point 第一个点坐标
 * @param pointTwo Point 第一个点坐标
 * @returns LineEquation 两点直线方程
 */
export function getLineEquation(pointOne: Point, pointTwo: Point): LineEquation {
  return {
    A: pointTwo.y - pointOne.y,
    B: pointOne.x - pointTwo.x,
    C: pointTwo.x * pointOne.y - pointOne.x * pointTwo.y,
  };
}


/**
 *
 * @param point Point
 * @param lineEquation LineEquation
 * @returns number 点到直线的距离
 */
export function getPointToLineDistance(point: Point, lineEquation: LineEquation): number {
  const denominator = Math.abs(lineEquation.A * point.x + lineEquation.B * point.y + lineEquation.C);
  const molecular = Math.sqrt(lineEquation.A ** 2 + lineEquation.B ** 2);
  return denominator / molecular;
}


/**
 *
 * @param firstLineEquation LineEquation 第一条直线
 * @param secondLineEquation LineEquation 第二条直线
 * @returns Point 两直线的交点
 */
export function get2LineIntersectionPoint(
  firstLineEquation: LineEquation,
  secondLineEquation: LineEquation,
): Point {
  const { A: A1, B: B1, C: C1 } = firstLineEquation;
  const { A: A2, B: B2, C: C2 } = secondLineEquation;

  return {
    x: (C2 * B1 - C1 * B2) / (A1 * B2 - A2 * B1),
    y: (C1 * A2 - C2 * A1) / (A1 * B2 - A2 * B1),
  };
}

// 点在直线的上方还是下方
export function pointOnLineEquation(point: Point, lineEquation: LineEquation) {
  const result = (-lineEquation.C - lineEquation.A * point.x) / lineEquation.B - point.y;
  if (result < 0) return PointOnLineEquation.Down;
  if (result > 0) return PointOnLineEquation.Up;
  return PointOnLineEquation.On;
}

// 获取两点之间的距离
export function get2PointDistance(
  firstPoint: Point,
  secondPoint: Point,
): number {
  return Math.hypot(
    firstPoint.x - secondPoint.x,
    firstPoint.y - secondPoint.y,
  );
}

// 根据斜率和一点，获取直线方程
export function getLineEquationByRotateAndPoint(
  passPoint: Point,
  rotate: number,
): LineEquation {
  const slope = Math.tan(rotate / 180 * Math.PI);
  const C = passPoint.y - slope * passPoint.x;
  return {
    A: slope,
    B: -1,
    C,
  };
}
