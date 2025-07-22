import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Router } from 'next/router';
import Loader from 'src/components/Loader';
import { CacheProvider } from '@emotion/react';
import themeConfig from 'src/configs/themeConfig';
import UserLayout from 'src/layouts/UserLayout';
import ThemeComponent from 'src/@core/theme/ThemeComponent';
import { SettingsConsumer, SettingsProvider } from 'src/@core/context/settingsContext';
import { LoaderProvider } from 'src/@core/context/loaderContext';
import { createEmotionCache } from 'src/@core/utils/create-emotion-cache';
import 'react-perfect-scrollbar/dist/css/styles.css';
import '../../styles/globals.css';
import '../../styles/chatbot.css';
import { AuthProvider } from 'src/Context/AuthContext';
import 'react-chatbot-kit/build/main.css';
import Cookies from 'js-cookie';
import PropTypes from 'prop-types';

const clientSideEmotionCache = createEmotionCache();
if (global.window) {
  global.addEventListener('load', () => {
    const watcher = window.document.getElementById('__next-build-watcher');
    if (watcher) {
      const newStyle = global.document.createElement('style');
      newStyle.innerHTML = '#icon-wrapper { display: none !important; } #container { display: none !important; }';
      watcher.shadowRoot.appendChild(newStyle);
    }
  });
}

const App = props => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  const getLayout = Component.getLayout ?? (page => <UserLayout>{page}</UserLayout>);
  const [showBot, setShowBot] = useState(true);
  const [loading, setLoading] = useState(false);
  const [client, setClient] = useState(false);

  useEffect(() => {
    setClient(true);
    const storedShowBot = Cookies.get('showBot');
    setShowBot(storedShowBot == 'true');
    setShowBot(storedShowBot === 'true');
    console.warn = () => { };
    console.error = () => { };
    console.debug = () => { };
  }, []);

  useEffect(() => {
    Cookies.set('showBot', showBot, { expires: 2 });
  }, [showBot]);

  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);
    Router.events.on('routeChangeStart', handleStart);
    Router.events.on('routeChangeComplete', handleComplete);
    Router.events.on('routeChangeError', handleComplete);
    return () => {
      Router.events.off('routeChangeStart', handleStart);
      Router.events.off('routeChangeComplete', handleComplete);
      Router.events.off('routeChangeError', handleComplete);
    };
  }, []);

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>Dashboard</title>
        <meta name='description' content={`${themeConfig.templateName}`} />
        <meta name='keywords' content='Material Design, MUI, Admin Template, React Admin Template' />
        <meta name='viewport' content='initial-scale=1, width=device-width' />
      </Head>
      {client && (
        <AuthProvider>
          <LoaderProvider>
            <SettingsProvider>
              <SettingsConsumer>
                {({ settings }) => (
                  <ThemeComponent settings={settings}>
                    {getLayout(<Component {...pageProps} />)}
                  </ThemeComponent>
                )}
              </SettingsConsumer>
            </SettingsProvider>
            {loading && <Loader />}
          </LoaderProvider>
        </AuthProvider>
      )}
    </CacheProvider>
  );
};

App.propTypes = {
  Component: PropTypes.any,
  emotionCache: PropTypes.any,
  pageProps: PropTypes.any,
};

export default App;