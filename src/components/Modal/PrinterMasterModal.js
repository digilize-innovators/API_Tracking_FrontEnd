import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Modal, Box, Typography, Button, Grid2 } from '@mui/material'
import { style } from 'src/configs/generalConfig'
import CustomTextField from 'src/components/CustomTextField'
import CustomDropdown from 'src/components/CustomDropdown'
import { api } from 'src/utils/Rest-API'
import { useLoading } from 'src/@core/hooks/useLoading'
import { useRouter } from 'next/router'
import { useAuth } from 'src/Context/AuthContext'
const PrinterMasterSchema = yup.object().shape({
  printerId: yup
    .string()
    .trim()
    .max(50, 'Printer ID length should be less than 51')
    .required("Printer ID can't be empty"),
  printerCategoryId: yup.string().required('Printer category is required'),
  printerPort: yup
    .number()
    .transform(value => {
      // Check if the value is an empty string, null, or undefined
      if (value === '' || value == null) {
        return 0
      }
      // If the value is a valid number, return it, else return the original value
      return isNaN(value) ? 0 : value
    })
    .required("Printer port can't be empty")
    .min(1, 'Port number must be at least 1')
    .max(65535, 'Port number must be less than or equal to 65535'),
  printerIp: yup
    .string()
    .trim()
    .required("Printer IP can't be empty")
    .matches(/^([0-9]{1,3}\.){3}[0-9]{1,3}$/, 'Invalid IP address format')
})

function PrinterMasterModal({ open, onClose, editData, handleSubmitForm }) {
  const [allPrinterCategory, setAllPrinterCategory] = useState([])
  const { setIsLoading } = useLoading()
  const { removeAuthToken } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const getAllPrinterCategory = async () => {
      try {
        setIsLoading(true)
        const res = await api(`/printercategory/`, {}, 'get', true)
        setIsLoading(false)

        if (res.data.success) {
          console.log('res', res)

          const data = res.data.data.printerCategories?.map(item => ({
            id: item.id,
            value: item.id,
            label: item.printer_category_name
          }))
          console.log('data', data)
          setAllPrinterCategory(data)
        } else {
          console.log('Error in get printer category ', res.data)
          if (res.data.code === 401) {
            removeAuthToken()
            router.push('/401')
          }
        }
      } catch (error) {
        console.log('Error in get printer category', error)
        setIsLoading(false)
      }
    }
    getAllPrinterCategory()
    return () => {}
  }, [])

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(PrinterMasterSchema),
    defaultValues: {
      printerId: editData?.printer_id || '',
      printerCategoryId: editData?.printer_category_id || '',
      printerPort: editData?.printer_port || '',
      printerIp: editData?.printer_ip || ''
    }
  })

  useEffect(() => {
    if (editData) {
      reset({
        printerId: editData?.printer_id || '',
        printerCategoryId: editData?.printer_category_id || '',
        printerPort: editData?.printer_port || '',
        printerIp: editData?.printer_ip || ''
      })
    }
  }, [editData])

  return (
    <Modal
      open={open}
      onClose={onClose}
      role='dialog'
      aria-labelledby='modal-modal-title'
      aria-describedby='modal-modal-description'
    >
      <Box sx={style}>
        <Typography variant='h4' className='my-2'>
          {editData?.id ? 'Edit Printer Master' : 'Add Printer Master'}
        </Typography>
        <form onSubmit={handleSubmit(handleSubmitForm)}>
          <Grid2 container spacing={2}>
            <Grid2 size={6}>
              <CustomTextField name='printerId' label='Printer ID' control={control} />
            </Grid2>
            <Grid2 size={6}>
              <CustomDropdown
                name='printerCategoryId'
                label='Printer Category'
                control={control}
                options={allPrinterCategory}
              />
            </Grid2>
          </Grid2>

          <Grid2 container spacing={2}>
            <Grid2 size={6}>
              <CustomTextField name='printerPort' label='Printer Port' control={control} />
            </Grid2>
            <Grid2 size={6}>
              <CustomTextField name='printerIp' label='Printer IP' control={control} />
            </Grid2>
          </Grid2>
          <Grid2 item xs={12} className='mt-3'>
            <Button variant='contained' sx={{ marginRight: 3.5 }} type='submit'>
              Save Changes
            </Button>
            <Button type='reset' variant='outlined' color='primary' onClick={() => reset()}>
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

export default PrinterMasterModal
