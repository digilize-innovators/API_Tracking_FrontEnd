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

const SalesOrderSchema = yup.object().shape({
  type: yup.string().required('Select OrderType'),
  orderNo: yup.string().required('Order No is required').trim().min(3).max(50),
  orderDate: yup.string().required('Select order date'),
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

const SalesOrderModel = ({ open, handleClose, editData, saleDetail, handleSubmitForm }) => {
  const { setIsLoading } = useLoading()
  const [locationSoSto, setLocationSoSto] = useState([])
  const [locationSr, setLocationSr] = useState([])
  const [productData, setProductData] = useState([])
  const [batchOptionsMap, setBatchOptionsMap] = useState({})
  const [editableIndex, setEditableIndex] = useState(null)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [error,setError]=useState('')
  const [deleteBatch, setDeleteBatch] = useState('')
  const [deleteIndex,setDeleteIndex]=useState(null)
  const [initialHeaderValues, setInitialHeaderValues] = useState(null)
  const { settings } = useSettings()

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
    getValues,
    watch,
    setValue
  } = useForm({
    resolver: yupResolver(SalesOrderSchema),
    defaultValues: {
      type: '',
      orderNo: '',
      orderDate: '',
      from: '',
      to: '',
      orders: [{ productId: '', batchId: '', qty: '' }]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'orders'
  })

  const watchedProducts = useWatch({
    control,
    name: 'orders'
  })

  const orderType = [
    { id: 'SALES_ORDER', value: 'SALES_ORDER', label: 'SO' },
    { id: 'SALES_RETURN', value: 'SALES_RETURN', label: 'SR' }
  ]

  const formatDate = date => {
    const d = new Date(date)
    if (d instanceof Date && !isNaN(d)) {
      return d.toISOString().split('T')[0]
    }
    return ''
  }

  const fetchBatchesForProduct = async (productId, index) => {
    try {
      const res = await api(`/batch/${productId}?onlyended=true`, {}, 'get', true)
      if (res.data.success) {
        return res.data.data.batches?.map(batch => ({
          id: batch.batch_uuid,
          value: batch.batch_uuid,
          label: batch.batch_no
        }))
      }
      return []
    } catch (error) {
      console.error(`Error fetching batches for product ${productId}`, error)
      return []
    }
  }

  useEffect(() => {
    const defaultValues = {
      type: editData.order_type || '',
      orderNo: editData.order_no || '',
      orderDate: formatDate(editData.order_date) || '',
      from: editData.from_location || '',
      to: editData.to_location || '',
      orders: saleDetail?.length
        ? saleDetail.map(order => ({
            productId: order.product_id || '',
            batchId: order.batch_id || '',
            qty: order.qty || ''
          }))
        : [{ productId: '', batchId: '', qty: '' }]
    }

    if (editData?.id) {
      setInitialHeaderValues({
        type: editData.order_type || '',
        orderNo: editData.order_no || '',
        orderDate: formatDate(editData.order_date) || '',
        from: editData.from_location || '',
        to: editData.to_location || ''
      })
      reset(defaultValues)

      // Fetch batch options for initial values
      const newBatchOptionsMap = {}
      defaultValues.orders.forEach(async (order, index) => {
        if (order.productId) {
          const options = await fetchBatchesForProduct(order.productId, index)
          newBatchOptionsMap[index] = {
            productId: order.productId,
            options
          }
          setBatchOptionsMap(prev => ({ ...prev, ...newBatchOptionsMap }))
        }
      })
    } else {
      setInitialHeaderValues({
        type: '',
        orderNo: '',
        orderDate: '',
        from: '',
        to: ''
      })
      reset({
        type: '',
        orderNo: '',
        orderDate: '',
        from: '',
        to: '',
        orders: [{ productId: '', batchId: '', qty: '' }]
      })
    }
  }, [editData, saleDetail])

  useEffect(() => {
    fetchAllInitialData()
  }, [])

  const fetchAllInitialData = async () => {
    try {
      setIsLoading(true)
      await Promise.all([fetchProducts(), fetchLocationSoSto(), fetchLocationSr()])
    } catch (error) {
      console.error('Error fetching initial data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const res = await api('/product?limit=-1&history_latest=true', {}, 'get', true)
      if (res.data.success) {
        const products = res.data.data.products?.map(item => ({
          id: item.product_uuid,
          value: item.product_uuid,
          label: item.product_name
        }))
        setProductData(products)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const fetchLocationSoSto = async () => {
    try {
      const res = await api(`/location/type-so-sto`, {}, 'get', true)
      if (res.data.success) {
        const locations = res.data.data?.map(item => ({
          id: item.location_uuid,
          value: item.location_uuid,
          label: item.location_name
        }))
        setLocationSoSto(locations)
      }
    } catch (error) {
      console.error('Error fetching location SO-STO:', error)
    }
  }

  const fetchLocationSr = async () => {
    try {
      const res = await api(`/location/type-sr`, {}, 'get', true)
      if (res.data.success) {
        const locations = res.data.data?.map(item => ({
          id: item.location_uuid,
          value: item.location_uuid,
          label: item.location_name
        }))
        setLocationSr(locations)
      }
    } catch (error) {
      console.error('Error fetching location SR:', error)
    }
  }

  useEffect(() => {
    const processProducts = async () => {
      if (!watchedProducts) return

      const updates = await getBatchUpdates(watchedProducts, batchOptionsMap)
      if (updates.length > 0) {
        updateBatchOptions(updates)
      }
    }

    processProducts()
  }, [watchedProducts])

  const getBatchUpdates = async (products, currentBatchMap) => {
    const updates = []

    for (const [index, purchase] of products.entries()) {
      const productId = purchase?.productId
      if (!productId) continue

      const existing = currentBatchMap[index]
      if (existing && existing.productId === productId) continue

      const options = await fetchBatchesForProduct(productId, index)
      updates.push({ index, productId, options })
    }

    return updates
  }

  const updateBatchOptions = updates => {
    setBatchOptionsMap(prev => ({
      ...prev,
      ...Object.fromEntries(updates.map(({ index, productId, options }) => [index, { productId, options }]))
    }))
  }

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name && name.startsWith('orders.') && name.endsWith('.productId')) {
        const index = parseInt(name.split('.')[1])
        setValue(`orders.${index}.batchId`, '')
        setBatchOptionsMap(prev => {
          const newMap = { ...prev }
          delete newMap[index]
          return newMap
        })
      }
    })
    return () => subscription.unsubscribe()
  }, [watch, setValue])

  const orderTypeValue = watch('type')

  const getLocationOptions = () => {
    if (orderTypeValue === 'SALES_RETURN') {
      return { from: locationSr, to: locationSoSto }
    } else if (orderTypeValue === 'SALES_ORDER') {
      return { from: locationSoSto, to: locationSr }
    } else {
      return { from: [], to: [] }
    }
  }

  const locationOptions = getLocationOptions()

  useEffect(() => {
    if (open) {
      const initialEditable = {}
      const totalRows = editData?.orders?.length || 1
      for (let i = 0; i < totalRows; i++) {
        initialEditable[i] = false
      }
      setEditableIndex(initialEditable)
    }
  }, [open, editData])

  const handleDeleteOrder = async (orderId, index) => {
    try {
      setIsLoading(true)
      if (orderId) {
        const res = await api(`/sales-order/details/${orderId}`, { orderId: editData.id }, 'delete', true)
        if (!res.data.success) {
          console.error('Failed to delete item:', res.data)
          return
        }
      }
      remove(index)
      setEditableIndex(prev => {
        const newState = { ...prev }
        delete newState[index]
        const updatedState = {}
        Object.keys(newState).forEach(key => {
          const numKey = parseInt(key)
          if (numKey > index) {
            updatedState[numKey - 1] = newState[numKey]
          } else if (numKey < index) {
            updatedState[numKey] = newState[numKey]
          }
        })
        return updatedState
      })
    } catch (error) {
      console.error('Error deleting order item:', error)
    } finally {
      setIsLoading(false)
      setOpenConfirm(false)
      setDeleteBatch('')
      setDeleteIndex(null)
    }
  }

  const handleEditOrSave = async index => {
    const isEditing = editableIndex?.[index]
    if (isEditing) {
      const updatedItem = getValues(`orders.${index}`)
      updatedItem.orderId = editData.id
      const itemId = saleDetail?.[index]?.id

      if (itemId) {
        try {
          setIsLoading(true)
          if(updatedItem.qty>10000)
          {
            setError('qty is not more than 10000') 
            return
          }
          setError('')
          const res = await api(`/sales-order/details/${itemId}`, updatedItem, 'put', true)
          if (res.data.success) {
            setEditableIndex(prev => ({
              ...prev,
              [index]: false
            }))
          }
        } catch (err) {
          console.error('Error updating order', err)
        } finally {
          setIsLoading(false)
        }
      }
    } else {
      setEditableIndex(prev => ({
        ...prev,
        [index]: true
      }))
    }
  }

  const handleReset = () => {
    if (initialHeaderValues) {
      // Get current order details
      const currentOrders = getValues('orders')

      // Reset only the header fields while preserving orders
      reset({
        ...initialHeaderValues,
        orders: currentOrders
      })

      // Reset edit mode for all rows
      const newEditableIndex = {}
      currentOrders.forEach((_, index) => {
        newEditableIndex[index] = false
      })
      setEditableIndex(newEditableIndex)
    }
  }

  return (
    <>
      <Modal open={open} onClose={handleClose} aria-labelledby='Purchase'>
        <Box
          sx={{
            ...style,
            maxHeight: '70vh',
            overflowY: 'auto'
          }}
        >
          <Typography variant='h4' className='my-2'>
            {editData?.order_no ? 'Edit Sale Order' : 'Add Sale Order'}
          </Typography>

          <form onSubmit={handleSubmit(handleSubmitForm)}>
            <Grid2 container spacing={2}>
              <Grid2 size={4}>
                <CustomDropdown
                  name='type'
                  label='Order Type'
                  control={control}
                  options={orderType}
                  onChange={event => {
                    const selectedValue = event.target.value
                    setValue('type', selectedValue)
                    setValue('from', '')
                    setValue('to', '')
                  }}
                />
              </Grid2>
              <Grid2 size={4}>
                <CustomTextField name='orderNo' label='Order No' control={control} />
              </Grid2>
              <Grid2 size={4}>
                <Controller
                  name='orderDate'
                  control={control}
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
                      }}}
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
                  options={locationOptions?.from || []}
                  Grid2
                />
              </Grid2>
              <Grid2 size={6}>
                <CustomDropdown name='to' label='To' control={control} options={locationOptions?.to || []} />
              </Grid2>
            </Grid2>

            <Grid2 container spacing={2} direction='column'>
              <Grid2 container justifyContent='flex-end'>
                <Button
                  type='button'
                  variant='contained'
                  sx={{ marginRight: 3.5 }}
                  onClick={() => append({productId: '', batchId: '', qty: '' })}
                >
                  Add
                </Button>
              </Grid2>
              <Grid2 style={{ maxHeight: '250px', overflowY: 'auto', paddingRight: 1 }}>
                <Grid2 style={{marginTop: 6 }}>
                {fields.map((field, index)=> {
                  const existOrder=saleDetail.find(item=>item.batch_id===field?.batchId)
                  return(
                  <Grid2 container spacing={2} key={field.id}>
                    <Grid2 size={0.5} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <Typography style={{ display: 'flex', alignItems: 'flex-end' }}>{index + 1}</Typography>
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
                        options={batchOptionsMap[index]?.options || []}
                        disabled={!!editData.id && !!existOrder && !editableIndex?.[index]}
                      />
                    </Grid2>
                    <Grid2 size={3.5}>
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
                            setDeleteIndex(index)
                            setDeleteBatch(existOrder)
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
                        alignItems: 'flex-start',
                        justifyContent: 'center'
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
                  
                )})}
                </Grid2>
              </Grid2>
              {
                      error.length>0 && (
                         <Grid2>
                  <Typography color='error' sx={{ mt: 2, fontSize: 14 }}>
                    {error}
                  </Typography>
                </Grid2>
                      )
                    }
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
              <Button
                type='button'
                variant='outlined'
                onClick={handleReset}
                color='primary'
                disabled={!initialHeaderValues}
              >
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

SalesOrderModel.propTypes = {
  open: PropTypes.any,
  handleClose: PropTypes.any,
  editData: PropTypes.any,
  saleDetail: PropTypes.any,
  handleSubmitForm: PropTypes.any
}

export default SalesOrderModel
