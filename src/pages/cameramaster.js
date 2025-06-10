'use-client'
import React, { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react'
import { Button, TableContainer, Paper, Typography, Grid2, Box } from '@mui/material'
import { IoMdAdd } from 'react-icons/io'
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
import EsignStatusDropdown from 'src/components/EsignStatusDropdown'
import { validateToken } from 'src/utils/ValidateToken'
import CustomSearchBar from 'src/components/CustomSearchBar'
import downloadPdf from 'src/utils/DownloadPdf'
import TableCameraMaster from 'src/views/tables/TableCameraMaster'
import CameraModal from 'src/components/Modal/CameraModal'

const Index = () => {
  const { settings } = useSettings()
  const [openModal, setOpenModal] = useState(false)
  const [alertData, setAlertData] = useState({ openSnackbar: false, type: '', message: '', variant: 'filled' })
  const [editData, setEditData] = useState({})
  const { setIsLoading } = useLoading()
  const [pendingAction, setPendingAction] = useState(null)
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
  const apiAccess = useApiAccess('cameramaster-create', 'cameramaster-update', 'cameramaster-approve')
  const [tableHeaderData, setTableHeaderData] = useState({ esignStatus: '', searchVal: '' })
  const searchBarRef = useRef(null)
  const [cameraData, setCamera] = useState({ data: [], index: 0 })
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
        console.log(authUser)
        if (pendingAction === 'edit') {
          await editCamera(esign_status)
        } else if (pendingAction === 'add') {
          await addCamera(esign_status)
        }
        setPendingAction(null)
      }
    }
    handleUserAction()
  }, [formData, pendingAction])

  const tableBody = cameraData?.data?.map((item, index) => [
    index + cameraData.index,
    item?.name,
    item?.ip,
    item?.port,
    item?.esign_status
  ])

  const tableData = useMemo(
    () => ({
      tableHeader: ['Sr.No.', 'Camera Name', 'IP Address', 'Port No.', 'E-Sign'],
      tableHeaderText: 'Camera Master Report',
      tableBodyText: 'Camera Master Data',
      filename: 'CameraMaster'
    }),
    []
  )

  const closeSnackbar = () => {
    setAlertData({ ...alertData, openSnackbar: false })
  }

  const handleSearch = val => {
    setTableHeaderData({ ...tableHeaderData, searchVal: val.trim().toLowerCase() })
  }

  const handleOpenModal = () => {
    setApproveAPI({
      approveAPIName: 'cameramaster-create',
      approveAPImethod: 'POST',
      approveAPIEndPoint: '/api/v1/cameramaster'
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
    console.log('Data :', data)
    if (editData?.id) {
      setApproveAPI({
        approveAPIName: 'cameramaster-update',
        approveAPImethod: 'PUT',
        approveAPIEndPoint: '/api/v1/cameramaster'
      })
    } else {
      setApproveAPI({
        approveAPIName: 'cameramaster-create',
        approveAPImethod: 'POST',
        approveAPIEndPoint: '/api/v1/cameramaster'
      })
    }
    if (config?.config?.esign_status) {
      setAuthModalOpen(true)
      return
    }
    setPendingAction(editData?.id ? 'edit' : 'add')
  }

  const addCamera = async esign_status => {
    try {
      const data = { ...formData }
      console.log('Add data ', data)
      if (config?.config?.audit_logs) {
        data.audit_log = {
          audit_log: true,
          remarks: esignRemark?.length > 0 ? esignRemark : `Camera master added - ${formData?.name}`,
          authUser
        }
      }

      data.esign_status = esign_status
      setIsLoading(true)
      const res = await api('/cameramaster/', data, 'post', true)
      setIsLoading(false)
      if (res?.data?.success) {
        setAlertData({
          ...alertData,
          openSnackbar: true,
          type: 'success',
          message: 'Camera master added successfully'
        })
        resetForm()
        setOpenModal(false)
      } else {
        setAlertData({
          ...alertData,
          type: 'error',
          message: res.data?.message,
          openSnackbar: true
        })
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('Error in add cameramaster ', error)
      router.push('/500')
    } finally {
      setApproveAPI({
        approveAPIName: '',
        approveAPImethod: '',
        approveAPIEndPoint: ''
      })
    }
  }

  const editCamera = async esign_status => {
    try {
      const data = { ...formData }
      if (config?.config?.audit_logs) {
        data.audit_log = {
          audit_log: true,
          remarks: esignRemark?.length > 0 ? esignRemark : `Camera master edited - ${formData?.name}`,
          authUser
        }
      }
      data.esign_status = esign_status
      setIsLoading(true)
      const res = await api(`/cameramaster/${editData.id}`, data, 'put', true)
      setIsLoading(false)
      if (res.data.success) {
        setAlertData({
          ...alertData,
          openSnackbar: true,
          type: 'success',
          message: 'Camera master updated successfully'
        })
        resetForm()
        setOpenModal(false)
      } else {
        setAlertData({ ...alertData, type: 'error', message: res.data.message, openSnackbar: true })
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('Erorr to edit camera master ', error)
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
    console.log('item', item)
    resetForm()
    setEditData(item)
    console.log('edit camera master', item)
    setOpenModal(true)
  }

  const handleAuthResult = async (isAuthenticated, user, isApprover, esignStatus, remarks) => {
    console.log('handleAuthResult 01', isAuthenticated, isApprover, esignStatus, user)
    console.log('handleAuthResult 02', config?.userId, user.user_id)

    const resetState = () => {
      setApproveAPI({
        approveAPIName: '',
        approveAPImethod: '',
        approveAPIEndPoint: ''
      })
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
        downloadPdf(tableData, tableHeaderData, tableBody, cameraData.data, userDataPdf)
      }
    }

    const createAuditLog = action =>
      config?.config?.audit_logs
        ? {
            user_id: user.userId,
            user_name: user.userName,
            remarks: remarks?.length > 0 ? remarks : `Camera master ${action} - ${auditLogMark}`,
            authUser: user.user_id
          }
        : {}

    const handleUpdateStatus = async () => {
      const data = {
        modelName: 'cameramaster',
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

    const processNonApproverActions = () => {
      if (esignStatus === 'rejected') {
        resetState()
        return
      }
      if (esignStatus === 'approved') {
        handleModalActions(true)
        if (!esignDownloadPdf) {
          console.log('esign is approved for creator', user)

          setPendingAction(editData?.id ? 'edit' : 'add')
        }
      }
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
      approveAPIName: 'cameramaster-approve',
      approveAPImethod: 'PATCH',
      approveAPIEndPoint: '/api/v1/cameramaster'
    })
    setAuthModalOpen(true)
    setESignStatusId(row.id)
    setAuditLogMark(row.name)
  }

  const resetFilter = () => {
    setTableHeaderData({ ...tableHeaderData, esignStatus: '', searchVal: '' })
    if (searchBarRef.current) {
      searchBarRef.current.resetSearch()
    }
  }

  const handleAuthModalOpen = () => {
    console.log('open auth model')
    setApproveAPI({
      approveAPIName: 'cameramaster-approve',
      approveAPImethod: 'PATCH',
      approveAPIEndPoint: '/api/v1/cameramaster'
    })
    setAuthModalOpen(true)
  }

  const handleDownloadPdf = () => {
    setApproveAPI({
      approveAPIName: 'cameramaster-approve',
      approveAPImethod: 'PATCH',
      approveAPIEndPoint: '/api/v1/cameramaster'
    })

    if (config?.config?.esign_status) {
      console.log('Esign enabled for download pdf')
      setEsignDownloadPdf(true)
      setAuthModalOpen(true)
      return
    }
    console.log('data', cameraData.data)
    downloadPdf(tableData, tableHeaderData, tableBody, cameraData.data, userDataPdf)
  }

  return (
    <Box padding={4}>
      <Head>
        <title>Camera Master</title>
      </Head>
      <Grid2 item xs={12}>
        <Typography variant='h2'>Camera Master</Typography>
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
            </Grid2>
            <Grid2 item xs={12}>
              <Typography variant='h4' className='mx-4 mt-3'>
                Camera Master Data
              </Typography>
              <TableContainer component={Paper}>
                <TableCameraMaster
                  handleUpdate={handleUpdate}
                  tableHeaderData={tableHeaderData}
                  pendingAction={pendingAction}
                  setCamera={setCamera}
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

      <CameraModal
        openModal={openModal}
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
  return validateToken(context, 'Camera Master')
}

export default ProtectedRoute(Index)
