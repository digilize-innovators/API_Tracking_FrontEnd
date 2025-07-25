import React from 'react'
import Chip from '@mui/material/Chip'
import PropTypes from 'prop-types'

const StatusChip = ({ label, color }) => {
  return (
    <Chip
      label={label}
      color={color || 'default'}
      sx={{
        height: 24,
        fontSize: '0.75rem',
        textTransform: 'capitalize',
        '& .MuiChip-label': { fontWeight: 500 }
      }}
    />
  )
}
StatusChip.propTypes = {
  label: PropTypes.any,
  color: PropTypes.any
}
export default StatusChip
