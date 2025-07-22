import { useForm } from 'react-hook-form';
import { Modal, Box, Typography, Button, Grid2 } from '@mui/material';
import CustomTextField from 'src/components/CustomTextField';
import { style } from 'src/configs/generalConfig';
import { useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import CustomDropdown from '../CustomDropdown';
import PropTypes from 'prop-types'

const locationSchema = yup.object().shape({
  locationId: yup
    .string()
    .max(50, 'Location ID length should be less than 51')
    .matches(/^[a-zA-Z0-9]+\s*$/, 'Location ID cannot contain any special symbols')
    .required("Location ID can't be empty"),

  locationType:yup.string().required('Select Location Type'),
 locationName: yup
  .string()
  .required("Location Name can't be empty")
  .max(255, 'Location name length should be less than 256')
  .test(
    'valid-location-name',
    'Location Name can only contain letters, numbers, and single spaces',
    (value) => {
      if (!value) return false;

      const validChars = /^[a-zA-Z0-9 ]+$/.test(value);  // allow alphanumerics and spaces
      const noDoubleSpaces = !/\s{2,}/.test(value);      // prevent multiple spaces
      const noEdgeSpaces = value === value.trim();       // no leading/trailing spaces

      return validChars && noDoubleSpaces && noEdgeSpaces;
    }
  ) ,

  mfgLicenceNo: yup
    .string()
    .required("Mfg licence no can't be empty")
    .max(255, 'Mfg licence no length should be less than 256')
    .matches(/^[a-zA-Z0-9]+\s*$/, 'Mfg licence no cannot contain any special symbols')
    ,

  mfgName: yup
    .string()
    .max(255, 'Mfg name length should be less than 255'),

  address: yup
    .string()
    .max(150, 'Address length should be less than 151')
});

const LocationModal = ({ open, handleClose, editData, handleSubmitForm }) => {

  const locationData=[
   {id: 'PLANT', value: 'PLANT', label: 'Plant'},
   {id: 'CFA', value: 'CFA', label: 'CFA'} ,
   {id: 'DISTRIBUTOR', value: 'DISTRIBUTOR', label: 'Distributor'},
   {id: 'DEALER', value: 'DEALER', label: 'Dealer'},
   {id: 'VENDOR', value: 'VENDOR', label: 'Vendor'},
   {id: 'WAREHOUSE', value: 'WAREHOUSE', label: 'WareHouse'},
   {id: 'CUSTOMER', value: 'CUSTOMER', label: 'Customer'}
  ]
    
  const {
    handleSubmit,
    control,
    reset,
  } = useForm({
    resolver:yupResolver(locationSchema),
    defaultValues: {
      locationId: editData?.location_id || '',
      locationType:editData?.location_type||'',
      locationName: editData?.location_name || '',
      mfgLicenceNo: editData?.mfg_licence_no || '', 
      mfgName: editData?.mfg_name || '',
      address: editData?.address || '',
    },
  });
   useEffect(() => {
    if (editData) {
      reset({
        locationId: editData?.location_id || '',
        locationType:editData?.location_type||'',
        locationName: editData?.location_name || '',
        mfgLicenceNo: editData?.mfg_licence_no || '', 
        mfgName: editData?.mfg_name || '',
        address: editData?.address || '',
      });
    }
  }, [editData]);

  return (
    <Modal open={open} onClose={handleClose} aria-labelledby='Location'>
      <Box sx={style}>
        <Typography variant='h4' className='my-2'>
          {editData?.location_id ? 'Edit Location' : 'Add Location'}
        </Typography>
        
        <form onSubmit={handleSubmit(handleSubmitForm)}>
          <Grid2 container spacing={2}>
            <Grid2 size={6}>
              <CustomTextField
                name='locationId'
                label='Location ID *'
                control={control}
                disabled={!!editData?.location_id}
              />
            </Grid2>
            <Grid2 size={6}>
              <CustomDropdown
                              name='locationType'
                              label='Location Type *'
                              control={control}
                              options={locationData}
                                />
              
            
            </Grid2>
          </Grid2>

          <Grid2 container spacing={2}>
            <Grid2 size={6}>
            <CustomTextField
                name='locationName'
                label='Location Name *'
                control={control}
              />
             
            </Grid2>
            <Grid2 size={6}>
            <CustomTextField
                name='mfgLicenceNo'
                label='Mfg Licence No. *'
                control={control}
              />
            
            </Grid2>
          </Grid2>

          <Grid2 container spacing={2}>
            <Grid2 size={6}>
            <CustomTextField name='mfgName' label='Mfg Name' control={control} />
            
            </Grid2>
            <Grid2 size={6}>
            <CustomTextField name='address' label='Address' control={control} />
            </Grid2>
          </Grid2>



          <Grid2 container spacing={2} className='my-3'>
            <Button type='submit' variant='contained' sx={{ marginRight: 3.5 }}>
              Save Changes
            </Button>
            <Button type='button' variant='outlined' onClick={()=>reset()} color='primary'>
              Reset
            </Button>
            <Button variant='outlined' color='error' sx={{ marginLeft: 3.5 }} onClick={handleClose}>
              Close
            </Button>
          </Grid2>
        </form>
      </Box>
    </Modal>
  );
};


LocationModal.propTypes={
  open:PropTypes.any,
  handleClose:PropTypes.any,
  editData:PropTypes.any,
  handleSubmitForm:PropTypes.any
}
export default LocationModal;