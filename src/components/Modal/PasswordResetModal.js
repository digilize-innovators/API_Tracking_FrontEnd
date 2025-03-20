import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Modal, Box, Typography, TextField, Button } from '@mui/material';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../../pages/api/getMacAddress.js'; // Ensure your api function is properly imported

// Yup validation schema
const passwordSchema = yup.object().shape({
  oldPassword: yup.string().required('Old Password is required'),
  newPassword: yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/\d/, 'Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')
    .required('New Password is required'),
  confirmPassword: yup.string()
    .required('Confirm Password is required')
    .oneOf([yup.ref('newPassword'), null], 'Passwords must match'),
});

const PasswordResetModal = ({ openPasswordModal, setOpenPasswordModal, userId, setAlertData }) => {
  // Hook Form setup with validation schema
  const {
    control: passwordControler,
    handleSubmit: handlePasswordChange,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(passwordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Handle form submission
  const handlePasswordChangeSubmit = async (passwordData) => {
    const password_data = {
      userId: userId, // Use the passed userId prop
      oldPassword: passwordData.oldPassword,
      newPassword: passwordData.newPassword,
    };
    console.log("password_data", password_data);

    // Make API call to reset the password
    const res = await api('/auth/reset-password', password_data, 'post', false);
    if (res.data.success) {
      setAlertData({
        openSnackbar: true,
        type: 'success',
        message: 'Reset password successful',
        variant: 'filled',
      });
      reset(); // Reset form after successful submission
    } else {
      setAlertData({
        openSnackbar: true,
        type: 'error',
        message: res.data.message || 'Reset password failed',
        variant: 'filled',
      });
    }
    setOpenPasswordModal(false); // Close the modal
  };

  return (
    <Modal
      open={openPasswordModal}
      onClose={() => setOpenPasswordModal(false)}
      aria-labelledby='password-modal-title'
      aria-describedby='password-modal-description'
    >
      <Box sx={{ width: 400, padding: 3 }}>
        <Typography id='password-modal-title' variant='subtitle1' component='h2' sx={{ marginBottom: '5px' }}>
          Your Password expired - Change Password
        </Typography>
        <Box component='form' noValidate autoComplete='off' onSubmit={handlePasswordChange(handlePasswordChangeSubmit)}>
          {/* Old Password Field */}
          <Controller
            name='oldPassword'
            control={passwordControler}
            render={({ field }) => (
              <TextField
                {...field}
                label='Old Password'
                required
                fullWidth
                variant='outlined'
                sx={{ marginBottom: 3 }}
                type='password'
                error={!!errors.oldPassword}
                helperText={errors.oldPassword?.message}
              />
            )}
          />

          {/* New Password Field */}
          <Controller
            name='newPassword'
            control={passwordControler}
            render={({ field }) => (
              <TextField
                {...field}
                label='New Password'
                required
                fullWidth
                variant='outlined'
                sx={{ marginBottom: 3 }}
                type='password'
                error={!!errors.newPassword}
                helperText={errors.newPassword?.message}
              />
            )}
          />

          {/* Confirm Password Field */}
          <Controller
            name='confirmPassword'
            control={passwordControler}
            render={({ field }) => (
              <TextField
                {...field}
                label='Confirm Password'
                required
                fullWidth
                variant='outlined'
                sx={{ marginBottom: 3 }}
                type='password'
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
              />
            )}
          />

          {/* Submit Button */}
          <Button fullWidth size='large' variant='contained' type='submit'>
            Update Password
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default PasswordResetModal;
