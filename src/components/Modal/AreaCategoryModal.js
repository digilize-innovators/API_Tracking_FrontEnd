import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Modal, Box, Typography, Button, Grid2 } from '@mui/material'
import { style } from 'src/configs/generalConfig'
import CustomTextField from 'src/components/CustomTextField'
import PropTypes from 'prop-types'

const AreaCategorySchema = yup.object().shape({
  areaCategoryName: yup
    .string()
    .trim()
    .required("Area category name can't be empty")
    .max(101, 'Area category name must be 101 characters or less')
    .test(
      'valid-area-category-name',
      'Area category name must contain only letters, numbers, and single spaces',
      value => {
        if (!value) return false

        const validChars = /^[a-zA-Z0-9 ]+$/.test(value) // only alphanumeric and space
        const noDoubleSpaces = !/\s{2,}/.test(value) // no multiple consecutive spaces
        const noEdgeSpaces = value === value.trim() // no leading/trailing space

        return validChars && noDoubleSpaces && noEdgeSpaces
      }
    )
})

const AreaCategoryModal = ({ open, onClose, editData, handleSubmitForm }) => {
  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(AreaCategorySchema),
    defaultValues: { areaCategoryName: '' }
  })
  useEffect(() => {
    if (editData) {
      reset({ areaCategoryName: editData?.area_category_name || '' })
    }
  }, [editData, reset])

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
          {editData?.id ? 'Edit Area Category' : 'Add Area Category'}
        </Typography>

        <form onSubmit={handleSubmit(handleSubmitForm)}>
          <Grid2 container spacing={2}>
            <Grid2 xs={12} sm={6}>
              <CustomTextField name='areaCategoryName' label='Area Category *' control={control} />
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
AreaCategoryModal.propTypes = {
  open: PropTypes.any,
  onClose: PropTypes.any,
  editData: PropTypes.any,
  handleSubmitForm: PropTypes.any
}
export default AreaCategoryModal
