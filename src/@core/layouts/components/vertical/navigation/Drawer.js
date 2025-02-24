import { styled, useTheme } from '@mui/material/styles'
import MuiSwipeableDrawer from '@mui/material/SwipeableDrawer'
import PropTypes from 'prop-types';

const SwipeableDrawer = styled(MuiSwipeableDrawer)({
  overflowX: 'hidden',
  transition: 'width .25s ease-in-out',
  '& ul': {
    listStyle: 'none'
  },
  '& .MuiListItem-gutters': {
    paddingLeft: 4,
    paddingRight: 4
  },
  '& .MuiDrawer-paper': {
    left: 'unset',
    right: 'unset',
    overflowX: 'hidden',
    transition: 'width .25s ease-in-out, box-shadow .25s ease-in-out'
  }
})

const Drawer = props => {
  const { hidden, children, navWidth, navVisible, setNavVisible } = props
  const theme = useTheme()

  const MobileDrawerProps = {
    open: navVisible,
    onOpen: () => setNavVisible(true),
    onClose: () => setNavVisible(false),
    ModalProps: {
      keepMounted: true
    }
  }

  const DesktopDrawerProps = {
    open: true,
    onOpen: () => null,
    onClose: () => null
  }

  return (
    <SwipeableDrawer
      className='layout-vertical-nav'
      variant={hidden ? 'temporary' : 'permanent'}
      {...(hidden ? { ...MobileDrawerProps } : { ...DesktopDrawerProps })}
      PaperProps={{ sx: { width: navWidth } }}
      sx={{
        width: navWidth,
        '& .MuiDrawer-paper': {
          borderRight: 0,
          backgroundColor: theme.palette.background.default
        },
      }}
    >
      {children}
    </SwipeableDrawer>
  )
}

Drawer.propTypes = {
  hidden: PropTypes.any,
  children: PropTypes.any,
  navWidth: PropTypes.any,
  navVisible: PropTypes.any,
  setNavVisible: PropTypes.any
}

export default Drawer