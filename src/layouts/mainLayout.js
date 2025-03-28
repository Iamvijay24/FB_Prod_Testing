import { Button, Layout, Menu, theme, Typography } from 'antd';
import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import styles from './layout.module.scss';

import { FaRegQuestionCircle } from "react-icons/fa";

// icon
import { default as dashboardIcon, default as supportIcon } from '../assets/guage.svg';
import contentIcon from '../assets/library.svg';
import billingIcon from '../assets/receipt.svg';
import manageIcon from '../assets/users.svg';
import HeaderLayout from './header';

const { Title, Text } = Typography;

const { Content, Sider } = Layout;

function getItem(label, key, icon, path, children) {
  return { key, icon, path, children, label };
}

const menuItems = [
  { type: "divider" },
  { type: "divider" },
  getItem("Dashboard", "dashboard", <img src={dashboardIcon} alt="dashboard" />, "/"),
  { type: "divider" },
  getItem("Content KB", "content-kb", <img src={contentIcon} alt="content" />, "/content-kb"),
  { type: "divider" },
  { type: "divider" },
  getItem("FaceBot", "content-facebot", <img src={manageIcon} alt="content" />, "content-facebot"),
  { type: "divider" },
  { type: "divider" },
  getItem("Reports", "travel", <img src={dashboardIcon} alt="dashboard" />, "reports", [
    getItem("User Engagement", "user-engagement", <img src={dashboardIcon} alt="dashboard" />, "user-engagement"),
    getItem("User Feedback", "user-feedback", <img src={dashboardIcon} alt="dashboard" />, "user-feedback"),
    getItem("Lead Generation", "lead-generation", <img src={dashboardIcon} alt="dashboard" />, "lead-generation"),
    getItem("FaceBot Performance", "facebot-performance", <img src={dashboardIcon} alt="dashboard" />, "facebot-performance"),
  ]),
  { type: "divider" },
  { type: "divider" },
  getItem("Billing", "billing", <img src={billingIcon} alt="billing" />, "billing"),
  { type: "divider" },
  { type: "divider" },
  getItem("Support", "support", <img src={supportIcon} alt="support" />, "support"),
];

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

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



  return (
    <Layout>
      <HeaderLayout />

      <Layout>
        <Sider
          width={250}
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