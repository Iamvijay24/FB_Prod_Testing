import React, { useState } from 'react';
import { Form, Input, Button, Typography, Alert, Card } from 'antd';
import { MailOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const ForgotPasswordPage = () => {
  const [form] = Form.useForm();  // Ant Design form instance
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onFinish = async(values) => {
    setLoading(true);
    setError(''); // Clear any previous errors

    // Simulate sending a password reset link to the user's email
    console.log('Sending password reset link to:', values.email);

    setTimeout(() => {
      setEmailSent(true);
      setLoading(false);
    }, 1500);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Card style={{ width: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ color: 'rgba(0, 0, 0, 0.85)' }}>Forgot Your Password?</Title>
          <Text type="secondary">Enter your email address, and we'll send you a link to reset your password.</Text>
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
          <Alert
            message="Success"
            description="A password reset link has been sent to your email address. Please check your inbox."
            type="success"
            showIcon
          />
        ) : (
          <Form
            form={form}
            name="forgot_password"
            onFinish={onFinish}
            layout="vertical"
          >
            <Form.Item
              label="Email Address"
              name="email"
              rules={[
                { required: true, type: 'email', message: 'Please enter your email address!' },
              ]}
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