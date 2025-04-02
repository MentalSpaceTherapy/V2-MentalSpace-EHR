import React, { useState } from 'react';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Avatar, 
  Tooltip, 
  Menu, 
  MenuItem, 
  ListItemIcon,
  Divider,
  useTheme,
  useMediaQuery,
  Badge,
  ToggleButtonGroup,
  ToggleButton,
  Stack,
  Button,
  alpha,
  Fade
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  Logout as LogoutIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  SettingsBrightness as SystemThemeIcon,
  Palette as PaletteIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { Sidebar } from './Sidebar';
import { useThemeContext } from '../../context';
import { blue, purple, green, orange, teal, indigo, pink, deepOrange } from '@mui/material/colors';

interface PageLayoutProps {
  children: React.ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { sidebarCollapsed, mode, setMode, themeColor, setThemeColor } = useThemeContext();
  const drawerWidth = 240;
  const collapsedWidth = 72;
  const actualDrawerWidth = sidebarCollapsed ? collapsedWidth : drawerWidth;
  
  // State for mobile drawer
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // State for user menu
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(null);
  const isUserMenuOpen = Boolean(userMenuAnchorEl);
  
  // State for notifications menu
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState<null | HTMLElement>(null);
  const isNotificationsMenuOpen = Boolean(notificationsAnchorEl);
  
  // State for theme menu
  const [themeMenuAnchorEl, setThemeMenuAnchorEl] = useState<null | HTMLElement>(null);
  const isThemeMenuOpen = Boolean(themeMenuAnchorEl);
  
  // Color options for theme picker
  const colorOptions = [
    { color: 'blue', value: blue[500] },
    { color: 'purple', value: purple[500] },
    { color: 'green', value: green[500] },
    { color: 'orange', value: orange[500] },
    { color: 'teal', value: teal[500] },
    { color: 'indigo', value: indigo[500] },
    { color: 'pink', value: pink[500] },
    { color: 'deepOrange', value: deepOrange[500] },
  ];
  
  // Handle drawer toggle
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  // Handle user menu
  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchorEl(event.currentTarget);
  };
  
  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };
  
  // Handle notifications menu
  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchorEl(event.currentTarget);
  };
  
  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };
  
  // Handle theme menu
  const handleThemeMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setThemeMenuAnchorEl(event.currentTarget);
    handleUserMenuClose();
  };
  
  const handleThemeMenuClose = () => {
    setThemeMenuAnchorEl(null);
  };
  
  // Handle theme mode change
  const handleThemeModeChange = (newMode: 'light' | 'dark' | 'system') => {
    setMode(newMode);
    handleThemeMenuClose();
  };
  
  // Handle theme color change
  const handleThemeColorChange = (newColor: string) => {
    setThemeColor(newColor as any);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${actualDrawerWidth}px)` },
          ml: { sm: `${actualDrawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: `1px solid ${theme.palette.divider}`,
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          backdropFilter: 'blur(8px)',
          backgroundColor: alpha(theme.palette.background.paper, 0.9),
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title="Search">
              <IconButton color="inherit" sx={{ display: { xs: 'none', sm: 'flex' } }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </IconButton>
            </Tooltip>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Theme Toggle Button */}
            <Tooltip title="Change theme">
              <IconButton color="inherit" onClick={handleThemeMenuOpen} sx={{ mx: 1 }}>
                {mode === 'light' && <LightModeIcon />}
                {mode === 'dark' && <DarkModeIcon />}
                {mode === 'system' && <SystemThemeIcon />}
              </IconButton>
            </Tooltip>
            
            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton 
                size="large" 
                color="inherit"
                onClick={handleNotificationsOpen}
                sx={{ mx: 1 }}
              >
                <Badge badgeContent={4} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            
            {/* User Menu */}
            <Tooltip title="Account settings">
              <IconButton
                onClick={handleUserMenuOpen}
                size="small"
                sx={{ ml: 1 }}
                aria-controls={isUserMenuOpen ? 'user-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={isUserMenuOpen ? 'true' : undefined}
              >
                <Avatar sx={{ width: 36, height: 36, bgcolor: theme.palette.primary.main }}>
                  <PersonIcon />
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Sidebar */}
      <Sidebar
        open={mobileOpen}
        drawerWidth={drawerWidth}
        onClose={handleDrawerToggle}
        variant={isMobile ? 'temporary' : 'permanent'}
      />
      
      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${actualDrawerWidth}px)` },
          mt: '64px', // AppBar height
          minHeight: 'calc(100vh - 64px)',
          bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'grey.50',
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {children}
      </Box>
      
      {/* User Menu Dropdown */}
      <Menu
        anchorEl={userMenuAnchorEl}
        id="user-menu"
        open={isUserMenuOpen}
        onClose={handleUserMenuClose}
        onClick={handleUserMenuClose}
        PaperProps={{
          elevation: 2,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
            mt: 1.5,
            width: 220,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem>
          <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
            <PersonIcon />
          </Avatar>
          <Typography variant="body1">My Profile</Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleThemeMenuOpen}>
          <ListItemIcon>
            <PaletteIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">Appearance</Typography>
          <ChevronRightIcon fontSize="small" sx={{ ml: 'auto', opacity: 0.5 }} />
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">Settings</Typography>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <HelpIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">Help Center</Typography>
        </MenuItem>
        <Divider />
        <MenuItem>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">Logout</Typography>
        </MenuItem>
      </Menu>
      
      {/* Theme Settings Menu */}
      <Menu
        anchorEl={themeMenuAnchorEl}
        open={isThemeMenuOpen}
        onClose={handleThemeMenuClose}
        PaperProps={{
          elevation: 2,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
            mt: 1.5,
            width: 280,
            p: 2,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        TransitionComponent={Fade}
      >
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
          Appearance
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Theme Mode
        </Typography>
        
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={(e, newMode) => newMode && handleThemeModeChange(newMode)}
          aria-label="theme mode"
          size="small"
          fullWidth
          sx={{ mb: 3 }}
        >
          <ToggleButton value="light" aria-label="light mode">
            <LightModeIcon fontSize="small" sx={{ mr: 1 }} />
            Light
          </ToggleButton>
          <ToggleButton value="system" aria-label="system theme">
            <SystemThemeIcon fontSize="small" sx={{ mr: 1 }} />
            System
          </ToggleButton>
          <ToggleButton value="dark" aria-label="dark mode">
            <DarkModeIcon fontSize="small" sx={{ mr: 1 }} />
            Dark
          </ToggleButton>
        </ToggleButtonGroup>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Accent Color
        </Typography>
        
        <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
          {colorOptions.map((option) => (
            <Tooltip key={option.color} title={option.color} placement="top">
              <IconButton
                onClick={() => handleThemeColorChange(option.color)}
                sx={{
                  width: 36,
                  height: 36,
                  backgroundColor: option.value,
                  border: themeColor === option.color 
                    ? `2px solid ${theme.palette.mode === 'dark' ? '#fff' : '#000'}`
                    : 'none',
                  '&:hover': {
                    backgroundColor: option.value,
                    filter: 'brightness(1.1)',
                  },
                }}
              >
                {themeColor === option.color && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </IconButton>
            </Tooltip>
          ))}
        </Box>
        
        <Button 
          variant="outlined" 
          fullWidth 
          onClick={handleThemeMenuClose}
          size="small"
        >
          Close
        </Button>
      </Menu>
      
      {/* Notifications Menu */}
      <Menu
        anchorEl={notificationsAnchorEl}
        id="notifications-menu"
        open={isNotificationsMenuOpen}
        onClose={handleNotificationsClose}
        onClick={handleNotificationsClose}
        PaperProps={{
          elevation: 2,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
            mt: 1.5,
            width: 320,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, pb: 1 }}>
          <Typography variant="h6">Notifications</Typography>
        </Box>
        <Divider />
        <MenuItem sx={{ py: 1 }}>
          <Box sx={{ py: 0.5 }}>
            <Typography variant="body2" component="div" fontWeight="bold">
              New client appointment request
            </Typography>
            <Typography variant="caption" color="text.secondary">
              John Doe requested an appointment for Thursday at 3:00 PM
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem sx={{ py: 1 }}>
          <Box sx={{ py: 0.5 }}>
            <Typography variant="body2" component="div" fontWeight="bold">
              Document signed
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Jane Smith signed the consent form
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem sx={{ py: 1 }}>
          <Box sx={{ py: 0.5 }}>
            <Typography variant="body2" component="div" fontWeight="bold">
              Payment received
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Payment of $150.00 received from David Johnson
            </Typography>
          </Box>
        </MenuItem>
        <Divider />
        <Box sx={{ p: 1, textAlign: 'center' }}>
          <Button size="small" color="primary">
            View all notifications
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};

export interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Subtitle or description */
  description?: string;
  /** Actions to display (usually buttons) */
  actions?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show a border at the bottom */
  borderBottom?: boolean;
}

/**
 * Consistent page header with title, description, and actions
 */
export function PageHeader({
  title,
  description,
  actions,
  className,
  borderBottom = true,
}: PageHeaderProps) {
  return (
    <div className={cn(
      "bg-white px-4 py-6 sm:px-6 lg:px-8",
      borderBottom && "border-b border-gray-200",
      className
    )}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>
        
        {actions && (
          <div className="flex items-center space-x-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

export interface PageSectionProps {
  /** Section title */
  title?: string;
  /** Section content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Whether the section has a border */
  bordered?: boolean;
  /** Whether the section has a background */
  background?: boolean;
}

/**
 * Content section within a page
 */
export function PageSection({
  title,
  children,
  className,
  bordered = true,
  background = true,
}: PageSectionProps) {
  return (
    <section
      className={cn(
        "rounded-lg overflow-hidden",
        bordered && "border border-gray-200",
        background && "bg-white",
        "mb-6",
        className
      )}
    >
      {title && (
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h2 className="text-base font-medium text-gray-900">{title}</h2>
        </div>
      )}
      
      <div className="px-4 py-4 sm:px-6">
        {children}
      </div>
    </section>
  );
} 