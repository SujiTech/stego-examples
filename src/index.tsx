import React from 'react';
import ReactDOM from 'react-dom';
import Container from './components/Container';
import { useImage } from './hooks/useImage';
import { useHorizontalGradient } from './hooks/useGradient';
import OriginalRGBViewer from './viewers/original/RGBViewer';
import OriginalYUVViewer from './viewers/original/YUVViewer';
import PhaseViewer from './viewers/PhaseViewer';
import MagnitudeViewer from './viewers/MagnitudeViewer';
import SteganographyRGBViewer from './viewers/stego/RGBViewer';
import SteganographyHUVViewer from './viewers/stego/HUVViewer';

function App() {
  const WIDTH = 256;
  const HEIGHT = 256;
  const [res, ims] = useImage({
    url: './assets/lena.jpg',
    width: WIDTH,
    height: HEIGHT,
  });
  // const [re, im] = useHorizontalGradient({
  //   width: WIDTH,
  //   height: HEIGHT,
  // });

  return (
    <Container>
      <OriginalRGBViewer width={256} height={256} res={res} ims={ims} />
      <OriginalYUVViewer width={256} height={256} res={res} ims={ims} />
      <PhaseViewer width={256} height={256} res={res} ims={ims} />
      <MagnitudeViewer width={256} height={256} res={res} ims={ims} />
      <SteganographyRGBViewer width={256} height={256} res={res} ims={ims} />
      <SteganographyHUVViewer width={256} height={256} res={res} ims={ims} />
    </Container>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
