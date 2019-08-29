import React, { useRef, useEffect } from 'react';
import Viewer from '../components/Viewer';
import Canvas from '../components/Canvas';
import { CanvasProps } from '../types';
import FFT from '../fft';

function PhaseViewer({ width, height, re, im }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !re || !im) {
      return;
    }

    FFT.init(width);
    FFT.fft2d(re, im);

    let maxPhase = Number.NEGATIVE_INFINITY;
    let phasors = [];

    for (let i = 0; i < width * height; i += 1) {
      const reVal = re[i];
      const imVal = im[i];
      const phase = Math.atan2(imVal, reVal);

      if (phase > maxPhase) {
        maxPhase = phase;
      }
      phasors.push(phase);
    }

    // convert to gray range [0-256)
    const context = canvasRef.current.getContext('2d');
    const imageData = context.getImageData(0, 0, width, height);

    for (let i = 0; i < phasors.length; i += 1) {
      const index = i * 4;
      const color = Math.floor((phasors[i] * 256) / maxPhase);

      imageData.data[index] = color;
      imageData.data[index + 1] = color;
      imageData.data[index + 2] = color;
      imageData.data[index + 3] = 255;
    }

    // draw the spectrum
    context.clearRect(0, 0, width, height);
    context.putImageData(imageData, 0, 0);

    // revoke
    FFT.ifft2d(re, im);
  }, [canvasRef, re, im]);

  return (
    <Viewer>
      <h2>Phase</h2>
      <Canvas width={width} height={height} ref={canvasRef} />
    </Viewer>
  );
}

export default PhaseViewer;
