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
  mergeBits,
  TrasnformAlgorithm,
  grayscaleBlock,
  GrayscaleAlgorithm,
} from '../../stego';
import { CanvasProps } from '../../types';
import Checkbox from '../../components/Checkbox';
import { clamp } from '../../helpers';

function RGBViewer({ width, height, res, ims, algorithm }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [useRandom, setUseRandom] = useState(false);
  const [useGrayscale, setUseGrayscale] = useState(false);
  const [text, setText] = useState('text');
  const [pwd, setPwd] = useState('password');
  const [clip, setClip] = useState(15);
  const [error, setError] = useState('');
  const [noc, setNoc] = useState(5); // num of copies
  const [sob, setSob] = useState(8); // size of blocks
  const [sot, setSot] = useState(16); // size of tolerance

  const handleTextChange = useCallback(
    ({ currentTarget }: ChangeEvent<HTMLInputElement>) =>
      setText(currentTarget.value),
    []
  );
  const handleCopiesChange = useCallback(
    ({ currentTarget }: ChangeEvent<HTMLInputElement>) =>
      setNoc(clamp(parseInt(currentTarget.value, 10), 1, 9)),
    []
  );
  const handlePwdChange = useCallback(
    ({ currentTarget }: ChangeEvent<HTMLInputElement>) =>
      setPwd(currentTarget.value),
    []
  );
  const handleClipChange = useCallback(
    ({ currentTarget }: ChangeEvent<HTMLInputElement>) =>
      setClip(clamp(parseInt(currentTarget.value, 10), 0, 50)),
    []
  );

  const handleToleranceChange = useCallback(
    ({ currentTarget }: ChangeEvent<HTMLInputElement>) =>
      setSot(clamp(parseInt(currentTarget.value, 10), 0, 128)),
    []
  );
  const handleSizeChange = useCallback(
    ({ currentTarget }: ChangeEvent<HTMLInputElement>) =>
      setSob(clamp(parseInt(currentTarget.value, 10), 2, 256)),
    []
  );
  const handleRandomCheckboxChange = useCallback(
    () => setUseRandom(!useRandom),
    [useRandom]
  );
  const handleGrayscaleCheckboxChange = useCallback(
    () => setUseGrayscale(!useGrayscale),
    [useGrayscale]
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

    let j = 0; // current bit position
    const length = rReBlocks.length;
    const reChannels = [rReBlocks, gReBlocks, bReBlocks];
    const imChannels = [rImBlocks, gImBlocks, bImBlocks];

    if (process.env.NODE_ENV === 'development') {
      console.log('write:');
      console.log(bits);
    }

    for (let i = 0; i < length; i += 1) {
      if (useGrayscale) {
        grayscaleBlock(
          rReBlocks[i],
          gReBlocks[i],
          bReBlocks[i],
          GrayscaleAlgorithm.AVERAGE,
          {
            clip,
            shades: 2,
          }
        );
      }
      for (let c = 0; c < 3; c += 1) {
        setBit(
          reChannels[c][i],
          imChannels[c][i],
          bits.slice(j, j + 1),
          useRandom ? pwd : '',
          i,
          c,
          sob,
          sot,
          algorithm
        );
        setImage(reChannels[c][i], imageData, i, sob, c);
        j += 1;
      }
    }

    // draw
    context.putImageData(imageData, 0, 0);
  }, [
    canvasRef,
    res,
    ims,
    text,
    pwd,
    noc,
    sob,
    sot,
    clip,
    useRandom,
    useGrayscale,
  ]);

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

    const bits: number[] = [];
    const length = rReBlocks.length;
    const reChannels = [rReBlocks, gReBlocks, bReBlocks];
    const imChannels = [rImBlocks, gImBlocks, bImBlocks];

    for (let i = 0; i < length; i += 1) {
      for (let c = 0; c < 3; c += 1) {
        bits.push(
          getBit(
            reChannels[c][i],
            imChannels[c][i],
            useRandom ? pwd : '',
            i,
            c,
            sob,
            sot,
            algorithm
          )
        );
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('read:');
      console.log(bits);
    }

    // update text
    setText(bits2str(bits, noc));
  }, [canvasRef, res, ims, pwd, noc, sob, sot, useRandom]);

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
    <Viewer title={algorithm}>
      <Canvas width={width} height={height} ref={canvasRef} />
      <Input
        label="Message:"
        type="text"
        placeholder="Message"
        value={text}
        onChange={handleTextChange}
      />
      {useRandom ? (
        <Input
          label="Password:"
          placeholder="Number of copies"
          value={pwd}
          onChange={handlePwdChange}
        />
      ) : null}
      {useGrayscale ? (
        <Input
          label="Clip:"
          type="number"
          min="0"
          max="50"
          placeholder="0 -50"
          value={clip}
          onChange={handleClipChange}
        />
      ) : null}
      <Input
        label="Tolerance:"
        type="number"
        min="0"
        max="128"
        placeholder="Size of tolerance"
        value={sot}
        onChange={handleToleranceChange}
      />
      <Input
        label="Size:"
        type="number"
        min="2"
        max="256"
        placeholder="Size of blocks"
        value={sob}
        onChange={handleSizeChange}
      />
      <Input
        label="Copies:"
        type="number"
        min="1"
        max="9"
        placeholder="Number of copies"
        value={noc}
        onChange={handleCopiesChange}
      />
      <button onClick={handleWriteButtonClick}>Write</button>
      <button onClick={handleReadButtonClick}>Read</button>
      {error ? <span style={{ color: 'red' }}>{error}</span> : null}
      {algorithm === TrasnformAlgorithm.FFT1D ? (
        <Checkbox
          label="Use Random Block"
          checked={useRandom}
          onChange={handleRandomCheckboxChange}
        />
      ) : null}
      {algorithm === TrasnformAlgorithm.FFT2D ? (
        <Checkbox
          label="Use Grayscale"
          checked={useGrayscale}
          onChange={handleGrayscaleCheckboxChange}
        />
      ) : null}
    </Viewer>
  );
}

export default RGBViewer;
