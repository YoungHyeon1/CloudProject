// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useEffect, useState, useRef, createRef } from "react";
import Linkify from "linkify-react";
import axios from "axios";
import {
  ChatRoom,
  DeleteMessageRequest,
  DisconnectUserRequest,
  SendMessageRequest,
} from "amazon-ivs-chat-messaging";
import { useParams } from "react-router-dom";
import {
  CognitoUserPool,
  AuthenticationDetails,
} from "amazon-cognito-identity-js";
import * as config from "../../config";

// Components
import VideoPlayer from "./LiveStreamPage";

// Styles
import "./Chat.css";

const Chat = () => {
  const [username, setUsername] = useState("");
  const [moderator, setModerator] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatRoom, setChatRoom] = useState([]);
  const [showRaiseHandPopup, setShowRaiseHandPopup] = useState(false);
  const [usernameRaisedHand, setUsernameRaisedHand] = useState(null);
  const [handRaised, setHandRaised] = useState(false);
  const previousRaiseHandUsername = useRef(null);
  const { id } = useParams();
  const chatRef = createRef();
  const messagesEndRef = createRef();
  const userPool = new CognitoUserPool({
    UserPoolId: config.UserPoolId,
    ClientId: config.ClientId,
  });

  const axiosApi = axios.create({
    baseURL: config.ApiUrl,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Fetches a chat token
  const tokenProvider = async () => {
    const idToken = await getCurrentUserToken();
    var token;
    try {
      const response = await axiosApi.get(
        `/stream/get_caht?targetChanel=${id}`,
        {
          headers: {
            Authorization: idToken,
          },
        }
      );
      token = {
        token: response.data.token,
        sessionExpirationTime: new Date(response.data.sessionExpirationTime),
        tokenExpirationTime: new Date(response.data.tokenExpirationTime),
      };
      console.log("token", token);
      return token;
    } catch (error) {
      console.log("Error:", error);
    }
  };

  function getCurrentUserToken() {
    return new Promise((resolve, reject) => {
      const currentUser = userPool.getCurrentUser();
      if (currentUser) {
        currentUser.getSession((err, session) => {
          if (err) {
            reject(err);
          } else {
            const accessToken = session.getIdToken().getJwtToken();
            setUsername(session.idToken.payload.nickname);
            resolve(accessToken);
          }
        });
      } else {
        reject(new Error("No current user"));
      }
    });
  }

  const handleGetToken = () => {
    // Instantiate a chat room
    const room = new ChatRoom({
      regionOrUrl: config.Resion,
      tokenProvider: () => tokenProvider(),
    });

    setChatRoom(room);

    // Connect to the chat room
    room.connect();
  };

  useEffect(() => {
    handleGetToken();
  }, []);

  useEffect(() => {
    // If chat room listeners are not available, do not continue
    if (!chatRoom.addListener) {
      return;
    }

    // Hide the sign in modal
    const unsubscribeOnConnected = chatRoom.addListener("connect", () => {
      // Connected to the chat room.
      renderConnect();
    });

    const unsubscribeOnDisconnected = chatRoom.addListener(
      "disconnect",
      (reason) => {
        // Disconnected from the chat room.
      }
    );

    const unsubscribeOnUserDisconnect = chatRoom.addListener(
      "userDisconnect",
      (disconnectUserEvent) => {
        /* Example event payload:
         * {
         *   id: "AYk6xKitV4On",
         *   userId": "R1BLTDN84zEO",
         *   reason": "Spam",
         *   sendTime": new Date("2022-10-11T12:56:41.113Z"),
         *   requestId": "b379050a-2324-497b-9604-575cb5a9c5cd",
         *   attributes": { UserId: "R1BLTDN84zEO", Reason: "Spam" }
         * }
         */
        renderDisconnect(disconnectUserEvent.reason);
      }
    );

    const unsubscribeOnConnecting = chatRoom.addListener("connecting", () => {
      // Connecting to the chat room.
    });

    const unsubscribeOnMessageReceived = chatRoom.addListener(
      "message",
      (message) => {
        // Received a message
        const messageType = message.attributes?.message_type || "MESSAGE";
        switch (messageType) {
          case "RAISE_HAND":
            handleRaiseHand(message);
            break;
          case "STICKER":
            handleSticker(message);
            break;
          default:
            handleMessage(message);
            break;
        }
      }
    );

    const unsubscribeOnEventReceived = chatRoom.addListener(
      "event",
      (event) => {
        // Received an event
        handleEvent(event);
      }
    );

    const unsubscribeOnMessageDeleted = chatRoom.addListener(
      "messageDelete",
      (deleteEvent) => {
        // Received message delete event
        const messageIdToDelete = deleteEvent.messageId;
        setMessages((prevState) => {
          // Remove message that matches the MessageID to delete
          const newState = prevState.filter(
            (item) => item.messageId !== messageIdToDelete
          );
          return newState;
        });
      }
    );

    return () => {
      unsubscribeOnConnected();
      unsubscribeOnDisconnected();
      unsubscribeOnUserDisconnect();
      unsubscribeOnConnecting();
      unsubscribeOnMessageReceived();
      unsubscribeOnEventReceived();
      unsubscribeOnMessageDeleted();
    };
  }, [chatRoom]);

  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    };
    scrollToBottom();
  });

  useEffect(() => {
    previousRaiseHandUsername.current = usernameRaisedHand;
  }, []);

  // Handlers
  const handleError = (data) => {
    const username = "";
    const userId = "";
    const avatar = "";
    const message = `Error ${data.errorCode}: ${data.errorMessage}`;
    const messageId = "";
    const timestamp = `${Date.now()}`;

    const newMessage = {
      type: "ERROR",
      timestamp,
      username,
      userId,
      avatar,
      message,
      messageId,
    };

    setMessages((prevState) => {
      return [...prevState, newMessage];
    });
  };

  const handleMessage = (data) => {
    const username = data.sender.attributes.username;
    const userId = data.sender.userId;
    const avatar = data.sender.attributes.avatar;
    const message = data.content;
    const messageId = data.id;
    const timestamp = data.sendTime;

    const newMessage = {
      type: "MESSAGE",
      timestamp,
      username,
      userId,
      avatar,
      message,
      messageId,
    };

    setMessages((prevState) => {
      return [...prevState, newMessage];
    });
  };

  const handleEvent = (event) => {
    const eventName = event.eventName;
    switch (eventName) {
      case "aws:DELETE_MESSAGE":
        // Ignore system delete message events, as they are handled
        // by the messageDelete listener on the room.
        break;
      case "app:DELETE_BY_USER":
        const userIdToDelete = event.attributes.userId;
        setMessages((prevState) => {
          // Remove message that matches the MessageID to delete
          const newState = prevState.filter(
            (item) => item.userId !== userIdToDelete
          );
          return newState;
        });
        break;
      default:
        console.info("Unhandled event received:", event);
    }
  };

  const handleOnClick = () => {};

  const handleChange = (e) => {
    setMessage(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (message) {
        sendMessage(message);
        setMessage("");
      }
    }
  };

  const deleteMessageByUserId = async (userId) => {
    // Send a delete event
    try {
      const response = await sendEvent({
        eventName: "app:DELETE_BY_USER",
        eventAttributes: {
          userId: userId,
        },
      });
      return response;
    } catch (error) {
      return error;
    }
  };

  const handleMessageDelete = async (messageId) => {
    const request = new DeleteMessageRequest(messageId, "Reason for deletion");
    try {
      await chatRoom.deleteMessage(request);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUserKick = async (userId) => {
    const request = new DisconnectUserRequest(userId, "Kicked by moderator");
    try {
      await chatRoom.disconnectUser(request);
      await deleteMessageByUserId(userId);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSticker = (data) => {
    const username = data.sender.attributes?.username;
    const userId = data.sender.userId;
    const avatar = data.sender.attributes.avatar;
    const message = data.content;
    const sticker = data.attributes.sticker_src;
    const messageId = data.id;
    const timestamp = data.sendTime;

    const newMessage = {
      type: "STICKER",
      timestamp,
      username,
      userId,
      avatar,
      message,
      messageId,
      sticker,
    };

    setMessages((prevState) => {
      return [...prevState, newMessage];
    });
  };

  const handleRaiseHand = async (data) => {
    const username = data.sender.attributes?.username;
    setUsernameRaisedHand(username);

    if (previousRaiseHandUsername.current !== username) {
      setShowRaiseHandPopup(true);
    } else {
      setShowRaiseHandPopup((showRaiseHandPopup) => !showRaiseHandPopup);
    }
  };

  const handleStickerSend = async (sticker) => {
    const content = `Sticker: ${sticker.name}`;
    const attributes = {
      message_type: "STICKER",
      sticker_src: `${sticker.src}`,
    };
    const request = new SendMessageRequest(content, attributes);
    try {
      await chatRoom.sendMessage(request);
    } catch (error) {
      handleError(error);
    }
  };

  const sendMessage = async (message) => {
    const content = `${message.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}`;
    const request = new SendMessageRequest(content);
    try {
      await chatRoom.sendMessage(request);
    } catch (error) {
      handleError(error);
    }
  };

  const sendEvent = async (data) => {
    const formattedData = {
      eventName: `${data.eventName}`,
      eventAttributes: data.eventAttributes,
    };

    try {
      const response = await axios.post(`/event`, formattedData);
      console.info("SendEvent Success:", response.data);
      return response;
    } catch (error) {
      console.error("SendEvent Error:", error);
      return error;
    }
  };

  // Renderers
  const renderErrorMessage = (errorMessage) => {
    return (
      <div className="error-line" key={errorMessage.timestamp}>
        <p>{errorMessage.message}</p>
      </div>
    );
  };

  const renderSuccessMessage = (successMessage) => {
    return (
      <div className="success-line" key={successMessage.timestamp}>
        <p>{successMessage.message}</p>
      </div>
    );
  };

  const renderChatLineActions = (message) => {
    return (
      <>
        <button
          className="chat-line-btn"
          onClick={(e) => {
            e.preventDefault();
            handleMessageDelete(message.messageId);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 0 24 24"
            width="24px"
          >
            <path d="M0 0h24v24H0z" fill="none" />
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
          </svg>
        </button>
        <button
          className="chat-line-btn"
          onClick={(e) => {
            e.preventDefault();
            handleUserKick(message.userId);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            enableBackground="new 0 0 24 24"
            height="24px"
            viewBox="0 0 24 24"
            width="24px"
          >
            <rect fill="none" height="24" width="24" />
            <g>
              <path d="M8.65,5.82C9.36,4.72,10.6,4,12,4c2.21,0,4,1.79,4,4c0,1.4-0.72,2.64-1.82,3.35L8.65,5.82z M20,17.17 c-0.02-1.1-0.63-2.11-1.61-2.62c-0.54-0.28-1.13-0.54-1.77-0.76L20,17.17z M21.19,21.19L2.81,2.81L1.39,4.22l8.89,8.89 c-1.81,0.23-3.39,0.79-4.67,1.45C4.61,15.07,4,16.1,4,17.22V20h13.17l2.61,2.61L21.19,21.19z" />
            </g>
          </svg>
        </button>
      </>
    );
  };

  const renderStickerMessage = (message) => (
    <div className="chat-line-sticker-wrapper" key={message.timestamp}>
      <div className="chat-line chat-line--sticker" key={message.timestamp}>
        <img
          className="chat-line-img"
          src={message.avatar}
          alt={`Avatar for ${message.username}`}
        />
        <p>
          <span className="username">{message.username}</span>
        </p>
        <img className="chat-sticker" src={message.sticker} alt={`sticker`} />
      </div>
      {moderator ? renderChatLineActions(message) : ""}
    </div>
  );

  const renderMessage = (message) => {
    return (
      <div className="chat-line-wrapper" key={message.id}>
        <div className="chat-line">
          <img
            className="chat-line-img"
            src={message.avatar}
            alt={`Avatar for ${message.username}`}
          />
          <p>
            <span className="username">{message.username}</span>
            <Linkify
              options={{
                ignoreTags: ["script", "style"],
                nl2br: true,
                rel: "noopener noreferrer",
                target: "_blank",
              }}
            >
              {message.message}
            </Linkify>
          </p>
        </div>
        {moderator ? renderChatLineActions(message) : ""}
      </div>
    );
  };

  const renderMessages = () => {
    return messages.map((message) => {
      switch (message.type) {
        case "ERROR":
          const errorMessage = renderErrorMessage(message);
          return errorMessage;
        case "SUCCESS":
          const successMessage = renderSuccessMessage(message);
          return successMessage;
        case "STICKER":
          const stickerMessage = renderStickerMessage(message);
          return stickerMessage;
        case "MESSAGE":
          const textMessage = renderMessage(message);
          return textMessage;
        default:
          console.info("Received unsupported message:", message);
          return <></>;
      }
    });
  };

  const renderDisconnect = (reason) => {
    const error = {
      type: "ERROR",
      timestamp: `${Date.now()}`,
      username: "",
      userId: "",
      avatar: "",
      message: `Connection closed. Reason: ${reason}`,
    };
    setMessages((prevState) => {
      return [...prevState, error];
    });
  };

  const renderConnect = () => {
    const status = {
      type: "SUCCESS",
      timestamp: `${Date.now()}`,
      username: "",
      userId: "",
      avatar: "",
      message: `Connected to the chat room.`,
    };
    setMessages((prevState) => {
      return [...prevState, status];
    });
  };

  const isChatConnected = () => {
    const chatState = chatRoom.state;
    return chatState === "connected";
  };

  return (
    <>
      <div className="main full-width full-height chat-container">
        <div className="content-wrapper mg-2">
          <VideoPlayer
            playbackUrl={
              "https://3d26876b73d7.us-west-2.playback.live-video.net/api/video/v1/us-west-2.913157848533.channel.rkCBS9iD1eyd.m3u8"
            }
          />
          <div className="col-wrapper">
            <div className="chat-wrapper">
              <div className="messages">
                {renderMessages()}
                <div ref={messagesEndRef} />
              </div>
              <div className="composer fl fl-j-center">
                <input
                  ref={chatRef}
                  className={`rounded mg-r-1 ${!username ? "hidden" : ""}`}
                  type="text"
                  placeholder={
                    isChatConnected()
                      ? "Say something"
                      : "Waiting to connect..."
                  }
                  value={message}
                  maxLength={500}
                  disabled={!isChatConnected()}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                />
                {!username && (
                  <fieldset>
                    <button
                      onClick={handleOnClick}
                      className="btn btn--primary full-width rounded"
                    >
                      로그인 후 채팅이 가능합니다
                    </button>
                  </fieldset>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;
