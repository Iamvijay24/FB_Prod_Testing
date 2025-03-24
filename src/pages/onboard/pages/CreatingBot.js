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
} from "antd";
import React, { useEffect, useState, useRef } from "react";
import styles from "./style.module.scss";
import { makeApiRequest } from "../../../shared/api";
import Skeleton from "react-loading-skeleton";
import Hls from "hls.js";

const { Title, Text } = Typography;

const CreatingBot = ({ setCurrent, setAvatarId }) => {
  const [avatars, setAvatars] = useState([]);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedKnowledgeLibrary, setSelectedKnowledgeLibrary] = useState(null);

  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
  const videoRef = useRef(null); // Add a ref for the video player
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    getAllAvatars();
  }, []);

  const getAllAvatars = async() => {
    try {
      setLoading(true);
      const response = await makeApiRequest("get_avatars", {
        partner_id: "c5c05e02d6",
      });
      console.log("Avatars fetched successfully:", response);
      setAvatars(response.data);
      setSelectedAvatar(response.data[0] || null);
      setSelectedKnowledgeLibrary(response.data[0]?.avatar_id || null);
    } catch (error) {
      console.error("Error fetching avatars:", error);
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

  // Use avatar names as Knowledge Library options
  const knowledgeLibraryOptions = avatars.map((avatar) => ({
    label: avatar.avatar_name,
    value: avatar.avatar_id, // Or avatar.avatar_id if that's more appropriate
  }));

  const handleKnowledgeLibraryChange = (value) => {
    // Find the selected avatar by avatar_id
    const selected = avatars.find((avatar) => avatar.avatar_id === value);
    if (selected) {
      setSelectedAvatar(selected);
      setAvatarId(selected.avatar_id);
      const slideIndex = chunkedAvatars.findIndex((group) =>
        group.some((avatar) => avatar.avatar_id === selected.avatar_id)
      );
  
      if (slideIndex !== -1) {
        setCurrentSlide(slideIndex); // Update the currentSlide state
      }
    }
    setSelectedKnowledgeLibrary(value);
    console.log("Selected Knowledge Library:", selected);
  };

  const handleAvatarSelect = (avatar) => {
    setSelectedAvatar(avatar);
    setAvatarId(avatar.avatar_id);
    
    getAvatarById();
    setSelectedKnowledgeLibrary(avatar.avatar_id);
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
        style={{ backgroundColor: "black" }} // Optional: Set a background color
      >
        <source src={videoUrl} type={videoType} />
        Your browser does not support the video tag.
      </video>
    );
  };

  useEffect(() => {
    let hls = null; // Declare hls outside the if block
    if (
      isPreviewModalVisible &&
      videoRef.current &&
      selectedAvatar?.sample_video?.endsWith(".m3u8")
    ) {
      const video = videoRef.current;
      if (Hls.isSupported()) {
        hls = new Hls(); // Initialize hls here
        hls.loadSource(selectedAvatar.sample_video);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play();
        });
        hls.on(Hls.Events.ERROR, function(event, data) {
          if (data.fatal) {
            switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log("fatal network error encountered, try to recover");
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
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Native HLS support (e.g., Safari on iOS)
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
        hls.destroy(); // Clean up when the component unmounts
      }
    };
  }, [isPreviewModalVisible, selectedAvatar]);

  return (
    <div className={styles.container}>
      <Row justify="center">
        <Col xs={24} sm={20} md={16} lg={12} xl={14}>
          <Title level={3} style={{ fontWeight: "normal" }}>
            Yaa! almost there! - Create FaceAvatar
          </Title>
          <Text className={styles.description}>
            Setting up your FaceAvatar allows you to create a personalised
            digital representation of your product or service within virtual
            environments. Customising your FaceAvatar gives you the opportunity
            to showcase your unique style and identity. Choose from a variety of
            features to make your FaceAvatar truly stand out.
          </Text>
        </Col>
      </Row>

      <Row justify="center">
        <Col xs={24} sm={20} md={16} lg={12} xl={14}>
          <Title level={3} style={{ fontWeight: "normal", marginTop: 50 }}>
            Select FaceAvatar
          </Title>
          <Text className={styles.description}>
            Setting up your FaceAvatar allows you to create a personalised
            digital representation of your product or service within virtual
            environments. Customising your FaceAvatar gives you the opportunity
            to showcase your unique style and identity. Choose from a variety of
            features to make your FaceAvatar truly stand out.
          </Text>
        </Col>
      </Row>

      <div style={{ maxWidth: 830, margin: "auto", padding: 20 }}>
        <Title level={4} style={{ fontWeight: "normal", marginTop: 50 }}>
          Selected FaceAvatar
        </Title>
        <Row gutter={16} align="middle" style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={12} lg={12} xl={12}>
            {isLoading ? (
              <Skeleton height={350} width={350} borderRadius="4px" />
            ) : (
              <Avatar
                size={350}
                src={selectedAvatar?.avatar_image}
                shape="square"
                style={{ maxWidth: "100%", height: "auto" }} // Ensure the image is responsive
              />
            )}
          </Col>
          <Col xs={24} sm={12} md={12} lg={12} xl={12}>
            {isLoading ? (
              <>
                <Skeleton height={24} width={150} />
                <br />
                <Skeleton height={24} width={200} />
                <br />
              </>
            ) : (
              <div style={{ padding: "0 8px", marginTop: "10px" }}>
                {" "}
                <Text strong style={{ marginBottom: 10 }}>
                  Name:
                </Text>{" "}
                {selectedAvatar?.avatar_name}
                <br />
                <Text strong>Gender:</Text> {selectedAvatar?.gender}
                <br />
              </div>
            )}
          </Col>
        </Row>
      </div>

      <div style={{ maxWidth: 900, margin: "auto", padding: 20 }}>
        <Carousel
          dots={false}
          arrows
          draggable
          style={{ marginTop: 20, width: "28rem", width: isMobile ? "18rem" : "28rem", marginLeft: isMobile ? 0 : "0", marginRight: isMobile ? 0 : "auto", }}
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
          Selected Knowledge Library
        </Title>
        {isLoading ? (
          <>
            <Skeleton height={40} width={320} />
            <br />
            <Skeleton
              height={40}
              width={160}
              count={2}
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
              loading={isLoading} // Consider a separate loading state
              value={selectedKnowledgeLibrary}
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
              <Button
                size="large"
                style={{ width: "10rem" }}
                onClick={() => setIsPreviewModalVisible(true)}
              >
                Show Preview
              </Button>
            </Space>
          </>
        )}
      </div>

      <Modal
        title="Preview"
        open={isPreviewModalVisible}
        onCancel={() => setIsPreviewModalVisible(false)}
        width={800} // Adjust width as needed
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
                      console.error(
                        "Fatal error encountered, cannot recover."
                      );
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
        <div style={{ maxWidth: 850, margin: "auto", padding: 20 }}>
          {renderPreview()}
        </div>
      </Modal>
    </div>
  );
};

export default CreatingBot;
