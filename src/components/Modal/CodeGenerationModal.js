import {Modal,Box, Typography,Button,Grid2,Divider,TextField,FormControl,InputLabel,Select,MenuItem,FormHelperText} from '@mui/material'
import { style } from 'src/configs/generalConfig'
import { api } from 'src/utils/Rest-API'
import { useLoading } from 'src/@core/hooks/useLoading'
import { useRouter } from 'next/router'
import { useAuth } from 'src/Context/AuthContext'
import { useEffect, useState } from 'react'
import SnackbarAlert from '../SnackbarAlert'

function CodeGenerationModal({ open, onClose, handleGenerateCode , setForm,setAuthModalOpen,config}) {
  const [formData, setFormData] = useState({ productId: '', batchId: '', batch:'',generateQuantity: '' })
  const [errorData, setErrorData] = useState({
    productError: { isError: false, message: '' },
    batchError: { isError: false, message: '' },
    generateQuantityError: { isError: false, message: '' }
  })
  const [productData, setProductData] = useState([])
  const { removeAuthToken } = useAuth()
  const router = useRouter()
  const { setIsLoading } = useLoading()
  const [batches, setBatches] = useState([])
  const [packagingHierarchyData, setPackagingHierarchyData] = useState({})
  const [showBox1Data, setShowBox1Data] = useState([])
  const [alertData, setAlertData] = useState({ openSnackbar: false, type: '', message: '', variant: 'filled' })

  useEffect(() => {
    resetAll()
    const getProducts = async () => {
      try {
        setIsLoading(true)
        const res = await api(`/product?limit=-1`, {}, 'get', true)
        setIsLoading(false)
        if (res.data.success) {
          const data = res.data.data.products?.map(item => ({
            id: item.id,
            value: item.id,
            label: item.product_name
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
        setIsLoading(false)
      }
    }
    getProducts()
    return () => {
      console.log('return ....')
    }
  }, [])

  useEffect(() => {
    if (formData.productId) {
      const getBatches = async productId => {
        try {
          setIsLoading(true)
          const res = await api(`/batch/getbatchesbyproduct/${productId}`, {}, 'get', true)
          setIsLoading(false)
          console.log('All batches... ', res?.data?.data)
          if (res.data.success) {
            const data = res.data.data?.map(item => ({
              id: item.id,
              value: item.id,
              label: item.batch_no
            }))
            setBatches(data)
          } else {
            console.log('Error to get all batches ', res.data)
            if (res.data.code === 401) {
              removeAuthToken()
              router.push('/401')
            }
          }
        } catch (error) {
          console.log('Error in get batches ', error)
          setIsLoading(false)
        }
      }
      getBatches(formData.productId)
    }
  }, [formData.productId])

  const level = packagingHierarchyData?.packagingHierarchy
  const levelFields = {
    1: ['productNumber', 'outerLayer'],
    2: ['productNumber', 'firstLayer', 'outerLayer'],
    3: ['productNumber', 'firstLayer', 'secondLayer', 'outerLayer'],
    4: ['productNumber', 'firstLayer', 'secondLayer', 'thirdLayer', 'outerLayer']
  }
  const fieldsToDisplay = levelFields[level] || []

  useEffect(() => {
    if (formData.batchId) {
      const getData = async () => {
        try {
          setIsLoading(true)
          setPackagingHierarchyData({})
          const res = await api(`/batch/getbatchbyproduct/${formData.productId}/${formData.batchId}?limit=-1`, {}, 'get', true)
          setIsLoading(false)
          console.log('batch from productId and batchNo', res.data)
          if (res.data.success) {
            setShowBox1Data(res.data.data)
            console.log(res.data.data)

            setPackagingHierarchyData({
              packagingHierarchy: res.data.data?.productHistory?.packagingHierarchy,
              productNumber: res.data.data?.productHistory?.productNumber,
              firstLayer: res.data.data?.productHistory?.firstLayer,
              secondLayer: res.data.data?.productHistory?.secondLayer,
              thirdLayer: res.data.data?.productHistory?.thirdLayer,
              outerLayer: 1
            })
          } else {
            console.log('Error to get batch from productId and batchNo ', res.data)
            setAlertData({ type: 'error', openSnackbar: true, message: res.data.message, variant: 'filled' })
            if (res.data.code === 401) {
              removeAuthToken()
              router.push('/401')
            }
          }
        } catch (error) {
          console.log('Error in get batch from productId and batchNo', error)
          setIsLoading(false)
        }
      }
      getData()
    }

    return () => {}
  }, [formData.batchId])

  useEffect(() => {
    console.log('calculating....')

    if (formData.generateQuantity !== '') {
      const batchSize = showBox1Data?.qty
      const level0 = showBox1Data?.productHistory?.productNumber
      const level1 = showBox1Data?.productHistory?.firstLayer
      const level2 = showBox1Data?.productHistory?.secondLayer
      const level3 = showBox1Data?.productHistory?.thirdLayer

      const generateLevel0 = batchSize * (formData.generateQuantity / 100) * (level0 / level0)
      const generateLevel1 = batchSize * (formData.generateQuantity / 100) * (level1 / level0)
      const generateLeve2 = batchSize * (formData.generateQuantity / 100) * (level2 / level0)
      const generateLeve3 = batchSize * (formData.generateQuantity / 100) * (level3 / level0)
      const outerLayer = batchSize * (formData.generateQuantity / 100) * (1 / level0)

      setPackagingHierarchyData({
        ...packagingHierarchyData,
        productNumber: Math.ceil(generateLevel0),
        firstLayer: Math.ceil(generateLevel1),
        secondLayer: Math.ceil(generateLeve2),
        thirdLayer: Math.ceil(generateLeve3),
        outerLayer: Math.ceil(outerLayer)
      })
    }

    return () => {}
  }, [formData.generateQuantity])

  const handleSubmit = () => {
    if (!formData.productId) {
      setErrorData({ ...errorData, productError: { isError: true, message: 'Select Product' } })
      return
    }
    if (!formData.batchId) {
      setErrorData({ ...errorData, batchError: { isError: true, message: 'Select Batch' } })
      return
    }
    if (!formData.generateQuantity) {
      setErrorData({ ...errorData, generateQuantityError: { isError: true, message: 'Enter Generate Quantity' } })
      return
    }
    const data = {
      packagingHierarchyData,
      productId: formData.productId,
      batchId: formData.batchId
    }
    if (config?.config?.esign_status) {
      setForm(data)
      setAuthModalOpen(true);
      return;
    }
    console.log('on submit ', data)
    handleGenerateCode(false, data,"approved")
  }

  const resetAll = () => {
    console.log('reset alll...')

    setPackagingHierarchyData({})
    setShowBox1Data({})
    setFormData({ productId: '', batchId: '', generateQuantity: '' })
  }
  const handleCloseModal = () => {
    onClose()
    resetAll()
  }
  const closeSnackbar = () => {
    setAlertData({ ...alertData, openSnackbar: false })
  }
  return (
    <>
      <Modal
        open={open}
        onClose={handleCloseModal}
        data-testid='modal'
        role='dialog'
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
      >
        <Box sx={{ ...style, width: '70%' }}>
          <Typography variant='h3' className='my-2'>
            Generate Codes
          </Typography>
          <form>
            <Grid2 item xs={12} className='d-flex justify-content-between align-items-center mb-4 mt-4'>
              <Box className='w-50'>
                <FormControl fullWidth required error={errorData.productError.isError}>
                  <InputLabel id='label-product'>Product</InputLabel>
                  <Select
                    labelId='label-product'
                    id='product'
                    label='Product *'
                    value={formData.productId}
                    onChange={e => {
                      setFormData({ ...formData, productId: e.target.value })
                      setErrorData(prev => ({ ...prev, productError: { isError: false, message: '' } }))
                    }}
                  >
                    {productData?.map(item => (
                      <MenuItem key={item.id} value={item.value} selected={formData.productId === item.id}>
                        {item.label}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    {errorData.productError.isError ? errorData.productError.message : ''}
                  </FormHelperText>
                </FormControl>
              </Box>
              <Box className='w-50' sx={{ ml: 2 }}>
                <FormControl fullWidth required error={errorData.batchError.isError}>
                  <InputLabel id='label-batch'>Batch</InputLabel>
                  <Select
                    labelId='label-batch'
                    id='batch'
                    label='Batch *'
                    value={formData.batchId}
                    onChange={e => {
                      const selectedValue = e.target.value;
                      const selectedItem = batches.find(item => item.value === selectedValue);
                  
                      setFormData({
                        ...formData,
                        batchId: selectedValue,
                        batch: selectedItem?.label || ''
                      });
                  
                      setErrorData(prev => ({ ...prev, batchError: { isError: false, message: '' } }))
                    }}
                  >
                    {batches?.map(item => (
                      <MenuItem key={item.id} value={item.value} selected={formData.batchId === item.id}>
                        {item.label}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{errorData.batchError.isError ? errorData.batchError.message : ''}</FormHelperText>
                </FormControl>
              </Box>
            </Grid2>
            <Box>
              <Grid2 item xs={12} className='d-flex justify-content-between align-items-center mb-2'>
                <Box className='w-50'>
                  <TextField
                    fullWidth
                    id='location'
                    label='Location'
                    placeholder='Location'
                    value={showBox1Data?.location?.location_name ? showBox1Data?.location?.location_name : ''}
                    disabled={true}
                  />
                </Box>
                <Box className='w-50' sx={{ ml: 2 }}>
                  <TextField
                    fullWidth
                    id='manufacturingDate'
                    label='Mfg. Date'
                    placeholder='Mfg. Date'
                    value={
                      showBox1Data?.manufacturing_date
                        ? new Date(showBox1Data.manufacturing_date).toLocaleDateString()
                        : ''
                    }
                    disabled={true}
                  />{' '}
                </Box>
                <Box className='w-50' sx={{ ml: 2 }}>
                  <TextField
                    fullWidth
                    id='expiryDate'
                    label='Exp. Date'
                    placeholder='Exp. Date'
                    value={showBox1Data?.expiry_date ? new Date(showBox1Data.expiry_date).toLocaleDateString() : ''}
                    disabled={true}
                  />
                </Box>
              </Grid2>
              <Divider sx={{ my: 6, backgroundColor: 'black', width: '90%', mx: 'auto' }} />
              <Grid2 item xs={12} className='d-flex justify-content-between align-items-start mb-2'>
                <Box className='w-50'>
                  <TextField
                    fullWidth
                    id='batchQuantity'
                    label='Batch Quantity'
                    placeholder='Batch Quantity'
                    value={showBox1Data?.qty ? showBox1Data?.qty : ''}
                    disabled={true}
                  />
                  <Box sx={{ mt: '30%' }}>
                    <ul style={{ listStyleType: 'disc', paddingLeft: '30%' }}>
                      {fieldsToDisplay.map(
                        field =>
                          packagingHierarchyData[field] !== undefined && (
                            <li key={field}>
                              <Typography variant='h4' className='text-nowrap'>
                                {`${field.charAt(0).toUpperCase() + field.slice(1)} : ${packagingHierarchyData[field]}`}
                              </Typography>
                            </li>
                          )
                      )}
                    </ul>
                  </Box>
                </Box>
                <Box className='w-50' sx={{ ml: 2 }}>
                  <FormControl fullWidth required error={errorData.generateQuantityError.isError}>
                    <TextField
                      fullWidth
                      id='generateQuantity'
                      label='Generate Qty in %'
                      placeholder='Generate Qty in %'
                      value={formData.generateQuantity}
                      inputProps={{ step: '1' }}
                      type='number'
                      onChange={event => {
                        const value = event.target.value
                        if (value <= 100 && value >= 0) {
                          setFormData({ ...formData, generateQuantity: value })
                          setErrorData(prev => ({ ...prev, generateQuantityError: { isError: false, message: '' } }))
                        } else {
                          setErrorData(prev => ({
                            ...prev,
                            generateQuantityError: { isError: true, message: 'Value must be between 0 and 100' }
                          }))
                        }
                      }}
                    />
                    <FormHelperText>
                      {errorData.generateQuantityError.isError ? errorData.generateQuantityError.message : ''}
                    </FormHelperText>
                  </FormControl>
                </Box>
                <Box className='w-50' sx={{ ml: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box
                    component='img'
                    sx={{
                      width: '60%',
                      height: '60%',
                      borderRadius: '8px',
                      border: '1px solid grey',
                      mb: 4
                    }}
                    src='/images/packaginghierarchy01.png'
                    alt='description'
                  />
                  <TextField
                    fullWidth
                    id='packagingHierarchy'
                    label='Packaging Hierarchy'
                    placeholder='Packaging Hierarchy'
                    value={packagingHierarchyData?.packagingHierarchy ? packagingHierarchyData?.packagingHierarchy : ''}
                    disabled={true}
                  />
                </Box>
              </Grid2>

              <Grid2 item xs={12} className='my-3 '>
                <Button
                  variant='contained'
                  sx={{ marginRight: 3.5 }}
                  onClick={handleSubmit}
                  disabled={
                    !formData.productId ||
                    !formData.batchId ||
                    formData.generateQuantity < 1 ||
                    formData.generateQuantity > 100
                  }
                >
                  Generate
                </Button>
                <Button type='reset' variant='outlined' color='primary' onClick={resetAll}>
                  Reset
                </Button>
                <Button variant='outlined' color='error' sx={{ marginLeft: 3.5 }} onClick={handleCloseModal}>
                  Close
                </Button>
              </Grid2>
            </Box>
          </form>
        </Box>
      </Modal>
      <SnackbarAlert openSnackbar={alertData.openSnackbar} closeSnackbar={closeSnackbar} alertData={alertData} />
    </>
  )
}

export default CodeGenerationModal
