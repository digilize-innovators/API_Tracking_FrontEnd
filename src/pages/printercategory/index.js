'use clients'
'use-client'
import {
  Button, Paper, TableContainer, TextField, RadioGroup, Radio, FormControlLabel, FormHelperText
} from '@mui/material'
import Box from '@mui/material/Box'
import Grid2 from '@mui/material/Grid2'
import Modal from '@mui/material/Modal'
import Typography from '@mui/material/Typography'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { IoMdAdd } from 'react-icons/io'
import { useApiAccess } from 'src/@core/hooks/useApiAccess'
import { useLoading } from 'src/@core/hooks/useLoading'
import { useSettings } from 'src/@core/hooks/useSettings'
import AccessibilitySettings from 'src/components/AccessibilitySettings'
import AuthModal from 'src/components/authModal'
import ChatbotComponent from 'src/components/ChatbotComponent'
import ProtectedRoute from 'src/components/ProtectedRoute'
import SnackbarAlert from 'src/components/SnackbarAlert'
import { style } from 'src/configs/generalConfig'
import { useAuth } from 'src/Context/AuthContext'
import { api } from 'src/utils/Rest-API'
import TablePrinterCategory from 'src/views/tables/TablePrinterCategory'
import { decodeAndSetConfig } from '../../utils/tokenUtils'
import ExportResetActionButtons from 'src/components/ExportResetActionButtons'
import SearchBar from 'src/components/SearchBarComponent'
import EsignStatusFilter from 'src/components/EsignStatusFilter'
import { footerContent } from 'src/utils/footerContentPdf'
import { headerContentFix } from 'src/utils/headerContentPdfFix'
import { validateToken } from 'src/utils/ValidateToken'

const Index = () => {
  const { settings } = useSettings()
  const [eSignStatus, setESignStatus] = useState('')
  const [searchVal, setSearchVal] = useState('')
  const [tempSearchVal, setTempSearchVal] = useState('')
  const [openModal, setOpenModal] = useState(false)
  const [printerCategoryName, setPrinterCategoryName] = useState('')
  const [printerCategoryID, setPrinterCategoryID] = useState('')

  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [alertData, setAlertData] = useState({ type: '', message: '', variant: 'filled' })
  const [errorPrinterCategory, setErrorPrinterCategory] = useState({ isError: false, message: '' })
  const [errorPrinterType, setErrorPrinterType] = useState({ isError: false, message: '' })

  const [allPrinterCategoryData, setAllPrinterCategoryData] = useState([])
  const [editData, setEditData] = useState({})
  const [sortDirection, setSortDirection] = useState('asc')
  const { setIsLoading } = useLoading()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(settings.rowsPerPage)
  const [totalRecords, setTotalRecords] = useState(0)
  const { getUserData, removeAuthToken } = useAuth()
  const [userDataPdf, setUserDataPdf] = useState()
  const router = useRouter()
  const [config, setConfig] = useState(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [approveAPIName, setApproveAPIName] = useState('')
  const [approveAPImethod, setApproveAPImethod] = useState('')
  const [approveAPIEndPoint, setApproveAPIEndPoint] = useState('')
  const [eSignStatusId, setESignStatusId] = useState('')
  const [printerType, setPrinterType] = useState('')
  const [auditLogMark, setAuditLogMark] = useState('')
  const [esignDownloadPdf, setEsignDownloadPdf] = useState(false)
  const [openModalApprove, setOpenModalApprove] = useState(false)
  const apiAccess = useApiAccess('printercategory-create', 'printercategory-update', 'printercategory-approve')

  useEffect(() => {
    let data = getUserData()

    decodeAndSetConfig(setConfig)
    setUserDataPdf(data)
    return () => { }
  }, [])
  useEffect(() => {
    getData()
  }, [eSignStatus, searchVal, rowsPerPage, page])
  const getData = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage === -1 ? -1 : rowsPerPage,
        search: searchVal,
        esign_status: eSignStatus
      })
      const res = await api(`/printercategory/?${params.toString()}`, {}, 'get', true)
      console.log('get print category ', res?.data)
      if (res.data.success) {
        setAllPrinterCategoryData(res.data.data.printerCategories)
        setTotalRecords(res.data.data.total)
      } else {
        console.log('Error to get all printer categories ', res.data)
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('Error in get printer categories ', error)
    } finally {
      setIsLoading(false)
    }
  }
  const closeSnackbar = () => {
    setOpenSnackbar(false)
  }
  const handleOpenModal = () => {
    setApproveAPIName('printercategory-create')
    setApproveAPImethod('POST')
    setApproveAPIEndPoint('/api/v1/printercategory')
    resetForm()
    setOpenModal(true)
  }
  const handleCloseModal = () => {
    resetForm()
    setOpenModal(false)
  }
  const handleAuthModalClose = () => {
    setAuthModalOpen(false)
    setOpenModalApprove(false)
  }
  const applyValidation = () => {
    if (printerCategoryName.length > 101) {
      setErrorPrinterCategory({ isError: true, message: 'Printer category length should be less than 101' })
    }
    else if (printerCategoryName === '') {
      setErrorPrinterCategory({ isError: true, message: "Printer category can't be empty" })
    }
    else if (!(/^[a-zA-Z0-9\s-]+$/.test(printerCategoryName))) {
      setErrorPrinterCategory({ isError: true, message: "Printer name cannot contain any special symbols" })
    }
    else {
      setErrorPrinterCategory({ isError: false, message: '' })
    }

    if (!printerType.length || printerType === "") {
      setErrorPrinterType({ isError: true, message: "Printing Technology is required" })
      setErrorPrinterType({ isError: true, message: "Printing Technology is required" })
    }
  }
  const checkValidate = () => {
    return (
      printerCategoryName !== '' &&
      printerCategoryName.length <= 101 &&
      printerCategoryID !== '' &&
      printerCategoryID.length < 50 && ((/^[a-zA-Z0-9\s-]+$/.test(printerCategoryName)))
    )
  }
  const resetForm = () => {
    setPrinterCategoryName('')
    setPrinterCategoryID('')
    setPrinterType('')
    setErrorPrinterType({ isError: false, message: '' })
    setErrorPrinterCategory({ isError: false, message: '' })
    setEditData({})
  }
  const resetEditForm = () => {
    console.log('REset edit field')
    setPrinterCategoryName('')
    setPrinterCategoryID('')
    setPrinterType('')
    setErrorPrinterType({ isError: false, message: '' })
    setErrorPrinterCategory({ isError: false, message: '' })
    setEditData(prev => ({
      ...prev,
      printer_category_name: ''
    }))
  }
  const handleSubmitForm = async () => {
    if (editData?.id) {
      setApproveAPIName('printercategory-update')
      setApproveAPImethod('PUT')
      setApproveAPIEndPoint('/api/v1/printercategory')
    } else {
      setApproveAPIName('printercategory-create')
      setApproveAPImethod('POST')
      setApproveAPIEndPoint('/api/v1/printercategory')
    }
    applyValidation()
    const validate = checkValidate()
    if (!validate) {
      return true
    }
    if (config?.config?.esign_status) {
      setAuthModalOpen(true)
      return
    }
    const esign_status = 'approved'
    editData?.id ? editPrinterCategory() : addPrinterCategory(esign_status)
  }
  const addPrinterCategory = async (esign_status, remarks) => {
    try {
      const data = { printerCategoryName, categoryId: printerCategoryID }
      const auditlogRemark = remarks
      const audit_log = config?.config?.audit_logs
        ? {
          audit_log: true,
          performed_action: 'add',
          remarks: auditlogRemark?.length > 0 ? auditlogRemark : `Printer category added - ${printerCategoryName}`
        }
        : {
          audit_log: false,
          performed_action: 'none',
          remarks: `none`
        }
      data.audit_log = audit_log
      data.esign_status = esign_status
      data.printerType = printerType
      console.log('Add printer category data ', data)
      setIsLoading(true)
      const res = await api('/printercategory/', data, 'post', true)
      setIsLoading(false)
      if (res?.data?.success) {
        console.log('res data', res?.data)
        setOpenSnackbar(true)
        setAlertData({ ...alertData, type: 'success', message: 'Printer category added successfully' })
        getData()
        resetForm()
      } else {
        console.log('error to add printer category ', res.data)
        setOpenSnackbar(true)
        setAlertData({ ...alertData, type: 'error', message: res.data?.message })
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('Error to add printer category ', error)
      router.push('/500')
    } finally {
      setOpenModal(false)
      setPrinterType('')
      setApproveAPIName('')
      setApproveAPImethod('')
      setApproveAPIEndPoint('')
    }
  }
  const editPrinterCategory = async (esign_status, remarks) => {
    try {
      const data = { printerCategoryName, categoryId: editData.id }
      const auditlogRemark = remarks
      let audit_log
      if (config?.config?.audit_logs) {
        audit_log = {
          audit_log: true,
          performed_action: 'edit',
          remarks: auditlogRemark?.length > 0 ? auditlogRemark : `Printer category edited - ${printerCategoryName}`
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
      data.printerType = printerType
      setIsLoading(true)
      const res = await api(`/printercategory/${editData.id}`, data, 'put', true)
      setIsLoading(false)
      if (res.data.success) {
        console.log('res ', res.data)
        setOpenSnackbar(true)
        setAlertData({ ...alertData, type: 'success', message: 'Printer category updated successfully' })
        resetForm()
        getData()
      } else {
        console.log('error to edit printer category ', res.data)
        setOpenSnackbar(true)
        setAlertData({ ...alertData, type: 'error', message: res.data.message })
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('Erorr to edit printer category ', error)
      router.push('/500')
    } finally {
      setOpenModal(false)
      setIsLoading(false)
      setApproveAPIName('')
      setApproveAPImethod('')
      setApproveAPIEndPoint('')
    }
  }
  const handleUpdate = item => {
    resetForm()
    setOpenModal(true)
    setPrinterCategoryID(item.printer_category_id)
    setEditData(item)

    setPrinterType(item.printingTechnology)
    console.log('edi  t printer category ', item)
    setPrinterCategoryName(item.printer_category_name)
  }
  const handleAuthResult = async (isAuthenticated, user, isApprover, esignStatus, remarks) => {
    const resetState = () => {
      setApproveAPIName('')
      setApproveAPImethod('')
      setApproveAPIEndPoint('')
      setAuthModalOpen(false)
    }
    const handleApproverActions = async () => {
      const data = {
        modelName: 'printercategory',
        esignStatus,
        id: eSignStatusId,
        audit_log: config?.config?.audit_logs
          ? {
            user_id: user.userId,
            user_name: user.userName,
            performed_action: 'approved',
            remarks: remarks.length > 0 ? remarks : `printer category approved - ${auditLogMark}`
          }
          : {}
      }
      if (esignStatus === 'approved' && esignDownloadPdf) {
        setOpenModalApprove(false)
        console.log('esign is approved for approver')
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
      }
    }
    const handleCreatorActions = () => {
      if (esignStatus === 'rejected') {
        setAuthModalOpen(false)
        setOpenModalApprove(false)
      }
      if (esignStatus === 'approved') {
        if (esignDownloadPdf) {
          console.log('esign is approved for creator to download')
          setOpenModalApprove(true)
        } else {
          console.log('esign is approved for creator')
          const esign_status = 'pending'
          editData?.id ? editPrinterCategory(esign_status, remarks) : addPrinterCategory(esign_status, remarks)
        }
      }
    }
    if (!isAuthenticated) {
      setAlertData({ type: 'error', message: 'Authentication failed, Please try again.' })
      setOpenSnackbar(true)
      return
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
    setApproveAPIName('printercategory-approve')
    setApproveAPImethod('PATCH')
    setApproveAPIEndPoint('/api/v1/printercategory')
    setAuthModalOpen(true)
    setESignStatusId(row.id)
    setAuditLogMark(row.printer_category_name)
  }
  const handleSortByName = () => {
    const newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc'
    const sorted = [...allPrinterCategoryData].sort((a, b) => {
      if (a.printer_category_name > b.printer_category_name) {
        return newSortDirection === 'asc' ? 1 : -1
      }
      if (a.printer_category_name < b.printer_category_name) {
        return newSortDirection === 'asc' ? -1 : 1
      }
      return 0
    })
    setAllPrinterCategoryData(sorted)
    setSortDirection(newSortDirection)
  }
  const resetFilter = () => {
    setESignStatus('')
    setSearchVal('')
    setTempSearchVal('')
  }
  const handleSearch = () => {
    let currentVal = tempSearchVal
    currentVal = currentVal.toLowerCase()
    setSearchVal(currentVal)
    if (currentVal !== '') {
      getData()
    }
  }
  const handleTempSearchValue = e => {
    let currentVal = e.target.value
    currentVal = currentVal.toLowerCase()
    setTempSearchVal(currentVal)
  }
  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }
  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }
  const handleAuthModalOpen = () => {
    console.log('Open auth model')
    setApproveAPIName('printercategory-approve')
    setApproveAPImethod('PATCH')
    setApproveAPIEndPoint('/api/v1/printercategory')
    setAuthModalOpen(true)
  }
  const handleDownloadPdf = () => {
    setApproveAPIName('printercategory-create')
    setApproveAPImethod('POST')
    setApproveAPIEndPoint('/api/v1/printercategory')
    if (config?.config?.esign_status) {
      console.log('Esign enabled for download pdf')
      setEsignDownloadPdf(true)
      setAuthModalOpen(true)
      return
    }
    downloadPdf()
  }
  const downloadPdf = () => {
    console.log('clicked on download btn')
    const doc = new jsPDF()
    const headerContent = () => {
      headerContentFix(doc, 'Printer Category Report')

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
      doc.text('Printer Category Data', 15, 55)
    }
    const bodyContent = () => {
      let currentPage = 1
      let dataIndex = 0
      const totalPages = Math.ceil(allPrinterCategoryData.length / 25)
      headerContent()
      while (dataIndex < allPrinterCategoryData.length) {
        if (currentPage > 1) {
          doc.addPage()
        }

        footerContent(currentPage, totalPages, userDataPdf, doc)

        const body = allPrinterCategoryData
          .slice(dataIndex, dataIndex + 25)
          .map((item, index) => [dataIndex + index + 1, item.printer_category_name, item.esign_status])
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
          head: [['Sr.No.', 'Printer Category', 'E-Sign']],
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
    const fileName = `Printer Category_${formattedDate}_${formattedTime}.pdf`
    doc.save(fileName)
  }
  return (
    <Box padding={4}>
      <Head>
        <title>Printer Category</title>
      </Head>
      <Grid2 item xs={12}>
        <Typography variant='h2'>Printer Category</Typography>
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
                Printer Category Data
              </Typography>
              <TableContainer component={Paper}>
                <TablePrinterCategory
                  printerCategoryData={allPrinterCategoryData}
                  handleUpdate={handleUpdate}
                  handleSortByName={handleSortByName}
                  sortDirection={sortDirection}
                  page={page}
                  rowsPerPage={rowsPerPage}
                  totalRecords={totalRecords}
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
        <Box sx={style}>
          <Typography variant='h4' className='my-2'>
            {editData?.id ? 'Edit Printer Category' : 'Add Printer Category'}
          </Typography>
          <Grid2 item xs={12} className='d-flex justify-content-between mb-2'>
            <Box className='w-50'>
              <TextField
                className='w-100'
                id='category-id-field'
                label='Category ID'
                placeholder='Printer Category ID'
                disabled={!!editData.id}
                value={printerCategoryID}
                onChange={e => {
                  setPrinterCategoryID(e.target.value);
                  if (e.target.value) setErrorPrinterCategory({ isError: false, message: '' });
                }}
                required
                error={errorPrinterCategory.isError}
                helperText={errorPrinterCategory.isError ? errorPrinterCategory.message : ''}
              />
            </Box>
            <Box className='w-50' sx={{ ml: 2 }}>
              <TextField
                className='w-100'
                id='category-name-field'
                label='Printer Category'
                placeholder='Printer Category Name'
                value={printerCategoryName}
                onChange={e => {
                  setPrinterCategoryName(e.target.value);
                  if (e.target.value) setErrorPrinterCategory({ isError: false, message: '' });
                }}
                required
                error={errorPrinterCategory.isError}
                helperText={errorPrinterCategory.isError ? errorPrinterCategory.message : ''}
              />
            </Box>
          </Grid2>
          <Grid2 container xs={12} className='mt-3'>

            <Box className='w-50' sx={{ ml: 4 }}>
              <RadioGroup
                aria-label="printer-logo"
                name="printer-logo"
                onChange={(e) => { setPrinterType(e.target.value); setErrorPrinterType({ isError: false, message: '' }) }}
                row
                value={printerType}

              >
                <FormControlLabel
                  value="inkBased"
                  control={<Radio aria-label="Ink Based" />}
                  label={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      Ink Based
                    </div>
                  }
                />
                <FormControlLabel
                  value="ribbonBased"
                  control={<Radio aria-label="Ribbon Based" />}
                  label={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      Ribbon Based
                    </div>
                  }
                />
              </RadioGroup>
              {errorPrinterType.isError && (
                <FormHelperText style={{ color: "#F83E3E" }}>{errorPrinterType.message}</FormHelperText>
              )}
            </Box>
          </Grid2>
          <Grid2 item xs={12} className='mt-3'>
            <Button variant='contained' sx={{ marginRight: 3.5 }} onClick={handleSubmitForm} role='button'>
              Save Changes
            </Button>
            <Button type='reset' variant='outlined' color='primary' onClick={editData?.id ? resetEditForm : resetForm}>
              Reset
            </Button>
            <Button variant='outlined' color='error' sx={{ marginLeft: 3.5 }} onClick={handleCloseModal}>
              Close
            </Button>
          </Grid2>
        </Box>
      </Modal >

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
    </Box >
  )
}
export async function getServerSideProps(context) {
  return validateToken(context, 'Printer Category')
}
export default ProtectedRoute(Index)