import { createContext, useState, useEffect, useMemo } from 'react'
import themeConfig from '../../configs/themeConfig'
import PropTypes from 'prop-types'
import Cookies from 'js-cookie'
let initialSettings = {
  themeColor: '#50BDA0',
  mode: 'light',
  contentWidth: themeConfig.contentWidth,
  recordPerPage: [5, 10, 25, 50, 100],
  rowsPerPage: 25,
  fontFamily: 'Arial',
  fontSize: 16
}

const accessibity = Cookies.get('accessibility')
if (accessibity) {
  const accessibityObj = JSON.parse(accessibity)
  initialSettings = {
    themeColor: accessibityObj?.themeColor || initialSettings.themeColor,
    mode: accessibityObj?.mode || initialSettings.mode,
    contentWidth: themeConfig?.contentWidth || initialSettings.contentWidth,
    recordPerPage: [5, 10, 25, 50, 100],
    rowsPerPage: 25,
    fontFamily: accessibityObj?.fontFamily || initialSettings.fontFamily,
    fontSize: accessibityObj?.fontSize || initialSettings.fontSize
  }
}
export const SettingsContext = createContext({
  saveSettings: () => null,
  settings: initialSettings
})

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({ ...initialSettings })

  useEffect(() => {
    if (settings.themeColor) {
      document.documentElement.style.setProperty('--theme-color', settings.themeColor)
    }
  }, [settings.themeColor])

  const saveSettings = updatedSettings => {
    setSettings(prevSettings => ({
      ...prevSettings,
      ...updatedSettings
    }))
  }

  const contextValue = useMemo(
    () => ({
      settings,
      saveSettings
    }),
    [settings]
  )

  return <SettingsContext.Provider value={contextValue}>{children}</SettingsContext.Provider>
}

SettingsProvider.propTypes = {
  children: PropTypes.any
}

export const SettingsConsumer = SettingsContext.Consumer
