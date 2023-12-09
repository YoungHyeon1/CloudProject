// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import * as config from '../../config';
import axios from 'axios';
import './LiveStreamPage.css';
const axiosApi = axios.create({
  baseURL: config.ApiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

const VideoPlayer = ({ id }) => {
  const [player, setPlayer] = useState(null);
  const [playback, setPlayBack] = useState(null);
  const handleGetChannelInfo = async () => {
    try {
      const response = await axiosApi.get('/public/get_channel', {
        params: {
          code: id,
        },
      });
      setPlayBack(response.data.play_back);
    } catch (error) {
      console.log('Error:', error);
    }
  };

  useEffect(() => {
    handleGetChannelInfo();
  }, []);

  const loadIVSPlayerScript = () => {
    return new Promise((resolve, reject) => {
      if (window.IVSPlayer) {
        resolve();
      } else {
        console.log('Is Not Load');
      }
    });
  };

  useEffect(() => {
    /**
     * 이전에 IVS Player가 두번 실행된적이 있어 이와같이 작업했습니다.
     * Ivs Player의 스크립트를 불러와 Attach하고, 이벤트 리스너를 추가합니다.
     */
    const MediaPlayerPackage = window.IVSPlayer;
    if (!playback) {
      return;
    }
    loadIVSPlayerScript()
      .then(() => {
        if (window.IVSPlayer.isPlayerSupported) {
          const PlayerState = MediaPlayerPackage.PlayerState;
          const PlayerEventType = MediaPlayerPackage.PlayerEventType;

          // Attach event listeners
          let newPlayer = player;
          if (!newPlayer) {
            newPlayer = MediaPlayerPackage.create();
            newPlayer.attachHTMLVideoElement(
              document.getElementById('video-player')
            );
            setPlayer(newPlayer);
          }

          if (newPlayer) {
            // 스트림 URL 로드
            console.log(playback);
            newPlayer.load(playback);
            newPlayer.addEventListener(PlayerState.PLAYING, () => {
              console.info('Player State - PLAYING');
            });
            newPlayer.addEventListener(PlayerState.ENDED, () => {
              console.info('Player State - ENDED');
            });
            newPlayer.addEventListener(PlayerState.READY, () => {
              console.info('Player State - READY');
              newPlayer.play();
            });
            newPlayer.addEventListener(PlayerEventType.ERROR, err => {
              console.log('Player Event - ERROR:', err);
              alert('종료된 방송입니다.');
            });
          }

          return () => {
            if (newPlayer) {
              newPlayer.removeEventListener(PlayerState.PLAYING);
              newPlayer.removeEventListener(PlayerState.ENDED);
              newPlayer.removeEventListener(PlayerState.READY);
              newPlayer.removeEventListener(PlayerState.ERROR);
              newPlayer.pause();
              newPlayer.remove();
            }
          };
        }
      })
      .catch(err => console.error('IVS Player 스크립트 로드 실패:', err));
  }, [playback]);
  return (
    <>
      <div className="player-wrapper">
        <div className="aspect-169 pos-relative full-width full-height">
          <video
            id="video-player"
            className="video-elem pos-absolute full-width"
            playsInline
            muted
          ></video>
        </div>
      </div>
    </>
  );
};

export default VideoPlayer;
VideoPlayer.propTypes = {
  id: PropTypes.string,
};
