import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Typography, Alert, Card, Spin, message } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { CognitoUser } from 'amazon-cognito-identity-js';
import AWSCognitoUserPool from '../../../shared/api/AWSCognitoUserPool';

const { Title, Text } = Typography;

const OTPVerificationPage = () => {
  const [otpVerified, setOtpVerified] = useState(false);
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [resendTime, setResendTime] = useState(60);
  const [otpSentTime, setOtpSentTime] = useState(null);
  const [isLoading, setLoading] = useState(false); // Initialize isLoading to false

  useEffect(() => {
    if (location.state && location.state.email) {
      setEmail(location.state.email);
      setOtpSentTime(Date.now());
    } else {
      if (!navigate) {
        console.error("OTPVerificationPage: navigate prop is undefined. Ensure component is rendered within a Router.");
        return;
      }
      navigate('/register');
    }
  }, [location, navigate]);

  useEffect(() => {
    let intervalId;

    if (otpSentTime) {
      intervalId = setInterval(() => {
        const elapsedTime = Math.floor((Date.now() - otpSentTime) / 1000);
        const remainingTime = Math.max(0, 60 - elapsedTime);
        setResendTime(remainingTime);
        setResendDisabled(remainingTime > 0);

        if (remainingTime === 0) {
          clearInterval(intervalId);
        }
      }, 1000);
    }

    return () => clearInterval(intervalId);
  }, [otpSentTime]);

  useEffect(() => {
    if (otpVerified) {
      const timer = setTimeout(() => {
        navigate('/dashboard');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [otpVerified, navigate]);

  const onVerifyOTP = async(values) => {
    setLoading(true);
    setError('');

    try {
      const userPool = AWSCognitoUserPool;

      const userData = {
        Username: email,
        Pool: userPool
      };
      const cognitoUser = new CognitoUser(userData);

      cognitoUser.confirmRegistration(values.otp, true, (err, result) => {
        setLoading(false);

        if (err) {
          console.error("OTP Verification Error:", err);
          setError("Failed to verify OTP. Please try again.");
          return;
        }

        setOtpVerified(true);
      });
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleResendOTP = async() => {
    setResendLoading(true);
    setError('');

    try {
      var userData = {
        Username: email,
        Pool: AWSCognitoUserPool
      };
      const cognitoUser = new CognitoUser(userData);

      cognitoUser.resendConfirmationCode((err, result) => {
        setResendLoading(false);
        if (err) {
          message.error(err.message);
          return;
        }
        message.success('OTP resent successfully!');
        setOtpSentTime(Date.now());
      });
    } catch (error) {
      console.error('Error resending OTP:', error);
      setError('Failed to resend OTP.');
      setResendLoading(false);
    }
  };

  if (!email) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
        <Card style={{ width: 400 }}>
          <Alert
            message="Error"
            description="Email information is missing. Please register first."
            type="error"
            showIcon
            icon={<ExclamationCircleOutlined />}
          />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Card style={{ width: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ color: 'rgba(0, 0, 0, 0.85)' }}>OTP Verification</Title>
          <Text type="secondary">
            Enter the OTP sent to <Text strong>{email}</Text> to verify your account.
          </Text>
        </div>

        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            icon={<ExclamationCircleOutlined />}
            style={{ marginBottom: 16 }}
          />
        )}

        {!otpVerified && (
          <Form
            name="verify_otp"
            onFinish={onVerifyOTP}
            layout="vertical"
            style={{ marginBottom: 16 }}
          >
            <Form.Item
              label="OTP Code"
              name="otp"
              rules={[{ required: true, message: 'Please enter the OTP code!' }]}
            >
              <Input.OTP size="large" style={{ width: '100%' }} placeholder="OTP Code" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block size="large" loading={isLoading}>
                Verify OTP
              </Button>
            </Form.Item>
          </Form>
        )}

        {otpVerified && (
          <div style={{ textAlign: 'center' }}>
            <Alert
              message="Success"
              description="Your OTP has been verified successfully! Redirecting to dashboard..."
              type="success"
              showIcon
              icon={<CheckCircleOutlined />}
            />
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Button
            type="link"
            onClick={handleResendOTP}
            disabled={resendDisabled || resendLoading}
            loading={resendLoading}
          >
            {resendLoading ? (
              <Spin indicator={<SyncOutlined spin />} />
            ) : (
              `Resend OTP (${resendTime}s)`
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default OTPVerificationPage;