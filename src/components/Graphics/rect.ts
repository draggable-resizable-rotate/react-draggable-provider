type ElementRect = Graphics.ElementRect;
type Point = Graphics.Point;
type Size = Graphics.Size;
type Position = Graphics.Position;
type Direction = Graphics.Direction;
/**
 *
 * @param point 矩形的中心点 originPoint
 * @param size 矩形的大小
 * @returns ElementRect，获取矩形画布特征
 */
export function drawRect(point: Point, size: Size): ElementRect {
  return {
    x: point.x - size.width / 2,
    y: point.y - size.height / 2,
    left: point.x - size.width / 2,
    top: point.y - size.height / 2,
    right: point.x + size.width / 2,
    bottom: point.y + size.height / 2,
    width: size.width,
    height: size.height,
  };
}

/**
 *
 * @param point Point 相对点
 * @param origin Point 原始点
 * @param angle 旋转角度
 * @returns 旋转后的点
 */
export function getPointRotateByOrigin(point: Point, origin: Point, angle: number) {
  const mirrorOriginY = -origin.y;
  const mirrorPointY = -point.y;
  const rx = point.x - origin.x;
  const ry = mirrorPointY - mirrorOriginY;
  const anglePI = getAnglePI(angle);
  // debugger;
  const targetPoint = {
    x: rx * Math.cos(anglePI) + ry * Math.sin(anglePI) + origin.x,
    y: ry * Math.cos(anglePI) - rx * Math.sin(anglePI) + mirrorOriginY,
  };
  return {
    x: targetPoint.x,
    y: -targetPoint.y,
  };
}

// 获取angle的PI值
export function getAnglePI(angle: number) {
  return (angle / 180) * Math.PI;
}


// 获取 正方形从水平旋转 angle 度之后的四点位置
export function getRotateRect(rect: Size & Position, angle: number) {
  // 其实可以看成，一个圆的四个点在旋转
  const { width, height, left, top } = rect;

  const halfWidth = width / 2;
  const halfHeight = height / 2;

  const originPoint = {
    x: left + halfWidth,
    y: top + halfHeight,
  };

  const topLeftPoint = getPointRotateByOrigin({
    x: left,
    y: top,
  }, originPoint, angle);

  const topPoint = getPointRotateByOrigin({
    x: originPoint.x,
    y: top,
  }, originPoint, angle);

  const topRightPoint = getPointRotateByOrigin({
    x: originPoint.x + halfWidth,
    y: top,
  }, originPoint, angle);

  const rightPoint = getPointRotateByOrigin({
    x: originPoint.x + halfWidth,
    y: originPoint.y,
  }, originPoint, angle);

  const bottomRightPoint = getPointRotateByOrigin({
    x: originPoint.x + halfWidth,
    y: originPoint.y + halfHeight,
  }, originPoint, angle);

  const bottomPoint = getPointRotateByOrigin({
    x: originPoint.x,
    y: originPoint.y + halfHeight,
  }, originPoint, angle);

  const bottomLeftPoint = getPointRotateByOrigin({
    x: left,
    y: originPoint.y + halfHeight,
  }, originPoint, angle);

  const leftPoint = getPointRotateByOrigin({
    x: left,
    y: originPoint.y,
  }, originPoint, angle);

  const minX = Math.min(topLeftPoint.x, topRightPoint.x, bottomRightPoint.x, bottomLeftPoint.x);
  const maxX = Math.max(topLeftPoint.x, topRightPoint.x, bottomRightPoint.x, bottomLeftPoint.x);
  const minY = Math.min(topLeftPoint.y, topRightPoint.y, bottomRightPoint.y, bottomLeftPoint.y);
  const maxY = Math.max(topLeftPoint.y, topRightPoint.y, bottomRightPoint.y, bottomLeftPoint.y);

  return {
    point: {
      topLeft: topLeftPoint,
      top: topPoint,
      topRight: topRightPoint,
      right: rightPoint,
      bottomRight: bottomRightPoint,
      bottom: bottomPoint,
      bottomLeft: bottomLeftPoint,
      left: leftPoint,
    },
    width: maxX - minX,
    height: maxY - minY,
    left: minX,
    right: maxX,
    top: minY,
    bottom: maxY,
  };
}


export const RECT_DIRECT: Direction [] = [
  'topLeft',
  'top',
  'topRight',
  'right',
  'bottomRight',
  'bottom',
  'bottomLeft',
  'left',
];

// 线级别
export const RECT_LINE_DIRECTION = ['top', 'right', 'bottom', 'left'];

// 顶点级别
export const RECT_APEX_ANGLE_DIRECTION = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'];

// 获取对角线位置
export function getOppositeDirection(direction: Direction) {
  const currentIndex = RECT_DIRECT.indexOf(direction);
  const oppositeIndex = getValidDirectionIndex(currentIndex + 4);
  return {
    oppositeIndex,
    currentIndex,
  };
}

// 获取有效的方向index
export function getValidDirectionIndex(index: number) {
  if (index >= RECT_DIRECT.length) return index % RECT_DIRECT.length;
  if (index <= -1) return (index % RECT_DIRECT.length) + RECT_DIRECT.length;
  return index;
}
