import React, { useState } from "react";
import { Button, Form, Grid, Input, theme, Typography, message } from "antd";
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

  const handleFinish = async(values) => { //Make it async to use await
    console.log("Received values of form: ", values);
    setLoading(true); // Set loading to true before the signup process starts

    try {

      if (values.password !== values.confirm_password) {
        message.error("Passwords do not match");
        setLoading(false);
        return;
      }

      const attributeList = [
        new CognitoUserAttribute({ Name: 'email', Value: values.email }),
        new CognitoUserAttribute({ Name: 'phone_number', Value: values.phone || '+1234567890' }),  // Use values.phone
        new CognitoUserAttribute({ Name: 'given_name', Value: values.company_Name || 'John' }),  // Use values.company_Name as given_name
        new CognitoUserAttribute({ Name: 'family_name', Value: 'Doe' }),  // Keep family name as Doe
        new CognitoUserAttribute({ Name: 'name', Value: values.company_Name || 'John Doe' }),  // Use values.company_Name
        new CognitoUserAttribute({ Name: 'gender', Value: 'Male' }),
        new CognitoUserAttribute({ Name: 'address', Value: '123 Street, City, Country' }),
        new CognitoUserAttribute({ Name: 'website', Value: 'https://example.com' }),
      ];

      AWSCognitoUserPool.signUp(
        values.email,
        values.password,
        attributeList,
        null,
        (err, result) => {
          setLoading(false); // Reset loading state

          if (err) {
            console.error("Signup error:", err);  // Log the full error object for debugging
            message.error(err.message || "Signup failed. Please try again.");
            return;
          }

          console.log("Signup result:", result);
          message.success("Signup successful!  Please verify your email.");
          navigate('/verify', {
            state: { email: values.email }
          });
        }
      );

    } catch (error) {
      console.error("Error during signup:", error);  // Log errors during attribute creation or navigate
      message.error("An error occurred during signup. Please try again.");
      setLoading(false); // Ensure loading is set to false even on error
    }

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
              }
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
                type: "string",
                required: true,
                message: "Please input your Company Name!",
              },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Company Name"
              type="text"
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
              {
                min: 8,
                message: "Password must be at least 8 characters!",
              }
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
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords that you entered do not match!'));
                },
              }),
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
              <Text style={styles.text}>Already have an account?</Text>
              <Link href="/">Sign in</Link>
            </div>
          </Form.Item>
        </Form>
      </div>
    </section>
  );
}