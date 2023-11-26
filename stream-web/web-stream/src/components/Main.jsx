import React from "react";
import { Link } from "react-router-dom";
import "./Main.css";

const Main = ({ streams }) => {
  return (
    <div className="index-container">
      <h1 className="index-title">On Air</h1>
      {streams && streams.length > 0 ? (
        <div className="stream-list">
          {streams.map((stream, index) => (
            <Link key={index} to={`/channel/${stream.id}`} className="stream">
              <div className="stream-thumbnail">{stream.name}</div>
            </Link>
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
