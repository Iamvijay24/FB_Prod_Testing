import {
  Col,
  Row,
  Typography,
  Avatar,
  Carousel,
  Select,
  Space,
  Button,
  Modal,
  Input,
  Form,
} from "antd";
import React, { useEffect, useState, useRef } from "react";
import styles from "./style.module.scss";
import { makeApiRequest } from "../../../shared/api";
import Skeleton from "react-loading-skeleton";
import Hls from "hls.js";
import { getCookie, setCookie } from "cookies-next";
import { FaRegPlayCircle } from "react-icons/fa";

const { Title, Text } = Typography;

const CreatingBot = ({ setCurrent, setAvatarId, kbLibrary }) => {
  const [avatars, setAvatars] = useState([]);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
  const videoRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isHovered, setIsHovered] = useState(false);
  const [facebotName, setFacebotName] = useState(""); // State for the input
  const [form] = Form.useForm(); // Using form
  const [setSelectedKnowledgeLibrary] = useState();

  const KB_ID = getCookie("fb_kb_id");
  useEffect(() => {
    getAllAvatars();
  }, []);

  const getAllAvatars = async() => {
    try {
      setLoading(true);
      const response = await makeApiRequest("get_avatars", {
        partner_id: "c5c05e02d6",
      });
      setAvatars(response.data);
      setSelectedAvatar(response.data[0] || null);
      setFacebotName(response.data[0]?.avatar_name || ""); // Set initial value
    } catch (error) {
      setAvatars([]);
      setSelectedAvatar(null);
    } finally {
      setLoading(false);
    }
  };

  const chunkArray = (arr, size) => {
    return arr.reduce((acc, _, i) => {
      if (i % size === 0) acc.push(arr.slice(i, i + size));
      return acc;
    }, []);
  };

  const chunkSize = isMobile ? 3 : 5;
  const chunkedAvatars = chunkArray(avatars, chunkSize);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const knowledgeLibraryOptions = kbLibrary?.map((data) => ({
    label: data?.avatar_name,
    value: data?.avatar_name,
  }));

  const handleKnowledgeLibraryChange = (value) => {
    const selected = avatars.find((avatar) => avatar.avatar_id === value);
    if (selected) {
      setSelectedAvatar(selected);
      setAvatarId(selected.avatar_id);
      setFacebotName(selected.avatar_name); // Update name
      const slideIndex = chunkedAvatars.findIndex((group) =>
        group.some((avatar) => avatar.avatar_id === selected.avatar_id)
      );

      if (slideIndex !== -1) {
        setCurrentSlide(slideIndex);
      }
    }
    setSelectedKnowledgeLibrary(value);
  };

  const handleAvatarSelect = (avatar) => {
    setSelectedAvatar(avatar);
    setAvatarId(avatar.avatar_id);
    setFacebotName(avatar.avatar_name); // Update the name
    getAvatarById();
  };

  const getAvatarById = async(avatarId) => {
    try {
      await makeApiRequest("get_avatars", {
        partner_id: "c5c05e02d6",
        avatar_id: avatarId,
      });
    } catch (error) {
      console.error("Error fetching avatars:", error);
      setSelectedAvatar(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCarouselChange = (current) => {
    setCurrentSlide(current);
  };

  useEffect(() => {
    if (selectedAvatar && chunkedAvatars.length > 0) {
      let found = false;
      chunkedAvatars[currentSlide].forEach((avatar) => {
        if (avatar.avatar_image === selectedAvatar.avatar_image) {
          found = true;
        }
      });

      if (!found) {
        setSelectedAvatar(chunkedAvatars[currentSlide][0] || null);
      }
    }
  }, [currentSlide, chunkedAvatars, selectedAvatar]);

  const handleFinishSetup = () => {
    setCurrent(4);
    CreateFaceBot();
  };

  const CreateFaceBot = async() => {
    try {
      setLoading(true);
      const response = await makeApiRequest("create_facebot", {
        partner_id: "c5c05e02d6",
        kb_id: KB_ID,
        avatar_id: selectedAvatar?.avatar_id,
        facebot_name: facebotName,
      });

      setCookie("fb_id", response?.data?.fb_id);

    } catch (error) {
      console.error("Error creating FaceBot:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderPreview = () => {
    if (!selectedAvatar) {
      return <Text>No avatar selected.</Text>;
    }

    const videoUrl = selectedAvatar.sample_video;

    if (!videoUrl) {
      return <Text>No video available for this avatar.</Text>;
    }

    const videoType = videoUrl.endsWith(".m3u8")
      ? "application/vnd.apple.mpegurl"
      : "video/mp4";

    return (
      <video
        ref={videoRef}
        controls
        width="100%"
        height="auto"
        style={{ backgroundColor: "black" }}
      >
        <source src={videoUrl} type={videoType} />
        Your browser does not support the video tag.
      </video>
    );
  };

  useEffect(() => {
    let hls = null;
    if (
      isPreviewModalVisible &&
      videoRef.current &&
      selectedAvatar?.sample_video?.endsWith(".m3u8")
    ) {
      const video = videoRef.current;
      if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(selectedAvatar.sample_video);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play();
        });
        hls.on(Hls.Events.ERROR, function(event, data) {
          if (data.fatal) {
            switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
            }
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = selectedAvatar.sample_video;
        video.addEventListener("loadedmetadata", () => {
          video.play();
        });
      } else {
        console.error("HLS is not supported in this browser.");
      }
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [isPreviewModalVisible, selectedAvatar]);

  return (
    <div className={styles.container}>
      <Row justify="center">
        <Col xs={24} sm={20} md={16} lg={12} xl={14}>
          <Title level={3} style={{ fontWeight: "normal" }}>
            Yaa! almost there! - Create FaceBot
          </Title>
          <Text className={styles.description}>
            Setting up your FaceBot allows you to create a personalised digital
            representation of your product or service within virtual
            environments. Customising your FaceBot gives you the opportunity to
            showcase your unique style and identity. Choose from a variety of
            features to make your FaceBot truly stand out.
          </Text>
        </Col>
      </Row>

      <Row justify="center">
        <Col xs={24} sm={20} md={16} lg={12} xl={14}>
          <Title level={3} style={{ fontWeight: "normal", marginTop: 50 }}>
            Select FaceBot
          </Title>
          <Text className={styles.description}>
            Setting up your FaceBot allows you to create a personalised digital
            representation of your product or service within virtual
            environments. Customising your FaceBot gives you the opportunity to
            showcase your unique style and identity. Choose from a variety of
            features to make your FaceBot truly stand out.
          </Text>
        </Col>
      </Row>

      <div style={{ maxWidth: 830, margin: "auto", padding: 20 }}>
        <Title level={4} style={{ fontWeight: "normal", marginTop: 50 }}>
          Selected FaceBot
        </Title>
        <Row gutter={16} align="middle" style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={12} lg={12} xl={12}>
            {isLoading ? (
              <Skeleton height={350} width={350} borderRadius="4px" />
            ) : (
              <div
                style={{ position: "relative", display: "inline-block" }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <Avatar
                  size={350}
                  src={selectedAvatar?.avatar_image}
                  shape="square"
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                    cursor: "pointer",
                    filter: isHovered ? "blur(2px)" : "none",
                    transition: "filter 0.1s ease-in-out",
                  }}
                  onClick={() => setIsPreviewModalVisible(true)}
                />

                {isHovered && (
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      backgroundColor: "rgba(0, 0, 0, 0.5)",
                      color: "white",
                      fontSize: "2rem",
                      padding: "10px",
                      borderRadius: "50%",
                      cursor: "pointer",
                      transition: "opacity 0.2s ease-in-out",
                      opacity: 1,
                    }}
                    onClick={() => setIsPreviewModalVisible(true)}
                  >
                    <FaRegPlayCircle />
                  </div>
                )}
              </div>
            )}
          </Col>
          <Col xs={24} sm={12} md={12} lg={12} xl={12}>
            {isLoading ? (
              <>
                <Skeleton height={24} width={150} />
                <br />
              </>
            ) : (
              <Form form={form} layout="vertical">
                <Form.Item
                  label="FaceBot Name"
                  rules={[
                    {
                      required: true,
                      message: "Please enter a name for your FaceBot!",
                    },
                  ]}
                >
                  <Input
                    placeholder="Enter FaceBot Name"
                    value={facebotName}
                    allowClear
                    onChange={(e) => setFacebotName(e.target.value)}
                  />
                </Form.Item>
              </Form>
            )}
          </Col>
        </Row>
      </div>

      <div style={{ maxWidth: 900, margin: "auto", padding: 20 }}>
        <Carousel
          dots={false}
          arrows
          draggable
          style={{
            marginTop: 20,
            width: isMobile ? "18rem" : "28rem",
            marginLeft: isMobile ? 0 : "0",
            marginRight: isMobile ? 0 : "auto",
          }}
          afterChange={handleCarouselChange}
          current={currentSlide}
        >
          {chunkedAvatars.map((group, index) => (
            <div key={index}>
              <Row justify={isMobile ? "start" : "center"} gutter={16}>
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
                            selectedAvatar?.avatar_image === avatar.avatar_image
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
        <Title level={5} style={{ fontWeight: "normal" }}>
          Select Knowledge Library
        </Title>
        {isLoading ? (
          <>
            <Skeleton height={40} width={320} />
            <br />
            <Skeleton
              height={40}
              width={160}
              count={1}
              inline={true}
              style={{ marginRight: 10 }}
            />
          </>
        ) : (
          <>
            <Select
              showSearch
              placeholder="Select a Knowledge Library"
              optionFilterProp="label"
              onChange={handleKnowledgeLibraryChange}
              options={knowledgeLibraryOptions}
              size="large"
              style={{ width: "20rem", marginBottom: 25 }}
              loading={isLoading}
            />
            <br />
            <Space>
              <Button
                type="primary"
                size="large"
                style={{ width: "10rem" }}
                onClick={handleFinishSetup}
                disabled={!facebotName} // Disable if name is empty
              >
                Finish Setup
              </Button>
            </Space>
          </>
        )}
      </div>

      <Modal
        title="Preview"
        open={isPreviewModalVisible}
        onCancel={() => setIsPreviewModalVisible(false)}
        centered
        footer={
          <>
            <Button
              type="primary"
              onClick={() => setIsPreviewModalVisible(false)}
            >
              Close
            </Button>
          </>
        }
        afterOpen={() => {
          if (videoRef.current) {
            if (selectedAvatar?.sample_video?.endsWith(".m3u8")) {
              if (Hls.isSupported()) {
                const hls = new Hls();
                hls.loadSource(selectedAvatar.sample_video);
                hls.attachMedia(videoRef.current);
                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                  videoRef.current.play();
                });
                hls.on(Hls.Events.ERROR, function(event, data) {
                  if (data.fatal) {
                    switch (data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                      console.log(
                        "fatal network error encountered, try to recover"
                      );
                      hls.startLoad();
                      break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                      console.error(
                        "fatal media error encountered, trying to recover"
                      );
                      hls.recoverMediaError();
                      break;
                    default:
                      hls.destroy();
                      console.error("Fatal error encountered, cannot recover.");
                      break;
                    }
                  }
                });
              } else if (
                videoRef.current.canPlayType("application/vnd.apple.mpegurl")
              ) {
                videoRef.current.src = selectedAvatar.sample_video;
                videoRef.current.addEventListener("loadedmetadata", () => {
                  videoRef.current.play();
                });
              } else {
                console.error("HLS is not supported in this browser.");
              }
            } else {
              videoRef.current.play();
            }
          }
        }}
      >
        <div style={{ maxWidth: "600px", margin: "auto", padding: 3 }}>
          <div style={{ width: "100%", maxWidth: "600px" }}>
            {renderPreview()}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CreatingBot;