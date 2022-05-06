import React, { useRef, useState } from 'react';
import style from './../index.less';
// import Draggable from './components/Draggable';
// import { getPointRotateByOrigin, getRotateRect } from './components/Graphics/rect';
import { Rnd } from '../components/rnd';

export default function RndTest() {
  const [frame, setFrame] = useState({
    position: {
      left: 50,
      top: 50,
    },
    size: {
      width: 100,
      height: 100,
    },
    rotate: 30,
  });

  const rndRef = useRef<any>();

  return (
    <div className={style.container}>
      <Rnd
        className={style.app}
        bounds="parent"
        position={frame.position}
        size={frame.size}
        rotate={frame.rotate}
        style={{
          background: '#fff',
        }}
        onDrag={(e, d, position) => {
          rndRef.current && window.cancelAnimationFrame(rndRef.current);
          rndRef.current = window.requestAnimationFrame(() => {
            setFrame(config => ({
              ...config,
              position: { ...position },
            }));
          });
        }}
        onResize={(
          e,
          dir,
          delta,
          position,
        ) => {
          setFrame(config => ({
            ...config,
            position: { ...position },
            size: { ...delta.size },
          }));
        }}
        enableResizing={{
          right: true,
          bottomRight: true,
          top: true,
          topLeft: true,
          topRight: true,
          bottomLeft: true,
          bottom: true,
          left: true,
        }}
        // lockAspectRatio={true}
      >

      </Rnd>
    </div>
  );
}
