import React, { useState, useEffect } from 'react'
import {
  Modal,
  Box,
  TextField,
  Button,
  Typography,
  Grid2,
  TextareaAutosize,
  InputAdornment,
  IconButton,
  Popover
} from '@mui/material'
import { SiSpringsecurity } from 'react-icons/si'
import { AiFillEyeInvisible } from 'react-icons/ai'
import { FaEye } from 'react-icons/fa'
import { api } from '../utils/Rest-API'
import { useSettings } from '../@core/hooks/useSettings'
import PropTypes from 'prop-types'

const styleModalComponent = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '40%',
  bgcolor: 'background.paper',
  borderRadius: '10px',
  boxShadow: 24,
  p: 4
}

const popoverStyle = {
  p: 2,
  bgcolor: '#50BDA0',
  color: '#ffffff',
  borderRadius: '8px'
}

const AuthModal = ({
  open,
  handleClose,
  handleAuthResult,
  approveAPIName,
  approveAPImethod,
  approveAPIEndPoint,
  config,
  handleAuthModalOpen,
  openModalApprove
}) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [remarks, setRemarks] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [roles, setRoles] = useState([])
  const [anchorEl, setAnchorEl] = useState(null)
  const { settings } = useSettings()

  useEffect(() => {
    if (open) {
      resetFields()
      fetchDesignations()
    }
    if (openModalApprove) {
      handleAuthModalOpen()
    }
  }, [open])

  const resetFields = () => {
    setUsername('')
    setPassword('')
    setRemarks('')
    setError('')
    setRoles([])
  }

  const fetchDesignations = async () => {
    const params = { endpoint: approveAPIEndPoint, method: approveAPImethod }
    try {
      const res = await api(
        `/designation/designationbyapis/${encodeURIComponent(params.method)}?endpoint=${encodeURIComponent(params.endpoint)}`,
        {},
        'get',
        true
      )
      if (res.data.success) {
        const data = res.data.data
        const roleList = data.map(item => `${item.department_name} - ${item.designation_name}`)
        setRoles(roleList)
      } else {
        console.log('An error occurred during verification:', res.data.message)
      }
    } catch (error) {
      console.log('An error occurred during verification:', error.message)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleVerify = async esignStatus => {
    try {
      if (!username || !password) {
        setError('Please enter username and password.')
        return
      }
      const authData = { userId: username, password, securityCheck: true, approveAPIName, approveAPImethod }
      if (esignStatus === 'rejected' && approveAPIName.includes('create')) {
        handleClose()
        return
      }
      const res = await api('/auth/security-check', authData, 'post', true)
      console.log('Response of security check: ', res?.data)
      if (res.data.success && res.data.code === 401) {
        setError(res.data.message)
        return
      }
      if (res.data.success) {
        const { userId, userName, user_id } = res.data.data
        const user = { userId, userName, user_id }
        const isAuthenticated = true
        const isApprover = approveAPIName.includes('approve')
        //  && config.userId !== user.user_id;

        handleAuthResult(isAuthenticated, user, isApprover, esignStatus, remarks)
        resetFields()
        handleClose()
        return
      } else {
        res.data.message === 'Invalid username or password'
          ? setError('Authentication failed. Please try again.')
          : setError(res.data.message)

        return
      }
    } catch (error) {
      setError('An error occurred during verification.')
    }
  }

  const handlePopoverOpen = event => {
    setAnchorEl(event.currentTarget)
  }

  const handlePopoverClose = () => {
    setAnchorEl(null)
  }
  const openPopover = Boolean(anchorEl)

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby='modal-modal-title'
      aria-describedby='modal-modal-description'
    >
      <Box sx={styleModalComponent}>
        <Grid2 item xs={12} className='d-flex justify-content-between align-items-center'>
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant='body1' sx={{ mt: 2 }}>
              <SiSpringsecurity fontSize={30} />
            </Typography>
            <Typography variant='h6' component='h2' sx={{ mt: 2 }}>
              Security Check
            </Typography>
            <Typography variant='body1' sx={{ mt: 2 }}>
              Action: {approveAPImethod === 'POST' && 'Add'}
              {approveAPImethod === 'PUT' && 'Edit'}
              {approveAPImethod === 'PATCH' && 'Approve'}
            </Typography>
            <Typography variant='body1' sx={{ mt: 2 }}>
              Feature: {approveAPIName}
            </Typography>
            <Typography
              variant='body1'
              sx={{ mt: 2, cursor: 'pointer', textDecoration: 'underline' }}
              onClick={handlePopoverOpen}
            >
              Access Roles
            </Typography>
            <Popover
              open={openPopover}
              anchorEl={anchorEl}
              onClose={handlePopoverClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center'
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center'
              }}
            >
              <Box sx={popoverStyle}>
                {roles.map((role, index) => (
                  <Typography key={index + 1} variant='body2'>
                    {role}
                  </Typography>
                ))}
              </Box>
            </Popover>
          </Box>
        </Grid2>
        <TextField
          className='w-100 mt-4'
          label='User ID'
          variant='outlined'
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <TextField
          className='w-100 mt-2'
          label='Password'
          variant='outlined'
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={e => setPassword(e.target.value)}
          slotProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <IconButton onClick={togglePasswordVisibility} edge='end'>
                  {showPassword ? (
                    <FaEye color={settings.themeColor} />
                  ) : (
                    <AiFillEyeInvisible color={settings.themeColor} />
                  )}
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        <TextareaAutosize
          className='w-100 mt-2'
          minRows={3}
          maxRows={6}
          placeholder='Remarks'
          value={remarks}
          onChange={e => setRemarks(e.target.value)}
          style={{
            padding: '10px',
            border: `1px solid gray`,
            borderRadius: '4px',
            color: settings.themeColor,
            resize: 'none',
            overflow: 'hidden',
            maxHeight: '144px',
            outline: 'none'
          }}
          onFocus={e => {
            e.target.style.border = `1px solid ${settings.themeColor}`
          }}
          onBlur={e => {
            e.target.style.border = `1px solid ${settings.themeColor}`
          }}
        />

        {error && (
          <Typography color='error' variant='body2' sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}

        <Box mt={3} display='flex' justifyContent='space-between'>
          <Button variant='contained' color='success' sx={{ mx: 2, my: 4 }} onClick={() => handleVerify('approved')}>
            Approve
          </Button>

          <Button variant='contained' color='error' sx={{ mx: 2, my: 4 }} onClick={() => handleVerify('rejected')}>
            Reject
          </Button>

          <Button variant='outlined' color='error' sx={{ mx: 2, my: 4 }} onClick={handleClose}>
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  )
}

AuthModal.propTypes = {
  open: PropTypes.any,
  handleClose: PropTypes.any,
  handleAuthResult: PropTypes.any,
  approveAPIName: PropTypes.any,
  approveAPImethod: PropTypes.any,
  approveAPIEndPoint: PropTypes.any,
  config: PropTypes.any,
  handleAuthModalOpen: PropTypes.any,
  openModalApprove: PropTypes.any
}

export default AuthModal
