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
  TrasnformAlgorithm,
  mergeBits,
  generateBits,
  yuvBlocks,
  rgbBlocks,
  bits2str,
} from '../../stego';
import { CanvasProps } from '../../types';

function YUVViewer({ width, height, res, ims }: CanvasProps) {
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

    const yReBlocks = divideBlocks(width, height, sob, res[3]);
    const uReBlocks = divideBlocks(width, height, sob, res[4]);
    const vReBlocks = divideBlocks(width, height, sob, res[5]);
    const yImBlocks = divideBlocks(width, height, sob, ims[3]);
    const uImBlocks = divideBlocks(width, height, sob, ims[4]);
    const vImBlocks = divideBlocks(width, height, sob, ims[5]);

    const messageBits = str2bits(text, noc);

    if (messageBits.length + 8 * noc > yReBlocks.length * 3) {
      setError('shrink message or reduce copies');
      return;
    }

    const bits = mergeBits(
      generateBits(yReBlocks.length * 3),
      messageBits,
      generateBits(8 * noc).fill(1)
    );

    const context = canvasRef.current.getContext('2d');
    const imageData = context.getImageData(0, 0, width, height);

    let j = 0;

    for (let i = 0; i < yReBlocks.length; i += 1) {
      yuvBlocks(yReBlocks[i], uReBlocks[i], vReBlocks[i]); // convert rgb blocks to yuv blocks
      setBit(
        yReBlocks[i],
        yImBlocks[i],
        bits.slice(j, j + 1),
        i,
        sob,
        sot,
        TrasnformAlgorithm.FDCT8
      );
      j += 1;

      setBit(
        uReBlocks[i],
        uImBlocks[i],
        bits.slice(j, j + 1),
        i,
        sob,
        sot,
        TrasnformAlgorithm.FDCT8
      );
      j += 1;

      setBit(
        vReBlocks[i],
        vImBlocks[i],
        bits.slice(j, j + 1),
        i,
        sob,
        sot,
        TrasnformAlgorithm.FDCT8
      );
      j += 1;

      rgbBlocks(yReBlocks[i], uReBlocks[i], vReBlocks[i]); // convert yuv blocks to rgb blocks
      setImage(yReBlocks[i], imageData, i, sob, 0);
      setImage(uReBlocks[i], imageData, i, sob, 1);
      setImage(vReBlocks[i], imageData, i, sob, 2);
    }

    // draw
    context.putImageData(imageData, 0, 0);
  }, [canvasRef, res, ims, text, noc, sob, sot]);

  const handleReadButtonClick = useCallback(() => {
    if (!canvasRef.current || !res || !ims || !res.length || !ims.length) {
      return;
    }

    const yReBlocks = divideBlocks(width, height, sob, res[0]);
    const uReBlocks = divideBlocks(width, height, sob, res[1]);
    const vReBlocks = divideBlocks(width, height, sob, res[2]);
    const yImBlocks = divideBlocks(width, height, sob, ims[0]);
    const uImBlocks = divideBlocks(width, height, sob, ims[1]);
    const vImBlocks = divideBlocks(width, height, sob, ims[2]);

    const bits = [];

    for (let i = 0; i < yReBlocks.length; i += 1) {
      yuvBlocks(yReBlocks[i], uReBlocks[i], vReBlocks[i]);
      bits.push(
        getBit(
          yReBlocks[i],
          yImBlocks[i],
          i,
          sob,
          sot,
          TrasnformAlgorithm.FDCT8
        )
      );
      bits.push(
        getBit(
          uReBlocks[i],
          uImBlocks[i],
          i,
          sob,
          sot,
          TrasnformAlgorithm.FDCT8
        )
      );
      bits.push(
        getBit(
          vReBlocks[i],
          vImBlocks[i],
          i,
          sob,
          sot,
          TrasnformAlgorithm.FDCT8
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
    <Viewer title="YUV">
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

export default YUVViewer;
