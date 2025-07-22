import { useFieldArray, useForm, Controller, useWatch } from 'react-hook-form';
import { Modal, Box, Typography, Button, Grid2, FormControl, InputLabel, MenuItem, FormHelperText, Select, TextField, Dialog, DialogActions } from '@mui/material';
import CustomTextField from 'src/components/CustomTextField';
import { style } from 'src/configs/generalConfig';
import { useEffect, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import CustomDropdown from '../CustomDropdown';
import { useLoading } from 'src/@core/hooks/useLoading';
import { api } from 'src/utils/Rest-API';
import { useAuth } from 'src/Context/AuthContext';
import { useRouter } from 'next/router';
import { IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSettings } from 'src/@core/hooks/useSettings';

const purchaseSchema = yup.object().shape({
    orderNo: yup.string().required('Order No is required').trim().min(3).max(50),
    orderDate: yup.string().required('Select orders date'),
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
                    .positive('Quantity must be greater than zero')
                    .min(1)
                    .max(10000)
            })
        )
        .min(1, 'At least one purchase item is required')
        .test('no-duplicate-batch', 'Duplicate batch not allowed', (orders) => {
            if (!orders) return true;
            const seen = new Set();
            for (let i = 0; i < orders.length; i++) {
                const key = orders[i]?.batchId;
                if (seen.has(key)) {
                    return false;
                }
                key && seen.add(key);
            }
            return true;
        }),
});

const PurchaseOrderModel = ({ open, handleClose, editData, purchaseDetail, handleSubmitForm }) => {
    const [locationFrom, setLocationFrom] = useState([])
    const [locationTo, setLocationTo] = useState({})
    const [productData, setProductData] = useState([])
    const [batchOptionsMap, setBatchOptionsMap] = useState({});
    const [editableIndex, setEditableIndex] = useState(null);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [deleteIndex, setDeleteIndex] = useState(null);
    const { settings } = useSettings();
    const { setIsLoading } = useLoading();
    const { removeAuthToken } = useAuth()
    const router = useRouter();

    const {
        handleSubmit,
        control,
        reset,
        formState: { errors },
        setValue,
        getValues
    } = useForm({
        resolver: yupResolver(purchaseSchema),
        defaultValues: {
            orderNo: editData.order_no || '',
            orderDate: editData.order_date || '',
            from: editData.from_location || '',
            to: editData.to_location || locationTo.id || '',
            orders: purchaseDetail?.length
                ? purchaseDetail.map(order => ({
                    productId: order.product_id || '',
                    batchId: order.batch_id || '',
                    qty: order.qty || '',
                })) : [{ productId: '', batchId: '', qty: '' }],
        },
    });
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'orders'
    });
    const formatDate = (date) => {
        const d = new Date(date);
        if (d instanceof Date && !isNaN(d)) {
            return d.toISOString().split('T')[0];
        }
        return '';
    };

    useEffect(() => {
        if (editData?.id) {
            reset({
                orderNo: editData.order_no || '',
                orderDate: formatDate(editData.order_date) || '',
                from: editData.from_location || '',
                to: editData.to_location || locationTo.id || '',
                orders: purchaseDetail.map(order => ({
                    productId: order.product_id|| '',
                    batchId: order.batch_id|| '',
                    qty: order.qty || '',
                })),
            });
        } else {
            reset({
                orderNo: '',
                orderDate: '',
                from: '',
                to: locationTo.id || '',
                orders: [{ productId: '', batchId: '', qty: '' }],
            });
        }
    }, [editData]);


    const watchOrders = useWatch({
        control,
        name: 'orders'
    });

    useEffect(() => {
        watchOrders?.forEach((order, index) => {
            const productId = order?.productId;
            if (!productId) return;
            
            const existing = batchOptionsMap[index];
            if (existing && existing.productId === productId) return;


            const fetchBatches = async () => {
                try {
                    const res = await api(`/batch/${productId}?onlyended=true`, {}, 'get', true);                    
                    if (res.data.success) {
                        const options = res.data.data.batches?.map(batch => ({
                            id: batch.batch_uuid,
                            value: batch.batch_uuid,
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
    }, [watchOrders]);
    

    useEffect(() => {
        const getLocation = async () => {
            try {
                setIsLoading(true)
                const res = await api(`/location/type-purchase`, {}, 'get', true)
                setIsLoading(false)
                console.log('All locations vendors', res.data)
                if (res.data.success) {
                    const data = res.data.data?.map((item) => ({
                        id: item.location_uuid,
                        value: item.location_uuid,
                        label: item.location_name,
                    }));
                    setLocationFrom(data);
                } else {
                    console.log('Error to get all designation ', res.data)
                    if (res.data.code === 401) {
                        removeAuthToken()
                        router.push('/401');
                    }
                }
            } catch (error) {
                console.log('Error in get location type-purchase ', error)
                setIsLoading(false)
            }
        }
        const getuserLocation = async () => {
            try {
                setIsLoading(true)
                const res = await api(`/user/info`, {}, 'get', true)
                setIsLoading(false);
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
                const res = await api('/product?limit=-1&history_latest=true', {}, 'get', true)
                setIsLoading(false);
                if (res.data.success) {
                    const data = res.data.data.products?.map((item) => ({
                        id: item.product_uuid,
                        value: item.product_uuid,
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
                setIsLoading(true); 
            }
        }
        getAllProducts()
        getuserLocation()
        getLocation()

    }, []);

    useEffect(() => {
        if (open) {
            const initialEditable = {};
            const totalRows = editData?.orders?.length || 1;
            for (let i = 0; i < totalRows; i++) {
                initialEditable[i] = false; // disable all by default
            }
            setEditableIndex(initialEditable);
        }
    }, [open, editData]);



    const handleDeleteOrder = async (orderId, index) => {
        try {
            setIsLoading(true);
            const res = await api(`/purchase-order/details/${orderId}`, {"orderId":editData.id}, 'delete', true);
            if (res.data.success) {
                remove(index); // remove from form UI
            } else {
                console.error('Failed to delete item:', res.data);
                // optionally show a toast or snackbar here
            }
        } catch (error) {
            console.error('Error deleting order item:', error);
        } finally {
            setIsLoading(false);
            setOpenConfirm(false);
            setDeleteIndex(null);
        }

    };

    const handleEditOrSave = async (index) => {
        const isEditing = editableIndex?.[index];
        if (isEditing) {
            const updatedItem = getValues(`orders.${index}`);
            updatedItem.orderId=editData.id
            const itemId = purchaseDetail?.[index]?.id;

            if (itemId) {
                try {
                    setIsLoading(true);
                    const res = await api(`/purchase-order/details/${itemId}`, updatedItem, 'put', true);
                    if (res.data.success) {
                        setEditableIndex(prev => ({
                            ...prev,
                            [index]: false, // Exit edit mode
                        }));
                    } else {
                        console.error('Failed to update order', res.data);
                    }
                } catch (err) {
                    console.error('Error updating order', err);
                } finally {
                    setIsLoading(false);
                }
            }
        } else {
            // Enter edit mode
            setEditableIndex(prev => ({
                ...prev,
                [index]: true,
            }));
        }
    };

    const handleReset = () => {
        reset();  // Resets the form values
        setBatchOptionsMap({}); // Also clear the batch dropdown options
    };

    return (
        <>
            <Modal open={open} onClose={handleClose} aria-labelledby='Purchase'>
                <Box sx={{
                    ...style,
                    maxHeight: '70vh',
                    overflowY: 'auto',
                }}>
                    <Typography variant='h4' className='my-2'>
                        {editData?.order_no ? 'Edit Purchase Order' : 'Add Purchase Order'}
                    </Typography>

                    <form onSubmit={handleSubmit(handleSubmitForm)}>
                        <Grid2 container spacing={2}>
                            <Grid2 size={6}>
                                <CustomTextField
                                    name='orderNo'
                                    label='Order No'
                                    control={control}
                                    disabled={!!editData?.location_id}
                                />
                            </Grid2>
                            <Grid2 size={6}>
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
                                    options={locationFrom}
                                    Grid2
                                />
                            </Grid2>
                            <Grid2 size={6}>
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

                            <Grid2 style={{  maxHeight: '300px',  overflowY: 'auto', paddingRight: 1 }}>
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
                                                disabled={!!editData.id && !!purchaseDetail?.[index]?.id && !editableIndex?.[index]}

                                            />
                                        </Grid2>
                                        <Grid2 size={3}>
                                            <CustomDropdown
                                                name={`orders.${index}.batchId`}
                                                label="Batch"
                                                control={control}
                                                options={batchOptionsMap[index]?.options || []}
                                                disabled={!!editData.id && !!purchaseDetail?.[index]?.id && !editableIndex?.[index]}

                                            />
                                        </Grid2>
                                        <Grid2 size={3.5}>
                                            <CustomTextField
                                                type='Number'
                                                name={`orders.${index}.qty`}
                                                label="Quantity"
                                                control={control}
                                                disabled={!!editData.id && !!purchaseDetail?.[index]?.id && !editableIndex?.[index]}

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
                                                <IconButton
                                                    onClick={() => {
                                                        setDeleteIndex(index);
                                                        setOpenConfirm(true);
                                                    }}
                                                    disabled={fields.length === 1}
                                                    sx={{
                                                        color: '#e53935',
                                                        '&:hover': {
                                                            color: '#c62828',
                                                        },
                                                        
                                                    }}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Box>
                                        </Grid2>
                                        <Grid2
                                            size={0.5}
                                            sx={{
                                                ml: 6,
                                                display: 'flex',
                                                alignItems: 'flex-start', // Align to the top
                                                justifyContent: 'center',
                                                // Move slightly upward

                                            }}
                                        >
                                            {purchaseDetail?.[index]?.id && (
                                                <Tooltip title={editableIndex?.[index] ? 'Save' : 'Edit'}>
                                                    <IconButton
                                                        onClick={() => handleEditOrSave(index)}
                                                        sx={{
                                                            color: settings.themeColor,

                                                            mt:1
                                                        
                                                        }}
                                                    >
                                                        {editableIndex?.[index] ? <SaveIcon /> : <EditIcon />}
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </Grid2>

                                    </Grid2>

                                 ))}
                            </Grid2>
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
                            <Button type='button' variant='outlined' onClick={handleReset} color='primary'>
                                Reset
                            </Button>
                            <Button variant='outlined' color='error' sx={{ marginLeft: 3.5 }} onClick={handleClose}>
                                Close
                            </Button>
                        </Grid2>

                    </form>
                </Box>

            </Modal>
            {openConfirm && (
                <Dialog
                    open={openConfirm}
                    onClose={() => setOpenConfirm(false)}
                    aria-labelledby="confirm-dialog"
                >
                    <Typography variant="h4" sx={{ mx: 4, mt: 8, mb: 2 }}>
                        Confirm delete item
                    </Typography>
                    <DialogActions sx={{ pb: 4, px: 4 }}>
                        <Button
                            variant='outlined'
                            onClick={() => setOpenConfirm(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant='contained'
                            color='error'
                            onClick={() => {
                                const orderItem = purchaseDetail && purchaseDetail[deleteIndex];
                                if (orderItem && orderItem.id) {
                                    handleDeleteOrder(orderItem.id, deleteIndex);
                                } else {
                                    remove(deleteIndex);
                                    setOpenConfirm(false);
                                    setDeleteIndex(null);
                                }
                            }}
                        >
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            )}

        </>
    );
};

export default PurchaseOrderModel;


