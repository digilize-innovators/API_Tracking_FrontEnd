import React, { Children } from 'react'
import Script from 'next/script';
import Document, { Html, Head, Main, NextScript } from 'next/document'
import createEmotionServer from '@emotion/server/create-instance'
import { createEmotionCache } from 'src/@core/utils/create-emotion-cache'


class CustomDocument extends Document {
  render() {
    return (
      <Html lang='en'>
        <Head>
          <link rel='preconnect' href='https://fonts.googleapis.com' />
          <link rel='preconnect' href='https://fonts.gstatic.com' />
          <link
            rel='stylesheet'
            href='https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
          />
          <link rel='/images/favicon.png' sizes='180x180' href='/images/logo-color.png' />
          <link rel='shortcut icon' href='/images/favicon.png' />
          <link href="/bootstrap/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossOrigin="anonymous"></link>

          {/* <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossOrigin="anonymous"></link> */}
        </Head>
        <body>
          <Main />
          <NextScript />
          <Script
            src="/bootstrap/bootstrap.bundle.min.js"
            integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
            crossOrigin="anonymous"
          />
        </body>
      </Html>
    )
  }
}
CustomDocument.getInitialProps = async ctx => {
  const originalRenderPage = ctx.renderPage
  const cache = createEmotionCache()
  const { extractCriticalToChunks } = createEmotionServer(cache)
  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: App => props =>
      (
        <App
          {...props}
          emotionCache={cache}
        />
      )
    })
  const initialProps = await Document.getInitialProps(ctx)
  const emotionStyles = extractCriticalToChunks(initialProps.html)
  const emotionStyleTags = emotionStyles.styles.map(style => {
    return (
      <style
        key={style.key}
        dangerouslySetInnerHTML={{ __html: style.css }}
        data-emotion={`${style.key} ${style.ids.join(' ')}`}
      />
    )
  })
  return {
    ...initialProps,
    styles: [...Children.toArray(initialProps.styles), ...emotionStyleTags]
  }
}
export default CustomDocument
