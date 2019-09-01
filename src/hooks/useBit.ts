import { useEffect, useState } from 'react';

export function useBit(text: string) {
  const [bits, setBits] = useState<number[]>([]);

  useEffect(() => {
    setBits(
      text.split('').reduce(
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
      )
    );
  }, [text]);

  return [bits];
}
