import React, { useEffect, useState } from "react";
import { Select, Flex, Typography, Space } from "antd";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import styles from "./dashboard.module.scss";
import { LuLayoutDashboard, LuUsers } from "react-icons/lu";
import { AiOutlineRise } from "react-icons/ai";
import { FaRegQuestionCircle } from "react-icons/fa";

const { Text, Title } = Typography;

const Dashboard = () => {
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const menuItems = [
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
  ];

  const cardItems = [
    { title: "Categories", value: "12", icon: <LuLayoutDashboard size={18} /> },
    { title: "Questions", value: "178", icon: <FaRegQuestionCircle size={18} /> },
    { title: "Views", value: "7234", icon: <AiOutlineRise size={18} /> },
    { title: "Users", value: "3671", icon: <LuUsers size={18} /> },
  ];

  return (
    <div className={styles.wrapper}>
      {/* Overview Header */}
      <Flex justify="space-between" align="center" className={styles.header}>
        <Text strong>Overview</Text>
        <Select
          options={menuItems}
          defaultValue="today"
          style={{ width: 120 }}
          bordered={false}
        />
      </Flex>

      {/* Dashboard Cards */}
      <Flex wrap justify="center" align="center" className={styles.container}>
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
            <div className={styles.card} key={index}>
              <Skeleton width={"15rem"} height={"7.3rem"} />
            </div>
          ))
          : cardItems.map((item, index) => (
            <div className={styles.card} key={index}>
              <Space>
                {item.icon}
                <Text>{item.title}</Text>
              </Space>
              <Title level={4} style={{ margin: 0 }}>
                {item.value}
              </Title>
            </div>
          ))}
      </Flex>
    </div>
  );
};

export default Dashboard;
