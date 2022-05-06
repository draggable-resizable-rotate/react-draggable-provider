import React, { useEffect, useRef, useState } from 'react';
import { ReactComponent as ProSvg } from '@/asset/svg/pro_icon.svg';
import style from '../index.less';
// import Draggable from './components/Draggable';
// import { getPointRotateByOrigin, getRotateRect } from './components/Graphics/rect';
// import { Resizable } from './components/Resizable';
import Draggable from '../components/Draggable';

export default function DraggableTest() {
  const [position, setPosition] = useState({
    left: 100,
    top: 100,
  });
  const first = useRef();

  useEffect(() => {
    console.log(first);
  }, []);

  const [canMoveable, setCanMoveable] = useState(true);
  const [count, setCount] = useState(0);

  return (
    <div className={style.container}>
      <Draggable
        bounds="body"
        handle={'.svg'}
        canMoveable={canMoveable}
        position={position}
        // scale={2}
        moveRatio={2}
        onMouseUp={(e, d, position) => {
          // setCount(count => count + 1);
          // setPosition(position);
          // // setTimeout(() => {
          // //   setCanMoveable(false);
          // // }, 1000);
          // if (count > 100) {
          //   return false;
          // }
        }}
        // rotate={45}
      >
        <span className={style.app}>
          <ProSvg id="handle" width="40" height="40" className="svg" />
        </span>
      </Draggable>
    </div>
  );
}
