import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import {
  Modal,
  Box,
  Typography,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  Grid2,
  FormHelperText
} from '@mui/material'
import { style } from 'src/configs/generalConfig'
import CustomTextField from 'src/components/CustomTextField'

const printerValidationSchema = yup.object().shape({
  printerCategoryID: yup.string().required("printer category id can't be empty"),
  printerCategoryName: yup
    .string()
    .required("Printer Name can't be empty")
    .max(100, 'Printer Name length should be less than 101')
    .matches(/^[a-zA-Z0-9\s-]+$/, 'Printer name cannot contain any special symbols'),

  printerType: yup.string().required('Printing Technology is required')
})

const PrintingCategoryModal = ({ open, onClose, editData, handleSubmitForm }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(printerValidationSchema),
    defaultValues: { printerCategoryName: '', printerType: '', printerCategoryID: '' }
  })

  useEffect(() => {
    if (editData) {
      reset({
        printerCategoryID: editData?.printer_category_id || '',
        printerCategoryName: editData?.printer_category_name || '',
        printerType: editData?.printingTechnology || ''
      })
    }
  }, [editData])

  return (
    <Modal open={open} onClose={onClose} data-testid='modal' role='dialog'>
      <Box sx={style}>
        {console.log(editData)}{' '}
        <Typography variant='h4' className='my-2'>
          {editData?.id ? 'Edit Printer Category' : 'Add Printer Category'}
        </Typography>
        <form onSubmit={handleSubmit(handleSubmitForm)}>
          <Grid2 container spacing={2}>
            <Grid2 item xs={6}>
              <CustomTextField
                name='printerCategoryID'
                disabled={editData?.id ? true : false}
                label='Printer Category'
                control={control}
              />
            </Grid2>
            <Grid2 item xs={6}>
              <CustomTextField name='printerCategoryName' label='Printer Name' control={control} />
            </Grid2>
          </Grid2>
          <Grid2 item xs={12}>
            <Controller
              name='printerType'
              control={control}
              rules={{ required: 'Please select a printer type' }} // Add validation rule
              render={({ field }) => (
                <>
                  <RadioGroup row {...field}>
                    <FormControlLabel value='inkBased' control={<Radio disabled={editData?.id ? true : false} />} label='Ink Based' />
                    <FormControlLabel value='ribbonBased' control={<Radio disabled={editData?.id ? true : false} />} label='Ribbon Based' />
                  </RadioGroup>
                  {errors.printerType && (
                    <FormHelperText error>{errors.printerType.message}</FormHelperText> // Display validation error
                  )}
                </>
              )}
            />
          </Grid2>

          <Grid2 container spacing={2} className='mt-3'>
            <Grid2 item>
              <Button type='submit' variant='contained'>
                Save Changes
              </Button>
            </Grid2>
            <Grid2 item>
              <Button type='reset' variant='outlined' onClick={() => reset()}>
                Reset
              </Button>
            </Grid2>
            <Grid2 item>
              <Button variant='outlined' color='error' onClick={onClose}>
                Close
              </Button>
            </Grid2>
          </Grid2>
        </form>
      </Box>
    </Modal>
  )
}

export default PrintingCategoryModal