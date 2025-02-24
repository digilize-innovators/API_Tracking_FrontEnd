import { useRef, useState } from 'react'
import List from '@mui/material/List'
import Box from '@mui/material/Box'
import { styled, useTheme } from '@mui/material/styles'
import PerfectScrollbar from 'react-perfect-scrollbar'
import Drawer from './Drawer'
import VerticalNavItems from './VerticalNavItems'
import VerticalNavHeader from './VerticalNavHeader'
import PropTypes from 'prop-types';

const StyledBoxForShadow = styled(Box)({
  top: 50,
  left: -8,
  zIndex: 2,
  height: 75,
  display: 'none',
  position: 'absolute',
  pointerEvents: 'none',
  width: 'calc(100% + 15px)',
  '&.d-block': {
    display: 'block'
  }
})

const Navigation = props => {
  const {
    hidden,
    afterVerticalNavMenuContent,
    beforeVerticalNavMenuContent,
    verticalNavMenuContent: userVerticalNavMenuContent
  } = props

  const [groupActive, setGroupActive] = useState([])
  const [currentActiveGroup, setCurrentActiveGroup] = useState([])
  const shadowRef = useRef(null)
  const theme = useTheme()

  const handleInfiniteScroll = ref => {
    if (ref) {
      ref._getBoundingClientRect = ref.getBoundingClientRect
      ref.getBoundingClientRect = () => {
        const original = ref._getBoundingClientRect()
        return { ...original, height: Math.floor(original.height) }
      }
    }
  }

  const scrollMenu = container => {
    container = hidden ? container.target : container
    if (shadowRef && container.scrollTop > 0) {
      if (!shadowRef.current.classList.contains('d-block')) {
        shadowRef.current.classList.add('d-block')
      }
    } else {
      shadowRef.current.classList.remove('d-block')
    }
  }
  const ScrollWrapper = hidden ? Box : PerfectScrollbar

  return (
    <Drawer {...props}>
      <VerticalNavHeader {...props} />
      <StyledBoxForShadow
        ref={shadowRef}
        sx={{
          background: theme.palette.background.default
        }}
      />
      <Box sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
        <ScrollWrapper
          containerRef={ref => handleInfiniteScroll(ref)}
          {...(hidden
            ? {
              onScroll: container => scrollMenu(container),
              sx: { height: '100%', overflowY: 'auto', overflowX: 'hidden' }
            }
            : {
              options: { wheelPropagation: false },
              onScrollY: container => scrollMenu(container)
            })}
        >
          {beforeVerticalNavMenuContent ? beforeVerticalNavMenuContent(props) : null}
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            {userVerticalNavMenuContent ? (
              userVerticalNavMenuContent(props)
            ) : (
              <List className='nav-items' sx={{ transition: 'padding .25s ease', pr: 4.5 }}>
                <VerticalNavItems
                  groupActive={groupActive}
                  setGroupActive={setGroupActive}
                  currentActiveGroup={currentActiveGroup}
                  setCurrentActiveGroup={setCurrentActiveGroup}
                  {...props}
                />
              </List>
            )}
          </Box>
        </ScrollWrapper>
      </Box>
      {typeof afterVerticalNavMenuContent === 'function' ? afterVerticalNavMenuContent(props) : null}
    </Drawer>
  )
}

Navigation.propTypes = {
  hidden: PropTypes.any,
  verticalNavMenuContent: PropTypes.any,
  afterVerticalNavMenuContent: PropTypes.any,
  beforeVerticalNavMenuContent: PropTypes.any
}
export default Navigation