import React, { useRef, useEffect } from 'react';
import Viewer from '../components/Viewer';
import Canvas from '../components/Canvas';
import { CanvasProps } from '../types';
import FFT from '../fft';

function SteganographyViewer({ width, height, re, im }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !re || !im) {
      return;
    }

    FFT.init(width);
    FFT.fft2d(re, im);

    // let maxAmplitude = Number.NEGATIVE_INFINITY;
    // let amplitudes: number[] = [];

    // for (let i = 0; i < width * height; i += 1) {
    //   re[i] += Math.round(Math.random() * 2000);
    //   im[i] += Math.round(Math.random() * 20000);

    //   const reVal = re[i];
    //   const imVal = im[i];
    //   const amplitude = Math.sqrt(reVal * reVal + imVal * imVal);

    //   if (amplitude > maxAmplitude) {
    //     maxAmplitude = amplitude + 200;
    //   }
    //   amplitudes.push(amplitude + 200);
    // }

    // // convert to gray range [0-256)
    // const context = canvasRef.current.getContext('2d');
    // const imageData = context.getImageData(0, 0, width, height);

    // for (let i = 0; i < amplitudes.length; i += 1) {
    //   const index = i * 4;
    //   const color = Math.floor((amplitudes[i] * 256) / maxAmplitude) + 1;

    //   imageData.data[index] = color;
    //   imageData.data[index + 1] = color;
    //   imageData.data[index + 2] = color;
    //   imageData.data[index + 3] = 255;
    // }

    // // draw the spectrum
    // context.clearRect(0, 0, width, height);
    // context.putImageData(imageData, 0, 0);

    // revoke
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
    <Viewer title="Steganography">
      <Canvas width={width} height={height} ref={canvasRef} />
    </Viewer>
  );
}

export default SteganographyViewer;
