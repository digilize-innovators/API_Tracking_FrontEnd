import React, { useState, useCallback } from 'react'
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Modal, Box, Typography, Button, TextField, Grid2 } from '@mui/material';
import { style } from 'src/configs/generalConfig'
import CustomTextField from 'src/components/CustomTextField';
import CustomDropdown from 'src/components/CustomDropdown';
import { useLoading } from 'src/@core/hooks/useLoading';
import { api } from 'src/utils/Rest-API';
import { useAuth } from 'src/Context/AuthContext';
import { useRouter } from 'next/router';


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
    location_uuid: yup.string().required("location  req")
});

function AreaModel({ open, onClose, editData, handleSubmitForm }) {
    const [allAreaCategory, setAllAreaCategory] = useState([]);
    const [allLocationsData, setAllLocationsData] = useState([]);
    const { setIsLoading } = useLoading();
    const { removeAuthToken } = useAuth()
    const router = useRouter();
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

    useEffect(
        () => {
            const getAllAreaCategory = async () => {
                setIsLoading(true)
                try {
                    const res = await api(`/area-category/`, {}, 'get', true)
                    if (res.data.success) {
                        const data = res.data.data.areaCategories?.map((item) => ({
                            id: item.id,
                            value: item.id,
                            label: item.area_category_name,
                        }));
                        console.log("Area category in dropdown ", data);

                        setAllAreaCategory(data);
                    } else if (res.data.code === 401) {
                        removeAuthToken();
                        router.push('/401');
                    } else {
                        console.log('Error: Unexpected response', res.data);
                    }
                } catch (error) {
                    console.log('Error in get area categories ', error)
                } finally {
                    setIsLoading(false)
                }
            }
            getAllAreaCategory();

            const getAllLocations = async () => {
                try {
                    setIsLoading(true);
                    const res = await api('/location/', {}, 'get', true);
                    setIsLoading(false);
                    console.log('All locations ', res.data);
                    if (res.data.success) {
                        const data = res.data.data.locations?.map((item) => ({
                            id: item.id,
                            value: item.id,
                            label: item.location_name,
                        }));
                        setAllLocationsData(data);
                    } else {
                        console.log('Error to get all locations ', res.data);
                        if (res.data.code === 401) {
                            removeAuthToken();
                            router.push('/401');
                        }
                    }
                } catch (error) {
                    console.log('Error in get locations ', error);
                    setIsLoading(false);
                }
            };
            getAllLocations();
        },
        [],
    )


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
                                options={allAreaCategory}
                            />
                        </Grid2>
                        <Grid2 size={6}>
                            <CustomDropdown
                                name='location_uuid'
                                label='Location *'
                                control={control}
                                options={allLocationsData}
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