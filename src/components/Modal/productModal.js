import { useEffect, useState } from 'react'
import * as yup from 'yup'
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
  InputAdornment,
  IconButton,
  FormHelperText,
  TextField,
  MenuItem,
  Select,
  InputLabel
} from '@mui/material'
import { style, modalStyle } from 'src/configs/generalConfig'
import CustomTextField from '../CustomTextField'
import CustomDropdown from '../CustomDropdown'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'
import { Bs1Square, Bs2Square, Bs3Square, Bs4Square } from 'react-icons/bs'
import { AiOutlineEye } from 'react-icons/ai'
import { styled } from '@mui/material/styles'
import { api } from 'src/utils/Rest-API'
import { useLoading } from 'src/@core/hooks/useLoading'
import { useRouter } from 'next/router'
import { useAuth } from 'src/Context/AuthContext'

const validationSchema = yup.object().shape({
  productId: yup
    .string()
    .nullable()
    .transform(value => (value == null ? '' : String(value)))
    .trim()
    .max(20, 'Product ID length should be <= 20')
    .required("Product ID can't be empty"),
  productName: yup
    .string()
    .nullable()
    .transform(value => (value == null ? '' : String(value)))
    .trim()
    .max(50, 'Product Name length should be <= 50')
    .matches(/^[a-zA-Z0-9]+\s*(?:[a-zA-Z0-9]+\s*)*$/, 'Product name cannot contain special symbols')
    .required("Product Name can't be empty"),
  gtin: yup
    .string()
    .nullable()
    .transform(value => (value == null ? '' : String(value)))
    .trim()
    .length(12, 'GTIN length should be 12')
    .required('GTIN is required'),
  ndc: yup
    .string()
    .transform(value => {
      // If the value is an empty string, null, or undefined, return empty string
      if (value === '' || value == null) {
        return '' // Return empty string if it's null or empty
      }
      // If the value can be converted to a valid number, return it as string, else return ''
      return isNaN(Number(value)) ? '' : value
    })
    .test('length', 'NDC length should be 10', value => {
      // Only apply the length check if the value is not an empty string
      return value === '' || value?.length === 10
    })
    .optional(),
  mrp: yup
    .number()
    .transform(value => {
      // Check if the value is an empty string, null, or undefined
      if (value === '' || value == null) {
        return 0
      }
      // If the value is a valid number, return it, else return the original value
      return isNaN(value) ? 0 : value
    })
    .min(0, 'MRP cannot be negative'),
  genericName: yup
    .string()
    .optional()
    .nullable()
    .transform(value => (value == null ? '' : String(value)))
    .trim()
    .max(50, 'Generic Name length should be <= 50')
    .notRequired(),
  packagingSize: yup
    .string()
    .nullable()
    .transform(value => (value == null ? '' : String(value)))
    .trim()
    .max(10, 'Packaging Size length should be <= 10')
    .required('Packaging Size is required'),
  generic_salt: yup
    .string()
    .nullable()
    .transform(value => (value == null ? '' : String(value)))
    .trim()
    .required('Generic Salt is required'),
  composition: yup
    .string()
    .nullable()
    .transform(value => (value == null ? '' : String(value)))
    .trim()
    .required('Composition is required'),
  dosage: yup
    .string()
    .nullable()
    .transform(value => (value == null ? '' : String(value)))
    .trim()
    .required('Dosage is required'),
  remarks: yup
    .string()
    .nullable()
    .transform(value => (value == null ? '' : String(value)))
    .trim()
    .required('Remarks is required'),
  companyUuid: yup
    .string()
    .nullable()
    .transform(value => (value == null ? '' : String(value)))
    .trim()
    .required('Company is required'),
  prefix: yup
    .string()
    .nullable()
    .transform(value => (value == null ? '' : String(value)))
    .trim()
    .required('Prefix is required'),
  country: yup
    .string()
    .nullable()
    .transform(value => (value == null ? '' : String(value)))
    .trim()
    .required('Country is required'),
  unit_of_measurement: yup
    .string()
    .nullable()
    .transform(value => (value == null ? '' : String(value)))
    .trim()
    .required('Uom is required'),
  no_of_units_in_primary_level: yup
    .string()
    .nullable()
    .transform(value => (value == null ? '' : String(value)))
    .trim()
    .max(50, 'No Of Units In Primary Level length should be <= 50')
    .required('No Of Units In Primary Level is required'),

  // productImage: yup.mixed().required('Product Image is required'),
  packagingHierarchy: yup.number().required('Packaging Hierarchy is required'),

  productNumber_unit_of_measurement: yup.string().required('Please Select Level 0 UOM'),

  productNumber: yup
    .number()
    .transform(value => {
      // Check if the value is an empty string, null, or undefined
      if (value === '' || value == null) {
        return 0
      }
      // If the value is a valid number, return it, else return the original value
      return isNaN(value) ? 0 : value
    })
    .required('Level 0 value should be greater than 0')
    .min(1, 'Level 0 value should be greater than 0'),
  firstLayer: yup
    .number()
    .nullable()
    .transform((value, originalValue) => {
      if (originalValue === '') {
        return 0
      }
      const parsed = parseFloat(originalValue)
      return isNaN(parsed) ? null : parsed
    })
    .when('packagingHierarchy', (packagingHierarchy, schema) => {
      return packagingHierarchy[0] >= 2
        ? schema.required('Level 1 value should be greater than 0').min(1, 'Level 1 value should be greater than 0')
        : schema
    })
    .test('less-than-level0', 'Level 1 value should be less than level 0', function (value) {
      return !this.parent.productNumber || !value || value <= this.parent.productNumber
    })
    .test('divisible-level0', 'Level 1 value should be divisible with level 0 value', function (value) {
      return !this.parent.productNumber || !value || this.parent.productNumber % value === 0
    }),
  firstLayer_unit_of_measurement: yup.string().when('packagingHierarchy', {
    is: val => val >= 2,
    then: schema => schema.required('Please Select Level 1 UOM')
  }),

  secondLayer: yup
    .number()
    .nullable()
    .transform((value, originalValue) => {
      if (originalValue === '') {
        return 0
      }
      const parsed = parseFloat(originalValue)
      return isNaN(parsed) ? null : parsed
    })
    .when('packagingHierarchy', (packagingHierarchy, schema) => {
      if (packagingHierarchy && packagingHierarchy.length > 0) {
        if (packagingHierarchy[0] >= 3) {
          return schema
            .required('Level 2 value should be greater than 0')
            .min(1, 'Level 2 value should be greater than 0')
        } else {
          return schema
        }
      } else {
        return schema
      }
    }),

  secondLayer_unit_of_measurement: yup.string().when('packagingHierarchy', {
    is: val => val >= 3,
    then: schema => schema.required('Please Select Level 2 UOM')
  }),

  thirdLayer: yup
    .number()
    .nullable()
    .transform((value, originalValue) => {
      if (originalValue === '') {
        return 0
      }
      const parsed = parseFloat(originalValue)
      return isNaN(parsed) ? null : parsed
    })
    .when('packagingHierarchy', (packagingHierarchy, schema) => {
      if (packagingHierarchy && packagingHierarchy.length > 0) {
        if (packagingHierarchy[0] === 4) {
          return schema
            .required('Level 3 value should be greater than 0')
            .min(1, 'Level 3 value should be greater than 0')
        } else {
          return schema
        }
      } else {
        return schema
      }
    }),
  thirdLayer_unit_of_measurement: yup.string().when('packagingHierarchy', {
    is: val => val >= 4,
    then: schema => schema.required('Please Select Level 3 UOM')
  }),

  palletisation_applicable: yup.boolean().optional(),
  pallet_size: yup
    .number()
    .nullable() // Allow null values
    .transform((value, originalValue) => {
      // If the value is an empty string, transform it to undefined
      if (originalValue === '') {
        return 0
      }
      return value
    })
    .optional() // Allow the field to be optional
    .when('palletisation_applicable', {
      is: true,
      then: schema => schema.required('Pallet size is required').min(1, 'Pallet size should be greater than 0'),
      otherwise: schema => schema.nullable() // Allow null or undefined when not applicable
    }),
  file: yup.mixed().optional(),
  pallet_size_unit_of_measurement: yup
    .string()
    .optional()
    .when('palletisation_applicable', {
      is: true,
      then: schema => schema.required('Please Select Pallet Size UOM')
    }),
  productNumber_print: yup.boolean().optional(),
  firstLayer_print: yup.boolean().optional(),
  secondLayer_print: yup.boolean().optional(),
  thirdLayer_print: yup.boolean().optional(),
  productNumber_aggregation: yup.boolean().optional(),
  firstLayer_aggregation: yup.boolean().optional(),
  secondLayer_aggregation: yup.boolean().optional(),
  thirdLayer_aggregation: yup.boolean().optional(),
  schedule_drug: yup.boolean().optional()
})

function ProductModal({
  openModal,
  handleCloseModal,
  editData,
  handleSubmitForm,
  convertImageToBase64,
  productImage,
  setProductImage,
  tableHeaderData
}) {
  const {
    control,
    handleSubmit,
    watch,
    trigger,
    reset,
    setValue,
    clearErrors,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      productId: '',
      productName: '',
      gtin: '',
      ndc: '',
      mrp: '',
      genericName: '',
      packagingSize: '',
      generic_salt: '',
      composition: '',
      dosage: '',
      remarks: '',
      companyUuid: '',
      prefix: '',
      country: '',
      unit_of_measurement: '',
      no_of_units_in_primary_level: '',
      packagingHierarchy: '',
      productNumber: '',
      productNumber_unit_of_measurement: '',
      firstLayer: 0,
      firstLayer_unit_of_measurement: '',
      secondLayer: 0,
      secondLayer_unit_of_measurement: '',
      thirdLayer: 0,
      thirdLayer_unit_of_measurement: '',
      palletisation_applicable: false,
      pallet_size: '0',
      pallet_size_unit_of_measurement: '',
      productImage: '/images/avatars/p.png',
      productNumber_aggregation: false,
      firstLayer_aggregation: false,
      secondLayer_aggregation: false,
      thirdLayer_aggregation: false,
      productNumber_print: false,
      firstLayer_print: false,
      secondLayer_print: false,
      thirdLayer_print: false,
      schedule_drug: false
    }
  })
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
  const companyUuid = watch('companyUuid')
  const { setIsLoading } = useLoading()
  const [companies, setCompanies] = useState([])
  const [countries, setCountries] = useState([])

  const [uoms, setUoms] = useState([])
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    if (!companyUuid) return // Ensure companyUuid exists before running the logic

    const getPrefixData = companies.find(company => company.id === companyUuid)

    if (getPrefixData) {
      let prefixs = [getPrefixData.gs1_prefix].filter(Boolean) // Ensure no undefined values

      if (getPrefixData.gs2_prefix) prefixs.push(getPrefixData.gs2_prefix)
      if (getPrefixData.gs3_prefix) prefixs.push(getPrefixData.gs3_prefix)
      setValue('prefix', prefixs) // Set only if we have valid values
    } else {
      setValue('prefix', []) // Clear if no valid company selected
    }

    if (editData?.prefix) setValue('prefix', editData.prefix.split(',')) // Restore edit data if available
  }, [editData, companyUuid, companies]) // Ensure companies is a dependency

  useEffect(() => {
    getCompanies()
    getCountries()
  }, [tableHeaderData.esignStatus])
  const getUomData = async () => {
    try {
      const res = await api(`/uom`, {}, 'get', true)
      if (res?.data?.success) {
        console.log(res?.data?.data, 'check208')

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
      'productNumber_unit_of_measurement',
      'firstLayer',
      'firstLayer_unit_of_measurement',
      'secondLayer',
      'secondLayer_unit_of_measurement',
      'thirdLayer',
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
      'secondLayer_print'
    ]

    const isValid = await Promise.all(fieldsToValidate.map(field => trigger(field)))
    if (!isValid.every(Boolean)) {
      return
    } else {
      setModalOpen(false)
    }
  }

  const getCompanies = async () => {
    try {
      setIsLoading(true)
      const res = await api('/company/', {}, 'get', true)
      setIsLoading(false)
      console.log('All companies ', res?.data?.data)
      if (res.data.success) {
        setCompanies(res.data.data.companies)
      } else {
        console.log('Error to get all companies ', res.data)
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
      console.log('All companies ', companies)
    } catch (error) {
      console.log('Error in get companies ', error)
      setIsLoading(false)
    }
  }

  const getCountries = async () => {
    try {
      setIsLoading(true)
      const res = await api('/country-master/', {}, 'get', true)
      setIsLoading(false)
      console.log('All country master : ', res?.data?.data)
      if (res.data.success) {
        setCountries(res.data.data.countryMaster)
      } else {
        console.log('Error to get all country master ', res.data)
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
      console.log('All country master  ', countries)
    } catch (error) {
      console.log('Error in get companies ', error)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (editData) {
      reset({
        productId: editData?.product_id || '',
        productName: editData?.product_name || '',
        gtin: editData?.gtin || '',
        ndc: editData?.ndc || '',
        mrp: editData?.mrp || '',
        genericName: editData?.generic_name || '',
        // productImage: editData?.product_image || '/images/avatars/p.png',
        packagingSize: editData?.packaging_size || '',
        companyUuid: editData?.company?.id || '',
        country: editData?.country_id || '',
        firstLayer: editData?.firstLayer || '',
        secondLayer: editData?.secondLayer || '',
        thirdLayer: editData?.thirdLayer || '',
        productNumber_unit_of_measurement: editData?.productNumber_unit_of_measurement || '',
        firstLayer_unit_of_measurement: editData?.firstLayer_unit_of_measurement || '',
        secondLayer_unit_of_measurement: editData?.secondLayer_unit_of_measurement || '',
        thirdLayer_unit_of_measurement: editData?.thirdLayer_unit_of_measurement || '',
        packagingHierarchy: editData?.packagingHierarchy || '',
        productNumber: editData?.productNumber || '',
        productNumber_print: editData?.productNumber_print || false,
        firstLayer_print: editData?.firstLayer_print || false,
        secondLayer_print: editData?.secondLayer_print || false,
        thirdLayer_print: editData?.thirdLayer_print || false,
        productNumber_aggregation: editData?.productNumber_aggregation || false,
        firstLayer_aggregation: editData?.firstLayer_aggregation || false,
        secondLayer_aggregation: editData?.secondLayer_aggregation || false,
        thirdLayer_aggregation: editData?.thirdLayer_aggregation || false,
        generic_salt: editData?.generic_salt || '',
        composition: editData?.composition || '',
        dosage: editData?.dosage || '',
        remarks: editData?.remarks || '',
        palletisation_applicable: editData?.palletisation_applicable || false,
        pallet_size: editData?.pallet_size?.toString() || '',
        pallet_size_unit_of_measurement: editData?.pallet_size_unit_of_measurement || '',
        no_of_units_in_primary_level: editData?.no_of_units_in_primary_level || '',
        prefix: editData.prefix?.split(','),
        unit_of_measurement: editData?.unit_of_measurement || false,
        schedule_drug: editData?.schedule_drug || false
      })
      console.log(
        editData?.product_image &&
          editData?.product_image !== '/images/avatars/p.png' &&
          productImage != '/images/avatars/p.png'
      )
      if (
        editData?.product_image &&
        editData?.product_image !== '/images/avatars/p.png' &&
        productImage != '/images/avatars/p.png'
      ) {
        convertImageToBase64(editData?.productImage, setProductImage)
        setValue('productImage', editData?.productImage)
      }
      setValue('prefix', editData?.prefix?.split(',') || [])
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

  const prefixs = watch('prefix')

  const CountryData = countries?.map(item => ({
    id: item.id,
    value: item.id,
    label: item.country
  }))

  const UOMSData = uoms?.map(item => ({
    id: item.id,
    value: item.id,
    label: item.uom_name
  }))

  const CompanyData = companies?.map(item => ({
    id: item.id,
    value: item.id,
    label: item.company_name
  }))

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

  return (
    <Modal
      open={openModal}
      onClose={handleCloseModal}
      data-testid='modal'
      role='dialog'
      aria-labelledby='modal-modal-title'
      aria-describedby='modal-modal-description'
    >
      <Box sx={{ ...style, width: '80%', height: '85%', overflowY: 'auto' }}>
        <Typography variant='h4' className='my-2'>
          {editData?.id ? 'Edit Product' : 'Add Product'}
        </Typography>
        <form onSubmit={handleSubmit(handleSubmitForm)}>
          <Grid2 item xs={12} className='d-flex justify-content-between align-items-center'>
            <Box>
              <Grid2 container xs={12} sx={{ marginTop: 4.8, marginBottom: 3 }}>
                {/* {console.log("Image :",productImage)} */}
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
                      if (editData?.id) {
                        await convertImageToBase64(editData?.product_image, setProductImage)
                        setValue('productImage', productImage)
                      } else {
                        setProductImage('/images/avatars/p.png')
                        setValue('productImage', '/images/avatars/p.png') // Clear form value
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
            <Grid2 size={4}>
              <CustomTextField
                fullWidth
                control={control}
                label='Product ID'
                placeholder='Product ID'
                name={'productId'}
                disabled={!!editData?.id}
              />
            </Grid2>
            <Grid2 size={4}>
              <CustomTextField label='Product Name' placeholder='Product Name' name={'productName'} control={control} />
            </Grid2>
            <Grid2 size={4}>
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
                    label='GTIN'
                    placeholder='GTIN'
                    onBlur={e => calculateGtinCheckDigit(e.target.value)}
                    onChange={e => {
                      // Ensure the GTIN does not exceed 12 characters
                      if (e.target.value?.length <= 12) {
                        setValue('gtin', e.target.value) // Update value using setValue
                      }
                    }}
                    required
                    error={!!errors.gtin}
                    helperText={errors.gtin ? errors.gtin.message : ''}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position='end'>
                          <Box
                            sx={{
                              backgroundColor: '#f0f0f0',
                              paddingX: '25px',
                              paddingY: errors.gtin ? '16px' : '28px', // Adjust padding based on error
                              borderRadius: '4px',
                              color: '#666'
                            }}
                          >
                            {/* Assuming gtinLastDigit is stored in state */}
                            {gtinLastDigit || ''}
                          </Box>
                        </InputAdornment>
                      ),
                      sx: {
                        paddingRight: 0
                      }
                    }}
                  />
                )}
              />
            </Grid2>
          </Grid2>
          <Grid2 container spacing={2}>
            <Grid2 size={4}>
              <CustomTextField control={control} type='number' label='NDC' placeholder='NDC' name={'ndc'} />
            </Grid2>
            <Grid2 size={4}>
              <CustomTextField type='number' step='0.01' label='MRP' placeholder='MRP' name={'mrp'} control={control} />
            </Grid2>
            <Grid2 size={4}>
              <CustomTextField label='Generic Name' placeholder='Generic Name' name={'genericName'} control={control} />
            </Grid2>
          </Grid2>
          <Grid2 container spacing={2} sx={{ marginBottom: 3 }}>
            <Grid2 size={4}>
              <CustomDropdown options={CompanyData} label='Company *' name={'companyUuid'} control={control} />
            </Grid2>
            <Grid2 size={4}>
            <FormControl fullWidth required error={!!errors.prefix}>
        <InputLabel id="label-prefixs">Prefixs</InputLabel>
        <Controller
          name="prefix"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <Select
              {...field}
              labelId="label-prefixs"
              label="Prefixs *"
              onChange={(e) => {
                field.onChange(e);
                clearErrors("prefix");
              }}
            >
              {Array.isArray(prefixs) &&
                prefixs.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
            </Select>
          )}
        />
        {errors.prefix && <FormHelperText>{errors.prefix.message}</FormHelperText>}
      </FormControl>

            </Grid2>
            <Grid2 size={4}>
              <CustomDropdown label='Country *' name={'country'} control={control} options={CountryData} />
            </Grid2>
          </Grid2>
          <Grid2 container spacing={2}>
            <Grid2 size={4}>
              <CustomTextField
                control={control}
                label='Product Strength'
                placeholder='Product Strength'
                name={'packagingSize'}
              />
            </Grid2>
            <Grid2 size={4}>
              <CustomTextField
                control={control}
                label='No. Of Units in Primary Level'
                placeholder='No. Of Units in Primary Level'
                name={'no_of_units_in_primary_level'}
              />
            </Grid2>
            <Grid2 size={4}>
              <CustomDropdown control={control} label='UOM *' name={'unit_of_measurement'} options={UOMSData} />
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
                      <>
                        <div>
                          <Typography variant='h3' gutterBottom>
                            Please Select Packaging Hierarchy
                          </Typography>
                          <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
                            <li>
                              <Typography variant='body1'>
                                <strong>Option:</strong>{' '}
                                {packagingHierarchy === 1
                                  ? 'Packaging Hierarchy : Single Layer'
                                  : packagingHierarchy === 2
                                    ? 'Packaging Hierarchy : 2 Layers'
                                    : packagingHierarchy === 3
                                      ? 'Packaging Hierarchy : 3 Layers'
                                      : packagingHierarchy === 4
                                        ? 'Packaging Hierarchy : 4 Layers'
                                        : 'No Option Selected'}
                              </Typography>
                            </li>

                            <li>
                              <Typography variant='body1'>
                                <strong>Product Number:</strong> {productNumber}
                              </Typography>
                            </li>

                            {(packagingHierarchy === 4 || packagingHierarchy === 4 || packagingHierarchy === 4) && (
                              <li>
                                <Typography variant='body1'>
                                  <strong>First Level:</strong> {firstLayer}
                                </Typography>
                              </li>
                            )}

                            {(packagingHierarchy === 3 || packagingHierarchy === 4) && (
                              <li>
                                <Typography variant='body1'>
                                  <strong>Second Level:</strong> {secondLayer}
                                </Typography>
                              </li>
                            )}

                            {packagingHierarchy === 4 && (
                              <li>
                                <Typography variant='body1'>
                                  <strong>Third Level:</strong> {thirdLayer}
                                </Typography>
                              </li>
                            )}
                          </ul>
                        </div>
                      </>
                    ) : (
                      ''
                    )}
                  </h2>
                  {packagingHierarchy === 1 && (
                    <>
                      <p id='modal-description'>One Level</p>
                      <Grid2 container size={12} spacing={5} className='mb-2'>
                        <Grid2 size={4}>Level</Grid2>
                        <Grid2 size={3}>Level Uom</Grid2>
                        <Grid2 size={2}>Print</Grid2>
                        <Grid2 size={2}>Aggregation</Grid2>
                      </Grid2>
                      <Grid2 container size={12} spacing={5} className='d-flex align-items-center mb-2'>
                        <Grid2 size={4}>
                          <CustomTextField control={control} label='0th Level' name={'productNumber'} type='number' />
                        </Grid2>
                        <Grid2 size={3}>
                          <CustomDropdown
                            control={control}
                            label='0th Level Uom'
                            name={'productNumber_unit_of_measurement'}
                            options={UOMSData}
                          />
                        </Grid2>
                        <Grid2 size={2}>
                          <Controller
                            name={'productNumber_print'}
                            control={control}
                            render={({ field }) => (
                              <FormControlLabel
                                control={<Switch {...field} checked={field.value} color='primary' role='button' />}
                              />
                            )}
                          />
                        </Grid2>
                        <Grid2 size={2}>
                          <Controller
                            name={'productNumber_aggregation'}
                            control={control}
                            render={({ field }) => (
                              <FormControlLabel
                                control={
                                  <Switch
                                    {...field}
                                    checked={field.value}
                                    name='productNumber_aggregation'
                                    color='primary'
                                    role='button'
                                  />
                                }
                              />
                            )}
                          />
                        </Grid2>
                      </Grid2>
                    </>
                  )}
                  {packagingHierarchy === 2 && (
                    <>
                      <p id='modal-description'>Two Level</p>
                      <Grid2 container size={12} spacing={5} className='mb-2'>
                        <Grid2 size={4}>Level</Grid2>
                        <Grid2 size={3}>Level Uom</Grid2>
                        <Grid2 size={2}>Print</Grid2>
                        <Grid2 size={2}>Aggregation</Grid2>
                      </Grid2>
                      <Grid2 container size={12} spacing={5} className='d-flex align-items-center mb-2'>
                        <Grid2 size={4}>
                          <CustomTextField control={control} label='0th Level' name={'productNumber'} type='number' />
                        </Grid2>
                        <Grid2 size={3}>
                          <CustomDropdown
                            control={control}
                            label='0th Level Uom'
                            name={'productNumber_unit_of_measurement'}
                            options={UOMSData}
                          />
                        </Grid2>
                        <Grid2 size={2}>
                          <Controller
                            name='productNumber_print'
                            control={control}
                            render={({ field }) => (
                              <FormControlLabel
                                control={
                                  <Switch
                                    {...field}
                                    checked={field.value}
                                    name='productNumber_print'
                                    color='primary'
                                    role='button'
                                  />
                                }
                                sx={{
                                  marginLeft: 0
                                }}
                              />
                            )}
                          />
                        </Grid2>
                        <Grid2 size={2}>
                          <Controller
                            name={'productNumber_aggregation'}
                            control={control}
                            render={({ field }) => (
                              <FormControlLabel
                                control={
                                  <Switch
                                    {...field}
                                    checked={field.value}
                                    name='productNumber_aggregation'
                                    color='primary'
                                    role='button'
                                  />
                                }
                                sx={{
                                  marginLeft: 0
                                }}
                              />
                            )}
                          />
                        </Grid2>
                      </Grid2>
                      <Grid2 container size={12} spacing={5} className='d-flex align-items-center mb-2'>
                        <Grid2 size={4}>
                          <CustomTextField control={control} label='First Level' name={'firstLayer'} type='number' />
                        </Grid2>
                        <Grid2 size={3}>
                          <CustomDropdown
                            control={control}
                            label='First Level Uom'
                            labelId='packaging-hierarchy-1st-layer'
                            name={'firstLayer_unit_of_measurement'}
                            options={UOMSData}
                          />
                        </Grid2>
                        <Grid2 size={2}>
                          <Controller
                            control={control}
                            name={'firstLayer_print'}
                            render={({ field }) => (
                              <FormControlLabel
                                control={
                                  <Switch
                                    {...field}
                                    checked={field.value}
                                    name='productNumber_print'
                                    color='primary'
                                    role='button'
                                  />
                                }
                              />
                            )}
                          />
                        </Grid2>
                        <Grid2 size={2}>
                          <Controller
                            control={control}
                            name={'firstLayer_aggregation'}
                            render={({ field }) => (
                              <FormControlLabel
                                control={
                                  <Switch
                                    {...field}
                                    checked={field.value}
                                    name='productNumber_aggregation'
                                    color='primary'
                                    role='button'
                                  />
                                }
                                sx={{
                                  marginLeft: 0
                                }}
                              />
                            )}
                          />
                        </Grid2>
                      </Grid2>
                    </>
                  )}
                  {packagingHierarchy === 3 && (
                    <>
                      <p id='modal-description'>Three Level</p>
                      <Grid2 container size={12} spacing={5} className='mb-2'>
                        <Grid2 size={4}>Level</Grid2>
                        <Grid2 size={3}>Level Uom</Grid2>
                        <Grid2 size={2}>Print</Grid2>
                        <Grid2 size={2}>Aggregation</Grid2>
                      </Grid2>
                      <Grid2 container size={12} spacing={5} className='d-flex align-items-center mb-2'>
                        <Grid2 size={4}>
                          <CustomTextField control={control} label='0th Level' name={'productNumber'} type='number' />
                        </Grid2>
                        <Grid2 size={3}>
                          <CustomDropdown
                            control={control}
                            label='0th Level Uom'
                            name={'productNumber_unit_of_measurement'}
                            options={UOMSData}
                          />
                        </Grid2>
                        <Grid2 size={2}>
                          <Controller
                            name={'productNumber_print'}
                            control={control}
                            render={({ field }) => (
                              <FormControlLabel
                                control={
                                  <Switch
                                    {...field}
                                    checked={field.value}
                                    name='productNumber_print'
                                    color='primary'
                                    role='button'
                                  />
                                }
                                sx={{
                                  marginLeft: 0
                                }}
                              />
                            )}
                          />
                        </Grid2>
                        <Grid2 size={2}>
                          <Controller
                            control={control}
                            name={'productNumber_aggregation'}
                            render={({ field }) => (
                              <FormControlLabel
                                control={
                                  <Switch
                                    {...field}
                                    checked={field.value}
                                    name='productNumber_aggregation'
                                    color='primary'
                                    role='button'
                                  />
                                }
                                sx={{
                                  marginLeft: 0
                                }}
                              />
                            )}
                          />
                        </Grid2>
                      </Grid2>
                      <Grid2 container size={12} spacing={5} className='d-flex align-items-center mb-2'>
                        <Grid2 size={4}>
                          <CustomTextField label='First Level' name={'firstLayer'} type='number' control={control} />
                        </Grid2>
                        <Grid2 size={3}>
                          <CustomDropdown
                            control={control}
                            label='First Level Uom'
                            name={'firstLayer_unit_of_measurement'}
                            options={UOMSData}
                          />
                        </Grid2>
                        <Grid2 size={2}>
                          <Controller
                            control={control}
                            name={'firstLayer_print'}
                            render={({ field }) => (
                              <FormControlLabel
                                control={
                                  <Switch
                                    {...field}
                                    checked={field.value}
                                    name='productNumber_print'
                                    color='primary'
                                    role='button'
                                  />
                                }
                                sx={{
                                  marginLeft: 0
                                }}
                              />
                            )}
                          />
                        </Grid2>
                        <Grid2 size={2}>
                          <Controller
                            name={'firstLayer_aggregation'}
                            control={control}
                            render={({ field }) => (
                              <FormControlLabel
                                control={
                                  <Switch
                                    {...field}
                                    checked={field.value}
                                    name='productNumber_aggregation'
                                    color='primary'
                                    role='button'
                                  />
                                }
                                sx={{
                                  marginLeft: 0
                                }}
                              />
                            )}
                          />
                        </Grid2>
                      </Grid2>
                      <Grid2 container size={12} spacing={5} className='d-flex align-items-center mb-2'>
                        <Grid2 size={4}>
                          <CustomTextField label='Second Level' name={'secondLayer'} type='number' control={control} />
                        </Grid2>
                        <Grid2 size={3}>
                          <CustomDropdown
                            control={control}
                            label='Second Level Uom'
                            name={'secondLayer_unit_of_measurement'}
                            options={UOMSData}
                          />
                        </Grid2>
                        <Grid2 size={2}>
                          <Controller
                            name={'secondLayer_print'}
                            control={control}
                            render={({ field }) => (
                              <FormControlLabel
                                control={
                                  <Switch
                                    {...field}
                                    checked={field.value}
                                    name='productNumber_print'
                                    color='primary'
                                    role='button'
                                  />
                                }
                                sx={{
                                  marginLeft: 0
                                }}
                              />
                            )}
                          />
                        </Grid2>
                        <Grid2 size={2}>
                          <Controller
                            control={control}
                            name={'secondLayer_aggregation'}
                            render={({ field }) => (
                              <FormControlLabel
                                control={
                                  <Switch {...field} name='productNumber_aggregation' color='primary' role='button' />
                                }
                                sx={{
                                  marginLeft: 0
                                }}
                              />
                            )}
                          />
                        </Grid2>
                      </Grid2>
                    </>
                  )}
                  {packagingHierarchy === 4 && (
                    <>
                      <p id='modal-description'>Four Level</p>
                      <Grid2 container size={12} spacing={5} className='mb-2'>
                        <Grid2 size={4}>Level</Grid2>
                        <Grid2 size={3}>Level Uom</Grid2>
                        <Grid2 size={2}>Print</Grid2>
                        <Grid2 size={2}>Aggregation</Grid2>
                      </Grid2>
                      <Grid2 container size={12} spacing={5} className='d-flex align-items-center mb-2'>
                        <Grid2 size={4}>
                          <CustomTextField control={control} label='0th Level' name={'productNumber'} type='number' />
                        </Grid2>
                        <Grid2 size={3}>
                          <CustomDropdown
                            control={control}
                            label='0th Level Uom'
                            name={'productNumber_unit_of_measurement'}
                            options={UOMSData}
                          />
                        </Grid2>
                        <Grid2 size={2}>
                          <Controller
                            control={control}
                            name={'productNumber_print'}
                            render={({ field }) => (
                              <FormControlLabel
                                control={
                                  <Switch
                                    {...field}
                                    checked={field.value}
                                    name='productNumber_print'
                                    color='primary'
                                    role='button'
                                  />
                                }
                                sx={{
                                  marginLeft: 0
                                }}
                              />
                            )}
                          />
                        </Grid2>
                        <Grid2 size={2}>
                          <Controller
                            control={control}
                            name={'productNumber_aggregation'}
                            render={({ field }) => (
                              <FormControlLabel
                                control={
                                  <Switch
                                    {...field}
                                    checked={field.value}
                                    name='productNumber_aggregation'
                                    color='primary'
                                    role='button'
                                  />
                                }
                                sx={{
                                  marginLeft: 0
                                }}
                              />
                            )}
                          />
                        </Grid2>
                      </Grid2>
                      <Grid2 container size={12} spacing={5} className='d-flex align-items-center mb-2'>
                        <Grid2 size={4}>
                          <CustomTextField control={control} label='First layer' name={'firstLayer'} type='number' />
                        </Grid2>
                        <Grid2 size={3}>
                          <CustomDropdown
                            control={control}
                            label='First Level Uom'
                            name={'firstLayer_unit_of_measurement'}
                            options={UOMSData}
                          />
                        </Grid2>
                        <Grid2 size={2}>
                          <Controller
                            name={'firstLayer_print'}
                            control={control}
                            render={({ field }) => (
                              <FormControlLabel
                                control={
                                  <Switch
                                    {...field}
                                    checked={field.value}
                                    name='productNumber_print'
                                    color='primary'
                                    role='button'
                                  />
                                }
                                sx={{
                                  marginLeft: 0
                                }}
                              />
                            )}
                          />
                        </Grid2>
                        <Grid2 size={2}>
                          <Controller
                            control={control}
                            name={'firstLayer_aggregation'}
                            render={({ field }) => (
                              <FormControlLabel
                                control={
                                  <Switch
                                    {...field}
                                    checked={field.value}
                                    name='productNumber_aggregation'
                                    color='primary'
                                    role='button'
                                  />
                                }
                                sx={{
                                  marginLeft: 0
                                }}
                              />
                            )}
                          />
                        </Grid2>
                      </Grid2>
                      <Grid2 container size={12} spacing={5} className='d-flex align-items-center mb-2'>
                        <Grid2 size={4}>
                          <CustomTextField control={control} label='Second layer' name={'secondLayer'} type='number' />
                        </Grid2>
                        <Grid2 size={3}>
                          <CustomDropdown
                            control={control}
                            label='Second Level Uom'
                            name={'secondLayer_unit_of_measurement'}
                            options={UOMSData}
                          />
                        </Grid2>
                        <Grid2 size={2}>
                          <Controller
                            control={control}
                            name={'secondLayer_print'}
                            render={({ field }) => (
                              <FormControlLabel
                                control={
                                  <Switch
                                    {...field}
                                    checked={field.value}
                                    name='productNumber_print'
                                    color='primary'
                                    role='button'
                                  />
                                }
                                sx={{
                                  marginLeft: 0
                                }}
                              />
                            )}
                          />
                        </Grid2>
                        <Grid2 size={2}>
                          <Controller
                            name={'secondLayer_aggregation'}
                            control={control}
                            render={({ field }) => (
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={field.value}
                                    name='productNumber_aggregation'
                                    color='primary'
                                    role='button'
                                  />
                                }
                                sx={{
                                  marginLeft: 0
                                }}
                              />
                            )}
                          />
                        </Grid2>
                      </Grid2>
                      <Grid2 container size={12} spacing={5} className='d-flex align-items-center mb-2'>
                        <Grid2 size={4}>
                          <CustomTextField control={control} label='Third Level' name={'thirdLayer'} type='number' />
                        </Grid2>
                        <Grid2 size={3}>
                          <CustomDropdown
                            control={control}
                            label='Third Level Uom'
                            name={'thirdLayer_unit_of_measurement'}
                            options={UOMSData}
                          />
                        </Grid2>
                        <Grid2 size={2}>
                          <Controller
                            control={control}
                            name={'thirdLayer_print'}
                            render={({ field }) => (
                              <FormControlLabel
                                control={
                                  <Switch
                                    {...field}
                                    checked={field.value}
                                    name='productNumber_print'
                                    color='primary'
                                    role='button'
                                  />
                                }
                                sx={{
                                  marginLeft: 0
                                }}
                              />
                            )}
                          />
                        </Grid2>
                        <Grid2 size={2}>
                          <Controller
                            control={control}
                            name={'thirdLayer_aggregation'}
                            render={({ field }) => (
                              <FormControlLabel
                                control={
                                  <Switch
                                    {...field}
                                    checked={field.value}
                                    name='productNumber_aggregation'
                                    color='primary'
                                    role='button'
                                  />
                                }
                                sx={{
                                  marginLeft: 0
                                }}
                              />
                            )}
                          />
                        </Grid2>
                      </Grid2>
                    </>
                  )}

                  <Grid2 size={12} className={palletisation_applicable ? '' : 'mb-3'}>
                    <Controller
                      control={control}
                      mj
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
                              role='button'
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
                        <CustomTextField control={control} id='pallet_size' label='Pallet size' name={'pallet_size'} />
                      </Grid2>
                      <Grid2 size={4}>
                        <CustomDropdown
                          control={control}
                          label='Pallet size Uom'
                          name={'pallet_size_unit_of_measurement'}
                          options={UOMSData}
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
            <Grid2 size={12}>
              <Typography variant='h5' className='my-2'>
                DGFT Information
              </Typography>
            </Grid2>
            <Grid2 size={5}>
              <CustomTextField label='Generic Salt' control={control} name={'generic_salt'} />
            </Grid2>
            <Grid2 size={5}>
              <CustomTextField label='Composition' name={'composition'} control={control} />
            </Grid2>
            <Grid2 size={5}>
              <CustomTextField control={control} label='Dosage' name={'dosage'} />
            </Grid2>
            <Grid2 size={5}>
              <CustomTextField label='Remarks' name={'remarks'} control={control} />
            </Grid2>
            <Grid2 size={6}>
              <Controller
                name={'schedule_drug'}
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    label='Scheduled Drug?'
                    labelPlacement='start'
                    control={
                      <Switch {...field} checked={field.value} name='schedule_drug' color='primary' role='button' />
                    }
                  />
                )}
              />
            </Grid2>
          </Grid2>
          <Grid2 item xs={12} className='my-3 '>
            <Button variant='contained' sx={{ marginRight: 3.5 }} type='submit'>
              Save Changes
            </Button>
            <Button type='reset' variant='outlined' color='primary' onClick={() =>{setGtinLastDigit(); reset()}}>
              Reset
            </Button>
            <Button variant='outlined' color='error' sx={{ marginLeft: 3.5 }} onClick={() =>{setGtinLastDigit(); handleCloseModal()}}>
              Close
            </Button>
          </Grid2>
        </form>
      </Box>
    </Modal>
  )
}

export default ProductModal
