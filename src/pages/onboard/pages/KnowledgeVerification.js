import { Button, Col, Collapse, Flex, Row, Select, Space, Typography, message } from "antd";
import React, { useState, useEffect } from "react";
import styles from "./style.module.scss";
import { LuLayoutDashboard } from "react-icons/lu";
import { FaRegQuestionCircle } from "react-icons/fa";
import { makeApiRequest } from "../../../shared/api";
import { getCookie } from "cookies-next";
import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css';

const { Title, Text } = Typography;

const KnowledgeVerification = ({ setCurrent }) => {
  const [isLoading, setIsLoading] = useState(true); // Initially loading
  const [isEditing, setIsEditing] = useState({});
  const [kbData, setKbData] = useState(null);
  const [content, setContent] = useState({}); // Initialize as empty object
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [approvedItems, setApprovedItems] = useState({}); // Track approved items
  const [activeKeys, setActiveKeys] = useState([]);

  const KB_ID = getCookie('fb_kb_id');
  const PARTNER_ID = getCookie('fb_partner_id');

  const cardItems = [
    { title: "Categories", value: categories.length, icon: <LuLayoutDashboard size={20} /> },
    { title: "Questions", value: kbData?.kb_answers?.length || 0, icon: <FaRegQuestionCircle size={20} /> },
  ];

  const onChange = (value) => {
    setSelectedCategory(value);
  };

  const onSearch = (value) => {
    console.log(value);
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
        (item) => item.category.toLowerCase().replace(/ /g, "_") === selectedCategory
      );

      if (!kb_answers_to_approve || kb_answers_to_approve.length === 0) {
        message.warning(`No questions found in category: ${selectedCategory} to approve.`);
        return;
      }

      // Prepare category_update array
      const category_update = kb_answers_to_approve.map((item) => ({
        question_index: item.question_index,
        question: item.question,
        answer: item.answer, // Use the current (potentially edited) answer
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
        message.success(`Successfully approved all questions in category: ${selectedCategory}`);
        // Update approvedItems state for all approved items
        const updatedApprovedItems = { ...approvedItems };
        kb_answers_to_approve.forEach((item) => {
          updatedApprovedItems[item.question_index] = true;
        });
        setApprovedItems(updatedApprovedItems);
        GetKb(); // Refresh KB data after approval
      } else {
        message.error(`Failed to approve all questions in category: ${selectedCategory}.`);
      }
    } catch (error) {
      console.error("Error approving category:", error);
      message.error("An error occurred while approving the category.");
    } finally {
      setIsLoading(false);
    }
  };

  const options = categories.map((category) => ({
    label: category,
    value: category.toLowerCase().replace(/ /g, "_"), // create values from the category for select options
  }));

  // Toggle edit mode for specific item
  const toggleEdit = (question_index) => {
    setIsEditing((prev) => ({
      ...prev,
      [question_index]: !prev[question_index],
    }));
  };

  // Update text dynamically
  const handleTextChange = (question_index, newText) => {
    setContent((prev) => ({
      ...prev,
      [question_index]: newText,
    }));
  };

  const handleApprove = async(item) => {
    setIsLoading(true);
    try {
      // update the item.answer to the state content
      item.answer = content[item.question_index]; // <--- This line is important

      const response = await makeApiRequest("update_kb_question", {
        action: "update_kb_question",
        kb_id: item.kb_id,
        question_index: item.question_index,
        question: item.question,
        answer: item.answer,
        category: item.category,
        partner_id: PARTNER_ID,
      });
      console.log("response", response);

      if (response.data === "Successfully updated") {
        message.success("Successfully approved question");
        setApprovedItems((prev) => ({ ...prev, [item.question_index]: true })); // Update approved state
        GetKb();
      } else {
        message.error("Failed to approve question");
      }
    } catch (error) {
      console.error("Error approving question:", error);
      message.error("An error occurred while approving the question.");
    } finally {
      setIsLoading(false);
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
        const uniqueCategories = [...new Set(response.data.map((item) => item.category))];
        setCategories(uniqueCategories);

        // Initialize content state with the API data
        const initialContent = {};
        response.data.forEach((item) => {
          initialContent[item.question_index] = item.answer;
        });
        setContent(initialContent);
      } else {
        console.error("API response data is not an array:", response.data);
        message.error("Failed to load knowledge base data. Invalid data format.");
        setKbData({ kb_answers: [] }); // Or some default value to prevent errors
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
          <Skeleton.Button style={{ width: '75px', height: '30px' }} />
          <Skeleton.Button style={{ width: '75px', height: '30px' }} />
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
      label: <Text className="collapse-header">{item.question}</Text>,
      children: (
        <div>
          <Text
            editable={{
              onChange: (value) => handleTextChange(item.question_index, value),
              onBlur: () => setIsEditing((prev) => ({ ...prev, [item.question_index]: false })),
              onPressEnter: () => setIsEditing((prev) => ({ ...prev, [item.question_index]: false })),
              triggerType: "text"
            }}
            style={{ display: "block", marginBottom: "10px" }}
            disabled={!isEditing[item.question_index]}
            // This is a hack, but you can style the color of antd's text component while not editing it to look normal.
            className={!isEditing[item.question_index] ? styles.viewModeText : ""}
          >
            {content[item.question_index] || "Loading..."}
          </Text>
          <Flex justify="flex-end" gap={16}>
            <Button type="text" size="large" onClick={() => toggleEdit(item.question_index)}>
              {isEditing[item.question_index] ? "Close" : "Edit"}
            </Button>
            <Button
              type="primary"
              size="large"
              style={{ backgroundColor: approvedItems[item.question_index] ? "green" : "#2fcc71" }}
              onClick={() => handleApprove(item)}
              disabled={approvedItems[item.question_index]} // Disable after approval
            >
              {approvedItems[item.question_index] ? "Approved" : "Approve"}
            </Button>
          </Flex>
        </div>
      ),
    })) || []; // Ensure items is an array

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
              This process involves thoroughly reviewing and confirming the accuracy, relevance, and completeness of information related to your products, services, or processes. It ensures that all data is up-to-date, factual, and aligned with your objectives. The editing phase focuses on refining the content for clarity, consistency, and proper structure, ensuring it is presented in a professional, easy-to-understand manner. This step is crucial for maintaining the integrity of your materials, boosting credibility, and facilitating effective communication.
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
                    <Skeleton inline/>
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

          <Title level={4} style={{ fontWeight: "normal", marginTop: "4rem", marginBottom: "1rem" }}>
            {isLoading ? (
              <Skeleton width={400} />
            ) : (
              <span>
                Please verify the contents to ensure accuracy & completeness.{" "}
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
                onSearch={onSearch}
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
              htmlType="button"
              onClick={handleApproveAll}
              disabled={isLoading}
            >
              {isLoading ? <Skeleton width={80} /> : "Approve all"}
            </Button>
          </Space>

          <div className={styles.approveCard}>
          <Collapse
              activeKey={activeKeys} 
              onChange={handleCollapseChange}
              expandIconPosition="end"
              size="large"
              items={isLoading ? skeletonItems : items}
            />
          </div>
        </Col>
      </Row>

      {!isLoading && (
        <div className={styles.hoverFooterWrapper}>
          <div>
            <Title level={4} style={{ margin: 0, fontWeight: 'normal', color: 'gray' }}>
              Findings Verified
            </Title>
          </div>

          <span className={styles.sectionShadow} />

          <div className={styles.section}>
            <Title level={3} style={{ margin: 0, fontWeight: 'normal', }}>
              {categories.length ?? 0}
            </Title>
            <FaRegQuestionCircle size={22} color='gray'/>
            <Text style={{color: 'gray' }}>Categories</Text>
          </div>

          <div className={styles.section}>
            <Title level={3} style={{ margin: 0, fontWeight: 'normal', }}>
              {kbData?.kb_answers?.length ?? 0}
            </Title>
            <FaRegQuestionCircle size={22} color='gray'/>
            <Text style={{color: 'gray' }}>Questions</Text>
          </div>

          <div>
            <Button type="primary" disabled={isLoading} onClick={()=>{setCurrent(3);}} size="large" style={{ width: '100%' }} >Save & Continue</Button>
          </div>

        </div>
      )}
    </div>
  );
};

export default KnowledgeVerification;