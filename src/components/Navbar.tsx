import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useAuth } from '../contexts/AuthProvider';
import { useNavigate } from 'react-router';
import type { NavItem } from '../types';

const drawerWidth = 240;

function Navbar({ window }: { window?: () => Window }) {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems: NavItem[] = [
    { label: 'Home', path: '/' },
    { label: 'Leader Board', path: '/leader-board' }
  ];
  if (isAuthenticated) {
    navItems.push({ label: 'Battle', path: '/battle' });
    navItems.push({ label: 'My Roster', path: '/my-roster' });
    navItems.push({ label: 'Logout', path: '#', action: handleLogout });
  } else {
    navItems.push({ label: 'Login', path: '/login' });
    navItems.push({ label: 'Register', path: '/register' });
  }

  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(prevState => !prevState);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }} className="text-info">
        Pokémon
      </Typography>
      <Divider />
      <List>
        {navItems.map(item => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton
              onClick={() => {
                item.action ? item.action() : navigate(item.path);
              }}
              sx={{ textAlign: 'center' }}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar component="nav" className="bg-primary">
        <Toolbar className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20">
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            className="text-info"
            sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
          >
            Pokémon
          </Typography>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            {navItems.map(item => (
              <Button
                key={item.label}
                onClick={() => {
                  item.action ? item.action() : navigate(item.path);
                }}
                className="text-white normal-case px-2 md:px-5"
              >
                {item.label}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>
      <nav>
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
          }}
        >
          {drawer}
        </Drawer>
      </nav>
    </Box>
  );
}

export default Navbar;
