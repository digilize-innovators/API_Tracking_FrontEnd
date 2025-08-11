'use-client'
import { useLayoutEffect, useMemo, useRef, useEffect, useState } from 'react'
import { Button, Box, Grid2, Typography } from '@mui/material'
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
import ExportResetActionButtons from 'src/components/ExportResetActionButtons'
import { validateToken } from 'src/utils/ValidateToken'
import PrintingCategoryModal from 'src/components/Modal/PrintingCategoryModal'
import downloadPdf from 'src/utils/DownloadPdf'
import CustomSearchBar from 'src/components/CustomSearchBar'
import EsignStatusDropdown from 'src/components/EsignStatusDropdown'
import { getTokenValues } from 'src/utils/tokenUtils'

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
  const [allPrinterCategoryData, setAllPrinterCategoryData] = useState({ data: [], index: 0 })
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
  const [authUser, setAuthUser] = useState({})
  const [esignRemark, setEsignRemark] = useState('')
  const apiAccess = useApiAccess('printercategory-create', 'printercategory-update', 'printercategory-approve')

  const tableBody = allPrinterCategoryData?.data?.map((item, index) => [
    index + allPrinterCategoryData.index,
    item?.printer_category_name,
    item?.esign_status
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
  useLayoutEffect(() => {
    let data = getUserData()
    const decodedToken = getTokenValues()
    setConfig(decodedToken)
    setUserDataPdf(data)
    return () => {}
  }, [])

  useEffect(() => {
    const handleUserAction = async () => {
      if (formData && pendingAction) {
        const esign_status = config?.config?.esign_status ? 'pending' : 'approved'
        if (pendingAction === 'edit') {
          await editPrinterCategory(esign_status)
        } else if (pendingAction === 'add') {
          await addPrinterCategory(esign_status)
        }
        setPendingAction(null)
      }
    }
    handleUserAction()
  }, [formData, pendingAction])

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
    setEsignDownloadPdf(false)
    setAuthModalOpen(false)
    setOpenModalApprove(false)
    setEsignDownloadPdf(false)
  }

  const resetForm = () => {
    setEditData({})
  }

  const handleSubmitForm = async data => {
    setFormData(data)
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
  const addPrinterCategory = async esign_status => {
    try {
      const printerType = formData.printerType
      const data = {
        categoryId: formData.printerCategoryID,
        printerCategoryName: formData.printerCategoryName,
        printerType: printerType,
        esign_status
      }

      if (config?.config?.audit_logs) {
        data.audit_log = {
          audit_log: true,
          remarks: esignRemark?.length > 0 ? esignRemark : `Printer category added - ${formData.printerCategoryName}`,
          authUser
        }
      }

      data.esign_status = esign_status
      data.printerType = printerType
      setIsLoading(true)
      const res = await api('/printercategory/', data, 'post', true)
      setIsLoading(false)
      if (res?.data?.success) {
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
      setOpenModal(false)

      router.push('/500')
    } finally {
      setApproveAPI({ approveAPIName: '', approveAPImethod: '', approveAPIEndPoint: '' })
    }
  }
  const editPrinterCategory = async esign_status => {
    try {
      const printerType = formData.printerType
      const data = {
        categoryId: formData.printerCategoryID,
        printerCategoryName: formData.printerCategoryName,
        printerType: printerType,
        esign_status
      }
      if (config?.config?.audit_logs) {
        data.audit_log = {
          audit_log: true,
          remarks: esignRemark?.length > 0 ? esignRemark : `Printer category edited - ${formData.printerCategoryName}`,
          authUser
        }
      }
      data.esign_status = esign_status
      data.printerType = printerType
      setIsLoading(true)
      const res = await api(`/printercategory/${editData.id}`, data, 'put', true)
      setIsLoading(false)
      if (res.data.success) {
        setAlertData({
          ...alertData,
          openSnackbar: true,
          type: 'success',
          message: 'Printer category updated successfully'
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
  }

const handleAuthResult = async (isAuthenticated, user, isApprover, esignStatus, remarks) => {


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
        remarks: remarks?.length > 0 ? remarks : `printer category ${action} - ${auditLogMark}`,
        authUser: user.user_id
      }
    : {};
};

const handleApproverActions = async (user, esignStatus, remarks) => {
  const payload = {
    modelName: 'printercategory',
    esignStatus,
    id: eSignStatusId,
    name: auditLogMark,
    audit_log: buildAuditLog(user, remarks, esignStatus)
  };

  if (esignStatus === 'approved' && esignDownloadPdf) {
    setOpenModalApprove(false);

    downloadPdf(tableData, tableHeaderData, tableBody, allPrinterCategoryData?.data, user);

    if (config?.config?.audit_logs) {
      const auditPayload = {
        audit_log: {
          audit_log: true,
          performed_action: 'Export report of printerCategory',
          remarks :remarks?.length > 0 ? remarks : `Printer category export report`,
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

    if (esignDownloadPdf) {
      setEsignDownloadPdf(false);
      setOpenModalApprove(true);
    } else {
    
      setAuthUser(user);
      setEsignRemark(remarks);
      setPendingAction(editData?.id ? 'edit' : 'add');
    }
  }
};

  const handleAuthCheck = async row => {
    setApproveAPI({
      approveAPIName: 'printercategory-approve',
      approveAPImethod: 'PATCH',
      approveAPIEndPoint: '/api/v1/printercategory'
    })
    setAuthModalOpen(true)
    setESignStatusId(row.id)
    setAuditLogMark(row.printer_category_id)
  }

  const resetFilter = () => {
    if (searchBarRef.current) {
      searchBarRef.current.resetSearch()
    }
    setTableHeaderData({ ...tableHeaderData, esignStatus: '', searchVal: '' })
  }

  const handleSearch = val => {
    setTableHeaderData({ ...tableHeaderData, searchVal: val.trim().toLowerCase() })
  }

  const handleAuthModalOpen = () => {
    setApproveAPI({
      approveAPIName: 'printercategory-approve',
      approveAPImethod: 'PATCH',
      approveAPIEndPoint: '/api/v1/printercategory'
    })
    setAuthModalOpen(true)
  }
  const handleDownloadPdf = () => {
    setApproveAPI({
      approveAPIName: 'printercategory-approve',
      approveAPImethod: 'PATCH',
      approveAPIEndPoint: '/api/v1/printercategory'
    })
    if (config?.config?.esign_status) {
      setEsignDownloadPdf(true)
      setAuthModalOpen(true)
      return
    }
    downloadPdf(tableData, tableHeaderData, tableBody, allPrinterCategoryData?.data, userDataPdf)
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
                {config?.config.esign_status && (
                  <EsignStatusDropdown tableHeaderData={tableHeaderData} setTableHeaderData={setTableHeaderData} />
                )}
              </Box>
              <Box className='d-flex justify-content-between align-items-center mx-4 my-2'>
                <ExportResetActionButtons handleDownloadPdf={handleDownloadPdf} resetFilter={resetFilter} />
                <Box className='d-flex justify-content-between align-items-center '>
                  <CustomSearchBar ref={searchBarRef} handleSearchClick={handleSearch} />
                  {apiAccess.addApiAccess && (
                    <Box className='mx-2'>
                      <Button variant='contained' sx={{ py: 2 }} onClick={handleOpenModal}>
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
                <TablePrinterCategory
                  setDataCallback={setAllPrinterCategoryData}
                  handleUpdate={handleUpdate}
                  handleAuthCheck={handleAuthCheck}
                  apiAccess={apiAccess}
                  config={config}
                  pendingAction={pendingAction}
                  tableHeaderData={tableHeaderData}
                />
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
        approveAPI={approveAPI}
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
