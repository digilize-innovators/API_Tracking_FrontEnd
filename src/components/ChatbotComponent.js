import React, { useState, useEffect } from 'react';
import Chatbot from 'react-chatbot-kit';
import config from '../views/Chatbot/config';
import ActionProvider from '../views/Chatbot/MainMenuController';
import MessageParser from '../views/Chatbot/Home';
import 'react-chatbot-kit/build/main.css';
import { RxCross1 } from 'react-icons/rx';
import { Box } from '@mui/material';
import Image from 'next/image';

const ChatbotComponent = () => {
  const [showBot, setShowBot] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const CloseBot = () => {
    setShowBot(false);
  };

  const Openbot = () => {
    if (windowSize.width > 1012 && windowSize.height > 499) {
      setShowBot(true);
    }
  };

  const botStyle = {
    position: 'fixed',
    bottom: windowSize.width < 768 ? '5%' : '2%',
    right: windowSize.width < 768 ? '5%' : '1%',
    zIndex: 1000,
    width: windowSize.width < 768 ? '90%' : '30%',
    height: windowSize.width < 768 ? '50%' : '80%',
  };

  const iconSize = windowSize.width < 768 ? '50%' : '60%';

  return (
    <>
      {showBot ? (
        <Box className='outerbot' style={botStyle}>
          <Box className='botheader'>
            <Box className='botlogo'>
              <Image src='/images/zobot.png' alt='botlogo' width={iconSize} height={iconSize} />
            </Box>
            <Box className='botcontent'>
              <Box className='EqbootTitle'>Digilize</Box>
              <Box className='eqbootText'>Innovation & Integrity at Every Byte</Box>

              <Box className='crossIcon'>
                <RxCross1 color='#fff' onClick={CloseBot} />
              </Box>
            </Box>
          </Box>

          <Chatbot config={config} messageParser={MessageParser} actionProvider={ActionProvider} />
        </Box>
      ) : (
        <Box className='boticon'>
          <Image
            className='boticonimage'
            src='/images/zobot.png'
            alt='botlogo'
            width={iconSize}
            height={iconSize}
            onClick={Openbot}
          />
        </Box>
      )}
    </>
  );
};

export default ChatbotComponent;