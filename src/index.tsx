import React, { useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import Container from './components/Container';
import SteganographyRGBViewer from './viewers/stego/RGBViewer';
import SteganographyYUVViewer from './viewers/stego/YUVViewer';
import Picker, { PickerData } from './components/Picker';

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
        <SteganographyRGBViewer
          width={width}
          height={height}
          res={res}
          ims={ims}
        />
        <SteganographyYUVViewer
          width={width}
          height={height}
          res={res}
          ims={ims}
        />
      </Container>
    </>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
