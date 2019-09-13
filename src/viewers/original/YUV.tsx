import React, { useRef, useEffect, useState, useCallback } from 'react';
import Viewer from '../../components/Viewer';
import Canvas from '../../components/Canvas';
import Checkbox from '../../components/Checkbox';
import { CanvasProps } from '../../types';
import { yuv2rgb } from '../../helpers';

function YUVViewer({ width, height, res, ims }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [useY, setUseY] = useState(true);
  const [useCb, setUseCb] = useState(false);
  const [useCr, setUseCr] = useState(false);
  const handleCheckboxChange = useCallback(
    (channel: 'Y' | 'Cb' | 'Cr') => {
      return () => {
        switch (channel) {
          case 'Y':
            setUseY(!useY);
            setUseCb(false);
            setUseCr(false);
            break;
          case 'Cb':
            setUseY(false);
            setUseCb(!useCb);
            setUseCr(false);
            break;
          case 'Cr':
            setUseY(false);
            setUseCb(false);
            setUseCr(!useCr);
            break;
        }
      };
    },
    [useY, useCb, useCr]
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
        const y = useY ? res[0][h * width + w] : 0;
        const cb = useCb ? res[1][h * width + w + 1] : 0;
        const cr = useCr ? res[2][h * width + w + 2] : 0;
        const [r, g, b] = yuv2rgb(y, cb, cr);

        imageData.data[index] = r;
        imageData.data[index + 1] = g;
        imageData.data[index + 2] = b;
        imageData.data[index + 3] = 255;
      }
    }
    context.clearRect(0, 0, width, height);
    context.putImageData(imageData, 0, 0);
  }, [canvasRef, width, height, res, ims, useY, useCb, useCr]);

  return (
    <Viewer title="YUV">
      <Canvas width={width} height={height} ref={canvasRef} />
      <Checkbox
        type="radio"
        label="Y"
        checked={useY}
        onChange={handleCheckboxChange('Y')}
      />
      <Checkbox
        type="radio"
        label="Cb"
        checked={useCb}
        onChange={handleCheckboxChange('Cb')}
      />
      <Checkbox
        type="radio"
        label="Cr"
        checked={useCr}
        onChange={handleCheckboxChange('Cr')}
      />
    </Viewer>
  );
}

export default YUVViewer;
