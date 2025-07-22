import React , { useEffect } from 'react'
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Modal, Box, Typography, Button, Grid2 } from '@mui/material';
import { style } from 'src/configs/generalConfig'
import CustomTextField from 'src/components/CustomTextField';
import CustomDropdown from '../CustomDropdown';
import PropTypes from 'prop-types'

const designationSchema = yup.object().shape({
  designationId: yup.string()
  .required("Designation ID can't be empty")
    .max(20, 'Designation ID length should be <= 20')
    .matches(/^[a-zA-Z0-9]+\s*$/, 'Designation ID cannot contain any special symbols')
    ,

  designationName: yup.string()
  .required("Designation Name can't be empty")
  .max(50, 'Designation Name length should be <= 50')
  .test(
    'valid-designation-name',
    'Designation Name cannot contain any special symbols',
    (value) => {
      if (!value) return false;

      const validChars = /^[a-zA-Z0-9 ]+$/.test(value);  // only letters, numbers, and spaces
      const noDoubleSpaces = !/\s{2,}/.test(value);      // no multiple spaces in a row
      const noEdgeSpaces = value === value.trim();       // no leading/trailing spaces

      return validChars && noDoubleSpaces && noEdgeSpaces;
    }
  ),
});

const DesignationModal = ({ open, onClose, editData, handleSubmitForm, departmentData, depData }) => {
  const departmentID = departmentData?.map((item) => ({
    id: item.id,
    value: item.id,
    label: item.department_name,
  }));
  const {
    control,
    handleSubmit,
    reset
  } =
    useForm({
      resolver: yupResolver(designationSchema),
      defaultValues: {
        designationId: editData.designation_id || '',
        designationName: editData.designation_name || '',
        departmentId: editData.department_id || depData?.id,
      },
    });

  useEffect(() => {
    if (editData) {
      reset({
        designationId: editData.designation_id || '',
        designationName: editData.designation_name || '',
        departmentId: editData.department_id || depData?.id,
      });
    }
  }, [editData, reset]);
  console.log(editData, depData)

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby='modal-modal-title'
      aria-describedby='modal-modal-description'
    >

      <Box sx={style}>
        <Typography variant='h4' className='my-2'>
          {editData?.id ? 'Edit Designation' : 'Add Designation'}
        </Typography>
        <form onSubmit={handleSubmit(handleSubmitForm)}>
          <Grid2 container spacing={2} sx={{ margin: "0.5rem 0rem" }}>
            <Grid2 size={6}>
              <CustomTextField
                name='designationId'
                label='Designation ID *'
                disabled={!!editData?.id}
                control={control}
              />
            </Grid2>
            <Grid2 size={6}>
              <CustomTextField
                name='designationName'
                label='Designation Name *'
                control={control}
              />
            </Grid2>

          </Grid2>
          <Grid2 container spacing={2} sx={{ margin: "0.5rem 0rem" }}>
            <Grid2 size={6}>
              <CustomDropdown
                name='departmentId'
                label='Department'
                control={control}
                options={departmentID}
                disabled={!!depData.id}
              />
            </Grid2>
          </Grid2>
          <Grid2 item xs={12} className='my-3 '>
            <Button variant='contained' sx={{ marginRight: 3.5 }} type="submit">
              Save Changes
            </Button>
            <Button
              type='reset'
              variant='outlined'
              color='primary'
              onClick={() => reset()}
            >
              Reset
            </Button>
            <Button variant='outlined' color='error' sx={{ marginLeft: 3.5 }} onClick={onClose}
            >
              Close
            </Button>
          </Grid2>
        </form>
      </Box>
    </Modal>

  )
}
DesignationModal.propTypes = {
  open: PropTypes.any,
  onClose: PropTypes.any,
  editData: PropTypes.any,
  handleSubmitForm: PropTypes.any,
   departmentData: PropTypes.any, 
   depData: PropTypes.any
}
export default DesignationModal