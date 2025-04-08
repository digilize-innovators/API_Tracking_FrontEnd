// utils/validateToken.js
import { parseCookies } from 'nookies';
import { verify } from 'jsonwebtoken';
import { jwt_secret } from '../../constants';

export const validateToken = (context, screenName) => {
  const cookies = parseCookies(context);
  const token = cookies.token;
  const screens = cookies.screens;
  
  if (!token) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
  
  try {
    const decoded = verify(token, jwt_secret);
    
    if (!screens.includes(screenName)) {
      return {
        redirect: {
          destination: '/401',
          permanent: false,
        },
      };
    }
    const ip = context.req.connection.remoteAddress
    console.log("IP address ", ip);

    return {
      props: {
        isAuthenticated: !!token,
        userId: decoded.userId,
        ip: ip.split(':')[3]
      },
    };
    
  } catch (error) {
    console.error('Error verifying authentication token:', error);
    if (error.name === 'TokenExpiredError') {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }
  }
};
