import { useSettings } from 'src/@core/hooks/useSettings'

const Typography = theme => {
  const { settings } = useSettings()

  return {
    h1: {
      fontWeight: 500,
      letterSpacing: '-1.5px',
      color: theme.palette.text.primary,
      fontFamily: settings.fontFamily,
      fontSize: `${settings.fontSize * 2}px`,  
    },
    h2: {
      fontWeight: 500,
      letterSpacing: '-0.5px',
      color: theme.palette.text.primary,
      fontFamily: settings.fontFamily,
      fontSize: `${settings.fontSize * 1.75}px`, 
    },
    h3: {
      fontWeight: 500,
      letterSpacing: 0,
      color: theme.palette.text.primary,
      fontFamily: settings.fontFamily,
      fontSize: `${settings.fontSize * 1.5}px`,
    },
    h4: {
      fontWeight: 500,
      letterSpacing: '0.25px',
      color: theme.palette.text.primary,
      fontFamily: settings.fontFamily,
      fontSize: `${settings.fontSize * 1.25}px`,
    },
    h5: {
      fontWeight: 500,
      letterSpacing: 0,
      color: theme.palette.text.primary,
      fontFamily: settings.fontFamily,
      fontSize: `${settings.fontSize}px`,
    },
    h6: {
      letterSpacing: '0.15px',
      color: theme.palette.text.primary,
      fontFamily: settings.fontFamily,
      fontSize: `${settings.fontSize * 0.875}px`,
    },
    subtitle1: {
      letterSpacing: '0.15px',
      color: theme.palette.text.primary,
      fontFamily: settings.fontFamily,
      fontSize: `${settings.fontSize}px`,
    },
    subtitle2: {
      letterSpacing: '0.1px',
      color: theme.palette.text.secondary,
      fontFamily: settings.fontFamily,
      fontSize: `${settings.fontSize * 0.875}px`,
    },
    body1: {
      letterSpacing: '0.15px',
      color: theme.palette.text.primary,
      fontFamily: settings.fontFamily,
      fontSize: `${settings.fontSize}px`,
    },
    body2: {
      lineHeight: 1.5,
      letterSpacing: '0.15px',
      color: theme.palette.text.secondary,
      fontFamily: settings.fontFamily,
      fontSize: `${settings.fontSize * 0.875}px`,
    },
    button: {
      letterSpacing: '0.3px',
      color: theme.palette.text.primary,
      fontFamily: settings.fontFamily,
      fontSize: `${settings.fontSize}px`,
    },
    caption: {
      letterSpacing: '0.4px',
      color: theme.palette.text.secondary,
      fontFamily: settings.fontFamily,
      fontSize: `${settings.fontSize * 0.75}px`,
    },
    overline: {
      letterSpacing: '1px',
      color: theme.palette.text.secondary,
      fontFamily: settings.fontFamily,
      fontSize: `${settings.fontSize * 0.625}px`,
    }
  }
}

export default Typography
