import { useEffect, useCallback, useState } from 'react';
import { rgb2yuv } from '../helpers';

interface ImageProps {
  width: number;
  height: number;
  url: string;
}

export function useImage({ width, height, url }: ImageProps) {
  const [re, setRe] = useState<number[][]>([]);
  const [im, setIm] = useState<number[][]>([]);
  const onLoad = useCallback((ev: Event) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = width;
    canvas.height = height;
    context.drawImage(
      ev.currentTarget as HTMLImageElement,
      0,
      0,
      width,
      height
    );

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

    setRe([rChannel, gChannel, bChannel, yChannel, cbChannel, crChannel]);
    setIm([
      new Array(width * height).fill(0),
      new Array(width * height).fill(0),
      new Array(width * height).fill(0),
      new Array(width * height).fill(0),
      new Array(width * height).fill(0),
      new Array(width * height).fill(0),
    ]);
  }, []);

  useEffect(() => {
    const image = new Image();

    image.addEventListener('load', onLoad);
    image.src = url;
  }, [url]);
  return [re, im];
}
