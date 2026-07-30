import { AuthProvider } from './contexts/AuthProvider';
import { Routes, Route, Navigate } from 'react-router';
import Home from './pages/Home';
import Leaderboard from './pages/LeaderBoard';
import Battle from './pages/Battle';
import Login from './pages/Login';
import Register from './pages/Register';
import MyRoster from './pages/MyRoster';
import PokemonDetails from './pages/PokemonDetails';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import { ThemeProvider } from './contexts/ThemeProvider';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="/pokemon/:id" element={<PokemonDetails />} />
            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute>
                  <Leaderboard />
                </ProtectedRoute>
              }
            />
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
      </AuthProvider>{' '}
    </ThemeProvider>
  );
}

export default App;
