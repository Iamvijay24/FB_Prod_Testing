import React, { useCallback } from 'react';
import { Typography, Row, Col, Button, Form, Input, message, Upload } from 'antd';
import FormBuilder from 'antd-form-builder';
import { IoCloudUploadOutline } from "react-icons/io5";
import { GrLinkNext } from "react-icons/gr";

const { Title, Text } = Typography;

const StartHere = () => {
  const [form] = Form.useForm();

  const DomainInput = ({onChange, value}) => (
    <Input placeholder="Ex: https://" size="large" onChange={onChange} value={value} variant="filled" style={{ width: '20rem' }} />
  );

  const handleSubmit = useCallback(values => {
    console.log(values);
  });

  const uploadProps = {
    name: 'file',
    listType: "text",
    action: 'https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload',
    headers: {
      authorization: 'authorization-text',
    },
    showUploadList: {
      showRemoveIcon: true, // Allows file removal
    },
    onChange(info) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        message.success(`${info.file.name} file uploaded successfully`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    beforeUpload: (file) => {
      form.setFieldsValue({ document: file });
      return false; // Prevent automatic upload
    },
  };

  const UploadInput = () => (
    <Upload {...uploadProps}>
      <Button size="large" type="text" icon={<IoCloudUploadOutline />}>Attachment</Button>
    </Upload>
  );

  const ContentInput = ({onChange, value, placeholder}) => (
    <Input placeholder={placeholder} size="large" onChange={onChange} value={value} variant="filled" style={{ width: '20rem' }} />
  );

  // Domain validation rule
  const domainValidationRule = {
    validator(_, value) {
      const domainRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!value) {
        return Promise.reject(new Error('Please enter your domain!'));
      }
      if (!domainRegex.test(value)) {
        return Promise.reject(new Error('Please enter a valid domain (e.g., https://example.com)!'));
      }
      return Promise.resolve();
    },
  };

  // Password validation rule
  const passwordValidationRule = {
    validator(_, value) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!value) {
        return Promise.reject(new Error('Please enter your password!'));
      }
      if (!passwordRegex.test(value)) {
        return Promise.reject(
          new Error(
            'Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character!'
          )
        );
      }
      return Promise.resolve();
    },
  };

  const meta = {
    initialValues: {},
    fields: [
      { key: 'domain', label: 'Enter Your Domain', widget: DomainInput, rules: [domainValidationRule] },
      { key: 'document', label: 'Document & Files', widget: UploadInput, wrapperCol: { span: 8 }, rules: [{
        required: true,
        message: 'Please select a file!',
      }]},
      { key: 'content_library', label: 'Content Library Name', placeholder: 'Content Library Name', required: true, widget: ContentInput },
      { key: 'user_name', label: 'Enter Your User Name', placeholder: 'User Name', required: true, widget: ContentInput },
      { key: 'password', label: 'Enter Your Password',placeholder: 'Password', widget: ContentInput, rules: [passwordValidationRule] },
    ],
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
          <Form layout="horizontal" form={form} onFinish={handleSubmit} onSubmit={handleSubmit}>
            <FormBuilder meta={meta} form={form} />
            <Form.Item style={{ textAlign: 'center', marginTop: 20 }}>
              <Button
                type="primary"
                size="large"
                icon={<GrLinkNext />}
                iconPosition="end"
                style={{ width: '10rem' }}
                onClick={() => {
                  console.log('Form Values Before Submission:', form.getFieldsValue());
                  form.submit();
                }}
              >
  Continue
              </Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </div>
  );
};

export default StartHere;