import { useState, useEffect } from 'react';
import { GoogleOAuthProvider, GoogleLogin, googleLogout } from '@react-oauth/google';
import { Route, Routes } from 'react-router-dom';
import CreateRoom from './components/CreateRoom';
import Room from './components/Room';

const App = () => {
  const clientId =
    '900665831689-pdp7s87d4gecvpnb961bnrolnchmihg5.apps.googleusercontent.com';

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const storedUserInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (storedUserInfo) {
      setUserInfo(storedUserInfo);
      setIsLoggedIn(true);
    }
  }, []);

  const onSuccess = (response) => {
    console.log('Login Success:', response);
    const userData = response?.credential ? JSON.parse(atob(response.credential.split('.')[1])) : null;
    if (userData) {
      const newUserInfo = {
        name: userData.name,
        imageUrl: userData.picture,
        email: userData.email,
      };
      setUserInfo(newUserInfo);
      setIsLoggedIn(true);

      localStorage.setItem('userInfo', JSON.stringify(newUserInfo));
    }
  };

  const onError = () => {
    console.log('Login Failed');
    setIsLoggedIn(false);
  };

  const handleSignOut = () => {
    googleLogout();
    setIsLoggedIn(false);
    setUserInfo(null);

    localStorage.removeItem('userInfo');
    console.log('User signed out');
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div>
        {!isLoggedIn ? (
          <div className="d-flex justify-content-center align-items-center min-vh-100">
            <div className="text-center">
              <h1 className="h2 mb-4">Welcome! Please log in</h1>
              <GoogleLogin onSuccess={onSuccess} onError={onError} />
            </div>
          </div>
        ) : (
          <div>
            <header className="d-flex justify-content-between align-items-center p-4 bg-light shadow-sm">
              <h1 className="h4 font-weight-bold">My App</h1>
              {userInfo && (
                <div className="d-flex align-items-center gap-3">
                  <img
                    src={userInfo.imageUrl}
                    alt="User Avatar"
                    className="rounded-circle"
                    style={{ width: '40px', height: '40px' }}
                  />
                  <div>
                    <p className="mb-0 font-weight-semibold">Name: {userInfo.name}</p>
                    <p className="mb-0 text-muted small">Email: {userInfo.email}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="btn btn-danger btn-sm"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </header>
            <Routes>
              <Route path="/" element={<CreateRoom />} />
              <Route path="/room/:id" element={<Room />} />
            </Routes>
          </div>
        )}
      </div>
    </GoogleOAuthProvider>
  );
};

export default App;
