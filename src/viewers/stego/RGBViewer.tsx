import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  ChangeEvent,
} from 'react';
import Viewer from '../../components/Viewer';
import Canvas from '../../components/Canvas';
import Checkbox from '../../components/Checkbox';
import { CanvasProps } from '../../types';
import FFT from '../../fft';

function SteganographyViewer({ width, height, res, ims }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [text, setText] = useState('');
  const [useR, setUseR] = useState(true);
  const [useG, setUseG] = useState(false);
  const [useB, setUseB] = useState(false);
  const [useY, setUseY] = useState(false);
  const [useCb, setUseCb] = useState(false);
  const [useCr, setUseCr] = useState(false);
  const handleInputChange = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
    setText(ev.currentTarget.value);
  }, []);
  const handleCheckboxChange = useCallback(
    (channel: 'R' | 'G' | 'B' | 'Y' | 'Cb' | 'Cr') => {
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
          case 'Y':
            setUseY(!useY);
            break;
          case 'Cr':
            setUseCr(!useCr);
            break;
          case 'Cb':
            setUseCb(!useCb);
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

    const selectedRes = (() => {
      const channels = [];

      if (useR) {
        channels.push(res[0]);
      }
      if (useG) {
        channels.push(res[1]);
      }
      if (useB) {
        channels.push(res[2]);
      }
      if (useY) {
        channels.push(res[3]);
      }
      if (useCb) {
        channels.push(res[4]);
      }
      if (useCr) {
        channels.push(res[5]);
      }
      return channels.map(c => c.slice());
    })();
    const selectedIms = (() => {
      const channels = [];

      if (useR) {
        channels.push(ims[0]);
      }
      if (useG) {
        channels.push(ims[1]);
      }
      if (useB) {
        channels.push(ims[2]);
      }
      if (useY) {
        channels.push(res[3]);
      }
      if (useCb) {
        channels.push(res[4]);
      }
      if (useCr) {
        channels.push(res[5]);
      }

      return channels.map(c => c.slice());
    })();

    selectedRes.forEach((_, index) => {
      const re = selectedRes[index];
      const im = selectedIms[index];

      FFT.init(width);
      FFT.fft2d(re, im);

      let maxAmplitude = Number.NEGATIVE_INFINITY;
      let amplitudes: number[] = [];

      for (let i = 0; i < width * height; i += 1) {
        re[i] += Math.round(Math.random() * 2000);
        im[i] += Math.round(Math.random() * 20000);

        const reVal = re[i];
        const imVal = im[i];
        const amplitude = Math.sqrt(reVal * reVal + imVal * imVal);

        if (amplitude > maxAmplitude) {
          maxAmplitude = amplitude + 200;
        }
        amplitudes.push(amplitude + 200);
      }

      // convert to gray range [0-256)
      const context = canvasRef.current.getContext('2d');
      const imageData = context.getImageData(0, 0, width, height);

      for (let i = 0; i < amplitudes.length; i += 1) {
        const index = i * 4;
        const color = Math.floor((amplitudes[i] * 256) / maxAmplitude) + 1;

        imageData.data[index] = color;
        imageData.data[index + 1] = color;
        imageData.data[index + 2] = color;
        imageData.data[index + 3] = 255;
      }

      // draw the spectrum
      context.clearRect(0, 0, width, height);
      context.putImageData(imageData, 0, 0);

      // revoke
      FFT.ifft2d(re, im);
    });
  }, [canvasRef, res, ims, useR, useG, useG, useY, useCb, useCr]);

  return (
    <Viewer title="Stego">
      <Canvas width={width} height={height} ref={canvasRef} />
      <input
        type="text"
        placeholder="Message to be written into the image"
        value={text}
        onChange={handleInputChange}
      />
      <Checkbox label="R" checked={useR} onChange={handleCheckboxChange('R')} />
      <Checkbox label="G" checked={useG} onChange={handleCheckboxChange('G')} />
      <Checkbox label="B" checked={useB} onChange={handleCheckboxChange('B')} />
      <Checkbox label="Y" checked={useY} onChange={handleCheckboxChange('Y')} />
      <Checkbox
        label="Cb"
        checked={useCb}
        onChange={handleCheckboxChange('Cb')}
      />
      <Checkbox
        label="Cr"
        checked={useCr}
        onChange={handleCheckboxChange('Cr')}
      />
    </Viewer>
  );
}

export default SteganographyViewer;
