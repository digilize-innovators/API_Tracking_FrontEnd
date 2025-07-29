import React from 'react'
import { useForm } from 'react-hook-form'
import { Modal, Box, Typography, Button } from '@mui/material'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { api } from 'src/utils/Rest-API'
import CustomTextField from '../CustomTextField'
import PropTypes from 'prop-types'

// Yup validation schema
const passwordSchema = yup.object().shape({
  oldPassword: yup.string().trim().required('Old Password is required'),
  newPassword: yup
    .string()
    .trim()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/\d/, 'Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')
    .required('New Password is required'),
  confirmPassword: yup
    .string()
    .trim()
    .required('Confirm Password is required')
    .oneOf([yup.ref('newPassword'), null], 'Passwords must match')
})
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '50%',
  bgcolor: 'background.paper',
  borderRadius: '10px',
  border: 0,
  outline: 0,
  boxShadow: 24,
  p: 10
}

const PasswordResetModal = ({ openPasswordModal, onClose, userId, setAlertData }) => {
  const {
    control: passwordControler,
    handleSubmit: handlePasswordChange,
    reset
  } = useForm({
    resolver: yupResolver(passwordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  })

  const handlePasswordChangeSubmit = async passwordData => {
    const password_data = {
      userId: userId,
      oldPassword: passwordData.oldPassword,
      newPassword: passwordData.newPassword
    }

    const res = await api('/auth/reset-password', password_data, 'post', false)
    if (res.data.success) {
      setAlertData({
        openSnackbar: true,
        type: 'success',
        message: 'Reset password successful',
        variant: 'filled'
      })
      reset() // Reset form after successful submission
    } else {
      setAlertData({
        openSnackbar: true,
        type: 'error',
        message: res.data.message || 'Reset password failed',
        variant: 'filled'
      })
    }
    onClose()
  }

  return (
    <Modal
      open={openPasswordModal}
      onClose={onClose}
      aria-labelledby='password-modal-title'
      aria-describedby='password-modal-description'
    >
      <Box sx={{ ...style, width: 400 }}>
        <Typography id='password-modal-title' variant='subtitle1' component='h2' sx={{ marginBottom: '5px' }}>
          Your Password expired - Change Password
        </Typography>
        <Box component='form' noValidate autoComplete='off' onSubmit={handlePasswordChange(handlePasswordChangeSubmit)}>
          <CustomTextField name='oldPassword' label='old Password' type='password' control={passwordControler} />
          <CustomTextField name='newPassword' label='New Password' type='password' control={passwordControler} />
          <CustomTextField
            name='confirmPassword'
            label='confirm Password'
            type='password'
            control={passwordControler}
          />
          <Button fullWidth size='large' variant='contained' type='submit'>
            Update Password
          </Button>
        </Box>
      </Box>
    </Modal>
  )
}
PasswordResetModal.propTypes = {
  openPasswordModal: PropTypes.any,
  onClose: PropTypes.any,
  userId: PropTypes.any,
  setAlertData: PropTypes.any
}

export default PasswordResetModal
