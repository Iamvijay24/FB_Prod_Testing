import React, { useState } from "react";
import { Button, Form, Grid, Input, theme, Typography } from "antd";
import { LockOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";
import logo from "../../../Logo.svg";

import AWSCognitoUserPool from "../../../shared/api/AWSCognitoUserPool";
import { CognitoUserAttribute } from "amazon-cognito-identity-js";
import { useNavigate } from "react-router-dom";


const { useToken } = theme;
const { useBreakpoint } = Grid;
const { Text, Title, Link } = Typography;

export default function RegisterPage() {
  const { token } = useToken();
  const screens = useBreakpoint();
  const [form] = Form.useForm();

  let navigate = useNavigate();

  const [isLoading, setLoading] = useState(false);


  const handleFinish = (values) => {
    console.log("Received values of form: ", values);

    const attributeList = [
      new CognitoUserAttribute({
        Name: 'email',
        Value: values.email
      })
    ];

    AWSCognitoUserPool.signUp(
      values.email,
      values.password,
      attributeList,
      null,
      (err, result) => {

        if (err) {
          setLoading(false);
          return;
        }

       
        navigate('/verify', {
          state: { email: values.email }
        });
      }
    );

  };

  const handleEnterKey = (event) => {
    if (event.keyCode === 13) {
      form.submit();
    }
  };

  const styles = {
    container: {
      margin: "0 auto",
      padding: screens.md ? `${token.paddingXL}px` : `${token.sizeXXL}px ${token.padding}px`,
      width: "380px"
    },
    footer: {
      marginTop: token.marginLG,
      textAlign: "center",
      width: "100%"
    },
    forgotPassword: {
      float: "right"
    },
    header: {
      marginBottom: token.marginXL,
      textAlign: "center",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center"
    },
    section: {
      alignItems: "center",
      backgroundColor: token.colorBgContainer,
      display: "flex",
      padding: screens.md ? `${token.sizeXXL}px 0px` : "0px"
    },
    text: {
      color: token.colorTextSecondary
    },
    title: {
      fontSize: screens.md ? token.fontSizeHeading2 : token.fontSizeHeading3
    }
  };

  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <div style={styles.header}>
          <img src={logo} alt="logo"/>


          <Title style={styles.title}>Sign up</Title>
          <Text style={styles.text}>
  Join FaceBot today! Fill in your details below to create an account.
          </Text>

        </div>
        <Form
          name="normal_login"
          initialValues={{
            remember: true,
          }}
          onFinish={handleFinish}
          onKeyUp={handleEnterKey}
          layout="vertical"
          requiredMark="optional"
          form={form}
        >
          <Form.Item
            name="email"
            rules={[
              {
                type: "email",
                required: true,
                message: "Please input your Email!",
              },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Email"
              type="email"
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="phone"
            rules={[
              {
                required: true,
                message: "Please input your phone number!",
              },
              {
                pattern: /^[0-9]+$/,  // Allows only digits
                message: "Please enter a valid phone number (numbers only)",
              },
              {
                min: 10, // Or a more appropriate minimum length
                message: "Phone number must be at least 10 digits",
              },
            ]}
          >
            <Input
              prefix={<PhoneOutlined />}
              placeholder="Phone"
              type="text"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="company_Name"
            rules={[
              {
                type: "Company Name",
                required: true,
                message: "Please input your Company Name!",
              },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Company Name"
              type="Company Name"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: "Please input your Password!",
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              type="password"
              size="large"
              placeholder="Password"
            />
          </Form.Item>

          <Form.Item
            name="confirm_password"
            rules={[
              {
                required: true,
                message: "Please input your confirm Password!",
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              type="password"
              size="large"
              placeholder="Confirm Password"
            />
          </Form.Item>
          
          <Form.Item style={{ marginBottom: "0px" }}>
            <Button block="true" size="large" loading={isLoading} type="primary" htmlType="submit">
              Sign up
            </Button>
            <div style={styles.footer}>
              <Text style={styles.text}>Already have an account?</Text>{" "}
              <Link href="/">Sign in</Link>
            </div>
          </Form.Item>
        </Form>

        
      </div>
    </section>
  );
}