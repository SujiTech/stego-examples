import React from 'react';
import ReactDOM from 'react-dom';
import Container from './components/Container';
import { useImage } from './hooks/useImage';
import { useHorizontalGradient } from './hooks/useGradient';
import OriginalRGBViewer from './viewers/original/RGBViewer';
import OriginalYUVViewer from './viewers/original/YUVViewer';
import BlockViewer from './viewers/BlockViewer';
import PhaseViewer from './viewers/PhaseViewer';
import MagnitudeViewer from './viewers/MagnitudeViewer';
import SteganographyRGBViewer from './viewers/stego/RGBViewer';
import SteganographyHUVViewer from './viewers/stego/HUVViewer';

function App() {
  const WIDTH = 512;
  const HEIGHT = 512;
  const [res, ims] = useImage({
    url: './assets/mountain.jpg',
    width: WIDTH,
    height: HEIGHT,
  });
  // const [re, im] = useHorizontalGradient({
  //   width: WIDTH,
  //   height: HEIGHT,
  // });

  return (
    <Container>
      <SteganographyRGBViewer
        width={WIDTH}
        height={HEIGHT}
        res={res}
        ims={ims}
      />
      <SteganographyHUVViewer
        width={WIDTH}
        height={HEIGHT}
        res={res}
        ims={ims}
      />
    </Container>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
