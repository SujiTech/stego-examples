import React from 'react';

import { FunctionComponent, ChangeEvent } from 'react';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (ev: ChangeEvent<HTMLInputElement>) => void;
}

const Checkbox: FunctionComponent<CheckboxProps> = ({
  label,
  checked,
  onChange,
}) => {
  return (
    <label>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span>{label}</span>
    </label>
  );
};

export default Checkbox;
