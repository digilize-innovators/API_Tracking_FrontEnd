import * as yup from 'yup';
import { useEffect } from 'react'
import { Modal, Box, Typography, Button, Grid2, TextField } from '@mui/material';
import { style } from 'src/configs/generalConfig';
import CustomTextField from 'src/components/CustomTextField';
import CustomDropdown from 'src/components/CustomDropdown';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller } from 'react-hook-form';

const validationSchema = yup.object().shape({
    batchNo: yup.string()
        .required("Batch number can't be empty")
        .min(5, 'Batch number should not be less than 5')
        .max(8, 'Batch number should not be greater than 8')
        .matches(/^[a-zA-Z0-9]+\s*(?:[a-zA-Z0-9]+\s*)*$/, 'Batch number cannot contain special symbols'),

    productId: yup.string()
        .required('Select product'),

    locationId: yup.string()
        .required('Select location'),

    qty: yup.number()
        .required('Quantity can not be empty')
        .positive('Quantity should be greater than 0')
        .integer('Quantity should be a whole number')
        .typeError("Quantity Number must be a valid number"),

    manufacturingDate: yup.string()
        .required('Please select manufacturing date'),

    expiryDate: yup
        .string()
        .required('Please select Expiry Date')
        .test('is-expiry-greater', 'Expiry date should be greater than manufacturing date', function (value) {
            const { manufacturingDate } = this.parent; 
            if (!value || !manufacturingDate) return true; 
            return new Date(value) > new Date(manufacturingDate); 
        })
});


function BatchModal({ openModal, handleCloseModal, editData, allProductData, allLocationData, handleSubmitForm }) {
    
    const { control, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            productId: '',
            batchNo: '',
            qty: 0,
            manufacturingDate: '',
            expiryDate: '',
        }
    })

    const ProductData = allProductData?.map((item) => ({
        id: item.id,
        value: item.id,
        label: item.product_name,
    }));

    const LocationData = allLocationData?.map((item) => ({
        id: item.id,
        value: item.id,
        label: item.location_name,
    }));

    useEffect(() => {
        const formatDate = (date) => {
            const d = new Date(date);
            if (d instanceof Date && !isNaN(d)) {
                return d.toISOString().split('T')[0];
            }
            return ''; 
        };
        if (editData) {
            console.log(editData)
            reset({
                batchNo: editData?.batch_no || '',
                productId: editData?.productHistory?.product_uuid || '',
                locationId: editData?.location?.id || '',
                manufacturingDate: formatDate(editData?.manufacturing_date) || '',
                expiryDate: formatDate(editData?.expiry_date) || '',
                qty: editData?.qty || ''
            });
        }
        if(!openModal){
            reset({
                batchNo:'',
                productId:'',
                locationId:'',
                manufacturingDate:'',
                expiryDate:'',
                qty:''
            })
        }
    }, [editData,openModal]);
console.log("editData",editData);

    return (<Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
        data-testid="modal"
        role='dialog'
    >
        <Box sx={style}>
            <Typography variant='h4' className='my-2'>
                {editData?.id ? 'Edit Batch' : 'Add Batch'}
            </Typography>
            <form onSubmit={handleSubmit(handleSubmitForm)}>
                <Grid2 container spacing={2} sx={{ margin: "0.5rem 0rem" }}>
                    <Grid2 size={6}>
                        <CustomDropdown
                            name='productId'
                            label='Product *'
                            control={control}
                            options={ProductData}
                            disabled={!!editData?.productHistory?.product_uuid} 
                        />

                    </Grid2>
                    <Grid2 size={6}>
                        <CustomDropdown
                            name='locationId'
                            label='Location *'
                            control={control}
                            options={LocationData}
                            disabled={!!editData?.location?.id} 
                        />
                    </Grid2>
                </Grid2>

                <Grid2 container spacing={2} sx={{ margin: "0.5rem 0rem" }}>
                    <Grid2 size={6}>
                        <CustomTextField label='Batch No.' name={"batchNo"} control={control}/>
                    </Grid2>
                    <Grid2 size={6}>
                        <CustomTextField name='qty' label='Quantity (Basis Primary Level)'control={control} />
                    </Grid2>
                </Grid2>

                <Grid2 container spacing={2} sx={{ margin: "0.5rem 0rem" }}>
                    <Grid2 size={6}>
                        <Controller
                            name="manufacturingDate"
                            control={control}
                            rules={{ required: 'Manufacturing date is required' }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    id="manufacturing-date"
                                    label="Manufacturing Date"
                                    type="date"
                                    InputLabelProps={{ shrink: true }}
                                    error={!!errors.manufacturingDate}
                                    helperText={errors.manufacturingDate?.message || ''}
                                />
                            )}
                        />
                    </Grid2>
                    <Grid2 size={6}>
                        <Controller
                            name="expiryDate"
                            control={control}
                            rules={{ required: 'Expiry date is required' }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    id="expiry-date"
                                    label="Expiry Date"
                                    type="date"
                                    InputLabelProps={{ shrink: true }}
                                    error={!!errors.expiryDate}
                                    helperText={errors.expiryDate?.message || ''}   
                                />
                            )}
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
                    <Button variant='outlined' color='error' sx={{ marginLeft: 3.5 }} onClick={handleCloseModal}>
                        Close
                    </Button>
                </Grid2>
            </form>

        </Box>
    </Modal>)
}


export default BatchModal