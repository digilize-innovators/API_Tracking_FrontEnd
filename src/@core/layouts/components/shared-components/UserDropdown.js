import { useState, Fragment, useEffect } from 'react';
import { useRouter } from 'next/router';
import {Box,Menu,Badge,Avatar,Divider,MenuItem,Typography} from '@mui/material';
import { styled } from '@mui/material/styles';
import LogoutVariant from 'mdi-material-ui/LogoutVariant';
import { useAuth } from 'src/Context/AuthContext';

const BadgeContentSpan = styled('span')(({ theme }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: theme.palette.success.main,
  boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
}));

const UserDropdown = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [userData, setUserData] = useState();
  const [profilePhoto, setProfilePhoto] = useState('/images/avatars/1.png');
  const router = useRouter();
  const { logout, getUserData } = useAuth();

  useEffect(() => {
    const data = getUserData();
    setUserData(data);
  }, [getUserData]);

  useEffect(() => {
    const convertImageToBase64 = async (imageUrl) => {
      if (!imageUrl) return; // Avoid unnecessary fetch if the image URL is not present
      try {
        const response = await fetch(imageUrl);
        if (!response.ok) throw new Error('Image not found');
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          setProfilePhoto(reader.result);
        };
        reader.onerror = (error) => {
          console.error('Error reading the image blob:', error);
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error('Error fetching the image:', error);
        setProfilePhoto('/images/avatars/1.png'); // Fallback to default avatar
      }
    };

    convertImageToBase64(userData?.profileImage);
  }, [userData?.profileImage]);

  const handleDropdownOpen = (event) => {
    setOpenDropdown(event.currentTarget);
  };

  const handleDropdownClose = () => {
    setOpenDropdown(null);
  };

  const handleLogout = (url) => {
    logout();
    if (url) {
      router.push(url);
    }
  };

  

  return (
    <Fragment>
      <Badge
        overlap="circular"
        onClick={handleDropdownOpen}
        sx={{ ml: 2, cursor: 'pointer' }}
        badgeContent={<BadgeContentSpan />}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Avatar
          sx={{ width: 40, height: 40 }}
          src={profilePhoto}
          alt="User Avatar"
        />
      </Badge>
      <Menu
        id="user-menu"
        anchorEl={openDropdown}
        open={Boolean(openDropdown)}
        onClose={handleDropdownClose}
        sx={{ '& .MuiMenu-paper': { width: 230, marginTop: 4 } }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ pt: 2, pb: 3, px: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Badge
              overlap="circular"
              badgeContent={<BadgeContentSpan />}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
              <Avatar
                src={profilePhoto}
                sx={{ width: '2.5rem', height: '2.5rem' }}
              />
            </Badge>
            <Box
              sx={{
                display: 'flex',
                marginLeft: 3,
                alignItems: 'flex-start',
                flexDirection: 'column',
              }}
            >
              <Typography sx={{ fontWeight: 600 }}>
                {userData?.userName}
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontSize: '0.8rem', color: 'text.disabled' }}
              >
                {userData?.departmentName}
              </Typography>
            </Box>
          </Box>
        </Box>
      
        <Divider />
        <MenuItem sx={{ py: 2 }} onClick={() => handleLogout('/login')}>
          <LogoutVariant
            sx={{
              marginRight: 2,
              fontSize: '1.375rem',
              color: 'text.secondary',
            }}
          />
          Logout
        </MenuItem>
      </Menu>
    </Fragment>
  );
};

export default UserDropdown;
