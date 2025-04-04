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
  message,
  Spin,
} from "antd";
import React, { useEffect, useState, useRef, useCallback } from "react";
import styles from "./style.module.scss";
import Skeleton from "react-loading-skeleton";
import Hls from "hls.js";
import { getCookie, setCookie } from "cookies-next";
import { FaCloudDownloadAlt, FaCopy, FaRegPlayCircle } from "react-icons/fa";
import { makeApiRequest } from "../../shared/api";
import { extractAvatarId } from "../../utils";
import ProcessingModal from "./ProcessingModal";

const { Title, Text } = Typography;

const Content = ({ setCurrent, setAvatarId, avatarData, kbLibrary, facebot_id , avatarsList, setAvatarsList,selectedAvatar, setSelectedAvatar}) => {
  const [isLoading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
  const videoRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isHovered, setIsHovered] = useState(false);
  const [facebotName, setFacebotName] = useState("");
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const preRef = useRef(null);
  const [code, setCode] = useState("");
  const [getCodeLoading, setGetCodeLoading] = useState(false);
  const [getCodeError, setGetCodeError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const KB_ID = getCookie("fb_kb_id");

  const updateSelection = useCallback((avatar) => {
    setSelectedAvatar(avatar);
    setFacebotName(avatar?.avatar_name || "");
  }, [setSelectedAvatar, setFacebotName]);

  useEffect(() => {
    if (avatarData.progress) {
      setIsProcessing(true);
    }
  }, [avatarData]);



  useEffect(() => {
    if (facebot_id) {
      getAvatarById();
    }
  }, [facebot_id]);

  const getAvatarById = async() => {
    const avatarId = await extractAvatarId(facebot_id);
    if (!avatarId) {
      message.error("Invalid facebot_id format");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await makeApiRequest("get_avatars", { // *FIX*: Using correct endpoint
        partner_id: "c5c05e02d6",
        avatar_id: avatarId,
      });

      if (response?.data) {
        setSelectedAvatar(response.data); // *FIX*: set Selected when available
        setFacebotName(response.data?.avatar_name || ""); //update state when found
      } else {
        message.error(`Avatar with ID ${avatarId} not found`);
        setSelectedAvatar(null);
      }

    } catch (error) {
      console.error("Error fetching avatar:", error);
      message.error("Failed to load avatar.");
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
  const chunkedAvatars = chunkArray(avatarsList, chunkSize);

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
    if (avatarsList.length > 0) {
      const selected = avatarsList.find((avatar) => avatar.avatar_id === value);
      if (selected) {
        updateSelection(selected);
      }
    }
  };

  const handleAvatarSelect = (avatar) => {
    updateSelection(avatar);
  };

  const handleCarouselChange = (current) => {
    setCurrentSlide(current);
  };

  const handleFinishSetup = async() => {
    try {
      await form.validateFields();  // validate the form
      setCurrent(4);
      await CreateFaceBot();
    } catch (errorInfo) {
      message.error("Please fill out the form correctly.");
    }
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
      message.error("Failed to create FaceBot.");
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
      }
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [isPreviewModalVisible, selectedAvatar]);

  const handleDownload = () => {
    if (preRef.current) {
      const codeValue = preRef.current.innerText;
      const blob = new Blob([codeValue], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "code.html";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const getCode = async() => {

    try {
      setGetCodeLoading(true); // loading set here

      const response = await makeApiRequest("get_widget_code", {
        partner_id: "c5c05e02d6",
        fb_id: facebot_id,
      });
      if(response?.data) {
        setCode(response.data?.facebot_script);
      } else {
        setCode("");
        setGetCodeError("No code returned");
      }
    } catch (error) {
      setCode("");
      setGetCodeError(error?.response?.data?.message || "Failed to generate code");
    } finally {
      setGetCodeLoading(false);
    }
  };

  const handleGetCode = useCallback(() => {
    setIsModalOpen(true);
    getCode();
  }, [getCode]);

  return (
    <div className={styles.container}>

      <div>
        <Title level={4} style={{ fontWeight: "normal" }}>
          Selected FaceBot
        </Title>
        <Row gutter={16} align="middle" style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={12} lg={12} xl={10}>
            {isLoading ? (
              <Skeleton height={350} width={350} borderRadius="4px" />
            ) : (
              selectedAvatar &&  // Render Avatar only when available
              <div
                style={{ position: "relative", display: "inline-block", maxWidth: "600px", margin: "auto", paddingLeft: 50 }}
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
            {!isLoading && !selectedAvatar && <Text>No Avatar Found</Text>}
          </Col>
          <Col xs={24} sm={12} md={12} lg={12} xl={6}>
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

      <div>
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

      <div style={{ padding: 20 }}>
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
                size="large"
                style={{ width: "10rem" }}
                onClick={handleFinishSetup}
                disabled={!facebotName}
              >
                Update
              </Button>

              <Button
                type="primary"
                size="large"
                style={{ width: "10rem" }}
                onClick={handleGetCode}
                disabled={avatarData?.progress !== 100 || getCodeLoading }
              >
                Get Code
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
              } else if (
                videoRef.current.canPlayType("application/vnd.apple.mpegurl")
              ) {
                videoRef.current.src = selectedAvatar.sample_video;
                videoRef.current.addEventListener("loadedmetadata", () => {
                  videoRef.current.play();
                });
              } else {
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

      <Modal
        title="Generated: Your Code is Ready for Integration"
        open={isModalOpen}
        onOk={() => setIsModalOpen(false)}
        onCancel={() => setIsModalOpen(false)}
        width={800}
        footer={[
          <Button key="get-code" icon={<FaCopy />} type="primary" onClick={handleGetCode} disabled={getCodeLoading}>
            Copy Code
          </Button>,
          <Button key="download" icon={<FaCloudDownloadAlt />} onClick={handleDownload} disabled={getCodeLoading}>
            Download
          </Button>,
        ]}
      >
        <div>
          <p>
            This means that all necessary steps have been completed, and you can
            now proceed with incorporating the code to enhance functionality,
            improve performance, or enable new features.
          </p>

          <div style={{ overflow: "auto", backgroundColor: "#f8f8f8", padding: "30px", marginTop: "20px" }}>
            {getCodeError && <Text type="danger">{getCodeError}</Text>}
            {getCodeLoading ? <Spin /> :
              <pre ref={preRef}>{code}</pre>
            }
          </div>
        </div>
      </Modal>


      <ProcessingModal isProcessing={isProcessing} setIsProcessing={setIsProcessing} progress={avatarData?.progress} />

    </div>
  );
};

export default Content;