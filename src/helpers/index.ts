// more:
// https://makarandtapaswi.wordpress.com/2009/07/20/why-the-rgb-to-ycbcr/
// https://stackoverflow.com/questions/21264648/javascript-convert-yuv-to-rgb

export function rgb2yuv(r: number, g: number, b: number) {
  return [
    (77 / 256) * r + (150 / 256) * g + (29 / 256) * b,
    -(44 / 256) * r - (87 / 256) * g + (131 / 256) * b + 128,
    (131 / 256) * r - (110 / 256) * g - (21 / 256) * b + 128,
  ];
}

export function yuv2rgb(y: number, cb: number, cr: number) {
  return [
    y + 1.4075 * (cr - 128),
    y - 0.3455 * (cb - 128) - 0.7169 * (cr - 128),
    y + 1.779 * (cb - 128),
  ];
}
