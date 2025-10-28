/* eslint-disable no-undef */
import { useEffect, useState } from 'react'
import {
  Modal,
  Box,
  Grid2,
  Typography,
  Button,
  FormControlLabel,
  Switch,
  FormControl,
  RadioGroup,
  FormLabel,
  Radio,
  IconButton,
  FormHelperText,
  TextField
} from '@mui/material'
import { style, modalStyle } from 'src/configs/generalConfig'
import CustomTextField from '../CustomTextField'
import CustomDropdown from '../CustomDropdown'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller, FormProvider } from 'react-hook-form' // Import FormProvider
import { Bs1Square, Bs2Square, Bs3Square, Bs4Square } from 'react-icons/bs'
import { AiOutlineEye } from 'react-icons/ai'
import { styled } from '@mui/material/styles'
import { api } from 'src/utils/Rest-API'
import { useLoading } from 'src/@core/hooks/useLoading'
import { useRouter } from 'next/router'
import { useAuth } from 'src/Context/AuthContext'
import { convertImageToBase64 } from 'src/utils/UrlToBase64'
import PropTypes from 'prop-types'
import PackagingHierarchyLevelInput from 'src/components/PackagingHierarchyLevelInput'
import validationSchema from 'src/components/Validation/ProductValidation'

function ProductModal({
  openModal,
  handleCloseModal,
  editData,
  handleSubmitForm,
  productImage,
  setProductImage,
  tableHeaderData
}) {
  const methods = useForm({
    // Use methods to pass to FormProvider
    resolver: yupResolver(validationSchema),
    defaultValues: {
      productId: '',
      commonNames: '',
      apiName: '',
      potency: '',
      casNumber: '',
      therapeuticCategory: '',
      impurityLimits: '',
      containerSize: '',
      shelfLife: '',
      grades: null,
      purity: '',
      country: '',
      gtin: '',
      packagingHierarchy: '',
      productNumber: 0,
      productNumber_unit_of_measurement: '',
      productNumber_aggregation: false,
      productNumber_print: false,
      firstLayer: 0,
      firstLayer_unit_of_measurement: '',
      firstLayer_aggregation: false,
      firstLayer_print: false,
      secondLayer: 0,
      secondLayer_unit_of_measurement: '',
      secondLayer_aggregation: false,
      secondLayer_print: false,
      thirdLayer: 0,
      thirdLayer_unit_of_measurement: '',
      thirdLayer_aggregation: false,
      thirdLayer_print: false,
      palletisation_applicable: false,
      pallet_size: 0,
      pallet_size_unit_of_measurement: '',
      productImage: '/images/avatars/p.png',
      storageConditions: '',
      msdsReference: '',
      hazardClassification: '',
      status: false,
    }
  })

  const {
    control,
    handleSubmit,
    watch,
    trigger,
    reset,
    setValue,
    clearErrors,
    formState: { errors }
  } = methods
  const router = useRouter()
  const [gtinLastDigit, setGtinLastDigit] = useState()
  const { removeAuthToken } = useAuth()
  const packagingHierarchy = watch('packagingHierarchy')
  const palletisation_applicable = watch('palletisation_applicable')
  const productNumber = watch('productNumber')
  const firstLayer = watch('firstLayer')
  const secondLayer = watch('secondLayer')
  const thirdLayer = watch('thirdLayer')
  const product_image = watch('productImage')
  const { setIsLoading } = useLoading()
  const [countries, setCountries] = useState([])

  const [uoms, setUoms] = useState([])
  const [modalOpen, setModalOpen] = useState(false)



  useEffect(() => {
    getCountries()
  }, [tableHeaderData.esignStatus])

  const getUomData = async () => {
    try {
      const res = await api(`/uom?limit=-1&history_latest=true`, {}, 'get', true)
      if (res?.data?.success) {
        setUoms(res.data.data.uoms)
      } else if (res?.data?.code === 401) {
        removeAuthToken()
        router.push('/401')
      }
    } catch (error) {
      console.log('Error in get units', error)
    }
  }

  useEffect(() => {
    getUomData()
  }, [])

  const applyPackagingHierarchy = async () => {
    const fieldsToValidate = [
      'productNumber',
      'firstLayer',
      'secondLayer',
      'thirdLayer',
      'productNumber_unit_of_measurement',
      'firstLayer_unit_of_measurement',
      'secondLayer_unit_of_measurement',
      'thirdLayer_unit_of_measurement',
      'palletisation_applicable',
      'pallet_size',
      'pallet_size_unit_of_measurement',
      'productImage',
      'productNumber_aggregation',
      'firstLayer_aggregation',
      'secondLayer_aggregation',
      'thirdLayer_aggregation',
      'productNumber_print',
      'firstLayer_print',
      'secondLayer_print',
      'thirdLayer_print'
    ]

    const isValid = await Promise.all(fieldsToValidate.map(field => trigger(field)))
    if (!isValid.every(Boolean)) return

    const hierarchy = Number(watch('packagingHierarchy'))

    // Reset higher levels when reducing hierarchy
    if (hierarchy < 4) {
      setValue('thirdLayer', '')
      setValue('thirdLayer_unit_of_measurement', '')
      setValue('thirdLayer_print', false)
      setValue('thirdLayer_aggregation', false)
    }
    if (hierarchy < 3) {
      setValue('secondLayer', '')
      setValue('secondLayer_unit_of_measurement', '')
      setValue('secondLayer_print', false)
      setValue('secondLayer_aggregation', false)
    }
    if (hierarchy < 2) {
      setValue('firstLayer', '')
      setValue('firstLayer_unit_of_measurement', '')
      setValue('firstLayer_print', false)
      setValue('firstLayer_aggregation', false)
    }

    clearErrors('packagingHierarchy')
    setModalOpen(false)
  }


  const getCountries = async () => {
    try {
      setIsLoading(true)
      const res = await api('/country-master?limit=-1', {}, 'get', true)
      setIsLoading(false)
      if (res.data.success) {
        setCountries(res.data.data.countryMaster)
      } else {
        console.log('Error to get all country master ', res.data)
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('Error in get country ', error)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (editData) {
      reset({
        productId: editData?.product_id || '',
        commonNames: editData?.common_name || '',
        gtin: editData?.gtin || '',
        casNumber: editData?.cas_number || '',
        therapeuticCategory: editData?.therapeutic_category || '',
        impurityLimits: editData?.impurity_limits,
        country: editData?.country_id || '',
        packagingHierarchy: editData?.packagingHierarchy || '',
        productNumber: editData?.productNumber || '',
        productNumber_unit_of_measurement: editData?.productNumber_unit_of_measurement || '',
        productNumber_aggregation: editData?.productNumber_aggregation || false,
        productNumber_print: editData?.productNumber_print || false,
        firstLayer: editData?.firstLayer || '',
        firstLayer_unit_of_measurement: editData?.firstLayer_unit_of_measurement || '',
        firstLayer_aggregation: editData?.firstLayer_aggregation || false,
        firstLayer_print: editData?.firstLayer_print || false,
        secondLayer: editData?.secondLayer || '',
        secondLayer_unit_of_measurement: editData?.secondLayer_unit_of_measurement || '',
        secondLayer_aggregation: editData?.secondLayer_aggregation || false,
        secondLayer_print: editData?.secondLayer_print || false,
        thirdLayer: editData?.thirdLayer || '',
        thirdLayer_unit_of_measurement: editData?.thirdLayer_unit_of_measurement || '',
        thirdLayer_aggregation: editData?.thirdLayer_aggregation || false,
        thirdLayer_print: editData?.thirdLayer_print || false,
        palletisation_applicable: editData?.palletisation_applicable || false,
        pallet_size: editData?.pallet_size?.toString() || '',
        pallet_size_unit_of_measurement: editData?.pallet_size_unit_of_measurement || '',
        apiName: editData?.api_name || '',
        potency: editData?.potency || '',
        purity: editData?.purity || '',
        storageConditions: editData?.storage_conditions || '',
        grades: editData?.grade || null,
        msdsReference: editData?.msds_reference || '',
        hazardClassification: editData?.hazard_classification || '',
        containerSize: editData.container_size || '',
        shelfLife: editData.shelfLife || '',
        status: editData?.status || false

      })
      if (editData?.product_image && editData?.product_image !== '/images/avatars/p.png') {
        convertImageToBase64(editData?.productImage, setProductImage)
        setValue('productImage', editData?.productImage)
      }
    }
  }, [editData])

  useEffect(() => {
    if (product_image != '/images/avatars/p.png' && product_image) {
      setProductImage(product_image)
    }
  }, [product_image, editData])

  const ImgStyled = styled('img')(({ theme }) => ({
    width: 120,
    height: 120,
    marginRight: theme.spacing(6.25),
    borderRadius: theme.shape.borderRadius
  }))
  const ResetButtonStyled = styled(Button)(({ theme }) => ({
    marginLeft: theme.spacing(4.5),
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      marginLeft: 0,
      textAlign: 'center',
      marginTop: theme.spacing(4)
    }
  }))
  const ButtonStyled = styled(Button)(({ theme }) => ({
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      textAlign: 'center'
    }
  }))


  const CountryData = countries?.map(item => ({
    id: item.id,
    value: item.id,
    label: item.country
  }))

  const UomData = uoms?.map(item => ({
    id: item.uom_uuid,
    value: item.uom_uuid,
    label: item.uom_name
  }))
  const GradeData = [
    { id: 'IP', value: 'IP', label: 'IP' },
    { id: 'USP', value: 'USP', label: 'USP' },
    { id: 'EP', value: 'EP', label: 'EP' },
    { id: 'JP', value: 'JP', label: 'JP' },
    { id: 'BP', value: 'BP', label: 'BP' }
  ]




  const calculateGtinCheckDigit = input => {
    if (input.length !== 12 || isNaN(input)) {
      return
    }

    let sum = 0
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(input[i])
      sum += i % 2 === 0 ? digit : digit * 3
    }

    const nearestMultipleOfTen = Math.ceil(sum / 10) * 10
    const checkDigit = nearestMultipleOfTen - sum
    setGtinLastDigit(checkDigit)
  }

  const isPackagingHierarchyLevelIsRequired = () =>
    ['productNumber', 'firstLayer', 'secondLayer', 'thirdLayer'].some(el => Boolean(errors[el]?.message))
    
  console.log("hello",errors);

  return (
    <Modal
      open={openModal}
      onClose={handleCloseModal}
      data-testid='modal'
      aria-labelledby='modal-modal-title'
      aria-describedby='modal-modal-description'
    >
      <Box sx={{ ...style, width: '80%', height: '70%', overflowY: 'auto' }}>
        <Typography variant='h4' className='my-2'>
          {editData?.id ? 'Edit Product' : 'Add Product'}
        </Typography>
        <FormProvider {...methods}>
          {/* Wrap the form with FormProvider */}
          <form onSubmit={
            handleSubmit(handleSubmitForm)
          }>
            <Grid2 item xs={12} className='d-flex justify-content-between align-items-center'>
              <Box>
                <Grid2 container xs={12} sx={{ marginTop: 4.8, marginBottom: 3 }}>
                  <ImgStyled src={productImage} alt='Profile Pic' />
                  <Box>
                    <ButtonStyled component='label' variant='contained' htmlFor='account-settings-upload-image'>
                      Upload New Photo
                      <Controller
                        name='productImage'
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <input
                            hidden
                            type='file'
                            onChange={e => {
                              const file = e.target.files[0]
                              if (file) {
                                // Validate file size (8MB limit)
                                if (file.size > 8 * 1024 * 1024) {
                                  alert('File size exceeds 8MB limit')
                                  return
                                }

                                // Create preview URL and update form value
                                const reader = new FileReader()
                                reader.onload = () => {
                                  setValue('file', e.target.files[0])
                                  setValue('productImage', reader.result)
                                  field.onChange(reader.result) // Update form value
                                }
                                reader.readAsDataURL(file)
                              }
                            }}
                            accept='image/png, image/jpeg, image/jpg'
                            id='account-settings-upload-image'
                          />
                        )}
                      />
                    </ButtonStyled>
                    <ResetButtonStyled
                      color='error'
                      variant='outlined'
                      onClick={async () => {
                        if (editData?.product_image) {
                          convertImageToBase64(editData?.product_image, setProductImage)
                        } else {
                          setProductImage('/images/avatars/p.png')
                        }
                      }}
                    >
                      Reset
                    </ResetButtonStyled>
                    <Typography variant='body2' sx={{ marginTop: 5 }}>
                      Allowed PNG, JPG or JPEG. Max size of 8MB.
                    </Typography>
                    {errors.productImage && (
                      <Typography color='error' variant='body2'>
                        Image is required
                      </Typography>
                    )}
                  </Box>
                  <Grid2>
                    <FormHelperText error={errors?.productImage}>
                      {errors?.productImage ? errors?.productImage : ''}
                    </FormHelperText>
                  </Grid2>
                </Grid2>
              </Box>
            </Grid2>
            <Grid2 container spacing={2}>
              <Grid2 size={3}>
                <CustomTextField
                  fullWidth
                  control={control}
                  label='Product ID *'
                  placeholder='Product ID'
                  name={'productId'}
                  disabled={!!editData?.id}
                />
              </Grid2>
              <Grid2 size={3}>
                <CustomTextField
                  label='Common Name *'
                  placeholder='Common Name'
                  name={'commonNames'}
                  control={control}
                />
              </Grid2>

              <Grid2 size={3}>
                <CustomTextField
                  label='API Name *'
                  placeholder='API Name'
                  name={'apiName'}
                  control={control}
                />
              </Grid2>
              <Grid2 size={3}>
                <Controller
                  name='gtin'
                  control={control}
                  rules={{
                    required: 'GTIN is required',
                    maxLength: {
                      value: 12,
                      message: 'GTIN cannot exceed 12 digits'
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type='number'
                      id='gtin'
                      label='GTIN *'
                      placeholder='GTIN'
                      onBlur={e => calculateGtinCheckDigit(e.target.value)}
                      onChange={e => {
                        if (e.target.value?.length <= 12) {
                          field.onChange(e.target.value) // Use field.onChange instead of setValue
                        }
                        if (e.target.value.length === 12) {
                          clearErrors('gtin')
                        }
                        if (e.target.value?.length !== 12) {
                          setGtinLastDigit(null)
                        }
                      }}
                      error={!!errors.gtin}
                      helperText={errors.gtin?.message}
                      slotProps={{
                        input: {
                          sx: { paddingRight: 0 }
                        },
                        root: {
                          sx: {
                            '& .MuiInputBase-root': {
                              paddingRight: 0
                            }
                          }
                        },
                        endAdornment: {
                          position: 'end',
                          sx: {
                            paddingX: '15px',
                            paddingY: errors.gtin ? '16px' : '28px',
                            borderRadius: '4px',
                            color: '#666'
                          }
                        }
                      }}
                      endAdornment={
                        <Box
                          sx={{
                            paddingX: '15px',
                            paddingY: errors.gtin ? '16px' : '28px',
                            borderRadius: '4px',
                            color: '#666'
                          }}
                        >
                          {gtinLastDigit || ''}
                        </Box>
                      }
                    />
                  )}
                />
              </Grid2>

            </Grid2>

            <Grid2 container spacing={2}>

              <Grid2 size={3}>
                <CustomTextField
                  type='number'
                  step='0.01'
                  label='CAS Number *'
                  placeholder='CAS Number'
                  name={'casNumber'}
                  control={control}
                />
              </Grid2>
              <Grid2 size={3}>
                <CustomTextField
                  label='Therapeutic Category'
                  placeholder='Therapeutic Category'
                  name={'therapeuticCategory'}
                  control={control}
                />
              </Grid2>
              <Grid2 size={3}>
                <CustomTextField
                  label='Impurity Limits'
                  placeholder='Impurity Limits'
                  name={'impurityLimits'}
                  control={control}
                />
              </Grid2>
              <Grid2 size={3}>
                <CustomTextField
                  label=' Container Size'
                  placeholder=' Container Size'
                  name={'containerSize'}
                  control={control}
                />
              </Grid2>

            </Grid2>


            <Grid2 container spacing={2}>


              <Grid2 size={3}>
                <CustomTextField
                  type='string'
                  label='Shelf Life  *'
                  placeholder='Shelf Life '
                  name={'shelfLife'}
                  control={control}
                />
              </Grid2>
              <Grid2 size={3}>
                <CustomDropdown
                  label='Grades'
                  name={'grades'}
                  control={control}
                  options={GradeData}
                />
              </Grid2>
              <Grid2 size={3}>
                <CustomTextField
                  type='number'
                  step='0.01'
                  label='Purity % *'
                  placeholder='Enter purity (%)'
                  name={'purity'}
                  control={control}
                />
              </Grid2>

              <Grid2 size={3}>
                <CustomDropdown
                  label='Country *'
                  name={'country'}
                  control={control}
                  options={CountryData}
                />
              </Grid2>

            </Grid2>

            <Grid2 container spacing={2} sx={{ marginBottom: 3 }}>
              <Grid2 size={3}>
                <CustomTextField
                  type='number'
                  step='0.01'
                  label='Potency *'
                  placeholder='Potency'
                  name={'potency'}
                  control={control}
                />
              </Grid2>

            </Grid2>


            <Grid2 container spacing={2}>
              <Grid2 size={8}>
                <FormControl component='fieldset' fullWidth error={!!errors.packagingHierarchy} required>
                  <FormLabel component='legend'>Packaging Hierarchy</FormLabel>
                  <Controller
                    name='packagingHierarchy'
                    control={control}
                    rules={{ required: 'This field is required' }}
                    render={({ field }) => (
                      <RadioGroup
                        {...field}
                        row
                        onChange={e => {
                          setValue('packagingHierarchy', Number(e.target.value))
                        }}
                      >
                        <FormControlLabel
                          value={1}
                          control={<Radio checked={packagingHierarchy == 1} />}
                          label={
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <Bs1Square style={{ marginRight: '4px' }} />
                            </div>
                          }
                        />
                        <FormControlLabel
                          value={2}
                          control={<Radio checked={packagingHierarchy == 2} />}
                          label={
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <Bs2Square style={{ marginRight: '4px' }} />
                            </div>
                          }
                        />
                        <FormControlLabel
                          value={3}
                          control={<Radio checked={packagingHierarchy == 3} />}
                          label={
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <Bs3Square style={{ marginRight: '4px' }} />
                            </div>
                          }
                        />
                        <FormControlLabel
                          value={4}
                          control={<Radio checked={packagingHierarchy == 4} />}
                          label={
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <Bs4Square style={{ marginRight: '4px' }} />
                            </div>
                          }
                        />
                        <IconButton onClick={() => setModalOpen(true)} sx={{ ml: 1 }}>
                          <AiOutlineEye />
                        </IconButton>
                      </RadioGroup>
                    )}
                  />
                  <FormControl error={!!errors.packagingHierarchy || isPackagingHierarchyLevelIsRequired()}>
                    <FormHelperText>
                      {errors.packagingHierarchy?.message ||
                        (isPackagingHierarchyLevelIsRequired() &&
                          'Please provide the required Packaging Hierarchy Levels to proceed.')}
                    </FormHelperText>
                  </FormControl>
                </FormControl>

                <Modal
                  open={modalOpen}
                  onClose={() => setModalOpen(false)}
                  aria-labelledby='modal-title'
                  aria-describedby='modal-description'
                >
                  <Box sx={modalStyle}>
                    <h2 id='modal-title'>
                      {packagingHierarchy !== 1 &&
                        packagingHierarchy !== 2 &&
                        packagingHierarchy !== 3 &&
                        packagingHierarchy !== 4 ? (
                        <div>
                          <Typography variant='h3' gutterBottom>
                            Packaging Hierarchy Summary
                          </Typography>
                          <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                            <li>
                              <Typography variant='body1'>
                                <strong>Selected Hierarchy:</strong> {packagingHierarchy} Level
                                {packagingHierarchy !== 1 ? 's' : ''}
                              </Typography>
                            </li>

                            {/* Always show Level 0 (Product Number) */}
                            <li>
                              <Typography variant='body1'>
                                <strong>Level 0 (Product):</strong> {productNumber}{' '}
                                {watch('productNumber_unit_of_measurement')}
                              </Typography>
                            </li>

                            {/* Show First Level if hierarchy is 2, 3, or 4 */}
                            {packagingHierarchy >= 2 && (
                              <li>
                                <Typography variant='body1'>
                                  <strong>Level 1:</strong> {firstLayer} {watch('firstLayer_unit_of_measurement')}
                                </Typography>
                              </li>
                            )}

                            {/* Show Second Level if hierarchy is 3 or 4 */}
                            {packagingHierarchy >= 3 && (
                              <li>
                                <Typography variant='body1'>
                                  <strong>Level 2:</strong> {secondLayer} {watch('secondLayer_unit_of_measurement')}
                                </Typography>
                              </li>
                            )}

                            {/* Show Third Level only if hierarchy is 4 */}
                            {packagingHierarchy === 4 && (
                              <li>
                                <Typography variant='body1'>
                                  <strong>Level 3:</strong> {thirdLayer} {watch('thirdLayer_unit_of_measurement')}
                                </Typography>
                              </li>
                            )}
                          </ul>
                        </div>
                      ) : (
                        // Optimized rendering for packaging hierarchy levels with similar heading styles
                        <>
                          <Typography variant='h3' gutterBottom>
                            {packagingHierarchy === 1 && 'One Level'}
                            {packagingHierarchy === 2 && 'Two Level'}
                            {packagingHierarchy === 3 && 'Three Level'}
                            {packagingHierarchy === 4 && 'Four Level'}
                          </Typography>
                          <Grid2 container size={12} spacing={5} className='mb-2'>
                            <Grid2 size={4}>
                              <Typography variant='subtitle1' component='span' sx={{ fontWeight: 'bold' }}>
                                Level
                              </Typography>
                            </Grid2>
                            <Grid2 size={3}>
                              <Typography variant='subtitle1' component='span' sx={{ fontWeight: 'bold' }}>
                                Level Uom
                              </Typography>
                            </Grid2>
                            <Grid2 size={2}>
                              <Typography variant='subtitle1' component='span' sx={{ fontWeight: 'bold' }}>
                                Print
                              </Typography>
                            </Grid2>
                            <Grid2 size={2}>
                              <Typography variant='subtitle1' component='span' sx={{ fontWeight: 'bold' }}>
                                Aggregation
                              </Typography>
                            </Grid2>
                          </Grid2>
                          {[...Array(packagingHierarchy)].map((_, index) => {
                            const levelLabels = ['0th', 'First', 'Second', 'Third']
                            return (
                              <PackagingHierarchyLevelInput
                                key={levelLabels[index]}
                                level={index}
                                label={levelLabels[index]}
                                uomOptions={UomData}
                              />
                            )
                          })}
                        </>
                      )}
                    </h2>
                    <Grid2 size={12} className={palletisation_applicable ? '' : 'mb-3'}>
                      <Controller
                        control={control}
                        name={'palletisation_applicable'}
                        render={({ field }) => (
                          <FormControlLabel
                            label='Palletisation applicable: '
                            labelPlacement='start'
                            control={
                              <Switch
                                {...field}
                                checked={field.value}
                                name='palletisation_applicable'
                                color='primary'
                              />
                            }
                            sx={{
                              marginLeft: 0,
                              label: {
                                marginLeft: 0
                              }
                            }}
                          />
                        )}
                      />
                    </Grid2>
                    {palletisation_applicable && (
                      <Grid2 container spacing={5} size={12} className='d-flex align-items-center mb-3'>
                        <Grid2 size={7}>
                          <CustomTextField
                            control={control}
                            id='pallet_size'
                            label='Pallet size'
                            name={'pallet_size'}
                            type='number'
                          />
                        </Grid2>
                        <Grid2 size={4}>
                          <CustomDropdown
                            control={control}
                            label='Pallet size Uom'
                            name={'pallet_size_unit_of_measurement'}
                            options={UomData}
                          />
                        </Grid2>
                      </Grid2>
                    )}

                    {packagingHierarchy !== 1 &&
                      packagingHierarchy !== 2 &&
                      packagingHierarchy !== 3 &&
                      packagingHierarchy !== 4 ? (
                      ''
                    ) : (
                      <>
                        <Button
                          variant='contained'
                          sx={{ marginRight: 3.5 }}
                          onClick={async () => await applyPackagingHierarchy()}
                        >
                          Save Changes
                        </Button>
                        <Button
                          variant='outlined'
                          color='error'
                          onClick={() => {
                            setModalOpen(false)
                            // reset()
                          }}
                        >
                          Close
                        </Button>
                      </>
                    )}
                  </Box>
                </Modal>
              </Grid2>
            </Grid2>
            <Grid2 item xs={12} className='d-flex justify-content-between align-items-center mb-2'></Grid2>
            <Grid2 item xs={12} className='d-flex justify-content-between align-items-center mb-2'>
              <Box></Box>
            </Grid2>

            <Grid2 container xs={12} className='d-flex justify-content-between align-items-center' spacing={5}>
              <Grid2 size={4}>
                <CustomTextField
                  control={control}
                  label='Storage Conditions *'
                  placeholder='Storage Conditions'
                  name={'storageConditions'}
                  multiline={true} // Enable multiline
                  rows={3}
                />
              </Grid2>
              <Grid2 size={4}>
                <CustomTextField
                  label='Hazard Classification'
                  placeholder='Hazard Classification'
                  name={'hazardClassification'}
                  multiline={true} // Enable multiline
                  rows={3}
                />
              </Grid2>
              <Grid2 size={4}>
                <CustomTextField
                  control={control}
                  label='MSDS Reference '
                  placeholder='MSDS Reference'
                  name={'msdsReference'}
                  multiline={true} // Enable multiline
                  rows={3}
                />
              </Grid2>
            </Grid2>

            <Grid2 container xs={6} spacing={5}>
              <Grid2 item xs={12} sm={6}>
                <Typography component='Box'>
                  <Controller
                    name='status'
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel control={<Switch {...field} checked={field.value} color='primary' />} />
                    )}
                  />
                  Status
                </Typography>
              </Grid2>
            </Grid2>

            <Grid2 item xs={12} className='my-3 '>
              <Button
                variant='contained'
                sx={{ marginRight: 3.5 }}
                type='submit'
              >
                Save Changes
              </Button>
              <Button
                type='reset'
                variant='outlined'
                color='primary'
                onClick={() => {
                  setGtinLastDigit()
                  reset()
                }}
              >
                Reset
              </Button>

              <Button
                variant='outlined'
                color='error'
                sx={{ marginLeft: 3.5 }}
                onClick={() => {
                  setGtinLastDigit()
                  handleCloseModal()
                }}
              >
                Close
              </Button>
            </Grid2>
          </form>
        </FormProvider>
      </Box>
    </Modal>
  )
}
ProductModal.propTypes = {
  openModal: PropTypes.any,
  handleCloseModal: PropTypes.any,
  editData: PropTypes.any,
  handleSubmitForm: PropTypes.any,
  productImage: PropTypes.any,
  setProductImage: PropTypes.any,
  tableHeaderData: PropTypes.any
}
export default ProductModal
