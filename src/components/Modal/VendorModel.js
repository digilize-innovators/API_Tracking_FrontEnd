import React, { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Modal, Box, Typography, Button, Grid2, FormControlLabel, Switch } from '@mui/material'
import { style } from 'src/configs/generalConfig'
import CustomTextField from 'src/components/CustomTextField'
import PropTypes from 'prop-types'
import VendorcountryModal from './VendorcountryModal'

const vendorSchema = yup.object().shape({
  vendorCode: yup
    .string()
    .trim()
    .required("Vendor code can't be empty")
    .max(20, 'Vendor Code length should be <= 20')
    .matches(/^[a-zA-Z0-9]+$/, 'Vendor code cannot contain any special symbols'),
  vendorName: yup
    .string()
    .trim()
    .required("Vendor name can't be empty")
    .max(50, 'Department name length should be <= 50')
    .matches(/^[A-Za-z0-9\s]+$/, 'Only alphabets, numbers, and spaces are allowed. No special characters.'),

  address: yup.string().trim().required("Address can't be empty").max(255, 'Address length should be <= 255')
})

const VendorModel = ({ open, onClose, editData, handleSubmitForm }) => {
  const [openVendorCountryModal, setOpenVendorCountryModal] = useState(false)
  const [codeStructure, setCodeStructure] = useState([])

  const handleCloseModal = () => {
    setOpenVendorCountryModal(false)
  }

  const handleOpenModal = () => {
    setOpenVendorCountryModal(true)
  }

  const { control, handleSubmit, reset, watch, getValues, setValue } = useForm({
    resolver: yupResolver(vendorSchema),
    defaultValues: {
      vendorCode: editData?.vendor_code || '',
      vendorName: editData?.vendor_name || '',
      address: editData?.address || '',
      printingcomplied: editData?.printing_complied || false,
      vendorStructure: (editData?.code_structure && editData?.code_structure.toString()) || (codeStructure?.length > 0 ? codeStructure?.join(' ') : '')
    }
  }) 
  useEffect(() => {
    if (editData?.id) {
  
      reset({
        vendorCode: editData?.vendor_code || '',
        vendorName: editData?.vendor_name || '',
        address: editData?.address || '',
        printingcomplied: editData?.printing_complied ||false,
        vendorStructure: (editData?.code_structure && editData?.code_structure.toString()) || (codeStructure?.length ? codeStructure?.join(' ') : '')
      })
      const raw = editData?.code_structure || ''
      const values = Array.isArray(raw)
        ? raw
        : (raw || '')
            .toString()
            .trim()
            .split(/\s+/)
            .filter(Boolean)
      setCodeStructure(values)
    }
    setValue('vendorStructure', (editData?.code_structure && editData?.code_structure.toString()) || '')
  }, [editData])

  useEffect(() => {
    setValue('vendorStructure', codeStructure?.join(' '))
  }, [codeStructure])
  const printingComplied = watch('printingcomplied')

 

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        data-testid='modal'
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
      >
        <Box sx={style}>
          <Typography variant='h4' className='my-2'>
            {editData?.id ? 'Edit Vendor ' : 'Add Vendor'}
          </Typography>
          <form onSubmit={handleSubmit(handleSubmitForm)}>
            <Grid2 container spacing={2}>
              <Grid2 size={6}>
                <CustomTextField name='vendorCode' label='Vendor ID *' control={control} disabled={!!editData?.id} />
              </Grid2>

              <Grid2 size={6}>
                <CustomTextField name='vendorName' label='Vendor Name *' control={control} />
              </Grid2>

              <Grid2 size={12}>
                <CustomTextField name='address' label='Address *' control={control} multiline={true} rows={2} />
              </Grid2>
            </Grid2>

            <Grid2 container spacing={2} className='mt-2'>
              <Grid2 size={6}>
                <Controller
                  name='printingcomplied'
                  control={control}
                  render={({ field }) => {
                    const handleSwitchChange = event => {
                      const isChecked = event.target.checked
                      field.onChange(isChecked)
                    }

                    return (
                      <FormControlLabel
                        control={
                          <Switch {...field} checked={field.value} onChange={handleSwitchChange} color='primary' />
                        }
                        label='Printing Complied'
                      />
                    )
                  }}
                />
              </Grid2>
              {printingComplied && (
                <>
                  <Grid2 size={6}>
                    <CustomTextField name='vendorStructure' label='Code Structure' control={control} disabled />
                  </Grid2>

                  <Grid2 size={6}>
                    <Button variant='outlined' onClick={handleOpenModal}>
                      Set Code Structure
                    </Button>
                  </Grid2>
                </>
              )}
            </Grid2>

            <Grid2 item xs={12} className='my-3 '>
              <Button variant='contained' sx={{ marginRight: 3.5 }} type='submit'>
                Save Changes
              </Button>
              <Button variant='outlined' color='primary' onClick={() => {
                reset({
                  vendorCode: editData?.vendor_code || '',
                  vendorName: editData?.vendor_name || '',
                  address: editData?.address || '',
                  printingcomplied: editData?.printing_complied || false,
                  vendorStructure: (editData?.code_structure && editData?.code_structure.toString()) || (codeStructure?.length > 0 ? codeStructure?.join(' ') : '')
                })
                const raw = editData?.code_structure || ''
                const values = Array.isArray(raw)
                  ? raw
                  : (raw || '')
                      .toString()
                      .trim()
                      .split(/\s+/)
                      .filter(Boolean)
                setCodeStructure(values)
              }}>
                Reset
              </Button>
              <Button variant='outlined' color='error' sx={{ marginLeft: 3.5 }} onClick={onClose}>
                Close
              </Button>
            </Grid2>
          </form>
        </Box>
      </Modal>

      <VendorcountryModal
        openModal={openVendorCountryModal}
        handleCloseModal={handleCloseModal}
        editData={editData}
        codeStructure={codeStructure}
        setCodeStructure={setCodeStructure}
      />
    </>
  )
}
VendorModel.propTypes = {
  open: PropTypes.any,
  onClose: PropTypes.any,
  editData: PropTypes.any,
  handleSubmitForm: PropTypes.any
}
export default VendorModel
