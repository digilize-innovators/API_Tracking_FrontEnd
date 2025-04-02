'use-client'
import { useMemo,useRef  ,useEffect, useState } from 'react'
import { Button, Paper, TableContainer } from '@mui/material'
import Box from '@mui/material/Box'
import Grid2 from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { IoMdAdd } from 'react-icons/io'
import { useApiAccess } from 'src/@core/hooks/useApiAccess'
import { useLoading } from 'src/@core/hooks/useLoading'
import { useSettings } from 'src/@core/hooks/useSettings'
import AccessibilitySettings from 'src/components/AccessibilitySettings'
import AuthModal from 'src/components/authModal'
import ChatbotComponent from 'src/components/ChatbotComponent'
import ProtectedRoute from 'src/components/ProtectedRoute'
import SnackbarAlert from 'src/components/SnackbarAlert'
import { useAuth } from 'src/Context/AuthContext'
import { api } from 'src/utils/Rest-API'
import TablePrinterCategory from 'src/views/tables/TablePrinterCategory'
import { decodeAndSetConfig } from '../utils/tokenUtils'
import ExportResetActionButtons from 'src/components/ExportResetActionButtons'
import { validateToken } from 'src/utils/ValidateToken'
import PrintingCategoryModal from 'src/components/Modal/PrintingCategoryModal'
import downloadPdf from 'src/utils/DownloadPdf'
import CustomSearchBar from 'src/components/CustomSearchBar'
import EsignStatusDropdown from 'src/components/EsignStatusDropdown'

const Index = () => {
  const { settings } = useSettings()
  const [openModal, setOpenModal] = useState(false)
    const searchBarRef = useRef(null)
  
  const [tableHeaderData, setTableHeaderData] = useState({
    esignStatus: '',
    searchVal: ''
  })
  const [alertData, setAlertData] = useState({ type: '', message: '', variant: 'filled', openSnackbar: false })
  const [formData, setFormData] = useState({})
  const [allPrinterCategoryData, setAllPrinterCategoryData] = useState([])
  const [editData, setEditData] = useState({})
  const { setIsLoading } = useLoading()
  const { getUserData, removeAuthToken } = useAuth()
  const [userDataPdf, setUserDataPdf] = useState()
  const router = useRouter()
  const [config, setConfig] = useState(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [approveAPI, setApproveAPI] = useState({ approveAPIName: '', approveAPImethod: '', approveAPIEndPoint: '' })
  const [eSignStatusId, setESignStatusId] = useState('')
  const [auditLogMark, setAuditLogMark] = useState('')
  const [esignDownloadPdf, setEsignDownloadPdf] = useState(false)
  const [openModalApprove, setOpenModalApprove] = useState(false)
  const [pendingAction, setPendingAction] = useState()
  const apiAccess = useApiAccess('printercategory-create', 'printercategory-update', 'printercategory-approve')

  const tableBody = allPrinterCategoryData.map((item, index) => [
    index + 1,
    item.printer_category_name,
    item.esign_status
  ])

  const tableData = useMemo(
    () => ({
      tableHeader: ['Sr.No.', 'Printer Category', 'E-Sign'],
      tableHeaderText: 'Printer Category Report',
      tableBodyText: 'Printer Category Data',
      filename: 'Printer Category Report'
    }),
    []
  )

  useEffect(() => {
    console.log(pendingAction)
    if (formData && pendingAction) {
      const esign_status = config?.config?.esign_status ? 'pending' : 'approved'
      if (pendingAction === 'edit') {
        editPrinterCategory(esign_status)
      } else if (pendingAction === 'add') {
        addPrinterCategory(esign_status)
      }
      setPendingAction(null)
    }
  }, [formData, pendingAction])

  useEffect(() => {
    let data = getUserData()

    decodeAndSetConfig(setConfig)
    setUserDataPdf(data)
    return () => {}
  }, [])
  
  const closeSnackbar = () => {
    setAlertData({ ...alertData, openSnackbar: false })
  }
  const handleOpenModal = () => {
    setApproveAPI({
      approveAPIName: 'printercategory-create',
      approveAPImethod: 'POST',
      approveAPIEndPoint: '/api/v1/printercategory'
    })
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

  const resetForm = () => {
    setEditData({})
  }

  const handleSubmitForm = async data => {
    console.log(data)
    setFormData(data)
    console.log('form Data :', formData)
    if (editData?.id) {
      setApproveAPI({
        approveAPIName: 'printercategory-update',
        approveAPImethod: 'PUT',
        approveAPIEndPoint: '/api/v1/printercategory'
      })
    } else {
      setApproveAPI({
        approveAPIName: 'printercategory-create',
        approveAPImethod: 'POST',
        approveAPIEndPoint: '/api/v1/printercategory'
      })
    }

    if (config?.config?.esign_status) {
      setAuthModalOpen(true)
      return
    }
    setPendingAction(editData?.id ? 'edit' : 'add')
  }
  const addPrinterCategory = async (esign_status, remarks) => {
    try {
      const printerType=formData.printerType
      const data = {
        categoryId: formData.printerCategoryID,
        printerCategoryName: formData.printerCategoryName,
        printerType: printerType,
        esign_status
      }

      console.log("Add ",data)
      const auditlogRemark = remarks
      const audit_log = config?.config?.audit_logs
        ? {
            audit_log: true,
            performed_action: 'add',
            remarks: auditlogRemark?.length > 0 ? auditlogRemark : `Printer category added - ${formData.printerCategoryName}`
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
        setAlertData({
          ...alertData,
          openSnackbar: true,
          type: 'success',
          message: 'Printer category added successfully'
        })
        resetForm()
        setOpenModal(false)

      } else {
        console.log('error to add printer category ', res.data)
        setAlertData({ ...alertData, openSnackbar: true, type: 'error', message: res.data?.message })
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('Error to add printer category ', error)
      router.push('/500')
      setOpenModal(false)

    } finally {
      setApproveAPI({ approveAPIName: '', approveAPImethod: '', approveAPIEndPoint: '' })
    }
  }
  const editPrinterCategory = async (esign_status, remarks) => {
    try {
      const printerType=formData.printerType
      const data = {
        categoryId: formData.printerCategoryID,
        printerCategoryName: formData.printerCategoryName,
        printerType: printerType,
        esign_status
      }
      console.log("Edit Data ",data)
      const auditlogRemark = remarks
      let audit_log
      if (config?.config?.audit_logs) {
        audit_log = {
          audit_log: true,
          performed_action: 'edit',
          remarks:
            auditlogRemark?.length > 0 ? auditlogRemark : `Printer category edited - ${formData.printerCategoryName}`
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
        setAlertData({
          ...alertData,
          openSnackbar: true,
          type: 'success',
          message: 'Printer category updated successfully'
        })
        resetForm()
        setOpenModal(false)

      } else {
        console.log('error to edit printer category ', res.data)
        setAlertData({ ...alertData, openSnackbar: true, type: 'error', message: res.data.message })
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('Erorr to edit printer category ', error)
      router.push('/500')
      setOpenModal(false)

    } finally {
      setIsLoading(false)
      setApproveAPI({ approveAPIName: '', approveAPImethod: '', approveAPIEndPoint: '' })
    }
  }
  const handleUpdate = item => {
    resetForm()
    setOpenModal(true)
    setEditData(item)

    console.log('edi t printer category ', item)
  }
  const handleAuthResult = async (isAuthenticated, user, isApprover, esignStatus, remarks) => {
    const resetState = () => {
      setApproveAPI({ approveAPIName: '', approveAPImethod: '', approveAPIEndPoint: '' })
      setAuthModalOpen(false)
      setEsignDownloadPdf(false)
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

      if (!esignDownloadPdf && isApprover && approveAPI.approveAPIName !== 'printercategory-approve') {
        setAlertData({
          ...alertData,
          openSnackbar: true,
          type: 'error',
          message: 'Access denied for this user.'
        })
        resetState()
        return
      }

      if (esignDownloadPdf) {
        if (esignStatus === 'approved' && esignDownloadPdf) {
          setOpenModalApprove(false)
          console.log('esign is approved for approver')
          resetState()
          downloadPdf(tableData, tableHeaderData, tableBody, allPrinterCategoryData, userDataPdf)
          return
        }
        if (esignStatus === 'rejected' && esignDownloadPdf) {
          console.log('approver rejected')
          setOpenModalApprove(false)
          resetState()
        }
      } else if (isApprover && approveAPI.approveAPIName === 'printercategory-approve') {
        const res = await api('/esign-status/update-esign-status', data, 'patch', true)
        console.log('esign status update', res?.data)
        setPendingAction(true)
        if (esignStatus === 'approved') {
          setOpenModalApprove(false)
          console.log('esign is approved for approver')
          resetState()
          return
        }
        if (esignStatus === 'rejected') {
          console.log('approver rejected')
          setOpenModalApprove(false)
          resetState()
        }
      }
    }
    const handleCreatorActions = () => {
      console.log('handleCreator')
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
          setPendingAction(editData?.id ? 'edit' : 'add')
        }
      }
    }
    if (!isAuthenticated) {
      setAlertData({ type: 'error', message: 'Authentication failed, Please try again.', openSnackbar: true })
      return
    }
    if (!isApprover && esignDownloadPdf) {
      setAlertData({
        ...alertData,
        openSnackbar: true,
        type: 'error',
        message: 'Access denied: Download pdf disabled for this user.'
      })
      resetState()
      return
    }
    if (isApprover) {
      await handleApproverActions()
    } else {
      if(approveAPI.approveAPIName==="printercategory-approve"){
        setAlertData({
          ...alertData,
          openSnackbar: true,
          type: 'error',
          message: 'Access denied: Download pdf disabled for this user.'
        })
        resetState()
        return 
      }
      handleCreatorActions()
    }
    resetState()
  }
  const handleAuthCheck = async row => {
    console.log('handleAuthCheck', row)
    setApproveAPI({
      approveAPIName: 'printercategory-approve',
      approveAPImethod: 'PATCH',
      approveAPIEndPoint: '/api/v1/printercategory'
    })
    console.log('id', row.id)
    setAuthModalOpen(true)
    setESignStatusId(row.id)
    setAuditLogMark(row.printer_category_name)
  }
  
  const resetFilter = () => {
    if (searchBarRef.current) {
      searchBarRef.current.resetSearch()
    }
    setTableHeaderData({ ...tableHeaderData, esignStatus: '', searchVal: '' })
  }

  const handleSearch = val => {
    setTableHeaderData({ ...tableHeaderData, searchVal: val.toLowerCase() })

  }

  const handleAuthModalOpen = () => {
    console.log('Open auth model')
    setApproveAPI({
      approveAPIName: 'printercategory-approve',
      approveAPImethod: 'PATCH',
      approveAPIEndPoint: '/api/v1/printercategory'
    })
    setAuthModalOpen(true)
  }
  const handleDownloadPdf = () => {
    setApproveAPI({
      approveAPIName: 'printercategory-create',
      approveAPImethod: 'POST',
      approveAPIEndPoint: '/api/v1/printercategory'
    })
    if (config?.config?.esign_status) {
      console.log('Esign enabled for download pdf')
      setEsignDownloadPdf(true)
      setAuthModalOpen(true)
      return
    }
    downloadPdf(tableData, tableHeaderData, tableBody, allPrinterCategoryData, userDataPdf)
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
               {
                  config?.config?.status &&
                  <EsignStatusDropdown tableHeaderData={tableHeaderData} setTableHeaderData={setTableHeaderData} />
               } 
              </Box>
              <Box className='d-flex justify-content-between align-items-center mx-4 my-2'>
                <ExportResetActionButtons handleDownloadPdf={handleDownloadPdf} resetFilter={resetFilter} />
                <Box className='d-flex justify-content-between align-items-center '>
                  <CustomSearchBar ref={searchBarRef} handleSearchClick={handleSearch} />
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
                  setAllPrinterCategory={setAllPrinterCategoryData}
                  handleUpdate={handleUpdate}
                  handleAuthCheck={handleAuthCheck}
                  apiAccess={apiAccess}
                  config={config}
                  pendingAction={pendingAction}
                  tableHeaderData={tableHeaderData}
                />
              </TableContainer>
            </Grid2>
          </Box>
        </Grid2>
      </Grid2>

      <SnackbarAlert openSnackbar={alertData.openSnackbar} closeSnackbar={closeSnackbar} alertData={alertData} />

      <PrintingCategoryModal
        open={openModal}
        onClose={handleCloseModal}
        editData={editData}
        handleSubmitForm={handleSubmitForm}
      />
      <AuthModal
        open={authModalOpen}
        handleClose={handleAuthModalClose}
        handleAuthResult={handleAuthResult}
        approveAPIName={approveAPI.approveAPIName}
        approveAPImethod={approveAPI.approveAPImethod}
        approveAPIEndPoint={approveAPI.approveAPIEndPoint}
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
  return validateToken(context, 'Printer Category')
}

export default ProtectedRoute(Index)