'use-client'
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Grid2 from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import { Button, Paper, TableContainer } from '@mui/material'
import Head from 'next/head'
import { IoMdAdd } from 'react-icons/io'
import { useSettings } from 'src/@core/hooks/useSettings'
import { useRouter } from 'next/router'
import { useApiAccess } from 'src/@core/hooks/useApiAccess'
import { useLoading } from 'src/@core/hooks/useLoading'
import AccessibilitySettings from 'src/components/AccessibilitySettings'
import AuthModal from 'src/components/authModal'
import ChatbotComponent from 'src/components/ChatbotComponent'
import ProtectedRoute from 'src/components/ProtectedRoute'
import SnackbarAlert from 'src/components/SnackbarAlert'
import { useAuth } from 'src/Context/AuthContext'
import { api } from 'src/utils/Rest-API'
import { getTokenValues } from '../../utils/tokenUtils'
import { validateToken } from 'src/utils/ValidateToken'
import TablePrinterMaster from 'src/views/tables/TablePrinterMaster'
import ExportResetActionButtons from 'src/components/ExportResetActionButtons'
import downloadPdf from 'src/utils/DownloadPdf'
import EsignStatusDropdown from 'src/components/EsignStatusDropdown'
import CustomSearchBar from 'src/components/CustomSearchBar'
import PrinterMasterModal from 'src/components/Modal/PrinterMasterModal'

const Index = () => {
  const [openModal, setOpenModal] = useState(false)
  const [alertData, setAlertData] = useState({ openSnackbar: false, type: '', message: '', variant: 'filled' })
  const [allPrinterMasterData , setAllPrinterMaster] = useState();
  const [editData, setEditData] = useState({})
  const { setIsLoading } = useLoading()
  const { settings } = useSettings()
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
  const apiAccess = useApiAccess('printermaster-create', 'printermaster-update', 'printermaster-approve')
  const [tableHeaderData, setTableHeaderData] = useState({ esignStatus: '', searchVal: '' })
  const [formData, setFormData] = useState({})
  const [pendingAction, setPendingAction] = useState(null)
  const searchRef = useRef()
  
  useLayoutEffect(() => {
    let data = getUserData()
    const decodedToken = getTokenValues()
    setConfig(decodedToken)
    setUserDataPdf(data)
    return () => {}
  }, [])

  useEffect(() => {
    if (formData && pendingAction) {
      const esign_status = config?.config.esign_status?'pending':'approved'
      if (pendingAction === 'edit') {
        editPrinterMaster(esign_status)
      } else if(pendingAction=='add') {
        AddPrinterMaster(esign_status)
      }
      setPendingAction(null)
    }
  }, [formData, pendingAction])

  const tableBody = allPrinterMasterData?.map((item, index) => [
    index + 1,
    item.PrinterCategory.printer_category_name,
    item.printer_id,
    item.printer_ip,
    item.printer_port,
    item.esign_status
  ])

  const tableData = useMemo(
    () => ({
      tableHeader: ['Sr.No.', 'Printer Category', 'Printer ID', 'Printer IP', 'Printer PORT', 'E-Sign'],
      tableHeaderText: 'Printer Master Report ',
      tableBodyText: 'Printer Master Data',
      filename: 'PrinterMaster'
    }),
    []
  )

  const closeSnackbar = () => {
    setAlertData({ ...alertData, openSnackbar: false })
  }

  const handleOpenModal = () => {
    setApproveAPI({approveAPIEndPoint: '/api/v1/printermaster',approveAPImethod: 'POST',approveAPIName: 'printermaster-create'})
    setOpenModal(true)
    setEditData({})
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
    console.log('data', data)
    setFormData(data)
    if (editData?.id) {
      setApproveAPI({
        approveAPIEndPoint: '/api/v1/printermaster',
        approveAPImethod: 'PUT',
        approveAPIName: 'printermaster-update'
      })
    } else {
      setApproveAPI({
        approveAPIEndPoint: '/api/v1/printermaster',
        approveAPImethod: 'POST',
        approveAPIName: 'printermaster-create'
      })
    }
    if (config?.config?.esign_status) {
      setAuthModalOpen(true)
      return
    }
    setPendingAction(editData?.id ? 'edit' : 'add')
  }

  const AddPrinterMaster = async (esign_status, remarks) => {
    try {
      console.log(formData)

      const data = { ...formData }

      const auditlogRemark = remarks
      const audit_log = config?.config?.audit_logs
        ? {
            audit_log: true,
            performed_action: 'add',
            remarks: auditlogRemark?.length > 0 ? auditlogRemark : `Printer Master added - ${data.printerId}`
          }
        : {
            audit_log: false,
            performed_action: 'none',
            remarks: `none`
          }
      data.audit_log = audit_log
      data.esign_status = esign_status
      console.log('Add printer Master data ', data)
      setIsLoading(true)
      const res = await api('/printermaster/', data, 'post', true)
      setIsLoading(false)
      if (res?.data?.success) {
        console.log('res data', res?.data)
        setAlertData({
          ...alertData,
          openSnackbar: true,
          type: 'success',
          message: 'Printer Master added successfully'
        })
        setOpenModal(false)
        resetForm()
      } else {
        console.log('Erorr to add printer master', res.data)
        setAlertData({ ...alertData, openSnackbar: true, type: 'error', message: res.data?.message })
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('Erorr to add printer master', error)
      router.push('/500')
    } finally {
      setIsLoading(false)
      setApproveAPI({ approveAPIEndPoint: '', approveAPImethod: '', approveAPIName: '' })
    }
  }

  const editPrinterMaster = async (esign_status, remarks) => {
    try {
      const data = { ...formData }
      const auditlogRemark = remarks
      let audit_log
      if (config?.config?.audit_logs) {
        audit_log = {
          audit_log: true,
          performed_action: 'edit',
          remarks: auditlogRemark?.length > 0 ? auditlogRemark : `Printer Master edited - ${formData.printerId}`
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
      const res = await api(`/printermaster/${editData.id}`, data, 'put', true)
      setIsLoading(false)
      if (res.data.success) {
        console.log('res ', res.data)
        setAlertData({...alertData,openSnackbar: true,type: 'success',message: 'Printer master updated successfully'})
        setOpenModal(false)
        resetForm()
      } else {
        console.log('error to edit Printer Master', res.data)
        setAlertData({ ...alertData, openSnackbar: true, type: 'error', message: res.data.message })
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('Erorr to edit Printer Master', error)
      router.push('/500')
    } finally {
      setIsLoading(false)
      setApproveAPI({ approveAPIEndPoint: '', approveAPImethod: '', approveAPIName: '' })
    }
  }

  const handleAuthResult = async (isAuthenticated, user, isApprover, esignStatus, remarks) => {
    console.log('handleAuthResult 01', isAuthenticated, isApprover, esignStatus, user)
    console.log('handleAuthResult 02', config?.userId, user.user_id)

    const resetState = () => {
      setApproveAPI({ approveAPIEndPoint: '', approveAPImethod: '', approveAPIName: '' })
      setEsignDownloadPdf(false)

      setAuthModalOpen(false)
    }

    if (!isAuthenticated) {
      setAlertData({ type: 'error', openSnackbar: true, message: 'Authentication failed, Please try again.' })
      return
    }

    const handleApproverActions = async () => {
      const data = {
        modelName: 'printermaster',
        esignStatus,
        id: eSignStatusId,
        audit_log: config?.config?.audit_logs
          ? {
              user_id: user.userId,
              user_name: user.userName,
              performed_action: 'approved',
              remarks: remarks.length > 0 ? remarks : `printer master approved - ${auditLogMark}`
            }
          : {}
      }
      if (esignStatus === 'approved' && esignDownloadPdf) {
        setOpenModalApprove(false)
        console.log('esign is approved for approver')
        downloadPdf(tableData, tableHeaderData, tableBody, allPrinterMasterData, userDataPdf)
        resetState()
        return
      }

      const res = await api('/esign-status/update-esign-status', data, 'patch', true)
      console.log('esign status update', res?.data)
      setPendingAction(true)
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
          setPendingAction(editData?.id ? 'edit' : 'add')
        }
      }
    }
    if (!isApprover && esignDownloadPdf) {
      setAlertData({
        ...alertData,
        openSnackbar: true,
        type: 'error',
        message: "Access denied: Download pdf disabled for this user."
      })
      resetState()
      return
    }
    if (isApprover) {
      await handleApproverActions()
    } else {
      handleCreatorActions()
    }
    resetState()
  }

  const handleAuthCheck = async row => {
    console.log('handleAuthCheck', row)
    setApproveAPI({
      approveAPIEndPoint: '/api/v1/printermaster',
      approveAPImethod: 'PATCH',
      approveAPIName: 'printermaster-approve'
    })
    setAuthModalOpen(true)
    setESignStatusId(row.id)
    setAuditLogMark(row.printer_id)
    console.log('row', row)
  }
  const handleUpdate = item => {
    resetForm()
    setEditData(item)
    console.log('edit Printer Master', item)
    setOpenModal(true)
  }

  const resetFilter = () => {
    if (searchRef.current) {
      searchRef.current.resetSearch()
    }
    setTableHeaderData({ ...tableHeaderData, esignStatus: '', searchVal: '' })
  }

  const handleSearch = val => {
    setTableHeaderData({ ...tableHeaderData, searchVal: val.trim().toLowerCase() })
  }

  const handleAuthModalOpen = () => {
    console.log('open auth model')
    setApproveAPI({approveAPIEndPoint: '/api/v1/printermaster',approveAPImethod: 'PATCH',approveAPIName: 'printermaster-approve'})
    setAuthModalOpen(true)
  }

  const handleDownloadPdf = () => {
    setApproveAPI({approveAPIEndPoint: '/api/v1/printermaster',approveAPImethod: 'POST',approveAPIName: 'printermaster-create'})
    if (config?.config?.esign_status) {
      console.log('Esign enabled for download pdf')
      setEsignDownloadPdf(true)
      setAuthModalOpen(true)
      return
    }
    downloadPdf(tableData, tableHeaderData, tableBody, allPrinterMasterData, userDataPdf)
  }
  return (
    <Box padding={4}>
      <Head>
        <title>Printer Master</title>
      </Head>
      <Grid2 item xs={12}>
        <Typography variant='h2'>Printer Master</Typography>
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
                  <CustomSearchBar ref={searchRef} handleSearchClick={handleSearch} />
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
                Printer Master Data
              </Typography>
              <TableContainer component={Paper}>
                <TablePrinterMaster
                  pendingAction={pendingAction}
                  tableHeaderData={tableHeaderData}
                  handleAuthCheck={handleAuthCheck}
                  apiAccess={apiAccess}
                  config={config}
                  handleUpdate={handleUpdate}
                  setAllPrinterMaster={setAllPrinterMaster} 
                />
              </TableContainer>
            </Grid2>
          </Box>
        </Grid2>
      </Grid2>
      <SnackbarAlert openSnackbar={alertData.openSnackbar} closeSnackbar={closeSnackbar} alertData={alertData} />
      <PrinterMasterModal
        open={openModal}
        onClose={handleCloseModal}
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
  return validateToken(context, 'Printer Master')
}
export default ProtectedRoute(Index)