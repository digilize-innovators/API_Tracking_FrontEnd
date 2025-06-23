import React, { useEffect, useState } from 'react'
import { Snackbar } from '@mui/material'
import Alert from '@mui/material/Alert'
import { useSettings } from '../@core/hooks/useSettings'
import PropTypes from 'prop-types'

function SnackbarAlert({ openSnackbar, closeSnackbar, alertData }) {
  const { settings } = useSettings()
  const [color, setColor] = useState('')

  useEffect(() => {
    if (settings.color) {
      setColor(settings.color)
    } else {
      setColor('#50BDA0')
    }
  }, [settings.color])

  return (
    <Snackbar open={openSnackbar} autoHideDuration={5000} onClose={closeSnackbar}>
      <Alert
        onClose={closeSnackbar}
        severity={alertData.type || 'info'}
        variant={alertData.variant}
        sx={{ width: '100%', bgcolor: alertData.type == 'error' ? 'red' : color, color: 'white' }}
        role='alert'
      >
        {alertData.message}
      </Alert>
    </Snackbar>
  )
}
SnackbarAlert.propTypes = {
  openSnackbar: PropTypes.any,
  closeSnackbar: PropTypes.any,
  alertData: PropTypes.any
}
export default SnackbarAlert
