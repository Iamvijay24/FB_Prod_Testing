import React, { useContext, useEffect, useState } from "react";
import { Button, Checkbox, Form, Grid, Input, message, theme, Typography } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import logo from "../../../Logo.svg";
import { useNavigate } from "react-router-dom";
import { AuthenticationDetails, CognitoUser } from "amazon-cognito-identity-js";
import AWSCognitoUserPool from "../../../shared/api/AWSCognitoUserPool";
import { FbContext } from "../../../shared/rbac/context";

const { useToken } = theme;
const { useBreakpoint } = Grid;
const { Text, Title, Link } = Typography;

export default function LoginPage() {
  const [form] = Form.useForm();
  const { token } = useToken();
  const screens = useBreakpoint();
  let navigate = useNavigate();
  const [isLoading, setLoading] = useState(false);

  const authCxt = useContext(FbContext);

  useEffect(() => {
    console.log("authCxt.authenticated", authCxt.authenticated);
    // Use authCxt.authenticated directly in the condition
    if (authCxt.authenticated) {
      navigate('/dashboard');
    }
  }, [authCxt.authenticated, navigate]); // Add authCxt.authenticated to dependency array

  const handleFinish = async(values) => {
    setLoading(true);
    const userData = {
      Username: values.email,
      Pool: AWSCognitoUserPool
    };

    const cognitoUser = new CognitoUser(userData);

    const authenticationDetails = new AuthenticationDetails({
      Username: values.email,
      Password: values.password
    });

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => {
        console.log("Authentication successful:", result);
        setLoading(false);
        authCxt.handleAuthentication(result);
        navigate('/dashboard');
        message.success('Login successful!');
      },
      onFailure: (err) => {
        console.error('Authentication failed:', err);
        setLoading(false);
        // Handle specific error messages
        if (err.code === 'UserNotFoundException') {
          message.error('User not found. Please check your email.');
        } else if (err.code === 'NotAuthorizedException') {
          message.error('Incorrect password. Please try again.');
        } else if (err.code === 'UserNotConfirmedException') {
          message.error('User not confirmed. Please check your email for confirmation.');
        }
      }
    });
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
          <img src={logo} alt="logo" />

          <Title style={styles.title}>Sign in</Title>
          <Text style={styles.text}>
            Welcome back to FaceBot! Please enter your details below to
            sign in.
          </Text>
        </div>
        <Form
          name="normal_login"
          initialValues={{
            remember: true,
          }}
          onFinish={handleFinish}
          onKeyUp={handleEnterKey}
          form={form}
          layout="vertical"
          requiredMark="optional"
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
          <Form.Item>
            <Form.Item name="remember" valuePropName="unChecked" noStyle>
              <Checkbox>Remember me</Checkbox>
            </Form.Item>
            <a style={styles.forgotPassword} href="/forgot-password">
              Forgot password?
            </a>
          </Form.Item>
          <Form.Item style={{ marginBottom: "0px" }}>
            <Button block="true" loading={isLoading} size="large" type="primary" htmlType="submit">
              Log in
            </Button>
            <div style={styles.footer}>
              <Text style={styles.text}>Don't have an account?</Text>{" "}
              <Link href="/register">Sign up now</Link>
            </div>
          </Form.Item>
        </Form>
      </div>
    </section>
  );
}