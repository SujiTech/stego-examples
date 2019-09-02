import React, { useRef, useEffect, useState, useCallback } from 'react';
import Viewer from '../../components/Viewer';
import Canvas from '../../components/Canvas';
import Checkbox from '../../components/Checkbox';
import { CanvasProps } from '../../types';

function RGBViewer({ width, height, res, ims }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [useR, setUseR] = useState(true);
  const [useG, setUseG] = useState(true);
  const [useB, setUseB] = useState(true);
  const [useY, setUseY] = useState(false);
  const [useCb, setUseCb] = useState(false);
  const [useCr, setUseCr] = useState(false);
  const handleCheckboxChange = useCallback(
    (channel: 'R' | 'G' | 'B') => {
      return () => {
        switch (channel) {
          case 'R':
            setUseR(!useR);
            break;
          case 'G':
            setUseG(!useG);
            break;
          case 'B':
            setUseB(!useB);
            break;
        }
      };
    },
    [useR, useG, useB, useY, useCb, useCr]
  );

  useEffect(() => {
    if (!canvasRef.current || !res || !ims || !res.length || !ims.length) {
      return;
    }

    const context = canvasRef.current.getContext('2d');
    const imageData = context.getImageData(0, 0, width, height);

    for (let h = 0; h < height; h += 1) {
      for (let w = 0; w < width; w += 1) {
        const index = (h * width + w) * 4;
        const r = useR ? res[0][h * width + w] : 0;
        const g = useG ? res[1][h * width + w + 1] : 0;
        const b = useB ? res[2][h * width + w + 2] : 0;

        imageData.data[index] = r;
        imageData.data[index + 1] = g;
        imageData.data[index + 2] = b;
        imageData.data[index + 3] = 255;
      }
    }
    context.clearRect(0, 0, width, height);
    context.putImageData(imageData, 0, 0);
  }, [canvasRef, width, height, res, ims, useR, useG, useB]);

  return (
    <Viewer title="RGB">
      <Canvas width={width} height={height} ref={canvasRef} />
      <Checkbox label="R" checked={useR} onChange={handleCheckboxChange('R')} />
      <Checkbox label="G" checked={useG} onChange={handleCheckboxChange('G')} />
      <Checkbox label="B" checked={useB} onChange={handleCheckboxChange('B')} />
    </Viewer>
  );
}

export default RGBViewer;
