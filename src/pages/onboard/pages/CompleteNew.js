import { Button, Col, Row, Space, Typography } from "antd";
import React, { useContext, useEffect, useState, useRef } from "react";
import CheckMark from "../../../assets/check.svg";
import { makeApiRequest } from "../../../shared/api";
import styles from "./style.module.scss";
import { useNavigate } from "react-router-dom";
import { FbContext } from "../../../shared/rbac/context";
import { getCookie } from "cookies-next";

const { Title, Text } = Typography;

const Complete = ({ IsAvatarId }) => {
  const [, setLoading] = useState(false);
  const navigate = useNavigate();
  const authCxt = useContext(FbContext);
  const [loginButtonEnabled, setLoginButtonEnabled] = useState(false);
  const [countdown, setCountdown] = useState(5); // Initialize countdown to 5 seconds
  const loginTimeoutRef = useRef(null);
  const countdownTimerRef = useRef(null);

  const KB_ID = getCookie('fb_kb_id');
  const PARTNER_ID = getCookie('fb_partner_id');
  const FACEBOT_ID = getCookie('fb_id');

  useEffect(() => {
    if(FACEBOT_ID){
      StartGenerateBGKB();
    }
  }, []);

  useEffect(() => {
    // Clear any existing timeouts/intervals
    clearTimeout(loginTimeoutRef.current);
    clearInterval(countdownTimerRef.current);

    // Set the initial state of the login button to disabled
    setLoginButtonEnabled(false);
    setCountdown(5);

    // Enable the login button after 5 seconds
    loginTimeoutRef.current = setTimeout(() => {
      setLoginButtonEnabled(true);
      clearInterval(countdownTimerRef.current); // Stop countdown when enabled
    }, 5000);

    // Countdown logic
    if (!loginButtonEnabled) {
      countdownTimerRef.current = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown > 1) {
            return prevCountdown - 1;
          } else {
            return 0; // Ensure it stays at 0 when the timer reaches 0.
          }
        });
      }, 1000);
    }

    return () => {
      // Cleanup timeouts and intervals
      clearTimeout(loginTimeoutRef.current);
      clearInterval(countdownTimerRef.current);
    };
  }, []); // Empty dependency array

  const StartGenerateBGKB = async() => {
    try {
      setLoading(true);
      await makeApiRequest("generate_kb_bg", {
        partner_id: PARTNER_ID,
        fb_id: `${PARTNER_ID}:::${KB_ID}:::${IsAvatarId}`,
      });
      authCxt.setOnboarded(true);
    } catch (error) {
      console.error("Error fetching avatars:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Row justify="center">
        <Col xs={24} sm={20} md={16} lg={12} xl={14}>
          <Title level={3} style={{ fontWeight: "normal" }}>
            Setup Complete
          </Title>
          <Text className={styles.description}>
            Once your avatar is ready, you'll be fully equipped to explore,
            interact, and engage with the virtual space in a way that reflects
            your style.
          </Text>
         

          <Row gutter={16} align="middle" style={{ marginTop: 40 }}>
            <Col span={10}>
              {/* First Row */}
              <Row style={{ marginBottom: 16, alignItems: "center" }}>
                <Col>
                  <Text strong>
                    <img
                      src={CheckMark}
                      alt=""
                      style={{ verticalAlign: "middle", marginRight: 8 }}
                    />
                    Knowledge Analysis and Sorting
                  </Text>
                </Col>
              </Row>

              {/* Second Row */}
              <Row style={{ marginBottom: 16, alignItems: "center" }}>
                <Col>
                  <Text strong>
                    <img
                      src={CheckMark}
                      alt=""
                      style={{ verticalAlign: "middle", marginRight: 8 }}
                    />
                    Knowledge Verification
                  </Text>
                </Col>
              </Row>

              {/* Third Row */}
              <Row style={{ alignItems: "center" }}>
                <Col>
                  <Text strong>
                    <img
                      src={CheckMark}
                      alt=""
                      style={{ verticalAlign: "middle", marginRight: 8 }}
                    />
                    Creating FaceBot
                  </Text>
                </Col>
              </Row>
            </Col>
            <br style={{ marginTop: 16 }} />

            <Text type="danger" style={{ marginTop: 16 }}>
            Almost there! Your FaceBot is being prepared and will be ready in
            approximately 10-15 minutes. Keep an eye on your inbox for an email
            when it's complete.
            </Text>
          </Row>
        </Col>
        
      </Row>

      
      <div
        style={{ maxWidth: 850, margin: "auto", padding: 20, marginTop: 40 }}
      >
        <Space>
          <Button
            size="large"
            type="primary"
            style={{ width: "10rem" }}
            onClick={() => navigate("/dashboard")}
            disabled={!loginButtonEnabled}
          >
            Go to Dashboard {loginButtonEnabled ? "" : `(${countdown})`}
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default Complete;