import React, { useEffect, useState } from "react";
import { Flex, Typography, Space, Row, Col, Form, Button, Input } from "antd";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import styles from "./ContentLibrary.module.scss";
import { LuLayoutDashboard } from "react-icons/lu";
import { AiOutlineRise } from "react-icons/ai";
import { FaRegQuestionCircle } from "react-icons/fa";
import FormBuilder from "antd-form-builder";

const { Text, Title } = Typography;

const ContentLibrary = ({ form }) => {
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);


  const cardItems = [
    { title: "Library", value: "72", icon: <AiOutlineRise size={18} /> },
    { title: "Categories", value: "12", icon: <LuLayoutDashboard size={18} /> },
    { title: "Questions", value: "178", icon: <FaRegQuestionCircle size={18} /> },
  ];

  const DomainInput = () => <Input placeholder="Ex: https://" size='large' variant="filled" style={{ width: '20rem' }} />;

  const ContentInput = () => <Input placeholder="Ex: https://" size='large' variant="filled" style={{ width: '20rem' }} />;

  const UpdateButton = ()=> <Button type="primary" size="large" style={{ width: '100%' }} htmlType="submit">Update</Button>;

  const meta = {
    initialValues: {},
    colon : false,
    fields: [
      { key: 'domain', label: 'Knowledge Library', required: true, widget: DomainInput },
      { key: 'domain_url', label: 'Domain URL', required: true, widget: ContentInput },
      { key: 'user_name', label: 'FaceBot Name', required: true, widget: ContentInput },
      { key: 'geo_targeting', label: 'Geo Targeting', required: true, widget: ContentInput },
      { key: 'update_button', label: <span style={{ visibility: 'hidden' }}/>, widget: UpdateButton }, // Hidden label
    ],
  };



  return (
    <div className={styles.wrapper}>

      {/* Dashboard Cards */}
      <Flex wrap justify="center" align="center" className={styles.container}>
        {isLoading
          ? cardItems.map((_, index) => (
            <div className={styles.card} key={index}>
              <Skeleton width={"15rem"} height={"7.3rem"} style={{ borderRadius: "10px" }}/>
            </div>
          ))
          : cardItems.map((item, index) => (
            <div className={styles.card} key={index}>
              <Space>
                {item.icon}
                <Text>{item.title}</Text>
              </Space>
              <Title level={3} style={{ margin: 0 }}>
                {item.value}
              </Title>
            </div>
          ))}
      </Flex>

      <Row justify="left" style={{ marginTop: 60 }}>
        <Col xs={24} sm={20} md={16} lg={12} xl={10}>
          <Form layout="horizontal">
            <FormBuilder meta={meta} form={form} />
            <Form.Item style={{ textAlign: 'center', marginTop: 20 }}>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </div>
  );
};

export default ContentLibrary;
