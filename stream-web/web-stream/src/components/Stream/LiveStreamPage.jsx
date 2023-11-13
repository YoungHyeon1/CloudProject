import React from "react";
import "./LiveStreamPage.css";
import Chat from "./Chat";

const LiveStreamPage = () => {
  // URL에서 스트림 ID를 추출 (예: /channel/1)

  return (
    <div className="live-stream-container">
      <div className="video-container">
        <video width="100%" height="100%" controls>
          <source src="your-streaming-url-here" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <div className="chat-container">
        <Chat />
        {/* 채팅 컴포넌트를 여기에 구현합니다. */}
        <div className="chat-messages">{/* 메시지 목록을 렌더링합니다. */}</div>
      </div>
    </div>
  );
};

export default LiveStreamPage;
