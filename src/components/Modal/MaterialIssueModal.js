import React, { useState, useEffect } from 'react'
import { useForm, Controller} from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Modal, Box, Typography, Button, Grid2, TextField, } from '@mui/material'
import { style } from 'src/configs/generalConfig'
import CustomTextField from 'src/components/CustomTextField'
import CustomDropdown from 'src/components/CustomDropdown'
import { useLoading } from 'src/@core/hooks/useLoading'
import { useAuth } from 'src/Context/AuthContext'
import { api } from 'src/utils/Rest-API'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'

const MaterialIssueSchema = yup.object().shape({
  productId: yup.string().required("Product can't be empty"),
  batch_uuid: yup.string().required("Batch can't be empty"),
  quantityIssue: yup.string().required("Quality Issue can't be empty"),
  qcresult:yup.string().required("QC Result can't be empty"),
  orderDate: yup.string().required('Select orders date'),

})

function MaterialIssueModel({ open, onClose, editData, handleSubmitForm }) {
  const [allProductData, setAllProductData] = useState([])
  const [allBatchData, setAllBatchData] = useState([])
  const { setIsLoading } = useLoading()
  const { removeAuthToken } = useAuth()
  const router = useRouter()
  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm({
    resolver: yupResolver(MaterialIssueSchema),
    defaultValues: {

      productId: '',
      batch_uuid: '',
      quantityIssue: '',
      qcresult: null,
      orderDate: editData.order_date || '',

    }
  })
  const formatDate = date => {
    const d = new Date(date)
    if (d instanceof Date && !isNaN(d)) {
      return d.toISOString().split('T')[0]
    }
    return ''
  }
 

  useEffect(() => {
    if (editData) {
      reset({

        productId: editData?.product_uuid || '',
        batch_uuid: editData?.batch_uuid || '',
        quantityIssue: editData?.quantity_issue || '',
        qcresult: editData?.qcresult || null,
        orderDate: formatDate(editData.order_date) || '',

      })
    }
  }, [editData])

  useEffect(() => {
    const getAllProductData = async () => {
      setIsLoading(true)
      try {
        const res = await api(`/product?limit=-1&history_latest=true`, {}, 'get', true)
        if (res.data.success) {
          const data = res.data.data.products?.map(item => ({
            id: item.product_uuid,
            value: item.product_uuid,
            label: item.api_name
          }))
          
          setAllProductData(data)
        } else if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      } catch (error) {
        console.log('Error in get Product Data ', error)
      } finally {
        setIsLoading(false)
      }
    }
    getAllProductData()
  }, [])

   const watchProductId = watch('productId');
   useEffect(() => {
  const getAllBatches = async () => {
    if (!watchProductId) {
      setAllBatchData([]);
      return;
    }

    try {
      setIsLoading(true);
      const res = await api(  `/batch/${watchProductId}?limit=-1&history_latest=true`, {},'get',true  );
      if (res.data.success) {
        const data = res.data?.data?.batches?.map(item => ({
          id: item.batch_uuid,
          value: item.batch_uuid,
          label: item.batch_no
        }));
        setAllBatchData(data);
      } else if (res.data.code === 401) {
        removeAuthToken();
        router.push('/401');
      }
    } catch (error) {
      console.log('Error in get Batches ', error);
    } finally {
      setIsLoading(false);
    }
      reset(prev => ({
        ...prev,
        batch_uuid: ''
      }))
  };

  getAllBatches();
}, [watchProductId]);



  const QcData = [
    { id: 'PASS', value: 'PASS', label: 'PASS' },
    { id: 'FAIL', value: 'FAIL', label: 'FAIL' }

  ]


  return (
    <Modal open={open} onClose={onClose} aria-labelledby='modal-modal-title' aria-describedby='modal-modal-description'>

      <Box sx={style}>
        <Typography variant='h4' className='my-2'>
          {editData?.id ? 'Edit Material Issue' : 'Add Material Issue'}
        </Typography>
        <form onSubmit={handleSubmit(handleSubmitForm)}>
          <Grid2 container spacing={2}>
            <Grid2 size={6}>
              <CustomDropdown
                name='productId'
                label='Product ID *'
                control={control}
                options={allProductData}
              />
            </Grid2>
            <Grid2 size={6}>
              <CustomDropdown
                name='batch_uuid'
                label='Batch ID *'
                control={control}
                options={allBatchData}
              />
            </Grid2>
          </Grid2>

          <Grid2 container spacing={2} mt={2}>
            <Grid2 size={6}>
              <CustomDropdown
              name={'qcresult'}
                label='Qc Result'
                control={control}
                options={QcData}
              />
            </Grid2>
            <Grid2 size={6}>
              <CustomTextField
                name='quantityIssue'
                label='Quality Issue *'
                control={control} />
            </Grid2>
          </Grid2>

          <Grid2 container spacing={2}>

            <Grid2 size={4}>
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


          <Grid2 item xs={12} className='mt-3'>
            <Button variant='contained' sx={{ marginRight: 3.5 }} type='submit'>
              Save Changes
            </Button>
            <Button type='reset' variant='outlined' color='primary' onClick={() => reset()}>
              Reset
            </Button>
            <Button variant='outlined' color='error' sx={{ marginLeft: 3.5 }} onClick={onClose}>
              Close
            </Button>
          </Grid2>
        </form>
      </Box>
    </Modal>
  )
}
MaterialIssueModel.propTypes = {
  open: PropTypes.any,
  onClose: PropTypes.any,
  editData: PropTypes.any,
  handleSubmitForm: PropTypes.any
}
export default MaterialIssueModel
