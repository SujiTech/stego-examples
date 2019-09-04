import React, {
  useRef,
  useState,
  useCallback,
  ChangeEvent,
  useEffect,
} from 'react';
import Viewer from '../../components/Viewer';
import Canvas from '../../components/Canvas';
import Checkbox from '../../components/Checkbox';
import Input from '../../components/Input';
import {
  divideIntoBlocks,
  str2bits,
  setBit,
  setImage,
  getBit,
} from '../../stego';
import { CanvasProps } from '../../types';
import { yuv2rgb } from '../../helpers';

function SteganographyViewer({ width, height, res, ims }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [text, setText] = useState('');
  const [noc, setNoc] = useState(0); // num of copies
  const [sob, setSob] = useState(8); // size of blocks
  const [sot, setSot] = useState(16); // size of tolerance
  const [useY, setUseY] = useState(true);
  const [useU, setUseU] = useState(true);
  const [useV, setUseV] = useState(true);
  const handleTextChange = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
    setText(ev.currentTarget.value);
  }, []);
  const handleCheckboxChange = useCallback(
    (channel: 'Y' | 'U' | 'V') => {
      return () => {
        switch (channel) {
          case 'Y':
            setUseY(!useY);
            break;
          case 'U':
            setUseU(!useU);
            break;
          case 'V':
            setUseV(!useV);
            break;
        }
      };
    },
    [useY, useU, useV]
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

    const context = canvasRef.current.getContext('2d');
    const imageData = context.getImageData(0, 0, width, height);
    const bits = str2bits(text);
    const yReBlocks = divideIntoBlocks(width, height, sob, res[3]);
    const uReBlocks = divideIntoBlocks(width, height, sob, res[4]);
    const vReBlocks = divideIntoBlocks(width, height, sob, res[5]);
    const yImBlocks = divideIntoBlocks(width, height, sob, ims[3]);
    const uImBlocks = divideIntoBlocks(width, height, sob, ims[4]);
    const vImBlocks = divideIntoBlocks(width, height, sob, ims[5]);

    let j = 0;
    const BITS_PER_BLOCK = 1;

    for (let i = 0; i < yReBlocks.length && j < bits.length; i += 1) {
      const yReBlock = yReBlocks[i];
      const yImBlock = yImBlocks[i];
      const uReBlock = uReBlocks[i];
      const uImBlock = uImBlocks[i];
      const vReBlock = vReBlocks[i];
      const vImBlock = vImBlocks[i];

      setBit(yReBlock, yImBlock, bits.slice(j++, BITS_PER_BLOCK), sob, sot);
      setBit(uReBlock, uImBlock, bits.slice(j++, BITS_PER_BLOCK), sob, sot);
      setBit(vReBlock, vImBlock, bits.slice(j++, BITS_PER_BLOCK), sob, sot);
    }

    for (let i = 0; i < yReBlocks.length; i += 1) {
      const y = yReBlocks[i][Math.floor((sob * sob) / 2)];
      const u = uReBlocks[i][Math.floor((sob * sob) / 2)];
      const v = vReBlocks[i][Math.floor((sob * sob) / 2)];

      const [r, g, b] = yuv2rgb(y, u, v);
    }

    // draw
    context.putImageData(imageData, 0, 0);
  }, [canvasRef, res, ims, useY, useU, useU, text, noc, sob, sot]);
  const handleReadButtonClick = useCallback(() => {
    if (!canvasRef.current || !res || !ims || !res.length || !ims.length) {
      return;
    }

    const context = canvasRef.current.getContext('2d');
    const imageData = context.getImageData(0, 0, width, height);

    const yReBlocks = divideIntoBlocks(width, height, sob, res[0]);
    const uReBlocks = divideIntoBlocks(width, height, sob, res[1]);
    const vReBlocks = divideIntoBlocks(width, height, sob, res[2]);
    const yImBlocks = divideIntoBlocks(width, height, sob, ims[0]);
    const uImBlocks = divideIntoBlocks(width, height, sob, ims[1]);
    const vImBlocks = divideIntoBlocks(width, height, sob, ims[2]);

    let bits = [];
    const BITS_PER_BLOCK = 1;

    for (let i = 0; i < yReBlocks.length; i += 1) {
      if (useY) {
        const rReBlock = yReBlocks[i];
        const rImBlock = yImBlocks[i];

        bits.push(getBit(rReBlock, rImBlock, sob, sot));
      }
      if (useU) {
        const gReBlock = uReBlocks[i];
        const gImBlock = uImBlocks[i];

        bits.push(getBit(gReBlock, gImBlock, sob, sot));
      }
      if (useV) {
        const bReBlock = vReBlocks[i];
        const bImBlock = vImBlocks[i];

        bits.push(getBit(bReBlock, bImBlock, sob, sot));
      }
    }

    let k = 128;
    const chars = [];

    for (let i = 0; i < bits.length; i += 8) {
      let temp = 0;

      for (let j = 0; j < 8; j += 1, k /= 2) {
        temp += bits[i + j] * k;
      }
      k = 128;
      chars.push(String.fromCharCode(temp));
    }

    // draw
    context.putImageData(imageData, 0, 0);
  }, [canvasRef, res, ims, useY, useU, useU, noc, sob, sot]);

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
  }, [canvasRef, width, height, res, ims, useY, useU, useV]);

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
      <Checkbox label="Y" checked={useY} onChange={handleCheckboxChange('Y')} />
      <Checkbox label="U" checked={useU} onChange={handleCheckboxChange('U')} />
      <Checkbox label="V" checked={useV} onChange={handleCheckboxChange('V')} />
    </Viewer>
  );
}

export default SteganographyViewer;
