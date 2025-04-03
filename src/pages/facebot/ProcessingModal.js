import {
  Button,
  Modal,
  Space,
  Typography,
  Result,
  Progress,
} from "antd";
import React from "react";
import { FaCheckCircle, FaHourglassHalf } from "react-icons/fa";

const { Paragraph } = Typography;

const ProcessingModal = ({ isProcessing, setIsProcessing, progress }) => {
  return (
    <Modal
      title={
        <Space align="center">
          <FaHourglassHalf spin /> {progress < 100 ? "Your FaceBot is Processing..." : "Your FaceBot is Ready!"}
        </Space>
      }
      open={isProcessing}
      onOk={() => setIsProcessing(false)}
      onCancel={() => setIsProcessing(false)}
      width={600}
      closable={false}
      maskClosable={false}
      centered
      bodyStyle={{ padding: "32px" }}
      style={{ borderRadius: "12px" }}
      footer={[
        <Button
          key="close"
          type="primary"
          onClick={() => setIsProcessing(false)}
          disabled={progress < 100}
        >
          Close
        </Button>,
      ]}
    >
      <Result
        status="info"
        icon={<Progress type="circle" percent={progress} width={180} />}
        title={
          progress < 100 ? (
            "Setting up your AI-Powered FaceBot!"
          ) : (
            <>
              <Space align="center">
                <FaCheckCircle style={{ color: "green" }} /> FaceBot Ready!
              </Space>
            </>
          )
        }
        subTitle={
          progress < 100 ? (
            <Paragraph>
              We're working hard to get your FaceBot ready. This may take a few
              minutes.
            </Paragraph>
          ) : (
            <Paragraph>
              Your FaceBot is now fully set up and ready to go! Click "Close"
              to continue.
            </Paragraph>
          )
        }
      />
    </Modal>
  );
};

export default ProcessingModal;