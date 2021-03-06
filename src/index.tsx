import React, { useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import Container from './components/Container';
import RGBViewer from './viewers/stego/RGB';
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
        <RGBViewer
          width={width}
          height={height}
          res={res}
          ims={ims}
          algorithm={TrasnformAlgorithm.FFT1D}
        />
        <RGBViewer
          width={width}
          height={height}
          res={res}
          ims={ims}
          algorithm={TrasnformAlgorithm.FFT2D}
        />
        <RGBViewer
          width={width}
          height={height}
          res={res}
          ims={ims}
          algorithm={TrasnformAlgorithm.DCT2D}
        />
      </Container>
    </>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
