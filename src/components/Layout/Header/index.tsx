import React from 'react';
import { Layout, Typography } from 'antd';
import AppMenu from '../../Menu';

const { Header } = Layout;
const { Title } = Typography;

const AppHeader: React.FC = () => {
  const headerStyle: React.CSSProperties = {
    backgroundColor: 'rgba(255,255,255,0.6)',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '20px',
    paddingRight: '20px',
    width: '100%',
    zIndex: 1000,
    gap: '40px',
  };

  return (
    <Header style={headerStyle}>
      <Title 
        level={2} 
        style={{ 
          color: '#b5120f', 
          margin: 0,
          fontWeight: 'bold',
          minWidth: '100px',
        }}
      >
        OCBC
      </Title>
      <AppMenu />
    </Header>
  );
};

export default AppHeader;
