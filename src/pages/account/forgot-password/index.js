import React, { useState } from 'react';
import { Form, Input, Button, Typography, Alert, Card, message } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { CognitoUser } from 'amazon-cognito-identity-js';
import { useNavigate } from 'react-router-dom';
import AWSCognitoUserPool from "../../../shared/api/AWSCognitoUserPool";

const { Title, Text } = Typography;

const ForgotPasswordPage = () => {
  const [form] = Form.useForm();
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailId, setEmailId] = useState('');
  const navigate = useNavigate();

  const onFinish = async(values) => {
    setLoading(true);
    setError('');
    setEmailId(values.email);
    const userPool = AWSCognitoUserPool; //new CognitoUser(UserPool);
    const cognitoUser = new CognitoUser({
      Username: values.email,
      Pool: userPool
    });

    cognitoUser.forgotPassword({
      onSuccess: (data) => {
        message.success('Verification code sent successfully!');
        setEmailSent(true);
        setLoading(false);
      },
      onFailure: (err) => {
        message.error(err.message);
        setLoading(false);  //Also set loading to false on failure
      }
    });
  };

  const handleFinish = (values) => {
    const userPool = AWSCognitoUserPool; //new CognitoUser(UserPool);

    setLoading(true);
    var userData = {
      Username: emailId,
      Pool: userPool
    };
    const cognitoUser = new CognitoUser(userData);

    cognitoUser.confirmPassword(values.otp, values.password, {
      onSuccess() {
        message.success('Password changed successfully!');
        setLoading(false);
        setTimeout(() => {
          navigate('/login');
        }, 1000);
      },
      onFailure(err) {
        setLoading(false);
        if (err.code === 'InvalidPasswordException') {
          const passwordPolicyMessage = `
      Password must meet the following criteria:
      - At least 8 characters long
      - At least one uppercase letter
      - At least one lowercase letter
      - At least one numeric character
      - At least one special character (e.g., !@#$%^&*)
    `;
          message.error(passwordPolicyMessage);
        } else {
          message.error(err.message);
        }
      }
    });
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Card style={{ width: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ color: 'rgba(0, 0, 0, 0.85)' }}>Forgot Your Password?</Title>
          <Text type="secondary">
            {emailSent
              ? 'Enter the verification code sent to your email address and your new password.'
              : 'Enter your email address, and we\'ll send you a verification code to reset your password.'}
          </Text>
        </div>

        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {emailSent ? (
          <Form name="confirm_reset_password" layout="vertical" onFinish={handleFinish}>
            <Form.Item
              label="Verification Code"
              name="otp"
              rules={[{ required: true, message: 'Please enter the verification code!' }]}
            >
              <Input size="large" placeholder="Verification Code" />
            </Form.Item>

            <Form.Item
              label="New Password"
              name="password"
              rules={[
                { required: true, message: 'Please enter your new password!' },
                {
                  min: 8,
                  message: 'Password must be at least 8 characters long',
                },
              ]}
            >
              <Input.Password size="large" placeholder="New Password" />
            </Form.Item>

            <Form.Item
              label="Confirm Password"
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Please confirm your new password!' },
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
              <Input.Password size="large" placeholder="Confirm Password" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                Reset Password
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <Form form={form} name="forgot_password" onFinish={onFinish} layout="vertical">
            <Form.Item
              label="Email Address"
              name="email"
              rules={[{ required: true, type: 'email', message: 'Please enter your email address!' }]}
            >
              <Input prefix={<MailOutlined />} size="large" placeholder="Your email address" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                Send Reset Link
              </Button>
            </Form.Item>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;