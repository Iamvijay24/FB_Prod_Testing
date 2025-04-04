import { Tabs } from 'antd';
import React from 'react';
import ContentLibrary from './Content Library';
import EditContent from './Edit Content';

const ContentKB = () => {

  const items = [
    {
      key: '1',
      label: 'Content Library',
      children: <ContentLibrary />,
    },
    {
      key: '2',
      label: 'Edit Content',
      children: <EditContent />,
    },
  ];

  return (
    <div>
      <Tabs defaultActiveKey="1" items={items} />
    </div>
  );
};

export default ContentKB;
