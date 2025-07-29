import React, { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Modal, Box, Typography, Button, Grid2, FormControlLabel, Switch } from '@mui/material'
import { style } from 'src/configs/generalConfig'
import CustomTextField from 'src/components/CustomTextField'
import PropTypes from 'prop-types'

const departmentSchema = yup.object().shape({
  departmentId: yup
    .string()
    .trim()
    .required("Department ID can't be empty")
    .matches(/^[a-zA-Z0-9]+$/, 'Department ID cannot contain any special symbols')
    .max(20, 'Department ID length should be <= 20'),
  departmentName: yup
    .string()
    .trim()
    .required("Department name can't be empty")
    .max(50, 'Department name length should be <= 50')
    .test('valid-department-name', 'Department name cannot contain any special symbols', value => {
      if (!value) return false
      const validChars = /^[a-zA-Z0-9 ]+$/.test(value)
      const noDoubleSpaces = !/\s{2,}/.test(value)
      const noEdgeSpaces = value === value.trim()
      return validChars && noDoubleSpaces && noEdgeSpaces
    })
})

const DepartmentModel = ({ open, onClose, editData, handleSubmitForm }) => {
  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(departmentSchema),
    defaultValues: {
      departmentId: editData?.department_id || '',
      departmentName: editData?.department_name || '',
      isLocationRequire: editData?.is_location_required || false
    }
  })
  useEffect(() => {
    if (editData) {
      reset({
        departmentId: editData?.department_id || '',
        departmentName: editData?.department_name || '',
        isLocationRequire: editData?.is_location_required || false
      })
    }
  }, [editData])

  return (
    <Modal
      open={open}
      onClose={onClose}
      data-testid='modal'
      aria-labelledby='modal-modal-title'
      aria-describedby='modal-modal-description'
    >
      <Box sx={style}>
        <Typography variant='h4' className='my-2'>
          {editData?.id ? 'Edit Department' : 'Add Department'}
        </Typography>
        <form onSubmit={handleSubmit(handleSubmitForm)}>
          <Grid2 container spacing={2}>
            <Grid2 size={6}>
              <CustomTextField
                name='departmentId'
                label='Department ID *'
                control={control}
                disabled={!!editData?.id}
              />
            </Grid2>
            <Grid2 size={6}>
              <CustomTextField name='departmentName' label='Department Name *' control={control} />
            </Grid2>
          </Grid2>
          <Grid2 container spacing={2}>
            <Grid2 size={6}>
              <Controller
                name='isLocationRequire'
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} color='primary' />}
                    label='Location required'
                  />
                )}
              />
            </Grid2>
          </Grid2>

          <Grid2 item xs={12} className='my-3 '>
            <Button variant='contained' sx={{ marginRight: 3.5 }} type='submit'>
              Save Changes
            </Button>
            <Button type='reset' variant='outlined' color='primary' onClick={reset}>
              Reset
            </Button>
            <Button variant='outlined' color='error' sx={{ marginLeft: 3.5 }} onClick={onClose}>
              Close
            </Button>
          </Grid2>
        </form>
      </Box>
    </Modal>
  )
}
DepartmentModel.propTypes = {
  open: PropTypes.any,
  onClose: PropTypes.any,
  editData: PropTypes.any,
  handleSubmitForm: PropTypes.any
}
export default DepartmentModel
