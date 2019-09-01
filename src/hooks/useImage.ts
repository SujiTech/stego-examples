import { useEffect, useCallback, useState } from 'react';

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

    setRe([
      Array.from(data.filter((_, i) => i % 4 === 0)),
      Array.from(data.filter((_, i) => i % 4 === 1)),
      Array.from(data.filter((_, i) => i % 4 === 2)),
    ]);
    setIm([
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
