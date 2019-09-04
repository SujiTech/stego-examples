import FFT from '../fft';

export function divideIntoBlocks(
  width: number,
  height: number,
  size: number,
  data: number[]
) {
  const blocks: number[][] = [];

  for (let h = 0; h < height; h += size) {
    for (let w = 0; w < width; w += size) {
      const block: number[] = [];

      for (let h1 = 0; h1 < size; h1 += 1) {
        for (let w1 = 0; w1 < size; w1 += 1) {
          if (h + h1 < height && w + w1 < width) {
            block[h1 * size + w1] = data[(h + h1) * width + w + w1];
          } else {
            break;
          }
        }
      }
      if (block.length === size * size) {
        blocks.push(block);
      }
    }
  }
  return blocks;
}

export function str2bits(text: string): number[] {
  return text.split('').reduce(
    (acc: number[], c) =>
      [
        ...acc,
        ...encodeURI(c)
          .split('')
          .map(p => {
            const rtn: number[] = [];
            let reminder = 0;
            let code = p.charCodeAt(0);

            do {
              reminder = code % 2;
              rtn.push(reminder);
              code = code - Math.floor(code / 2) - reminder;
            } while (code > 1);
            rtn.push(code);
            while (rtn.length < 8) {
              rtn.push(0);
            }
            return rtn.reverse();
          }),
      ].flat(),
    []
  );
}

export function bits2str(bits: number[]) {
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
  return chars.join('');
}

export function generateRandomBits(length: number) {
  const bits = Array.from(new Array(length)).fill(false);

  for (let i = 0; i < length / 2; i += 1) {
    bits[i] = Math.floor(Math.random() * 2);
  }
  return bits;
}

export function setBit(
  reBlock: number[],
  imBlock: number[],
  bit: number[],
  index: number,
  size: number,
  tolerance: number
) {
  FFT.init(size);
  FFT.fft1d(reBlock, imBlock);

  const i = 0;
  // const i = Math.floor((size * size) / 2);
  // const i = 0;
  const v = Math.floor(reBlock[i] / tolerance);

  if (bit[0]) {
    reBlock[i] = v % 2 === 1 ? v * tolerance : (v + 1) * tolerance;
  } else {
    reBlock[i] = v % 2 === 1 ? (v - 1) * tolerance : v * tolerance;
  }
  FFT.ifft1d(reBlock, imBlock);
  return reBlock[i];
}

export function getBit(
  reBlock: number[],
  imBlock: number[],
  index: number,
  size: number,
  tolerance: number
) {
  const i = 0;
  // const i = Math.floor((size * size) / 2);
  // const i = 0;

  FFT.init(size);
  FFT.fft1d(reBlock, imBlock);
  return Math.round(reBlock[i] / tolerance) % 2;
}

function clamp(v: number, min: number, max: number) {
  if (v < min) {
    console.log('clamp min');
    return min;
  }
  if (v > max) {
    console.log('clamp max');
    return max;
  }
  return v;
}

export function setImage(
  block: number[],
  imageData: ImageData,
  index: number,
  size: number,
  offset: number
) {
  // const complement = block.reduce((acc, i) => (i > acc ? i : acc), 0) - 255;
  const max = block.reduce((acc, i) => (i > acc ? i : acc), 0);
  const { width } = imageData;
  const h1 = Math.floor(index / Math.floor(width / size)) * size;
  const w1 = (index % Math.floor(width / size)) * size;

  for (let i = 0; i < block.length; i += 1) {
    const h2 = Math.floor(i / size);
    const w2 = i % size;

    imageData.data[((h1 + h2) * width + w1 + w2) * 4 + offset] = Math.round(
      (block[i] * 255) / max
    );
    imageData.data[((h1 + h2) * width + w1 + w2) * 4 + offset] = clamp(
      Math.round(block[i]),
      0,
      255
    );
    // imageData.data[((h1 + h2) * width + w1 + w2) * 4 + offset] =
    //   complement > 0 ? block[i] - complement : block[i];
  }
}
