import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';


import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Typography,
  CardContent,
  styled,
  MuiCard
} from '@mui/material';
import Cookies from 'js-cookie';
import themeConfig from 'src/configs/themeConfig';
import BlankLayout from 'src/@core/layouts/BlankLayout';
import FooterIllustrationsV1 from 'src/views/pages/auth/FooterIllustration';
import { api } from 'src/utils/Rest-API.js';
import { useAuth } from 'src/Context/AuthContext.js';
import { useLoading } from 'src/@core/hooks/useLoading.js';
import SnackbarAlert from 'src/components/SnackbarAlert.js';
import Head from 'next/head'
import { useSettings } from 'src/@core/hooks/useSettings';
import DialogBox from 'src/components/DialogBox';
import PasswordResetModal from 'src/components/Modal/PasswordResetModal';
import CustomTextField from 'src/components/CustomTextField';

const Card = styled(MuiCard)(({ theme }) => ({
  [theme.breakpoints.up('sm')]: { width: '28rem' }
}));

const removeAuthToken = () => {
  Cookies.remove('token');
  Cookies.remove('userName');
  Cookies.remove('departmentName');
  Cookies.remove('showBot');
  Cookies.remove('screens');
};
const LoginPage = () => {

  const Loginschema = yup.object().shape({
    userId: yup.string().required('User ID cannot be empty'),
    password: yup.string()
      .min(8, 'Password must be at least 8 characters')
      .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
      .matches(/\d/, 'Password must contain at least one number')
      .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')
      .required('Password is required'),
  });
 
  const { control, handleSubmit,reset } = useForm({
    resolver: yupResolver(Loginschema),
    defaultValues: { userId: '', password: '' },
  });
  const [data, setData] = useState({ userId: '', password: '' });
  const [alertData, setAlertData] = useState({ openSnackbar:false, type: '', message: '', variant: 'filled' });
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [openPasswordModal, setOpenPasswordModal] = useState(false);
  const router = useRouter();
  const { login, setUserInfo } = useAuth();
  const { setIsLoading } = useLoading();
  const { saveSettings } = useSettings();

  useEffect(() => {
    removeAuthToken();
  }, []);
  
  const showAlert = useCallback((message) => {
    setAlertData({ openSnackbar: true, type: 'error', message, variant: 'filled' });
}, [setAlertData]); 

  
  const onSubmit = async (data) => {
    
      try {
        setData({userId:data.userId,password:data.password})
        setIsLoading(true);
        const res = await api('/auth/login', data, 'post', false);
        console.log("Response of login: ", res.data)
        if (!res.data) {
          setAlertData({openSnackbar:true, type: 'error', message: 'Unknown error occurred', variant: 'filled' });
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
     case 2008:
        console.log('Invalid credentials');
        showAlert('Invalid credentials');
        break;
    
     case 2010:
        console.log('User disabled');
        showAlert('User is disabled');
        break;

     case 2004:
        console.log('User is already logged in');
        setAlertData({ openSnackbar: true, type: 'error', message: 'User is already logged in', variant: 'filled' });
        setOpenConfirmDialog(true);
        break;

    case 401:
        console.log('Password expired');
        showAlert('Password expired, please reset your password');
        setOpenPasswordModal(true);
        break;

    case 429:
        console.log('Too many login attempts');
        showAlert('Too many login attempts, please try again later');
        break;

    case 418:
        console.log(res.data.message);
        showAlert(res.data.message);
        break;

    
       default:
            if (res.data.success) {
              setIsLoading(true);
              setAlertData({ ...alertData,openSnackbar:true, type: 'success', message: 'Login successful' });
              // setOpenSnackbar(true);
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
              setAlertData({openSnackbar:true, type: 'error', message: res.data.message || 'Login failed', variant: 'filled' });
            }
        }
        setIsLoading(false);
      } catch (e) {
        console.error('Error message', e);
        setAlertData({openSnackbar:true, type: 'error', message: 'An error occurred. Please try again.', variant: 'filled' });
        
        reset();
        setIsLoading(false);
      }
  };
  const handleConfirmLogin = useCallback(async () => {
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
        setAlertData({ ...alertData,openSnackbar:true, type: 'success', message: 'Login successful' });
        // setOpenSnackbar(true);
        login(`Bearer ${res.data.data.token}`);
        Cookies.set('token', res.data.data.token);
        Cookies.set('screens', JSON.stringify(res.data.data.screens));
        setUserInfo(res.data.data);
        reset();
        setIsLoading(false);
        router.push('/home-screen');
      } else {
        setAlertData({ openSnackbar:true ,type: 'error', message: res.data.message || 'Login failed', variant: 'filled' });
      }
      setOpenConfirmDialog(false);
      setIsLoading(false);
    } catch (e) {
      console.log('Error during logout all: ', e);
      setIsLoading(false);
    }
  },[openConfirmDialog]);
  
  
  const closeSnackbar = useCallback(() => setAlertData({...alertData,openSnackbar:false}), []);

  return (
    <>
      <Head>
        {console.log('hello')}
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
              onSubmit={handleSubmit((onSubmit))}
            >             
              <CustomTextField  name="userId"label="User ID" control={control}   />
              <CustomTextField  name="password"label="password" type="password" control={control}   />
              <Button fullWidth size='large' variant='contained' sx={{ marginTop: '10px' }} type='submit'>
                Login
              </Button>
            </Box>
          </CardContent>
        </Card>
        <SnackbarAlert openSnackbar={alertData.openSnackbar} closeSnackbar={closeSnackbar} alertData={alertData} />
        <FooterIllustrationsV1 />
      </Box>
      <DialogBox open={openConfirmDialog} 
      onClose={useCallback(() => setOpenConfirmDialog(false),[])} 
      onConfirm={handleConfirmLogin} />

      <PasswordResetModal
        openPasswordModal={openPasswordModal}
        onClose={() => setOpenPasswordModal(false)}
        userId={data.userId} 
        setAlertData={setAlertData}
        />
      
    </>
  );
};
LoginPage.getLayout = page => <BlankLayout>{page}</BlankLayout>;
export default LoginPage;