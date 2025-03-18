import { ConfigProvider } from 'antd';
import './App.css';
import RootRouter from './routes';
import theme  from './shared/theme';
import "react-loading-skeleton/dist/skeleton.css";

function App() {
  return (
    <ConfigProvider theme={theme}>

      <RootRouter />
    </ConfigProvider>
    
  );
}

export default App;
