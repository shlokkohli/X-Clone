import { useState } from "react";
import { Route, Routes } from "react-router-dom";

import { HomePage, SignUpPage, LoginPage } from './pages/auth/index.js';
import NotificationPage from './pages/notification/NotificationPage.jsx';
import ProfilePage from './pages/profile/ProfilePage.jsx';

import Sidebar from './components/common/Sidebar.jsx'
import RightPanel from "./components/common/RightPanel.jsx";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex max-w-6xl mx auto ml-40">
      {/* common component */}
      <Sidebar />
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/signup' element={<SignUpPage />} />
        <Route path='/notifications' element={<NotificationPage />} />
        <Route path='/profile/:username' element={<ProfilePage />} />
      </Routes>
      <RightPanel />
    </div>
  );
}

export default App;