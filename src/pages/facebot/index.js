/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { Tabs, Spin, Empty } from 'antd';
import Content from './content';
import { makeApiRequest } from '../../shared/api';

const Facebot = () => {
  const [avatars, setAvatars] = useState([]);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [facebotName, setFacebotName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [avatarsList, setAvatarsList] = useState([]);
  

  useEffect(() => {
    getAllFaceBots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getAllFaceBots = async() => {
    try {
      setLoading(true);
      setError(null);
      const response = await makeApiRequest("get_facebots", {
        partner_id: "c5c05e02d6",
      });

      if (response && response.data && Array.isArray(response.data)) {
        setAvatars(response.data);
        const firstAvatar = response.data[0] || null;
        setSelectedAvatar(firstAvatar);
        setFacebotName(firstAvatar?.avatar_name || "");
      } else {
        console.error("API response data is not an array:", response);
        setAvatars([]);
        setSelectedAvatar(null);
        setFacebotName("");
        setError("Received invalid data format from server.");
      }

    } catch (err) {
      console.error("Error fetching facebots:", err);
      setError(err.message || "Failed to fetch facebots.");
      setAvatars([]);
      setSelectedAvatar(null);
      setFacebotName("");
    } finally {
      setLoading(false);
    }
  };

  const tabItems = avatars.map((avatar) => ({
    key: avatar.facebot_id || `avatar-${avatar.facebot_name}`,
    label: avatar.facebot_name || 'Unnamed Avatar',
    children: <Content avatarData={avatar} facebot_id={avatar.facebot_id} avatarsList={avatarsList} selectedAvatar={selectedAvatar} setSelectedAvatar={setSelectedAvatar}/>,
  }));

  const handleTabChange = (activeKey) => {
    const newSelectedAvatar = avatars.find(a => (a.avatar_id || `avatar-${a.avatar_name}`) === activeKey);
    setSelectedAvatar(newSelectedAvatar || null);
    setFacebotName(newSelectedAvatar?.avatar_name || "");
  };

  const defaultTabKey = avatars.length > 0 ? (avatars[0].avatar_id || `avatar-${avatars[0].avatar_name}`) : '1';

  useEffect(() => {
    getAllAvatars();
  }, []);

  const getAllAvatars = async() => {
    try {
      setLoading(true);
      const response = await makeApiRequest("get_avatars", {
        partner_id: "c5c05e02d6",
      });
      if (response?.data) {
        setAvatarsList(response.data);
      }
    } catch (error) {
      setAvatarsList([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Tabs
        defaultActiveKey={defaultTabKey}
        type="card"
        style={{ marginBottom: 32 }}
        items={tabItems}
        onChange={handleTabChange}
      />
    </div>
  );
};

export default Facebot;