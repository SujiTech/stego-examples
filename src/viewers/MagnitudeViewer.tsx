import React, {
  useRef,
  useEffect,
  useCallback,
  useState,
  ChangeEvent,
} from 'react';
import Viewer from '../components/Viewer';
import Canvas from '../components/Canvas';
import Checkbox from '../components/Checkbox';
import { CanvasProps } from '../types';
import FFT from '../fft';

function MagnitudeViewer({ width, height, res, ims }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [useR, setUseR] = useState(true);
  const [useG, setUseG] = useState(false);
  const [useB, setUseB] = useState(false);
  const [useY, setUseY] = useState(false);
  const [useCb, setUseCb] = useState(false);
  const [useCr, setUseVCr] = useState(false);
  const [useLog, setUseLog] = useState(true);
  const [useTransform, setUseTransform] = useState(true);
  const handleColorCheckboxChange = useCallback(
    (channel: 'R' | 'G' | 'B' | 'Y' | 'Cb' | 'Cr') => {
      return () => {
        switch (channel) {
          case 'R':
            setUseR(true);
            setUseG(false);
            setUseB(false);
            setUseY(false);
            setUseCb(false);
            setUseVCr(false);
            break;
          case 'G':
            setUseR(false);
            setUseG(true);
            setUseB(false);
            setUseY(false);
            setUseCb(false);
            setUseVCr(false);
            break;
          case 'B':
            setUseR(false);
            setUseG(false);
            setUseB(true);
            setUseY(false);
            setUseCb(false);
            setUseVCr(false);
            break;
          case 'Y':
            setUseR(false);
            setUseG(false);
            setUseB(false);
            setUseY(true);
            setUseCb(false);
            setUseVCr(false);
            break;
          case 'Cb':
            setUseR(false);
            setUseG(false);
            setUseB(false);
            setUseY(false);
            setUseCb(true);
            setUseVCr(false);
            break;
          case 'Cr':
            setUseR(false);
            setUseG(false);
            setUseB(false);
            setUseY(false);
            setUseCb(false);
            setUseVCr(true);
            break;
        }
      };
    },
    [useR, useG, useB, useY, useCb, useCr]
  );
  const handleLogCheckboxChange = useCallback(
    (ev: ChangeEvent<HTMLInputElement>) => {
      setUseLog(!useLog);
    },
    [useLog]
  );
  const handleTransformCheckboxChange = useCallback(
    (ev: ChangeEvent<HTMLInputElement>) => {
      setUseTransform(!useTransform);
    },
    [useTransform]
  );

  useEffect(() => {
    if (!canvasRef.current || !res || !ims || !res.length || !ims.length) {
      return;
    }

    const re = (() => {
      if (useR) {
        return res[0];
      }
      if (useG) {
        return res[1];
      }
      if (useB) {
        return res[2];
      }
      if (useY) {
        return res[3];
      }
      if (useCb) {
        return res[4];
      }
      return res[5];
    })().slice();
    const im = (() => {
      if (useR) {
        return ims[0];
      }
      if (useG) {
        return ims[1];
      }
      if (useB) {
        return ims[2];
      }
      if (useY) {
        return res[3];
      }
      if (useCb) {
        return res[4];
      }
      return res[5];
    })().slice();

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

    // A | D
    // B | C
    //
    // C | B
    // D | A
    if (useTransform) {
      const halfHeight = Math.floor(height / 2);
      const halfWidth = Math.floor(width / 2);

      for (let h = 0; h < halfHeight; h += 1) {
        for (let w = 0; w < width; w += 1) {
          const index = (h * width + w) * 4;
          const flippedIndex =
            (w <= halfWidth
              ? (h + halfHeight) * width + w + halfWidth
              : (h + halfHeight) * width + w - halfWidth) * 4;

          const tempR = imageData.data[index];
          const tempG = imageData.data[index + 1];
          const tempB = imageData.data[index + 2];

          imageData.data[index] = imageData.data[flippedIndex];
          imageData.data[index + 1] = imageData.data[flippedIndex + 1];
          imageData.data[index + 2] = imageData.data[flippedIndex + 2];

          imageData.data[flippedIndex] = tempR;
          imageData.data[flippedIndex + 1] = tempG;
          imageData.data[flippedIndex + 2] = tempB;
        }
      }
    }

    // draw the spectrum
    context.clearRect(0, 0, width, height);
    context.putImageData(imageData, 0, 0);
  }, [
    canvasRef,
    ims,
    res,
    useLog,
    useTransform,
    useR,
    useG,
    useB,
    useY,
    useCb,
    useCr,
  ]);

  return (
    <Viewer title="Magnitude">
      <Canvas width={width} height={height} ref={canvasRef} />
      <Checkbox
        type="radio"
        label="R"
        checked={useR}
        onChange={handleColorCheckboxChange('R')}
      />
      <Checkbox
        type="radio"
        label="G"
        checked={useG}
        onChange={handleColorCheckboxChange('G')}
      />
      <Checkbox
        type="radio"
        label="B"
        checked={useB}
        onChange={handleColorCheckboxChange('B')}
      />
      <Checkbox
        type="radio"
        label="Y"
        checked={useY}
        onChange={handleColorCheckboxChange('Y')}
      />
      <Checkbox
        type="radio"
        label="Cb"
        checked={useCb}
        onChange={handleColorCheckboxChange('Cb')}
      />
      <Checkbox
        type="radio"
        label="Cr"
        checked={useCr}
        onChange={handleColorCheckboxChange('Cr')}
      />
      <Checkbox
        label="Use Log"
        checked={useLog}
        onChange={handleLogCheckboxChange}
      />
      <Checkbox
        label="Use Transform"
        checked={useTransform}
        onChange={handleTransformCheckboxChange}
      />
    </Viewer>
  );
}

export default MagnitudeViewer;
