import React, { useState } from "react";
import "./Mypage.css"; // 스타일시트 import

function Mypage() {
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [personalInfo, setPersonalInfo] = useState("");

  const handleBroadcastTitleChange = (e) => {
    setBroadcastTitle(e.target.value);
  };

  const handleProfileImageChange = (e) => {
    // 프로필 사진 변경 로직
  };

  const handlePersonalInfoChange = (e) => {
    setPersonalInfo(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // 설정 저장 로직
  };

  return (
    <div className="profile-container">
      <h2>프로필 설정</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>방송 제목</label>
          <input
            type="text"
            value={broadcastTitle}
            onChange={handleBroadcastTitleChange}
          />
        </div>
        <div className="form-group">
          <label>프로필 사진</label>
          <input type="file" onChange={handleProfileImageChange} />
        </div>
        <div className="form-group">
          <label>개인 정보</label>
          <textarea value={personalInfo} onChange={handlePersonalInfoChange} />
        </div>
        <button type="submit">저장</button>
      </form>
    </div>
  );
}

export default Mypage;
