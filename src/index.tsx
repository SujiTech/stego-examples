import React from 'react';
import ReactDOM from 'react-dom';
import Container from './components/Container';
import { useImage } from './hooks/useImage';
import { useHorizontalGradient } from './hooks/useGradient';
import OriginalViewer from './viewers/OriginalViewer';
import PhaseViewer from './viewers/PhaseViewer';
import MagnitudeViewer from './viewers/MagnitudeViewer';
import SteganographyViewer from './viewers/SteganographyViewer';
import ResultViewer from './viewers/ResultViewer';

function App() {
  const WIDTH = 256;
  const HEIGHT = 256;
  const [re, im] = useImage({
    url: './assets/grace.png',
    width: WIDTH,
    height: HEIGHT,
  });
  const [re1, im1] = useImage({
    url: './assets/grace-compressed.jpg',
    width: WIDTH,
    height: HEIGHT,
  });
  // const [re, im] = useHorizontalGradient({
  //   width: WIDTH,
  //   height: HEIGHT,
  // });

  return (
    <>
      <Container>
        <OriginalViewer width={256} height={256} re={re} im={im} />
        <PhaseViewer width={256} height={256} re={re} im={im} />
        <MagnitudeViewer width={256} height={256} re={re} im={im} />
        <ResultViewer width={256} height={256} re={re} im={im} />
        <SteganographyViewer width={256} height={256} re={re} im={im} />
      </Container>
      <Container>
        <OriginalViewer width={256} height={256} re={re1} im={im1} />
        <PhaseViewer width={256} height={256} re={re1} im={im1} />
        <MagnitudeViewer width={256} height={256} re={re1} im={im1} />
        <ResultViewer width={256} height={256} re={re1} im={im1} />
        <SteganographyViewer width={256} height={256} re={re1} im={im1} />
      </Container>
    </>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
