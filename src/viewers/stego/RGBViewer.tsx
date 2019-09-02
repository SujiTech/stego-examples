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
import Input from '../../components/Input';
import { divideIntoBlocks, convertToBits } from '../../stego';
import { CanvasProps } from '../../types';
import FFT from '../../fft';

function SteganographyViewer({ width, height, res, ims }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [text, setText] = useState('');
  const [noc, setNoc] = useState(1); // num of copies
  const [useR, setUseR] = useState(true);
  const [useG, setUseG] = useState(true);
  const [useB, setUseB] = useState(true);
  const handleTextChange = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
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
        }
      };
    },
    [useR, useG, useB]
  );
  const handleCopiesChange = useCallback(
    ({ currentTarget }: ChangeEvent<HTMLInputElement>) => {
      setNoc(parseInt(currentTarget.value, 10));
    },
    [canvasRef, res, ims, useR, useG, useG]
  );
  const handleWriteButtonClick = useCallback(() => {
    if (
      !canvasRef.current ||
      !res ||
      !ims ||
      !res.length ||
      !ims.length ||
      !text
    ) {
      return;
    }

    console.log(convertToBits(text));
  }, [canvasRef, res, ims, useR, useG, useG, text]);
  const handleReadButtonClick = useCallback(() => {}, []);

  return (
    <Viewer title="Stego RGB">
      <Canvas width={width} height={height} ref={canvasRef} />
      <Input
        label="Message:"
        type="text"
        placeholder="Message"
        value={text}
        onChange={handleTextChange}
      />
      <Input
        label="Copies:"
        type="number"
        min="1"
        placeholder="Number of copies"
        value={noc}
        onChange={handleCopiesChange}
      />

      <button onClick={handleWriteButtonClick}>Write</button>
      <button onClick={handleReadButtonClick}>Read</button>
      <Checkbox label="R" checked={useR} onChange={handleCheckboxChange('R')} />
      <Checkbox label="G" checked={useG} onChange={handleCheckboxChange('G')} />
      <Checkbox label="B" checked={useB} onChange={handleCheckboxChange('B')} />
    </Viewer>
  );
}

export default SteganographyViewer;
