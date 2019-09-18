import FFT from '../fft';
import { fastDct8, fastDctLee } from '../fast-dct';
import { hashCode, rgb2yuv, yuv2rgb, clamp } from '../helpers';
import { dct, idct } from '../dct';

export enum TrasnformAlgorithm {
  DCT2D = '2D-DCT',
  FDCT8 = 'FDCT8',
  FDCTLEE = 'FDCTLEE',
  FFT1D = '1D-FFT',
  FFT2D = '2D-FFT',
}

// more:
// http://www.tannerhelland.com/3643/grayscale-image-algorithm-vb6/
export enum GrayscaleAlgorithm {
  NONE = 'NONE',
  AVERAGE = 'AVG',
  LUMINANCE = 'LUMA',
  LUMINANCE_II = 'LUMA_II',
  DESATURATION = 'DESATURATION',
  MAX_DECOMPOSITION = 'MAX_DE',
  MIN_DECOMPOSITION = 'MIN_DE',
  MID_DECOMPOSITION = 'MID_DE',
  SIGNLE_R = 'R',
  SIGNLE_G = 'G',
  SIGNLE_B = 'B',
  SHADES = 'SHADES',
}

export interface GrayscaleOptions {
  clip: number;
  shades: number;
}

export function shiftBlock(block: number[]) {
  block.forEach((n, i) => {
    block[i] = n - 128;
  });
}

export function unshiftBlock(block: number[]) {
  block.forEach((n, i) => {
    block[i] = n + 128;
  });
}

export function grayscale(
  r: number,
  g: number,
  b: number,
  algorithm: GrayscaleAlgorithm,
  { clip, shades }: GrayscaleOptions
) {
  const factor = 255 / (clamp(shades, 2, 256) - 1);
  let gray = 0;

  switch (algorithm) {
    case GrayscaleAlgorithm.AVERAGE:
      gray = (r + g + b) / 3;
      break;
    case GrayscaleAlgorithm.LUMINANCE:
      gray = r * 0.3 + g * 0.59 + b * 0.11;
      break;
    case GrayscaleAlgorithm.LUMINANCE_II:
      gray = r * 0.2126 + g * 0.7152 + b * 0.0722;
      break;
    case GrayscaleAlgorithm.DESATURATION:
      gray = (Math.max(r, g, b) + Math.min(r, g, b)) / 2;
      break;
    case GrayscaleAlgorithm.MAX_DECOMPOSITION:
      gray = Math.max(r, g, b);
      break;
    case GrayscaleAlgorithm.MIN_DECOMPOSITION:
      gray = Math.min(r, g, b);
      break;
    case GrayscaleAlgorithm.MID_DECOMPOSITION:
      gray = [r, g, b].sort()[1];
      break;
    case GrayscaleAlgorithm.SIGNLE_R:
      gray = r;
      break;
    case GrayscaleAlgorithm.SIGNLE_G:
      gray = g;
      break;
    case GrayscaleAlgorithm.SIGNLE_B:
      gray = b;
      break;
    case GrayscaleAlgorithm.SHADES:
      gray = Math.floor((r + g + b) / 3 / factor + 0.5) * factor;
      break;
  }
  return clamp(Math.round(gray), clip, 255 - clip);
}

export function grayscaleBlock(
  rBlock: number[],
  gBlock: number[],
  bBlock: number[],
  algorithm: GrayscaleAlgorithm,
  options: GrayscaleOptions
) {
  const length = rBlock.length;

  for (let i = 0; i < length; i += 1) {
    const gray = grayscale(rBlock[i], gBlock[i], bBlock[i], algorithm, options);

    rBlock[i] = gray;
    gBlock[i] = gray;
    bBlock[i] = gray;
  }
}

export function yuvBlocks(b1: number[], b2: number[], b3: number[]) {
  for (let i = 0; i < b1.length; i += 1) {
    const r = b1[i];
    const g = b2[i];
    const b = b3[i];

    [b1[i], b2[i], b3[i]] = rgb2yuv(r, g, b);
  }
}

export function rgbBlocks(b1: number[], b2: number[], b3: number[]) {
  for (let i = 0; i < b1.length; i += 1) {
    const y = b1[i];
    const u = b2[i];
    const v = b3[i];

    [b1[i], b2[i], b3[i]] = yuv2rgb(y, u, v);
  }
}

let previousIndex = -1;
let previousPosition = -1;
let previousCode = '';

export function getDynamicPositionInBlock(
  algorithm: TrasnformAlgorithm,
  pwd: string,
  index: number,
  channel: number,
  size: number
) {
  // same position for every channels in same block
  if (previousIndex === index) {
    return previousPosition;
  }

  // reset env variables to initial value
  if (index === 0) {
    previousIndex = -1;
    previousPosition = -1;
    previousCode = '';
  }

  [previousPosition, previousCode] = hashCode(
    `${pwd}_${index}_${channel}_${previousCode}`,
    size * size - (size * size) / 4,
    []
  );
  previousIndex = index;

  const currentPosition = previousPosition + (size * size) / 4;

  previousPosition = currentPosition;
  return currentPosition;
}

export function getStaticPositionInBlock(
  algorithm: TrasnformAlgorithm,
  size: number
) {
  switch (algorithm) {
    case TrasnformAlgorithm.DCT2D:
      return 0;
    case TrasnformAlgorithm.FFT1D:
      return (size * size) / 2 + size / 2;
    case TrasnformAlgorithm.FFT2D:
      return 0;
    default:
      return size * size - 1; // right-bottom corner
  }
}

export function getPositionInBlock(
  algorithm: TrasnformAlgorithm,
  pwd: string,
  index: number,
  channel: number,
  size: number
) {
  return pwd && algorithm === TrasnformAlgorithm.FFT1D
    ? getDynamicPositionInBlock(algorithm, pwd, index, channel, size)
    : getStaticPositionInBlock(algorithm, size);
}

export function divideBlocks(
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

export function str2bits(text: string, copies: number): number[] {
  return text
    .split('')
    .reduce(
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
    )
    .reduce((acc, b) => {
      for (let i = 0; i < copies; i += 1) {
        acc.push(b);
      }
      return acc;
    }, []);
}

export function bits2str(bits: number[], copies: number) {
  let k = 128;
  let temp = 0;
  const chars: string[] = [];
  const candidates: number[] = [];
  const elect = () =>
    candidates.filter(c => c === 1).length >= copies / 2 ? 1 : 0;

  for (let i = 0; i < bits.length; i += 1) {
    candidates.push(bits[i]);

    if (candidates.length === copies) {
      temp += elect() * k;
      k /= 2;
      candidates.length = 0;

      // end of message
      if (temp === 255) {
        break;
      }
      if (k < 1) {
        chars.push(String.fromCharCode(temp));
        temp = 0;
        k = 128;
      }
    }
  }
  return decodeURI(chars.join(''));
}

export function generateBits(length: number) {
  const bits = Array.from(new Array(length));

  for (let i = 0; i < length; i += 1) {
    bits[i] = Math.floor(Math.random() * 2);
  }
  return bits;
}

export function writeBits(dest: number[], ...source: number[][]) {
  const inArray: number[] = [];
  let index;
  let code = '643575433';

  for (let i = 0; i < source.length; i += 1) {
    const bits = source[i];

    for (let j = 0; j < bits.length; j += 1) {
      [index, code] = hashCode(code, dest.length, inArray);
      dest[index] = bits[j];
    }
  }
  return dest;
}

export function readBits(dest: number[]) {
  const bits: number[] = [];
  const inArray: number[] = [];
  let index;
  let code = '643575433';

  for (let i = 0; i < dest.length; i += 1) {
    [index, code] = hashCode(code, dest.length, inArray);
    bits.push(dest[index]);
  }
  return bits;
}

export function mergeBits(dest: number[], ...source: number[][]) {
  let k = 0;

  for (let i = 0; i < source.length; i += 1) {
    const bits = source[i];

    for (let j = 0; j < bits.length && k < dest.length; j += 1, k += 1) {
      dest[k] = bits[j];
    }
  }
  return dest;
}

export function getBit(
  reBlock: number[],
  imBlock: number[],
  pwd: string,
  index: number,
  channel: number,
  size: number,
  tolerance: number,
  algorithm: TrasnformAlgorithm
) {
  const position = getPositionInBlock(algorithm, pwd, index, channel, size);

  transform(reBlock, imBlock, algorithm, size);
  return Math.abs(Math.round(reBlock[position] / tolerance) % 2);
}

export function setBit(
  reBlock: number[],
  imBlock: number[],
  bit: number[],
  pwd: string,
  index: number,
  channel: number,
  size: number,
  tolerance: number,
  algorithm: TrasnformAlgorithm
) {
  transform(reBlock, imBlock, algorithm, size);

  const position = getPositionInBlock(algorithm, pwd, index, channel, size);
  const v = Math.floor(reBlock[position] / tolerance);

  if (bit[0]) {
    reBlock[position] = v % 2 === 1 ? v * tolerance : (v + 1) * tolerance;
  } else {
    reBlock[position] = v % 2 === 1 ? (v - 1) * tolerance : v * tolerance;
  }
  inverseTransform(reBlock, imBlock, algorithm, size);
}

export function transform(
  re: number[],
  im: number[],
  algorithm: TrasnformAlgorithm,
  size: number
) {
  switch (algorithm) {
    case TrasnformAlgorithm.DCT2D:
      shiftBlock(re);
      dct(re, size);
      break;
    case TrasnformAlgorithm.FDCT8:
      fastDct8.transform(re);
      break;
    case TrasnformAlgorithm.FDCTLEE:
      fastDctLee.transform(re);
      break;
    case TrasnformAlgorithm.FFT1D:
      FFT.init(size);
      FFT.fft1d(re, im);
      break;
    case TrasnformAlgorithm.FFT2D:
      FFT.init(size);
      FFT.fft2d(re, im);
      break;
    default:
      throw new Error(`unknown algorithm: ${algorithm}`);
  }
}

export function inverseTransform(
  re: number[],
  im: number[],
  algorithm: TrasnformAlgorithm,
  size: number
) {
  switch (algorithm) {
    case TrasnformAlgorithm.DCT2D:
      idct(re, size);
      unshiftBlock(re);
      break;
    case TrasnformAlgorithm.FDCT8:
      fastDct8.inverseTransform(re);
      break;
    case TrasnformAlgorithm.FDCTLEE:
      fastDctLee.inverseTransform(re);
      break;
    case TrasnformAlgorithm.FFT1D:
      FFT.init(size);
      FFT.ifft1d(re, im);
      break;
    case TrasnformAlgorithm.FFT2D:
      FFT.init(size);
      FFT.ifft2d(re, im);
      break;
    default:
      throw new Error(`unknown algorithm: ${algorithm}`);
  }
}

export function setImage(
  block: number[],
  imageData: ImageData,
  index: number,
  size: number,
  offset: number
) {
  // const complement = block.reduce((acc, i) => (i > acc ? i : acc), 0) - 255;
  // const max = block.reduce((acc, i) => (i > acc ? i : acc), 0);
  const { width } = imageData;
  const h1 = Math.floor(index / Math.floor(width / size)) * size;
  const w1 = (index % Math.floor(width / size)) * size;

  for (let i = 0; i < block.length; i += 1) {
    const h2 = Math.floor(i / size);
    const w2 = i % size;

    imageData.data[((h1 + h2) * width + w1 + w2) * 4 + offset] = clamp(
      Math.round(block[i]),
      0,
      255
    );
    // imageData.data[((h1 + h2) * width + w1 + w2) * 4 + offset] = Math.round(
    //   (block[i] * 255) / max
    // );
    // imageData.data[((h1 + h2) * width + w1 + w2) * 4 + offset] = 255;
    // imageData.data[((h1 + h2) * width + w1 + w2) * 4 + offset] =
    //   complement > 0 ? block[i] - complement : block[i];
  }
}
