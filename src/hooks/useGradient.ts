import { useEffect, useState } from 'react';

interface GradientProps {
  width: number;
  height: number;
}

export function useHorizontalGradient({ width, height }: GradientProps) {
  const [re, setRe] = useState<number[]>(null);
  const [im, setIm] = useState<number[]>(null);

  useEffect(() => {
    const canvas = document.createElement('canvas');

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    const graident = context.createLinearGradient(0, 0, width, 0);

    graident.addColorStop(0, 'black');
    graident.addColorStop(0.1, 'white');
    graident.addColorStop(0.2, 'black');
    graident.addColorStop(0.3, 'white');
    graident.addColorStop(0.4, 'black');
    graident.addColorStop(0.5, 'white');
    graident.addColorStop(0.6, 'black');
    graident.addColorStop(0.7, 'white');
    graident.addColorStop(0.8, 'black');
    graident.addColorStop(0.9, 'white');
    graident.addColorStop(1, 'black');
    context.fillStyle = graident;
    context.fillRect(0, 0, width, height);

    const { data } = context.getImageData(0, 0, width, height);

    setRe(Array.from(data.filter((_, i) => i % 4 === 0)));
    setIm(new Array(width * height).fill(0));

    return () => {
      setRe(null);
      setIm(null);
    };
  }, [width, height]);
  return [re, im];
}
