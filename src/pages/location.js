'use-client'
import React, { useState, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { Box, Grid2, Typography, Button } from '@mui/material'
import { IoMdAdd } from 'react-icons/io'
import TableLocation from 'src/views/tables/TableLocation'
import { api } from 'src/utils/Rest-API'
import ProtectedRoute from 'src/components/ProtectedRoute'
import SnackbarAlert from 'src/components/SnackbarAlert'
import { useLoading } from 'src/@core/hooks/useLoading'
import { useAuth } from 'src/Context/AuthContext'
import Head from 'next/head'
import { useSettings } from 'src/@core/hooks/useSettings'
import { useRouter } from 'next/router'
import AuthModal from 'src/components/authModal'
import ChatbotComponent from 'src/components/ChatbotComponent'
import AccessibilitySettings from 'src/components/AccessibilitySettings'
import { getTokenValues } from 'src/utils/tokenUtils'
import { useApiAccess } from 'src/@core/hooks/useApiAccess'
import ExportResetActionButtons from 'src/components/ExportResetActionButtons'
import { validateToken } from 'src/utils/ValidateToken'
import LocationModal from 'src/components/Modal/LocationModal'
import CustomSearchBar from 'src/components/CustomSearchBar'
import EsignStatusDropdown from 'src/components/EsignStatusDropdown'
import downloadPdf from 'src/utils/DownloadPdf'

const Index = () => {
  const router = useRouter()
  const { settings } = useSettings()
  const searchRef = useRef()
  const [pendingAction, setPendingAction] = useState(null)
  const [openModal, setOpenModal] = useState(false)
  const [alertData, setAlertData] = useState({ openSnackbar: false, type: '', message: '', variant: 'filled' })
  const [locationData, setLocationData] = useState({ data: [], index: 0 })
  const { setIsLoading } = useLoading()
  const [editData, setEditData] = useState({})
  const [userDataPdf, setUserDataPdf] = useState()
  const { getUserData, removeAuthToken } = useAuth()
  const [config, setConfig] = useState(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [approveAPI, setApproveAPI] = useState({ approveAPIName: '', approveAPImethod: '', approveAPIEndPoint: '' })
  const [eSignStatusId, setESignStatusId] = useState('')
  const [auditLogMark, setAuditLogMark] = useState('')
  const [esignDownloadPdf, setEsignDownloadPdf] = useState(false)
  const [openModalApprove, setOpenModalApprove] = useState(false)
  const [formData, setFormData] = useState({})
  const [tableHeaderData, setTableHeaderData] = useState({ esignStatus: '', searchVal: '' })
  const apiAccess = useApiAccess('location-create', 'location-update', 'location-approve')
  const [authUser, setAuthUser] = useState({})
  const [esignRemark, setEsignRemark] = useState('')

  useLayoutEffect(() => {
    const data = getUserData()
    const decodedToken = getTokenValues()
    setConfig(decodedToken)
    setUserDataPdf(data)
    return () => {}
  }, [])

  useEffect(() => {
    const handleUserAction = async () => {
      if (formData && pendingAction) {
        const esign_status = config?.config?.esign_status && config?.role != 'admin' ? 'pending' : 'approved'
        if (pendingAction === 'edit') {
          await editLocation(esign_status)
        } else if (pendingAction === 'add') {
          await addLocation(esign_status)
        }
        setPendingAction(null)
      }
    }
    handleUserAction()
  }, [formData, pendingAction])

  const tableBody = locationData?.data?.map((item, index) => [
    index + locationData.index,
    item?.location_id,
    item?.location_name,
    item?.mfg_licence_no,
    item?.mfg_name,
    item?.location_type,
    item?.esign_status || 'N/A'
  ])

  const tableData = useMemo(
    () => ({
      tableHeader: ['Sr.No.', 'Id', 'Name', 'Mfg.Licence No.', 'Mfg Name', 'Location Type', 'E-Sign'],
      tableHeaderText: 'Location Master Report',
      tableBodyText: 'Location Master Data',
      filename: 'LocationMaster'
    }),
    []
  )

  const closeSnackbar = () => {
    setAlertData({ ...alertData, openSnackbar: false })
  }
  const handleOpenModal = () => {
    setApproveAPI({
      approveAPIName: 'location-create',
      approveAPImethod: 'POST',
      approveAPIEndPoint: '/api/v1/location'
    })
    setEditData({})
    setFormData({})
    setOpenModal(true)
  }
  const handleCloseModal = () => {
    setOpenModal(false)
    setFormData({})
    setEditData({})
  }

  const handleAuthModalClose = () => {
    setEsignDownloadPdf(false)
    setAuthModalOpen(false)
    setOpenModalApprove(false)
    setEsignDownloadPdf(false)
  }

  const handleSubmitForm = async data => {
    setFormData(prevData => {
      const updatedData = { ...prevData, ...data }
      return updatedData
    })
    if (editData?.location_id) {
      setApproveAPI({
        approveAPIName: 'location-update',
        approveAPImethod: 'PUT',
        approveAPIEndPoint: '/api/v1/location'
      })
    } else {
      setApproveAPI({
        approveAPIName: 'location-create',
        approveAPImethod: 'POST',
        approveAPIEndPoint: '/api/v1/location'
      })
    }
    if (config?.config?.esign_status && config?.role !== 'admin') {
      setAuthModalOpen(true)
      return
    }
    setPendingAction(editData?.id ? 'edit' : 'add')
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
        remarks: remarks?.length > 0 ? remarks : `location master ${action} - ${auditLogMark}`,
        authUser: user.user_id
      }
    : {};
};

const handleApproverActions = async (user, esignStatus, remarks) => {
  const payload = {
    modelName: 'location',
    esignStatus,
    id: eSignStatusId,
    name: auditLogMark,
    audit_log: buildAuditLog(user, remarks, esignStatus)
  };

  if (esignStatus === 'approved' && esignDownloadPdf) {
    setOpenModalApprove(false);

    downloadPdf(tableData, tableHeaderData, tableBody, locationData?.data, user);

    if (config?.config?.audit_logs) {
      const auditPayload = {
        audit_log: {
          audit_log: true,
          performed_action: 'Export report of location ',
          remarks: remarks?.length > 0 ? remarks : `location export report `,
          authUser: user
        }
      };
      await api('/auditlog/', auditPayload, 'post', true);
    }

    return;
  }
if (esignStatus === 'rejected' && esignDownloadPdf) {
      setOpenModalApprove(false)
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
      approveAPIName: 'location-approve',
      approveAPImethod: 'PATCH',
      approveAPIEndPoint: '/api/v1/location'
    })
    setAuthModalOpen(true)
    setESignStatusId(row.id)
    setAuditLogMark(row.location_id)
  }
  const addLocation = async esign_status => {
    try {
      const data = { ...formData }
      if (config?.config?.audit_logs) {
        data.audit_log = {
          audit_log: true,
          remarks: esignRemark?.length > 0 ? esignRemark : `location added - ${formData.locationName}`,
          authUser
        }
      }
      data.esign_status = esign_status
      setIsLoading(true)
      const res = await api('/location/', data, 'post', true)
      setIsLoading(false)

      if (res?.data?.success) {
        setOpenModal(false)
        setAlertData({ ...alertData, openSnackbar: true, type: 'success', message: 'Location added successfully' })
        setEditData({})
      } else {
        setAlertData({ ...alertData, openSnackbar: true, type: 'error', message: res.data?.message })
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        } else if (res.data.code === 409) {
          setAlertData({ ...alertData, openSnackbar: true, type: 'error', message: res.data.message })
        } else if (res.data.code == 500) {
          setOpenModal(false)
        }
      }
    } catch (error) {
      setOpenModal(false)
      console.log('Error in add locaiton ', error)
      router.push('/500')
    } finally {
      setApproveAPI({
        approveAPIName: '',
        approveAPImethod: '',
        approveAPIEndPoint: ''
      })
      //setOpenModal(false)
      setIsLoading(false)
    }
  }
  const editLocation = async esign_status => {
    try {
      const data = { ...formData }
      delete data.locationId
      if (config?.config?.audit_logs) {
        data.audit_log = {
          audit_log: true,
          remarks: esignRemark?.length > 0 ? esignRemark : `location edited - ${formData.locationName}`,
          authUser
        }
      }
      data.esign_status = esign_status
      setIsLoading(true)
      const res = await api(`/location/${editData.id}`, data, 'put', true)

      setIsLoading(false)
      if (res.data.success) {
        setOpenModal(false)
        setAlertData({ ...alertData, openSnackbar: true, type: 'success', message: 'Location updated successfully' })
      } else {
        setAlertData({ ...alertData, openSnackbar: true, type: 'error', message: res.data.message })
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        } else if (res.data.code === 500) {
          setOpenModal(false)
        }
      }
    } catch (error) {
      console.log('internal error while updating location',error)
      setOpenModal(false)
      router.push('/500')
    } finally {
      setIsLoading(false)
    }
  }
  const handleSearch = val => {
    setTableHeaderData({ ...tableHeaderData, searchVal: val.trim().toLowerCase() })
  }

  const handleUpdate = item => {
    setEditData(item)
    setOpenModal(true)
    if (config?.config?.esign_status) {
      setESignStatusId(item.id)
    }
  }

  const resetFilter = () => {
    if (searchRef.current) {
      searchRef.current.resetSearch() // Call the reset method in the child
    }
    setTableHeaderData({ ...tableHeaderData, esignStatus: '', searchVal: '' })
  }

  const handleAuthModalOpen = () => {
    setApproveAPI({
      approveAPIName: 'location-approve',
      approveAPImethod: 'PATCH',
      approveAPIEndPoint: '/api/v1/location'
    })
    setAuthModalOpen(true)
  }
  const handleDownloadPdf = () => {
    setApproveAPI({
      approveAPIName: 'location-approve',
      approveAPImethod: 'PATCH',
      approveAPIEndPoint: '/api/v1/location'
    })
    let data = getUserData()
    setUserDataPdf(data)
    if (config?.config?.esign_status && config?.role !== 'admin') {
      setEsignDownloadPdf(true)
      setAuthModalOpen(true)
      return
    }
    downloadPdf(tableData, tableHeaderData, tableBody, locationData.data, userDataPdf)
  }
  return (
    <Box padding={4}>
      <Head>
        <title>Location Master</title>
      </Head>
      <Grid2 item xs={12}>
        <Typography variant='h2'>Location Master </Typography>
      </Grid2>
      <Grid2 item xs={12}>
        <Grid2 item xs={12}>
          <Box sx={{ backgroundColor: settings.mode === 'dark' ? '#212121' : 'white', borderRadius: 1 }}>
            <Grid2 item xs={12}>
              {config?.config?.esign_status && (
                <Typography variant='h4' className='mx-4 my-2 mx-2' sx={{ paddingTop: '1%' }}>
                  Filter
                </Typography>
              )}
              <Grid2 item xs={12}>
                <Box className='d-flex justify-content-between align-items-center my-3 mx-4'>
                  {config?.config?.esign_status && config?.role !== 'admin' && (
                    <EsignStatusDropdown tableHeaderData={tableHeaderData} setTableHeaderData={setTableHeaderData} />
                  )}
                </Box>
                <Box className='d-flex justify-content-between align-items-center mx-4 my-2'>
                  <ExportResetActionButtons handleDownloadPdf={handleDownloadPdf} resetFilter={resetFilter} />
                  <Box className='d-flex justify-content-between align-items-center '>
                    <CustomSearchBar ref={searchRef} handleSearchClick={handleSearch} />

                    {apiAccess.addApiAccess && (
                      <Box className='mx-2'>
                        <Button variant='contained' sx={{py:2}} onClick={handleOpenModal} >
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
              <Typography variant='h4' className='mx-4 mt-3'>
                Location Data
              </Typography>
                <TableLocation
                  handleUpdate={handleUpdate}
                  tableHeaderData={tableHeaderData}
                  pendingAction={pendingAction}
                  setDataCallback={setLocationData}
                  apiAccess={apiAccess}
                  handleAuthCheck={handleAuthCheck}
                  config={config}
                />
            </Grid2>
          </Box>
        </Grid2>
      </Grid2>
      <SnackbarAlert openSnackbar={alertData.openSnackbar} closeSnackbar={closeSnackbar} alertData={alertData} />
      <LocationModal
        open={openModal}
        handleClose={handleCloseModal}
        editData={editData}
        handleSubmitForm={handleSubmitForm}
      />
      <AuthModal
        open={authModalOpen}
        handleClose={handleAuthModalClose}
        approveAPI={approveAPI}
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
  return validateToken(context, 'Location Master')
}

export default ProtectedRoute(Index)
