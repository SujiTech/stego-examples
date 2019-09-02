import React, { FormEventHandler, DetailedReactHTMLElement } from 'react';
import { FunctionComponent, ChangeEvent } from 'react';

interface InputProps
  extends React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  label: string;
}

const Input: FunctionComponent<InputProps> = ({ label, ...restProps }) => {
  return (
    <label style={{ display: 'flex' }}>
      <span style={{ flex: 1 }}>{label}</span>
      <input {...restProps} />
    </label>
  );
};

export default Input;
