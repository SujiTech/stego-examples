import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  ChangeEvent,
} from 'react';
import Viewer from '../components/Viewer';
import Canvas from '../components/Canvas';
import { divideIntoBlocks } from '../stego';
import { CanvasProps } from '../types';

function BlockViewer({ width, height, res, ims }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sizeRef = useRef<HTMLInputElement>(null);
  const [size, setSize] = useState(8);
  const handleSizeChange = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
    setSize(parseInt(ev.currentTarget.value, 10));
  }, []);

  useEffect(() => {
    if (
      !canvasRef.current ||
      !sizeRef.current ||
      !res ||
      !ims ||
      !res.length ||
      !ims.length
    ) {
      return;
    }

    // const reBlocks = divideIntoBlocks(width, height, size, res[0]);
    const context = canvasRef.current.getContext('2d');
    const imageData = context.getImageData(0, 0, width, height);

    // background
    res[0].forEach((v, i) => {
      imageData.data[i * 4] = v;
      imageData.data[i * 4 + 1] = v;
      imageData.data[i * 4 + 2] = v;
      imageData.data[i * 4 + 3] = 255;
    });

    // blocks
    const hSize = Math.floor(height / size) * size;
    const wSize = Math.floor(width / size) * size;

    for (let h1 = 0; h1 < hSize; h1 += size) {
      for (let w1 = 0; w1 < wSize; w1 += size) {
        const color = Math.floor(Math.random() * 255);

        for (let h2 = 0; h2 < size; h2 += 1) {
          for (let w2 = 0; w2 < size; w2 += 1) {
            const index = (h1 + h2) * width + w1 + w2;

            imageData.data[index * 4] = color;
            imageData.data[index * 4 + 1] = color;
            imageData.data[index * 4 + 2] = color;
            imageData.data[index * 4 + 3] = 255;
          }
        }
      }
    }

    context.clearRect(0, 0, width, height);
    context.putImageData(imageData, 0, 0);
  }, [canvasRef, sizeRef, size, res, ims]);

  return (
    <Viewer title="Block">
      <Canvas width={width} height={height} ref={canvasRef} />
      <div style={{ display: 'flex' }}>
        <input
          ref={sizeRef}
          type="range"
          min="0"
          max={Math.min(width, height)}
          onChange={handleSizeChange}
        />
        <span>
          {size}*{size}
        </span>
      </div>
    </Viewer>
  );
}

export default BlockViewer;
