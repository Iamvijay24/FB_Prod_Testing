import { Avatar, Dropdown, Layout, message, theme } from "antd";
import React, { useContext, useEffect, useState } from "react";
import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import logo from "../Logo.svg";
import { FbContext } from "../shared/rbac/context";
import AWSCognitoUserPool from "../shared/api/AWSCognitoUserPool";

const { Header } = Layout;

const HeaderLayout = () => {
  const navigate = useNavigate();
  const authCxt = useContext(FbContext);
  const [userData, setUserData] = useState({});

  const { token: { colorBgContainer }} = theme.useToken();

  const cognitoUser = AWSCognitoUserPool.getCurrentUser();



  useEffect(() => {
    if (cognitoUser) {
      cognitoUser.getSession((err, session) => {
        if (err) {
          return;
        }
        const userEmail = session.getIdToken().payload.email;
        setUserData({email: userEmail});
      });
    }
  }, []);

  const handleLogOut = () => {
    if (cognitoUser) {
      try {
        cognitoUser.signOut();
        authCxt.logout();
        message.success("Successfully logged out!");
        window.location.href = "/";
      } catch (error) {
        message.error(`Logout error: ${error.message}`);
      }
    }

    navigate("/");
  };

  const dropdownItems = [
    {
      key: "1",
      label: <span onClick={handleLogOut}> Log out</span>,
      icon: <FiLogOut />,
    },
  ];

  const getAvatarBackgroundColor = (email) => {
    if (!email || typeof email !== 'string' || email.length === 0) {
      return "#808080"; // Default gray if no email or invalid email
    }

    const firstLetter = email.charAt(0).toUpperCase();
    const charCode = firstLetter.charCodeAt(0);

    const hue = (charCode * 36) % 360;
    const saturation = 70;
    const lightness = 50;

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  const avatarBgColor = getAvatarBackgroundColor(userData.email);

  return (
    <Header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        // padding: '0 20px',
        background: colorBgContainer,
      }}
    >
      {/* Logo Section */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <img
          src={logo}
          alt="Logo"
          style={{ height: "40px", marginRight: "12px" }}
        />
      </div>

      {/* User Avatar Section */}
      <Dropdown
        menu={{ items: dropdownItems }}
        placement="bottomCenter"
        trigger={["click"]}
      >
        <Avatar
          size={32}
          shape="circle"
          style={{
            cursor: "pointer",
            backgroundColor: avatarBgColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          {userData.email?.charAt(0).toUpperCase()}
        </Avatar>
      </Dropdown>
    </Header>
  );
};

export default HeaderLayout;
