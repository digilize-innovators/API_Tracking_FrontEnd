import React from 'react'
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Modal, Box, Typography, Button, TextField, Grid2 } from '@mui/material';
import { style } from 'src/configs/generalConfig'
import CustomTextField from 'src/components/CustomTextField';
import CustomDropdown from 'src/components/CustomDropdown';


const AreaSchema = yup.object().shape({
    areaId: yup
        .string()
        .trim()
        .max(50, 'Area ID length should be less than 51')
        .required("Area ID can't be empty"),

    areaName: yup
        .string()
        .trim()
        .max(255, 'Area name length should be less than 256')
        .required("Area name can't be empty")
        .matches(/^[a-zA-Z0-9]+\s*(?:[a-zA-Z0-9]+\s*)*$/, "Area name cannot contain any special symbols"),

    areaCategoryId: yup.string().required("Area cate req"),
    location_uuid:  yup.string().required("location  req")
    

});
function AreaModel({ open, onClose, editData, handleSubmitForm, allAreaCategory, allLocationsData }) {
    const AreaCategory = allAreaCategory?.map((item) => ({
        id: item.id,
        value: item.id,
        label: item.area_category_name,
    }));
    const LocationData = allLocationsData?.map((item) => ({
        id: item.id,
        value: item.id,
        label: item.location_name,
    }));

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm({
        resolver: yupResolver(AreaSchema),
        defaultValues: {
            areaId: editData?.id || '',
            areaName: editData?.area_name || '',
            areaCategoryId: editData?.area_category_id || '',
            location_uuid: editData?.location_uuid || '',
        },
    });
    useEffect(() => {
        if (editData) {
          reset({
            areaId: editData?.area_id || '',
            areaName: editData?.area_name || '',
            areaCategoryId: editData?.area_category_id || '', 
            location_uuid: editData?.location_uuid || '', 
           
          });
        }
      }, [editData]);

    return (
        <Modal open={open}
        
            onClose={onClose}
            role="dialog"
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description" >
            <Box sx={style}>
                <Typography variant='h4' className='my-2'>
                    {editData?.id ? 'Edit Area' : 'Add Area'}
                </Typography>
                <form onSubmit={handleSubmit(handleSubmitForm)}>
                    <Grid2 container spacing={2}>
                        <Grid2 size={6}>
                            <CustomTextField
                                name="areaId"
                                label="Area ID"
                                control={control}
                                disabled={!!editData?.id}
                            />
                        </Grid2>
                        <Grid2 size={6}>
                            <CustomTextField 
                                name="areaName"
                                label="Area Name"
                                control={control}
                            />
                        </Grid2>
                    </Grid2>
                    <Grid2 container spacing={2}>
                        <Grid2 size={6}>
                            <CustomDropdown 
                                name='areaCategoryId'
                                label='Area-category *'
                                control={control}
                                options={AreaCategory}
                                 />
                        </Grid2>
                        <Grid2 size={6}>
                            <CustomDropdown
                                name='location_uuid'
                                label='Location *'
                                control={control}
                                options={LocationData}
                             />
                        </Grid2>
                    </Grid2>

                    <Grid2 item xs={12} className="mt-3">
                        <Button variant="contained" sx={{ marginRight: 3.5 }} type="submit">
                            Save Changes
                        </Button>
                        <Button type="reset" variant="outlined" color="primary" onClick={() => reset()}>
                            Reset
                        </Button>
                        <Button variant="outlined" color="error" sx={{ marginLeft: 3.5 }} onClick={onClose}>
                            Close
                        </Button>
                    </Grid2>
                </form>
            </Box>

        </Modal>
    )
}

export default AreaModel