import React from 'react';
import ReactDOM from 'react-dom';
import Container from './components/Container';
import { useImage } from './hooks/useImage';
import { useHorizontalGradient } from './hooks/useGradient';
import OriginalViewer from './viewers/OriginalViewer';
import PhaseViewer from './viewers/PhaseViewer';
import MagnitudeViewer from './viewers/MagnitudeViewer';
import ResultViewer from './viewers/ResultViewer';

function App() {
  const WIDTH = 256;
  const HEIGHT = 256;
  const [re, im] = useImage({
    url: './assets/circle.png',
    width: WIDTH,
    height: HEIGHT,
  });
  // const [re, im] = useHorizontalGradient({
  //   width: WIDTH,
  //   height: HEIGHT,
  // });

  return (
    <Container>
      <OriginalViewer width={256} height={256} re={re} im={im} />
      <PhaseViewer width={256} height={256} re={re} im={im} />
      <MagnitudeViewer width={256} height={256} re={re} im={im} />
      <ResultViewer width={256} height={256} re={re} im={im} />
    </Container>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
