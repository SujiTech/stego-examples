import React from 'React';
import styled from 'styled-components';
import { FunctionComponent } from 'react';

const Container = styled.div`
  margin: 0;
  display: flex;
  flex-direction: column;
`;

interface ViewerProps {
  title: string;
}

const Viewer: FunctionComponent<ViewerProps> = ({ title, children }) => {
  return (
    <Container>
      <h2>{title}</h2>
      {children}
    </Container>
  );
};

export default Viewer;
