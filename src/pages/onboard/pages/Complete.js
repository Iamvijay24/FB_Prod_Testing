import { Button, Col, Modal, Row, Space, Typography, message } from "antd";
import React, { useState, useRef, useEffect, useContext } from "react";
import styles from "./style.module.scss";
import CheckMark from "../../../assets/check.svg";
import { makeApiRequest } from "../../../shared/api";
import { FbContext } from "../../../shared/rbac/context";

const { Title, Text } = Typography;

const Complete = ({IsAvatarId}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const preRef = useRef(null);
  const [code, setCode] = useState("");
  const [, setLoading] = useState(false);

  const authCxt = useContext(FbContext);

  useEffect(() => {
    getCode();
  }, [isModalOpen]);

  const handleGetCode = () => {
    if (preRef.current) {
      const code = preRef.current.innerText;
      navigator.clipboard
        .writeText(code)
        .then(() => {
          message.success("Code copied to clipboard!");
          setTimeout(() => {
            setIsModalOpen(false);
            authCxt.setOnboarded(true);
          }, 1000);
        })
        .catch((err) => {
          console.error("Failed to copy: ", err);
        });
    }
  };

  const handleDownload = () => {
    if (preRef.current) {
      const code = preRef.current.innerText;
      const blob = new Blob([code], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "code.html";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const getCode = async() => {
    try {
      setLoading(true); // Set loading to true at the start of the request
      const response = await makeApiRequest("get_widget_code", {
        partner_id: "c5c05e02d6",
        fb_id: "c5c05e02d6:::kb_009:::av_008",
      });
      setCode(response.data[0]);
    } catch (error) {
      console.error("Error fetching avatars:", error);
    } finally {
      setLoading(false); // Set loading to false regardless of success or failure
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

          <Row align="middle" style={{ marginTop: 40 }}>
            <Col>
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
          </Row>
        </Col>
      </Row>
      <div
        style={{ maxWidth: 850, margin: "auto", padding: 20, marginTop: 40 }}
      >
        <Space>
          <Button
            type="primary"
            size="large"
            onClick={() => setIsModalOpen(true)}
          >
            Publish and Get Code
          </Button>
          <Button size="large" disabled style={{ width: "10rem" }} htmlType="submit">
            Login
          </Button>
        </Space>
      </div>

      <Modal
        title="Published: Your Code is Ready for Integration"
        open={isModalOpen}
        onOk={() => setIsModalOpen(false)}
        onCancel={() => setIsModalOpen(false)}
        width={800}
        footer={[
          <Button key="get-code" type="primary" onClick={handleGetCode}>
            GET CODE
          </Button>,
          <Button key="download" onClick={handleDownload}>
            DOWNLOAD
          </Button>,
        ]}
      >
        <div>
          <p>
            This means that all necessary steps have been completed, and you can
            now proceed with incorporating the code to enhance functionality,
            improve performance, or enable new features.
          </p>

          <div style={{ overflow: "auto", backgroundColor: "#f8f8f8", padding: "30px", marginTop: "20px" }}>
            <pre ref={preRef}>{code?.facebot_script}</pre>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Complete;
