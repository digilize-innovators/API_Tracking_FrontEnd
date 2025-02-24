import CssBaseline from '@mui/material/CssBaseline'
import GlobalStyles from '@mui/material/GlobalStyles'
import { ThemeProvider, createTheme, responsiveFontSizes } from '@mui/material/styles'
import themeConfig from 'src/configs/themeConfig'
import overrides from './overrides'
import typography from './typography'
import themeOptions from './ThemeOptions'
import GlobalStyling from './globalStyles'
import PropTypes from 'prop-types'

const ThemeComponent = props => {
  const { settings, children } = props
  const coreThemeConfig = themeOptions(settings)
  let theme = createTheme(coreThemeConfig)

  theme = createTheme(theme, {
    components: { ...overrides(theme) },
    typography: { ...typography(theme) }
  })

  if (themeConfig.responsiveFontSizes) {
    theme = responsiveFontSizes(theme)
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles styles={() => GlobalStyling(theme)} />
      {children}
    </ThemeProvider>
  )
}
ThemeComponent.propTypes = {
  settings: PropTypes.any,
  children: PropTypes.any
}
export default ThemeComponent