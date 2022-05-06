type Position = Graphics.Position;
type ElementRect = Graphics.ElementRect;
type Point = Graphics.Point;
/**
 * @description 获取元素的文档流节点位置
 * @param element 元素
 * @param position 元素的transform
 * @returns
 */
export function getElementDocumentRect(element: HTMLElement, position: Position): ElementRect {
  // 元素宽度
  const elementWidth = element.offsetWidth;
  // 元素高度
  const elementHeight = element.offsetHeight;
  const elementRect = element.getBoundingClientRect();
  // 元素渲染的真实节点的 origin
  const elementOrigin: Point = {
    x: (elementRect.left + elementRect.right) / 2,
    y: (elementRect.bottom + elementRect.top) / 2,
  };
  const documentOrigin: Point = {
    x: elementOrigin.x - position.left,
    y: elementOrigin.y - position.top,
  };
  const documentLeft = documentOrigin.x - elementWidth / 2;
  const documentTop = documentOrigin.y - elementHeight / 2;
  return {
    width: elementWidth,
    height: elementHeight,
    left: documentLeft,
    top: documentTop,
    right: documentLeft + elementWidth,
    bottom: documentTop + elementHeight,
    x: documentLeft,
    y: documentTop,
  };
}
