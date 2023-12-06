import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StreamCard from './StreamCard/StreamCard';
import './Main.css';

const Main = () => {
  const [streams, setStreams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // 현재 방송중인 스트림을 불러옵니다.
    fetch(
      'https://xw6vimxva3.execute-api.ap-northeast-2.amazonaws.com/develop/public/broadcast_status'
    )
      .then(res => res.json())
      .then(data => {
        setStreams(data);
        setIsLoading(false);
      });
  }, []);

  const streamCardHandler = id => {
    navigate(`/channel/${id}`);
  };

  if (isLoading) {
    return <div>Loadings</div>;
  }

  return (
    <div className="index-container">
      <h1 className="index-title">On Air</h1>
      {/* {Request한 API에서 방송의 개수를 확인해 UI에 다르게 표시합니다.} */}
      {streams && streams.length > 0 ? (
        <div className="stream-list">
          {streams.map(stream => (
            <div
              onClick={() => streamCardHandler(stream.sub_key)}
              key={stream.sub_key}
            >
              <StreamCard
                title={stream.title}
                thumbnail={stream.thumbnail}
                channel={stream.nick_name}
                timestamp={stream.timestamp}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-stream-list">
          <div className="empty-stream-box"></div>
          <p>No streams available</p>
        </div>
      )}
    </div>
  );
};

export default Main;
