import React, { useState } from "react";
import {
  CognitoUserPool,
  CognitoUser,
  CognitoUserAttribute,
} from "amazon-cognito-identity-js";
import "./Singup.css";

const Singup = ({ is_login }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [confirm, setconfirm] = useState(false);
  const [confrim_code, setconfirm_code] = useState("");

  const poolData = {
    UserPoolId: "ap-northeast-2_INqpBvMxg",
    ClientId: "o43d44nut01aqi5im5l30l0fi",
  };
  const userPool = new CognitoUserPool(poolData);

  const signUp = async () => {
    const attributeList = [
      new CognitoUserAttribute({
        Name: "email",
        Value: email, // 사용자가 입력한 이메일 주소
      }),
      new CognitoUserAttribute({
        Name: "nickname",
        Value: nickname, // userName
      }),
      new CognitoUserAttribute({
        Name: "custom:chanelName",
        Value: "",
      }),
    ];

    userPool.signUp(email, password, attributeList, null, (err, result) => {
      if (err) {
        alert(err.message || JSON.stringify(err));
        return;
      }
      setconfirm(true);
      const cognitoUser = result.user;
      console.log("User name is " + cognitoUser.getUsername());
    });
  };

  const confrimCode = async () => {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    });

    cognitoUser.confirmRegistration(confrim_code, true, (err, result) => {
      is_login(true);
      if (err) {
        alert(err.message || JSON.stringify(err));
        return;
      }
    });
    alert("회원가입 완료");
  };

  const reConfrimCode = async () => {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    });
    cognitoUser.resendConfirmationCode((err, result) => {
      if (err) {
        alert(err.message || JSON.stringify(err));
        return;
      }
      console.log(result);
      alert("인증코드가 재전송되었습니다. 이메일을 확인하세요.");
    });
  };

  const confirm_div = (
    <div className="input-group">
      <label>확인코드</label>
      <input
        id="confirm"
        type="text"
        value={confrim_code}
        onChange={(e) => setconfirm_code(e.target.value)}
      />
      <div className="user_toggle">
        <button
          type="submit"
          className="users-button"
          onClick={() => confrimCode()}
        >
          확인
        </button>
        <button
          type="submit"
          className="users-button"
          onClick={() => reConfrimCode()}
        >
          인증코드 재전송
        </button>
      </div>
    </div>
  );

  return (
    <div className="login-form">
      <div className="input-group">
        <label htmlFor="username">Email</label>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="input-group">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="input-group">
        <label htmlFor="password">이름</label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
      </div>
      {confirm && confirm_div}
      <button type="submit" className="login-button" onClick={signUp}>
        회원가입
      </button>
    </div>
  );
};

export default Singup;
