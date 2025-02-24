import React, { Fragment } from 'react'
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'
import PropTypes from 'prop-types';
const MaskImg = styled('img')(() => ({
  bottom: 0,
  zIndex: -1,
  width: '100%',
  position: 'absolute'
}))
const Tree1Img = styled('img')(() => ({
  left: 0,
  bottom: 80,
  position: 'absolute',
  width: '30%',
  height: '50%'
}))
const FooterIllustrationsV1 = props => {
  const { image1 } = props
  const theme = useTheme()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))
  if (!hidden) {
    return (
      <Fragment>
        {image1 || <Tree1Img alt='tree' src='/images/pages/QMS.png' />}
        <MaskImg alt='mask' src={`/images/pages/auth-v1-mask-${theme.palette.mode}.png`} />
        { }
      </Fragment>
    )
  } else {
    return null
  }
}
FooterIllustrationsV1.propTypes = {
  image1: PropTypes.any
}
export default FooterIllustrationsV1
