import React, { useEffect } from "react";
import Chat from "./Chat";
import "./Aside.css";

function Aside() {
  return (
    <aside className="aside">
      <nav>
        <div className="users-list">
          <h2>추천 채널</h2>
          <ul>
            <li>
              <a href="/">꺄르륵</a>
            </li>
            <li>
              <a href="/other">꺄륵꺄륵</a>
            </li>
            {/* 추가 링크 */}
          </ul>
        </div>
        <div>
          <Chat />
        </div>
      </nav>
    </aside>
  );
}

export default Aside;
