declare module 'ndarray-fft' {
  import ndarray = require('ndarray');

  export default function FFT(
    direction: 1 | -1,
    re: ndarray,
    im: ndarray
  ): void;
}

declare module 'ml-fft' {
  interface FFTUtils {
    fft2DArray(data: number[], width: number, height: number): void;
    ifft2DArray(data: number[], width: number, height: number): void;
  }

  const FFT: {
    FFTUtils: FFTUtils;
  };

  export default FFT;
}
