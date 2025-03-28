import { Button, Col, Form, message, Row, Typography, Upload } from 'antd';
import React, { useEffect, useState } from 'react';
import { GrLinkNext } from "react-icons/gr";
import { makeApiRequest } from '../../../shared/api';
import { v4 as uuidv4 } from "uuid";
import axios from 'axios';
import { setCookie } from 'cookies-next';

const { Title, Text } = Typography;

const StartHere = ({ setCurrent }) => {
  const [fileList, setFileList] = useState([]); // Initialize as an array
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setCookie('fb_partner_id', "c5c05e02d6");
  }, []);

  // Function to get the upload URL and fields from backend
  const getUploadUrl = async () => {
    try {
      const newUuid = uuidv4(); // Generate a new UUID
      let params = {
        file_id: newUuid.slice(0, 8), // unique id
        file_type: "pdf",
      };

      setCookie('fb_file_id', params.file_id);

      const response = await makeApiRequest("get_upload_url", params);

      if (!response || !response.data) {
        console.error("Invalid response from makeApiRequest:", response);
        message.error(
          "Failed to get upload URL: Invalid response from the server."
        );
        return null;
      }

      return response.data.upload_url;

    } catch (error) {
      console.error("Error getting upload URL:", error);
      message.error("Failed to get upload URL. Please try again.");
      return null;
    }
  };

  const handleUpload = async () => {
    if (!fileList || fileList.length === 0) { // Check fileList correctly
      message.error('Please upload a file.');
      return;
    }

    if (uploading) {
      return;
    }

    setUploading(true);

    try {
      const uploadData = await getUploadUrl(); // Get the upload data
      if (!uploadData) {
        setUploading(false);
        return;
      }

      const formData = new FormData();

      // Append the fields to the form data 
      if (uploadData.fields) {
        for (const key in uploadData.fields) {
          formData.append(key, uploadData.fields[key]);
        }
      }

      // Append the file to the form data
      formData.append('file', fileList[0]);  // Access file obj

      await axios.post(uploadData.url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploading(false);
      message.success('File uploaded successfully!');

      // Redirect to the next step
      setCurrent(1);

    } catch (error) {
      setUploading(false);
      console.error('Error uploading file:', error);
      message.error('File upload failed: ' + error.message);
    }
  };

  const props = {
    multiple: false,
    maxCount: 1, 
    accept: ".pdf, .html, .txt", 
    onRemove: () => {
      setFileList([]); 
    },
    beforeUpload: (file) => {
      const maxSize = 1 * 1024 * 1024;
      const allowedTypes = ["application/pdf", "text/html", "text/plain"]; 

    if (!allowedTypes.includes(file.type)) {
      message.error("Invalid file type. Only PDF, HTML, and TXT files are allowed.");
      return false;
    } 

      if (file.size > maxSize) {
        message.error("File size must be 1MB or less. Please try again!");
        return false; 
      }

      setFileList([file]); 
      return false; 
    },
    fileList,
  };



  return (
    <div style={{ padding: '40px 20px', textAlign: 'center' }}>
      <Row justify="center">
        <Col xs={24} sm={20} md={16} lg={12} xl={14}>
          <Title level={3} style={{ fontWeight: "normal" }}>Get started with building your FaceBot</Title>
          <Title level={5} style={{ marginTop: 8 }}>
            Bring together all the insights about your product / service
          </Title>
          <Text style={{ display: 'block', marginTop: 14, padding: '0 24px', color: 'gray' }}>
            Gathering and consolidating all the knowledge you have about your products or services is essential for creating a comprehensive understanding of what you offer. By organizing this information into accessible formats, such as a URL, PDF, or Word documents, you ensure that it's readily available for analysis. Please attach all relevant documents here for easy access.
          </Text>
        </Col>
      </Row>

      <Row justify="center" style={{ marginTop: 20 }}>
        <Col xs={24} sm={20} md={16} lg={12} xl={10}>
        <div style={{ 
      maxHeight: '500px', 
      overflowY: 'auto', 
      padding: '20px' 
    }}>
          <Upload.Dragger {...props}>
            <div className="ant-upload-drag-icon" style={{ marginBottom: '10px' }}></div>
            <p className="ant-upload-text">
              Drag & Drop files here or <span style={{ color: '#1890ff', cursor: 'pointer' }}>Click to Browse</span>
            </p>
            <p className="ant-upload-hint">
              Allowed file types: <strong>PDF, HTML and TXT</strong> only. Max file size: 1MB.
            </p>
          </Upload.Dragger>
          </div>
          <Form.Item style={{ textAlign: 'center', marginTop: 20 }}>
            <Button
              type="primary"
              size="large"
              icon={<GrLinkNext />}
              iconPosition="end"
              style={{ width: '10rem' }}
              onClick={handleUpload}
              disabled={!fileList || fileList.length === 0 || uploading}
              loading={uploading}
            >
              Continue
            </Button>
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
};

export default StartHere;