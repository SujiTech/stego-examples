import React, {
  useRef,
  useEffect,
  useCallback,
  useState,
  ChangeEvent,
} from 'react';
import Viewer from '../components/Viewer';
import Canvas from '../components/Canvas';
import { CanvasProps } from '../types';
import FFT from '../fft';

function MagnitudeViewer({ width, height, re, im }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [useLog] = useState(localStorage.getItem('useLog') === 'true');
  const handleCheckboxChange = useCallback(
    (ev: ChangeEvent<HTMLInputElement>) => {
      localStorage.setItem('useLog', useLog ? 'false' : 'true');
      location.reload();
    },
    []
  );

  useEffect(() => {
    if (!canvasRef.current || !re || !im) {
      return;
    }

    FFT.init(width);
    FFT.fft2d(re, im);

    let maxAmplitude = Number.NEGATIVE_INFINITY;
    let amplitudes: number[] = [];

    for (let i = 0; i < width * height; i += 1) {
      const reVal = re[i];
      const imVal = im[i];
      const amplitude = useLog
        ? Math.log(Math.sqrt(reVal * reVal + imVal * imVal))
        : Math.sqrt(reVal * reVal + imVal * imVal);

      if (amplitude > maxAmplitude) {
        maxAmplitude = amplitude;
      }
      amplitudes.push(amplitude);
    }

    // convert to gray range [0-256)
    const context = canvasRef.current.getContext('2d');
    const imageData = context.getImageData(0, 0, width, height);

    for (let i = 0; i < amplitudes.length; i += 1) {
      const index = i * 4;
      const color = Math.floor((amplitudes[i] * 256) / maxAmplitude);

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
  }, [canvasRef, im, re, useLog]);

  return (
    <Viewer>
      <h2>Magnitude</h2>
      <Canvas width={width} height={height} ref={canvasRef} />
      <div>
        <label>
          <input
            type="checkbox"
            checked={useLog}
            onChange={handleCheckboxChange}
          />
          <label>Use Log</label>
        </label>
      </div>
    </Viewer>
  );
}

export default MagnitudeViewer;
