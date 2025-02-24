
import Zoom from '@mui/material/Zoom'
import { styled } from '@mui/material/styles'
import useScrollTrigger from '@mui/material/useScrollTrigger'
import PropTypes from 'prop-types'

const ScrollToTopStyled = styled('div')(({ theme }) => ({
  zIndex: 11,
  position: 'fixed',
  right: theme.spacing(6),
  bottom: theme.spacing(10)
}))

const ScrollToTop = props => {
  const { children, className } = props
  const trigger = useScrollTrigger({
    threshold: 400,
    disableHysteresis: true
  })
  const handleClick = () => {
    const anchor = document.querySelector('body')
    if (anchor) {
      anchor.scrollIntoView({ behavior: 'smooth' })
    }
  }
  return (
    <Zoom in={trigger}>
      <ScrollToTopStyled className={className} onClick={handleClick} aria-label="Scroll to top">
        {children}
      </ScrollToTopStyled>
    </Zoom>
  )
}
ScrollToTop.propTypes = {
  children: PropTypes.any,
  className: PropTypes.any
}

export default ScrollToTop
