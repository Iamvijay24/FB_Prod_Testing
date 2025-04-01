/* eslint-disable no-useless-escape */
import { LinkOutlined, LockOutlined, MailOutlined, UserOutlined, HomeOutlined } from "@ant-design/icons";
import { Button, Form, Grid, Input, message, Space, theme, Typography } from "antd";
import React, { useState } from "react";
import logo from "../../../Logo.svg";

import { CognitoUserAttribute } from "amazon-cognito-identity-js";
import { useNavigate } from "react-router-dom";
import AWSCognitoUserPool from "../../../shared/api/AWSCognitoUserPool";
import TextArea from "antd/es/input/TextArea";

const { useToken } = theme;
const { useBreakpoint } = Grid;
const { Text, Title, Link } = Typography;

// Helper function to validate phone number
const validatePhoneNumber = (_, value) => {
  if (!value) {
    return Promise.resolve();
  }
  const phoneRegex = /^[0-9]+$/; //  numbers only
  if (!phoneRegex.test(value)) {
    return Promise.reject(new Error("Please enter a valid phone number (numbers only)."));
  }
  return Promise.resolve();
};


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
        new CognitoUserAttribute({ Name: 'phone_number', Value: values.phone?.countryCode + values.phone?.number }),
        new CognitoUserAttribute({ Name: 'given_name', Value: values.given_name }),
        new CognitoUserAttribute({ Name: 'family_name', Value: values.family_name }),
        new CognitoUserAttribute({ Name: 'name', Value: values.company_name }),
        new CognitoUserAttribute({ Name: 'gender', Value: "male" }),
        new CognitoUserAttribute({ Name: 'address', Value: values.address }),
        new CognitoUserAttribute({ Name: 'website', Value: values.website }),
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
          <img src={logo} alt="logo" />
          <Title style={styles.title}>Create Account</Title>
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
            name="given_name"
            rules={[
              {
                type: "string",
                required: true,
                message: "Please input your First Name!",
                whitespace: true, // Prevents empty strings
              },
              {
                min: 2,
                message: "First Name must be at least 2 characters!",
              },
              {
                max: 50,
                message: "First Name cannot be longer than 50 characters!",
              },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="First Name"
              type="text"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="family_name"
            rules={[
              {
                type: "string",
                required: true,
                message: "Please input your Last Name!",
                whitespace: true, // Prevents empty strings
              },
              {
                min: 2,
                message: "Last Name must be at least 2 characters!",
              },
              {
                max: 50,
                message: "Last Name cannot be longer than 50 characters!",
              },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Last Name"
              type="text"
              size="large"
            />
          </Form.Item>


          <Form.Item
            name="website"
            rules={[
              {
                type: "url",
                required: true,
                message: "Please input your Website!",
              },
              {
                max: 200,
                message: "Website URL cannot be longer than 200 characters!",
              },
              {
                // Custom validation to check if the URL starts with http:// or https://
                validator: (_, value) => {
                  if (!value) {
                    return Promise.resolve(); // Allow empty values if not required
                  }
                  if (!value.startsWith("http://") && !value.startsWith("https://")) {
                    return Promise.reject(
                      new Error("Website URL must start with http:// or https://")
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input
              prefix={<LinkOutlined />}
              placeholder="Website"
              type="url"
              size="large"
            />
          </Form.Item>

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

          <Form.Item>
            <Space.Compact>
              <Form.Item
                name={["phone", "countryCode"]}
                rules={[
                  {
                    required: true,
                    message: "Country code is required!",
                  },
                  {
                    pattern: /^\+[0-9]+$/,  // Match only plus sign followed by digits
                    message: "Please enter a valid country code (e.g., +1).",
                  },
                ]}
                noStyle
              >
                <Input
                  placeholder="+1"
                  type="text"
                  size="large"
                  style={{ width: "4rem" }}
                />
              </Form.Item>

              <Form.Item
                name={["phone", "number"]}
                rules={[
                  { required: true, message: "Phone number is required!" },
                  { validator: validatePhoneNumber },
                ]}
                noStyle
              >
                <Input
                  placeholder="Phone"
                  type="text"
                  size="large"
                  style={{ width: "19.7rem" }}
                />
              </Form.Item>
            </Space.Compact>
          </Form.Item>

          <Form.Item
            name="company_name"
            rules={[
              {
                type: "string",
                required: true,
                message: "Please input your Company Name!",
                whitespace: true, // Prevents empty strings
              },
              {
                min: 2,
                message: "Company Name must be at least 2 characters!",
              },
              {
                max: 100,
                message: "Company Name cannot be longer than 100 characters!",
              },
            ]}
          >
            <Input
              prefix={<HomeOutlined />}
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
              },
              {
                max: 100,
                message: "Password cannot be longer than 100 characters!",
              },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).*$/,
                message:
                  "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character!",
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
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("The two passwords that you entered do not match!")
                  );
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
              <Text style={styles.text}>Already have an account? </Text>
              <Link href="/">Sign in</Link>
            </div>
          </Form.Item>
        </Form>
      </div>
    </section>
  );
}