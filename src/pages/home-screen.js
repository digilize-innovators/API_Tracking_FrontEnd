import React from 'react'
import AccessibilitySettings from 'src/components/AccessibilitySettings'
import { styled } from '@mui/material/styles'
import dynamic from 'next/dynamic';
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
const ChatbotComponent = dynamic(() => import('src/components/ChatbotComponent'), {
  ssr: false,
})
const BoxWrapper = styled(Box)(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    width: '90vw'
  }
}))
const Img = styled('img')(({ theme }) => ({
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('lg')]: {
    height: 450,
    marginTop: theme.spacing(2)
  },
  [theme.breakpoints.down('md')]: {
    height: 400
  },
  [theme.breakpoints.up('lg')]: {
    marginTop: theme.spacing(2)
  }
}))
const Index = () => {
  return (
    <div>
     <Box className='content-center'>
      <Box sx={{ p: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
       
        <Img height='500' alt='error-illustration' src='/images/pages/home-screen.png' />
         <BoxWrapper>
         <Typography variant='h5' sx={{ mb: 1, fontSize: '1.5rem !important', color:'#50bda0',fontWeight:'bold' }}>
            Welcome to INSPECTA-TRACE !
          </Typography>
          <Typography variant='body2'>Your trusted partner in ensuring seamless traceability and compliance throughout the manufacturing process.</Typography>
        </BoxWrapper>
      </Box>
    
    </Box>
      <AccessibilitySettings />
      <ChatbotComponent />
    </div>
  )
}
export default Index
