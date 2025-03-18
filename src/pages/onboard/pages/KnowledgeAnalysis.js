import { Button, Col, Progress, Row, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { GrLinkNext } from 'react-icons/gr';
import { makeApiRequest } from "../../../shared/api";
import { getCookie, setCookie } from 'cookies-next';
import Skeleton from 'react-loading-skeleton';

const { Title, Text } = Typography;

const KnowledgeAnalysis = ({ setCurrent }) => {
  const [statusData, setStatusData] = useState(0);
  const [isLoading, setLoading] = useState(true);

  const FILEID = getCookie('fb_file_id');

  useEffect(() => {
    CreateKb();
  }, []);

  const getKBStatus = async(kb_id) => {
    try {
      setLoading(true); // Keep setLoading true while fetching status
      const response = await makeApiRequest("get_kb_status", {
        partner_id: "c5c05e02d6",
        kb_id: kb_id,
      });
      setStatusData(response?.data?.progress);
    } catch (error) {
      console.error("Error fetching avatars:", error);
    } finally {
      setLoading(false); // setLoading to false when status fetch is complete (success or error)
    }
  };

  const CreateKb = async() => {
    try {
      const response = await makeApiRequest("create_kb", {
        partner_id: "c5c05e02d6",
        file_id: FILEID,
      });

      setCookie('fb_kb_id', response?.data?.kb_id);
      getKBStatus(response?.data?.kb_id);

    } catch (error) {
      console.error("Error fetching avatars:", error);
    } finally {
    }
  };

  return (
    <div style={{ padding: '40px 20px', textAlign: 'center' }}>
      <Row justify="center">
        <Col xs={24} sm={20} md={16} lg={12} xl={14}>
          <Title level={3} style={{ fontWeight: "normal" }}>
             Knowledge Analysing & sorting
          </Title>
          <Title level={5} style={{ marginTop: 8, fontWeight: "normal" }}>
       Hang tight! We're processing it - Don't close this window.
          </Title>
          <Text style={{ display: 'block', marginTop: 14, padding: '0 24px', color: 'gray' }}>
         
              we focus on assessing and structuring information to enhance clarity and coherence. This process includes a detailed examination of the content, identifying key themes or patterns, and organising it into a logical, accessible format. The goal is to optimise content for better understanding and usability.
          </Text>
        </Col>
      </Row>

      <Progress
        percent={statusData}
        status="active"
        percentPosition={{
          align: 'center',
          type: 'inner',
        }}
        size={[600, 30]}
        showInfo={true}
        style={{ marginTop: 50, borderRadius: "4px" }}
        strokeColor={{
          from: '#108ee9',
          to: '#87d068',
        }}
      />

      <div style={{ marginTop: 50 }}>
        <Button
          type="primary"
          disabled={isLoading}
          size="large"
          icon={<GrLinkNext />}
          iconPosition="end"
          onClick={() => setCurrent(2)}
        >
          {isLoading ? <Skeleton width={100} /> : "SAVE & CONTINUE"}
        </Button>
      </div>

    </div>
  );
};

export default KnowledgeAnalysis;