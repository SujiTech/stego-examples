import React, { useRef, useEffect } from 'react';
import Viewer from '../components/Viewer';
import Canvas from '../components/Canvas';
import { CanvasProps } from '../types';
import FFT from '../fft';

function ResultViewer({ width, height, re, im }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !re || !im) {
      return;
    }

    FFT.fft2d(re, im);
    FFT.ifft2d(re, im);

    const context = canvasRef.current.getContext('2d');
    const imageData = context.getImageData(0, 0, width, height);

    for (let i = 0; i < re.length; i += 1) {
      const color = re[i];
      const index = i * 4;

      imageData.data[index] = color;
      imageData.data[index + 1] = color;
      imageData.data[index + 2] = color;
      imageData.data[index + 3] = 255;
    }
    context.clearRect(0, 0, width, height);
    context.putImageData(imageData, 0, 0);
  }, [canvasRef, re, im]);
  return (
    <Viewer title="Result">
      <Canvas width={width} height={height} ref={canvasRef} />
    </Viewer>
  );
}

export default ResultViewer;
