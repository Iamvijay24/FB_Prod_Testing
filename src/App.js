import { ConfigProvider } from 'antd';
import './App.css';
import RootRouter from './routes';
import theme  from './shared/theme';
import "react-loading-skeleton/dist/skeleton.css";
import Auth from './shared/rbac/provider';

function App() {
  return (
    <Auth>
      <ConfigProvider theme={theme}>
        <RootRouter />
      </ConfigProvider>
    </Auth>
  );
}

export default App;
