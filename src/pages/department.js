'use-client'
import React, { useState, useEffect, useMemo, useLayoutEffect, useRef } from 'react'
import { Button, TableContainer, Paper, Grid2, Typography, Box } from '@mui/material'
import { IoMdAdd } from 'react-icons/io'
import { api } from 'src/utils/Rest-API'
import ProtectedRoute from 'src/components/ProtectedRoute'
import TableDepartment from 'src/views/tables/TableDepartment'
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
import { getTokenValues } from 'src/utils/tokenUtils'
import { useApiAccess } from 'src/@core/hooks/useApiAccess'
import ExportResetActionButtons from 'src/components/ExportResetActionButtons'
import EsignStatusDropdown from 'src/components/EsignStatusDropdown'
import downloadPdf from 'src/utils/DownloadPdf'
import CustomSearchBar from 'src/components/CustomSearchBar'
import DepartmentModel from 'src/components/Modal/DepartmentModel'

const Index = () => {
  const router = useRouter()
  const { settings } = useSettings()
  const [openModal, setOpenModal] = useState(false)
  const [alertData, setAlertData] = useState({ openSnackbar: false, type: '', message: '', variant: 'filled' })
  const [departmentData, setDepartment] = useState([])
  const [editData, setEditData] = useState({})
  const { setIsLoading } = useLoading()
  const [userDataPdf, setUserDataPdf] = useState()
  const { getUserData, removeAuthToken } = useAuth()
  const [config, setConfig] = useState(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [approveAPI, setApproveAPI] = useState({ approveAPIName: '', approveAPImethod: '', approveAPIEndPoint: '' })
  const [eSignStatusId, setESignStatusId] = useState('')
  const [auditLogMark, setAuditLogMark] = useState('')
  const [esignDownloadPdf, setEsignDownloadPdf] = useState(false)
  const [openModalApprove, setOpenModalApprove] = useState(false)
  const [tableHeaderData, setTableHeaderData] = useState({
    esignStatus: '',
    searchVal: ''
  })
  const [pendingAction, setPendingAction] = useState(null)
  const searchBarRef = useRef(null)
  const [formData, setFormData] = useState({})
  const apiAccess1 = useApiAccess('department-create', 'department-update', 'department-approve')
  const apiAccess2 = useApiAccess('designation-create', 'designation-update', 'designation-approve')
  const apiAccess = {
    ...apiAccess1,
    addDesignationApiAccess: apiAccess2.addApiAccess,
    editDesignationApiAccess: apiAccess2.editApiAccess
  }
  const [authUser, setAuthUser] = useState({})
  const [esignRemark, setEsignRemark] = useState('')

  const tableBody = departmentData?.map((item, index) => [
    index + 1,
    item.department_id,
    item.department_name,
    item.is_location_required,
    item.esign_status
  ])

  const tableData = useMemo(
    () => ({
      tableHeader: ['Sr.No.', 'Department Id', 'Department Name', 'Location Required', 'E-Sign'],
      tableHeaderText: 'Department Report',
      tableBodyText: 'Department Data',
      filename: 'DepartmentMaster'
    }),
    []
  )

  useEffect(() => {
    const handleUserAction = async () => {
      if (formData && pendingAction) {
        const esign_status = config?.config?.esign_status && config?.role !== 'admin' ? 'pending' : 'approved'
        if (pendingAction === 'edit') {
          await editDepartment(esign_status)
        } else if (pendingAction === 'add') {
          await addDepartment(esign_status)
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
  }, [openModal])

  const resetFilter = () => {
    if (searchBarRef.current) {
      searchBarRef.current.resetSearch()
    }
    setTableHeaderData({ ...tableHeaderData, esignStatus: '', searchVal: '' })
  }
  const handleOpenModal = () => {
    setApproveAPI({
      approveAPIName: 'department-create',
      approveAPImethod: 'POST',
      approveAPIEndPoint: '/api/v1/department'
    })
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
  const resetForm = () => {
    setEditData({})
  }

  const handleUpdate = item => {
    setOpenModal(true)
    setEditData(item)
    if (config?.config?.esign_status && config?.role !== 'admin') {
      setESignStatusId(item.id)
    }
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
      setEsignDownloadPdf(false)
      setAuthModalOpen(false)
    }
    const handleCreatorActions = () => {
      if (
        !isApprover &&
        (approveAPI.approveAPIName === 'department-create' || approveAPI.approveAPIName === 'department-update')
      ) {
        setAuthUser(user)
        setEsignRemark(remarks)
        console.log('esign is approved for creator')
        setPendingAction(editData?.id ? 'edit' : 'add')
      } else if (!isApprover && approveAPI.approveAPIName === 'department-approve') {
        setAlertData({ openSnackbar: true, type: 'error', message: 'same user cannot Approve' })
      }
      resetState()
    }
    const handleUnauthenticated = () => {
      setAlertData({ openSnackbar: true, type: 'error', message: 'Authentication failed, Please try again.' })
      resetState()
    }

    const handleApproverActions = async () => {
      if (!esignDownloadPdf && isApprover && approveAPI.approveAPIName !== 'department-approve') {
        setAlertData({
          ...alertData,
          openSnackbar: true,
          type: 'error',
          message: 'Access denied for this user.'
        })
        resetState()
        return
      } else {
        const data = {
          modelName: 'department',
          esignStatus,
          id: eSignStatusId,
          audit_log: config?.config?.audit_logs
            ? {
                user_id: user.userId,
                user_name: user.userName,
                remarks: remarks.length > 0 ? remarks : `department approved - ${auditLogMark}`,
                authUser: user.user_id
              }
            : {}
        }

        if (isApprover && esignDownloadPdf) {
          if (esignStatus === 'approved' && esignDownloadPdf) {
            setOpenModalApprove(false)
            console.log('esign is approved for approver')
            downloadPdf(tableData, tableHeaderData, tableBody, departmentData, userDataPdf)
            resetState()
            return
          }

          if (esignStatus === 'rejected' && esignDownloadPdf) {
            console.log('approver rejected')
            setOpenModalApprove(false)
            resetState()
          }
        } else if (isApprover && approveAPI.approveAPIName === 'department-approve') {
          console.log(isApprover)
          const res = await api('/esign-status/update-esign-status', data, 'patch', true)
          if (res.data) {
            setAlertData({
              ...alertData,
              openSnackbar: true,
              type: res.data.code === 200 ? 'success' : 'error',
              message: res.data.message
            })
          }
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
    }
    const handleCreatorRejection = () => {
      setAuthModalOpen(false)
      setOpenModalApprove(false)
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
      await handleApproverActions()
    } else if (esignStatus === 'rejected') {
      handleCreatorRejection()
    } else {
      handleCreatorActions()
    }
    resetState()
  }
  const handleAuthCheck = async row => {
    console.log('handleAuthCheck', row)
    setApproveAPI({
      approveAPIName: 'department-approve',
      approveAPImethod: 'PATCH',
      approveAPIEndPoint: '/api/v1/department'
    })
    setAuthModalOpen(true)
    setESignStatusId(row.id)
    setAuditLogMark(row.department_id)
    console.log('row', row)
  }

  const handleSubmitForm = async data => {
    setFormData(data)
    if (editData?.id) {
      setApproveAPI({
        approveAPIName: 'department-update',
        approveAPImethod: 'PUT',
        approveAPIEndPoint: '/api/v1/department'
      })
    } else {
      setApproveAPI({
        approveAPIName: 'department-create',
        approveAPImethod: 'POST',
        approveAPIEndPoint: '/api/v1/department'
      })
    }

    if (config?.config?.esign_status && config?.role !== 'admin') {
      setAuthModalOpen(true)
      return
    }
    setPendingAction(editData?.id ? 'edit' : 'add')
  }
  const addDepartment = async esign_status => {
    try {
      const data = { ...formData }
      if (config?.config?.audit_logs) {
        data.audit_log = {
          audit_log: true,
          remarks: esignRemark?.length > 0 ? esignRemark : `Department added - ${formData.departmentId}`,
          authUser
        }
      }
      data.esign_status = esign_status
      setIsLoading(true)
      const res = await api('/department/', data, 'post', true)
      console.log('Add department res ', res.data)
      setIsLoading(false)
      if (res?.data?.success) {
        setAlertData({ ...alertData, openSnackbar: true, type: 'success', message: 'Department added successfully' })
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
      router.push('/500')
      setOpenModal(false)
    } finally {
      setIsLoading(false)
      setApproveAPI({
        approveAPIName: '',
        approveAPImethod: '',
        approveAPIEndPoint: ''
      })
    }
  }
  const editDepartment = async esign_status => {
    try {
      const data = { ...formData }
      delete data.departmentId
      if (config?.config?.audit_logs) {
        data.audit_log = {
          audit_log: true,
          remarks: esignRemark > 0 ? esignRemark : `department edited - ${formData.departmentName}`,
          authUser
        }
      }
      data.esign_status = esign_status
      setIsLoading(true)
      const res = await api(`/department/${editData.id}`, data, 'put', true)
      setIsLoading(false)
      if (res.data.success) {
        setAlertData({ ...alertData, openSnackbar: true, type: 'success', message: 'Department updated successfully' })
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
      console.log(error, 'error while edit')
      router.push('/500')
      setOpenModal(false)
    } finally {
      setIsLoading(false)
      setApproveAPI({
        approveAPIName: '',
        approveAPImethod: '',
        approveAPIEndPoint: ''
      })
    }
  }
  const closeSnackbar = () => {
    setAlertData({ ...alertData, openSnackbar: false })
  }
  const handleSearch = val => {
    setTableHeaderData({ ...tableHeaderData, searchVal: val.trim().toLowerCase() })
  }

  const handleAuthModalOpen = () => {
    console.log('OPen auth model')
    setApproveAPI({
      approveAPIName: 'department-approve',
      approveAPImethod: 'PATCH',
      approveAPIEndPoint: '/api/v1/department'
    })
    setAuthModalOpen(true)
  }
  const handleDownloadPdf = () => {
    console.log(departmentData)
    setApproveAPI({
      approveAPIName: 'department-approve',
      approveAPImethod: 'PATCH',
      approveAPIEndPoint: '/api/v1/department'
    })
    if (config?.config?.esign_status && config?.role !== 'admin') {
      console.log('Esign enabled for download pdf')
      setEsignDownloadPdf(true)
      setAuthModalOpen(true)
      return
    }
    downloadPdf(tableData, tableHeaderData, tableBody, departmentData, userDataPdf)
  }
  return (
    <Box padding={4}>
      <Head>
        <title>Department Master</title>
      </Head>
      <Grid2 item xs={12}>
        <Typography variant='h2'>Department Master</Typography>
      </Grid2>
      <Grid2 item xs={12}>
        <Grid2 item xs={12}>
          <Box sx={{ backgroundColor: settings.mode === 'dark' ? '#212121' : 'white', borderRadius: 1 }}>
            <Typography variant='h4' className='mx-4 my-2 mx-2' sx={{ paddingTop: '1%' }}>
              Filter
            </Typography>
            <Grid2 item xs={12}>
              <Box className='d-flex justify-content-between align-items-center my-3 mx-4'>
                {config?.config?.esign_status && config?.role !== 'admin' && (
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
              <Typography variant='h4' className='mx-4 mt-3'>
                Department Data
              </Typography>
              <TableContainer component={Paper}>
                <TableDepartment
                  pendingAction={pendingAction}
                  alertData={alertData}
                  setAlertData={setAlertData}
                  setDepartment={setDepartment}
                  handleUpdate={handleUpdate}
                  handleAuthCheck={handleAuthCheck}
                  apiAccess={apiAccess}
                  config_dept={config}
                  tableHeaderData={tableHeaderData}
                />
              </TableContainer>
            </Grid2>
          </Box>
        </Grid2>
      </Grid2>
      <SnackbarAlert openSnackbar={alertData.openSnackbar} closeSnackbar={closeSnackbar} alertData={alertData} />
      <DepartmentModel
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
  return validateToken(context, 'Department Master')
}

export default ProtectedRoute(Index)
