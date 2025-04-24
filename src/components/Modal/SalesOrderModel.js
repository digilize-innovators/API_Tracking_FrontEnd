import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { Modal, Box, Typography, Button, Grid2, TextField } from '@mui/material';
import CustomTextField from 'src/components/CustomTextField';
import { style } from 'src/configs/generalConfig';
import { useEffect, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import CustomDropdown from '../CustomDropdown';
import { useLoading } from 'src/@core/hooks/useLoading';
import { api } from 'src/utils/Rest-API';


const SalesOrderSchema = yup.object().shape({
    type: yup.string().required('Select OrderType'),
    orderNo: yup.string().required('Order No is required'),
    orderDate:yup.string().required('Select order date'),
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

const SalesOrderModel = ({ open, handleClose, editData, handleSubmitForm }) => {
    const { setIsLoading } = useLoading();
    const [locationPW, setlocationPW] = useState([])
    const [locationOth, setlocationOth] = useState([])
    const [productData, setProductData] = useState([])
    const [batchOptionsMap, setBatchOptionsMap] = useState({});
    const {
        handleSubmit,
        control,
        reset,
        formState: { errors },
        watch
    } = useForm({
        resolver: yupResolver(SalesOrderSchema),
        defaultValues: {
            type: editData.type || '',
            orderNo: editData.orderNo || '',
            orderDate:editData.orderDate||'',
            from: editData.from || '',
            to: editData.to || '',
            orders: editData.orders?.length
                ? editData.orders.map(order => ({
                    productId: order.productId || '',
                    batchId: order.batchId || '',
                    qty: order.qty || '',
                })) : [{ productId: '', batchId: '', qty: '' }],
        },
    });
    useEffect(() => {
        if (editData) {
            reset({
                type: editData.type || '',
                orderNo: editData.orderNo || '',
                orderDate:editData.orderDate||'',
                from: editData.from || '',
                to: editData.to || '',
                orders: editData.orders?.length
                    ? editData.orders.map(order => ({
                        productId: order.productId || '',
                        batchId: order.batchId || '',
                        qty: order.qty || '',
                    })) : [{ productId: '', batchId: '', qty: '' }],
            });
        }
    }, [editData]);

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'orders'
    });
    const watchedProducts = useWatch({
        control,
        name: 'orders'
    });
    const orderType = [
        { id: 'salesOrder', value: 'salesOrder', label: 'SO' },
        { id: 'salesReturn', value: 'salesReturn', label: 'SR' }]


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

    const orderTypeValue = watch('type');

    const getLocationOptions = () => {
        if (orderTypeValue === 'salesReturn') {
            return { from: locationOth, to: locationPW };
        } else if (orderTypeValue === 'salesOrder') {
            return { from: locationPW, to: locationOth };
        } else {
            return { from: [], to: [] };
        }
    };

    const locationOptions = getLocationOptions();

    useEffect(() => {
        const getLocationPW = async () => {
            try {
                setIsLoading(true)
                const res = await api(`/location/type-so-sto `, {}, 'get', true)
                setIsLoading(false)
                console.log('All locations ', res.data)
                if (res.data.success) {
                    console.log(res.data.data)

                    const data = res.data.data?.map((item) => ({
                        id: item.id,
                        value: item.id,
                        label: item.location_name,
                    }));
                    console.log("Area category in dropdown ", data);

                    setlocationPW(data);
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
        const getlocationOth = async () => {
            try {
                setIsLoading(true)
                const res = await api(`/location/type-sr`, {}, 'get', true)
                setIsLoading(false)
                console.log('All locations ', res.data)
                if (res.data.success) {
                    console.log(res.data.data)

                    const data = res.data.data?.map((item) => ({
                        id: item.id,
                        value: item.id,
                        label: item.location_name,
                    }));
                    console.log("Area category in dropdown ", data);

                    setlocationOth(data);
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
        getLocationPW()
        getlocationOth()

    }, [])

    return (
        <Modal open={open} onClose={handleClose} aria-labelledby='Purchase'>
            <Box sx={{
                ...style,
                maxHeight: '70vh',
                overflowY: 'auto',
            }}>
                <Typography variant='h4' className='my-2'>
                    {editData?.orderNo ? 'Edit Sale Order' : 'Add Sale Order'}
                </Typography>

                <form onSubmit={handleSubmit(handleSubmitForm)}>
                    <Grid2 container spacing={2}>
                        <Grid2 size={4}>
                            <CustomDropdown
                                name='type'
                                label='Order Type'
                                control={control}
                                options={orderType}
                                Grid2
                            />
                        </Grid2>
                        <Grid2 size={4}>
                            <CustomTextField
                                name='orderNo'
                                label='Order No'
                                control={control}
                            />
                        </Grid2>
                        <Grid2 size={4}>
                        <Controller
                            name="orderDate"
                            control={control}
                            rules={{ required: 'Order date is required' }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    id="Order-date"
                                    label="Order Date"
                                    type="date"
                                    InputLabelProps={{ shrink: true }}
                                    error={!!errors.orderDate}
                                    helperText={errors.orderDate?.message || ''}   
                                />
                            )}
                        />
                        </Grid2>

                    </Grid2>
                    <Grid2 container spacing={2}>
                        <Grid2 size={6}>
                            <CustomDropdown
                                name='from'
                                label='From'
                                control={control}
                                options={locationOptions.from || []}
                                Grid2
                            />


                        </Grid2>
                        <Grid2 size={6}>
                            <CustomDropdown
                                name='to'
                                label='To'
                                control={control}
                                options={locationOptions.to || []}
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

export default SalesOrderModel;