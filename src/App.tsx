import React, { useState } from 'react';
import DraggableTest from './pages/DraggableTest';
import ResizableTest from './pages/ResizableTest';
import RndTest from './pages/RndTest';

export default function App() {
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

  return (
    // <DraggableTest />
    <RndTest />
    // <ResizableTest />
  );
}
