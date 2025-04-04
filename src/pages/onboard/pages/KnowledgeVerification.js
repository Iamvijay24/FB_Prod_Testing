import {
  Button,
  Col,
  Collapse,
  Divider,
  Flex,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Tooltip,
  Typography,
  message,
} from "antd";
import React, { useState, useEffect, useRef } from "react";
import styles from "./style.module.scss";
import { LuLayoutDashboard } from "react-icons/lu";
import { FaRegQuestionCircle } from "react-icons/fa";
import { makeApiRequest } from "../../../shared/api";
import { getCookie } from "cookies-next";
import Skeleton from "react-loading-skeleton";
import CheckMark from "../../../assets/check.svg";
import { PlusOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const KnowledgeVerification = ({ setCurrent, setKbLibrary }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState({});
  const [kbData, setKbData] = useState(null);
  const [content, setContent] = useState({});
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [approvedItems, setApprovedItems] = useState({});
  const [activeKeys, setActiveKeys] = useState([]);
  const [isApproving, setIsApproving] = useState({});
  const [form] = Form.useForm();
  const [questions, setQuestions] = useState({});
  const [openAddQuestionModal, setOpenAddQuestionModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [, setNewQuestionData] = useState({ question: '', answer: '', category: '' });

  const KB_ID = getCookie("fb_kb_id");
  const PARTNER_ID = getCookie("fb_partner_id");

  const cardItems = [
    {
      title: "Categories",
      value: categories.length,
      icon: <LuLayoutDashboard size={20} />,
    },
    {
      title: "Questions",
      value: kbData?.kb_answers?.length || 0,
      icon: <FaRegQuestionCircle size={20} />,
    },
  ];

  const onChange = (value) => {
    setSelectedCategory(value);
  };


  const handleCollapseChange = (keys) => {
    setActiveKeys(keys); // Update activeKeys state
  };

  const handleApproveAll = async() => {
    if (!selectedCategory) {
      message.error("Please select a category to approve.");
      return;
    }

    try {
      setIsLoading(true);
      // Find kb_answers in the specified category
      const kb_answers_to_approve = kbData?.kb_answers.filter(
        (item) =>
          item.category.toLowerCase().replace(/ /g, "_") === selectedCategory
      );

      if (!kb_answers_to_approve || kb_answers_to_approve.length === 0) {
        message.warning(
          `No questions found in category: ${selectedCategory} to approve.`
        );
        return;
      }

      const category_update = kb_answers_to_approve.map((item) => ({
        question_index: item.question_index,
        question: questions[item.question_index] || item.question, // Use state value or original
        answer: content[item.question_index],
      }));

      // Prepare payload
      const payload = {
        action: "update_kb_category",
        kb_id: KB_ID,
        partner_id: PARTNER_ID,
        category: kb_answers_to_approve[0].category,
        category_update: category_update,
      };

      const response = await makeApiRequest("update_kb_category", payload);

      if (response.data === "Successfully updated") {
        message.success(
          `Successfully approved all questions in category: ${selectedCategory}`
        );
        // Update approvedItems state for all approved items
        const updatedApprovedItems = { ...approvedItems };
        kb_answers_to_approve.forEach((item) => {
          updatedApprovedItems[item.question_index] = true;
        });
        setApprovedItems(updatedApprovedItems);
        GetKb(); // Refresh KB data after approval
      } else {
        message.error(
          `Failed to approve all questions in category: ${selectedCategory}.`
        );
      }
    } catch (error) {
      message.error("An error occurred while approving the category.");
    } finally {
      setIsLoading(false);
    }
  };

  const options = categories.map((category) => ({
    label: category,
    value: category.toLowerCase().replace(/ /g, "_"), // create values from the category for select options
  }));

  // Update text dynamically
  const handleTextChange = (question_index, newText) => {
    setContent((prev) => ({
      ...prev,
      [question_index]: newText,
    }));
    setApprovedItems((prev) => {
      const { [question_index]: removed, ...rest } = prev;
      return rest;
    });
  };

  const handleQuestionChange = (question_index, newQuestion) => {
    setQuestions((prev) => ({
      ...prev,
      [question_index]: newQuestion,
    }));
  };

  const handleApprove = async(item) => {
    setIsApproving((prev) => ({ ...prev, [item.question_index]: true })); // Start loading
    try {
      // update the item.answer to the state content
      const answer = content[item.question_index];
      const question = questions[item.question_index] || item.question;

      const response = await makeApiRequest("update_kb_question", {
        action: "update_kb_question",
        kb_id: item.kb_id,
        question_index: item.question_index,
        question: question,
        answer: answer,
        category: item.category,
        partner_id: PARTNER_ID,
      });

      if (response.data === "Successfully updated") {
        message.success("Successfully approved question");
        setApprovedItems((prev) => ({ ...prev, [item.question_index]: true })); // Update approved state
      } else {
        message.error("Failed to approve question");
      }
    } catch (error) {
      console.error("Error approving question:", error);
      message.error("An error occurred while approving the question.");
    } finally {
      setIsApproving((prev) => ({ ...prev, [item.question_index]: false })); // Stop loading
    }
  };

  useEffect(() => {
    GetKb();
  }, []);

  const GetKb = async() => {
    try {
      setIsLoading(true);
      const response = await makeApiRequest("get_kb", {
        partner_id: "c5c05e02d6",
        kb_id: KB_ID,
      });

      // Check if response.data is an array
      if (Array.isArray(response.data)) {
        setKbData({ kb_answers: response.data }); // Wrap data in 'kb_answers' property
        // Extract categories
        const uniqueCategories = [
          ...new Set(response.data.map((item) => item.category)),
        ];

        // Extract Library 
        const uniqueLibrary = [
          ...new Set(response.data?.map((item) => item?.kb_name)),
        ];
        setKbLibrary(uniqueLibrary);

        setCategories(uniqueCategories);

        // Initialize content state with the API data
        const initialContent = {};
        const initialQuestions = {};
        response.data.forEach((item) => {
          initialContent[item.question_index] = item.answer;
          initialQuestions[item.question_index] = item.question;
        });
        setContent(initialContent);
        setQuestions(initialQuestions);
      } else {
        console.error("API response data is not an array:", response.data);
        message.error(
          "Failed to load knowledge base data. Invalid data format."
        );
        setKbData({ kb_answers: [] });
      }
    } catch (error) {
      console.error("Error fetching avatars:", error);
      message.error("Failed to load knowledge base data.");
    } finally {
      setIsLoading(false);
    }
  };

  const skeletonItems = Array.from({ length: 5 }).map((_, index) => ({
    key: `skeleton-${index}`,
    label: <Skeleton width="80%" />,
    children: (
      <div>
        <Skeleton count={3} />
        <Flex justify="flex-end" gap={16}>
          <Skeleton.Button style={{ width: "75px", height: "30px" }} />
          <Skeleton.Button style={{ width: "75px", height: "30px" }} />
        </Flex>
      </div>
    ),
  }));

  const filteredKbAnswers = selectedCategory
    ? kbData?.kb_answers?.filter(
      (item) =>
        item.category.toLowerCase().replace(/ /g, "_") === selectedCategory
    )
    : kbData?.kb_answers;

  const items =
    filteredKbAnswers?.map((item) => ({
      key: item.question_index,
      label: (
        <Text
          editable={{
            onChange: (value) => handleQuestionChange(item.question_index, value),
          }}
        >
          {item.question}
        </Text>
      ),
      children: (
        <div>
          <Tooltip title={"Click to edit"}>
            <Text
              editable={{
                onChange: (value) => handleTextChange(item.question_index, value),
                onBlur: () => {
                  setIsEditing((prev) => ({
                    ...prev,
                    [item.question_index]: false,
                  }));
                },
                onPressEnter: () =>
                  setIsEditing((prev) => ({
                    ...prev,
                    [item.question_index]: false,
                  })),
                triggerType: "text",
                autoFocus: isEditing[item.question_index],
              }}
              style={{ display: "block", marginBottom: "10px" }}
            >
              {content[item.question_index] || "Loading..."}
            </Text>
          </Tooltip>
          <Flex justify="flex-end" gap={16}>
            <Button
              type="primary"
              size="large"
              style={{
                backgroundColor: approvedItems[item.question_index]
                  ? "gray"
                  : "#2fcc71",
                color: "white",
              }}
              onClick={() => handleApprove(item)}
              disabled={approvedItems[item.question_index]}
              loading={isApproving[item.question_index]}
            >
              {approvedItems[item.question_index] ? "Approved" : "Approve"}
            </Button>
          </Flex>
        </div>
      ),
      extra: approvedItems[item.question_index] ? (
        <img src={CheckMark} alt="Approved" />
      ) : null,
    })) || [];

  const handleAddQuestion = () => {
    setOpenAddQuestionModal(true);
  };

  const handleAddQuestionModalOk = async() => {
    try {
      await form.validateFields();
      setIsLoading(true);

      const newQuestion = form.getFieldsValue();

      // Determine the next available question index
      const nextQuestionIndex = kbData.kb_answers && kbData.kb_answers.length + 1 ;

      const payload = {
        action: "update_kb_question",
        kb_id: KB_ID,
        question_index: nextQuestionIndex.toString(), // Use the generated index
        question: newQuestion.question,
        answer: newQuestion.answer,
        category: newQuestion.category,
        partner_id: PARTNER_ID,
      };

      const response = await makeApiRequest("update_kb_question", payload);

      if (response.data === "Successfully updated") {
        message.success("Successfully added new question");
        setOpenAddQuestionModal(false);
        form.resetFields();

        // Refresh the KB data to display the newly added question
        GetKb();
      } else {
        message.error("Failed to add new question");
      }
    } catch (error) {
      console.error("Error adding new question:", error);
      message.error("An error occurred while adding the question.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddQuestionModalCancel = () => {
    setOpenAddQuestionModal(false);
    form.resetFields();
  };

  const handleCategoryChange = (value) => {
    setNewQuestionData(prev => ({ ...prev, category: value }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewQuestionData(prev => ({ ...prev, [name]: value }));
  };

  const inputRef = useRef(null);

  const onNameChange = (event) => {
    setNewCategory(event.target.value);
  };

  const addItem = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setNewCategory('');

      // Focus back on input after adding new category
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);

      message.success("Successfully added new category");
    } else if (categories.includes(newCategory)) {
      message.warning('Category already exists');
    }
    else{
      message.warning('Please provide category');
    }
  };


  return (
    <div className={styles.container}>
      <Row justify="center">
        <Col xs={24} sm={20} md={16} lg={12} xl={14}>
          <Title level={3} style={{ fontWeight: "normal" }}>
            {isLoading ? (
              <Skeleton width={200} />
            ) : (
              "Knowledge Verification & Editing"
            )}
          </Title>
          {isLoading ? (
            <Skeleton count={2} />
          ) : (
            <Text className={styles.description}>
              This process involves thoroughly reviewing and confirming the
              accuracy, relevance, and completeness of information related to
              your products, services, or processes. It ensures that all data
              is up-to-date, factual, and aligned with your objectives. The
              editing phase focuses on refining the content for clarity,
              consistency, and proper structure, ensuring it is presented in a
              professional, easy-to-understand manner. This step is crucial for
              maintaining the integrity of your materials, boosting credibility,
              and facilitating effective communication.
            </Text>
          )}

          <Title level={4} style={{ fontWeight: "normal", marginTop: "4rem" }}>
            {isLoading ? (
              <Skeleton width={250} />
            ) : (
              "Key Findings on Product / Service Performance"
            )}
          </Title>

          <Flex wrap className={styles.cardContainer}>
            {isLoading
              ? Array.from({ length: 2 }).map((_, index) => (
                <div className={styles.card} key={index}>
                  <Skeleton inline />
                </div>
              ))
              : cardItems.map((item, index) => (
                <div className={styles.card} key={index}>
                  <Space>
                    {item.icon}
                    <Text className={styles.cardTitle}>{item.title}</Text>
                  </Space>
                  <Title level={2} className={styles.cardValue}>
                    {item.value}
                  </Title>
                </div>
              ))}
          </Flex>

          <Title
            level={4}
            style={{
              fontWeight: "normal",
              marginTop: "4rem",
              marginBottom: "1rem",
            }}
          >
            {isLoading ? (
              <Skeleton width={400} />
            ) : (
              <span>
                Please verify the contents to ensure accuracy & completeness.
                <br />
                Before proceeding with approval by categories.
              </span>
            )}
          </Title>

          <Space>
            {isLoading ? (
              <Skeleton width={200} />
            ) : (
              <Select
                showSearch
                placeholder="Select a category"
                optionFilterProp="label"
                onChange={onChange}
                options={options}
                allowClear
                size="large"
                style={{ width: "20rem" }}
              />
            )}
            <Button
              type="primary"
              size="large"
              style={{ width: "10rem" }}
              onClick={handleApproveAll}
              disabled={isLoading}
            >
              {isLoading ? <Skeleton width={80} /> : "Approve all"}
            </Button>

            <Button
              type="primary"
              size="large"
              style={{ width: "10rem" }}
              onClick={handleAddQuestion}
              disabled={isLoading}
            >
              {isLoading ? <Skeleton width={80} /> : "Add new question"}
            </Button>
          </Space>

          <div className={styles.approveCard}>
            <Form form={form} component={false}>
              <Collapse
                activeKey={activeKeys}
                onChange={handleCollapseChange}
                expandIconPosition="end"
                size="large"
                items={isLoading ? skeletonItems : items}
              />
            </Form>
          </div>
        </Col>
      </Row>

      {!isLoading && (
        <div className={styles.hoverFooterWrapper}>
          <div>
            <Title
              level={4}
              style={{ margin: 0, fontWeight: "normal", color: "gray" }}
            >
              Findings Verified
            </Title>
          </div>

          <span className={styles.sectionShadow} />

          <div className={styles.section}>
            <Title level={3} style={{ margin: 0, fontWeight: "normal" }}>
              {categories.length ?? 0}
            </Title>
            <FaRegQuestionCircle size={22} color="gray" />
            <Text style={{ color: "gray" }}>Categories</Text>
          </div>

          <div className={styles.section}>
            <Title level={3} style={{ margin: 0, fontWeight: "normal" }}>
              {kbData?.kb_answers?.length ?? 0}
            </Title>
            <FaRegQuestionCircle size={22} color="gray" />
            <Text style={{ color: "gray" }}>Questions</Text>
          </div>

          <div>
            <Button
              type="primary"
              disabled={isLoading || Object.keys(isApproving).length === 0}
              onClick={() => {
                setCurrent(3);
              }}
              size="large"
              style={{ width: "100%" }}
            >
              Save & Continue
            </Button>
          </div>
        </div>
      )}

      <Modal
        open={openAddQuestionModal}
        onOk={handleAddQuestionModalOk}
        onCancel={handleAddQuestionModalCancel}
        width={400}
        centered
        title="Add New Question"
        footer={<>
          <Button onClick={handleAddQuestionModalCancel}>Cancel</Button>
          <Button type="primary" onClick={handleAddQuestionModalOk}>Add</Button>
        </>}
      >

        <Form form={form} layout="vertical">
          <Text>Please enter the question and answer.</Text>
          <Form.Item
            name="question"
            label="Question"
            rules={[{ required: true, message: "Please enter a question!" }]}
          >
            <Input
              placeholder="Question"
              size="large"
              name="question"
              onChange={handleInputChange}
            />
          </Form.Item>
          <Form.Item
            name="answer"
            label="Answer"
            rules={[{ required: true, message: "Please enter an answer!" }]}
          >
            <Input.TextArea
              placeholder="Answer"
              rows={2}
              size="large"
              name="answer"
              onChange={handleInputChange}
            />
          </Form.Item>
          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: "Please select a category!" }]}
          >
            <Select
              showSearch
              placeholder="Select a category"
              optionFilterProp="label"
              onChange={handleCategoryChange}
              options={options}
              allowClear
              size="large"
              dropdownRender={menu => (
                <div>
                  {menu}
                  <Divider style={{ margin: '8px 0' }} />
                  <Space style={{ padding: '0 8px 4px' }}>
                    <Input
                      placeholder="Please enter item"
                      ref={inputRef}
                      value={newCategory}
                      onChange={onNameChange}
                      onKeyDown={e => e.stopPropagation()}
                    />
                    <Button type="text" icon={<PlusOutlined />} onClick={addItem}>
                      Add item
                    </Button>
                  </Space>
                </div>
              )}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default KnowledgeVerification;