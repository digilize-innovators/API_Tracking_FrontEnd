'use-client'
import React, { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Grid2 from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import { Button, TextField, FormHelperText } from '@mui/material'
import Modal from '@mui/material/Modal'
import { IoMdAdd } from 'react-icons/io'
import { useSettings } from 'src/@core/hooks/useSettings'
import TableCompany from 'src/views/tables/TableCompany'
import { api } from 'src/utils/Rest-API'
import SnackbarAlert from 'src/components/SnackbarAlert'
import { useLoading } from 'src/@core/hooks/useLoading'
import ProtectedRoute from 'src/components/ProtectedRoute'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useAuth } from 'src/Context/AuthContext'
import Head from 'next/head'
import { useRouter } from 'next/router'
import AuthModal from 'src/components/authModal'
import ChatbotComponent from 'src/components/ChatbotComponent'
import AccessibilitySettings from 'src/components/AccessibilitySettings'
import { validateToken } from 'src/utils/ValidateToken'
import { style } from 'src/configs/generalConfig'
import { decodeAndSetConfig } from '../../utils/tokenUtils'
import { useApiAccess } from 'src/@core/hooks/useApiAccess'
import ExportResetActionButtons from 'src/components/ExportResetActionButtons'
import SearchBar from 'src/components/SearchBarComponent'
import EsignStatusFilter from 'src/components/EsignStatusFilter'
import { footerContent } from 'src/utils/footerContentPdf'
import { headerContentFix } from 'src/utils/headerContentPdfFix'

const Index = () => {
  const router = useRouter()
  const [contactNo, setContactNo] = useState('')
  const [openModal, setOpenModal] = useState(false)
  const [companyId, setCompanyId] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [mfgLicenceNo, setMfgLicenceNo] = useState('')
  const [address, setAddress] = useState('')
  const [email, setEmail] = useState('')
  const [searchVal, setSearchVal] = useState('')
  const [errorCompanyId, setErrorCompanyId] = useState({ isError: false, message: '' })
  const [errorCompanyName, setErrorCompanyName] = useState({ isError: false, message: '' })
  const [errorMfgLicenceNo, setErrorMfgLicenceNo] = useState({ isError: false, message: '' })
  const [errorContactNo, setErrorContactNo] = useState({ isError: false, message: '' })
  const [errorEmail, setErrorEmail] = useState({ isError: false, message: '' })
  const [errorAddress, setErrorAddress] = useState({ isError: false, message: '' })
  const [editData, setEditData] = useState({})
  const [companyData, setCompanyData] = useState([])
  const [sortDirection, setSortDirection] = useState('asc')
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [alertData, setAlertData] = useState({ type: '', message: '', variant: 'filled' })
  const { setIsLoading } = useLoading()
  const [eSignStatus, setESignStatus] = useState('')
  const [page, setPage] = useState(1)
  const { settings } = useSettings()
  const [rowsPerPage, setRowsPerPage] = useState(settings.rowsPerPage)
  const [totalRecords, setTotalRecords] = useState(0)
  const [userDataPdf, setUserDataPdf] = useState()
  const { getUserData, removeAuthToken } = useAuth()
  const [config, setConfig] = useState(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [approveAPIName, setApproveAPIName] = useState('')
  const [approveAPImethod, setApproveAPImethod] = useState('')
  const [approveAPIEndPoint, setApproveAPIEndPoint] = useState('')
  const [eSignStatusId, setESignStatusId] = useState('')
  const [auditLogMark, setAuditLogMark] = useState('')
  const [esignDownloadPdf, setEsignDownloadPdf] = useState(false)
  const [openModalApprove, setOpenModalApprove] = useState(false)
  const [firstGsprefix, setFirstGsprefix] = useState('')
  const [secondGsprefix, setSecondGsprefix] = useState('')
  const [thirdGsprefix, setThirdGsprefix] = useState('')
  const [firstGxprefixError, setFirstGsprefixError] = useState({ isError: false, message: '' })
  const [secondGxprefixError, setSecondGsprefixError] = useState({ isError: false, message: '' })
  const [thirdGxprefixError, setThirdGsprefixError] = useState({ isError: false, message: '' })
  const apiAccess = useApiAccess('company-create', 'company-update', 'company-approve')
  useEffect(() => {
    let data = getUserData()

    decodeAndSetConfig(setConfig)
    setUserDataPdf(data)
    return () => {}
  }, [])
  useEffect(() => {
    getData()
    return () => {}
  }, [page, rowsPerPage, eSignStatus])
  const getData = async (pageNumber, rowsNumber, status, search) => {
    const paramsPage = pageNumber || page
    const paramsRows = rowsNumber || rowsPerPage
    const paramsEsignStatus = status === '' ? status : eSignStatus
    const paramsSearchVal = search === '' ? search : searchVal
    try {
      let query = `/company?page=${paramsPage}&limit=${paramsRows}`
      if (paramsSearchVal) query += `&search=${paramsSearchVal}`
      if (paramsEsignStatus) query += `&esign_status=${paramsEsignStatus}`
      console.log('query ', query)
      setIsLoading(true)
      const res = await api(query, {}, 'get', true)
      setIsLoading(false)
      console.log('All company ', res.data)
      if (res.data.success) {
        setCompanyData(res.data.data.companies)
        setTotalRecords(res.data.data.totalRecords)
      } else {
        console.log('Error to get all company ', res.data)
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('Error in get company ', error)
    }
  }
  const closeSnackbar = () => {
    setOpenSnackbar(false)
  }
  const handleOpenModal = () => {
    setApproveAPIName('company-create')
    setApproveAPImethod('POST')
    setApproveAPIEndPoint('/api/v1/company')
    resetForm()
    setOpenModal(true)
  }
  const handleAuthModalClose = () => {
    setAuthModalOpen(false)
    setOpenModalApprove(false)
  }
  const handleCloseModal = () => {
    resetForm()
    setOpenModal(false)
  }
  const applyValidation = () => {
    const validations = [
      {
        value: companyId.trim(),
        setError: setErrorCompanyId,
        fieldName: 'Company ID',
        required: true,
        maxLength: 20,
        regex: /^[a-zA-Z0-9]+\s*$/,
        regexMessage: 'should not contain any special symbols'
      },
      {
        value: companyName.trim(),
        setError: setErrorCompanyName,
        fieldName: 'Company Name',
        required: true,
        regex: /^[a-zA-Z0-9]+\s*(?:[a-zA-Z0-9]+\s*)*$/,
        regexMessage: 'should not contain any special symbols',
        maxLength: 50
      },
      {
        value: mfgLicenceNo.trim(),
        setError: setErrorMfgLicenceNo,
        fieldName: 'Mfg. licence no.',
        required: true,
        maxLength: 50
      },
      {
        value: contactNo.trim(),
        setError: setErrorContactNo,
        fieldName: 'Contact number',
        required: false,
        exactLength: 10,
        regex: /^[0-9]+$/,
        regexMessage: 'must contain only numbers'
      },
      {
        value: email.trim(),
        setError: setErrorEmail,
        fieldName: 'Email',
        required: false,
        regex: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
        regexMessage: 'is not valid'
      },
      {
        value: address.trim(),
        setError: setErrorAddress,
        fieldName: 'Address',
        required: false,
        maxLength: 150
      },
      {
        value: firstGsprefix.trim(),
        setError: setFirstGsprefixError,
        fieldName: 'GS1 Prefix',
        required: true,
        minLength: 3,
        maxLength: 10
      },
      {
        value: secondGsprefix.trim(),
        setError: setSecondGsprefixError,
        fieldName: 'GS2 Prefix',
        required: false,
        maxLength: 10,
        minLength: 3
      },
      {
        value: thirdGsprefix.trim(),
        setError: setThirdGsprefixError,
        fieldName: 'GS3 Prefix',
        required: false,
        maxLength: 10,
        minLength: 3
      }
    ]
    const validateField = ({
      value,
      setError,
      fieldName,
      required,
      minLength,
      maxLength,
      exactLength,
      regex,
      regexMessage
    }) => {
      if (required && value === '') {
        setError({ isError: true, message: `${fieldName} can't be empty` })
        return
      }
      if (required && value === '') {
        setError({ isError: true, message: `${fieldName} can't be empty` })
        return
      }

      if (value !== '' && maxLength && value.length > maxLength) {
        setError({
          isError: true,
          message: `${fieldName} length should be <= ${maxLength}`
        })
        return
      }
      if (value !== '' && minLength && value.length < minLength) {
        setError({
          isError: true,
          message: `${fieldName} length should be >= ${minLength}`
        })
        return
      }
      if (value && exactLength && value.length !== exactLength) {
        setError({
          isError: true,
          message: `${fieldName}   must be exactly ${exactLength} characters`
        })
        return
      }
      if (value && regex && !regex.test(value)) {
        setError({ isError: true, message: `${fieldName} ${regexMessage}` })
        return
      }
      setError({ isError: false, message: '' })
    }
    validations.forEach(validateField)
  }
  const checkValidate = () => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
    // console.log(companyId.trim() === '')

    if (companyId.trim() === '' || companyId.length > 20) {
      return false
    }
    if (!/^[a-zA-Z0-9]+\s*$/.test(companyId)) {
      return false
    }
    if (companyName.trim() === '' || companyName.length > 50) {
      return false
    }
    if (!/^[a-zA-Z0-9]+\s*(?:[a-zA-Z0-9]+\s*)*$/.test(companyName)) {
      return false
    }
    if (mfgLicenceNo.trim() === '' || mfgLicenceNo.length > 50) {
      return false
    }
    if (address.length > 150) {
      return false
    }
    if (email.trim() !== '' && !emailRegex.test(email)) {
      return false
    }
    if (contactNo.trim() !== '') {
      if (contactNo.length !== 10 || isNaN(contactNo)) {
        return false
      }
    }
    if(secondGsprefix.trim() !== '' && (secondGsprefix.length < 3 || secondGsprefix.length > 10)){
      return false
    }
    if(thirdGsprefix.trim() !== '' && (thirdGsprefix.length < 3 || thirdGsprefix.length > 10)){
      return false
    }
    return true
  }
  const handleSubmitForm = async () => {
    const isEdit = Boolean(editData?.id)
    setApproveAPIName(isEdit ? 'company-update' : 'company-create')
    setApproveAPImethod(isEdit ? 'PUT' : 'POST')
    setApproveAPIEndPoint('/api/v1/company')
    applyValidation()
    if (!checkValidate()) {
      return true
    }
    if (config?.config?.esign_status) {
      setAuthModalOpen(true)
      return
    }
    const esign_status = 'approved'
    isEdit ? editCompany() : addCompany(esign_status)
  }
  const addCompany = async (esign_status, remarks) => {
    try {
      const data = {
        companyId,
        companyName,
        mfgLicenceNo,
        email,
        contact: contactNo,
        address,
        gs1_prefix : firstGsprefix,
        gs2_prefix : secondGsprefix,
        gs3_prefix : thirdGsprefix,
      }
      console.log('Add company data ', data)
      const auditlogRemark = remarks
      const audit_log = config?.config?.audit_logs
        ? {
            audit_log: true,
            performed_action: 'add',
            remarks: auditlogRemark?.length > 0 ? auditlogRemark : `company added - ${companyId}`
          }
        : {
            audit_log: false,
            performed_action: 'none',
            remarks: `none`
          }
      data.audit_log = audit_log
      data.esign_status = esign_status
      setIsLoading(true)
      const res = await api('/company/', data, 'post', true)
      setIsLoading(false)
      if (res?.data?.success) {
        console.log('res ', res?.data)
        setOpenSnackbar(true)
        setAlertData({ ...alertData, type: 'success', message: 'Company added successfully' })
        getData()
        resetForm()
      } else {
        console.log('error to add company ', res.data)
        setOpenSnackbar(true)
        setAlertData({ ...alertData, type: 'error', message: res.data?.message })
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('Erorr to add company ', error)
      router.push('/500')
    } finally {
      setOpenModal(false)
      setIsLoading(false)
      setApproveAPIName('')
      setApproveAPImethod('')
      setApproveAPIEndPoint('')
    }
  }
  const editCompany = async (esign_status, remarks) => {
    try {
      const data = {
        companyName,
        mfgLicenceNo,
        email,
        contact: contactNo,
        address,
        gs1_prefix : firstGsprefix,
        gs2_prefix : secondGsprefix,
        gs3_prefix : thirdGsprefix,
      }
      const auditlogRemark = remarks
      let audit_log
      if (config?.config?.audit_logs) {
        audit_log = {
          audit_log: true,
          performed_action: 'edit',
          remarks: auditlogRemark > 0 ? auditlogRemark : `company edited - ${companyId}`
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
      setIsLoading(true)
      const res = await api(`/company/${editData.id}`, data, 'put', true)
      setIsLoading(false)
      if (res.data.success) {
        console.log('res ', res.data)
        setOpenSnackbar(true)
        setAlertData({ ...alertData, type: 'success', message: 'Company updated successfully' })
        resetForm()
        getData()
      } else {
        console.log('error to edit company ', res.data)
        setOpenSnackbar(true)
        setAlertData({ ...alertData, type: 'error', message: res.data.message })
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('Erorr to edit company ', error)
      router.push('/500')
    } finally {
      setOpenModal(false)
      setIsLoading(false)
      setApproveAPIName('')
      setApproveAPImethod('')
      setApproveAPIEndPoint('')
    }
  }
  const resetForm = () => {
    setCompanyId('')
    setCompanyName('')
    setMfgLicenceNo('')
    setEmail('')
    setContactNo('')
    setAddress('')
    setFirstGsprefix('')
    setSecondGsprefix('')
    setThirdGsprefix('')
    setErrorCompanyId({ isError: false, message: '' })
    setErrorCompanyName({ isError: false, message: '' })
    setErrorMfgLicenceNo({ isError: false, message: '' })
    setErrorEmail({ isError: false, message: '' })
    setErrorContactNo({ isError: false, message: '' })
    setErrorAddress({ isError: false, message: '' })
    setFirstGsprefixError({ isError: false, message: '' })
    setSecondGsprefixError({ isError: false, message: '' })
    setThirdGsprefixError({ isError: false, message: '' })
    setEditData({})
  }
  const resetEditForm = () => {
    console.log('REset edit field')
    setCompanyName('')
    setMfgLicenceNo('')
    setEmail('')
    setContactNo('')
    setAddress('')
    setFirstGsprefix('')
    setSecondGsprefix('')
    setThirdGsprefix('')
    setErrorCompanyName({ isError: false, message: '' })
    setErrorMfgLicenceNo({ isError: false, message: '' })
    setErrorEmail({ isError: false, message: '' })
    setErrorContactNo({ isError: false, message: '' })
    setErrorAddress({ isError: false, message: '' })
    setFirstGsprefixError({ isError: false, message: '' })
    setSecondGsprefixError({ isError: false, message: '' })
    setThirdGsprefixError({ isError: false, message: '' })
    setEditData(prev => ({
      ...prev,
      company_name: '',
      mfg_licence_no: '',
      email: '',
      contact: '',
      address: '',
      firstGsprefix: '',
      secondGsprefix: '',
      thirdGsprefix: '',
      firstGsprefix: '',
      secondGsprefix: '',
      thirdGsprefix: ''
    }))
  }
  const resetData = () => {
    setCompanyId('')
    setContactNo('')
    setCompanyName('')
    setMfgLicenceNo('')
    setEmail('')
    setAddress('')
    setFirstGsprefix('')
    setSecondGsprefix('')
    setThirdGsprefix('')
    setErrorCompanyId({ isError: false, message: '' })
    setErrorCompanyName({ isError: false, message: '' })
    setErrorContactNo({ isError: false, message: '' })
    setErrorAddress({ isError: false, message: '' })
    setErrorMfgLicenceNo({ isError: false, message: '' })
    setErrorEmail({ isError: false, message: '' })
    setErrorAddress({ isError: false, message: '' })
    setFirstGsprefixError({ isError: false, message: '' })
    setSecondGsprefixError({ isError: false, message: '' })
    setThirdGsprefixError({ isError: false, message: '' })
  }
  const handleAuthResult = async (isAuthenticated, user, isApprover, esignStatus, remarks) => {
    console.log('handleAuthResult 01', isAuthenticated, isApprover, esignStatus, user)
    console.log('handleAuthResult 02', config.userId, user.user_id)
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
    const handleDownload = () => {
      if (esignDownloadPdf) {
        console.log('esign is approved for download.')
        setOpenModalApprove(true)
        downloadPdf()
      }
    }
    const handleApproverActions = async () => {
      const data = {
        modelName: 'company',
        esignStatus,
        id: eSignStatusId,
        audit_log: config?.config?.audit_logs
          ? {
              user_id: user.userId,
              user_name: user.userName,
              performed_action: 'approved',
              remarks: remarks.length > 0 ? remarks : `company approved - ${auditLogMark}`
            }
          : {}
      }
      if (esignStatus === 'approved' && esignDownloadPdf) {
        console.log('esign is approved for approver')
        setOpenModalApprove(false)
        resetState()
        downloadPdf()
        return
      }
      const res = await api('/esign-status/update-esign-status', data, 'patch', true)
      console.log('esign status update', res?.data)
      if (esignStatus === 'rejected' && esignDownloadPdf) {
        console.log('approver rejected')
        setOpenModalApprove(false)
        resetState()
        return 0
      }
    }
    const handleCreatorActions = () => {
      if (esignStatus === 'rejected') {
        console.log('esign is rejected.')
        setAuthModalOpen(false)
        setOpenModalApprove(false)
      } else if (esignStatus === 'approved') {
        if (esignDownloadPdf) {
          handleDownload()
        } else {
          console.log('esign is approved for creator')
          const esign_status = 'pending'
          editData?.id ? editCompany(esign_status, remarks) : addCompany(esign_status, remarks)
        }
      }
    }
    if (isApprover) {
      await handleApproverActions()
    } else {
      handleCreatorActions()
    }
    resetState()
    getData()
  }
  const handleAuthCheck = async row => {
    console.log('handleAuthCheck', row)
    setApproveAPIName('company-approve')
    setApproveAPImethod('PATCH')
    setApproveAPIEndPoint('/api/v1/company')
    setAuthModalOpen(true)
    setESignStatusId(row.id)
    setAuditLogMark(row.company_id)
    console.log('row', row)
  }
  const handleUpdate = item => {
    resetForm()
    handleOpenModal()
    setEditData(item)
    console.log('edit company ', item)
    setCompanyId(item.company_id)
    setCompanyName(item.company_name)
    setMfgLicenceNo(item.mfg_licence_no)
    item.email ? setEmail(item.email) : setEmail('')
    item.contact ? setContactNo(item.contact) : setContactNo('')
    item.address ? setAddress(item.address) : setAddress('')
    item.gs1_prefix ? setFirstGsprefix(item.gs1_prefix) : setFirstGsprefix('')
    item.gs2_prefix ? setSecondGsprefix(item.gs2_prefix) : setSecondGsprefix('')
    item.gs3_prefix ? setThirdGsprefix(item.gs3_prefix) : setThirdGsprefix('')
  }
  const resetFilter = () => {
    console.log('reset fileter')
    setSearchVal('')
    setESignStatus('')
    setPage(1)
    getData(1, rowsPerPage, '', '')
  }
  const handleSort = key => {
    const newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc'
    const sorted = companyData.toSorted((a, b) => {
      if (a[key] > b[key]) {
        return newSortDirection === 'asc' ? 1 : -1
      }
      if (a[key] < b[key]) {
        return newSortDirection === 'asc' ? -1 : 1
      }
      return 0
    })
    setCompanyData(sorted)
    setSortDirection(newSortDirection)
  }
  const handleSortByID = () => handleSort('company_id')
  const handleSortByName = () => handleSort('company_name')
  const handleSortByLicNo = () => handleSort('mfg_licence_no')
  const handleSortByEmail = () => handleSort('email')
  const handleSortByContact = () => handleSort('contact')
  const handleSortByAddress = () => handleSort('address')
  const handleSortByFirstGsprefix = () => handleSort('gs1_prefix')
  const handleSortBySecondGsprefix = () => handleSort('gs2_prefix')
  const handleSortByThirdGsprefix = () => handleSort('gs3_prefix')
  const handleChangePage = (event, newPage) => {
    console.log('page ', newPage)
    setPage(newPage + 1)
  }
  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(1)
  }
  const downloadPdf = () => {
    console.log('clicked on download btn')
    const doc = new jsPDF()
    const headerContent = () => {
      headerContentFix(doc, 'Company Master Report')

      if (searchVal) {
        doc.setFontSize(10)
        doc.text('Search : ' + `${searchVal}`, 15, 25)
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
      doc.text('Company Data', 15, 55)
    }
    const bodyContent = () => {
      let currentPage = 1
      let dataIndex = 0
      const totalPages = Math.ceil(companyData.length / 25)
      headerContent()
      while (dataIndex < companyData.length) {
        if (currentPage > 1) {
          doc.addPage()
        }
        footerContent(currentPage, totalPages, userDataPdf, doc)

        const body = companyData
          .slice(dataIndex, dataIndex + 25)
          .map((item, index) => [
            index + 1,
            item.company_id,
            item.company_name,
            item.mfg_licence_no,
            item.email,
            item.contact,
            item.address,
            item.esign_status
          ])
        console.log('body', body)
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
          head: [['Sr.No.', 'Id', 'Company Name', 'Mfg.No.', 'Email', 'Contact No', 'Address', 'E-Sign']],
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
    const fileName = `Company_${formattedDate}_${formattedTime}.pdf`
    doc.save(fileName)
  }
  const handleSearch = () => {
    getData()
  }
  const handleTempSearchValue = e => {
    setSearchVal(e.target.value.toLowerCase())
  }
  const handleAuthModalOpen = () => {
    console.log('OPen auth model')
    setApproveAPIName('area-approve')
    setApproveAPImethod('PATCH')
    setApproveAPIEndPoint('/api/v1/area')
    setAuthModalOpen(true)
  }
  const handleDownloadPdf = () => {
    if (config?.config?.esign_status) {
      console.log('Esign enabled for download pdf')
      setEsignDownloadPdf(true)
      setAuthModalOpen(true)
      return
    }
    setApproveAPIName('area-create')
    setApproveAPImethod('POST')
    setApproveAPIEndPoint('/api/v1/area')
    downloadPdf()
  }
  return (
    <Box padding={4}>
      <Head>
        <title>Company Master</title>
      </Head>
      <Grid2 item xs={12}>
        <Typography variant='h2'>Company Master</Typography>
      </Grid2>
      <Grid2 item xs={12}>
        <Grid2 item xs={12}>
          <Box sx={{ backgroundColor: settings.mode === 'dark' ? '#212121' : 'white', borderRadius: 1 }}>
            <Grid2 item xs={12}>
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
                      searchValue={searchVal}
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
            </Grid2>
            <Grid2 item xs={12}>
              <Typography variant='h4' className='mx-4 my-2 mt-3'>
                Company Data
              </Typography>
              <TableCompany
                page={page - 1}
                rowsPerPage={rowsPerPage}
                setPage={setPage}
                setRowsPerPage={setRowsPerPage}
                handleChangePage={handleChangePage}
                handleChangeRowsPerPage={handleChangeRowsPerPage}
                totalRecords={totalRecords}
                handleUpdate={handleUpdate}
                companyData={companyData}
                sortDirection={sortDirection}
                handleSortByID={handleSortByID}
                handleSortByName={handleSortByName}
                handleSortByLicNo={handleSortByLicNo}
                handleSortByEmail={handleSortByEmail}
                handleSortByContact={handleSortByContact}
                handleSortByAddress={handleSortByAddress}
                handleSortByFirstGsprefix={handleSortByFirstGsprefix}
                handleSortBySecondGsprefix={handleSortBySecondGsprefix}
                handleSortByThirdGsprefix={handleSortByThirdGsprefix}
                editable={apiAccess.editApiAccess}
                handleAuthCheck={handleAuthCheck}
                apiAccess={apiAccess}
                config={config}
              />
            </Grid2>
          </Box>
        </Grid2>
      </Grid2>
      <SnackbarAlert openSnackbar={openSnackbar} closeSnackbar={closeSnackbar} alertData={alertData} />
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
        data-testid='modal'
        role='dialog'
      >
        <Box sx={style}>
          <Typography variant='h4' className='my-2'>
            {editData?.id ? 'Edit Company' : 'Add Company'}
          </Typography>
          <Grid2 container spacing={2}>
            <Grid2 size={6}>
              <TextField
                fullWidth
                id='company-id'
                label='Company ID'
                placeholder='Company ID'
                value={companyId}
                onChange={e => {
                  setCompanyId(e.target.value)
                  e.target.value && setErrorCompanyId({ isError: false, message: '' })
                }}
                required={true}
                error={errorCompanyId.isError}
                disabled={!!editData?.id}
              />
            </Grid2>
            <Grid2 size={6}>
              <TextField
                fullWidth
                id='company-name'
                label='Company Name'
                placeholder='Company Name'
                value={companyName}
                onChange={e => {
                  setCompanyName(e.target.value)
                  e.target.value && setErrorCompanyName({ isError: false, message: '' })
                }}
                required={true}
                error={errorCompanyName.isError}
              />
            </Grid2>
          </Grid2>
          <Grid2 container spacing={2}>
            <Grid2 size={6} sx={{ padding: '0.5rem 1rem' }}>
              <FormHelperText error={errorCompanyId.isError}>
                {errorCompanyId.isError ? errorCompanyId.message : ''}
              </FormHelperText>
            </Grid2>
            <Grid2 size={6} sx={{ padding: '0.5rem 1rem' }}>
              <FormHelperText error={errorCompanyName.isError}>
                {errorCompanyName.isError ? errorCompanyName.message : ''}
              </FormHelperText>
            </Grid2>
          </Grid2>
          <Grid2 container spacing={2}>
            <Grid2 size={6}>
              <TextField
                fullWidth
                id='mfg-lic'
                label='Mfg Lic.'
                placeholder='Mfg Lic.'
                value={mfgLicenceNo}
                onChange={e => {
                  setMfgLicenceNo(e.target.value)
                  e.target.value && setErrorMfgLicenceNo({ isError: false, message: '' })
                }}
                required={true}
                error={errorMfgLicenceNo.isError}
              />
            </Grid2>
            <Grid2 size={6}>
              <TextField
                fullWidth
                id='company-address'
                label='Address'
                placeholder='Address'
                value={address}
                onChange={e => {
                  setAddress(e.target.value)
                  e.target.value && setErrorAddress({ isError: false, message: '' })
                }}
                error={errorAddress.isError}
              />
            </Grid2>
          </Grid2>
          <Grid2 container spacing={2}>
            <Grid2 size={6} sx={{ padding: '0.5rem 1rem' }}>
              <FormHelperText error={errorMfgLicenceNo.isError}>
                {errorMfgLicenceNo.isError ? errorMfgLicenceNo.message : ''}
              </FormHelperText>
            </Grid2>
            <Grid2 size={6} sx={{ padding: '0.5rem 1rem' }}>
              <FormHelperText error={errorAddress.isError}>
                {errorAddress.isError ? errorAddress.message : ''}
              </FormHelperText>
            </Grid2>
          </Grid2>
          <Grid2 container spacing={2}>
            <Grid2 size={6}>
              <TextField
                fullWidth
                id='company-contact-no'
                label='Contact No'
                placeholder='Contact No'
                value={contactNo}
                onChange={e => {
                  setContactNo(e.target.value)
                  e.target.value && setErrorContactNo({ isError: false, message: '' })
                }}
                error={errorContactNo.isError}
              />
            </Grid2>
            <Grid2 size={6}>
              <TextField
                fullWidth
                id='Company-email'
                label='Email'
                placeholder='Email'
                value={email}
                onChange={e => {
                  setEmail(e.target.value)
                  e.target.value && setErrorEmail({ isError: false, message: '' })
                }}
                error={errorEmail.isError}
              />
            </Grid2>
          </Grid2>
          <Grid2 container spacing={2}>
            <Grid2 size={6} sx={{ padding: '0.5rem 1rem' }}>
              <FormHelperText error={errorContactNo.isError}>
                {errorContactNo.isError ? errorContactNo.message : ''}
              </FormHelperText>
            </Grid2>
            <Grid2 size={6} sx={{ padding: '0.5rem 1rem' }}>
              <FormHelperText error={errorEmail.isError}>{errorEmail.isError ? errorEmail.message : ''}</FormHelperText>
            </Grid2>
          </Grid2>
          <Grid2 container spacing={2}>
            <Grid2 size={4}>
              <TextField
                fullWidth
                id='first-gs-prefix'
                label='GS1 Prefix'
                placeholder='GS1 Prefix'
                value={firstGsprefix}
                type='number'
                onChange={e => {
                  setFirstGsprefix(e.target.value)
                  e.target.value && setFirstGsprefixError({ isError: false, message: '' })
                }}
                required={true}
                error={firstGxprefixError.isError}
              />
            </Grid2>
            <Grid2 size={4}>
              <TextField
                fullWidth
                id='second-gs-prefix'
                label='GS2 Prefix'
                placeholder='GS2 Prefix'
                value={secondGsprefix}
                type='number'
                onChange={e => {
                  setSecondGsprefix(e.target.value)
                  e.target.value && setSecondGsprefixError({ isError: false, message: '' })
                }}
                error={secondGxprefixError.isError}
              />
            </Grid2>
            <Grid2 size={4}>
              <TextField
                fullWidth
                id='third-gs-prefix'
                label='GS3 Prefix'
                placeholder='GS3 Prefix'
                type='number'
                value={thirdGsprefix}
                onChange={e => {
                  setThirdGsprefix(e.target.value)
                  e.target.value && setThirdGsprefixError({ isError: false, message: '' })
                }}
                error={thirdGxprefixError.isError}
              />
            </Grid2>
          </Grid2>
          <Grid2 container spacing={2}>
            <Grid2 size={4} sx={{ padding: '0.5rem 1rem' }}>
              <FormHelperText error={firstGxprefixError.isError}>
                {firstGxprefixError.isError ? firstGxprefixError.message : ''}
              </FormHelperText>
            </Grid2>
            <Grid2 size={4} sx={{ padding: '0.5rem 1rem' }}>
              <FormHelperText error={secondGxprefixError.isError}>
                {secondGxprefixError.isError ? secondGxprefixError.message : ''}
              </FormHelperText>
            </Grid2>
            <Grid2 size={4} sx={{ padding: '0.5rem 1rem' }}>
              <FormHelperText error={thirdGxprefixError.isError}>
                {thirdGxprefixError.isError ? thirdGxprefixError.message : ''}
              </FormHelperText>
            </Grid2>
          </Grid2>
          <Grid2 item xs={12} className='my-3 '>
            <Button variant='contained' sx={{ marginRight: 3.5 }} onClick={handleSubmitForm} role='button'>
              Save Changes
            </Button>
            <Button type='reset' variant='outlined' color='primary' onClick={editData?.id ? resetEditForm : resetData}>
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
  return validateToken(context, 'Company')
}
export default ProtectedRoute(Index)
