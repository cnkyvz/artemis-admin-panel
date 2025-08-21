// Admin panel için Avatar komponenti
//artemis-admin/src/components/Avatar/Avatar.tsx

import React, { useState } from 'react';
import { Avatar as MuiAvatar, styled, SxProps, Theme } from '@mui/material';


interface PersonInfo {
  id?: string | number;
  name?: string;
  firstName?: string;
  lastName?: string;
  ad?: string;
  soyad?: string;
  avatar?: string;
  resim?: string;
}

interface AvatarProps {
  person: PersonInfo;
  size?: number;
  showOnline?: boolean;
  sx?: SxProps<Theme>; // any yerine proper type
}

// Utility fonksiyonları
const getPersonName = (person: PersonInfo): string => {
  if (person.name) return person.name;
  if (person.ad && person.soyad) return `${person.ad} ${person.soyad}`;
  if (person.firstName && person.lastName) return `${person.firstName} ${person.lastName}`;
  if (person.ad) return person.ad;
  if (person.firstName) return person.firstName;
  return 'Kullanıcı';
};

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

const getAvatarColor = (name: string): string => {
  const colors = [
    '#3498db', '#e74c3c', '#2ecc71', '#f39c12', 
    '#9b59b6', '#1abc9c', '#34495e', '#e67e22'
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

const getAvatarUrl = (person: PersonInfo): string => {
  const imageField = person.avatar || person.resim;
  
  if (imageField && imageField.trim()) {
    if (imageField.startsWith('http')) {
      return imageField;
    }
    return `http://api.example.com/uploads/avatars/${imageField}`;
  }
  
  const name = getPersonName(person);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3498db&color=fff&size=150&bold=true&rounded=true`;
};

// Styled Avatar
const StyledAvatar = styled(MuiAvatar)<{ size: number; showOnline: boolean }>(({ size, showOnline }) => ({
  width: size,
  height: size,
  border: `3px solid #fff`,
  boxShadow: `0 4px 12px rgba(0, 80, 160, 0.15)`,
  position: 'relative',
  fontSize: size * 0.4,
  fontWeight: 'bold',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: `0 6px 16px rgba(0, 80, 160, 0.25)`,
  },
  '&::after': showOnline ? {
    content: '""',
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: size * 0.25,
    height: size * 0.25,
    backgroundColor: '#27ae60',
    borderRadius: '50%',
    border: '2px solid #fff',
  } : {}
}));

export const ArtemisAvatar: React.FC<AvatarProps> = ({ 
  person, 
  size = 60, 
  showOnline = false, 
  sx 
}) => {
  const [imageError, setImageError] = useState(false);
  
  const name = getPersonName(person);
  const initials = getInitials(name);
  const avatarUrl = getAvatarUrl(person);
  const backgroundColor = getAvatarColor(name);
  
  if (imageError) {
    return (
      <StyledAvatar
        size={size}
        showOnline={showOnline}
        sx={{ backgroundColor, ...sx }}
      >
        {initials}
      </StyledAvatar>
    );
  }
  
  return (
    <StyledAvatar
      src={avatarUrl}
      alt={name}
      size={size}
      showOnline={showOnline}
      sx={sx}
      onError={() => setImageError(true)}
    >
      {initials}
    </StyledAvatar>
  );
};

export default ArtemisAvatar;