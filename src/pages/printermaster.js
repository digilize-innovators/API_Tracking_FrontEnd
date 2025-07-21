'use-client'
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Button, Paper, TableContainer, Box, Grid2, Typography } from '@mui/material'
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
import { getTokenValues } from '../utils/tokenUtils'
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
  const [allPrinterMasterData, setAllPrinterMasterData] = useState({ data: [], index: 0 })
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
  const [authUser, setAuthUser] = useState({})
  const [esignRemark, setEsignRemark] = useState('')
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
    const handleUserAction = () => {
      if (formData && pendingAction) {
        const esign_status = config?.config.esign_status ? 'pending' : 'approved'
        if (pendingAction === 'edit') {
          editPrinterMaster(esign_status)
        } else if (pendingAction == 'add') {
          AddPrinterMaster(esign_status)
        }
        setPendingAction(null)
      }
    }
    handleUserAction()
  }, [formData, pendingAction])
  const tableBody = allPrinterMasterData?.data?.map((item, index) => [
    index + allPrinterMasterData.index,
    item?.PrinterCategory.PrinterCategoryHistory[0]?.printer_category_name,
    item?.printer_id,
    item?.printer_ip,
    item?.printer_port,
    item?.esign_status
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
    setApproveAPI({
      approveAPIEndPoint: '/api/v1/printermaster',
      approveAPImethod: 'POST',
      approveAPIName: 'printermaster-create'
    })
    setOpenModal(true)
    setEditData({})
  }

  const handleCloseModal = () => {
    setEditData({})
    setOpenModal(false)
  }

  const handleAuthModalClose = () => {
    setEsignDownloadPdf(false)
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

  const AddPrinterMaster = async esign_status => {
    try {
      const data = { ...formData, printerPort: formData.printerPort?.toString() }

      if (config?.config?.audit_logs) {
        data.audit_log = {
          audit_log: true,
          remarks: esignRemark?.length > 0 ? esignRemark : `Printer Master added - ${data.printerId}`,
          authUser
        }
      }
      data.esign_status = esign_status
      setIsLoading(true)
      const res = await api('/printermaster/', data, 'post', true)
      setIsLoading(false)
      if (res?.data?.success) {
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

  const editPrinterMaster = async esign_status => {
    try {
      const data = { ...formData, printerPort: formData.printerPort?.toString() }

      if (config?.config?.audit_logs) {
        data.audit_log = {
          audit_log: true,
          remarks: esignRemark?.length > 0 ? esignRemark : `Printer Master edited - ${formData.printerId}`,
          authUser
        }
      }
      data.esign_status = esign_status
      setIsLoading(true)
      const res = await api(`/printermaster/${editData.id}`, data, 'put', true)
      setIsLoading(false)
      if (res.data.success) {
        setAlertData({
          ...alertData,
          openSnackbar: true,
          type: 'success',
          message: 'Printer master updated successfully'
        })
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
  console.log('handleAuthResult 01', isAuthenticated, isApprover, esignStatus, user);
  console.log('handleAuthResult 02', config?.userId, user.user_id);

  if (!isAuthenticated) {
    setAlertData({
      type: 'error',
      openSnackbar: true,
      message: 'Authentication failed, Please try again.'
    });
    resetState();
    return;
  }

  if (isApprover) {
    await handleApproverActions(user, esignStatus, remarks);
  } else {
    handleCreatorActions(user, esignStatus, remarks,isApprover);
  }

  resetState();
};

const resetState = () => {
  setApproveAPI({ approveAPIName: '', approveAPIEndPoint: '', approveAPImethod: '' });
  setEsignDownloadPdf(false);
  setAuthModalOpen(false);
};

const buildAuditLog = (user, remarks, action) => {
  return config?.config?.audit_logs
    ? {
        user_id: user.userId,
        user_name: user.userName,
        remarks: remarks?.length > 0 ? remarks : `printer master ${action} - ${auditLogMark}`,
        authUser: user.user_id
      }
    : {};
};

const handleApproverActions = async (user, esignStatus, remarks) => {
  const payload = {
    modelName: 'printermaster',
    esignStatus,
    id: eSignStatusId,
    name: auditLogMark,
    audit_log: buildAuditLog(user, remarks, esignStatus)
  };

  if (esignStatus === 'approved' && esignDownloadPdf) {
    setOpenModalApprove(false);

    downloadPdf(tableData, tableHeaderData, tableBody, allPrinterMasterData?.data, user);

    if (config?.config?.audit_logs) {
      const auditPayload = {
        audit_log: {
          audit_log: true,
           performed_action: 'Export report of printerMaster ',
           remarks: remarks?.length > 0 ? remarks : 'Printer master export report',
          authUser: user
        }
      };
      await api('/auditlog/', auditPayload, 'post', true);
    }

    return;
  }

  const res = await api('/esign-status/update-esign-status', payload, 'patch', true);

  if (res?.data) {
    setAlertData({
      ...alertData,
      openSnackbar: true,
      type: res.data.code === 200 ? 'success' : 'error',
      message: res.data.message
    });
  }

  setPendingAction(true);

  if (esignStatus === 'rejected' && esignDownloadPdf) {
    console.log('approver rejected');
    setOpenModalApprove(false);
  }
};

const handleCreatorActions = (user, esignStatus, remarks,isApprover) => {
  if (esignStatus === 'rejected') {
    setAuthModalOpen(false);
    setOpenModalApprove(false);
    setAlertData({
      ...alertData,
      openSnackbar: true,
      type: 'error',
      message: 'Access denied for this user.'
    });
    return;
  }

  if (!isApprover && esignDownloadPdf) {
    setAlertData({
      ...alertData,
      openSnackbar: true,
      type: 'error',
      message: 'Access denied: Download pdf disabled for this user.'
    });
    resetState();
    return;
  }

  if (esignStatus === 'approved') {
    console.log('Esign Download pdf', esignDownloadPdf);

    if (esignDownloadPdf) {
      console.log('esign is approved for creator to download');
      setEsignDownloadPdf(false);
      setOpenModalApprove(true);
    } else {
      console.log('esign is approved for creator');
      setAuthUser(user);
      setEsignRemark(remarks);
      setPendingAction(editData?.id ? 'edit' : 'add');
    }
  }
};

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
    setApproveAPI({
      approveAPIEndPoint: '/api/v1/printermaster',
      approveAPImethod: 'PATCH',
      approveAPIName: 'printermaster-approve'
    })
    setAuthModalOpen(true)
  }

  const handleDownloadPdf = () => {
    setApproveAPI({
      approveAPIEndPoint: '/api/v1/printermaster',
      approveAPImethod: 'PATCH',
      approveAPIName: 'printermaster-approve'
    })
    if (config?.config?.esign_status) {
      console.log('Esign enabled for download pdf')
      setEsignDownloadPdf(true)
      setAuthModalOpen(true)
      return
    }
    downloadPdf(tableData, tableHeaderData, tableBody, allPrinterMasterData?.data, userDataPdf)
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
                      <Button variant='contained' sx={{py:2}} onClick={handleOpenModal}>
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
                  setAllPrinterMaster={setAllPrinterMasterData}
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
