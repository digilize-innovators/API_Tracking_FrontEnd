import { Controller, useForm } from 'react-hook-form'
import { Modal, Box, Typography, Button, Grid2, Switch, FormControlLabel } from '@mui/material'
import CustomTextField from 'src/components/CustomTextField'
import { style } from 'src/configs/generalConfig'
import { useEffect, useLayoutEffect, useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import CustomDropdown from '../CustomDropdown'
import { useLoading } from 'src/@core/hooks/useLoading'
import { useAuth } from 'src/Context/AuthContext'
import { api } from 'src/utils/Rest-API'
import { useRouter } from 'next/router'

const PrinterLineCongSchema = yup.object().shape({
  printerLineName: yup
    .string()
    .trim()
    .max(50, 'Line name length should be less than 50')
    .matches(/^[a-zA-Z0-9\s-]+$/, 'Line name cannot contain any special symbols')
    .required("Line name can't be empty"),

  locationId: yup.string().trim().required("Location can't be empty"),

  areaCategoryId: yup.string().trim().required("Area category can't be empty"),

  areaId: yup.string().trim().required("Area can't be empty"),

  printerCategoryId: yup
    .string()
    .trim()
    .max(50, 'Printer name length should be less than 50')
    .required('Select Printer Category'),

  printer: yup
    .string()
    .trim()
    .max(50, 'Printer name length should be less than 50')
    .required("Printer name can't be empty"),

  controlpanelId: yup.string().trim().required("Control Panel can't be empty"),

  lineNo: yup
    .string()
    .trim()
    .matches(/^\d+$/, 'Line no. must be a number')
    .test('isValidRange', 'Line no. must be between 1 and 5', value => {
      const num = parseInt(value, 10)
      return num >= 1 && num <= 5
    })
    .required("Line no. can't be empty"),

  cameraEnable: yup.boolean().default(false).optional(),
  cameraId: yup.string().when('cameraEnable', {
    is: true,
    then: schema => schema.required('Camera ID is required when camera is enabled'),
    otherwise: schema => schema.default('')
  }),

  linePcAddress: yup
    .string()
    .matches(
      /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/,
      'Invalid IP address format'
    )
    .required("Line PC Address can't be empty")
})

function PrinterLineConfigurationModal({ open, handleClose, editData, handleSubmitForm }) {
  const {
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(PrinterLineCongSchema),
    defaultValues: {
      printerLineName: '',
      locationId: '',
      areaCategoryId: '',
      areaId: '',
      printerCategoryId: '',
      printer: '',
      controlpanelId:  '',
      lineNo: '',
      cameraEnable: false,
      cameraId: '',
      linePcAddress: '',
      printerEnabled: false
    }
  })
  
  const [allAreaCategory, setAllAreaCategory] = useState([])
  const [allArea, setAllArea] = useState([])
  const [allLocation, setAllLocation] = useState([])
  const [allPrinterCategory, setAllPrinterCatergory] = useState([])
  const [allPrinter, setAllPrinter] = useState([])
  const router = useRouter()
  const [printerCategoryId, setPrinterCategoryId] = useState('')
  const [areaCategoryId, setAreaCategoryId] = useState('')

  const [allControlPanelData, setAllControlPanelData] = useState([])
  const [allCameraMasterData, setAllCameraMasterData] = useState([])

  const { setIsLoading } = useLoading()
  const { removeAuthToken } = useAuth()
  const camera_enable=watch('cameraEnable');
  console.log(camera_enable)
  
  useEffect(() => {
    if (editData) {
      reset({
        printerLineName: editData?.printer_line_name || '',
        locationId: editData?.location_id || '',
        areaCategoryId: editData?.area_category_id || '',
        areaId: editData?.area_id || '',
        printerCategoryId: editData?.printer_category_id || '',
        printer: editData?.printer_id || '',
        controlpanelId: editData?.control_panel_id || '',
        lineNo: editData?.line_no || '',
        cameraEnable: editData?.camera_enable || false,
        cameraId: editData?.cameraId||'' ,
        linePcAddress: editData?.line_pc_ip || '',
        printerEnabled: editData?.enabled || false
      })
    }
  }, [editData])

  useLayoutEffect(() => {
    getAllPrinterCategories()
    getAllAreaCategory()
    getAllLocation()
    getAllControlPanels()
    return () => {}
  }, [])

  useEffect(()=>{
    console.log("camera is ",camera_enable?"no":"off")
    if(camera_enable){
      getAllCameraMaster()
    }
    else if(allCameraMasterData.length && !camera_enable){
    // setAllCameraMasterData([])
    setValue('cameraId','')
    }
  },[camera_enable])

  useEffect(() => {
    if (areaCategoryId !== '') {
      console.log('area cate changed')
      getAllArea()
    }
  }, [areaCategoryId])

  useEffect(() => {
    if (printerCategoryId !== '') {
      getAllPrinterMaster(printerCategoryId)
    }
  }, [printerCategoryId])

  const getAllAreaCategory = async () => {
    try {
      setIsLoading(true)
      const res = await api(`/area-category?limit=-1`, {}, 'get', true)
      setIsLoading(false)
      if (res.data.success) {
        setAllAreaCategory(res.data.data.areaCategories)
      } else {
        console.log('Error to get all area category', res.data)
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('Error in get area category ', error)
      setIsLoading(false)
    }
  }
  const getAllArea = async () => {
    if (areaCategoryId) {
      try {
        setIsLoading(true)
        const res = await api(`/area/byAreaCategory/${areaCategoryId}?limit=-1`, {}, 'get', true)
        setIsLoading(false)
        if (res.data.success) {
          setAllArea(res.data.data.areas)
        } else {
          console.log('Error to get area ', res.data)
          if (res.data.code === 401) {
            removeAuthToken()
            router.push('/401')
          }
        }
      } catch (error) {
        console.log('Error in get area ', error)
        setIsLoading(false)
      }
    }
  }
  const getAllLocation = async () => {
    try {
      setIsLoading(true)
      const res = await api('/location?limit=-1', {}, 'get', true)
      setIsLoading(false)
      if (res.data.success) {
        setAllLocation(res.data.data.locations)
      } else {
        console.log('Error to get all locations ', res.data)
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('Error in get locations ', error)
      setIsLoading(false)
    }
  }
  const getAllPrinterMaster = async printerCategoryID => {
    try {
      setIsLoading(true)
      const res = await api(
        `/printermaster/printerByCategory/?printerCategoryID=${printerCategoryID}&&limit=-1`,
        {},
        'get',
        true
      )
      setIsLoading(false)
      if (res.data.success) {
        setAllPrinter(res.data.data.printerCategories)
      } else {
        console.log('Error to get all printer master ', res.data)
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('Error in get printer master ', error)
      setIsLoading(false)
    }
  }

  const getAllPrinterCategories = async () => {
    try {
      setIsLoading(true)
      const res = await api('/printercategory?limit=-1', {}, 'get', true)
      setIsLoading(false)
      if (res.data.success) {
        setAllPrinterCatergory(res.data.data.printerCategories)
      } else {
        console.log('Error to get all printer category ', res.data)
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('Error in get printer category ', error)
      setIsLoading(false)
    }
  }

  const getAllControlPanels = async () => {
    try {
      setIsLoading(true)
      const res = await api('/controlpanelmaster?limit=-1', {}, 'get', true)
      setIsLoading(false)
      if (res.data.success) {
        setAllControlPanelData(res.data.data.controlPanelMasters)
      } else {
        console.log('Error to get all controlPanelMasters ', res.data)
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('Error in get controlPanelMasters', error)
      setIsLoading(false)
    }
  }
  const getAllCameraMaster = async () => {
    try {
      setIsLoading(true)
      const res = await api('/cameramaster?limit=-1', {}, 'get', true)
      setIsLoading(false)
      if (res.data.success) {
        setAllCameraMasterData(res.data.data.cameraMasters)
      } else {
        console.log('Error to get all Camera Masters ', res.data)
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('Error in get Camera Masters', error)
      setIsLoading(false)
    }
  }
  const locationId = allLocation?.map(item => ({
    id: item.id,
    value: item.id,
    label: item.location_name
  }))
  const AreaCategory = allAreaCategory?.map(item => ({
    id: item.id,
    value: item.id,
    label: item.area_category_name
  }))

  const AreaCategoryId = watch('areaCategoryId')
  const printerCategory = watch('printerCategoryId')
  useEffect(() => {
    setPrinterCategoryId(printerCategory)
    setAreaCategoryId(AreaCategoryId)
  }, [AreaCategoryId, printerCategory])

  const areaName = allArea?.map(item => ({
    id: item.id,
    value: item.id,
    label: item.area_name
  }))
  const printerCategories = allPrinterCategory?.map(item => ({
    id: item.id,
    value: item.id,
    label: item.printer_category_name
  }))

  const printers = allPrinter?.map(item => ({
    id: item.id,
    value: item.id,
    label: item.printer_id
  }))

  const controlPanelData = allControlPanelData?.map(item => ({
    id: item.id,
    value: item.id,
    label: item.name
  }))

  const cameraData = allCameraMasterData?.map(item => ({
    id: item.id,
    value: item.id,
    label: item.name
  }))

  console.log()
  return (
    <Modal
      open={open}
      onClose={handleClose}
      data-testid='modal'
      role='dialog'
      aria-labelledby='modal-modal-title'
      aria-describedby='modal-modal-description'
    >
      <Box sx={style}>
        <Typography variant='h4' className='my-2'>
          {editData?.id ? 'Edit Printer Line Configuration' : 'Add Printer Line Configuration'}
        </Typography>
        <form onSubmit={handleSubmit(handleSubmitForm)}>
          <Grid2 container spacing={2} sx={{ margin: '0.5rem 0rem' }}>
            <Grid2 size={6}>
              <CustomTextField name='printerLineName' label='Printer Line Name' control={control} />
            </Grid2>
            <Grid2 size={6}>
              <CustomDropdown name='locationId' label='Location ' control={control} options={locationId} />
            </Grid2>
          </Grid2>
          <Grid2 container spacing={2} sx={{ margin: '0.5rem 0rem' }}>
            <Grid2 size={6}>
              <CustomDropdown name='areaCategoryId' label='AreaCategory' control={control} options={AreaCategory} />
            </Grid2>
            <Grid2 size={6}>
              <CustomDropdown name='areaId' label='Area' control={control} options={areaName} />
            </Grid2>
          </Grid2>
          <Grid2 container spacing={2} sx={{ margin: '0.5rem 0rem' }}>
            <Grid2 size={6}>
              <CustomDropdown
                name='printerCategoryId'
                label='Printer Category*'
                control={control}
                options={printerCategories}
              />
            </Grid2>
            <Grid2 size={6}>
              <CustomDropdown name='printer' label='printer' control={control} options={printers} />
            </Grid2>
          </Grid2>
          <Grid2 container spacing={2} sx={{ margin: '0.5rem 0rem' }}>
            <Grid2 size={6}>
              <CustomDropdown name='controlpanelId' label='controlpanel' control={control} options={controlPanelData} />
            </Grid2>
            <Grid2 size={6}>
              <CustomTextField name='lineNo' label='Line No' control={control} />
            </Grid2>
          </Grid2>
          <Grid2 container spacing={2} sx={{ margin: '0.5rem 0rem' }}>
            <Grid2 size={6}>
              <Typography>
                <Controller
                  name='printerEnabled'
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel control={<Switch {...field} checked={field.value} color='primary' />} />
                  )}
                />
                Printer Status
              </Typography>
            </Grid2>
            <Grid2 size={6}>
              <CustomTextField name='linePcAddress' label='Line Pc Address' control={control} />
            </Grid2>
          </Grid2>
          <Grid2 container spacing={2} sx={{ margin: '0.5rem 0rem' }}>
            <Grid2 size={6}>
              <Typography>
                <Controller
                  name='cameraEnable'
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel control={<Switch {...field} checked={field.value} color='primary' />} />
                  )}
                />
                Camera Enable
              </Typography>
              {/* <CustomTextField name='cameraIp' label='Camera Ip' control={control} /> */}
            </Grid2>
            {camera_enable && (<Grid2 size={6}>
              <CustomDropdown name='cameraId' label='Camera Name' control={control} options={cameraData} />
            </Grid2>)}
          </Grid2>
          <Grid2 item xs={12} className='mt-3'>
            <Button variant='contained' sx={{ marginRight: 3.5 }} type='submit'>
              Save Changes
            </Button>
            <Button type='reset' variant='outlined' color='primary' onClick={reset}>
              Reset
            </Button>
            <Button variant='outlined' color='error' sx={{ marginLeft: 3.5 }} onClick={handleClose}>
              Close
            </Button>
          </Grid2>
        </form>
      </Box>
    </Modal>
  )
}

export default PrinterLineConfigurationModal
