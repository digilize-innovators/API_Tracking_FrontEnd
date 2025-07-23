import * as yup from 'yup'
import { Modal, Box, Grid2, Typography, Button } from '@mui/material'
import { style } from 'src/configs/generalConfig'
import CustomTextField from '../CustomTextField'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useEffect } from 'react'
import PropTypes from 'prop-types'
import isValidIPv4 from 'src/@core/utils/isValidIPv4'

const validationSchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .max(50, 'Control Panel Name length should be less than 50')
    .required("Control Panel Name can't be empty")
    .test('valid-control-panel-name', 'Control Panel Name cannot contain any special symbols', value => {
      if (!value) return false

      const validChars = /^[a-zA-Z0-9 ]+$/.test(value) // only alphanumeric + spaces
      const noDoubleSpaces = !/\s{2,}/.test(value) // no consecutive spaces
      const noEdgeSpaces = value === value.trim() // no leading/trailing spaces

      return validChars && noDoubleSpaces && noEdgeSpaces
    }),

  ip: yup
    .string()
    .trim()
    .required("IP Address can't be empty")
    .test('is-valid-ipv4', 'Invalid IPv4 address', value => isValidIPv4(value)),

  port: yup
    .number()
    .typeError('Port Number must be a valid number')
    .integer('Port Number must be a valid number')
    .min(1, 'Port Number must be between 1 and 65535')
    .max(65535, 'Port Number must be between 1 and 65535')
    .required("Port Number can't be empty")
})

function ControlPanelModal({ openModal, handleClose, editData, handleSubmitForm }) {
  const { handleSubmit, control, reset } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      port: editData?.port || '',
      ip: editData?.ip || '',
      name: editData?.name || ''
    }
  })

  useEffect(() => {
    if (editData) {
      reset({
        port: editData?.port || '',
        ip: editData?.ip || '',
        name: editData?.name || ''
      })
    }
    if (!openModal) {
      reset({
        port: '',
        ip: '',
        name: ''
      })
    }
  }, [editData, openModal])

  return (
    <Modal
      open={openModal}
      onClose={handleClose}
      aria-labelledby='modal-modal-title'
      aria-describedby='modal-modal-description'
      data-testid='modal'
    >
      <Box sx={style}>
        <Typography variant='h4' className='my-2'>
          {editData?.id ? 'Edit Control Panel' : 'Add Control Panel'}
        </Typography>
        <form onSubmit={handleSubmit(handleSubmitForm)}>
          <Grid2 container spacing={2}>
            <Grid2 size={6}>
              <CustomTextField label='Control Panel Name *' name='name' control={control} />
            </Grid2>
            <Grid2 size={6}>
              <CustomTextField label='IP Address *' name='ip' control={control} />
            </Grid2>
          </Grid2>

          <Grid2 container spacing={2}>
            <Grid2 size={6}>
              <CustomTextField control={control} label='Port No. *' name='port' />
            </Grid2>
          </Grid2>
          <Grid2 item xs={12} className='my-3 '>
            <Button variant='contained' sx={{ marginRight: 3.5 }} type='submit'>
              Save Changes
            </Button>
            <Button type='reset' variant='outlined' color='primary' onClick={() => reset()}>
              Reset
            </Button>
            <Button variant='outlined' color='error' sx={{ marginLeft: 3.5 }} onClick={handleClose}>
              Close
            </Button>
          </Grid2>
        </form>
      </Box>
    </Modal>
  )
}
ControlPanelModal.propTypes = {
  openModal: PropTypes.any,
  handleClose: PropTypes.any,
  editData: PropTypes.any,
  handleSubmitForm: PropTypes.any
}
export default ControlPanelModal
