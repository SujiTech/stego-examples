import React, { useState, useRef, useEffect } from 'react';
import Viewer from '../components/Viewer';
import { CanvasProps } from '../types';
import Checkbox from '../components/Checkbox';
import Canvas from '../components/Canvas';
import Input from '../components/Input';
import { GrayscaleAlgorithm, grayscale } from '../stego';

function GrayscaleViewer({ width, height, res, ims }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [clip, setClip] = useState(5);
  const [shades, setShades] = useState(2);
  const [diagramUrl, setDiagramUrl] = useState<string>('');
  const [algorithm, setAlgorithm] = useState<GrayscaleAlgorithm>(
    GrayscaleAlgorithm.AVERAGE
  );

  useEffect(() => {
    if (!canvasRef.current || !res || !res.length) {
      return;
    }

    // convert to gray range [0-256)
    const grays = new Set<number>();
    const context = canvasRef.current.getContext('2d');
    const imageData = context.getImageData(0, 0, width, height);
    const length = width * height;

    for (let i = 0; i < length; i += 1) {
      const gray = grayscale(res[0][i], res[1][i], res[2][i], algorithm, {
        clip,
        shades,
      });

      grays.add(gray);
      imageData.data[i * 4] = gray;
      imageData.data[i * 4 + 1] = gray;
      imageData.data[i * 4 + 2] = gray;
      imageData.data[i * 4 + 3] = 255;
    }

    setDiagramUrl(
      `https://image-charts.com/chart?chs=${width}x${height}&cht=bvs&chd=t:${
        grays.size
          ? Array.from(grays.values())
              .sort((a, b) => a - b)
              .map(v => Math.round((v * 101) / 256))
              .join(',')
          : []
      }`
    );

    // draw
    context.clearRect(0, 0, width, height);
    context.putImageData(imageData, 0, 0);
  }, [canvasRef, algorithm, res, clip, shades]);

  return (
    <Viewer title="Grayscale">
      <Canvas width={width} height={height} ref={canvasRef} />
      {diagramUrl ? <img src={diagramUrl} /> : null}
      <Input
        type="number"
        label="Colors to be clipped"
        placeholder="0 - 50"
        max="50"
        min="0"
        defaultValue="5"
        onChange={({ currentTarget }) =>
          setClip(parseInt(currentTarget.value, 10))
        }
      />
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
