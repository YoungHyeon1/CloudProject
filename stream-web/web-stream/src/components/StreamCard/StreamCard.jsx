import React from 'react';
import PropTypes from 'prop-types';
import './StreamCard.css'; // 스타일시트 임포트

function VideoCard({ thumbnail, title, channel }) {
  return (
    <div className="videoCard">
      <img className="videoCard__thumbnail" src={thumbnail} alt="" />
      <div className="videoCard__info">
        <h4>{title}</h4>
        <p>{channel}</p>
      </div>
    </div>
  );
}

export default VideoCard;

VideoCard.propTypes = {
  title: PropTypes.string,
  channel: PropTypes.string,
  thumbnail: PropTypes.string,
};
