import React from 'react'
import Grid2 from '@mui/material/Grid2'
import ProtectedRoute from '../components/ProtectedRoute';
import { jwt_secret } from "../../constants";
import { parseCookies } from 'nookies';
import { verify } from 'jsonwebtoken';
import { Typography } from '@mui/material';
import dynamic from 'next/dynamic';


import AccessibilitySettings from 'src/components/AccessibilitySettings'
const ChatbotComponent = dynamic(() => import('src/components/ChatbotComponent'), {
  ssr: false,
})


const Dashboard = () => {
  return (
    <Grid2 container spacing={6}>
      <Grid2 item xs={12} sm={12} md={12}>
        <Typography variant='h3'>Dashboard</Typography>
      </Grid2>
      < AccessibilitySettings />
      <ChatbotComponent />
    </Grid2>
  )
}
export async function getServerSideProps(context) {
  const cookies = parseCookies(context);
  const token = cookies.token;
  // console.log("req.cookies token ", token);
  try {
    verify(token, jwt_secret);
  } catch (error) {
    console.error('Error verifying authentication token:', error)
    if (error.name === 'TokenExpiredError') {
      console.log('Token expired')
      return {
        redirect: {
          destination: '/pages/login',
          permanent: false
        }
      }
    }
  }
  if (!token) {
    return {
      redirect: {
        destination: '/pages/login',
        permanent: false,
      },
    };
  }
  return {
    props: {
      isAuthenticated: !!token,
    },
  };
}
export default ProtectedRoute(Dashboard);
