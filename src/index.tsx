import React, { useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import Container from './components/Container';
import FFTViewer from './viewers/stego/FFT';
import Picker, { PickerData } from './components/Picker';
import { TrasnformAlgorithm } from './stego';

function App() {
  const [res, setRes] = useState<number[][]>([]);
  const [ims, setIms] = useState<number[][]>([]);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const onPickerChange = useCallback(
    ({ width, height, res, ims }: PickerData) => {
      setWidth(width);
      setHeight(height);
      setRes(res);
      setIms(ims);
    },
    []
  );

  return (
    <>
      <Picker onChange={onPickerChange} />
      <Container>
        <FFTViewer
          width={width}
          height={height}
          res={res}
          ims={ims}
          algorithm={TrasnformAlgorithm.FFT1D}
        />
        <FFTViewer
          width={width}
          height={height}
          res={res}
          ims={ims}
          algorithm={TrasnformAlgorithm.FFT2D}
        />
        <FFTViewer
          width={width}
          height={height}
          res={res}
          ims={ims}
          algorithm={TrasnformAlgorithm.DCT}
        />
      </Container>
    </>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
