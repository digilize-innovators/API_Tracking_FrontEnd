import { useEffect, useState, useRef } from 'react'
import { style } from 'src/configs/generalConfig'
import { Modal, Box, Typography, Button, Grid2, FormControlLabel, Switch, TextField } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import CustomTextField from 'src/components/CustomTextField'
import styled from '@emotion/styled'
import CustomDropdown from '../CustomDropdown'
import { useRouter } from 'next/router'
import { useLoading } from 'src/@core/hooks/useLoading'
import { useAuth } from 'src/Context/AuthContext'
import { api } from 'src/utils/Rest-API'
import PropTypes from 'prop-types'
import { convertImageToBase64 } from 'src/utils/UrlToBase64'

const ButtonStyled = styled(Button)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    textAlign: 'center'
  }
}))

const ResetButtonStyled = styled(Button)(({ theme }) => ({
  marginLeft: theme.spacing(4.5),
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    marginLeft: 0,
    textAlign: 'center',
    marginTop: theme.spacing(4)
  }
}))

const ImgStyled = styled('img')(({ theme }) => ({
  width: 120,
  height: 120,
  marginRight: theme.spacing(6.25),
  borderRadius: theme.shape.borderRadius
}))

const MAX_LENGTH = 50
const PHONE_LENGTH = 10
const MIN_PASSWORD_LENGTH = 8

const UserSchema = yup.object().shape({
  userId: yup
    .string()
    .trim()
    .max(MAX_LENGTH, `User ID length should be less than ${MAX_LENGTH} characters`)
    .matches(/^[a-zA-Z0-9]+$/, 'User ID cannot contain special symbols')
    .required("User ID can't be empty"),
  userName: yup
    .string()
    .trim()
    .max(MAX_LENGTH, `User name length should be less than ${MAX_LENGTH} characters`)
    .matches(/^[a-zA-Z0-9]+(?:\s[a-zA-Z0-9]+)*$/, 'Username cannot contain special symbols')
    .required("User Name can't be empty"),
  email: yup.string().trim().email('Email is not valid').required('Email is required'),
  password: yup
    .string()
    .trim()
    .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
    .matches(
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%^&*])[A-Za-z\d@#$%^&*()\-_=+]{8,}$/,
      'Password must contain at least 1 uppercase, 1 lowercase, 1 digit, and 1 special character (@#$%^&*)'
    )
    .required('Password is required'),
  phoneNumber: yup
    .string()
    .trim()
    .length(PHONE_LENGTH, `Phone number must be ${PHONE_LENGTH} digits`)
    .matches(/^\d+$/, 'Phone number cannot contain alphabets')
    .required('Phone is required'),
  departmentId: yup.string().required('Department ID cannot be empty'),
  designationId: yup.string().required('Designation ID cannot be empty'),
  locationId: yup.string().required('Location ID cannot be empty')
})

function UserModel({
  open,
  onClose,
  editData,
  handleSubmitForm,
  allDepartment,
  profilePhoto,
  setProfilePhoto,
  onChange
}) {
  const { setIsLoading } = useLoading()
  const { removeAuthToken } = useAuth()
  const router = useRouter()
  const [allDesignation, setAllDesignation] = useState([])
  const [allLocation, setAllLocation] = useState([])
  const [departmentId, setDepartmentId] = useState('')
  const { control, handleSubmit, reset, watch, setValue } = useForm({
    resolver: yupResolver(UserSchema),
    defaultValues: {
      userId: editData?.id || '',
      userName: editData?.userName || '',
      email: editData?.email || '',
      password: '',
      phoneNumber: editData?.phoneNumber || '',
      departmentId: editData?.departmentId || '',
      designationId: editData?.designationId || '',
      locationId: editData?.locationId || '',
      isEnabled: editData?.is_active || true
    }
  })
  const watchedDepartmentId = watch('departmentId')
  const prevDepartmentRef = useRef()

  useEffect(() => {
    if (prevDepartmentRef.current) {
      setValue('designationId', '')
    }

    setDepartmentId(watchedDepartmentId)
    prevDepartmentRef.current = watchedDepartmentId
  }, [watchedDepartmentId])

  const departmentData = allDepartment?.map(item => ({
    id: item.department_uuid,
    value: item.department_uuid,
    label: item.department_name
  }))

  useEffect(() => {
    if (editData) {
      reset({
        userId: editData?.user_id || '',
        userName: editData?.user_name || '',
        email: editData?.email || '',
        password: editData.password ? 'Dummy@1234' : '',
        phoneNumber: editData?.phone_number || '',
        departmentId: editData?.department_id || '',
        designationId: editData?.designation_id || '',
        locationId: editData?.location_id || '',
        isEnabled: editData?.is_active || false
      })
    }
  }, [editData, reset])

  useEffect(() => {
    const getDesignation = async () => {
      try {
        if (!departmentId) return
        setIsLoading(true)
        const params = new URLSearchParams({
          page: 1,
          limit: -1,
          history_latest: true
        })
        const res = await api(`/designation/${departmentId}/?${params.toString()}`, {}, 'get', true)
        setIsLoading(false)
        if (res.data.success) {
          const data = res.data.data.designations.map(item => ({
            id: item.designation_uuid,
            value: item.designation_uuid,
            label: item.designation_name
          }))
          setAllDesignation(data)
        } else {
          console.log('Error to get all designation ', res.data)
          if (res.data.code === 401) {
            removeAuthToken()
            router.push('/401')
          }
        }
      } catch (error) {
        console.log('Error in get designation ', error)
        setIsLoading(false)
      }
    }
    getDesignation()
  }, [departmentId])

  useEffect(() => {
    const getLocation = async () => {
      try {
        setIsLoading(true)
        const res = await api(`/location/type-so-sto`, {}, 'get', true)
        setIsLoading(false)
        if (res.data.success) {
          const data = res.data.data?.map(item => ({
            id: item.location_uuid,
            value: item.location_uuid,
            label: item.location_name
          }))
          setAllLocation(data)
        } else {
          console.log('Error to get all location', res.data)
          if (res.data.code === 401) {
            removeAuthToken()
            router.push('/401')
          }
        }
      } catch (error) {
        console.log('Error in get location ', error)
        setIsLoading(false)
      }
    }
    getLocation()
  }, [])

  return (
    <Modal
      open={open}
      onClose={onClose}
      data-testid='modal'
      aria-labelledby='modal-modal-title'
      aria-describedby='modal-modal-description'
    >
      <Box
        sx={{
          ...style,
          width: { xs: '100%', sm: '75%', md: '50%', lg: '40%' },
          overflowY: 'auto'
        }}
      >
        <Typography variant='h4' className='my-2'>
          {editData?.id ? 'Edit User' : 'Add User'}
        </Typography>
        <Grid2 item md={12} className='d-flex justify-content-between align-items-center'>
          <Box>
            <Grid2 item xs={12} sx={{ marginTop: 5, marginBottom: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ImgStyled src={profilePhoto} alt='Profile Pic' />
                <Box>
                  <ButtonStyled component='label' variant='contained' htmlFor='account-settings-upload-image'>
                    Upload New Photo{/* */}
                    <input
                      hidden
                      type='file'
                      onChange={onChange}
                      accept='image/png, image/jpeg, image/jpg'
                      id='account-settings-upload-image'
                    />
                  </ButtonStyled>
                  <ResetButtonStyled
                    color='error'
                    variant='outlined'
                    onClick={() => {
                      if (editData?.profile_photo) {
                        convertImageToBase64(editData?.profile_photo, setProfilePhoto)
                      } else {
                        setProfilePhoto('/images/avatars/1.png')
                      }
                    }}
                  >
                    Reset
                  </ResetButtonStyled>
                  <Typography variant='body2' sx={{ marginTop: 5 }}>
                    Allowed PNG, JPG or JPEG. Max size of 8MB.
                  </Typography>
                </Box>
              </Box>
            </Grid2>
          </Box>
        </Grid2>
        <form onSubmit={handleSubmit(handleSubmitForm)}>
          <Grid2 container spacing={2}>
            <Grid2 size={6}>
              <CustomTextField name='userId' label='User ID' control={control} disabled={!!editData?.id} />
            </Grid2>
            <Grid2 size={6}>
              <CustomTextField name='userName' label='User Name' control={control} disabled={!!editData?.id} />
            </Grid2>
          </Grid2>
          <Grid2 container spacing={2}>
            <Grid2 size={6}>
              <CustomTextField name='email' label='Email' control={control} />
            </Grid2>
            <Grid2 size={6}>
              <Controller
                name='password'
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    sx={{ mb: 3 }}
                    fullWidth
                    label='Password'
                    placeholder='password'
                    type='password'
                    error={!!error}
                    s
                    helperText={error ? error.message : ''}
                    disabled={!!editData?.id}
                  />
                )}
              />
            </Grid2>
          </Grid2>

          <Grid2 container spacing={2}>
            <Grid2 size={6}>
              <CustomTextField name='phoneNumber' label='Phone' control={control} />
            </Grid2>
            <Grid2 size={6}>
              <CustomDropdown
                name='departmentId'
                label='Department Name *'
                control={control}
                options={departmentData}
              />
            </Grid2>
          </Grid2>

          <Grid2 container spacing={2}>
            <Grid2 size={6}>
              <CustomDropdown
                name='designationId'
                label='Designation Name'
                control={control}
                options={departmentId ? allDesignation : []}
              />
            </Grid2>

            <Grid2 size={6}>
              <CustomDropdown name='locationId' label='Location Name' control={control} options={allLocation} />
            </Grid2>
          </Grid2>
          {editData?.id && (
            <Grid2 item xs={12} sm={6}>
              <Typography component='Box'>
                <Controller
                  name='isEnabled'
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel control={<Switch {...field} checked={field.value} color='primary' />} />
                  )}
                />
                User Enabled
              </Typography>
            </Grid2>
          )}
          <Grid2
            item
            xs={12}
            sx={{
              my: 3,
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              alignItems: { xs: 'stretch', sm: 'center' },
              justifyContent: { sm: 'flex-start' }
            }}
          >
            <Button variant='contained' type='submit'>
              Save Changes
            </Button>
            <Button type='reset' variant='outlined' color='primary' onClick={() => reset()}>
              Reset
            </Button>
            <Button variant='outlined' color='error' onClick={onClose}>
              Close
            </Button>
          </Grid2>
        </form>
      </Box>
    </Modal>
  )
}

UserModel.propTypes = {
  open: PropTypes.any,
  onClose: PropTypes.any,
  editData: PropTypes.any,
  handleSubmitForm: PropTypes.any,
  allDepartment: PropTypes.any,
  profilePhoto: PropTypes.any,
  setProfilePhoto: PropTypes.any,
  onChange: PropTypes.any
}
export default UserModel
