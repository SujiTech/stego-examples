import React, { useRef, useEffect } from 'react';
import Viewer from '../components/Viewer';
import Canvas from '../components/Canvas';
import { CanvasProps } from '../types';

function OriginalViewer({ width, height, re, im }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !re || !im) {
      return;
    }

    const context = canvasRef.current.getContext('2d');
    const imageData = context.getImageData(0, 0, width, height);

    for (let h = 0; h < height; h += 1) {
      for (let w = 0; w < width; w += 1) {
        const index = (h * width + w) * 4;
        const color = re[h * width + w];

        imageData.data[index] = color;
        imageData.data[index + 1] = color;
        imageData.data[index + 2] = color;
        imageData.data[index + 3] = 255;
      }
    }
    context.clearRect(0, 0, width, height);
    context.putImageData(imageData, 0, 0);
  }, [canvasRef, width, height, re, im]);

  return (
    <Viewer>
      <h2>Original</h2>
      <Canvas width={width} height={height} ref={canvasRef} />
    </Viewer>
  );
}

export default OriginalViewer;
