import { Layout, Steps } from 'antd';
import React, { useState } from 'react';
import styles from './onboard.module.scss';
import StartHere from './pages/StartHere';
import KnowledgeVerification from './pages/KnowledgeVerification';
import KnowledgeAnalysis from './pages/KnowledgeAnalysis';
import CreatingBot from './pages/CreatingBot';
import Complete from './pages/CompleteNew';

const Onboard = () => {
  
  const [current, setCurrent] = useState(0);
  const [IsAvatarId, setAvatarId] = useState('');


  const StepItems = [
    {
      title: 'Start here',
    },
    {
      title: 'Knowledge Analysis & sorting',
    },
    {
      title: 'Knowledge verification',
    },
    {
      title: 'Creating FaceBot',
    },
    {
      title: 'Complete',
    },
  ];

 
  const onChange = (value) => {
    // Prevent moving forward
    if (value > current) {
      return;
    }
    setCurrent(value);
  };

  // Render content based on the current step
  const renderStepContent = () => {
    switch (current) {
    case 0:
      return <StartHere setCurrent={setCurrent}/>;
    case 1:
      return <KnowledgeAnalysis setCurrent={setCurrent}/>;
    case 2:
      return <KnowledgeVerification setCurrent={setCurrent}/>;
    case 3:
      return <CreatingBot setCurrent={setCurrent} setAvatarId={setAvatarId}/>;
    case 4:
      return <Complete IsAvatarId={IsAvatarId}/>;
    default:
      return <div>Unknown step</div>;
    }
  };


  


  return (
    <div className={styles.wrapper}>
      <Steps
        current={current}
        onChange={onChange}
        // labelPlacement="vertical"
        size='small'
        items={StepItems}
        style={{paddingTop: 60, paddingInline: 90, paddingBottom: 25}}
      />
      <Layout style={{ width: '100%', height: 'calc(100vh - 100px)', overflow: 'auto'}}>
        {renderStepContent()}
      </Layout>
    </div>
  );
};

export default Onboard;
