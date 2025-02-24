import React from 'react';
import PropTypes from 'prop-types'

const UserIcon = props => {
  const { icon, iconProps } = props
  const IconTag = icon
  let styles

  return <IconTag {...iconProps} style={{ ...styles }} />
}
UserIcon.propTypes = {
  icon: PropTypes.any,
  iconProps: PropTypes.any
}
export default UserIcon