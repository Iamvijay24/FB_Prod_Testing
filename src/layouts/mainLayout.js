import React, { useState } from 'react';
import { Avatar, Button, Dropdown, Layout, Menu, theme, Typography } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import logo from '../Logo.svg';
import { FiLogOut } from "react-icons/fi";
import styles from './layout.module.scss';

import { FaRegQuestionCircle } from "react-icons/fa";

const { Title, Text } = Typography;

const { Header, Content, Sider } = Layout;

function getItem(label, key, icon, path, children) {
  return { key, icon, path, children, label };
}

const menuItems = [
  getItem("Dashboard", "dashboard", null, "/"),
  { type: "divider" },
  getItem("Content KB", "content-kb", null, "/content-kb"),
  getItem("Content FaceBot", "content-facebot", null, "/content-facebot"),
  { type: "divider" },
  // getItem("Travel", "travel", null, "/admin/travel/dashboard", [
  //   getItem("Packages", "travel-packages", null, "/admin/travel/packages")
  // ]),
  getItem("Billing", "billing", null, "/billing"),
  getItem("Support", "support", null, "/support"),
];

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogOut = () => {
    navigate("/");
  };

  const findActiveKey = (items, path) => {
    for (const item of items) {
      if (item.path === path) return item.key;
      if (item.children) {
        const childKey = findActiveKey(item.children, path);
        if (childKey) return childKey;
      }
    }
    return null;
  };

  const currentKey = findActiveKey(menuItems, location.pathname) || "dashboard";

  const dropdownItems = [
    {
      key: "1",
      label: <span onClick={handleLogOut}> Log out</span>,
      icon: <FiLogOut />
    }
  ];

  return (
    <Layout>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          // padding: '0 20px',
          background: colorBgContainer,
        }}
      >
        {/* Logo Section */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={logo} alt="Logo" style={{ height: '40px', marginRight: '12px' }} />
        </div>

        {/* User Avatar Section */}
        <Dropdown menu={{ items: dropdownItems }} trigger={["click"]}>
          <Avatar
            size={32}
            shape="circle"
            style={{
              cursor: "pointer",
              backgroundColor: "#1890ff",
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 'bold',
            }}
          >
      K
          </Avatar>
        </Dropdown>
      </Header>

   

      <Layout>
        <Sider
          width={200}
          collapsible collapsed={collapsed} onCollapse={setCollapsed}
        >
          <Menu
            mode="inline"
            theme='dark'
            defaultSelectedKeys={[currentKey]}
            selectedKeys={[currentKey]}
            defaultOpenKeys={['sub1']}
            items={menuItems}
            onClick={({ key }) => {
              const findPath = (items, key) => {
                for (let item of items) {
                  if (item.key === key) return item.path;
                  if (item.children) {
                    const childPath = findPath(item.children, key);
                    if (childPath) return childPath;
                  }
                }
                return null;
              };

              const path = findPath(menuItems, key);
              if (path) navigate(path);
            }}
          />
        </Sider>
        <Layout
          style={{
            padding: '14px',
          }}
        >
          {/* <Breadcrumb
            items={[
              {
                title: 'Home',
              },
              {
                title: 'List',
              },
              {
                title: 'App',
              },
            ]}
            style={{
              margin: '16px 0',
            }}
          /> */}
          <Content
            style={{
              padding: 14,
              margin: 0,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              overflow: 'auto',
              maxHeight: 'calc(100vh - 64px)',
              minHeight: 'calc(96vh - 64px)',
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>

      <div className={styles.hoverFooterWrapper}>
        <div>
          <Title level={4} style={{ margin: 0, fontWeight: 'normal', color: 'gray' }}>
         Findings Verified
          </Title>
        </div>

        <span className={styles.sectionShadow} />

        <div className={styles.section}>
          <Title level={3} style={{ margin: 0, fontWeight: 'normal', }}>
         8/17
          </Title>
          <FaRegQuestionCircle size={22} color='gray'/>
          <Text style={{color: 'gray' }}>Categories</Text>
        </div>

        

        <div className={styles.section}>
          <Title level={3} style={{ margin: 0, fontWeight: 'normal', }}>
         80/178
          </Title>
          <FaRegQuestionCircle size={22} color='gray'/>
          <Text style={{color: 'gray' }}>Questions</Text>
        </div>

        <div>
          <Button type="primary" size="large" style={{ width: '100%' }} htmlType="submit">Publish & Get Code</Button>
        </div>

       
      </div>

    </Layout>
  );
};
export default MainLayout;