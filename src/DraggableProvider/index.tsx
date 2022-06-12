import React from 'react';
import ReactDOM from 'react-dom';
export interface HandleFunMap {
  onMouseDown: (event: React.MouseEvent, delta: Delta) => void;
  onMouseMove: (event: MouseEvent, delta: Delta) => void;
  onMouseUp: (event: MouseEvent, delta: Delta) => void;
}

export interface MouseEventPoint {
  clientX: number;
  clientY: number;
}

export interface Delta extends MouseEventPoint {
  changeX: number;
  changeY: number;
  lastClientX: number;
  lastClientY: number;
}

interface DraggableProviderProps extends Partial<HandleFunMap> {
  handle?: string;
  nodeRef?: React.RefObject<HTMLElement>;
  allowAnyClick?: boolean;
  children: React.ReactElement;
}

interface DraggableProviderState {
  delta: Delta;
}

class DraggableProvider extends React.PureComponent<
  DraggableProviderProps,
  DraggableProviderState
> {
  constructor(props: DraggableProviderProps) {
    super(props);
    this.state = {
      delta: {
        clientX: NaN,
        clientY: NaN,
        changeX: NaN,
        changeY: NaN,
        lastClientX: NaN,
        lastClientY: NaN,
      },
    };
  }

  get elementRef(): HTMLElement {
    if (this.props.nodeRef?.current) {
      return this.props.nodeRef.current;
    }
    // eslint-disable-next-line react/no-find-dom-node
    return ReactDOM.findDOMNode(this) as HTMLElement;
  }

  onMouseDown = (event: React.MouseEvent) => {
    const { props, elementRef, state, onMouseMove, onMouseUp } = this;
    const { handle, allowAnyClick = false } = props;
    const { delta } = state;
    const element = elementRef;
    const handleElement = handle && element.querySelector(handle);
    // 只允许左键点击
    if (!allowAnyClick && typeof event.button === 'number' && event.button !== 0) return false;

    if (handle) {
      // 不存在元素 handle有误
      if (!handleElement) {
        throw new Error('querySelector无法找到handle');
      }
      let target = event.target as HTMLElement;
      let lock = handleElement === element;
      while (element !== target && !lock) {
        if (handleElement.contains(target)) {
          lock = true;
        }
        target = target.parentNode as HTMLElement;
      }
      if (!lock) return;
    }

    const { ownerDocument } = element;

    const newDelta = {
      ...delta,
      clientX: event.clientX,
      clientY: event.clientY,
    };

    this.setState({ delta: newDelta });
    // 数据保护
    props.onMouseDown?.(event, JSON.parse(JSON.stringify(newDelta)));
    // 绑定剩余方法
    ownerDocument.addEventListener('mousemove', onMouseMove, false);
    ownerDocument.addEventListener('mouseup', onMouseUp, false);
    ownerDocument.addEventListener('mouseleave', onMouseUp, false);
  };

  onMouseMove = (event: MouseEvent) => {
    const { props, state } = this;
    const { delta } = state;
    const newDelta: Delta = {
      clientX: event.clientX,
      clientY: event.clientY,
      changeX: event.clientX - delta.clientX,
      changeY: event.clientY - delta.clientY,
      lastClientX: delta.clientX,
      lastClientY: delta.clientY,
    };
    this.setState({
      delta: newDelta,
    });
    props.onMouseMove?.(event, JSON.parse(JSON.stringify(newDelta)));
  };

  onMouseUp = (event: MouseEvent) => {
    const { props, state } = this;
    const { delta } = state;
    props.onMouseUp?.(event, JSON.parse(JSON.stringify(delta)));
    this.unBindListener();
  };

  // 解绑当前节点所有绑定的方法
  unBindListener() {
    const { elementRef, onMouseMove, onMouseUp } = this;
    const { ownerDocument } = elementRef;
    ownerDocument.removeEventListener('mousemove', onMouseMove, false);
    ownerDocument.removeEventListener('mouseup', onMouseUp, false);
    ownerDocument.removeEventListener('mouseleave', onMouseUp, false);
  }
  // 渲染
  render(): React.ReactNode {
    const { props, onMouseDown } = this;
    const { children } = props;
    const onlyChild = React.Children.only(children) as React.ReactElement;
    return React.cloneElement(onlyChild, {
      onMouseDown,
    });
  }

  // 组件卸载之前，解除事件绑定
  componentWillUnmount() {
    this.unBindListener();
  }
}

export default DraggableProvider;
