import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  TextField,
  Typography,
  CardContent,
  FormControl,
  styled,
  IconButton,
  Modal,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import MuiCard from '@mui/material/Card';
import { Eye, EyeOff } from 'mdi-material-ui';
import Cookies from 'js-cookie';
import themeConfig from 'src/configs/themeConfig';
import BlankLayout from 'src/@core/layouts/BlankLayout';
import FooterIllustrationsV1 from 'src/views/pages/auth/FooterIllustration';
import { api } from 'src/utils/Rest-API.js';
import { useAuth } from 'src/Context/AuthContext.js';
import UserIcon from 'src/layouts/components/UserIcon.js';
import { useLoading } from 'src/@core/hooks/useLoading.js';
import SnackbarAlert from 'src/components/SnackbarAlert.js';
import Head from 'next/head'
import { useSettings } from 'src/@core/hooks/useSettings';

const Card = styled(MuiCard)(({ theme }) => ({
  [theme.breakpoints.up('sm')]: { width: '28rem' }
}));
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '50%',
  bgcolor: 'background.paper',
  borderRadius: '10px',
  border: 0,
  outline: 0,
  boxShadow: 24,
  p: 10
};
const removeAuthToken = () => {
  Cookies.remove('token');
  Cookies.remove('userName');
  Cookies.remove('departmentName');
  Cookies.remove('showBot');
  Cookies.remove('screens');
};
const LoginPage = () => {
  const [data, setData] = useState({ userId: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [userIdError, setUserIdError] = useState({ error: false, text: '' });
  const [passwordError, setPasswordError] = useState({ error: false, text: '' });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [alertData, setAlertData] = useState({ type: '', message: '', variant: 'filled' });
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openPasswordModal, setOpenPasswordModal] = useState(false);
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({})
  const router = useRouter();
  const { login, setUserInfo } = useAuth();
  const { setIsLoading } = useLoading();
  const { saveSettings } = useSettings();

  useEffect(() => {
    removeAuthToken();
  }, []);
  const reset = () => {
    setData({ userId: '', password: '' });
    setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' })
    setShowPassword(false);
    setUserIdError({ error: false, text: '' });
    setPasswordError({ error: false, text: '' });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    data.userId === ''
      ? setUserIdError({ error: true, text: 'User ID cannot be empty' })
      : setUserIdError({ error: false, text: '' });
    data.password === ''
      ? setPasswordError({ error: true, text: 'Password cannot be empty' })
      : setPasswordError({ error: false, text: '' });
    if (data.userId && data.password) {
      try {
        setIsLoading(true);
        const res = await api('/auth/login', data, 'post', false);
        console.log("Response of login: ", res.data)
        if (!res.data) {
          setAlertData({ type: 'error', message: 'Unknown error occurred', variant: 'filled' });
          setOpenSnackbar(true);
          setIsLoading(false);
          return;
        }
        if (res.data?.data?.accessibility) {
          saveSettings({
            "mode": res.data.data.accessibility.mode,
            "fontSize": res.data.data.accessibility.fontSize,
            "fontFamily": res.data.data.accessibility.fontFamily,
            "themeColor": res.data.data.accessibility.themeColor
          });
        } else {
          saveSettings({
            "mode": "light",
            "fontSize": 16,
            "fontFamily": "Arial",
            "themeColor": "#50BDA0"
          });
        }

        switch (res.data.code) {
          case 2002:
            console.log('User not found');
            setAlertData({ type: 'error', message: 'Invalid credentials', variant: 'filled' });
            setOpenSnackbar(true);
            break;
          case 2010:
            console.log('User disabled');
            setAlertData({ type: 'error', message: 'User is disabled', variant: 'filled' });
            setOpenSnackbar(true);
            break;
          case 2008:
            console.log('Password does not match');
            setAlertData({ type: 'error', message: 'Invalid credentials', variant: 'filled' });
            setOpenSnackbar(true);
            break;
          case 2004:
            console.log('User is already logged in');
            setAlertData({ type: 'error', message: 'User is already logged in', variant: 'filled' });
            setOpenConfirmDialog(true);
            break;
          case 401:
            setAlertData({ type: 'error', message: 'Password expired, please reset your password', variant: 'filled' });
            setOpenSnackbar(true);
            setOpenPasswordModal(true);
            break;
          case 429:
            setAlertData({ type: 'error', message: 'Too many login attempts, please try again later', variant: 'filled' });
            setOpenSnackbar(true);
            break;
          case 418:
            setAlertData({ type: 'error', message: `${res.data.message}`, variant: 'filled' });
            setOpenSnackbar(true);
            break;
          default:
            if (res.data.success) {
              setIsLoading(true);
              setAlertData({ ...alertData, type: 'success', message: 'Login successful' });
              setOpenSnackbar(true);
              console.log("screens", res.data.data.screens);
              login(`Bearer ${res.data.data.token}`);
              Cookies.set('token', res.data.data.token);
              Cookies.set('screens', JSON.stringify(res.data.data.screens));
              Cookies.set('profile-image',`${res.data.data.profile_image}`);
              setUserInfo(res.data.data);
              reset();
              setIsLoading(false);
              router.push('/home-screen');
            } else {
              setAlertData({ type: 'error', message: res.data.message || 'Login failed', variant: 'filled' });
              setOpenSnackbar(true);
            }
        }
        setIsLoading(false);
      } catch (e) {
        console.error('Error message', e);
        setAlertData({ type: 'error', message: 'An error occurred. Please try again.', variant: 'filled' });
        setOpenSnackbar(true);
        reset();
        setIsLoading(false);
      }
    }
  };
  const handleConfirmLogin = async () => {
    try {
      setIsLoading(true);``
      data.forceFully = true;
      const res = await api('/auth/login', data, 'post', false);
      console.log("login res data is ", res.data);
      if (res.data?.data?.accessibility) {
        saveSettings({
          "mode": res.data.data.accessibility.mode,
          "fontSize": res.data.data.accessibility.fontSize,
          "fontFamily": res.data.data.accessibility.fontFamily,
          "themeColor": res.data.data.accessibility.themeColor
        });
      } else {
        saveSettings({
          "mode": "light",
          "fontSize": 16,
          "fontFamily": "Arial",
          "themeColor": "#50BDA0"
        });
      }
      if (res.data.success) {
        setAlertData({ ...alertData, type: 'success', message: 'Login successful' });
        setOpenSnackbar(true);
        login(`Bearer ${res.data.data.token}`);
        Cookies.set('token', res.data.data.token);
        Cookies.set('screens', JSON.stringify(res.data.data.screens));
        setUserInfo(res.data.data);
        reset();
        setIsLoading(false);
        router.push('/home-screen');
      } else {
        setAlertData({ type: 'error', message: res.data.message || 'Login failed', variant: 'filled' });
        setOpenSnackbar(true);
      }
      setOpenConfirmDialog(false);
      setIsLoading(false);
    } catch (e) {
      console.log('Error during logout all: ', e);
      setIsLoading(false);
    }
  };
  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();
    let errors = {};
    if (passwords.newPassword !== passwords.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    const passwordRequirements = [
      { test: passwords.newPassword.length >= 8, message: 'be at least 8 characters' },
      { test: /[A-Z]/.test(passwords.newPassword), message: 'contain at least one uppercase letter' },
      { test: /[a-z]/.test(passwords.newPassword), message: 'contain at least one lowercase letter' },
      { test: /\d/.test(passwords.newPassword), message: 'contain at least one number' },
      { test: /[!@#$%^&*(),.?":{}|<>]/.test(passwords.newPassword), message: 'contain at least one special character' },
    ];
    const errorMessages = passwordRequirements.filter(req => !req.test).map(req => req.message);
    if (errorMessages.length > 0) {
      errors.newPassword = `Password must: ${errorMessages.join(', ')}`;
    }
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }
    setErrors({});
    const password_data = {
      userId: data.userId,
      oldPassword: passwords.oldPassword,
      newPassword: passwords.newPassword,
    };
    console.log("password_data", password_data);
    const res = await api('/auth/reset-password', password_data, 'post', false);
    if (res.data.success) {
      setAlertData({ type: 'success', message: 'Reset password successful', variant: 'filled' });
      setOpenSnackbar(true);
      reset();
    } else {
      setAlertData({ type: 'error', message: res.data.message || 'Reset password failed', variant: 'filled' });
      setOpenSnackbar(true);
    }
    setOpenPasswordModal(false);
    reset();
  };
  const closeSnackbar = () => {
    setOpenSnackbar(false);
  };
  return (
    <>
      <Head>
        <title>Login</title>
      </Head>
      <Box className='content-center'>
        <Card sx={{ zIndex: 1 }}>
          <CardContent sx={{ padding: theme => `${theme.spacing(12, 9, 7)} !important` }}>
            <Box sx={{ mb: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src='/images/logo-color.png' alt='digilize' height='50px' width='80px' />
            </Box>
            <Box sx={{ mb: 6 }}>
              <Typography variant='h5' sx={{ fontWeight: 600, marginBottom: 1.5 }}>
                Welcome to {themeConfig.templateName}! 👋🏻
              </Typography>
              <Typography variant='body2'>Please sign-in to your account and start the adventure</Typography>
            </Box>
            <Box
              component="form"
              noValidate
              autoComplete="off"
              onSubmit={handleSubmit}
            >
              <TextField
                label='User ID'
                value={data.userId}
                id='auth-login-userId'
                onChange={e => setData({ ...data, userId: e.target.value })}
                required
                error={userIdError.error}
                helperText={userIdError.text}
                fullWidth
                variant='outlined'
                sx={{ marginBottom: 4 }}
              />
              <FormControl fullWidth>
                <TextField
                  label='Password'
                  value={data.password}
                  id='auth-login-password'
                  onChange={e => setData({ ...data, password: e.target.value })}
                  required
                  error={passwordError.error}
                  helperText={passwordError.text}
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  variant='outlined'
                />
                <IconButton
                  style={{ position: 'absolute', top: '8px', right: '19px', cursor: 'pointer' }}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label='toggle visibility'
                >
                  {showPassword ? <UserIcon icon={Eye} /> : <UserIcon icon={EyeOff} />}
                </IconButton>
              </FormControl>
              <Button fullWidth size='large' variant='contained' sx={{ marginTop: '10px' }} type='submit'>
                Login
              </Button>
            </Box>
          </CardContent>
        </Card>
        <SnackbarAlert openSnackbar={openSnackbar} closeSnackbar={closeSnackbar} alertData={alertData} />
        <FooterIllustrationsV1 />
      </Box>
      <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
        aria-labelledby='confirm-dialog-title'
        aria-describedby='confirm-dialog-description'
      >
        <DialogTitle id='confirm-dialog-title'>Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText id='confirm-dialog-description'>
            You are already logged in on another device. Do you want to log out from all devices and log in here?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmLogin} >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      <Modal
        open={openPasswordModal}
        onClose={() => setOpenPasswordModal(false)}
        aria-labelledby='password-modal-title'
        aria-describedby='password-modal-description'
      >
        <Box sx={{ ...style, width: 400 }}>
          <Typography id='password-modal-title' variant='subtitle1' component='h2' sx={{ marginBottom: "5px" }}>
            Your Password expired - Change Password
          </Typography>
          <Box component='form' noValidate autoComplete='off' onSubmit={handlePasswordChangeSubmit}>
            <TextField
              label='Old Password'
              value={passwords.oldPassword}
              onChange={e => setPasswords({ ...passwords, oldPassword: e.target.value })}
              required
              fullWidth
              variant='outlined'
              sx={{ marginBottom: 4 }}
              type='password'
              error={!!errors.oldPassword}
              helperText={errors.oldPassword}
            />
            <TextField
              label='New Password'
              value={passwords.newPassword}
              onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
              required
              fullWidth
              variant='outlined'
              sx={{ marginBottom: 4 }}
              type='password'
              error={!!errors.newPassword}
              helperText={errors.newPassword}
            />
            <TextField
              label='Confirm Password'
              value={passwords.confirmPassword}
              onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })}
              required
              fullWidth
              variant='outlined'
              sx={{ marginBottom: 4 }}
              type='password'
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
            />
            <Button fullWidth size='large' variant='contained' type='submit'>
              Update Password
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};
LoginPage.getLayout = page => <BlankLayout>{page}</BlankLayout>;
export default LoginPage;
