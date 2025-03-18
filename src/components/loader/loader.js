import { Spin } from 'antd';
import React from 'react';
import { MagnifyingGlass } from 'react-loader-spinner';


const MagnifyingGlassLoader = () => {
  return (
    <MagnifyingGlass
      visible={true}
      height="80"
      width="80"
      ariaLabel="magnifying-glass-loading"
      wrapperStyle={{}}
      wrapperClass="magnifying-glass-wrapper"
      glassColor="#c0efff"
      color="#ff692e"
    />
  );
};


const Loader = () => {
  return (
    <div>
      <Spin indicator={<MagnifyingGlassLoader />} size="large" fullscreen />
    </div>
  );
};

export default Loader;
