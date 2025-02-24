'use-client'
import { ThreeDots } from 'react-loader-spinner';
import { useSettings } from 'src/@core/hooks/useSettings';
import { Box } from '@mui/material';
import React from 'react';

const Loader = () => {
  const { settings } = useSettings();
  return (
    <Box
      className='loader-overlay'
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 2000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Box style={{ textAlign: 'center' }}>
        <ThreeDots
          visible={true}
          height="80"
          width="80"
          color={settings.themeColor}
          radius="9"
          ariaLabel="three-dots-loading"
          wrapperStyle={{}}
          wrapperClass=""
        />
      </Box>
    </Box>
  );
};

export default Loader;