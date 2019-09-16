import React, { useState, useRef, useEffect } from 'react';
import Viewer from '../components/Viewer';
import { CanvasProps } from '../types';
import Checkbox from '../components/Checkbox';
import Canvas from '../components/Canvas';
import Input from '../components/Input';
import { clamp } from '../helpers';

export enum GrayscaleAlgorithm {
  AVERAGE = 'AVG',
  LUMINANCE = 'LUMA',
  LUMINANCE_II = 'LUMA_II',
  DESATURATION = 'DESATURATION',
  MAX_DECOMPOSITION = 'MAX_DE',
  MIN_DECOMPOSITION = 'MIN_DE',
  MID_DECOMPOSITION = 'MID_DE',
  SIGNLE_R = 'R',
  SIGNLE_G = 'G',
  SIGNLE_B = 'B',
  SHADES = 'SHADES',
}

function GrayscaleViewer({ width, height, res, ims }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [shades, setShades] = useState(2);
  const [algorithm, setAlgorithm] = useState<GrayscaleAlgorithm>(
    GrayscaleAlgorithm.AVERAGE
  );

  useEffect(() => {
    if (!canvasRef.current || !res || !res.length) {
      return;
    }

    // convert to gray range [0-256)
    const context = canvasRef.current.getContext('2d');
    const imageData = context.getImageData(0, 0, width, height);
    const length = width * height;
    const factor = 255 / (clamp(shades, 2, 256) - 1);

    for (let i = 0; i < length; i += 1) {
      const r = res[0][i];
      const g = res[1][i];
      const b = res[2][i];
      let gray = 0;

      switch (algorithm) {
        case GrayscaleAlgorithm.AVERAGE:
          gray = (r + g + b) / 3;
          break;
        case GrayscaleAlgorithm.LUMINANCE:
          gray = r * 0.3 + g * 0.59 + b * 0.11;
          break;
        case GrayscaleAlgorithm.LUMINANCE_II:
          gray = r * 0.2126 + g * 0.7152 + b * 0.0722;
          break;
        case GrayscaleAlgorithm.DESATURATION:
          gray = (Math.max(r, g, b) + Math.min(r, g, b)) / 2;
          break;
        case GrayscaleAlgorithm.MAX_DECOMPOSITION:
          gray = Math.max(r, g, b);
          break;
        case GrayscaleAlgorithm.MIN_DECOMPOSITION:
          gray = Math.min(r, g, b);
          break;
        case GrayscaleAlgorithm.MID_DECOMPOSITION:
          gray = [r, g, b].sort()[1];
          break;
        case GrayscaleAlgorithm.SIGNLE_R:
          gray = r;
          break;
        case GrayscaleAlgorithm.SIGNLE_G:
          gray = g;
          break;
        case GrayscaleAlgorithm.SIGNLE_B:
          gray = b;
          break;
        case GrayscaleAlgorithm.SHADES:
          gray = Math.floor((r + g + b) / 3 / factor + 0.5) * factor;
          break;
      }

      imageData.data[i * 4] = gray;
      imageData.data[i * 4 + 1] = gray;
      imageData.data[i * 4 + 2] = gray;
      imageData.data[i * 4 + 3] = 255;
    }

    // draw
    context.clearRect(0, 0, width, height);
    context.putImageData(imageData, 0, 0);
  }, [canvasRef, algorithm, res, shades]);

  return (
    <Viewer title="Grayscale">
      <Canvas width={width} height={height} ref={canvasRef} />
      {Object.keys(GrayscaleAlgorithm).map(k => {
        const selectedAlgorithm =
          GrayscaleAlgorithm[k as keyof typeof GrayscaleAlgorithm];

        return (
          <div key={selectedAlgorithm} style={{ display: 'flex' }}>
            <Checkbox
              type="radio"
              key={selectedAlgorithm}
              label={selectedAlgorithm}
              checked={algorithm === selectedAlgorithm}
              onChange={() => setAlgorithm(selectedAlgorithm)}
            />
            {algorithm === GrayscaleAlgorithm.SHADES &&
            selectedAlgorithm === GrayscaleAlgorithm.SHADES ? (
              <Input
                type="number"
                label=""
                placeholder="num of shades"
                max="256"
                min="2"
                defaultValue="2"
                onChange={({ currentTarget }) =>
                  setShades(parseInt(currentTarget.value, 10))
                }
              />
            ) : null}
          </div>
        );
      })}
    </Viewer>
  );
}

export default GrayscaleViewer;
