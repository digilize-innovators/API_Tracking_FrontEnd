import { useFieldArray, useForm, Controller, useWatch } from 'react-hook-form';
import { Modal, Box, Typography, Button, Grid2, FormControl, InputLabel, MenuItem, FormHelperText, Select } from '@mui/material';
import CustomTextField from 'src/components/CustomTextField';
import { style } from 'src/configs/generalConfig';
import { useEffect, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import CustomDropdown from '../CustomDropdown';
import { useLoading } from 'src/@core/hooks/useLoading';
import { api } from 'src/utils/Rest-API';

const purchaseSchema = yup.object().shape({
    orderNo: yup.string().required('Order No is required'),
    from: yup.string().required('From location is required'),
    to: yup.string().required('To location is required'),
    orders: yup
        .array()
        .of(
            yup.object().shape({
                productId: yup.string().required('Product is required'),
                batchId: yup.string().required('Batch is required'),
                qty: yup
                    .number()
                    .required('Quantity is required')
                    .typeError('Quantity must be a number')
                    .positive('Quantity must be greater than zero'),
            })
        )
        .min(1, 'At least one purchase item is required')
        .test('no-duplicate-batch', 'Duplicate batch not allowed', (orders) => {
            if (!orders) return true;
            const seen = new Set();
            for (let i = 0; i < orders.length; i++) {
                const key = `${orders[i]?.productId}-${orders[i]?.batchId}`;
                if (seen.has(key)) {
                    return false;
                }
                seen.add(key);
            }
            return true;
        }),
});

const PurchaseOrderModel = ({ open, handleClose, editData, handleSubmitForm }) => {
    const { setIsLoading } = useLoading();
    const [locationFrom, setLocationFrom] = useState([])
    const [locationTo, setLocationTo] = useState({})
    const [productData, setProductData] = useState([])
    const [batchOptionsMap, setBatchOptionsMap] = useState({});



    const {
        handleSubmit,
        control,
        reset,
        trigger,
        formState: { errors },
        setValue,


    } = useForm({
        mode: 'onChange',
        resolver: yupResolver(purchaseSchema),
        defaultValues: {
            orderNo: editData.orderNo || '',
            from: editData.from || '',
            to: editData.to || locationTo.id || '',
            orders: editData.orders?.length
                ? editData.orders.map(order => ({
                    productId: order.productId || '',
                    batchId: order.batchId || '',
                    qty: order.qty || '',
                })) : [{ productId: '', batchId: '', qty: '' }],
        },
    });
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'orders'
    });
    useEffect(() => {
        if (editData) {
            reset({
                orderNo: editData.orderNo || '',
                from: editData.from || '',
                to: editData.to || locationTo.id || '',
                orders: editData.orders?.length
                    ? editData.orders.map(order => ({
                        productId: order.productId || '',
                        batchId: order.batchId || '',
                        qty: order.qty || '',
                    })) : [{ productId: '', batchId: '', qty: '' }],
            });
        }
    }, [editData]);
    const watchedProducts = useWatch({
        control,
        name: 'orders'
    });
    console.log("watchedProducts", watchedProducts)
    useEffect(() => {
        watchedProducts?.forEach((purchase, index) => {
            const productId = purchase?.productId;
            console.log(productId)
            if (!productId) return;
            const existing = batchOptionsMap[index];
            if (existing && existing.productId === productId) return;


            const fetchBatches = async () => {
                try {
                    const res = await api(`/batch/getbatchesbyproduct/${productId}`, {}, 'get', true);
                    console.log('batches', res.data.data)
                    if (res.data.success) {
                        const options = res.data.data.map(batch => ({
                            id: batch.id,
                            value: batch.id,
                            label: batch.batch_no,
                        }));

                        setBatchOptionsMap(prev => ({
                            ...prev,
                            [index]: {
                                productId,
                                options,
                            }
                        }));
                    }
                } catch (error) {
                    console.error(`Error fetching batches for product ${productId}`, error);
                }
            };

            fetchBatches();
        });
    }, [watchedProducts]);


    useEffect(() => {
        const getLocation = async () => {
            try {
                setIsLoading(true)
                const res = await api(`/location/type-purchase`, {}, 'get', true)
                setIsLoading(false)
                console.log('All locations vendors', res.data)
                if (res.data.success) {
                    console.log(res.data.data)

                    const data = res.data.data?.map((item) => ({
                        id: item.id,
                        value: item.id,
                        label: item.location_name,
                    }));
                    console.log("Area category in dropdown ", data);

                    setLocationFrom(data);
                } else {
                    console.log('Error to get all designation ', res.data)
                    if (res.data.code === 401) {
                        removeAuthToken()
                        router.push('/401');
                    }
                }
            } catch (error) {
                console.log('Error in get designation ', error)
                setIsLoading(false)
            }
        }
        const getuserLocation = async () => {
            try {
                setIsLoading(true)
                const res = await api(`/user/info`, {}, 'get', true)
                setIsLoading(false)
                console.log('All locations ', res.data)
                if (res.data.success) {
                    const location = res.data.data.location;
                    const mapped = {
                        id: location.id,
                        value: location.id,
                        label: location.location_name
                    };

                    setLocationTo(mapped);
                    setValue('to', mapped.id, { shouldValidate: true, shouldDirty: true });

                } else {
                    console.log('Error to get all userLocation ', res.data)
                    if (res.data.code === 401) {
                        removeAuthToken()
                        router.push('/401');
                    }
                }
            } catch (error) {
                console.log('Error in get userLocation ', error)
                setIsLoading(false)
            }
        }

        const getAllProducts = async () => {
            try {
                setIsLoading(true);
                const res = await api('/product?limit=-1', {}, 'get', true)
                setIsLoading(false);
                if (res.data.success) {
                    const data = res.data.data.products?.map((item) => ({
                        id: item.id,
                        value: item.id,
                        label: item.product_name,
                    }))
                    setProductData(data)

                } else {
                    console.log('Error to get all products ', res.data)
                    if (res.data.code === 401) {
                        removeAuthToken();
                        router.push('/401');
                    }
                }
            } catch (error) {
                console.log('Error in get products ', error)
                setIsLoading(true); ``
            }
        }
        getAllProducts()
        getuserLocation()
        getLocation()

    }, [])
    console.log(errors.orders?.root?.message)
    return (
        <Modal open={open} onClose={handleClose} aria-labelledby='Purchase'>
            <Box sx={{
                ...style,
                maxHeight: '70vh',
                overflowY: 'auto',
            }}>
                <Typography variant='h4' className='my-2'>
                    {editData?.orderNo ? 'Edit Purchase Order' : 'Add Purchase Order'}
                </Typography>

                <form onSubmit={handleSubmit(handleSubmitForm)}>
                    <Grid2 container spacing={2}>
                        <Grid2 size={4}>
                            <CustomTextField
                                name='orderNo'
                                label='Order No'
                                control={control}
                                disabled={!!editData?.location_id}
                            />
                        </Grid2>
                        <Grid2 size={4}>
                            <CustomDropdown
                                name='from'
                                label='From'
                                control={control}
                                options={locationFrom}
                                Grid2
                            />


                        </Grid2>
                        <Grid2 size={4}>


                            <Controller
                                name='to'
                                control={control}
                                defaultValue={locationTo?.id}
                                render={({ field, fieldState: { error } }) => (
                                    <FormControl fullWidth error={!!error}>
                                        <InputLabel id='to-label'>To</InputLabel>
                                        <Select
                                            {...field}
                                            labelId='to-label'
                                            label='To'
                                            value={locationTo?.id}
                                            disabled
                                        >
                                            <MenuItem value={locationTo?.id}>
                                                {locationTo?.label}
                                            </MenuItem>
                                        </Select>
                                        <FormHelperText>{error?.message}</FormHelperText>
                                    </FormControl>
                                )}
                            />


                        </Grid2>
                    </Grid2>

                    <Grid2 container spacing={2} direction="column">
                        <Grid2 container justifyContent="flex-end" >
                            <Button type='button' variant='contained' sx={{ marginRight: 3.5 }} onClick={() =>
                                append({ productId: '', batchId: '', qty: '' })
                            }>
                                Add
                            </Button>

                        </Grid2>

                        {fields.map((field, index) => (
                            <Grid2 container spacing={2} key={field.id}>
                                <Grid2 size={0.5} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <Typography style={{ display: 'flex', alignItems: 'flex-end' }}>
                                        {index + 1}
                                    </Typography>    </Grid2>
                                <Grid2 size={3.5}>
                                    <CustomDropdown
                                        name={`orders.${index}.productId`}
                                        label="Product"
                                        control={control}
                                        options={productData}
                                    />
                                </Grid2>
                                <Grid2 size={3.5}>
                                    <CustomDropdown
                                        name={`orders.${index}.batchId`}
                                        label="Batch"
                                        control={control}
                                        options={batchOptionsMap[index]?.options || []}
                                    />
                                </Grid2>
                                <Grid2 size={3.5}>
                                    <CustomTextField
                                        type='Number'
                                        name={`orders.${index}.qty`}
                                        label="Quantity"
                                        control={control}
                                    />
                                </Grid2>
                                <Grid2
                                    size={0.5}
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}
                                >
                                    <Box sx={{ marginTop: 2 }}>
                                        <Button
                                            type="button"
                                            variant="contained"
                                            onClick={() => remove(index)}
                                            disabled={fields.length === 1}
                                            sx={{
                                                minWidth: 0,
                                                width: 36,
                                                height: 36,
                                                minHeight: 0,
                                                padding: 0,
                                                backgroundColor: '#e53935',
                                                '&:hover': {
                                                    backgroundColor: '#c62828',
                                                },
                                            }}
                                        >
                                            -
                                        </Button>
                                    </Box>
                                </Grid2>

                            </Grid2>

                        ))}
                        {errors.orders?.root?.message && (
                            <Grid2>
                                <Typography color="error" sx={{ mt: 2, fontSize: 14 }}>
                                    {errors.orders.root.message}
                                </Typography>
                            </Grid2>
                        )}

                    </Grid2>



                    <Grid2 container spacing={2} className='my-3'>
                        <Button type='submit' variant='contained' sx={{ marginRight: 3.5 }}>
                            Save Changes
                        </Button>
                        <Button type='button' variant='outlined' onClick={() => reset()} color='primary'>
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

export default PurchaseOrderModel;