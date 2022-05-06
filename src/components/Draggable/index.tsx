import { getElementDocumentRect } from './../Graphics/docPositionCalculate';
import { getRelativePoint } from './../Graphics/positionCalculate';
import { Matrix } from '@shepijcanwu/graphics';
import React from 'react';
import DraggableProvider, { Delta, HandleFunMap, MouseEventPoint } from '../DraggableProvider';
import { addUserSelectStyles, getSafeObjectValue, removeUserSelectStyles } from './utils';

const { parseMatrix } = Matrix;

export type DraggableMouseHandle = DraggableHandleFunMap;
export interface DraggableHandleFunMap {
  onMouseDown: (event: React.MouseEvent, delta: Delta, position: Position) => any;
  onMouseMove: (event: MouseEvent, delta: Delta, position: Position) => any;
  onMouseUp: (event: MouseEvent, delta: Delta, position: Position) => any;
}

export type Position = Graphics.Position;

export type ElementRect = Graphics.ElementRect;
export type DraggableBounds = Omit<ElementRect, 'width' | 'height' | 'x' | 'y'>;

export type DraggableProps = Partial<DraggableHandleFunMap> & {
  position?: Position;
  // 默认的 position，一次性效果
  defaultPosition?: Position;
  axis?: 'both' | 'x' | 'y' | 'none';
  handle?: string;
  grid?: [number, number];
  // 'window' | 'parent' | elementSelector | DraggableBounds
  bounds?: string | DraggableBounds;
  nodeRef?: React.RefObject<HTMLElement>;
  enableUserSelectHack?: boolean;
  scale?: number;
  canMoveable?: boolean;
  rotate?: number;
  moveRatio?: number;
};

export type ClientPoint = MouseEventPoint;

export interface DraggableState {
  position?: Position;
  rotate?: number;
  scale?: number;
  dragging: boolean;
}

interface MouseDownCache {
  clientPoint: ClientPoint;
  position: Position;
  bounds: DraggableBounds | null;
  size: Graphics.Size;
}

class Draggable extends React.PureComponent<DraggableProps, DraggableState> {
  // DraggableProvider ReactComponent Ref
  draggableProvider: React.RefObject<DraggableProvider>;
  mouseDownCache: Partial<MouseDownCache>;

  constructor(props: DraggableProps) {
    super(props);
    this.state = {
      position: props.position || props.defaultPosition,
      dragging: false,
      rotate: props.rotate,
      scale: props.scale,
    };
    this.draggableProvider = React.createRef<DraggableProvider>();
    this.mouseDownCache = {};
  }

  // position 是否有效
  isValidPosition(position: Position) {
    return Object.is(NaN, position.left) && Object.is(NaN, position.top);
  }

  componentDidMount() {
    const { state } = this;
    const { position, rotate, scale } = state;
    // if position or rotate are undefined，to initialize
    if (!position || rotate === undefined || scale === undefined) {
      const element = this.draggableProvider.current?.elementRef as HTMLElement;
      const transformStr = element.style.transform || window.getComputedStyle(element).transform;
      let left = 0;
      let top = 0;
      let rotate = 0;
      let scale = 1;
      if (transformStr && transformStr !== 'none') {
        const matrix = parseMatrix(transformStr);
        left = matrix?.translateX || 0;
        top = matrix?.translateY || 0;
        rotate = matrix?.rotate || 0;
        scale = matrix?.scaleX || 1;
      }
      const newState = {};
      if (!position) {
        Object.assign(newState, { position: { left, top } });
      }
      if (rotate === undefined) {
        Object.assign(newState, { rotate });
      }
      if (scale === undefined) {
        Object.assign(newState, { scale });
      }
      // sync to state, update this component
      this.setState(newState);
    }
  }

  snapToGrid(grid: [number, number], pendingX: number, pendingY: number): [number, number] {
    const x = Math.round(pendingX / grid[0]) * grid[0];
    const y = Math.round(pendingY / grid[1]) * grid[1];
    return [x, y];
  }

  // get valid position through bounds
  getValidPositionByBounds(position: Position, bounds: DraggableBounds) {
    let { left, top } = position;
    left = Math.max(bounds.left, left);
    left = Math.min(bounds.right, left);
    top = Math.max(bounds.top, top);
    top = Math.min(bounds.bottom, top);
    return {
      left,
      top,
    };
  }

  // get bounds
  getJudgeBounds(validPosition: Position): DraggableBounds | null {
    const { bounds } = this.props;
    if (!bounds) return null;
    if (typeof bounds === 'object') {
      return bounds;
    }
    // boundsStr may be 'parent' or 'window' or 'body' or selectorStr
    const element = this.draggableProvider.current?.elementRef as HTMLElement;
    // get element position relative window before transform
    const elementDocumentRect = getElementDocumentRect(element, validPosition);

    let boundsElementRect: Omit<ElementRect, 'left' | 'top' | 'right' | 'bottom'>;

    if (bounds === 'window') {
      boundsElementRect = {
        width: window.innerWidth,
        height: window.innerHeight,
        x: 0,
        y: 0,
      };
    } else {
      let boundsElement: HTMLElement;
      switch (bounds) {
        case 'body': {
          boundsElement = document.body;
          break;
        }
        case 'parent': {
          boundsElement = element.parentElement as HTMLElement;
          break;
        }
        default: {
          const targetBounds = document.querySelector(bounds);
          // selectorElement not contains draggable
          if (!targetBounds || !targetBounds.contains(element)) {
            throw new Error('bounds 必须存在，并且需要为拖动元素的祖先级别（包括父级）');
          }
          boundsElement = targetBounds as HTMLElement;
        }
      }
      boundsElementRect = boundsElement.getBoundingClientRect();
    }
    // 父元素相对元素文档流的位置
    const boundsELementRelativePosition = getRelativePoint(
      {
        x: elementDocumentRect.x,
        y: elementDocumentRect.y,
      },
      {
        x: boundsElementRect.x,
        y: boundsElementRect.y,
      },
    );

    const { x: boundsElementLeft, y: boundsElementTop } = boundsELementRelativePosition;
    const { width: boundsElementWidth, height: boundsElementHeight } = boundsElementRect;

    return {
      left: boundsElementLeft,
      top: boundsElementTop,
      right: boundsElementLeft + boundsElementWidth,
      bottom: boundsElementTop + boundsElementHeight,
    };
  }

  // 判断方向
  judgeAxis(oldPosition: Position, newPosition: Position): Position {
    const {
      props: { axis },
    } = this;
    let { left, top } = newPosition;
    switch (axis) {
      case 'none': {
        left = oldPosition.left;
        top = oldPosition.top;
        break;
      }
      case 'x': {
        top = oldPosition.top;
        break;
      }
      case 'y': {
        left = oldPosition.left;
        break;
      }
      case 'both':
      default:
        break;
    }
    return {
      left,
      top,
    };
  }

  onMouseDown: HandleFunMap['onMouseDown'] = (event, delta) => {
    const { props, draggableProvider, state } = this;
    const { enableUserSelectHack = true } = props;
    const element = draggableProvider.current?.elementRef as HTMLElement;
    if (enableUserSelectHack) addUserSelectStyles(element.ownerDocument);
    // 先合并 props 的 position
    const validPosition = props.position || (state.position as Position);
    this.mouseDownCache.clientPoint = {
      clientX: delta.clientX,
      clientY: delta.clientY,
    };
    this.mouseDownCache.position = {
      ...validPosition,
    };
    this.mouseDownCache.bounds = this.getJudgeBounds(validPosition);
    this.mouseDownCache.size = {
      width: element.offsetWidth,
      height: element.offsetHeight,
    };
    this.setState({
      dragging: true,
      position: { ...validPosition },
      rotate: this.props.rotate || this.state.rotate,
      scale: this.props.scale || this.state.scale,
    });
    props.onMouseDown?.(event, getSafeObjectValue(delta), getSafeObjectValue(validPosition));
  };

  componentWillUnmount() {
    const { props, draggableProvider } = this;
    const { enableUserSelectHack = true } = props;
    const element = draggableProvider.current?.elementRef as HTMLElement;
    if (enableUserSelectHack) addUserSelectStyles(element.ownerDocument);
  }

  // 优先考虑得到当前点、前一点 => 计算出 下一次的前一个点 => 计算有效位置
  onMouseMove: HandleFunMap['onMouseMove'] = (event, delta) => {
    const { props, state, mouseDownCache } = this;
    const { position: lastPosition } = state as Required<DraggableState>;
    const { moveRatio = 1, canMoveable = true } = props;
    const {
      position: mouseDownPosition,
      clientPoint: mouseDownClientPoint,
      bounds,
      size,
    } = mouseDownCache as MouseDownCache;
    if (!canMoveable) return;
    // 获取到符合要求的 changX changY
    const { clientX: lastClientX, clientY: lastClientY } = mouseDownClientPoint;
    let changeX = (delta.clientX - lastClientX) * moveRatio;
    let changeY = (delta.clientY - lastClientY) * moveRatio;
    if (props.grid) {
      // 根据grid获取 changX、changY，再反推出 真正的 lastClientPoint
      [changeX, changeY] = this.snapToGrid(props.grid, changeX, changeY);
    }
    // 获取到初步的left，top
    let validPosition = {
      left: mouseDownPosition.left + changeX,
      top: mouseDownPosition.top + changeY,
    };
    // 边界判断获取有效位置信息
    if (bounds) {
      validPosition = this.getValidPositionByBounds(validPosition, {
        left: bounds.left,
        right: bounds.right - size.width,
        top: bounds.top,
        bottom: bounds.bottom - size.height,
      });
    }
    // 方向判断获取有效位置信息
    validPosition = this.judgeAxis(lastPosition, validPosition);

    const shouldUpdate = props.onMouseMove?.(
      event,
      getSafeObjectValue(delta),
      getSafeObjectValue(validPosition),
    );
    if (shouldUpdate === false) return;
    // 非受控组件更新 state，受控组件根据 getDerivedStateFromProps 自动的更新
    this.setState({
      position: validPosition,
    });
  };

  onMouseUp: HandleFunMap['onMouseUp'] = (event, delta) => {
    const { props, draggableProvider, state } = this;
    const { enableUserSelectHack = true } = props;
    const { position } = state as Required<DraggableState>;
    const element = draggableProvider.current?.elementRef as HTMLElement;
    if (enableUserSelectHack) removeUserSelectStyles(element.ownerDocument);
    this.setState({
      dragging: false,
    });
    props.onMouseUp?.(event, getSafeObjectValue(delta), getSafeObjectValue(position));
  };

  getTransformStyle() {
    const { props, state } = this;
    const { position } = props;
    const { position: innerPosition, dragging } = state;
    const rotate = dragging ? state.rotate : props.rotate;
    const scale = dragging ? state.scale : props.scale;
    const transformStyle = (() => {
      const style: React.CSSProperties = {};
      // 非可控组件时，主动设置transform，让它跟着内部数据移动
      if (dragging || !position) {
        if (innerPosition) {
          style.transform = `translate(${innerPosition.left}px, ${innerPosition.top}px) rotate(${
            rotate || 0
          }deg) scale(${scale || 1})`;
        }
      } else {
        style.transform = `translate(${position.left}px, ${position.top}px) rotate(${
          rotate || 0
        }deg) scale(${scale || 1})`;
      }
      return style;
    })();
    return transformStyle;
  }

  render(): React.ReactNode {
    const { props } = this;

    const onlyChild = React.Children.only(props.children) as React.ReactElement;
    const transformStyle = this.getTransformStyle();

    return (
      <DraggableProvider
        ref={this.draggableProvider}
        handle={props.handle}
        onMouseDown={this.onMouseDown}
        onMouseMove={this.onMouseMove}
        onMouseUp={this.onMouseUp}
        nodeRef={this.props.nodeRef}
      >
        {React.cloneElement(onlyChild, {
          style: {
            display: 'block',
            ...transformStyle,
            ...onlyChild.props.style,
          },
        })}
      </DraggableProvider>
    );
  }
}

export default Draggable;
