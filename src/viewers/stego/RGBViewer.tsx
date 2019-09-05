import React, {
  useRef,
  useState,
  useCallback,
  ChangeEvent,
  useEffect,
} from 'react';
import Viewer from '../../components/Viewer';
import Canvas from '../../components/Canvas';
import Input from '../../components/Input';
import {
  divideBlocks,
  str2bits,
  setBit,
  setImage,
  getBit,
  bits2str,
  generateBits,
  readBits,
  mergeBits,
  TrasnformAlgorithm,
} from '../../stego';
import { CanvasProps } from '../../types';

function RGBViewer({ width, height, res, ims }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [text, setText] = useState('hello');
  const [error, setError] = useState('');
  const [noc, setNoc] = useState(5); // num of copies
  const [sob, setSob] = useState(8); // size of blocks
  const [sot, setSot] = useState(16); // size of tolerance

  const handleTextChange = useCallback(
    ({ currentTarget }: ChangeEvent<HTMLInputElement>) => {
      setText(currentTarget.value);
    },
    []
  );
  const handleCopiesChange = useCallback(
    ({ currentTarget }: ChangeEvent<HTMLInputElement>) => {
      setNoc(parseInt(currentTarget.value, 10));
    },
    []
  );
  const handleToleranceChange = useCallback(
    ({ currentTarget }: ChangeEvent<HTMLInputElement>) => {
      setSot(parseInt(currentTarget.value, 10));
    },
    []
  );
  const handleSizeChange = useCallback(
    ({ currentTarget }: ChangeEvent<HTMLInputElement>) => {
      setSob(parseInt(currentTarget.value, 10));
    },
    []
  );

  const handleWriteButtonClick = useCallback(() => {
    setError('');

    if (!canvasRef.current || !res || !ims || !res.length || !ims.length) {
      setError('pls choose an image');
      return;
    }
    if (!text) {
      setError('pls enter a message');
      return;
    }
    if (noc < 1) {
      setError('at least one copy');
      return;
    }

    const rReBlocks = divideBlocks(width, height, sob, res[0]);
    const gReBlocks = divideBlocks(width, height, sob, res[1]);
    const bReBlocks = divideBlocks(width, height, sob, res[2]);
    const rImBlocks = divideBlocks(width, height, sob, ims[0]);
    const gImBlocks = divideBlocks(width, height, sob, ims[1]);
    const bImBlocks = divideBlocks(width, height, sob, ims[2]);

    const messageBits = str2bits(text, noc);

    if (messageBits.length + 8 * noc > rReBlocks.length * 3) {
      setError('shrink message or reduce copies');
      return;
    }

    const bits = mergeBits(
      generateBits(rReBlocks.length * 3),
      messageBits, // message
      generateBits(8 * noc).fill(1) // end of message
    );

    const context = canvasRef.current.getContext('2d');
    const imageData = context.getImageData(0, 0, width, height);

    let j = 0;

    for (let i = 0; i < rReBlocks.length; i += 1) {
      setBit(
        rReBlocks[i],
        rImBlocks[i],
        bits.slice(j, j + 1),
        i,
        sob,
        sot,
        TrasnformAlgorithm.FFT1D
      );
      setImage(rReBlocks[i], imageData, i, sob, 0);
      j += 1;

      setBit(
        gReBlocks[i],
        gImBlocks[i],
        bits.slice(j, j + 1),
        i,
        sob,
        sot,
        TrasnformAlgorithm.FFT1D
      );
      setImage(gReBlocks[i], imageData, i, sob, 1);
      j += 1;

      setBit(
        bReBlocks[i],
        bImBlocks[i],
        bits.slice(j, j + 1),
        i,
        sob,
        sot,
        TrasnformAlgorithm.FFT1D
      );
      setImage(bReBlocks[i], imageData, i, sob, 2);
      j += 1;
    }

    // draw
    context.putImageData(imageData, 0, 0);
  }, [canvasRef, res, ims, text, noc, sob, sot]);

  const handleReadButtonClick = useCallback(() => {
    if (!canvasRef.current || !res || !ims || !res.length || !ims.length) {
      return;
    }

    const rReBlocks = divideBlocks(width, height, sob, res[0]);
    const gReBlocks = divideBlocks(width, height, sob, res[1]);
    const bReBlocks = divideBlocks(width, height, sob, res[2]);
    const rImBlocks = divideBlocks(width, height, sob, ims[0]);
    const gImBlocks = divideBlocks(width, height, sob, ims[1]);
    const bImBlocks = divideBlocks(width, height, sob, ims[2]);

    const bits = [];

    for (let i = 0; i < rReBlocks.length; i += 1) {
      bits.push(
        getBit(
          rReBlocks[i],
          rImBlocks[i],
          i,
          sob,
          sot,
          TrasnformAlgorithm.FFT1D
        )
      );
      bits.push(
        getBit(
          gReBlocks[i],
          gImBlocks[i],
          i,
          sob,
          sot,
          TrasnformAlgorithm.FFT1D
        )
      );
      bits.push(
        getBit(
          bReBlocks[i],
          bImBlocks[i],
          i,
          sob,
          sot,
          TrasnformAlgorithm.FFT1D
        )
      );
    }

    // update text
    setText(bits2str(bits, noc));
  }, [canvasRef, res, ims, noc, sob, sot]);

  useEffect(() => {
    if (!canvasRef.current || !res || !ims || !res.length || !ims.length) {
      return;
    }

    const context = canvasRef.current.getContext('2d');
    const imageData = context.getImageData(0, 0, width, height);

    for (let h = 0; h < height; h += 1) {
      for (let w = 0; w < width; w += 1) {
        const index = (h * width + w) * 4;

        imageData.data[index] = res[0][h * width + w];
        imageData.data[index + 1] = res[1][h * width + w + 1];
        imageData.data[index + 2] = res[2][h * width + w + 2];
        imageData.data[index + 3] = 255;
      }
    }
    context.clearRect(0, 0, width, height);
    context.putImageData(imageData, 0, 0);
  }, [canvasRef, width, height, res, ims]);

  return (
    <Viewer title="RGB">
      <Canvas width={width} height={height} ref={canvasRef} />
      <Input
        label="Message:"
        type="text"
        placeholder="Message"
        value={text}
        onChange={handleTextChange}
      />
      <Input
        label="Tolerance:"
        type="number"
        min="16"
        placeholder="Size of tolerance"
        value={sot}
        onChange={handleToleranceChange}
      />
      <Input
        label="Size:"
        type="number"
        min="8"
        placeholder="Size of blocks"
        value={sob}
        onChange={handleSizeChange}
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
      {error ? <span style={{ color: 'red' }}>{error}</span> : null}
    </Viewer>
  );
}

export default RGBViewer;
