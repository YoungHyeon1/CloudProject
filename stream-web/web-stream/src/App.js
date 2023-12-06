import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import './App.css';
import Main from './components/Main';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import LiveStreamPage from './components/Stream/LiveStreamPage';
import Chat from './components/Stream/Chat';
import Users from './components/Users/Users';
import { AppProvider } from './components/AppProvider';
import Mypage from './components/Mypage/Mypage';
import Aside from './components/Aside/Aside';
function App() {
  return (
    <>
      <Router>
        <div className="app">
          <AppProvider>
            <Header />
            <div className="content-area">
              <Aside />
              <div className="main-content">
                <Routes>
                  <Route element={<Mypage />} path="/mypage" />
                  <Route element={<Main />} path="/" />
                  <Route element={<Chat />} path="/channel/:id" />
                  <Route path="/login" element={<Users />} />
                </Routes>
              </div>
            </div>
            <Footer />
          </AppProvider>
        </div>
      </Router>
    </>
  );
}

export default App;
