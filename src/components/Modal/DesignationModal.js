import React from 'react'
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Modal, Box, Typography, Button, TextField, Grid2, FormControlLabel, Switch } from '@mui/material';
import { style } from 'src/configs/generalConfig'
import CustomTextField from 'src/components/CustomTextField';
import CustomDropdown from '../CustomDropdown';

const designationSchema = yup.object().shape({
  designationId: yup.string()
    .max(20, 'Designation ID length should be <= 20')
    .matches(/^[a-zA-Z0-9]+\s*$/, 'Designation ID cannot contain any special symbols')
    .required("Designation ID can't be empty"),
  
  designationName: yup.string()
    .max(50, 'Designation Name length should be <= 50')
    .matches(/^[a-zA-Z0-9]+\s*(?:[a-zA-Z0-9]+\s*)*$/, 'Designation Name cannot contain any special symbols')
    .required("Designation Name can't be empty"),
});

const DesignationModal = ({ open, onClose, editData, handleSubmitForm,departmentData,depData}) => {
  const departmentID = departmentData?.map((item) => ({
    id: item.id,
    value: item.id,
    label: item.department_name,
}));
 const {
        control,
        handleSubmit,
        formState: { errors },
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
      
        // Update form values when editData changes
        useEffect(() => {
          if (editData) {
            reset({
              designationId: editData.designation_id || '',
              designationName: editData.designation_name || '',
              departmentId: editData.department_id || depData?.id,
            });
          }
        }, [editData, reset]);
        console.log(editData,depData)
      
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
                label='Designation ID'
                disabled={!!editData?.id}
                control={control}
                />
                </Grid2>
                <Grid2 size={6}>
                <CustomTextField
                name='designationName'
                label='Designation Name'
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

export default DesignationModal