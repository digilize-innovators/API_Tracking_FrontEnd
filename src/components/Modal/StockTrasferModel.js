import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'
import {
  Modal,
  Box,
  Typography,
  Button,
  Grid2,
  TextField,
  Dialog,
  DialogActions,
  IconButton,
  Tooltip
} from '@mui/material'
import CustomTextField from 'src/components/CustomTextField'
import { style } from 'src/configs/generalConfig'
import { useEffect, useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import CustomDropdown from '../CustomDropdown'
import { useLoading } from 'src/@core/hooks/useLoading'
import { api } from 'src/utils/Rest-API'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import DeleteIcon from '@mui/icons-material/Delete'
import { useSettings } from 'src/@core/hooks/useSettings'
import PropTypes from 'prop-types'

const StockTrasferSchema = yup.object().shape({
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
          .max(10000),
           added:yup.boolean(),
           edited:yup.boolean(),
           deleted:yup.boolean()
      })
    )
    .min(1, 'At least one purchase item is required')
    .test('no-duplicate-batch', 'Duplicate batch not allowed', orders => {
      if (!orders) return true
      const seen = new Set()
      for (const order of orders) {
        const key = order?.batchId
        if (seen.has(key)) {
          return false
        }
        if (key) {
          seen.add(key)
        }
      }
      return true
    })
})

const StockTrasferModel = ({ open, handleClose, editData, stocktransferDetail, handleSubmitForm }) => {
  const { setIsLoading } = useLoading()
  const [location, setLocation] = useState([])
  const [productData, setProductData] = useState([])
  const [batchOptionsMap, setBatchOptionsMap] = useState({})
  const [editableIndex, setEditableIndex] = useState(null)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [deleteIndex, setDeleteIndex] = useState(null)
  const [deleteBatch, setDeleteBatch] = useState('')
  const [batchQuantityMap, setBatchQuantityMap] = useState({})
  const [error, setError] = useState('')
  const [deletedOrders, setDeletedOrders] = useState([]);
  
  
  const { settings } = useSettings()

  const {
    handleSubmit,
    control,
    reset,
    getValues,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(StockTrasferSchema),
    defaultValues: {
      orderNo: editData.order_no || '',
      orderDate: editData.order_date || '',
      from: editData.from_location || '',
      to: editData.to_location || '',
      orders: stocktransferDetail?.length
        ? stocktransferDetail.map(order => ({
            productId: order.product_id || '',
            batchId: order.batch_id || '',
            qty: order.qty || ''
          }))
        : []
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'orders'
  })
  const formatDate = date => {
    const d = new Date(date)
    if (d instanceof Date && !isNaN(d)) {
      return d.toISOString().split('T')[0]
    }
    return ''
  }

   useEffect(() => {
  const defaultValues = {
    orderNo: editData?.order_no || '',
    orderDate: formatDate(editData?.order_date) || '',
    from: editData?.from_location || '',
    to: editData?.to_location || '',
    orders: stocktransferDetail?.length
      ? stocktransferDetail.map(order => ({
          productId: order.product_id || '',
          batchId: order.batch_id || '',
          qty: order.qty || '',
          added: false,
          edited: false,
          deleted: false,
          orderDetailId:order.id
        }))
      : [          { productId: '', batchId: '', qty: '', added: true, edited: false, deleted: false }
]
  }

  reset(defaultValues)

}, [editData, stocktransferDetail])


useEffect(() => {
  if (fields.length === 0) return;

  const fetchAll = async () => {
    const updates = await Promise.all(
      fields.map(async f => {
        const index = fields.findIndex(x => x.id === f.id);
        const productId = getValues(`orders.${index}.productId`);
        if (!productId) return null;
        const options = await fetchBatchesForProduct(productId, f.id);
        return { fieldId: f.id, productId, options };
      })
    );

    const map = {};
    updates.forEach(u => {
      if (u) map[u.fieldId] = { productId: u.productId, options: u.options };
    });
    setBatchOptionsMap(map);
  };

  fetchAll();
}, [fields]);
  const watchedProducts = useWatch({
    control,
    name: 'orders'
  })

 
const fetchBatchesForProduct = async (productId, fieldId) => {
  try {
    const res = await api(`/batch/${productId}?onlyended=true`, {}, 'get', true)
    if (res.data.success) {
      const quantityMap = {}
      const options = (res.data.data.batches || []).map(batch => {
        quantityMap[batch.batch_uuid] = batch.quantity || 0
        return {
          id: batch.batch_uuid,
          value: batch.batch_uuid,
          label: batch.batch_no,
          quantity: batch.quantity
        }
      })

      // store quantities by fieldId (stable key)
      setBatchQuantityMap(prev => ({
        ...prev,
        [fieldId]: quantityMap
      }))

      return options
    }
    return []
  } catch (error) {
    console.error(`Error fetching batches for product ${productId}`, error)
    return []
  }
}


 const getBatchUpdates = async (products, currentBatchMap) => {
  const updates = []

  for (const [index, purchase] of products.entries()) {
    const productId = purchase?.productId
    if (!productId) continue

    const fieldId = fields[index]?.id
    if (!fieldId) continue

    const existing = currentBatchMap[fieldId]
    if (existing && existing.productId === productId) continue

    const options = await fetchBatchesForProduct(productId, fieldId)
    updates.push({ fieldId, productId, options })
  }

  return updates
}

const updateBatchOptions = updates => {
  setBatchOptionsMap(prev => ({
    ...prev,
    ...Object.fromEntries(updates.map(({ fieldId, productId, options }) => [fieldId, { productId, options }]))
  }))
}

  // Main effect with reduced nesting
useEffect(() => {
  const processProducts = async () => {
    if (!watchedProducts) return
    const updates = await getBatchUpdates(watchedProducts, batchOptionsMap)
    if (updates.length > 0) updateBatchOptions(updates)
  }
  processProducts()
}, [watchedProducts, batchOptionsMap, fields])

  useEffect(() => {
    const getLocation = async () => {
      try {
        setIsLoading(true)
        const res = await api(`/location/type-so-sto `, {}, 'get', true)
        setIsLoading(false)
        if (res.data.success) {
          const data = res.data.data?.map(item => ({
            id: item.location_uuid,
            value: item.location_uuid,
            label: item.location_name
          }))
          setLocation(data)
        } else {
          console.log('Error to get all designation ', res.data)
          if (res.data.code === 401) {
            removeAuthToken()
            router.push('/401')
          }
        }
      } catch (error) {
        console.log('Error in get location type-so-sto ', error)
        setIsLoading(false)
      }
    }
    const getAllProducts = async () => {
      try {
        setIsLoading(true)
        const res = await api('/product?limit=-1&history_latest=true', {}, 'get', true)
        setIsLoading(false)
        if (res.data.success) {
          const data = res.data.data.products?.map(item => ({
            id: item.product_uuid,
            value: item.product_uuid,
            label: item.api_name
          }))
          setProductData(data)
        } else {
          console.log('Error to get all products ', res.data)
          if (res.data.code === 401) {
            removeAuthToken()
            router.push('/401')
          }
        }
      } catch (error) {
        console.log('Error in get products ', error)
        setIsLoading(true)
      }
    }
    getAllProducts()
    getLocation()

  }, [])

  useEffect(() => {
    if (open) {
      const initialEditable = {}
      const totalRows = editData?.orders?.length || 1
      for (let i = 0; i < totalRows; i++) {
        initialEditable[i] = false // disable all by default
      }
      setEditableIndex(initialEditable)
    }
  }, [open, editData])
const handleDeleteOrder = (orderId, index) => {
  const fieldId = fields[index]?.id
  const row = getValues(`orders.${index}`)
  const hasUnsavedEdits = Object.values(editableIndex).some((isEditing) => isEditing);
  if (hasUnsavedEdits) {
    setError('Please save edited item(s).')
    setOpenConfirm(false)
    return
  }
  
  if (!row?.added) {
    setDeletedOrders(prev => [
      ...prev,
      { ...row, deleted: true, edited: false, added: false }
    ])
  }

  // remove mapping for this fieldId so other rows don't pick it up
  setBatchOptionsMap(prev => {
    const newMap = { ...prev }
    if (fieldId) delete newMap[fieldId]
    return newMap
  })
  setBatchQuantityMap(prev => {
    const newMap = { ...prev }
    if (fieldId) delete newMap[fieldId]
    return newMap
  })

  remove(index)
  setOpenConfirm(false)
  setDeleteBatch('')
  setDeleteIndex(null)
}


  useEffect(() => {
  const subscription = watch((value, { name }) => {
    if (name && name.startsWith('orders.') && name.endsWith('.productId')) {
      const index = parseInt(name.split('.')[1], 10)
      const fieldId = fields[index]?.id
      setValue(`orders.${index}.batchId`, '')
      setBatchOptionsMap(prev => {
        const newMap = { ...prev }
        if (fieldId) delete newMap[fieldId]
        return newMap
      })
      setBatchQuantityMap(prev => {
        const newMap = { ...prev }
        if (fieldId) delete newMap[fieldId]
        return newMap
      })
    }
  })
  return () => subscription.unsubscribe()
}, [watch, setValue, fields])
 const handleEditOrSave = (index) => {
  const isEditing = editableIndex?.[index];
  if (isEditing) {
    const updatedItem = getValues(`orders.${index}`);

    if (updatedItem.qty > 10000) {
      setError('qty is not more than 10000');
      return;
    }
    const isValid = validateQuantity(index, parseFloat(updatedItem.qty), updatedItem.batchId);
    if (!isValid) {
      return;
    }
      setValue(`orders.${index}.edited`, true);
        setEditableIndex(prev => ({
      ...prev,
      [index]: false
    }));
  } 
  else {
    setEditableIndex(prev => ({
      ...prev,
      [index]: true
    }));
  }
};

 
const validateQuantity = (index, quantity, batchId) => {
  const fieldId = fields[index]?.id
  const batchQtyMap = batchQuantityMap[fieldId]
  if (!batchQtyMap || !batchId || !quantity) return true

  const availableQty = batchQtyMap[batchId]
  if (availableQty && quantity > availableQty) {
    setError(`Quantity cannot exceed available batch quantity: ${availableQty}`)
    return false
  } else {
    setError('')
    return true
  }
}


  useEffect(() => {
    watchedProducts?.forEach((order, index) => {
      if (order?.qty && order?.batchId) {
        validateQuantity(index, parseFloat(order.qty), order.batchId)
      }
    })
  }, [watchedProducts, batchQuantityMap])

  const onSubmit = data => {
      const isDifferent = data.from && data.to && data.from !== data.to;

       if (!isDifferent) {
      setError("From and To cannot be same!");
      return;
    }

    const hasUnsavedEdits = Object.values(editableIndex || {}).some(val => val === true);
  if (hasUnsavedEdits) {
    setError('Please save or cancel all edits before submitting.');
    return;
  }
    let hasValidationError = false
    data.orders?.forEach((order, index) => {
      if ( order?.qty && order?.batchId && !validateQuantity(index, parseFloat(order.qty), order.batchId)) {
        hasValidationError = true
      }
    })

    if (hasValidationError) {
      return 
    }
   const payload = {
    ...data,
    orders: [...data.orders, ...deletedOrders]
  };
    setDeletedOrders([])
    handleSubmitForm(payload)
  }

 
  return (
    <>
      <Modal open={open} onClose={handleClose} aria-labelledby='StockTranfer'>
        <Box
          sx={{
            ...style,
            maxHeight: '70vh',
            overflowY: 'auto'
          }}
        >
          <Typography variant='h4' className='my-2'>
            {editData?.order_no ? 'Edit Stock Transfer Order' : 'Add Stock Transfer Order'}
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid2 container spacing={2}>
              <Grid2 size={6}>
                <CustomTextField name='orderNo' label='Order No' control={control} disabled={!!editData?.location_id} />
              </Grid2>
              <Grid2 size={6}>
                <Controller
                  name='orderDate'
                  control={control}
                  rules={{ required: 'Order date is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      id='Order-date'
                      label='Order Date'
                      type='date'
                      slotProps={{
                        inputLabel: {
                          shrink: true
                        }
                      }}
                      error={!!errors.orderDate}
                      helperText={errors.orderDate?.message || ''}
                    />
                  )}
                />
              </Grid2>
            </Grid2>
            <Grid2 container spacing={2}>
              <Grid2 size={6}>
                <CustomDropdown name='from' label='From' control={control} options={location} Grid2 />
              </Grid2>
              <Grid2 size={6}>
                <CustomDropdown name='to' label='To' control={control} options={location} />
              </Grid2>
            </Grid2>
            <Grid2 container spacing={2} direction='column'>
              <Grid2 container justifyContent='flex-end'>
                <Button
                  type='button'
                  variant='contained'
                  sx={{ marginRight: 3.5 }}
                  onClick={() => append({ productId: '', batchId: '', qty: '',added:true,edited:false,deleted:false})}
                >
                  Add
                </Button>
              </Grid2>
              <Grid2 style={{ maxHeight: '250px', overflowY: 'auto', paddingRight: 1 }}>
               <Grid2 style={{marginTop: 6 }}>
              
                {fields.map((field, index) => {
                  const existOrder = stocktransferDetail.find(item => item.batch_id === field.batchId)
                  const filteredBatchOptions = batchOptionsMap[field.id]?.options || []

                    if (watch(`orders.${index}.deleted`)) return null; 
                  return (
                    <Grid2 container spacing={2} key={field.id}>
                      <Grid2 size={0.5} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Typography style={{ display: 'flex', alignItems: 'flex-end' }}>{index + 1}</Typography>{' '}
                      </Grid2>
                      <Grid2 size={3.5}>
                        <CustomDropdown
                          name={`orders.${index}.productId`}
                          label='Product'
                          control={control}
                          options={productData}
                          disabled={!!editData.id && !!existOrder && !editableIndex?.[index]}
                        />
                      </Grid2>
                      <Grid2 size={3}>
                        <CustomDropdown
                          name={`orders.${index}.batchId`}
                          label='Batch'
                          control={control}
                          options={filteredBatchOptions}
                          disabled={!!editData.id && !!existOrder && !editableIndex?.[index]}
                        />
                      </Grid2>
                      <Grid2 size={3}>
                        <CustomTextField
                          type='Number'
                          name={`orders.${index}.qty`}
                          label='Quantity'
                          control={control}
                          disabled={!!editData.id && !!existOrder && !editableIndex?.[index]}
                        />
                      </Grid2>
                      <Grid2
                        size={0.5}
                        sx={{
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                      >
                        <Box sx={{ marginTop: 2 }}>
                          <IconButton
                            onClick={() => {
                              setDeleteBatch(existOrder)
                              setDeleteIndex(index)
                              setOpenConfirm(true)
                            }}
                            disabled={fields.length === 1}
                            sx={{
                              color: '#e53935',
                              '&:hover': {
                                color: '#c62828'
                              }
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
                          justifyContent: 'center'
                          // Move slightly upward
                        }}
                      >
                        {existOrder && (
                          <Tooltip title={editableIndex?.[index] ? 'Save' : 'Edit'}>
                            <IconButton
                              onClick={() => handleEditOrSave(index)}
                              sx={{
                                color: settings.themeColor,
                                mt: 1
                              }}
                            >
                              {editableIndex?.[index] ? <SaveIcon /> : <EditIcon />}
                            </IconButton>
                          </Tooltip>
                        )}
                      </Grid2>
                    </Grid2>
                  )
                })}
                </Grid2>
              </Grid2>
              {error.length > 0 && (
                <Grid2>
                  <Typography color='error' sx={{ mt: 2, fontSize: 14 }}>
                    {error}
                  </Typography>
                </Grid2>
              )}
              {errors.orders?.root?.message && (
                <Grid2>
                  <Typography color='error' sx={{ mt: 2, fontSize: 14 }}>
                    {errors.orders.root.message}
                  </Typography>
                </Grid2>
              )}
            </Grid2>
            <Grid2 container spacing={2} className='my-3'>
              <Button type='submit' variant='contained' sx={{ marginRight: 3.5 }}>
                Save Changes
              </Button>
              <Button type='button' variant='outlined'  onClick={() =>{
                 reset();
    setDeletedOrders([])
               } }  color='primary'>
                Reset
              </Button>
              <Button variant='outlined' color='error' sx={{ marginLeft: 3.5 }} onClick={()=>{
                setDeletedOrders([])
                handleClose()

              }}>
                Close
              </Button>
            </Grid2>
          </form>
        </Box>
      </Modal>
      {openConfirm && (
        <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)} aria-labelledby='confirm-dialog'>
          <Typography variant='h4' sx={{ mx: 4, mt: 8, mb: 2 }}>
            Confirm delete item
          </Typography>
          <DialogActions sx={{ pb: 4, px: 4 }}>
            <Button variant='outlined' onClick={() => setOpenConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant='contained'
              color='error'
              onClick={() => {
                handleDeleteOrder(deleteBatch?.id, deleteIndex)
              }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  )
}
StockTrasferModel.propTypes = {
  open: PropTypes.any,
  handleClose: PropTypes.any,
  editData: PropTypes.any,
  stocktransferDetail: PropTypes.any,
  handleSubmitForm: PropTypes.any
}
export default StockTrasferModel
