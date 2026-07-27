import { AuthProvider } from './contexts/AuthProvider';
import { Routes, Route, Navigate } from 'react-router';
import Home from './pages/Home';
import LeaderBoard from './pages/LeaderBoard';
import Battle from './pages/Battle';
import Login from './pages/Login';
import Register from './pages/Register';
import MyRoster from './pages/MyRoster';
import PokemonDetails from './pages/PokemonDetails';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="/pokemon/:id" element={<PokemonDetails />} />
          <Route path="/leaderboard" element={<LeaderBoard />} />
          <Route
            path="/battle"
            element={
              <ProtectedRoute>
                <Battle />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/my-roster"
            element={
              <ProtectedRoute>
                <MyRoster />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
