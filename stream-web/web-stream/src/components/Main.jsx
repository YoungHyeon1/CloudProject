import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StreamCard from "./StreamCard/StreamCard";
import "./Main.css";

const Main = () => {
  const [streams, setStreams] = useState([]);

  useEffect(() => {
    fetch(
      "https://xw6vimxva3.execute-api.ap-northeast-2.amazonaws.com/develop/public/broadcast_status"
    )
      .then((res) => res.json())
      .then((data) => {
        setStreams(data);
      });
  }, []);

  return (
    <div className="index-container">
      <h1 className="index-title">On Air</h1>
      {streams && streams.length > 0 ? (
        <div className="stream-list">
          {streams.map((stream, index) => (
            <StreamCard
              key={index}
              id={stream.id}
              title={"TEST"}
              thumbnail={stream.thumbnail}
              channel={stream.channel}
              timestamp={stream.timestamp}
            />
            // <Link key={index} to={`/channel/${stream.id}`} className="stream">
            //   <div className="stream-thumbnail"></div>
            // </Link>
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
