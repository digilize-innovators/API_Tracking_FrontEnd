'use-client'
import React, { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Select from '@mui/material/Select'
import { styled } from '@mui/material/styles'
import Grid2 from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import {
  Button,
  FormHelperText,
  TextField,
  MenuItem,
  TableContainer,
  Paper,
  IconButton,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Switch,
  InputAdornment
} from '@mui/material'
import Modal from '@mui/material/Modal'
import { IoMdAdd } from 'react-icons/io'
import TableProduct from 'src/views/tables/TableProduct'
import { api } from 'src/utils/Rest-API'
import SnackbarAlert from 'src/components/SnackbarAlert'
import { decrypt } from 'src/utils/Encrypt-Decrypt'
import { useLoading } from 'src/@core/hooks/useLoading'
import ProtectedRoute from 'src/components/ProtectedRoute'
import Head from 'next/head'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useAuth } from 'src/Context/AuthContext'
import { BaseUrl } from '../../../constants'
import { useSettings } from 'src/@core/hooks/useSettings'
import { useRouter } from 'next/router'
import AuthModal from 'src/components/authModal'
import ChatbotComponent from 'src/components/ChatbotComponent'
import AccessibilitySettings from 'src/components/AccessibilitySettings'
import { validateToken } from 'src/utils/ValidateToken'
const mainUrl = BaseUrl
import { style } from 'src/configs/generalConfig'
import { decodeAndSetConfig } from '../../utils/tokenUtils'
import { useApiAccess } from 'src/@core/hooks/useApiAccess'
import ExportResetActionButtons from 'src/components/ExportResetActionButtons'
import SearchBar from 'src/components/SearchBarComponent'
import EsignStatusFilter from 'src/components/EsignStatusFilter'
import { footerContent } from 'src/utils/footerContentPdf'
import { headerContentFix } from 'src/utils/headerContentPdfFix'
import { BsDiamondHalf } from 'react-icons/bs'
import { AiOutlineEye } from 'react-icons/ai'
import { Bs1Square, Bs2Square, Bs3Square, Bs4Square } from 'react-icons/bs'
import { Grid } from 'mdi-material-ui'
import unitOfMeasurement from '../unit-of-measurement'

const Index = () => {
  const router = useRouter()
  const { settings } = useSettings()
  const [openModal, setOpenModal] = useState(false)
  const [productId, setProductId] = useState('')
  const [productName, setProductName] = useState('')
  const [gtin, setGtin] = useState('')
  const [gtinLastDigit, setGtinLastDigit] = useState('')
  const [ndc, setNdc] = useState('')
  const [mrp, setMrp] = useState('')
  const [genericName, setGenericName] = useState('')
  const [packagingSize, setPackagingSize] = useState('')
  const [noOfUnitsInPrimaryLevel, setNoOfUnitsInPrimaryLevel] = useState('')
  const [packagingHierarchy, setPackagingHierarchy] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [packagingHierarchyData, setPackagingHierarchyData] = useState({})
  const [productNumber, setProductNumber] = useState(0)
  const [firstLayer, setFirstLayer] = useState(0)
  const [secondLayer, setSecondLayer] = useState(0)
  const [thirdLayer, setThirdLayer] = useState(0)
  const [productNumberUom, setProductNumberUom] = useState()
  const [firstLayerUom, setFirstLayerUom] = useState()
  const [secondLayerUom, setSecondLayerUom] = useState()
  const [thirdLayerUom, setThirdLayerUom] = useState()
  const [productNumberPrint, setProductNumberPrint] = useState(false)
  const [firstLayerPrint, setFirstLayerPrint] = useState(false)
  const [secondLayerPrint, setSecondLayerPrint] = useState(false)
  const [thirdLayerPrint, setThirdLayerPrint] = useState(false)
  const [productNumberAggregation, setProductNumberAggregation] = useState(false)
  const [firstLayerAggregation, setFirstLayerAggregation] = useState(false)
  const [secondLayerAggregation, setSecondLayerAggregation] = useState(false)
  const [thirdLayerAggregation, setThirdLayerAggregation] = useState(false)
  const [outerLayer, setOuterLayer] = useState(1)
  const [companyUuid, setCompanyUuid] = useState('')
  const [country, setCountry] = useState('')
  const [uom, setUom] = useState('')
  const [prefixs, setPrefixs] = useState([])
  const [prefix, setPrefix] = useState('')
  const [errorPrefix, setErrorPrefix] = useState({ isError: false, message: '' })
  const [companies, setCompanies] = useState([])
  const [countries, setCountries] = useState([])
  const [uoms, setUoms] = useState([]) //TODO : We need to set the dynemic data inside the uoms array.
  const [searchVal, setSearchVal] = useState('')
  const [errorProductId, setErrorProductId] = useState({ isError: false, message: '' })
  const [errorProductName, setErrorProductName] = useState({ isError: false, message: '' })
  const [errorGtin, setErrorGtin] = useState({ isError: false, message: '' })
  const [errorNdc, setErrorNdc] = useState({ isError: false, message: '' })
  const [errorMrp, setErrorMrp] = useState({ isError: false, message: '' })
  const [errorGenericName, setErrorGenericName] = useState({ isError: false, message: '' })
  const [errorPackagingSize, setErrorPackagingSize] = useState({ isError: false, message: '' })
  const [errorProductImage, setErrorProductImage] = useState({ isError: false, message: '' })
  const [errorNoOfUnitsInPrimaryLevel, setErrorNoOfUnitsInPrimaryLevel] = useState({ isError: false, message: '' })
  const [errorPackagingHierarchy, setErrorPackagingHierarchy] = useState({ isError: false, message: '' })
  const [errorCompanyUUid, setErrorCompanyUUid] = useState({ isError: false, message: '' })
  const [errorCountry, setErrorCountry] = useState({ isError: false, message: '' })
  const [errorUom, setErrorUom] = useState({ isError: false, message: '' })
  const [errorLevel0, setErrorLevel0] = useState({ isError: false, message: '' })
  const [errorLevel1, setErrorLevel1] = useState({ isError: false, message: '' })
  const [errorLevel2, setErrorLevel2] = useState({ isError: false, message: '' })
  const [errorLevel3, setErrorLevel3] = useState({ isError: false, message: '' })
  const [errorLevelUom0, setErrorLevelUom0] = useState({ isError: false, message: '' })
  const [errorLevelUom1, setErrorLevelUom1] = useState({ isError: false, message: '' })
  const [errorLevelUom2, setErrorLevelUom2] = useState({ isError: false, message: '' })
  const [errorLevelUom3, setErrorLevelUom3] = useState({ isError: false, message: '' })
  const [errorpalletSizeUom, setErrorpalletSizeUom] = useState({ isError: false, message: '' })
  const [errorpalletSize, setErrorpalletSize] = useState({ isError: false, message: '' })
  const [editData, setEditData] = useState({})
  const [productData, setProductData] = useState([])
  const [sortDirection, setSortDirection] = useState('asc')
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [alertData, setAlertData] = useState({ type: '', message: '', variant: 'filled' })
  const [productImage, setProductImage] = useState('/images/avatars/p.png')
  const [file, setFile] = useState('')
  const [eSignStatus, setESignStatus] = useState('')
  const [tempSearchVal, setTempSearchVal] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(settings.rowsPerPage)
  const [totalRecords, setTotalRecords] = useState(0)
  const { setIsLoading } = useLoading()
  const { getUserData, removeAuthToken } = useAuth()
  const [userDataPdf, setUserDataPdf] = useState()
  const [config, setConfig] = useState(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [approveAPIName, setApproveAPIName] = useState('')
  const [approveAPImethod, setApproveAPImethod] = useState('')
  const [approveAPIEndPoint, setApproveAPIEndPoint] = useState('')
  const [eSignStatusId, setESignStatusId] = useState('')
  const [auditLogMark, setAuditLogMark] = useState('')
  const [esignDownloadPdf, setEsignDownloadPdf] = useState(false)
  const [openModalApprove, setOpenModalApprove] = useState(false)
  const [palletSizeUom, setpalletSizeUom] = useState()
  const [palletSize, setPalletSize] = useState('')
  const [genericSalt, setGenericSalt] = useState('')
  const [composition, setComposition] = useState('')
  const [dosage, setDosage] = useState('')
  const [remarks, setRemarks] = useState('')
  const [errorGenericSalt, setErrorGenericSalt] = useState({ isError: false, message: '' })
  const [errorComposition, setErrorComposition] = useState({ isError: false, message: '' })
  const [errorDosage, setErrorDosage] = useState({ isError: false, message: '' })
  const [errorRemarks, setErrorRemarks] = useState({ isError: false, message: '' })
  const [scheduledDrug, setScheduledDrug] = useState(false)
  const [palletisationApplicable, setPalletisationApplicable] = useState(false)
  const apiAccess = useApiAccess('product-create', 'product-update', 'product-approve')

  const ImgStyled = styled('img')(({ theme }) => ({
    width: 120,
    height: 120,
    marginRight: theme.spacing(6.25),
    borderRadius: theme.shape.borderRadius
  }))
  const ButtonStyled = styled(Button)(({ theme }) => ({
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      textAlign: 'center'
    }
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
  useEffect(() => {
    let data = getUserData()
    setUserDataPdf(data)
    setCompanyUuid(data?.company_uuid || '')
    decodeAndSetConfig(setConfig)
    return () => {}
  }, [])
  useEffect(() => {
    getProducts()
    getCompanies()
    getCountries()
  }, [page, rowsPerPage, eSignStatus, searchVal])

  useEffect(() => {
    const getPrefixData = companies.find(company => company.id === companyUuid)
    if (getPrefixData) {
      let prefixs = [getPrefixData?.gs1_prefix]
      if (getPrefixData?.gs2_prefix) {
        prefixs = [...prefixs, getPrefixData?.gs2_prefix]
      }
      if (getPrefixData?.gs3_prefix) {
        prefixs = [...prefixs, getPrefixData?.gs3_prefix]
      }
      setPrefixs(prefixs)
    }
    setPrefix('')
    if(editData?.prefix) setPrefix(editData?.prefix)
    setErrorCompanyUUid({ isError: false, message: '' })
  
    return () => {
      
    }
  }, [companyUuid])
  

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

    setGtin(input)
    setGtinLastDigit(checkDigit)
  }

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

  const getProducts = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage === -1 ? -1 : rowsPerPage,
        search: searchVal,
        esign_status: eSignStatus
      })
      const res = await api(`/product/?${params.toString()}`, {}, 'get', true)
      setIsLoading(false)
      // console.log('All products ', res?.data?.data)
      if (res.data.success) {
        setProductData(res.data.data.products)
        setTotalRecords(res.data.data.total)
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

  const closeSnackbar = () => {
    setOpenSnackbar(false)
  }
  const handleOpenModal = () => {
    setApproveAPIName('product-create')
    setApproveAPImethod('POST')
    setApproveAPIEndPoint('/api/v1/product')
    resetForm()
    setOpenModal(true)
  }
  const handleCloseModal = () => {
    resetForm()
    setOpenModal(false)
  }
  const resetForm = () => {
    setProductId('')
    setProductName('')
    setGtin('')
    setGtinLastDigit('')
    setNdc('')
    setMrp('')
    setCountry('')
    setUom('')
    setGenericName('')
    setPackagingSize('')
    setNoOfUnitsInPrimaryLevel('')
    setPackagingHierarchy('')
    setFirstLayer(0)
    setSecondLayer(0)
    setThirdLayer(0)
    setProductNumber(0)
    setFirstLayerUom('')
    setSecondLayerUom('')
    setThirdLayerUom('')
    setProductNumberPrint(false)
    setFirstLayerPrint(false)
    setSecondLayerPrint(false)
    setThirdLayerPrint(false)
    setProductNumberAggregation(false)
    setFirstLayerAggregation(false)
    setSecondLayerAggregation(false)
    setThirdLayerAggregation(false)
    setProductNumberUom('')
    setCompanyUuid('')
    setPrefix('')
    setPrefixs([])
    setGenericSalt('')
    setComposition('')
    setDosage('')
    setRemarks('')
    setScheduledDrug(false)
    setPalletisationApplicable(false)
    setErrorProductId({ isError: false, message: '' })
    setErrorPrefix({ isError: false, message: '' })
    setErrorProductName({ isError: false, message: '' })
    setErrorGtin({ isError: false, message: '' })
    setErrorNdc({ isError: false, message: '' })
    setErrorMrp({ isError: false, message: '' })
    setErrorGenericName({ isError: false, message: '' })
    setErrorGenericSalt({ isError: false, message: '' })
    setErrorComposition({ isError: false, message: '' })
    setErrorDosage({ isError: false, message: '' })
    setErrorRemarks({ isError: false, message: '' })
    setErrorPackagingSize({ isError: false, message: '' })
    setErrorNoOfUnitsInPrimaryLevel({ isError: false, message: '' })
    setErrorPackagingHierarchy({ isError: false, message: '' })
    setErrorCompanyUUid({ isError: false, message: '' })
    setErrorPrefix({ isError: false, message: '' })
    setErrorCountry({ isError: false, message: '' })
    setErrorUom({ isError: false, message: '' })
    setErrorProductImage({ isError: false, message: '' })
    setProductImage('/images/avatars/p.png')
    setErrorProductImage({ isError: false, message: '' })
    setProductImage('/images/avatars/p.png')
    setFile('')
    setEditData({})
  }
  const validateLength = (field, value, maxLength, fieldName, required) => {
    if (required && value.length > maxLength) {
      field({ isError: true, message: `${fieldName} length should be <= ${maxLength}` })
    } else if (required && value === '') {
      field({ isError: true, message: `${fieldName} can't be empty` })
    } else {
      field({ isError: false, message: '' })
    }
  }
  const validateNotEmpty = (field, value, fieldName, required = true) => {
    if (required === '' || (!required && !value)) {
      if (required === '' || (!required && !value)) {
        field({ isError: true, message: `${fieldName} can't be empty` })
      } else {
        field({ isError: false, message: '' })
      }
      if (fieldName == 'Product name' && !/^[a-zA-Z0-9]+\s*(?:[a-zA-Z0-9]+\s*)*$/.test(value)) {
        field({ isError: true, message: `${fieldName} cannot contain any special symbols` })
      } else {
        field({ isError: false, message: '' })
      }
    }
  }

  const validateMrp = (field, value) => {
    if (value && value < 0) {
      field({ isError: true, message: "MRP can't be empty" })
    } else {
      field({ isError: false, message: '' })
    }
  }
  const applyValidation = () => {
    validateLength(setErrorProductId, productId.trim(), 20, 'Product ID', true)
    validateLength(setErrorProductName, productName.trim(), 50, 'Product name', true)
    validateLength(setErrorGtin, gtin.trim(), 12, 'GTIN', true)
    validateLength(setErrorNdc, ndc.trim(), 10, 'NDC', false)
    validateMrp(setErrorMrp, mrp, false)
    validateLength(setErrorGenericName, genericName.trim(), 50, 'Generic name', false)
    validateLength(setErrorPackagingSize, packagingSize, 10, 'Packaging Size', true)
    validateNotEmpty(setErrorGenericSalt, genericSalt.trim(), 'Generic Salt', true)
    validateNotEmpty(setErrorComposition, composition.trim(), 'Composition', true)
    validateNotEmpty(setErrorDosage, dosage.trim(), 'Dosage', true)
    validateNotEmpty(setErrorRemarks, remarks.trim(), 'Remarks', true)
    validateNotEmpty(setErrorCompanyUUid, companyUuid.trim(), 'Company', true)
    validateNotEmpty(setErrorPrefix, prefix.trim(), 'Prefixs', true)
    validateNotEmpty(setErrorCountry, country.trim(), 'Country', true)
    validateNotEmpty(setErrorUom, uom.trim(), 'Uom', true)
    validateLength(
      setErrorNoOfUnitsInPrimaryLevel,
      noOfUnitsInPrimaryLevel.trim(),
      50,
      'No Of Units In Primary Level',
      true
    )
    validateNotEmpty(setErrorPackagingHierarchy, packagingHierarchy, 'Packaging Hierarchy', true)
  }

  const checkValidate = () => {
    let isValid = true

    if (!productId || productId.length > 20) {
      setErrorProductId({ isError: true, message: 'Product ID length should be less than 20' })
      isValid = false
    }
    if (!productName.trim() || productName.length > 50) {
      setErrorProductName({ isError: true, message: 'Product Name length should be less than 50' })
      isValid = false
    } else if (!/^[a-zA-Z0-9]+\s*(?:[a-zA-Z0-9]+\s*)*$/.test(productName)) {
      setErrorProductName({ isError: true, message: 'Product name cannot contain any special symbols' })
      isValid = false
    }
    if (!gtin || gtin.length != 12) {
      setErrorGtin({ isError: true, message: 'GTIN length should be 12' })
      isValid = false
    }
    if (mrp < 0) {
      setErrorMrp({ isError: true, message: 'MRP cannot be negative' })
      isValid = false
    }
    if (ndc && ndc.length != 10) {
      setErrorNdc({ isError: true, message: 'NDC length should be 10' })
      isValid = false
    }
    if (genericName && genericName.length > 50) {
      setErrorGenericName({ isError: true, message: 'Generic Name length should be less than 50' })
      isValid = false
    }
    if (!packagingSize || packagingSize.length > 10) {
      setErrorPackagingSize({ isError: true, message: 'Packaging Size length should be less than 10' })
      isValid = false
    }
    if (!companyUuid || companyUuid === '') {
      setErrorCompanyUUid({ isError: true, message: 'Select Company' })
      isValid = false
    }

    if (!prefix || prefix === '') {
      setErrorPrefix({ isError: true, message: 'Select Prefixs' })
      isValid = false
    }

    if (!country || country === '') {
      setErrorCountry({ isError: true, message: 'Select Country' })
      isValid = false
    }
    if (!uom || uom === '') {
      setErrorUom({ isError: true, message: 'Select Uom' })
      isValid = false
    }
    if (!noOfUnitsInPrimaryLevel || noOfUnitsInPrimaryLevel.length > 50) {
      setErrorNoOfUnitsInPrimaryLevel({
        isError: true,
        message: 'No Of Units In Primary Level length should be less than 50'
      })
      isValid = false
    }
    if (!packagingHierarchy) {
      setErrorPackagingHierarchy({ isError: true, message: 'Please Select Packaging Hierarchy' })
      isValid = false
    } else {
      if (!productNumber) {
        setErrorPackagingHierarchy({ isError: true, message: 'Please Enter Packaging Hierarchy Distribution.' })
        isValid = false
      } else {
        setErrorPackagingHierarchy({ isError: false, message: '' })
        isValid = true
      }
    }

    if (!productImage || productImage === '') {
      setErrorProductImage({ isError: true, message: 'Product Image is required' })
      isValid = false
    }

    if (!genericSalt) {
      setErrorGenericSalt({ isError: true, message: 'Generic Salt is required' })
      isValid = false
    }
    if (!composition) {
      setErrorComposition({ isError: true, message: 'Composition is required' })
      isValid = false
    }
    if (!dosage) {
      setErrorDosage({ isError: true, message: 'Dosage is required' })
      isValid = false
    }
    if (!remarks) {
      setErrorRemarks({ isError: true, message: 'Remarks is required' })
      isValid = false
    }

    return isValid
  }

  const resetLevelError = () => {
    setErrorLevel0({ isError: false, message: '' })
    setErrorLevel1({ isError: false, message: '' })
    setErrorLevel2({ isError: false, message: '' })
    setErrorLevel3({ isError: false, message: '' })
    setErrorLevelUom0({ isError: false, message: '' })
    setErrorLevelUom1({ isError: false, message: '' })
    setErrorLevelUom2({ isError: false, message: '' })
    setErrorLevelUom3({ isError: false, message: '' })
    setErrorpalletSize({ isError: false, message: '' })
    setErrorpalletSizeUom({ isError: false, message: '' })
  }

  const handleAuthModalClose = () => {
    setAuthModalOpen(false)
    setOpenModalApprove(false)
  }
  const handleSubmitForm = async () => {
    console.log('submit form')
    if (editData?.id) {
      setApproveAPIName('product-update')
      setApproveAPImethod('PUT')
      setApproveAPIEndPoint('/api/v1/product')
    } else {
      setApproveAPIName('product-create')
      setApproveAPImethod('POST')
      setApproveAPIEndPoint('/api/v1/product')
    }
    applyValidation()
    const validate = checkValidate()
    console.log('Validate ', validate)
    if (!validate) {
      return
    }
    if (config?.config?.esign_status) {
      setAuthModalOpen(true)
      return
    }
    const esign_status = 'approved'
    editData?.id ? editProduct() : addProduct(esign_status)
  }
  const uploadFile = async (file, endpoint) => {
    try {
      if (!file) {
        return { success: true, url: '' }
      }
      let url = ''
      const formData = new FormData()
      formData.append('photo', file)
      const res = await api(endpoint, formData, 'upload', true)
      if (res?.data?.success) {
        const decryptUrl = await decrypt(res.data.data.path)
        url = `${mainUrl}/${decryptUrl}`
        return { url, success: true }
      } else if (res?.data?.code === 401) {
        removeAuthToken()
        router.push('/401')
      } else {
        return { code: res?.data.code, message: res?.data.message, success: false }
      }
    } catch (error) {
      console.error(`Error in uploading file to ${endpoint}`, error)
    }
  }

  const handleAuthResult = async (isAuthenticated, user, isApprover, esignStatus, remarks) => {
    console.log('handleAuthResult', { isAuthenticated, isApprover, esignStatus, user })
    const closeApprovalModal = () => setOpenModalApprove(false)
    const resetState = () => {
      setApproveAPIName('')
      setApproveAPImethod('')
      setApproveAPIEndPoint('')
      setAuthModalOpen(false)
    }
    if (!isAuthenticated) {
      setAlertData({ type: 'error', message: 'Authentication failed, Please try again.' })
      setOpenSnackbar(true)
      resetState()
      return
    }
    const processApproval = async () => {
      const data = {
        modelName: 'product',
        esignStatus,
        id: eSignStatusId,
        audit_log: config.audit_logs
          ? {
              user_id: user.userId,
              user_name: user.userName,
              performed_action: 'approved',
              remarks: remarks || `product approved - ${auditLogMark}`
            }
          : {}
      }
      await api('/esign-status/update-esign-status', data, 'patch', true)
      console.log('eSign status updated')
      if (esignDownloadPdf) {
        downloadPdf()
      }
    }
    const handleEsignStatus = () => {
      if (esignStatus === 'approved') {
        if (esignDownloadPdf) {
          setOpenModalApprove(true)
        } else {
          const esign_status = 'pending'
          editData?.id ? editProduct(esign_status, remarks) : addProduct(esign_status, remarks)
        }
      } else if (esignStatus === 'rejected') {
        closeApprovalModal()
      }
    }
    if (isApprover) {
      if (esignStatus === 'approved' && esignDownloadPdf) {
        closeApprovalModal()
        await processApproval()
      } else {
        await processApproval()
        if (esignStatus === 'rejected') closeApprovalModal()
      }
    } else {
      handleEsignStatus()
    }
    resetState()
    getProducts()
  }
  const handleAuthCheck = async row => {
    console.log('handleAuthCheck', row)
    setApproveAPIName('product-approve')
    setApproveAPImethod('PATCH')
    setApproveAPIEndPoint('/api/v1/product')
    setAuthModalOpen(true)
    setESignStatusId(row.id)
    setAuditLogMark(row.product_id)
    console.log('row', row)
  }
  const addProduct = async (esign_status, aduitRemarks) => {
    const uploadRes = await uploadFile(file, '/upload/productImage')
    if (!uploadRes?.success) {
      setOpenSnackbar(true)
      setAlertData({ ...alertData, type: 'error', message: 'File upload failed' })
      return
    }

    try {
      const data = {
        productId,
        productName,
        gtin,
        ndc,
        mrp: mrp === '' ? null : mrp,
        genericName,
        productImage: uploadRes?.url.split('/').pop(),
        packagingSize,
        companyUuid,
        country,
        firstLayer: firstLayer,
        secondLayer: secondLayer,
        thirdLayer: thirdLayer,
        productNumber_unit_of_measurement: productNumberUom,
        firstLayer_unit_of_measurement: firstLayerUom,
        secondLayer_unit_of_measurement: secondLayerUom,
        thirdLayer_unit_of_measurement: thirdLayerUom,
        packagingHierarchy: packagingHierarchy,
        productNumber: productNumber,
        productNumber_print: productNumberPrint,
        firstLayer_print: firstLayerPrint,
        secondLayer_print: secondLayerPrint,
        thirdLayer_print: thirdLayerPrint,
        productNumber_aggregation: productNumberAggregation,
        firstLayer_aggregation: firstLayerAggregation,
        secondLayer_aggregation: secondLayerAggregation,
        thirdLayer_aggregation: thirdLayerAggregation,
        generic_salt: genericSalt,
        composition: composition,
        dosage: dosage,
        remarks: remarks,
        palletisation_applicable: palletisationApplicable,
        pallet_size: palletSize,
        pallet_size_unit_of_measurement: palletSizeUom,
        no_of_units_in_primary_level: noOfUnitsInPrimaryLevel,
        prefix: prefix,
        unit_of_measurement: uom,
        schedule_drug: scheduledDrug
      }
      const auditlogRemark = aduitRemarks
      const audit_log = config?.config?.audit_logs
        ? {
            audit_log: true,
            performed_action: 'add',
            remarks: auditlogRemark?.length > 0 ? auditlogRemark : `product added - ${productId}`
          }
        : {
            audit_log: false,
            performed_action: 'none',
            remarks: `none`
          }
      data.audit_log = audit_log
      data.esign_status = esign_status
      console.log('Add product data ', data)
      setIsLoading(true)
      const res = await api('/product/', data, 'post', true)
      setIsLoading(false)
      console.log('REs of add product ', res.data)
      if (res?.data?.success) {
        console.log('res data of add product', res?.data)
        setOpenSnackbar(true)
        setAlertData({ ...alertData, type: 'success', message: 'Product added successfully' })
        getProducts()
        resetForm()
      } else {
        console.log('error to add product ', res.data)
        setOpenSnackbar(true)
        setAlertData({ ...alertData, type: 'error', message: res.data?.message })
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('Erorr to add product ', error)
      router.push('/500')
    } finally {
      setOpenModal(false)
      setIsLoading(false)
    }
  }
  const editProduct = async (esign_status, aduitRemarks) => {
    let productImageUrl =
      productImage !== editData.product_image
        ? (await uploadFile(file, '/upload/productImage'))?.url
        : editData.product_image
    if (packagingHierarchy == 1) {
      setFirstLayer(0)
      setSecondLayer(0)
      setThirdLayer(0)
    } else if (packagingHierarchy == 2) {
      setSecondLayer(0)
      setThirdLayer(0)
    } else if (packagingHierarchy == 3) {
      setThirdLayer(0)
    }

    try {
      const data = {
        productName,
        gtin,
        ndc,
        mrp: mrp === '' ? null : mrp,
        genericName,
        productImage: productImageUrl,
        packagingSize,
        no_of_units_in_primary_level: noOfUnitsInPrimaryLevel,
        companyUuid,
        country: country,
        firstLayer: firstLayer,
        secondLayer: secondLayer,
        thirdLayer: thirdLayer,
        packagingHierarchy: packagingHierarchy,
        productNumber: productNumber,
        productNumber_unit_of_measurement: productNumberUom,
        firstLayer_unit_of_measurement: firstLayerUom,
        secondLayer_unit_of_measurement: secondLayerUom,
        thirdLayer_unit_of_measurement: thirdLayerUom,
        productNumber_print: productNumberPrint,
        firstLayer_print: firstLayerPrint,
        secondLayer_print: secondLayerPrint,
        thirdLayer_print: thirdLayerPrint,
        productNumber_aggregation: productNumberAggregation,
        firstLayer_aggregation: firstLayerAggregation,
        secondLayer_aggregation: secondLayerAggregation,
        thirdLayer_aggregation: thirdLayerAggregation,
        generic_salt: genericSalt,
        composition: composition,
        dosage: dosage,
        remarks: remarks,
        palletisation_applicable: palletisationApplicable,
        pallet_size: palletSize,
        pallet_size_unit_of_measurement: palletSizeUom,
        no_of_units_in_primary_level: noOfUnitsInPrimaryLevel,
        prefix: prefix,
        unit_of_measurement: uom,
        schedule_drug: scheduledDrug
      }
      const auditlogRemark = aduitRemarks
      let audit_log
      if (config?.config?.audit_logs) {
        audit_log = {
          audit_log: true,
          performed_action: 'edit',
          remarks: auditlogRemark > 0 ? auditlogRemark : `product edited - ${productName}`
        }
      } else {
        audit_log = {
          audit_log: false,
          performed_action: 'none',
          remarks: `none`
        }
      }
      data.audit_log = audit_log
      data.esign_status = esign_status
      console.log('Edit product data ', data)
      setIsLoading(true)
      const res = await api(`/product/${editData.id}`, data, 'put', true)
      setIsLoading(false)
      if (res?.data?.success) {
        console.log('res of edit product ', res?.data)
        setOpenSnackbar(true)
        setAlertData({ ...alertData, type: 'success', message: 'Product updated successfully' })
        resetForm()
        getProducts()
      } else {
        console.log('error to edit product ', res.data)
        setOpenSnackbar(true)
        setAlertData({ ...alertData, type: 'error', message: res.data.message })
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('Erorr to edit product ', error)
      router.push('/500')
    } finally {
      setOpenModal(false)
      setIsLoading(false)
    }
  }
  const resetEditForm = () => {
    console.log('REset edit field')
    setProductName('')
    setGtin('')
    setGtinLastDigit('')
    setNdc('')
    setMrp('')
    setGenericName('')
    setPackagingSize('')
    setNoOfUnitsInPrimaryLevel('')
    setPackagingHierarchy('')
    setCompanyUuid('')
    setUom('')
    setComposition('')
    setGenericSalt('')
    setDosage('')
    setRemarks('')
    setScheduledDrug(false)
    setPalletisationApplicable(false)
    setPrefix('')
    setPrefixs([])
    setErrorProductId({ isError: false, message: '' })
    setErrorPrefix({ isError: false, message: '' })
    setErrorProductName({ isError: false, message: '' })
    setErrorGtin({ isError: false, message: '' })
    setErrorNdc({ isError: false, message: '' })
    setErrorMrp({ isError: false, message: '' })
    setErrorGenericName({ isError: false, message: '' })
    setErrorPackagingSize({ isError: false, message: '' })
    setErrorNoOfUnitsInPrimaryLevel({ isError: false, message: '' })
    setErrorPackagingHierarchy({ isError: false, message: '' })
    setEditData(prev => ({
      ...prev,
      product_name: '',
      gtin: '',
      ndc: '',
      mrp: '',
      generic_name: '',
      packaging_size: '',
      antidote_statement: '',
      caution_logo: '',
      label: '',
      leaflet: '',
      registration_no: '',
      packaging_hierarchy: '',
      genericSalt: '',
      composition: '',
      dosage: '',
      remarks: '',
      scheduledDrug: false,
      palletisationApplicable: false
    }))
  }
  const handleUpdate = item => {
    resetForm()
    setOpenModal(true)
    setEditData(item)
    console.log('edit product', item)
    setProductId(item.product_id)
    setProductName(item.product_name)
    setGtin(item.gtin)
    setGtinLastDigit(item.gtin?.charAt(item.gtin.length - 1))
    setNdc(item.ndc)
    setCountry(item.country_id)
    setUom(item.uom)
    setMrp(item.mrp)
    setGenericName(item.generic_name)
    setPackagingSize(item.packaging_size)
    setNoOfUnitsInPrimaryLevel(item.no_of_units_in_primary_level)
    console.log('Packaging Hierarchy :', item)
    setPackagingHierarchy(item.packagingHierarchy)
    setCompanyUuid(item.company_uuid)
    setProductNumber(item.productNumber)
    setFirstLayer(item.firstLayer)
    setSecondLayer(item.secondLayer)
    setThirdLayer(item.thirdLayer)
    setProductNumberUom(item.productNumber_unit_of_measurement)
    setFirstLayerUom(item.firstLayer_unit_of_measurement)
    setSecondLayerUom(item.secondLayer_unit_of_measurement)
    setThirdLayerUom(item.thirdLayer_unit_of_measurement)
    setUom(item.unit_of_measurement)
    setProductNumberPrint(item.productNumber_print)
    setFirstLayerPrint(item.firstLayer_print)
    setSecondLayerPrint(item.secondLayer_print)
    setThirdLayerPrint(item.thirdLayer_print)
    setProductNumberAggregation(item.productNumber_aggregation)
    setFirstLayerAggregation(item.firstLayer_aggregation)
    setSecondLayerAggregation(item.secondLayer_aggregation)
    setThirdLayerAggregation(item.thirdLayer_aggregation)
    setGenericSalt(item.generic_salt)
    setComposition(item.composition)
    setDosage(item.dosage)
    setRemarks(item.remarks)
    setPalletisationApplicable(item.palletisation_applicable)
    setPalletSize(item.pallet_size)
    setpalletSizeUom(item.pallet_size_unit_of_measurement)
    setPrefix(item.prefix)
    setScheduledDrug(item.schedule_drug)

    const defaultImage = '/images/avatars/p.png'
    console.log(item.product_image && item.product_image !== defaultImage)
    if (item.product_image && item.product_image !== defaultImage) {
      convertImageToBase64(item.product_image, setProductImage)
    } else {
      setProductImage(defaultImage)
    }
  }
  const convertImageToBase64 = async (imageUrl, setImageState) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const reader = new FileReader()
      reader.onloadend = () => {
        setImageState(reader.result)
      }
      reader.onerror = error => {
        console.error('Error reading the image blob:', error)
      }
      reader.readAsDataURL(blob)
    } catch (error) {
      console.error('Error fetching the image:', error)
    }
  }
  const onChange = event => {
    const reader = new FileReader()
    const { files } = event.target
    if (files && files.length !== 0) {
      reader.onload = () => setProductImage(reader.result)
      reader.readAsDataURL(files[0])
      setFile(event.target.files[0])
    }
  }

  const handleSort = key => {
    const newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc'
    const sorted = [...productData].sort((a, b) => {
      if (a[key] > b[key]) {
        return newSortDirection === 'asc' ? 1 : -1
      }
      if (a[key] < b[key]) {
        return newSortDirection === 'asc' ? -1 : 1
      }
      return 0
    })
    setProductData(sorted)
    setSortDirection(newSortDirection)
  }
  const handleSortById = () => handleSort('product_id')
  const handleSortByName = () => handleSort('product_name')
  const handleSortByGTIN = () => handleSort('gtin')
  const handleSortByNDC = () => handleSort('ndc')
  const handleSortByMRP = () => handleSort('mrp')
  const handleSortByCountry = () => handleSort('country')

  const handleSortByGenericName = () => handleSort('generic_name')
  const resetFilter = () => {
    setESignStatus('')
    setSearchVal('')
    setTempSearchVal('')
  }
  const handleSearch = () => {
    setSearchVal(tempSearchVal.toLowerCase())
    setPage(0)
  }
  const handleTempSearchValue = e => {
    setTempSearchVal(e.target.value.toLowerCase())
  }
  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }
  const handleChangeRowsPerPage = event => {
    const newRowsPerPage = parseInt(event.target.value, 10)
    setRowsPerPage(newRowsPerPage)
    setPage(0)
  }
  const downloadPdf = () => {
    console.log('clicked on download btn')
    const doc = new jsPDF()
    const headerContent = () => {
      headerContentFix(doc, 'Product Master Report')

      if (searchVal) {
        doc.setFontSize(10)
        doc.text('Search : ' + `${tempSearchVal}`, 15, 25)
      } else {
        doc.setFontSize(10)
        doc.text('Search : ' + '__', 15, 25)
      }
      doc.text('Filters :\n', 15, 30)
      if (eSignStatus) {
        doc.setFontSize(10)
        doc.text('E-Sign : ' + `${eSignStatus}`, 20, 35)
      } else {
        doc.setFontSize(10)
        doc.text('E-Sign : ' + '__', 20, 35)
      }
      doc.setFontSize(12)
      doc.text('Product Master Data', 15, 55)
    }
    const bodyContent = () => {
      let currentPage = 1
      let dataIndex = 0
      const totalPages = Math.ceil(productData.length / 25)
      headerContent()
      while (dataIndex < productData.length) {
        if (currentPage > 1) {
          doc.addPage()
        }
        footerContent(currentPage, totalPages, userDataPdf, doc)

        const body = productData
          .slice(dataIndex, dataIndex + 25)
          .map((item, index) => [
            dataIndex + index + 1,
            item.product_id,
            item.product_name,
            item.gtin,
            item.ndc,
            item.mrp,
            item.generic_name,
            item.esign_status
          ])
        autoTable(doc, {
          startY: currentPage === 1 ? 60 : 40,
          styles: { halign: 'center' },
          headStyles: {
            fontSize: 8,
            fillColor: [80, 189, 160]
          },
          alternateRowStyles: { fillColor: [249, 250, 252] },
          tableLineColor: [80, 189, 160],
          tableLineWidth: 0.1,
          head: [['Sr.No.', 'Product Id', 'Product Name', 'Gtin', 'Ndc', 'Mrp', 'Generic Name', 'E-Sign']],
          body: body,
          columnWidth: 'wrap'
        })
        dataIndex += 25
        currentPage++
      }
    }

    bodyContent()
    const currentDate = new Date()
    const formattedDate = currentDate
      .toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
      .replace(/\//g, '-')
    const formattedTime = currentDate.toLocaleTimeString('en-US', { hour12: false }).replace(/:/g, '-')
    const fileName = `Product Master_${formattedDate}_${formattedTime}.pdf`
    doc.save(fileName)
  }
  const handleAuthModalOpen = () => {
    console.log('OPen auth model')
    setApproveAPIName('area-approve')
    setApproveAPImethod('PATCH')
    setApproveAPIEndPoint('/api/v1/area')
    setAuthModalOpen(true)
  }
  const handleDownloadPdf = () => {
    setApproveAPIName('area-create')
    setApproveAPImethod('POST')
    setApproveAPIEndPoint('/api/v1/area')
    if (config?.config?.esign_status) {
      console.log('Esign enabled for download pdf')
      setEsignDownloadPdf(true)
      setAuthModalOpen(true)
      return
    }
    downloadPdf()
  }

  const checkValidateForLayer = () => {
    var isValid = true
    if (packagingHierarchy === 1) {
      if (!productNumber) {
        isValid = false
      }
    } else if (packagingHierarchy === 2) {
      if (!productNumber) {
        isValid = false
      }

      if (!firstLayer) {
        isValid = false
      } else if (firstLayer > productNumber) {
        isValid = false
      } else if (productNumber % firstLayer != 0) {
        isValid = false
      }
    } else if (packagingHierarchy === 3) {
      if (!productNumber) {
        isValid = true
      }
      if (!firstLayer) {
        isValid = false
      } else if (firstLayer > productNumber) {
        isValid = false
      } else if (productNumber % firstLayer != 0) {
        isValid = false
      }

      if (!secondLayer) {
        isValid = false
      } else if (secondLayer > productNumber) {
        isValid = false
      } else if (secondLayer > firstLayer) {
        isValid = false
      } else if (firstLayer % secondLayer != 0) {
        isValid = false
      }
    } else if (packagingHierarchy === 4) {
      if (!productNumber) {
        isValid = false
      }
      if (!firstLayer) {
        isValid = false
      } else if (firstLayer > productNumber) {
        isValid = false
      } else if (productNumber % firstLayer != 0) {
        isValid = false
      }

      if (!secondLayer) {
        isValid = false
      } else if (secondLayer > productNumber) {
        isValid = false
      } else if (secondLayer > firstLayer) {
        isValid = false
      } else if (firstLayer % secondLayer != 0) {
        isValid = false
      }

      if (!thirdLayer) {
        isValid = false
      } else if (thirdLayer > productNumber) {
        isValid = false
      } else if (thirdLayer > firstLayer) {
        isValid = false
      } else if (thirdLayer > secondLayer) {
        isValid = false
      } else if (secondLayer % thirdLayer != 0) {
        isValid = false
      }
    }
    return isValid
  }

  const applyValidationForLayer = () => {
    if (packagingHierarchy === 1) {
      if (!productNumber) {
        setErrorLevel0({ isError: false, message: 'Level 0 value should be greater than 0' })
        setErrorLevel0({ isError: false, message: 'Level 0 value should be greater than 0' })
      }
      if (!productNumberUom) {
        setErrorLevelUom0({ isError: true, message: 'Please Select Level 0 Uom' })
      } else {
        setErrorLevelUom0({ isError: false, message: '' })
      }
    } else if (packagingHierarchy === 2) {
      if (!productNumber) {
        setErrorLevel0({ isError: true, message: 'Level 0 value should be greater than 0' })
        setErrorLevel0({ isError: true, message: 'Level 0 value should be greater than 0' })
      } else {
        setErrorLevel0({ isError: false, message: '' })
      }
      if (!productNumberUom) {
        setErrorLevelUom0({ isError: true, message: 'Please Select Level 0 Uom' })
      } else {
        setErrorLevelUom0({ isError: false, message: '' })
      }
      if (!firstLayer) {
        setErrorLevel1({ isError: true, message: 'Level 1 value should be greater than 0' })
        setErrorLevel1({ isError: true, message: 'Level 1 value should be greater than 0' })
      } else if (firstLayer > productNumber) {
        setErrorLevel1({ isError: true, message: 'Level 1 value should be less than level 0' })
        setErrorLevel1({ isError: true, message: 'Level 1 value should be less than level 0' })
      } else if (productNumber % firstLayer != 0) {
        setErrorLevel1({ isError: true, message: 'Level 1 value should be divisible with level 0 value' })
        setErrorLevel1({ isError: true, message: 'Level 1 value should be divisible with level 0 value' })
      }
      if (!firstLayerUom) {
        setErrorLevelUom1({ isError: true, message: 'Please Select Level 1 Uom' })
      } else {
        setErrorLevelUom1({ isError: false, message: '' })
      }
    } else if (packagingHierarchy === 3) {
      if (!productNumber) {
        setErrorLevel0({ isError: true, message: 'Level 0 value should be greater than 0' })
        setErrorLevel0({ isError: true, message: 'Level 0 value should be greater than 0' })
      }
      if (!firstLayer) {
        setErrorLevel1({ isError: true, message: 'Level 1 value should be greater than 0' })
        setErrorLevel1({ isError: true, message: 'Level 1 value should be greater than 0' })
      } else if (firstLayer > productNumber) {
        setErrorLevel1({ isError: true, message: 'Level 1 value should be less than level0' })
        setErrorLevel1({ isError: true, message: 'Level 1 value should be less than level0' })
      } else if (productNumber % firstLayer != 0) {
        setErrorLevel1({ isError: true, message: 'Level 1 value should be divisible with level 0 value' })
        setErrorLevel1({ isError: true, message: 'Level 1 value should be divisible with level 0 value' })
      }

      if (!secondLayer) {
        setErrorLevel2({ isError: true, message: 'Level2 value should be greater than 0' })
        setErrorLevel2({ isError: true, message: 'Level2 value should be greater than 0' })
      } else if (secondLayer > productNumber) {
        setErrorLevel2({ isError: true, message: 'Level2 value should be less than level 0' })
        setErrorLevel2({ isError: true, message: 'Level2 value should be less than level 0' })
      } else if (secondLayer > firstLayer) {
        setErrorLevel2({ isError: true, message: 'Level2 value should be less than level 1' })
        setErrorLevel2({ isError: true, message: 'Level2 value should be less than level 1' })
      } else if (firstLayer % secondLayer != 0) {
        setErrorLevel2({ isError: true, message: 'Level 2 value should be divisible with level 1 value' })
        setErrorLevel2({ isError: true, message: 'Level 2 value should be divisible with level 1 value' })
      }

      if (!productNumberUom) {
        setErrorLevelUom0({ isError: true, message: 'Please Select Level 0 Uom' })
      } else {
        setErrorLevelUom0({ isError: false, message: '' })
      }
      if (!firstLayerUom) {
        setErrorLevelUom1({ isError: true, message: 'Please Select Level 1 Uom' })
      } else {
        setErrorLevelUom1({ isError: false, message: '' })
      }
      if (!secondLayerUom) {
        setErrorLevelUom2({ isError: true, message: 'Please Select Level 2 Uom' })
      } else {
        setErrorLevelUom2({ isError: false, message: '' })
      }
    } else if (packagingHierarchy === 4) {
      if (!productNumber) {
        setErrorLevel0({ isError: true, message: 'Level 0 value should be greater than 0' })
        setErrorLevel0({ isError: true, message: 'Level 0 value should be greater than 0' })
      }
      if (!firstLayer) {
        setErrorLevel1({ isError: true, message: 'Level 1 value should be greater than 0' })
        setErrorLevel1({ isError: true, message: 'Level 1 value should be greater than 0' })
      } else if (firstLayer > productNumber) {
        setErrorLevel1({ isError: true, message: 'Level 1 value should be less than level 0' })
        setErrorLevel1({ isError: true, message: 'Level 1 value should be less than level 0' })
      } else if (productNumber % firstLayer != 0) {
        setErrorLevel1({ isError: true, message: 'Level 1 value should be divisible with level 0 value' })
        setErrorLevel1({ isError: true, message: 'Level 1 value should be divisible with level 0 value' })
      }

      if (!secondLayer) {
        setErrorLevel2({ isError: true, message: 'Level 2 value should be greater than 0' })
        setErrorLevel2({ isError: true, message: 'Level 2 value should be greater than 0' })
      } else if (secondLayer > productNumber) {
        setErrorLevel2({ isError: true, message: 'Level 2 value should be less than level 0' })
        setErrorLevel2({ isError: true, message: 'Level 2 value should be less than level 0' })
      } else if (secondLayer > firstLayer) {
        setErrorLevel2({ isError: true, message: 'Level 2 value should be less than level 1' })
        setErrorLevel2({ isError: true, message: 'Level 2 value should be less than level 1' })
      } else if (firstLayer % secondLayer != 0) {
        setErrorLevel2({ isError: true, message: 'Level 2 value should be divisible with level1 value' })
        setErrorLevel2({ isError: true, message: 'Level 2 value should be divisible with level1 value' })
      }

      if (!thirdLayer) {
        setErrorLevel3({ isError: true, message: 'Level 3 value should be greater than 0' })
        setErrorLevel3({ isError: true, message: 'Level 3 value should be greater than 0' })
      } else if (thirdLayer > productNumber) {
        setErrorLevel3({ isError: true, message: 'Level 3 value should be less than level 0' })
        setErrorLevel3({ isError: true, message: 'Level 3 value should be less than level 0' })
      } else if (thirdLayer > firstLayer) {
        setErrorLevel3({ isError: true, message: 'Level 3 value should be less than level 1' })
        setErrorLevel3({ isError: true, message: 'Level 3 value should be less than level 1' })
      } else if (thirdLayer > secondLayer) {
        setErrorLevel3({ isError: true, message: 'Level 3 value should be less than level 2' })
        setErrorLevel3({ isError: true, message: 'Level 3 value should be less than level 2' })
      } else if (secondLayer % thirdLayer != 0) {
        setErrorLevel3({ isError: true, message: 'Level3 value should be divisible with level 1 value' })
        setErrorLevel3({ isError: true, message: 'Level3 value should be divisible with level 1 value' })
      }

      if (!productNumberUom) {
        setErrorLevelUom0({ isError: true, message: 'Please Select Level 0 Uom' })
      } else {
        setErrorLevelUom0({ isError: false, message: '' })
      }
      if (!firstLayerUom) {
        setErrorLevelUom1({ isError: true, message: 'Please Select Level 1 Uom' })
      } else {
        setErrorLevelUom1({ isError: false, message: '' })
      }
      if (!secondLayerUom) {
        setErrorLevelUom2({ isError: true, message: 'Please Select Level 2 Uom' })
      } else {
        setErrorLevelUom2({ isError: false, message: '' })
      }
      if (!thirdLayerUom) {
        setErrorLevelUom3({ isError: true, message: 'Please Select Level 3 Uom' })
      } else {
        setErrorLevelUom3({ isError: false, message: '' })
      }
    }
    if (palletisationApplicable) {
      if (!palletSize) {
        setErrorpalletSize({ isError: true, message: 'Pallet size is required' })
      } else {
        setErrorpalletSize({ isError: false, message: '' })
      }
      if (!palletSizeUom) {
        setErrorpalletSizeUom({ isError: true, message: 'Please Select Pallet size Uom' })
      } else {
        setErrorpalletSizeUom({ isError: false, message: '' })
      }
    }
  }
  const applyPackagingHierarchy = () => {
    const tempPackagingHierarchyData = {}
    if (!checkValidateForLayer()) {
      applyValidationForLayer()
      return
    }
    resetLevelError()
    tempPackagingHierarchyData.packagingHierarchy = packagingHierarchy
    tempPackagingHierarchyData.productNumber = productNumber
    tempPackagingHierarchyData.firstLayer = firstLayer
    tempPackagingHierarchyData.secondLayer = secondLayer
    tempPackagingHierarchyData.thirdLayer = thirdLayer
    tempPackagingHierarchyData.outerLayer = outerLayer

    setPackagingHierarchyData(tempPackagingHierarchyData)
    console.log('Packaging Hierarchy Data:', packagingHierarchyData)
    setModalOpen(false)
  }

  const clearPackagingHierarchy = () => {
    setModalOpen(false)
    setProductNumber(0)
    setFirstLayer(0)
    setSecondLayer(0)
    setThirdLayer(0)
    setProductNumberUom('')
    setFirstLayerUom('')
    setSecondLayerUom('')
    setThirdLayerUom('')
    setProductNumberPrint(false)
    setFirstLayerPrint(false)
    setSecondLayerPrint(false)
    setThirdLayerPrint(false)
    setProductNumberAggregation(false)
    setFirstLayerAggregation(false)
    setSecondLayerAggregation(false)
    setThirdLayerAggregation(false)
    setOuterLayer(0)
    setPalletSize('')
    setpalletSizeUom('')
    setPalletisationApplicable(false)
  }

  return (
    <Box padding={4}>
      <Head>
        <title>Product Master</title>
      </Head>
      <Grid2 item xs={12}>
        <Typography variant='h2'>Product Master</Typography>
      </Grid2>
      <Grid2 item xs={12}>
        <Grid2 item xs={12}>
          <Box sx={{ backgroundColor: settings.mode === 'dark' ? '#212121' : 'white', borderRadius: 1 }}>
            <Typography variant='h4' className='mx-4 my-2 mx-2' sx={{ paddingTop: '1%' }}>
              Filter
            </Typography>
            <Grid2 item xs={12}>
              <Box className='d-flex justify-content-between align-items-center my-3 mx-4'>
                <EsignStatusFilter esignStatus={eSignStatus} setEsignStatus={setESignStatus} />
              </Box>
              <Box className='d-flex justify-content-between align-items-center mx-4 my-2'>
                <ExportResetActionButtons handleDownloadPdf={handleDownloadPdf} resetFilter={resetFilter} />
                <Box className='d-flex justify-content-between align-items-center '>
                  <SearchBar
                    searchValue={tempSearchVal}
                    handleSearchChange={handleTempSearchValue}
                    handleSearchClick={handleSearch}
                  />
                  {apiAccess.addApiAccess && (
                    <Box className='mx-2'>
                      <Button variant='contained' className='py-2' onClick={handleOpenModal} role='button'>
                        <span>
                          <IoMdAdd />
                        </span>
                        <span>Add</span>
                      </Button>
                    </Box>
                  )}
                </Box>
              </Box>
            </Grid2>
            <Grid2 item xs={12}>
              <Typography variant='h4' className='mx-4 my-2 mt-3'>
                Product Data
              </Typography>
              <TableContainer component={Paper}>
                <TableProduct
                  productData={productData}
                  handleUpdate={handleUpdate}
                  sortDirection={sortDirection}
                  handleSortById={handleSortById}
                  handleSortByName={handleSortByName}
                  handleSortByGTIN={handleSortByGTIN}
                  handleSortByNDC={handleSortByNDC}
                  handleSortByMRP={handleSortByMRP}
                  handleSortByCountry={handleSortByCountry}
                  handleSortByGenericName={handleSortByGenericName}
                  totalRecords={totalRecords}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  handleChangePage={handleChangePage}
                  handleChangeRowsPerPage={handleChangeRowsPerPage}
                  editable={apiAccess.editApiAccess}
                  handleAuthCheck={handleAuthCheck}
                  apiAccess={apiAccess}
                  config={config}
                />
              </TableContainer>
            </Grid2>
          </Box>
        </Grid2>
      </Grid2>
      <SnackbarAlert openSnackbar={openSnackbar} closeSnackbar={closeSnackbar} alertData={alertData} />
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
          <Grid2 item xs={12} className='d-flex justify-content-between align-items-center'>
            <Box>
              <Grid2 item xs={12} sx={{ marginTop: 4.8, marginBottom: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ImgStyled src={productImage} alt='Profile Pic' />
                  <Box>
                    <ButtonStyled component='label' variant='contained' htmlFor='account-settings-upload-image'>
                      Upload New Photo
                      <input
                        hidden
                        type='file'
                        onChange={onChange}
                        accept='image/png, image/jpeg, image/jpg'
                        id='account-settings-upload-image'
                        required={true}
                      />
                    </ButtonStyled>
                    <ResetButtonStyled
                      color='error'
                      variant='outlined'
                      onClick={() => setProductImage('/images/avatars/p.png')}
                    >
                      Reset
                    </ResetButtonStyled>
                    <Typography variant='body2' sx={{ marginTop: 5 }}>
                      Allowed PNG, JPG or JPEG. Max size of 8MB.
                    </Typography>
                  </Box>
                </Box>
                <Grid2>
                  <FormHelperText error={errorProductImage.isError}>
                    {errorProductImage.isError ? errorProductImage.message : ''}
                  </FormHelperText>
                </Grid2>
              </Grid2>
            </Box>
          </Grid2>
          <Grid2 container spacing={2}>
            <Grid2 size={4}>
              <TextField
                fullWidth
                id='product-id'
                label='Product ID'
                placeholder='Product ID'
                value={productId}
                onChange={e => {
                  setProductId(e.target.value)
                  e.target.value && setErrorProductId({ isError: false, message: '' })
                }}
                required={true}
                error={errorProductId.isError}
                disabled={!!editData?.id}
              />
            </Grid2>
            <Grid2 size={4}>
              <TextField
                fullWidth
                id='product-name'
                label='Product Name'
                placeholder='Product Name'
                value={productName}
                onChange={e => {
                  setProductName(e.target.value)
                  e.target.value && setErrorProductName({ isError: false, message: '' })
                }}
                required={true}
                error={errorProductName.isError}
              />
            </Grid2>
            <Grid2 size={4}>
              <TextField
                fullWidth
                type='number'
                id='gtin'
                label='GTIN'
                placeholder='GTIN'
                value={gtin}
                onBlur={e => {
                  calculateGtinCheckDigit(e.target.value)
                }}
                onChange={e => {
                  if (e.target.value?.length <= 12) {
                    setGtin(e.target.value)
                    if (gtinLastDigit) {
                      setGtinLastDigit('')
                    }
                  }
                  e.target.value && setErrorGtin({ isError: false, message: '' })
                }}
                required={true}
                error={errorGtin.isError}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <Box
                        sx={{
                          backgroundColor: '#f0f0f0',
                          paddingX: '25px',
                          paddingY: gtinLastDigit ? '16px' : '28px',
                          borderRadius: '4px',
                          color: '#666'
                        }}
                      >
                        {gtinLastDigit || ''}
                      </Box>
                    </InputAdornment>
                  ),
                  sx: {
                    paddingRight: 0
                  }
                }}
              />
            </Grid2>
          </Grid2>
          <Grid2 container spacing={2} sx={{ marginBottom: 3 }}>
            <Grid2 size={4}>
              <FormHelperText error={errorProductId.isError}>
                {errorProductId.isError ? errorProductId.message : ''}
              </FormHelperText>
            </Grid2>
            <Grid2 size={4}>
              <FormHelperText error={errorProductName.isError}>
                {errorProductName.isError ? errorProductName.message : ''}
              </FormHelperText>
            </Grid2>
            <Grid2 size={4}>
              <FormHelperText error={errorGtin.isError}>{errorGtin.isError ? errorGtin.message : ''}</FormHelperText>
            </Grid2>
          </Grid2>

          <Grid2 container spacing={2}>
            <Grid2 size={4}>
              <TextField
                fullWidth
                type='number'
                id='ndc'
                label='NDC'
                placeholder='NDC'
                value={ndc}
                onChange={e => {
                  setNdc(e.target.value)
                  e.target.value && setErrorNdc({ isError: false, message: '' })
                }}
                error={errorNdc.isError}
              />
            </Grid2>
            <Grid2 size={4}>
              <TextField
                fullWidth
                type='number'
                step='0.01'
                id='mrp'
                label='MRP'
                placeholder='MRP'
                value={mrp}
                onChange={e => {
                  const value = e.target.value
                  setMrp(value)
                  if (value) {
                    setErrorMrp({ isError: false, message: '' })
                  }
                }}
                onBlur={() => {
                  if (mrp) {
                    setMrp(parseFloat(mrp).toFixed(2))
                  }
                }}
                error={errorMrp.isError}
              />
            </Grid2>
            <Grid2 size={4}>
              <TextField
                fullWidth
                id='generic-name'
                label='Generic Name'
                placeholder='Generic Name'
                value={genericName}
                onChange={e => {
                  setGenericName(e.target.value)
                  e.target.value && setErrorGenericName({ isError: false, message: '' })
                }}
                error={errorGenericName.isError}
              />
            </Grid2>
          </Grid2>
          <Grid2 container spacing={2} sx={{ marginBottom: 3 }}>
            <Grid2 size={4}>
              <FormHelperText error={errorNdc.isError}>{errorNdc.isError ? errorNdc.message : ''}</FormHelperText>
            </Grid2>
            <Grid2 size={4}>
              <FormHelperText error={errorMrp.isError}>{errorMrp.isError ? errorMrp.message : ''}</FormHelperText>
            </Grid2>
            <Grid2 size={4}>
              <FormHelperText error={errorGenericName.isError}>
                {errorGenericName.isError ? errorGenericName.message : ''}
              </FormHelperText>
            </Grid2>
          </Grid2>
          <Grid2 container spacing={2}>
            <Grid2 size={4}>
              <FormControl fullWidth required error={errorCompanyUUid.isError}>
                <InputLabel id='label-company'>Company</InputLabel>
                <Select
                  labelId='label-company'
                  id='company'
                  label='Company *'
                  value={companyUuid}
                  onChange={e => {
                    setCompanyUuid(e.target.value)
                  }}
                >
                  {Array.isArray(companies) &&
                    companies?.map(item => (
                      <MenuItem key={item.id} value={item.id} selected={companyUuid === item.id}>
                        {item.company_name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid2>
            <Grid2 size={4}>
              <FormControl fullWidth required error={errorCompanyUUid.isError}>
                <InputLabel id='label-company'>Prefixs</InputLabel>
                <Select
                  labelId='label-prefixs'
                  id='prefixs'
                  label='Prefixs *'
                  value={prefix}
                  onChange={e => {
                    setPrefix(e.target.value)
                    setErrorPrefix({ isError: false, message: '' })
                  }}
                >
                  {Array.isArray(prefixs) &&
                    prefixs?.map(item => (
                      <MenuItem key={item} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid2>
            <Grid2 size={4}>
              <FormControl fullWidth required error={errorCountry.isError}>
                <InputLabel id='country'>Country</InputLabel>
                <Select
                  labelId='country'
                  id='country'
                  label='Country *'
                  value={country}
                  onChange={e => {
                    setCountry(e.target.value)
                    setErrorCountry({ isError: false, message: '' })
                  }}
                >
                  {countries?.map(item => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.country}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid2>
          </Grid2>
          <Grid2 container spacing={2} sx={{ marginBottom: 3 }}>
            <Grid2 size={4}>
              <FormHelperText error={errorCompanyUUid.isError}>
                {errorCompanyUUid.isError ? errorCompanyUUid.message : ''}
              </FormHelperText>
            </Grid2>
            <Grid2 size={4}>
              <FormHelperText error={errorPrefix.isError}>
                {errorPrefix.isError ? errorPrefix.message : ''}
              </FormHelperText>
            </Grid2>
            <Grid2 size={4}>
              <FormHelperText error={errorCountry.isError}>
                {errorCountry.isError ? errorCountry.message : ''}
              </FormHelperText>
            </Grid2>
          </Grid2>
          <Grid2 container spacing={2}>
            <Grid2 size={4}>
              <TextField
                fullWidth
                id='packaging-size'
                label='Product Strength'
                placeholder='Product Strength'
                value={packagingSize}
                onChange={e => {
                  setPackagingSize(e.target.value)
                  e.target.value && setErrorPackagingSize({ isError: false, message: '' })
                }}
                required={true}
                error={errorPackagingSize.isError}
              />
            </Grid2>
            <Grid2 size={4}>
              <TextField
                fullWidth
                id='no-of-units'
                label='No. Of Units in Primary Level'
                placeholder='No. Of Units in Primary Level'
                value={noOfUnitsInPrimaryLevel}
                onChange={e => {
                  setNoOfUnitsInPrimaryLevel(e.target.value)
                  e.target.value && setErrorNoOfUnitsInPrimaryLevel({ isError: false, message: '' })
                }}
                required={true}
                error={errorNoOfUnitsInPrimaryLevel.isError}
              />
            </Grid2>
            <Grid2 size={4}>
              <FormControl fullWidth required error={errorUom.isError}>
                <InputLabel id='uom'>UOM</InputLabel>
                <Select
                  labelId='uom'
                  id='uom'
                  label='UOM *'
                  value={uom}
                  onChange={e => {
                    setUom(e.target.value)
                    setErrorUom({ isError: false, message: '' })
                  }}
                  required={true}
                  error={errorUom.isError}
                >
                  {uoms?.map(item => (
                    <MenuItem value={item?.id}>{item?.uom_name || ''}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid2>
          </Grid2>
          <Grid2 container spacing={2} sx={{ marginBottom: 3 }}>
            <Grid2 size={4}>
              <FormHelperText error={errorPackagingHierarchy.isError}>
                {errorPackagingSize.isError ? errorPackagingSize.message : ''}
              </FormHelperText>
            </Grid2>
            <Grid2 size={4}>
              <FormHelperText error={errorNoOfUnitsInPrimaryLevel.isError}>
                {errorNoOfUnitsInPrimaryLevel.isError ? errorNoOfUnitsInPrimaryLevel.message : ''}
              </FormHelperText>
            </Grid2>
            <Grid2 size={4}>
              <FormHelperText error={errorUom.isError}>{errorUom.isError ? errorUom.message : ''}</FormHelperText>
            </Grid2>
          </Grid2>

          <Grid2 container spacing={2}>
            <Grid2 size={8}>
              <FormControl component='fieldset' fullWidth error={errorPackagingHierarchy.isError} required>
                <FormLabel component='legend'>Packaging Hierarchy</FormLabel>
                <RadioGroup
                  aria-label='packaging-hierarchy'
                  name='packaging-hierarchy'
                  value={packagingHierarchy}
                  onChange={e => {
                    setPackagingHierarchy(Number(e.target.value))
                    e.target.value && setErrorPackagingHierarchy({ isError: false, message: '' })
                  }}
                  row
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
                    control={<Radio />}
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
              </FormControl>

              <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                aria-labelledby='modal-title'
                aria-describedby='modal-description'
              >
                <Box sx={style}>
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
                          <TextField
                            fullWidth
                            label='0th Level'
                            value={productNumber || ''}
                            error={errorLevel0.isError}
                            helperText={errorLevel0.isError ? errorLevel0.message : ''}
                            type='number'
                            onChange={e => {
                              setProductNumber(Number(e.target.value))
                              setErrorLevel0({ isError: false, message: '' })
                            }}
                            sx={{ mb: 2 }}
                          />
                        </Grid2>
                        <Grid2 size={3}>
                          <FormControl fullWidth error={errorLevelUom0.isError} className='mb-2'>
                            <InputLabel id='packaging-hierarchy-0th-layer'>0th Level Uom</InputLabel>
                            <Select
                              labelId='packaging-hierarchy-0th-layer'
                              id='packaging-hierarchy-0th-layer'
                              value={productNumberUom}
                              label='0th Level Uom'
                              onChange={e => {
                                const selectedValue = e.target.value
                                setProductNumberUom(selectedValue)
                                setErrorLevelUom0({ isError: false, message: '' })
                              }}
                            >
                              {uoms?.map(item => (
                                <MenuItem value={item?.id}>{item?.uom_name || ''}</MenuItem>
                              ))}
                            </Select>
                            {errorLevelUom0.isError && <FormHelperText>{errorLevelUom0.message}</FormHelperText>}
                          </FormControl>
                        </Grid2>
                        <Grid2 size={2}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={productNumberPrint}
                                onChange={event => {
                                  if (productNumberAggregation && !event.target.checked) {
                                    return
                                  }
                                  setProductNumberPrint(event.target.checked)
                                }}
                                name='productNumberPrint'
                                color='primary'
                                role='button'
                              />
                            }
                            sx={{
                              marginLeft: 0
                            }}
                          />
                        </Grid2>
                        <Grid2 size={2}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={productNumberAggregation}
                                onChange={event => {
                                  setProductNumberAggregation(event.target.checked)
                                  if (event.target.checked && !productNumberPrint) {
                                    setProductNumberPrint(event.target.checked)
                                  }
                                }}
                                name='productNumberAggregation'
                                color='primary'
                                role='button'
                              />
                            }
                            sx={{
                              marginLeft: 0
                            }}
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
                          <TextField
                            fullWidth
                            label='0th Level'
                            value={productNumber || ''}
                            error={errorLevel0.isError}
                            helperText={errorLevel0.isError ? errorLevel0.message : ''}
                            type='number'
                            onChange={e => {
                              setProductNumber(Number(e.target.value))
                              setErrorLevel0({ isError: false, message: '' })
                            }}
                            sx={{ mb: 2 }}
                          />
                        </Grid2>
                        <Grid2 size={3}>
                          <FormControl fullWidth error={errorLevelUom0.isError} className='mb-2'>
                            <InputLabel id='packaging-hierarchy-0th-layer'>0th Level Uom</InputLabel>
                            <Select
                              labelId='packaging-hierarchy-0th-layer'
                              id='packaging-hierarchy-0th-layer'
                              value={productNumberUom}
                              label='0th Level Uom'
                              onChange={e => {
                                const selectedValue = e.target.value
                                setProductNumberUom(selectedValue)
                                setErrorLevelUom0({ isError: false, message: '' })
                              }}
                            >
                              {uoms?.map(item => (
                                <MenuItem value={item?.id}>{item?.uom_name || ''}</MenuItem>
                              ))}
                            </Select>
                            {errorLevelUom0.isError && <FormHelperText>{errorLevelUom0.message}</FormHelperText>}
                          </FormControl>
                        </Grid2>
                        <Grid2 size={2}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={productNumberPrint}
                                onChange={event => {
                                  if (productNumberAggregation && !event.target.checked) {
                                    return
                                  }
                                  setProductNumberPrint(event.target.checked)
                                }}
                                name='productNumberPrint'
                                color='primary'
                                role='button'
                              />
                            }
                            sx={{
                              marginLeft: 0
                            }}
                          />
                        </Grid2>
                        <Grid2 size={2}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={productNumberAggregation}
                                onChange={event => {
                                  setProductNumberAggregation(event.target.checked)
                                  if (event.target.checked && !productNumberPrint) {
                                    setProductNumberPrint(event.target.checked)
                                  }
                                }}
                                name='productNumberAggregation'
                                color='primary'
                                role='button'
                              />
                            }
                            sx={{
                              marginLeft: 0
                            }}
                          />
                        </Grid2>
                      </Grid2>
                      <Grid2 container size={12} spacing={5} className='d-flex align-items-center mb-2'>
                        <Grid2 size={4}>
                          <TextField
                            fullWidth
                            label='First Level'
                            value={firstLayer || ''}
                            type='number'
                            error={errorLevel1.isError}
                            helperText={errorLevel1.isError ? errorLevel1.message : ''}
                            onChange={e => {
                              setFirstLayer(Number(e.target.value))
                              setErrorLevel1({ isError: false, message: '' })
                            }}
                            sx={{ mb: 2 }}
                          />
                        </Grid2>
                        <Grid2 size={3}>
                          <FormControl fullWidth error={errorLevelUom1.message} className='mb-2'>
                            <InputLabel id='packaging-hierarchy-1st-layer'>First Level Uom</InputLabel>
                            <Select
                              labelId='packaging-hierarchy-1st-layer'
                              id='packaging-hierarchy-1st-layer'
                              value={firstLayerUom}
                              label='First Level Uom'
                              onChange={e => {
                                setFirstLayerUom(e.target.value)
                                setErrorLevelUom1({ isError: false, message: '' })
                              }}
                            >
                              {uoms?.map(item => (
                                <MenuItem value={item?.id}>{item?.uom_name || ''}</MenuItem>
                              ))}
                            </Select>
                            {errorLevelUom1.message && <FormHelperText>{errorLevelUom1.message}</FormHelperText>}
                          </FormControl>
                        </Grid2>
                        <Grid2 size={2}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={firstLayerPrint}
                                onChange={event => {
                                  if (firstLayerAggregation && !event.target.checked) {
                                    return
                                  }
                                  setFirstLayerPrint(event.target.checked)
                                }}
                                name='productNumberPrint'
                                color='primary'
                                role='button'
                              />
                            }
                            sx={{
                              marginLeft: 0
                            }}
                          />
                        </Grid2>
                        <Grid2 size={2}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={firstLayerAggregation}
                                onChange={event => {
                                  setFirstLayerAggregation(event.target.checked)
                                  if (event.target.checked && !firstLayerPrint) {
                                    setFirstLayerPrint(event.target.checked)
                                  }
                                }}
                                name='productNumberAggregation'
                                color='primary'
                                role='button'
                              />
                            }
                            sx={{
                              marginLeft: 0
                            }}
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
                          <TextField
                            fullWidth
                            label='0th Level'
                            value={productNumber || ''}
                            error={errorLevel0.isError}
                            helperText={errorLevel0.isError ? errorLevel0.message : ''}
                            type='number'
                            onChange={e => {
                              setProductNumber(Number(e.target.value))
                              setErrorLevel0({ isError: false, message: '' })
                            }}
                            sx={{ mb: 2 }}
                          />
                        </Grid2>
                        <Grid2 size={3}>
                          <FormControl fullWidth error={errorLevelUom0.isError} className='mb-2'>
                            <InputLabel id='packaging-hierarchy-0th-layer'>0th Level Uom</InputLabel>
                            <Select
                              labelId='packaging-hierarchy-0th-layer'
                              id='packaging-hierarchy-0th-layer'
                              value={productNumberUom}
                              label='0th Level Uom'
                              onChange={e => {
                                const selectedValue = e.target.value
                                setProductNumberUom(selectedValue)
                                setErrorLevelUom0({ isError: false, message: '' })
                              }}
                            >
                              {uoms?.map(item => (
                                <MenuItem value={item?.id}>{item?.uom_name || ''}</MenuItem>
                              ))}
                            </Select>
                            {errorLevelUom0.isError && <FormHelperText>{errorLevelUom0.message}</FormHelperText>}
                          </FormControl>
                        </Grid2>
                        <Grid2 size={2}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={productNumberPrint}
                                onChange={event => {
                                  if (productNumberAggregation && !event.target.checked) {
                                    return
                                  }
                                  setProductNumberPrint(event.target.checked)
                                }}
                                name='productNumberPrint'
                                color='primary'
                                role='button'
                              />
                            }
                            sx={{
                              marginLeft: 0
                            }}
                          />
                        </Grid2>
                        <Grid2 size={2}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={productNumberAggregation}
                                onChange={event => {
                                  setProductNumberAggregation(event.target.checked)
                                  if (event.target.checked && !productNumberPrint) {
                                    setProductNumberPrint(event.target.checked)
                                  }
                                }}
                                name='productNumberAggregation'
                                color='primary'
                                role='button'
                              />
                            }
                            sx={{
                              marginLeft: 0
                            }}
                          />
                        </Grid2>
                      </Grid2>
                      <Grid2 container size={12} spacing={5} className='d-flex align-items-center mb-2'>
                        <Grid2 size={4}>
                          <TextField
                            fullWidth
                            label='First Level'
                            value={firstLayer || ''}
                            type='number'
                            error={errorLevel1.isError}
                            helperText={errorLevel1.isError ? errorLevel1.message : ''}
                            onChange={e => {
                              setFirstLayer(Number(e.target.value))
                              setErrorLevel1({ isError: false, message: '' })
                            }}
                            sx={{ mb: 2 }}
                          />
                        </Grid2>
                        <Grid2 size={3}>
                          <FormControl fullWidth error={errorLevelUom1.message} className='mb-2'>
                            <InputLabel id='packaging-hierarchy-1st-layer'>First Level Uom</InputLabel>
                            <Select
                              labelId='packaging-hierarchy-1st-layer'
                              id='packaging-hierarchy-1st-layer'
                              value={firstLayerUom}
                              label='First Level Uom'
                              onChange={e => {
                                setFirstLayerUom(e.target.value)
                                setErrorLevelUom1({ isError: false, message: '' })
                              }}
                            >
                              {uoms?.map(item => (
                                <MenuItem value={item?.id}>{item?.uom_name || ''}</MenuItem>
                              ))}
                            </Select>
                            {errorLevelUom1.message && <FormHelperText>{errorLevelUom1.message}</FormHelperText>}
                          </FormControl>
                        </Grid2>
                        <Grid2 size={2}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={firstLayerPrint}
                                onChange={event => {
                                  if (firstLayerAggregation && !event.target.checked) {
                                    return
                                  }
                                  setFirstLayerPrint(event.target.checked)
                                }}
                                name='productNumberPrint'
                                color='primary'
                                role='button'
                              />
                            }
                            sx={{
                              marginLeft: 0
                            }}
                          />
                        </Grid2>
                        <Grid2 size={2}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={firstLayerAggregation}
                                onChange={event => {
                                  setFirstLayerAggregation(event.target.checked)
                                  if (event.target.checked && !firstLayerPrint) {
                                    setFirstLayerPrint(event.target.checked)
                                  }
                                }}
                                name='productNumberAggregation'
                                color='primary'
                                role='button'
                              />
                            }
                            sx={{
                              marginLeft: 0
                            }}
                          />
                        </Grid2>
                      </Grid2>
                      <Grid2 container size={12} spacing={5} className='d-flex align-items-center mb-2'>
                        <Grid2 size={4}>
                          <TextField
                            fullWidth
                            label='Second Level'
                            value={secondLayer || ''}
                            type='number'
                            error={errorLevel2.isError}
                            helperText={errorLevel2.isError ? errorLevel2.message : ''}
                            onChange={e => {
                              setSecondLayer(Number(e.target.value))
                              setErrorLevel2({ isError: false, message: '' })
                            }}
                            sx={{ mb: 2 }}
                          />
                        </Grid2>
                        <Grid2 size={3}>
                          <FormControl fullWidth error={errorLevelUom2.message} className='mb-2'>
                            <InputLabel id='packaging-hierarchy-2nd-layer'>Second Level Uom</InputLabel>
                            <Select
                              labelId='packaging-hierarchy-2nd-layer'
                              id='packaging-hierarchy-2nd-layer'
                              value={secondLayerUom}
                              label='Second Level Uom'
                              onChange={e => {
                                setSecondLayerUom(e.target.value)
                                setErrorLevelUom2({ isError: false, message: '' })
                              }}
                            >
                              {uoms?.map(item => (
                                <MenuItem value={item?.id}>{item?.uom_name || ''}</MenuItem>
                              ))}
                            </Select>
                            {errorLevelUom2.message && <FormHelperText>{errorLevelUom2.message}</FormHelperText>}
                          </FormControl>
                        </Grid2>
                        <Grid2 size={2}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={secondLayerPrint}
                                onChange={event => {
                                  if (secondLayerAggregation && !event.target.checked) {
                                    return
                                  }
                                  setSecondLayerPrint(event.target.checked)
                                }}
                                name='productNumberPrint'
                                color='primary'
                                role='button'
                              />
                            }
                            sx={{
                              marginLeft: 0
                            }}
                          />
                        </Grid2>
                        <Grid2 size={2}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={secondLayerAggregation}
                                onChange={event => {
                                  setSecondLayerAggregation(event.target.checked)
                                  if (event.target.checked && !secondLayerPrint) {
                                    setSecondLayerPrint(event.target.checked)
                                  }
                                }}
                                name='productNumberAggregation'
                                color='primary'
                                role='button'
                              />
                            }
                            sx={{
                              marginLeft: 0
                            }}
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
                          <TextField
                            fullWidth
                            label='0th Level'
                            value={productNumber || ''}
                            error={errorLevel0.isError}
                            helperText={errorLevel0.isError ? errorLevel0.message : ''}
                            type='number'
                            onChange={e => {
                              setProductNumber(Number(e.target.value))
                              setErrorLevel0({ isError: false, message: '' })
                            }}
                            sx={{ mb: 2 }}
                          />
                        </Grid2>
                        <Grid2 size={3}>
                          <FormControl fullWidth error={errorLevelUom0.isError} className='mb-2'>
                            <InputLabel id='packaging-hierarchy-0th-layer'>0th Level Uom</InputLabel>
                            <Select
                              labelId='packaging-hierarchy-0th-layer'
                              id='packaging-hierarchy-0th-layer'
                              value={productNumberUom}
                              label='0th Level Uom'
                              onChange={e => {
                                const selectedValue = e.target.value
                                setProductNumberUom(selectedValue)
                                setErrorLevelUom0({ isError: false, message: '' })
                              }}
                            >
                              {uoms?.map(item => (
                                <MenuItem value={item?.id}>{item?.uom_name || ''}</MenuItem>
                              ))}
                            </Select>
                            {errorLevelUom0.isError && <FormHelperText>{errorLevelUom0.message}</FormHelperText>}
                          </FormControl>
                        </Grid2>
                        <Grid2 size={2}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={productNumberPrint}
                                onChange={event => {
                                  if (productNumberAggregation && !event.target.checked) {
                                    return
                                  }
                                  setProductNumberPrint(event.target.checked)
                                }}
                                name='productNumberPrint'
                                color='primary'
                                role='button'
                              />
                            }
                            sx={{
                              marginLeft: 0
                            }}
                          />
                        </Grid2>
                        <Grid2 size={2}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={productNumberAggregation}
                                onChange={event => {
                                  setProductNumberAggregation(event.target.checked)
                                  if (event.target.checked && !productNumberPrint) {
                                    setProductNumberPrint(event.target.checked)
                                  }
                                }}
                                name='productNumberAggregation'
                                color='primary'
                                role='button'
                              />
                            }
                            sx={{
                              marginLeft: 0
                            }}
                          />
                        </Grid2>
                      </Grid2>
                      <Grid2 container size={12} spacing={5} className='d-flex align-items-center mb-2'>
                        <Grid2 size={4}>
                          <TextField
                            fullWidth
                            label='First layer'
                            value={firstLayer || ''}
                            type='number'
                            error={errorLevel1.isError}
                            helperText={errorLevel1.isError ? errorLevel1.message : ''}
                            onChange={e => {
                              setFirstLayer(Number(e.target.value))
                              setErrorLevel1({ isError: false, message: '' })
                            }}
                            sx={{ mb: 2 }}
                          />
                        </Grid2>
                        <Grid2 size={3}>
                          <FormControl fullWidth error={errorLevelUom1.message} className='mb-2'>
                            <InputLabel id='packaging-hierarchy-1st-layer'>First Level Uom</InputLabel>
                            <Select
                              labelId='packaging-hierarchy-1st-layer'
                              id='packaging-hierarchy-1st-layer'
                              value={firstLayerUom}
                              label='First Level Uom'
                              onChange={e => {
                                setFirstLayerUom(e.target.value)
                                setErrorLevelUom1({ isError: false, message: '' })
                              }}
                            >
                              {uoms?.map(item => (
                                <MenuItem value={item?.id}>{item?.uom_name || ''}</MenuItem>
                              ))}
                            </Select>
                            {errorLevelUom1.message && <FormHelperText>{errorLevelUom1.message}</FormHelperText>}
                          </FormControl>
                        </Grid2>
                        <Grid2 size={2}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={firstLayerPrint}
                                onChange={event => {
                                  if (firstLayerAggregation && !event.target.checked) {
                                    return
                                  }
                                  setFirstLayerPrint(event.target.checked)
                                }}
                                name='productNumberPrint'
                                color='primary'
                                role='button'
                              />
                            }
                            sx={{
                              marginLeft: 0
                            }}
                          />
                        </Grid2>
                        <Grid2 size={2}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={firstLayerAggregation}
                                onChange={event => {
                                  setFirstLayerAggregation(event.target.checked)
                                  if (event.target.checked && !firstLayerPrint) {
                                    setFirstLayerPrint(event.target.checked)
                                  }
                                }}
                                name='productNumberAggregation'
                                color='primary'
                                role='button'
                              />
                            }
                            sx={{
                              marginLeft: 0
                            }}
                          />
                        </Grid2>
                      </Grid2>
                      <Grid2 container size={12} spacing={5} className='d-flex align-items-center mb-2'>
                        <Grid2 size={4}>
                          <TextField
                            fullWidth
                            label='Second layer'
                            value={secondLayer || ''}
                            type='number'
                            error={errorLevel2.isError}
                            helperText={errorLevel2.isError ? errorLevel2.message : ''}
                            onChange={e => {
                              setSecondLayer(Number(e.target.value))
                              setErrorLevel2({ isError: false, message: '' })
                            }}
                            sx={{ mb: 2 }}
                          />
                        </Grid2>
                        <Grid2 size={3}>
                          <FormControl fullWidth error={errorLevelUom2.message} className='mb-2'>
                            <InputLabel id='packaging-hierarchy-2nd-layer'>Second Level Uom</InputLabel>
                            <Select
                              labelId='packaging-hierarchy-2nd-layer'
                              id='packaging-hierarchy-2nd-layer'
                              value={secondLayerUom}
                              label='Second Level Uom'
                              onChange={e => {
                                setSecondLayerUom(e.target.value)
                                setErrorLevelUom2({ isError: false, message: '' })
                              }}
                            >
                              {uoms?.map(item => (
                                <MenuItem value={item?.id}>{item?.uom_name || ''}</MenuItem>
                              ))}
                            </Select>
                            {errorLevelUom2.message && <FormHelperText>{errorLevelUom2.message}</FormHelperText>}
                          </FormControl>
                        </Grid2>
                        <Grid2 size={2}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={secondLayerPrint}
                                onChange={event => {
                                  if (secondLayerAggregation && !event.target.checked) {
                                    return
                                  }
                                  setSecondLayerPrint(event.target.checked)
                                }}
                                name='productNumberPrint'
                                color='primary'
                                role='button'
                              />
                            }
                            sx={{
                              marginLeft: 0
                            }}
                          />
                        </Grid2>
                        <Grid2 size={2}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={secondLayerAggregation}
                                onChange={event => {
                                  setSecondLayerAggregation(event.target.checked)
                                  if (event.target.checked && !secondLayerPrint) {
                                    setSecondLayerPrint(event.target.checked)
                                  }
                                }}
                                name='productNumberAggregation'
                                color='primary'
                                role='button'
                              />
                            }
                            sx={{
                              marginLeft: 0
                            }}
                          />
                        </Grid2>
                      </Grid2>
                      <Grid2 container size={12} spacing={5} className='d-flex align-items-center mb-2'>
                        <Grid2 size={4}>
                          <TextField
                            fullWidth
                            label='Third Level'
                            value={thirdLayer || ''}
                            type='number'
                            error={errorLevel3.isError}
                            helperText={errorLevel3.isError ? errorLevel3.message : ''}
                            onChange={e => {
                              setThirdLayer(Number(e.target.value))
                              setErrorLevel3({ isError: false, message: '' })
                            }}
                            sx={{ mb: 2 }}
                          />
                        </Grid2>
                        <Grid2 size={3}>
                          <FormControl fullWidth error={errorLevelUom3.message} className='mb-2'>
                            <InputLabel id='packaging-hierarchy-3rd-layer'>Third layer Uom</InputLabel>
                            <Select
                              labelId='packaging-hierarchy-3rd-layer'
                              id='packaging-hierarchy-3rd-layer'
                              value={thirdLayerUom}
                              label='Third Level Uom'
                              onChange={e => {
                                setThirdLayerUom(e.target.value)
                                setErrorLevelUom3({ isError: false, message: '' })
                              }}
                            >
                              {uoms?.map(item => (
                                <MenuItem value={item?.id}>{item?.uom_name || ''}</MenuItem>
                              ))}
                            </Select>
                            {errorLevelUom3.message && <FormHelperText>{errorLevelUom3.message}</FormHelperText>}
                          </FormControl>
                        </Grid2>
                        <Grid2 size={2}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={thirdLayerPrint}
                                onChange={event => {
                                  if (thirdLayerAggregation && !event.target.value) {
                                    return
                                  }
                                  setThirdLayerPrint(event.target.checked)
                                }}
                                name='productNumberPrint'
                                color='primary'
                                role='button'
                              />
                            }
                            sx={{
                              marginLeft: 0
                            }}
                          />
                        </Grid2>
                        <Grid2 size={2}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={thirdLayerAggregation}
                                onChange={event => {
                                  setThirdLayerAggregation(event.target.checked)
                                  if (event.target.checked && !thirdLayerPrint) {
                                    setThirdLayerPrint(event.target.checked)
                                  }
                                }}
                                name='productNumberAggregation'
                                color='primary'
                                role='button'
                              />
                            }
                            sx={{
                              marginLeft: 0
                            }}
                          />
                        </Grid2>
                      </Grid2>
                    </>
                  )}

                  <Grid2 size={12} className={palletisationApplicable ? '' : 'mb-3'}>
                    <FormControlLabel
                      label='Palletisation applicable: '
                      labelPlacement='start'
                      control={
                        <Switch
                          checked={palletisationApplicable}
                          onChange={event => {
                            setPalletisationApplicable(event.target.checked)
                          }}
                          name='palletisationApplicable'
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
                  </Grid2>
                  {palletisationApplicable && (
                    <Grid2 container spacing={5} size={12} className='d-flex align-items-center mb-3'>
                      <Grid2 size={7}>
                        <TextField
                          fullWidth
                          id='palletSize'
                          label='Pallet size'
                          value={palletSize}
                          onChange={e => {
                            setPalletSize(e.target.value)
                            setErrorpalletSize({ isError: false, message: '' })
                          }}
                          required={palletisationApplicable}
                          error={errorpalletSize.isError}
                        />
                        <FormHelperText sx={{ padding: '0.5rem 1rem' }} error={errorpalletSize.isError}>
                          {errorpalletSize.isError ? errorpalletSize.message : ''}
                        </FormHelperText>
                      </Grid2>
                      <Grid2 size={4}>
                        <FormControl fullWidth error={errorpalletSizeUom.message} sx={{ mb: 2, marginBottom: 0 }}>
                          <InputLabel id='pallet-size-uom'>Pallet size Uom</InputLabel>
                          <Select
                            labelId='pallet-size-uom'
                            id='pallet-size-uom'
                            value={palletSizeUom}
                            label='Pallet size Uom'
                            onChange={e => {
                              setpalletSizeUom(e.target.value)
                              setErrorpalletSizeUom({ isError: false, message: '' })
                            }}
                          >
                            {uoms?.map(item => (
                              <MenuItem value={item?.id}>{item?.uom_name || ''}</MenuItem>
                            ))}
                          </Select>
                          <FormHelperText sx={{ padding: '0.5rem' }} error={errorpalletSizeUom.isError}>
                            {errorpalletSizeUom.isError ? errorpalletSizeUom.message : ''}
                          </FormHelperText>
                        </FormControl>
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
                      <Button variant='contained' sx={{ marginRight: 3.5 }} onClick={applyPackagingHierarchy}>
                        Save Changes
                      </Button>
                      <Button
                        variant='outlined'
                        color='error'
                        onClick={() => {
                          setModalOpen(false)
                          resetLevelError()
                          clearPackagingHierarchy()
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
          <Grid2 container spacing={2} sx={{ marginBottom: 3 }}>
            <Grid2 size={8}>
              <FormHelperText error={errorPackagingHierarchy.isError}>
                {errorPackagingHierarchy.isError ? errorPackagingHierarchy.message : ''}
              </FormHelperText>
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
              <TextField
                fullWidth
                id='generic-salt'
                label='Generic Salt'
                value={genericSalt}
                onChange={e => {
                  setGenericSalt(e.target.value)
                  setErrorGenericSalt({ isError: false, message: '' })
                }}
                required={true}
                error={errorGenericSalt.isError}
              />
              <FormHelperText error={errorGenericSalt.isError}>
                {errorGenericSalt.isError ? errorGenericSalt.message : ''}
              </FormHelperText>
            </Grid2>
            <Grid2 size={5}>
              <TextField
                fullWidth
                id='composition'
                label='Composition'
                value={composition}
                onChange={e => {
                  setComposition(e.target.value)
                  setErrorComposition({ isError: false, message: '' })
                }}
                required={true}
                error={errorComposition.isError}
              />
              <FormHelperText error={errorComposition.isError}>
                {errorComposition.isError ? errorComposition.message : ''}
              </FormHelperText>
            </Grid2>
            <Grid2 size={5}>
              <TextField
                fullWidth
                id='dosage'
                label='Dosage'
                value={dosage}
                onChange={e => {
                  setDosage(e.target.value)
                  setErrorDosage({ isError: false, message: '' })
                }}
                required={true}
                error={errorDosage.isError}
              />
              <FormHelperText error={errorDosage.isError}>
                {errorDosage.isError ? errorDosage.message : ''}
              </FormHelperText>
            </Grid2>
            <Grid2 size={5}>
              <TextField
                fullWidth
                id='remarks'
                label='Remarks'
                value={remarks}
                onChange={e => {
                  setRemarks(e.target.value)
                  setErrorRemarks({ isError: false, message: '' })
                }}
                required={true}
                error={errorRemarks.isError}
              />
              <FormHelperText error={errorRemarks.isError}>
                {errorRemarks.isError ? errorRemarks.message : ''}
              </FormHelperText>
            </Grid2>
            <Grid2 size={6}>
              <FormControlLabel
                label='Scheduled Drug?'
                labelPlacement='start'
                control={
                  <Switch
                    checked={scheduledDrug}
                    onChange={event => {
                      setScheduledDrug(event.target.checked)
                    }}
                    name='scheduledDrug'
                    color='primary'
                    role='button'
                  />
                }
              />
            </Grid2>
          </Grid2>
          <Grid2 item xs={12} className='my-3 '>
            <Button variant='contained' sx={{ marginRight: 3.5 }} onClick={handleSubmitForm}>
              Save Changes
            </Button>
            <Button type='reset' variant='outlined' color='primary' onClick={editData?.id ? resetEditForm : resetForm}>
              Reset
            </Button>
            <Button variant='outlined' color='error' sx={{ marginLeft: 3.5 }} onClick={() => handleCloseModal()}>
              Close
            </Button>
          </Grid2>
        </Box>
      </Modal>
      <AuthModal
        open={authModalOpen}
        handleClose={handleAuthModalClose}
        approveAPIName={approveAPIName}
        approveAPImethod={approveAPImethod}
        approveAPIEndPoint={approveAPIEndPoint}
        handleAuthResult={handleAuthResult}
        config={config}
        handleAuthModalOpen={handleAuthModalOpen}
        openModalApprove={openModalApprove}
      />
      <AccessibilitySettings />
      <ChatbotComponent />
    </Box>
  )
}

export async function getServerSideProps(context) {
  return validateToken(context, 'Product Master')
}
export default ProtectedRoute(Index)
