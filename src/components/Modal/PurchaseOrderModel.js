
import { useFieldArray, useForm } from 'react-hook-form';
import { Modal, Box, Typography, Button, Grid2 } from '@mui/material';
import CustomTextField from 'src/components/CustomTextField';
import { style } from 'src/configs/generalConfig';
import { useEffect, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import CustomDropdown from '../CustomDropdown';
import { useLoading } from 'src/@core/hooks/useLoading';
import { api } from 'src/utils/Rest-API';
import { useWatch } from 'react-hook-form';


const purchaseSchema = yup.object().shape({
    orderNo: yup.string().required('Order No is required'),
    from: yup.string().required('From location is required'),
    to: yup.string().required('To location is required'),
    addPurchase: yup
      .array()
      .of(
        yup.object().shape({
          product: yup.mixed().required('Product is required'),
          batch: yup.mixed().required('Batch is required'),
          qty: yup
            .number()
            .typeError('Quantity must be a number')
            .required('Quantity is required')
            .positive('Quantity must be greater than zero'),
        })
      )
      .min(1, 'At least one purchase item is required'),
  });

const PurchaseOrderModel = ({ open, handleClose, editData, handleSubmitForm }) => {
    const { setIsLoading } = useLoading();
    const [locationFrom, setLocationFrom] = useState([])
    const [locationTo, setLocationTo] = useState([])
    const [productData, setProductData] = useState([])
    const [batchOptionsMap, setBatchOptionsMap] = useState({});



    const {
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(purchaseSchema),
        defaultValues: {
          orderNo:editData.orderNo ||'',
          from:editData.from|| '',
          to:editData.to|| '',
          orders:editData.orders?.length
          ? editData.orders.map(order => ({
              productId: order.productId || '',
              batchId: order.batchId || '',
              qty: order.qty || '',
            })): [{ productId: '', batchId: '', qty: '' }],
        },
    });
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'orders'
    });
    useEffect(() => {
        if (editData) {
            reset({
                orderNo:editData.orderNo ||'',
                from:editData.from|| '',
                to:editData.to|| '',
                orders:editData.orders?.length
                ? editData.orders.map(order => ({
                    productId: order.productId || '',
                    batchId: order.batchId || '',
                    qty: order.qty || '',
                  })): [{ productId: '', batchId: '', qty: '' }],
            });
        }
    }, [editData]);
    const watchedProducts = useWatch({
        control,
        name: 'orders'
      });
      console.log("watchedProducts",watchedProducts)
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
                    console.log('batches',res.data.data)
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
                    console.log(res.data.data.location)

                    setLocationTo([{
                        id: res.data.data.location.id,
                        value: res.data.data.location.id,
                        label: res.data.data.location.location_name
                    }])


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
                    // setAllProductData(res.data.data.products)
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
                            <CustomDropdown
                                name='to'
                                label='To'
                                control={control}
                                options={locationTo}
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
        <Grid2 size={4}>
            <CustomDropdown
                name={`orders.${index}.productId`}
                label="Product"
                control={control}
                options={productData}
            />
        </Grid2>
        <Grid2 size={4}>
            <CustomDropdown
                name={`orders.${index}.batchId`}
                label="batch"
                control={control}
                options={batchOptionsMap[index]?.options || []}
            />
        </Grid2>
        <Grid2 size={4}>
            <CustomTextField
                name={`orders.${index}.qty`}
                label="Quantity"
                control={control}
            />
        </Grid2>
    </Grid2>
))}

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