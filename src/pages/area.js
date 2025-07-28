'use-client'
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { Button, Box, Grid2, Typography } from '@mui/material'
import { IoMdAdd } from 'react-icons/io'
import TableArea from 'src/views/tables/TableArea'
import { api } from 'src/utils/Rest-API'
import ProtectedRoute from 'src/components/ProtectedRoute'
import SnackbarAlert from 'src/components/SnackbarAlert'
import { useLoading } from 'src/@core/hooks/useLoading'
import Head from 'next/head'
import { useAuth } from 'src/Context/AuthContext'
import { useSettings } from 'src/@core/hooks/useSettings'
import { useRouter } from 'next/router'
import AuthModal from 'src/components/authModal'
import ChatbotComponent from 'src/components/ChatbotComponent'
import AccessibilitySettings from 'src/components/AccessibilitySettings'
import { validateToken } from 'src/utils/ValidateToken'
import { getTokenValues } from '../utils/tokenUtils'
import { useApiAccess } from 'src/@core/hooks/useApiAccess'
import ExportResetActionButtons from 'src/components/ExportResetActionButtons'
import AreaModel from 'src/components/Modal/AreaModel'
import CustomSearchBar from 'src/components/CustomSearchBar'
import EsignStatusDropdown from 'src/components/EsignStatusDropdown'
import downloadPdf from 'src/utils/DownloadPdf'

const Index = () => {
  const { settings } = useSettings()
  const [openModal, setOpenModal] = useState(false)
  const [alertData, setAlertData] = useState({ openSnackbar: false, type: '', message: '', variant: 'filled' })
  const [editData, setEditData] = useState({})
  const { setIsLoading } = useLoading()
  const { getUserData, removeAuthToken } = useAuth()
  const [pendingAction, setPendingAction] = useState(null)
  const [userDataPdf, setUserDataPdf] = useState()
  const router = useRouter()
  const [config, setConfig] = useState(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [approveAPI, setApproveAPI] = useState({ approveAPIName: '', approveAPImethod: '', approveAPIEndPoint: '' })
  const [eSignStatusId, setESignStatusId] = useState('')
  const [auditLogMark, setAuditLogMark] = useState('')
  const [esignDownloadPdf, setEsignDownloadPdf] = useState(false)
  const [openModalApprove, setOpenModalApprove] = useState(false)
  const [tableHeaderData, setTableHeaderData] = useState({ esignStatus: '', searchVal: '' })
  const apiAccess = useApiAccess('area-create', 'area-update', 'area-approve')
  const searchBarRef = useRef(null)
  const [areaData, setAreaData] = useState({ data: [], index: 0 })
  const [formData, setFormData] = useState({})
  const [authUser, setAuthUser] = useState({})
  const [esignRemark, setEsignRemark] = useState('')

  useEffect(() => {
    const handleUserAction = async () => {
      if (formData && pendingAction) {
        const esign_status = config?.config?.esign_status ? 'pending' : 'approved'
        if (pendingAction === 'edit') {
          await editArea(esign_status)
        } else if (pendingAction === 'add') {
          await addArea(esign_status)
        }
        setPendingAction(null)
      }
    }
    handleUserAction()
  }, [formData, pendingAction])

  useLayoutEffect(() => {
    let data = getUserData()
    const decodedToken = getTokenValues()
    setConfig(decodedToken)
    setUserDataPdf(data)
    return () => {}
  }, [])

  const tableBody = areaData?.data?.map((item, index) => [
    index + areaData.index,
    item?.area_id,
    item?.area_name,
    item?.area_category?.history[0]?.area_category_name,
    item?.esign_status
  ])

  const tableData = {
    tableHeader: ['Sr.No.', 'Id', 'Name', 'Area Category', 'E-Sign'],
    tableHeaderText: 'Area Master Report',
    tableBodyText: 'Area Master Data',
    filename: 'AreaMaster'
  }

  const closeSnackbar = () => {
    setAlertData({ ...alertData, openSnackbar: false })
  }

  const handleOpenModal = () => {
    setApproveAPI({ approveAPIName: 'area-create', approveAPImethod: 'POST', approveAPIEndPoint: '/api/v1/area' })
    setEditData({})
    setOpenModal(true)
  }

  const handleCloseModal = () => {
    setEditData({})
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
      setApproveAPI({ approveAPIName: 'area-update', approveAPImethod: 'PUT', approveAPIEndPoint: '/api/v1/area' })
    } else {
      setApproveAPI({ approveAPIName: 'area-create', approveAPImethod: 'POST', approveAPIEndPoint: '/api/v1/area' })
    }

    if (config?.config?.esign_status) {
      setAuthModalOpen(true)
      return
    }

    setPendingAction(editData?.id ? 'edit' : 'add')
  }

  const addArea = async esign_status => {
    try {
      const data = { ...formData }
      if (config?.config?.audit_logs) {
        data.audit_log = {
          audit_log: true,
          remarks: esignRemark?.length > 0 ? esignRemark : `area added - ${formData.areaName}`,
          authUser
        }
      }
      data.esign_status = esign_status
      setIsLoading(true)
      const res = await api('/area/', data, 'post', true)
      setIsLoading(false)
      if (res?.data?.success) {
        setAlertData({ ...alertData, openSnackbar: true, type: 'success', message: 'Area added successfully' })
        resetForm()
        setOpenModal(false)
      } else {
        setAlertData({ ...alertData, openSnackbar: true, type: 'error', message: res.data?.message })
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('Error to add Area', error)
      router.push('/500')
    } finally {
      setApproveAPI({ approveAPIName: '', approveAPImethod: '', approveAPIEndPoint: '' })
    }
  }

  const editArea = async esign_status => {
    try {
      const data = { ...formData }
      delete data.areaId
      if (config?.config?.audit_logs) {
        data.audit_log = {
          audit_log: true,
          remarks: esignRemark > 0 ? esignRemark : `area edited - ${formData?.areaName}`,
          authUser
        }
      }
      data.esign_status = esign_status
      setIsLoading(true)
      const res = await api(`/area/${editData.id}`, data, 'put', true)
      setIsLoading(false)
      if (res.data.success) {
        setAlertData({ ...alertData, openSnackbar: true, type: 'success', message: 'Area updated successfully' })
        resetForm()
        setOpenModal(false)
      } else {
        setAlertData({ ...alertData, openSnackbar: true, type: 'error', message: res.data.message })
        if (res.data.code === 401) {
          removeAuthToken()
          console.log(res.data.message)
          router.push('/401')
        }
      }
    } catch (error) {
      console.log(error, 'error while edit')
      router.push('/500')
    } finally {
      setApproveAPI({ approveAPIName: '', approveAPImethod: '', approveAPIEndPoint: '' })
    }
  }

  const handleAuthResult = async (isAuthenticated, user, isApprover, esignStatus, remarks) => {
  if (!isAuthenticated) {
    handleUnauthenticated();
    return;
  }

  if (!isApprover && esignDownloadPdf) {
    handleDownloadDenied();
    return;
  }

  if (isApprover) {
    await handleApproverFlow(esignStatus, remarks, user);
  } else {
    handleCreatorFlow(esignStatus, remarks, user);
  }
  
  resetState();
};

// Helper functions
const resetState = () => {
  setApproveAPI({ approveAPIName: '', approveAPImethod: '', approveAPIEndPoint: '' });
  setEsignDownloadPdf(false);
  setAuthModalOpen(false);
};

const handleUnauthenticated = () => {
  setAlertData({ type: 'error', message: 'Authentication failed, Please try again.', openSnackbar: true });
  resetState();
};

const handleDownloadDenied = () => {
  setAlertData({
    ...alertData,
    openSnackbar: true,
    type: 'error',
    message: 'Access denied: Download pdf disabled for this user.'
  });
  resetState();
};

const handleApproverFlow = async (esignStatus, remarks, user) => {
  if (esignStatus === 'approved' || esignStatus === 'rejected') {
    await handleApproverActions(esignStatus, remarks, user);
  }
};

const handleApproverActions = async (esignStatus, remarks, user) => {
  const isApproved = esignStatus === 'approved';
  setOpenModalApprove(!isApproved);

  if (isApproved && esignDownloadPdf) {
    await handlePdfExport(remarks, user);
    resetState();
    return;
  }

  await updateEsignStatus(esignStatus, remarks, user);
  setPendingAction(true);
};

const handlePdfExport = async (remarks, user) => {
  downloadPdf(tableData, tableHeaderData, tableBody, areaData.data, user);
  
  if (config?.config?.audit_logs) {
    const auditData = {
      audit_log: {
        audit_log: true,
        performed_action: 'Export report of areaMaster',
        remarks: remarks?.length > 0 ? remarks : 'Area master export report',
        authUser: user
      }
    };
    await api('/auditlog/', auditData, 'post', true);
  }
};

const updateEsignStatus = async (esignStatus, remarks, user) => {
  const data = {
    modelName: 'area',
    esignStatus,
    id: eSignStatusId,
    name: auditLogMark,
    audit_log: config?.config?.audit_logs ? {
      user_id: user.userId,
      user_name: user.userName,
      remarks: remarks?.length > 0 ? remarks : `area ${esignStatus} - ${auditLogMark}`,
      authUser: user.user_id
    } : {}
  };
  
  const res = await api('/esign-status/update-esign-status', data, 'patch', true);
  
  if (res.data) {
    setAlertData({
      ...alertData,
      openSnackbar: true,
      type: res.data.code === 200 ? 'success' : 'error',
      message: res.data.message
    });
  }
};

const handleCreatorFlow = (esignStatus, remarks, user,isApprover) => {
  if (esignStatus === 'rejected') {
    handleCreatorRejection();
    return;
  }

  if (esignStatus === 'approved') {
    handleCreatorApproval(remarks, user,isApprover);
  }
};

const handleCreatorRejection = () => {
  setAuthModalOpen(false);
  setOpenModalApprove(false);
  setAlertData({
    ...alertData,
    openSnackbar: true,
    type: 'error',
    message: 'Access denied for this user.'
  });
};

const handleCreatorApproval = (remarks, user,isApprover) => {
  if (esignDownloadPdf) {
    setOpenModalApprove(true);
  } else if (!isApprover && approveAPI.approveAPIName === 'area-approve') {
    setAlertData({
      ...alertData,
      openSnackbar: true,
      type: 'error',
      message: 'same user cannot approve'
    });
  } else {
    setAuthUser(user);
    setEsignRemark(remarks);
    setPendingAction(editData?.id ? 'edit' : 'add');
  }
};

  const handleAuthCheck = async row => {
    setApproveAPI({ approveAPIName: 'area-approve', approveAPImethod: 'PATCH', approveAPIEndPoint: '/api/v1/area' })

    setAuthModalOpen(true)
    setESignStatusId(row.id)
    setAuditLogMark(row.area_id)
  }

  const handleUpdate = item => {
    resetForm()
    setEditData(item)
    setOpenModal(true)
  }

  const resetFilter = () => {
    setTableHeaderData({ ...tableHeaderData, esignStatus: '', searchVal: '' })
    if (searchBarRef.current) {
      searchBarRef.current.resetSearch()
    }
  }

  const handleSearch = val => {
    setTableHeaderData({ ...tableHeaderData, searchVal: val.trim().toLowerCase() })
  }

  const handleAuthModalOpen = () => {
    setApproveAPI({ approveAPIName: 'area-approve', approveAPImethod: 'PATCH', approveAPIEndPoint: '/api/v1/area' })
    setAuthModalOpen(true)
  }

  const handleDownloadPdf = () => {
    setApproveAPI({ approveAPIName: 'area-approve', approveAPImethod: 'PATCH', approveAPIEndPoint: '/api/v1/area' })
    if (config?.config?.esign_status) {
      setEsignDownloadPdf(true)
      setAuthModalOpen(true)
      return
    }
    downloadPdf(tableData, tableHeaderData, tableBody, areaData.data, userDataPdf)
  }

  return (
    <Box padding={4}>
      <Head>
        <title>Area Master</title>
      </Head>
      <Grid2 item xs={12}>
        <Typography variant='h2'>Area Master</Typography>
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
                      <Button variant='contained' className='py-2' onClick={handleOpenModal}>
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
                Area Data
              </Typography>
                <TableArea
                  handleUpdate={handleUpdate}
                  tableHeaderData={tableHeaderData}
                  pendingAction={pendingAction}
                  setDataCallback={setAreaData}
                  handleAuthCheck={handleAuthCheck}
                  apiAccess={apiAccess}
                  config={config}
                />
            </Grid2>
          </Box>
        </Grid2>
      </Grid2>
      <SnackbarAlert openSnackbar={alertData.openSnackbar} closeSnackbar={closeSnackbar} alertData={alertData} />
      <AreaModel open={openModal} onClose={handleCloseModal} editData={editData} handleSubmitForm={handleSubmitForm} />

      <AuthModal
        open={authModalOpen}
        handleClose={handleAuthModalClose}
        handleAuthResult={handleAuthResult}
        approveAPIName={approveAPI.approveAPIName}
        approveAPIEndPoint={approveAPI.approveAPIEndPoint}
        approveAPImethod={approveAPI.approveAPImethod}
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
  return validateToken(context, 'Area Master')
}
export default ProtectedRoute(Index)
