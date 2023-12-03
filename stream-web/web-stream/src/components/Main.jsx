import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StreamCard from "./StreamCard/StreamCard";
import "./Main.css";

const Main = () => {
  const [streams, setStreams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(
      "https://xw6vimxva3.execute-api.ap-northeast-2.amazonaws.com/develop/public/broadcast_status"
    )
      .then((res) => res.json())
      .then((data) => {
        setStreams(data);
        setIsLoading(false);
      });
  }, []);

  const streamCardHandler = (id) => {
    console.log(id);
    navigate(`/channel/${id}`);
  };

  if (isLoading) {
    return <div>Loadings</div>;
  }

  return (
    <div className="index-container">
      <h1 className="index-title">On Air</h1>
      {streams && streams.length > 0 ? (
        <div className="stream-list">
          {streams.map((stream, index) => (
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
