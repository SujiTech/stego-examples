import React, { useCallback, useState } from 'react';
import ReactDOM from 'react-dom';
import Picker, { PickerData } from './components/Picker';
import Container from './components/Container';
import OriginalRGBViewer from './viewers/original/RGB';
import OriginalYUVViewer from './viewers/original/YUV';
import BlockViewer from './viewers/BlockViewer';
import GrayscaleViewer from './viewers/GrayscaleViewer';
import PhaseViewer from './viewers/PhaseViewer';
import MagnitudeViewer from './viewers/MagnitudeViewer';

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
        <GrayscaleViewer width={width} height={height} res={res} ims={ims} />
        <OriginalRGBViewer width={width} height={height} res={res} ims={ims} />
        <OriginalYUVViewer width={width} height={height} res={res} ims={ims} />
        {/* <PhaseViewer width={width} height={height} res={res} ims={ims} />
        <MagnitudeViewer width={width} height={height} res={res} ims={ims} /> */}
        <BlockViewer width={width} height={height} res={res} ims={ims} />
      </Container>
    </>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
