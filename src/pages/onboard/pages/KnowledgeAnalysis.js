import { Button, Col, Progress, Row, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { makeApiRequest } from "../../../shared/api";
import { getCookie, setCookie } from 'cookies-next';

const { Title, Text } = Typography;

const KnowledgeAnalysis = ({ setCurrent, kbName, kbDescription }) => {
  const [statusData, setStatusData] = useState(0);
  const [isLoading, setLoading] = useState(true);
  const [kbId, setKbId] = useState(null);

  const FILEID = getCookie('fb_file_id');

  useEffect(() => {
    CreateKb();
  }, []);

  useEffect(() => {
    if (kbId && statusData?.progress < 100) {
      const interval = setInterval(() => {
        getKBStatus(kbId);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [kbId, statusData]);

  const getKBStatus = async(kb_id) => {
    try {
      setLoading(true);
      const response = await makeApiRequest("get_kb_status", {
        partner_id: "c5c05e02d6",
        kb_id: kb_id,
      });

    

      setStatusData(response?.data);
    } catch (error) {
      console.error("Error fetching status:", error);
    } finally {
      setLoading(false);
    }
  };

  const CreateKb = async() => {
    try {
      const response = await makeApiRequest("create_kb", {
        partner_id: "c5c05e02d6",
        file_id: FILEID,
        kb_name: kbName,
        kb_description: kbDescription || null,
      });

      if (response?.data?.kb_id) {
        setKbId(response.data.kb_id);
        getKBStatus(response.data.kb_id);
        setCookie('fb_kb_id', response.data.kb_id);
      }
    } catch (error) {
      console.error("Error creating KB:", error);
    }
  };

  return (
    <div style={{ padding: '40px 20px', textAlign: 'center' }}>
      <Row justify="center">
        <Col xs={24} sm={20} md={16} lg={12} xl={14}>
          <Title level={3} style={{ fontWeight: "normal" }}>
            Knowledge Analyzing & Sorting
          </Title>
          <Title level={5} style={{ marginTop: 8, fontWeight: "normal" }}>
            Hang tight! We're processing it - Don't close this window.
          </Title>
          <Text style={{ display: 'block', marginTop: 14, padding: '0 24px', color: 'gray' }}>
            We focus on assessing and structuring information to enhance clarity and coherence. This process includes a detailed examination of the content, identifying key themes or patterns, and organizing it into a logical, accessible format. The goal is to optimize content for better understanding and usability.
          </Text>
        </Col>
      </Row>

      <Progress
        percent={statusData?.progress}
        status="active"
        size={[600, 30]}
        showInfo
        style={{ marginTop: 50, borderRadius: "4px" }}
        strokeColor={{
          from: '#108ee9',
          to: '#87d068',
        }}
      />

      <div style={{ marginTop: 50 }}>
        <Button
          type="primary"
          disabled={isLoading || statusData?.progress < 100}
          size="large"
          onClick={() => setCurrent(2)}
        >
          {isLoading || statusData?.progress < 100 ? "Please wait" : "Save & Continue"}
        </Button>
      </div>
    </div>
  );
};

export default KnowledgeAnalysis;
