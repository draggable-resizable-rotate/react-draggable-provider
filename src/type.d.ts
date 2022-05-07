declare namespace DraggableProvider {
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

  export default class DraggableProvider {
    elementRef: HTMLElement
    state: DraggableProviderState
    props: DraggableProviderProps
  }
}

export = DraggableProvider
export as namespace DraggableProvider
export default DraggableProvider
