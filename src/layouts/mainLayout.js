import { Layout, Menu, theme } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';


// icon
import { default as dashboardIcon, default as supportIcon } from '../assets/guage.svg';
import contentIcon from '../assets/library.svg';
import billingIcon from '../assets/receipt.svg';
import manageIcon from '../assets/users.svg';
import { makeApiRequest } from '../shared/api';
import HeaderLayout from './header';


const { Content, Sider } = Layout;

function getItem(label, key, icon, path, children) {
  return { key, icon, path, children, label };
}

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuItems, setMenuItems] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);

  useEffect(() => {
    const fetchMenu = async() => {
      const items = await createMenuItems();
      setMenuItems(items);
    };

    fetchMenu();
  }, []);

  // Use useCallback to memoize findPath
  const findPath = useCallback((items, key) => {
    for (let item of items) {
      if (item.key === key) return item.path;
      if (item.children) {
        const childPath = findPath(item.children, key);
        if (childPath) return childPath;
      }
    }
    return null;
  }, []);

  const findActiveKey = useCallback((items, path) => {
    let activeKey = null;

    const traverse = (items) => {
      for (const item of items) {
        if (item.path === path) {
          activeKey = item.key;
        }
        if (item.children) {
          traverse(item.children);
        }
      }
    };

    traverse(items);
    return activeKey;
  }, []);


  useEffect(() => {
    if (menuItems.length === 0) return;

    console.log("Checking active key for path:", location.pathname);

    const activeKey = findActiveKey(menuItems, location.pathname) || "dashboard";

    console.log("Setting activeKey:", activeKey);

    setSelectedKeys([activeKey]);
  }, [location.pathname, menuItems, findActiveKey]);



  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const getDashboards = async() => {
    try {
      const response = await makeApiRequest("get_config", {
        partner_id: "c5c05e02d6",
      });

      const dashboards = response.data?.dashboard;

      return dashboards;

    } catch (error) {
      console.error("Error fetching dashboards:", error);
      return [];
    }
  };

  const createMenuItems = async() => {
    const dashboards = await getDashboards();
    const reportsMenuItems = [];

    if (dashboards && dashboards.length > 0) {
      dashboards.forEach(dashboard => {
        reportsMenuItems.push(getItem(dashboard.text, dashboard.index, <img src={dashboardIcon} alt={dashboard.text} />, `reports/${dashboard.dashboardID}`));
      });
    }

    const menuItems = [
      { type: "divider" },
      { type: "divider" },
      getItem("Dashboard", "dashboard", <img src={dashboardIcon} alt="dashboard" />, "/"),
      { type: "divider" },
      getItem("Knowledge Base", "content-kb", <img src={contentIcon} alt="content" />, "/content-kb"),
      { type: "divider" },
      { type: "divider" },
      getItem("FaceBot", "content-facebot", <img src={manageIcon} alt="content" />, "content-facebot"),
      { type: "divider" },
      { type: "divider" },
      getItem("Reports", "reports", <img src={dashboardIcon} alt="dashboard" />, "reports", reportsMenuItems),
      { type: "divider" },
      { type: "divider" },
      getItem("Billing", "billing", <img src={billingIcon} alt="billing" />, "billing"),
      { type: "divider" },
      { type: "divider" },
      getItem("Support", "support", <img src={supportIcon} alt="support" />, "support"),
    ];

    return menuItems;
  };


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
            selectedKeys={selectedKeys}
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

      {/* <div className={styles.hoverFooterWrapper}>
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
          <FaRegQuestionCircle size={22} color='gray' />
          <Text style={{ color: 'gray' }}>Categories</Text>
        </div>



        <div className={styles.section}>
          <Title level={3} style={{ margin: 0, fontWeight: 'normal', }}>
                        80/178
          </Title>
          <FaRegQuestionCircle size={22} color='gray' />
          <Text style={{ color: 'gray' }}>Questions</Text>
        </div>

        <div>
          <Button type="primary" size="large" style={{ width: '100%' }} htmlType="submit">Publish & Get Code</Button>
        </div> */}


      {/* </div> */}

    </Layout>
  );
};

export default MainLayout;