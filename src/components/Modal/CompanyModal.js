import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Modal, Box, Typography, Button, Grid2 } from '@mui/material'
import { style } from 'src/configs/generalConfig'
import CustomTextField from 'src/components/CustomTextField'
import PropTypes from 'prop-types'

const CompanySchema = yup.object().shape({
  companyId: yup
    .string()
    .trim()
    .max(20, 'Company ID should not exceed 20 characters')
    .required("Company ID can't be empty")
    .test('valid-company-id', 'Company ID should only contain letters, numbers, and optional trailing space', value => {
      if (!value) return false
      // Only alphanumeric characters and single optional space at the end
      return /^[a-zA-Z0-9]+ ?$/.test(value)
    }),

  companyName: yup
    .string()
    .trim()
    .max(50, 'Company Name should not exceed 50 characters')
    .required("Company Name can't be empty")
    .test('valid-company-name', 'Company Name should not contain any special symbols', value => {
      if (!value) return false

      const validChars = /^[a-zA-Z0-9 ]+$/.test(value) // only letters, digits, and spaces
      const noDoubleSpaces = !/\s{2,}/.test(value) // no consecutive spaces
      const noEdgeSpaces = value === value.trim() // no leading or trailing spaces

      return validChars && noDoubleSpaces && noEdgeSpaces
    }),

  mfgLicenceNo: yup
    .string()
    .trim()
    .max(50, 'Mfg Licence No should not exceed 50 characters')
    .required("Mfg Licence No can't be empty"),

  contactNo: yup
    .string()
    .trim()
    .matches(/^\d+$/, 'Contact No should only contain numbers')
    .length(10, 'Contact No must be exactly 10 digits')
    .required(),

  email: yup
    .string()
    .trim()
    .email('Invalid email address')
    .matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/, 'Email is not valid')
    .required(),

  address: yup.string().trim().max(150, 'Address should not exceed 150 characters').required(),

  gs1_prefix: yup
    .string()
    .trim()
    .min(3, 'GS1 Prefix must be at least 3 characters')
    .max(10, 'GS1 Prefix should not exceed 10 characters')
    .required('GS1 Prefix is required'),

  secondGsprefix: yup
    .string()
    .trim()
    .notRequired()
    .min(3, 'GS2 Prefix must be at least 3 characters')
    .max(10, 'GS2 Prefix must not exceed 10 characters'),

  thirdGsprefix: yup
    .string()
    .trim()
    .notRequired()
    .min(3, 'GS3 Prefix must be at least 3 characters')
    .max(10, 'GS3 Prefix must not exceed 10 characters')
})

function CompanyModal({ open, onClose, editData, handleSubmitForm }) {
  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(CompanySchema),
    defaultValues: {
      companyId: editData?.company_id || '',
      companyName: editData?.company_name || '',
      mfgLicenceNo: editData?.mfg_licence_no || '',
      address: editData?.address || '',
      contactNo: editData?.contact || '',
      email: editData?.email || '',
      gs1_prefix: editData?.gs1_prefix || '',
      gs2_prefix: editData?.gs2_prefix || '',
      gs3_prefix: editData?.gs3_prefix || ''
    }
  })

  useEffect(() => {
    if (editData) {
      reset({
        companyId: editData?.company_id || '',
        companyName: editData?.company_name || '',
        mfgLicenceNo: editData?.mfg_licence_no || '',
        address: editData?.address || '',
        contactNo: editData?.contact || '',
        email: editData?.email || '',
        gs1_prefix: editData?.gs1_prefix || '',
        gs2_prefix: editData?.gs2_prefix || '',
        gs3_prefix: editData?.gs3_prefix || ''
      })
    }
  }, [editData, reset])

  return (
    <Modal open={open} onClose={onClose} aria-labelledby='modal-modal-title' aria-describedby='modal-modal-description'>
      <Box sx={style}>
        <Typography variant='h4' className='my-2'>
          {editData?.id ? 'Edit Company' : 'Add Company'}
        </Typography>

        <form onSubmit={handleSubmit(handleSubmitForm)}>
          <Grid2 container spacing={2}>
            <Grid2 size={6}>
              <CustomTextField name='companyId' label='Company ID *' control={control} disabled={!!editData?.id} />
            </Grid2>
            <Grid2 size={6}>
              <CustomTextField name='companyName' label='Company Name *' control={control} />
            </Grid2>
          </Grid2>

          <Grid2 container spacing={2}>
            <Grid2 size={6}>
              <CustomTextField name='mfgLicenceNo' label='Manufacturing License No. *' control={control} />
            </Grid2>
            <Grid2 size={6}>
              <CustomTextField name='address' label='Address *' control={control} />
            </Grid2>
          </Grid2>
          <Grid2 container spacing={2}>
            <Grid2 size={6}>
              <CustomTextField name='contactNo' label='Contact No *' control={control} />
            </Grid2>
            <Grid2 size={6}>
              <CustomTextField name='email' label='Email *' control={control} />
            </Grid2>
          </Grid2>

          <Grid2 container spacing={2}>
            <Grid2 size={4}>
              <CustomTextField name='gs1_prefix' label='GS1 Prefix *' type='number' control={control} />
            </Grid2>
            <Grid2 size={4}>
              <CustomTextField name='gs2_prefix' label='GS2 Prefix' type='number' control={control} />
            </Grid2>
            <Grid2 size={4}>
              <CustomTextField name='gs3_prefix' label='GS3 Prefix' type='number' control={control} />
            </Grid2>
          </Grid2>
          <Grid2 item xs={12} className='my-3'>
            <Button variant='contained' sx={{ marginRight: 3.5 }} type='submit'>
              Save Changes
            </Button>
            <Button variant='outlined' color='primary' onClick={() => reset()}>
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
CompanyModal.propTypes = {
  open: PropTypes.any,
  onClose: PropTypes.any,
  editData: PropTypes.any,
  handleSubmitForm: PropTypes.any
}
export default CompanyModal
