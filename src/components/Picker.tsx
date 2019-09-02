import React, { useRef, useCallback } from 'react';
import { rgb2yuv } from '../helpers';

export interface PickerProps {
  onChange(data: PickerData): void;
}

export interface PickerData {
  width: number;
  height: number;
  res: number[][];
  ims: number[][];
}

function Picker({ onChange }: PickerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const handleFileChange = useCallback(() => {
    if (!canvasRef.current || !fileRef.current) {
      return;
    }

    const reader = new FileReader();

    reader.addEventListener('load', ({ target }) => {
      const data = target.result as string;
      const image = new Image();

      image.addEventListener('load', () => {
        const context = canvasRef.current.getContext('2d');
        const { width, height } = image;

        canvasRef.current.width = width;
        canvasRef.current.height = height;
        context.drawImage(image, 0, 0, width, height);

        const { data } = context.getImageData(0, 0, width, height);
        const rChannel = Array.from(data.filter((_, i) => i % 4 === 0));
        const gChannel = Array.from(data.filter((_, i) => i % 4 === 1));
        const bChannel = Array.from(data.filter((_, i) => i % 4 === 2));
        const yChannel = [];
        const cbChannel = [];
        const crChannel = [];

        for (let i = 0; i < data.length / 4; i += 1) {
          const [y, cb, cr] = rgb2yuv(
            data[i * 4],
            data[i * 4 + 1],
            data[i * 4 + 2]
          );

          yChannel.push(y);
          cbChannel.push(cb);
          crChannel.push(cr);
        }

        onChange({
          width,
          height,
          res: [rChannel, gChannel, bChannel, yChannel, cbChannel, crChannel],
          ims: [
            new Array(width * height).fill(0),
            new Array(width * height).fill(0),
            new Array(width * height).fill(0),
            new Array(width * height).fill(0),
            new Array(width * height).fill(0),
            new Array(width * height).fill(0),
          ],
        });
      });
      image.src = data;
    });
    reader.readAsDataURL(fileRef.current.files[0]);
  }, []);

  // useEffect(() => {
  //   if (!canvasRef.current) {
  //     return;
  //   }

  //   onChange({
  //     width: 0,
  //     height: 0,
  //     res: [],
  //     ims: [],
  //   });
  // }, [canvasRef]);
  return (
    <>
      <canvas style={{ display: 'none' }} ref={canvasRef} />
      <input ref={fileRef} type="file" onChange={handleFileChange} />
    </>
  );
}

export default Picker;
