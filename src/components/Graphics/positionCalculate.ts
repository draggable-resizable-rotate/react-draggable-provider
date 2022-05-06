type Point = Graphics.Point;

// 两个点在同一个直角坐标系内，一个点相对另外一个点的位置
export function getRelativePoint(
  relativePoint: Point,
  freePoint: Point,
): Point  {
  return {
    x: freePoint.x - relativePoint.x,
    y: freePoint.y - relativePoint.y,
  };
}
