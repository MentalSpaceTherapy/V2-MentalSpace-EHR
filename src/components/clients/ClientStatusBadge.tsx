import React from 'react';
import { Chip, ChipProps, useTheme } from '@mui/material';
import {
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Pending as OnboardingIcon,
  PauseCircle as OnHoldIcon,
  ExitToApp as DischargedIcon,
  HelpOutline as UnknownIcon
} from '@mui/icons-material';

interface ClientStatusBadgeProps {
  status: string;
  size?: 'small' | 'medium';
  variant?: 'filled' | 'outlined';
}

export const ClientStatusBadge: React.FC<ClientStatusBadgeProps> = ({
  status,
  size = 'medium',
  variant = 'filled'
}) => {
  const theme = useTheme();
  
  let color: ChipProps['color'] = 'default';
  let icon = <UnknownIcon />;
  let label = 'Unknown';
  
  switch (status) {
    case 'active':
      color = 'success';
      icon = <ActiveIcon />;
      label = 'Active';
      break;
    case 'inactive':
      color = 'default';
      icon = <InactiveIcon />;
      label = 'Inactive';
      break;
    case 'onboarding':
      color = 'info';
      icon = <OnboardingIcon />;
      label = 'Onboarding';
      break;
    case 'on-hold':
      color = 'warning';
      icon = <OnHoldIcon />;
      label = 'On Hold';
      break;
    case 'discharged':
      color = 'error';
      icon = <DischargedIcon />;
      label = 'Discharged';
      break;
    default:
      break;
  }
  
  return (
    <Chip
      label={label}
      color={color}
      icon={icon}
      size={size}
      variant={variant}
      sx={{ 
        fontWeight: 500,
        '& .MuiChip-icon': {
          marginLeft: size === 'small' ? '4px' : '8px'
        }
      }}
    />
  );
};

export default ClientStatusBadge; 