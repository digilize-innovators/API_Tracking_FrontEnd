'use-client'
import { Button, Paper, TableContainer } from '@mui/material'
import Box from '@mui/material/Box'
import Grid2 from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
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
import ExportResetActionButtons from 'src/components/ExportResetActionButtons'
import { validateToken } from 'src/utils/ValidateToken'
import TablePrinterLineConfiguration from 'src/views/tables/TablePrinterLineConfiguration'
import CustomSearchBar from 'src/components/CustomSearchBar'
import EsignStatusDropdown from 'src/components/EsignStatusDropdown'
import downloadPdf from 'src/utils/DownloadPdf'
import PrinterLineConfigurationModal from 'src/components/Modal/PrinterLineConfigurationModal'
import { getTokenValues } from 'src/utils/tokenUtils'

const Index = () => {
  const { settings } = useSettings()
  const [openModal, setOpenModal] = useState(false)
  const [alertData, setAlertData] = useState({ openSnackbar: false, type: '', message: '', variant: 'filled' })
  const [editData, setEditData] = useState({})
  const { setIsLoading } = useLoading()
  const [pendingAction, setPendingAction] = useState(null)
  const { removeAuthToken } = useAuth()
  const [userDataPdf, setUserDataPdf] = useState()
  const router = useRouter()
  const [config, setConfig] = useState(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [approveAPI, setApproveAPI] = useState({ approveAPIName: '', approveAPImethod: '', approveAPIEndPoint: '' })
  const { getUserData } = useAuth()
  const [eSignStatusId, setESignStatusId] = useState('')
  const [auditLogMark, setAuditLogMark] = useState('')
  const [esignDownloadPdf, setEsignDownloadPdf] = useState(false)
  const [openModalApprove, setOpenModalApprove] = useState(false)
  const apiAccess = useApiAccess(
    'printerlineconfiguration-create',
    'printerlineconfiguration-update',
    'printerlineconfiguration-approve'
  )
  const [tableHeaderData, setTableHeaderData] = useState({ esignStatus: '', searchVal: '' })
  const searchBarRef = useRef()
  const [allPrinterLineConfigurationData, setAllPrinterLineConfiguration] = useState([])
  const [formData, setFormData] = useState()
  const [authUser, setAuthUser] = useState({})
  const [esignRemark, setEsignRemark] = useState('')

  useLayoutEffect(() => {
    let data = getUserData()
    setUserDataPdf(data)
    const decodedToken = getTokenValues()
    setConfig(decodedToken)
    return () => {}
  }, [])

  useEffect(() => {
    const handleUserAction = async () => {
      if (formData && pendingAction) {
        const esign_status = config?.config?.esign_status && config?.role !== 'admin' ? 'pending' : 'approved'

        if (pendingAction === 'edit') {
          await editPrinterLineConfiguration(esign_status)
        } else if (pendingAction === 'add') {
          await AddPrinterLineConfiguration(esign_status)
        }

        setPendingAction(null)
      }
    }

    handleUserAction()
  }, [formData, pendingAction])
  const tableBody = allPrinterLineConfigurationData?.map((item, index) => [
    index + 1,
    item?.printer_line_name,
    item?.PrinterMaster.PrinterMasterHistory[0]?.printer_id,
    item?.camera_enable,
    item?.cameraMaster?.CameraMasterHistory[0]?.name,
    item?.esign_status || 'N/A'
  ])

  const tableData = useMemo(
    () => ({
      tableHeader: ['Sr.No.', 'Printer Line Name', 'Printer', 'Camera Enable', 'Camera Name', 'E-Sign'],
      tableHeaderText: 'Printer Line Configuration Report',
      tableBodyText: 'Printer Line Configuration Data',
      filename: 'PrinterLineConfiguration'
    }),
    []
  )

  const closeSnackbar = () => {
    setAlertData({ ...alertData, openSnackbar: false })
  }

  const handleOpenModal = () => {
    setApproveAPI({
      approveAPIName: 'printerlineconfiguration-create',
      approveAPImethod: 'POST',
      approveAPIEndPoint: '/api/v1/printerlineconfiguration'
    })
    setEditData({})
    setOpenModal(true)
  }

  const handleCloseModal = () => {
    setEditData({})
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
    setFormData(data)

    if (editData?.id) {
      setApproveAPI({
        approveAPIName: 'printerlineconfiguration-update',
        approveAPImethod: 'PUT',
        approveAPIEndPoint: '/api/v1/printerlineconfiguration'
      })
    } else {
      setApproveAPI({
        approveAPIName: 'printerlineconfiguration-create',
        approveAPImethod: 'POST',
        approveAPIEndPoint: '/api/v1/printerlineconfiguration'
      })
    }
    if (config?.config?.esign_status) {
      setAuthModalOpen(true)
      return
    }
    setPendingAction(editData?.id ? 'edit' : 'add')
  }

  const AddPrinterLineConfiguration = async esign_status => {
    try {
      const data = { ...formData }
      if (config?.config?.audit_logs) {
        data.audit_log = {
          audit_log: true,
          remarks:
            esignRemark?.length > 0 ? esignRemark : `Printer Line Configuration added - ${formData.printerLineName}`,
          authUser
        }
      }

      data.esign_status = esign_status
      setIsLoading(true)
      const res = await api('/printerlineconfiguration/', data, 'post', true)
      setIsLoading(false)
      if (res?.data?.success) {
        setAlertData({
          ...alertData,
          openSnackbar: true,
          type: 'success',
          message: 'Printer Line configuration added successfully'
        })
        resetForm()
        setOpenModal(false)
      } else {
        console.log('Error to add printer line configuration', res.data)
        setAlertData({ ...alertData, openSnackbar: true, type: 'error', message: res.data?.message })
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('Error to add printer line configuration', error)
      router.push('/500')
    } finally {
      setApproveAPI({
        approveAPIName: '',
        approveAPImethod: '',
        approveAPIEndPoint: ''
      })
    }
  }

  const editPrinterLineConfiguration = async esign_status => {
    try {
      console.log('formData', formData)

      const data = { ...formData }

      if (config?.config?.audit_logs) {
        data.audit_log = {
          audit_log: true,
          remarks:
            esignRemark?.length > 0 ? esignRemark : `Printer Line Configuration edited - ${formData?.printerLineName}`,
          authUser
        }
      }
      data.esign_status = esign_status
      setIsLoading(true)
      const res = await api(`/printerlineconfiguration/${editData.id}`, data, 'put', true)
      console.log('Response of update Printer Line Configuration ', res.data)
      setIsLoading(false)
      if (res.data.success) {
        setAlertData({
          ...alertData,
          openSnackbar: true,
          type: 'success',
          message: 'Printer Line Configuration updated successfully'
        })
        resetForm()
        setOpenModal(false)
      } else {
        setAlertData({ ...alertData, openSnackbar: true, type: 'error', message: res.data.message })
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('Erorr to edit Printer Line Configuration ', error)
      router.push('/500')
    } finally {
      setIsLoading(false)
      setApproveAPI({
        approveAPIName: '',
        approveAPImethod: '',
        approveAPIEndPoint: ''
      })
    }
  }

  const handleUpdate = item => {
    resetForm()
    setEditData(item)
    console.log('edit Printer Line Configuration', item)
    setOpenModal(true)
  }

  const handleAuthResult = async (isAuthenticated, user, isApprover, esignStatus, remarks) => {
    console.log('handleAuthResult 01', isAuthenticated, isApprover, esignStatus, user)
    console.log('handleAuthResult 02', config?.userId, user.user_id)

    const resetState = () => {
      setApproveAPI({ approveAPIName: '', approveAPImethod: '', approveAPIEndPoint: '' })
      setAuthModalOpen(false)
      setEsignDownloadPdf(false)
    }

    const handleUnauthenticated = () => {
      setAlertData({ type: 'error', message: 'Authentication failed, Please try again.', openSnackbar: true })
      resetState()
    }

    const handleModalActions = isApproved => {
      setOpenModalApprove(!isApproved)
      if (isApproved && esignDownloadPdf) {
        console.log('esign is approved for download')
        downloadPdf(tableData, tableHeaderData, tableBody, allPrinterLineConfigurationData, userDataPdf)
      }
    }

    const createAuditLog = action =>
      config?.config?.audit_logs
        ? {
            user_id: user.userId,
            user_name: user.userName,
            remarks: remarks?.length > 0 ? remarks : `printer line configuration ${action} - ${auditLogMark}`,
            authUser: user.user_id
          }
        : {}

    const handleUpdateStatus = async () => {
      const data = {
        modelName: 'printerlineconfiguration',
        esignStatus,
        id: eSignStatusId,
        name: auditLogMark,
        audit_log: createAuditLog(esignStatus)
      }
      const res = await api('/esign-status/update-esign-status', data, 'patch', true)
      if (res.data) {
        setAlertData({
          ...alertData,
          openSnackbar: true,
          type: res.data.code === 200 ? 'success' : 'error',
          message: res.data.message
        })
      }
      console.log('esign status update', res?.data)
      setPendingAction(true)
    }

    const processApproverActions = async () => {
      if (esignStatus === 'approved' || esignStatus === 'rejected') {
        handleModalActions(esignStatus === 'approved')
        if (esignStatus === 'approved' && esignDownloadPdf) {
          resetState()
          return
        }
      }
      await handleUpdateStatus()
      resetState()
    }

    const handleCreatorActions = () => {
      if (esignStatus === 'rejected') {
        setAuthModalOpen(false)
        setOpenModalApprove(false)
        setAlertData({
          ...alertData,
          openSnackbar: true,
          type: 'error',
          message: 'Access denied for this user.'
        })
      }

      if (esignStatus === 'approved') {
        if (esignDownloadPdf) {
          console.log('esign is approved for creator to download')
          setOpenModalApprove(true)
        } else {
          console.log('esign is approved for creator')
          setAuthUser(user)
          setEsignRemark(remarks)
          setPendingAction(editData?.id ? 'edit' : 'add')
        }
      }
    }

    if (!isAuthenticated) {
      handleUnauthenticated()
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
      await processApproverActions()
    } else {
      handleCreatorActions()
    }
    resetState()
  }

  const handleAuthCheck = async row => {
    console.log('handleAuthCheck', row)
    setApproveAPI({
      approveAPIName: 'printerlineconfiguration-approve',
      approveAPImethod: 'PATCH',
      approveAPIEndPoint: '/api/v1/printerlineconfiguration'
    })
    setAuthModalOpen(true)
    setESignStatusId(row.id)
    setAuditLogMark(row.printer_line_name)
    console.log('row', row)
  }

  const resetFilter = () => {
    setTableHeaderData({ esignStatus: '', searchVal: '' })
    if (searchBarRef.current) {
      searchBarRef.current.resetSearch()
    }
  }

  const handleSearch = val => {
    setTableHeaderData({ ...tableHeaderData, searchVal: val.trim().toLowerCase() })
  }

  const handleAuthModalOpen = () => {
    console.log('OPen auth model')
    setApproveAPI({
      approveAPIName: 'printerlineconfiguration-approve',
      approveAPImethod: 'PATCH',
      approveAPIEndPoint: '/api/v1/printerlineconfiguration'
    })
    setAuthModalOpen(true)
  }

  const handleDownloadPdf = () => {
    setApproveAPI({
      approveAPIName: 'printerlineconfiguration-approve',
      approveAPImethod: 'PATCH',
      approveAPIEndPoint: '/api/v1/printerlineconfiguration'
    })
    if (config?.config?.esign_status) {
      console.log('Esign enabled for download pdf')
      setEsignDownloadPdf(true)
      setAuthModalOpen(true)
      return
    }
    downloadPdf(tableData, tableHeaderData, tableBody, allPrinterLineConfigurationData, userDataPdf)
  }

  return (
    <Box padding={4}>
      <Head>
        <title>Printer Line Configuration</title>
      </Head>
      <Grid2 item xs={12}>
        <Typography variant='h2'>Printer Line Configuration</Typography>
      </Grid2>
      <Grid2 item xs={12}>
        <Grid2 item xs={12}>
          <Box sx={{ backgroundColor: settings.mode === 'dark' ? '#212121' : 'white', borderRadius: 1 }}>
            <Typography variant='h4' className='mx-4 my-2 mx-2' sx={{ paddingTop: '1%' }}>
              Filter
            </Typography>
            <Grid2 item xs={12}>
              <Box className='d-flex justify-content-between align-items-center my-3 mx-4'>
                {config?.config?.esign_status && (
                  <EsignStatusDropdown tableHeaderData={tableHeaderData} setTableHeaderData={setTableHeaderData} />
                )}
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
                Printer Line Configuration Data
              </Typography>
              <TableContainer component={Paper}>
                <TablePrinterLineConfiguration
                  handleUpdate={handleUpdate}
                  tableHeaderData={tableHeaderData}
                  pendingAction={pendingAction}
                  editable={apiAccess.editApiAccess}
                  setAllPrinterLineConfiguration={setAllPrinterLineConfiguration}
                  handleAuthCheck={handleAuthCheck}
                  apiAccess={apiAccess}
                  config={config}
                />
              </TableContainer>
            </Grid2>
          </Box>
        </Grid2>
      </Grid2>
      <SnackbarAlert openSnackbar={alertData.openSnackbar} closeSnackbar={closeSnackbar} alertData={alertData} />
      <PrinterLineConfigurationModal
        open={openModal}
        handleClose={handleCloseModal}
        editData={editData}
        handleSubmitForm={handleSubmitForm}
      />
      <AuthModal
        open={authModalOpen}
        handleClose={handleAuthModalClose}
        approveAPIName={approveAPI.approveAPIName}
        approveAPImethod={approveAPI.approveAPImethod}
        approveAPIEndPoint={approveAPI.approveAPIEndPoint}
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
  return validateToken(context, 'Printer Line Configuration')
}
export default ProtectedRoute(Index)
