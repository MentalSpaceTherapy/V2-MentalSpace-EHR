import React from 'react';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Typography,
  useTheme,
  Tooltip,
  IconButton,
  Avatar,
} from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Dashboard as DashboardIcon,
  People as ClientsIcon,
  Description as DocumentationIcon,
  CalendarToday as SchedulingIcon,
  Message as MessageIcon,
  AttachMoney as BillingIcon,
  BarChart as ReportsIcon,
  BusinessCenter as CRMIcon,
  Group as StaffIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useThemeContext } from '../../context';
import { motion } from 'framer-motion';

interface SidebarProps {
  open: boolean;
  drawerWidth: number;
  onClose: () => void;
  variant: 'permanent' | 'persistent' | 'temporary';
}

const menuItems = [
  { path: '/', name: 'Dashboard', icon: <DashboardIcon />, color: '#4caf50' },
  { path: '/clients', name: 'Clients', icon: <ClientsIcon />, color: '#2196f3' },
  { path: '/documentation', name: 'Documentation', icon: <DocumentationIcon />, color: '#9c27b0' },
  { path: '/scheduling', name: 'Scheduling', icon: <SchedulingIcon />, color: '#ff9800' },
  { path: '/messages', name: 'Messages', icon: <MessageIcon />, color: '#00bcd4' },
  { path: '/billing', name: 'Billing', icon: <BillingIcon />, color: '#f44336' },
  { path: '/reports', name: 'Reports', icon: <ReportsIcon />, color: '#3f51b5' },
  { path: '/crm', name: 'CRM', icon: <CRMIcon />, color: '#795548' },
  { path: '/staff', name: 'Staff', icon: <StaffIcon />, color: '#607d8b' },
  { path: '/settings', name: 'Practice Settings', icon: <SettingsIcon />, color: '#9e9e9e' },
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  open, 
  drawerWidth, 
  onClose,
  variant
}) => {
  const theme = useTheme();
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar } = useThemeContext();
  
  const collapsedWidth = 72; // Width when sidebar is collapsed
  const actualWidth = sidebarCollapsed ? collapsedWidth : drawerWidth;
  
  const logoVariants = {
    expanded: { opacity: 1, width: 'auto' },
    collapsed: { opacity: 0, width: 0 }
  };
  
  const menuTextVariants = {
    expanded: { opacity: 1, x: 0, display: 'block' },
    collapsed: { opacity: 0, x: -10, display: 'none' }
  };

  const drawerContent = (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden',
      transition: theme.transitions.create(['width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }}>
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: sidebarCollapsed ? 'center' : 'space-between',
          borderBottom: `1px solid ${theme.palette.divider}`,
          minHeight: 64
        }}
      >
        {!sidebarCollapsed && (
          <motion.div
            initial="expanded"
            animate={sidebarCollapsed ? "collapsed" : "expanded"}
            variants={logoVariants}
            transition={{ duration: 0.3 }}
          >
            <Typography 
              variant="h6" 
              color="primary"
              sx={{ 
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
              }}
            >
              MentalSpace EHR
            </Typography>
          </motion.div>
        )}
        
        {sidebarCollapsed && (
          <Avatar 
            sx={{ 
              width: 36, 
              height: 36, 
              bgcolor: theme.palette.primary.main,
              fontSize: '1.2rem',
              fontWeight: 'bold'
            }}
          >
            MS
          </Avatar>
        )}
        
        {variant === 'permanent' && (
          <IconButton 
            onClick={toggleSidebar}
            size="small"
            sx={{ 
              borderRadius: '50%',
              ml: sidebarCollapsed ? 0 : 2,
              border: `1px solid ${theme.palette.divider}`,
              p: '4px',
              color: theme.palette.text.secondary
            }}
          >
            {sidebarCollapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
          </IconButton>
        )}
      </Box>
      
      <List sx={{ flexGrow: 1, pt: 2, overflow: 'hidden auto' }}>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
            <Tooltip 
              title={sidebarCollapsed ? item.name : ''} 
              placement="right"
              arrow
            >
              <ListItemButton
                component={RouterLink}
                to={item.path}
                selected={location.pathname === item.path}
                onClick={variant === 'temporary' ? onClose : undefined}
                sx={{
                  py: 1.5,
                  px: sidebarCollapsed ? 'auto' : 3,
                  mx: sidebarCollapsed ? 1 : 2,
                  borderRadius: '12px',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                  minHeight: 48,
                  transition: theme.transitions.create(['background-color', 'transform'], {
                    duration: '0.2s',
                  }),
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? `${theme.palette.primary.dark}40` 
                      : `${theme.palette.primary.light}30`,
                    color: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? `${theme.palette.primary.dark}50` 
                        : `${theme.palette.primary.light}40`,
                    },
                    '& .MuiListItemIcon-root': {
                      color: theme.palette.primary.main,
                    },
                  },
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  }
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    minWidth: sidebarCollapsed ? 0 : 46,
                    mr: sidebarCollapsed ? 0 : 2,
                    justifyContent: 'center',
                    color: location.pathname === item.path ? theme.palette.primary.main : item.color
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                
                <motion.div
                  initial="expanded"
                  animate={sidebarCollapsed ? "collapsed" : "expanded"}
                  variants={menuTextVariants}
                  transition={{ duration: 0.2 }}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  <ListItemText 
                    primary={item.name}
                    primaryTypographyProps={{ 
                      fontSize: '0.95rem',
                      fontWeight: location.pathname === item.path ? 600 : 400 
                    }}
                  />
                </motion.div>
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>
      
      <Divider />
      <Box 
        sx={{ 
          p: 2, 
          textAlign: 'center',
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1
        }}
      >
        {!sidebarCollapsed && (
          <motion.div
            initial="expanded"
            animate={sidebarCollapsed ? "collapsed" : "expanded"}
            variants={menuTextVariants}
            transition={{ duration: 0.2 }}
          >
            <Typography variant="caption" color="text.secondary">
              © {new Date().getFullYear()} MentalSpace
            </Typography>
          </motion.div>
        )}
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ 
        width: { sm: actualWidth }, 
        flexShrink: { sm: 0 },
        transition: theme.transitions.create(['width'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant={variant}
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            transition: theme.transitions.create(['width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
      >
        {drawerContent}
      </Drawer>
      
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: actualWidth,
            overflowX: 'hidden',
            transition: theme.transitions.create(['width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}; 