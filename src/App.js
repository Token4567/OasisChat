import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Home from './components/Home';
import Chat from './components/Chat';
import Login from './components/Login';

function PrivateRoute({ children }) {
  const { currentUser, loading } = useAuth();
  console.log("PrivateRoute:", { currentUser: !!currentUser, loading });

  if (loading) {
    return (
      <div style={{ 
        padding: 20, 
        textAlign: 'center', 
        fontFamily: 'Arial', 
        marginTop: 50 
      }}>
        <div>Loading your messages...</div>
      </div>
    );
  }
  return currentUser ? children : <Navigate to="/login" />;
}
function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          } />
          <Route path="/chat/:userId" element={
            <PrivateRoute>
              <Chat />
            </PrivateRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
