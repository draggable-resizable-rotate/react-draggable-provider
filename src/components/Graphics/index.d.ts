declare namespace Graphics {
  type CanWritable<T> = {
    -readonly [k in keyof T]: T[k]
  };
  interface Position {
    left: number;
    top: number;
  }

  interface Point {
    x: number;
    y: number;
  }

  interface Size {
    width: number;
    height: number
  }

  type ElementRect = CanWritable<Omit<DOMRect, 'toJSON'>>;

  interface LineEquation {
    A: number;
    B: number;
    C: number;
  }

  // 顶角方向
  type ApexAngleDirection  = 'topRight'
  | 'bottomRight'
  | 'bottomLeft'
  | 'topLeft';;

  // 四边方向
  type LineDirection = 'top'
  | 'right'
  | 'bottom'
  | 'left';

  type Direction = ApexAngleDirection | LineDirection;

  type DirectionType = 'apex-angle' | 'line';
}
