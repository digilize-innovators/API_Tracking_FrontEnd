import React, { useState,useEffect } from 'react'
import { useForm } from 'react-hook-form';
import { Modal, Box, Typography, Button, Grid2 } from '@mui/material';
import { style } from 'src/configs/generalConfig'
import CustomDropdown from 'src/components/CustomDropdown';
import { useLoading } from 'src/@core/hooks/useLoading';
import { useAuth } from 'src/Context/AuthContext';
import { api } from 'src/utils/Rest-API';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';




function StockReconciliation({ open, onClose,  handleSubmitForm }) {
    const [allLocationsData, setAllLocationsData] = useState([]);
    const { setIsLoading } = useLoading();
    const { removeAuthToken } = useAuth()
    const router = useRouter();
    const {
        control,
        handleSubmit,
        reset
    } = useForm({
        defaultValues: {
            location_uuid:  '',
        },
    });
   

    useEffect(
        () => {
           

            const getAllLocations = async () => {
                try {
                    setIsLoading(true);
                    const res = await api('/location?limit=-1', {}, 'get', true);
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
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description" >
            <Box sx={{...style,width:'30%'}}>
            <Typography variant='h4' className='my-2'>
                   Select Location
                </Typography>
                <form onSubmit={handleSubmit(handleSubmitForm)}>
                                      <Grid2 spacing={2}>
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



StockReconciliation.propTypes={
    open:PropTypes.any,
     onClose:PropTypes.any, 
      handleSubmitForm:PropTypes.any
}
export default StockReconciliation