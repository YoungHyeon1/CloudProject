import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "./App.css";
import Main from "./components/Main";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import LiveStreamPage from "./components/Stream/LiveStreamPage";
import Login from "./components/Login/Login";

function App() {
  return (
    <>
      <Router>
        <Header />
        <Routes>
          <Route element={<Main />} path="/" />
          <Route element={<LiveStreamPage />} path="/channel/:id" />
          <Route path="/login" element={<Login />} />
        </Routes>
        <Footer />
      </Router>
    </>
  );
}

export default App;
