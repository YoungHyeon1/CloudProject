import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "./App.css";
import Main from "./components/Main";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import LiveStreamPage from "./components/Stream/LiveStreamPage";
import Users from "./components/Users/Users";
import { AppProvider } from "./components/AppProvider";

function App() {
  return (
    <>
      <Router>
        <AppProvider>
          <Header />
          <Routes>
            <Route element={<Main />} path="/" />
            <Route element={<LiveStreamPage />} path="/channel/:id" />
            <Route element={<LiveStreamPage />} path="/about" />
            <Route path="/login" element={<Users />} />
          </Routes>
          <Footer />
        </AppProvider>
      </Router>
    </>
  );
}

export default App;
