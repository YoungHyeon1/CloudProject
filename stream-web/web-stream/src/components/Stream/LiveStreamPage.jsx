// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useEffect, useState } from "react";

// Styles
import "./LiveStreamPage.css";

const VideoPlayer = ({}) => {
  const [player, setPlayer] = useState(null);

  const playbackUrl =
    "https://3d26876b73d7.us-west-2.playback.live-video.net/api/video/v1/us-west-2.913157848533.channel.rkCBS9iD1eyd.m3u8";

  const loadIVSPlayerScript = () => {
    return new Promise((resolve, reject) => {
      if (window.IVSPlayer) {
        resolve();
      } else {
        console.log("Is Not Load");
      }
    });
  };
  useEffect(() => {
    // First, check if the browser supports the Amazon IVS player.
    const MediaPlayerPackage = window.IVSPlayer;

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
              document.getElementById("video-player")
            );
            setPlayer(newPlayer);
          }

          if (newPlayer) {
            // 스트림 URL 로드
            newPlayer.load(playbackUrl);
            newPlayer.addEventListener(PlayerState.PLAYING, () => {
              console.info("Player State - PLAYING");
            });
            newPlayer.addEventListener(PlayerState.ENDED, () => {
              console.info("Player State - ENDED");
            });
            newPlayer.addEventListener(PlayerState.READY, () => {
              console.info("Player State - READY");
              // newPlayer.play();
            });
            newPlayer.addEventListener(PlayerEventType.ERROR, (err) => {
              console.log("Player Event - ERROR:", err);
            });
          }

          // player.setVolume(0.5);
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
      .catch((err) => console.error("IVS Player 스크립트 로드 실패:", err));
  }, []); // eslint-disable-line
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
