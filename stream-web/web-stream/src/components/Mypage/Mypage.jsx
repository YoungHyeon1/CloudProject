import React, { useState, useEffect } from 'react';
import './Mypage.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useCognitoToken } from '../useCognitoToken';
import * as config from '../../config';
import { useAuth } from '../AppProvider';

function Mypage() {
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [streamKey, setStreamKey] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [imageSrc, setImageSrc] = useState(null);
  const [file, setFile] = useState(null);

  const navigate = useNavigate();

  const { logout } = useAuth();

  const axiosApi = axios.create({
    baseURL: config.ApiUrl,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  useEffect(() => {
    const myinfo = async () => {
      try {
        const idToken = await useCognitoToken();
        const response = await axiosApi.get(`/stream/mypage`, {
          headers: {
            Authorization: idToken,
          },
        });
        console.log(response.data);
        setImageSrc(response.data.profile);
        setBroadcastTitle(response.data.boradCastTitle);
        setStreamKey(response.data.streamKey);
        setStreamUrl(response.data.streamUrl);
      } catch (e) {
        console.log(e);
      }
    };
    myinfo();
  }, []);

  const handleFileChange = event => {
    const file = event.target.files[0];
    setFile(file);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setImageSrc(reader.result);
    };
  };

  const handleUpload = async () => {
    if (!file) {
      alert('파일을 선택해주세요.');
      return;
    }

    // 이미지를 S3에 업로드하고 DynamoDB에 URL을 저장하는 Lambda 함수 호출
    const formData = new FormData();
    formData.append('file', file);

    try {
      const idToken = await useCognitoToken();
      await axiosApi.post('/stream/save_mypage', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Accept: 'image/jpg',
          Authorization: idToken,
        },
      });

      await axiosApi.get(
        `/stream/broadcase_info_edit?title=${broadcastTitle}`,
        {
          headers: {
            Authorization: idToken,
          },
        }
      );

      console.log('업로드 성공');
    } catch (error) {
      console.error('업로드 실패:', error);
    }
  };
  const handleBroadcastTitleChange = e => {
    setBroadcastTitle(e.target.value);
  };

  const handleSubmit = e => {
    e.preventDefault();
    // 설정 저장 로직
  };

  const handleSingout = e => {
    logout();
    navigate('/');
  };

  return (
    <div className="profile-container">
      <h1>프로필 설정</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label><h2>프로필 사진</h2></label>
          <div className='form-box'>
          <img width={'30%'} height={'30%'} src={imageSrc}/>
          <input type="file" onChange={handleFileChange} className='input-img'/>
          </div>
        </div>
        <div className="form-group">
          <label><h2>방송 제목</h2></label>
          <div className='form-box'>
          <input
            type="text"
            value={broadcastTitle}
            onChange={handleBroadcastTitleChange}
          />
          </div>
        </div>
        <div className="form-group">
          <label><h2>Stream KEY</h2></label>
          <div className='form-box'>
          <input
            disabled
            type="text"
            value={streamKey}
            onChange={handleBroadcastTitleChange}
          />
          </div>
        </div>
        <div className="form-group">
          <label><h2>Stream URL</h2></label>
          <div className='form-box'>
          <input
            disabled
            type="text"
            value={streamUrl}
            onChange={handleBroadcastTitleChange}
          />
          </div>
        </div>
        <button type="submit" onClick={handleUpload} className='save'>
          저장
        </button>
        <button type="submit" onClick={handleSingout} className='logout'>
          로그아웃
        </button>
      </form>
    </div>
  );
}

export default Mypage;
