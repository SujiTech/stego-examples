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

export function convertToBits(text: string) {
  return text.split('').reduce(
    (acc, c) =>
      [
        ...acc,
        ...encodeURI(c)
          .split('')
          .map(p => {
            const rtn = [];
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
