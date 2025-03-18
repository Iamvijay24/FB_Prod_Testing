import {
  Col,
  Row,
  Typography,
  Avatar,
  Carousel,
  Select,
  Space,
  Button,
} from "antd";
import React, { useEffect, useState } from "react";
import styles from "./style.module.scss";
import { makeApiRequest } from "../../../shared/api";
import Skeleton from "react-loading-skeleton";

const { Title, Text } = Typography;

const CreatingBot = ({ setCurrent }) => {
  const [avatars, setAvatars] = useState([]); // Array of avatars fetched from the API
  const [selectedAvatar, setSelectedAvatar] = useState(null); // Initially no avatar is selected
  const [isLoading, setLoading] = useState(true); // Initially loading is true
  const [currentSlide, setCurrentSlide] = useState(0); // Track current carousel slide

  useEffect(() => {
    getAllAvatars();
  }, []);

  const getAllAvatars = async() => {
    try {
      setLoading(true); // Set loading to true at the start of the request
      const response = await makeApiRequest("get_avatars", {
        partner_id: "c5c05e02d6",
      });
      console.log("Avatars fetched successfully:", response);
      setAvatars(response.data);
      setSelectedAvatar(response.data[0] || null); //select the first avatar after fetching.
    } catch (error) {
      console.error("Error fetching avatars:", error);
      setAvatars([]);
      setSelectedAvatar(null);
    } finally {
      setLoading(false); // Set loading to false regardless of success or failure
    }
  };

  const chunkArray = (arr, size) => {
    return arr.reduce((acc, _, i) => {
      if (i % size === 0) acc.push(arr.slice(i, i + size));
      return acc;
    }, []);
  };

  const chunkedAvatars = chunkArray(avatars, 5);

  const options = [{ label: "Business & Company Overview", value: "business" }];

  const onChange = (value) => {
    console.log(value);
  };

  const handleAvatarSelect = (avatar) => {
    setSelectedAvatar(avatar);
  };

  const handleCarouselChange = (current) => {
    setCurrentSlide(current);
  };

  useEffect(() => {
    // Ensure selected avatar stays within the current carousel slide
    if (selectedAvatar && chunkedAvatars.length > 0) {
      let found = false;
      chunkedAvatars[currentSlide].forEach((avatar) => {
        if (avatar.avatar_image === selectedAvatar.avatar_image) {
          //corrected here
          found = true;
        }
      });

      // If selected avatar is not in the current slide, reset selectedAvatar to the first avatar in the current slide
      if (!found) {
        setSelectedAvatar(chunkedAvatars[currentSlide][0] || null);
      }
    }
  }, [currentSlide, chunkedAvatars, selectedAvatar]);

  const handleFinishSetup = () => {
    setCurrent(4);
  };

  return (
    <div className={styles.container}>
      <Row justify="center">
        <Col xs={24} sm={20} md={16} lg={12} xl={14}>
          <Title level={3} style={{ fontWeight: "normal" }}>
            Yaa! almost there! - Create FaceAvatar
          </Title>
          <Text className={styles.description}>
            Setting up your FaceAvatar allows you to create a personalised digital representation of your product or service within virtual environments. Customising your FaceAvatar gives you the opportunity to showcase your unique style and identity. Choose from a variety of features to make your FaceAvatar truly stand out.
          </Text>
        </Col>
      </Row>

      <Row justify="center">
        <Col xs={24} sm={20} md={16} lg={12} xl={14}>
          <Title level={3} style={{ fontWeight: "normal", marginTop: 50 }}>
            Select FaceAvatar
          </Title>
          <Text className={styles.description}>
            Setting up your FaceAvatar allows you to create a personalised digital representation of your product or service within virtual environments. Customising your FaceAvatar gives you the opportunity to showcase your unique style and identity. Choose from a variety of features to make your FaceAvatar truly stand out.
          </Text>
        </Col>
      </Row>

      <div style={{ maxWidth: 830, margin: "auto", padding: 20 }}>
        <Title level={4} style={{ fontWeight: "normal", marginTop: 50 }}>
          Selected FaceAvatar
        </Title>
        <Row gutter={16} align="middle">
          <Col span={12}>
            {isLoading ? (
              <Skeleton height={350} width={350}  borderRadius="4px"/>
            ) : (
              <Avatar size={350} src={selectedAvatar?.avatar_image} shape="square" />
            )}
          </Col>
          <Col span={10}>
            {isLoading ? (
              <>
                <Skeleton height={24} width={150}  />
                <br />
                <Skeleton height={24} width={200} />
                <br />
               
              </>
            ) : (
              <>
                <Text strong style={{ marginBottom: 10 }}>
                  Name:
                </Text>
                {selectedAvatar?.avatar_name}
                <br />
                <Text strong>Gender:</Text> {selectedAvatar?.gender}
                <br />
              </>
            )}
          </Col>
        </Row>
      </div>
      <div style={{ maxWidth: 900, margin: "auto", padding: 20 }}>
        <Carousel
          dots={false}
          arrows
          draggable
          style={{ marginTop: 20, width: "28rem" }}
          afterChange={handleCarouselChange}
        >
          {chunkedAvatars.map((group, index) => (
            <div key={index}>
              <Row justify="center" gutter={16}>
                {group.map((avatar, idx) => (
                  <Col key={idx}>
                    {isLoading ? (
                      <Skeleton shape="square" height={64} width={64} />
                    ) : (
                      <Avatar
                        size={64}
                        src={avatar.avatar_image}
                        shape="square"
                        onClick={() => handleAvatarSelect(avatar)}
                        style={{
                          cursor: "pointer",
                          border:
                            selectedAvatar?.avatar_image === avatar.avatar_image //corrected here
                              ? "2px solid #2fcc71"
                              : "none",
                        }}
                      />
                    )}
                  </Col>
                ))}
              </Row>
            </div>
          ))}
        </Carousel>
      </div>

      <div style={{ maxWidth: 850, margin: "auto", padding: 20 }}>
        {isLoading ? (
          <>
            <Skeleton height={40} width={320} />
            <br />
            <Skeleton height={40} width={160} count={2} inline={true} style={{ marginRight: 10 }} />
          </>
        ) : (
          <>
            <Select
              showSearch
              placeholder="Select a category"
              optionFilterProp="label"
              onChange={onChange}
              options={options}
              size="large"
              style={{ width: "20rem", marginBottom: 25 }}
            />
            <br />
            <Space>
              <Button
                type="primary"
                size="large"
                style={{ width: "10rem" }}
                onClick={handleFinishSetup}
              >
                Finish Setup
              </Button>
              <Button size="large" style={{ width: "10rem" }} htmlType="submit">
                Show Preview
              </Button>
            </Space>
          </>
        )}
      </div>
    </div>
  );
};

export default CreatingBot;