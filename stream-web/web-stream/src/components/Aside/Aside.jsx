import React, { useEffect, useState } from "react";
import "./Aside.css";

function Aside() {
  const [userList, setUserList] = useState([]);

  useEffect(() => {
    // 여기서 데이터를 가져오는 비동기 함수를 호출하고, 그 결과로 setUserList를 호출
    const fetchUserList = async () => {
      try {
        // 예시: API에서 데이터를 가져온다고 가정
        const response = await fetch(
          "https://xw6vimxva3.execute-api.ap-northeast-2.amazonaws.com/develop/public/users"
        );
        const data = await response.json();
        setUserList(data);
      } catch (error) {
        console.error("Error fetching user list:", error);
      }
    };

    fetchUserList();
  }, []); // 빈 배열을 전달하여 컴포넌트가 마운트될 때만 실행되도록 함

  return (
    <aside className="aside">
      <nav>
        <div className="users-list">
          <h2>추천 채널</h2>
          <ul>
            {userList.map((user) => (
              <li key={user.nickname}>
                <a href={`/user/${user.nickname}`}>{user.nickname}</a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </aside>
  );
}

export default Aside;
