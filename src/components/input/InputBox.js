import React from 'react';
import { Input } from 'antd';

const InputBox = ({ type, ...props }) => {
  return type === 'password' ? <Input.Password {...props} /> : <Input {...props} />;
};

export default InputBox;
