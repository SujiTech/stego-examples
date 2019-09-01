import React from 'react';

import { FunctionComponent, ChangeEvent } from 'react';

interface CheckboxProps {
  type?: 'checkbox' | 'radio';
  label: string;
  checked: boolean;
  onChange: (ev: ChangeEvent<HTMLInputElement>) => void;
}

const Checkbox: FunctionComponent<CheckboxProps> = ({
  type = 'checkbox',
  label,
  checked,
  onChange,
}) => {
  return (
    <label>
      <input type={type} checked={checked} onChange={onChange} />
      <span>{label}</span>
    </label>
  );
};

export default Checkbox;
