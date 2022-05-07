declare namespace DraggableProvider {
  interface HandleFunMap {
    onMouseDown: (event: React.MouseEvent, delta: Delta) => void,
    onMouseMove: (event: MouseEvent, delta: Delta) => void,
    onMouseUp: (event: MouseEvent, delta: Delta) => void,
  }
  interface MouseEventPoint {
    clientX: number;
    clientY: number;
  }
  interface Delta extends MouseEventPoint {
    changeX: number;
    changeY: number;
    lastClientX: number;
    lastClientY: number;
  }
  interface DraggableProviderProps extends Partial<HandleFunMap> {
    handle?: string;
    nodeRef?: React.RefObject<HTMLElement>
    allowAnyClick?: boolean;
    children: React.ReactElement
  }
  interface DraggableProviderState {
    delta: Delta
  }

  export default class DraggableProvider extends React.PureComponent<
    DraggableProviderProps,
    DraggableProviderState
  > {
    elementRef: HTMLElement;
  }
}

export = DraggableProvider
export as namespace DraggableProvider
export default DraggableProvider;
