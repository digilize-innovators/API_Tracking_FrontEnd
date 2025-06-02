'use-client'
import { Button, Paper, TableContainer, Box, Grid2, Typography } from '@mui/material'
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
import TableAreaCategory from 'src/views/tables/TableAreaCategory'
import { getTokenValues } from 'src/utils/tokenUtils'
import ExportResetActionButtons from 'src/components/ExportResetActionButtons'
import { validateToken } from 'src/utils/ValidateToken'
import EsignStatusDropdown from 'src/components/EsignStatusDropdown'
import CustomSearchBar from 'src/components/CustomSearchBar'
import AreaCategoryModal from 'src/components/Modal/AreaCategoryModal'
import downloadPdf from 'src/utils/DownloadPdf'

const Index = () => {
  const { settings } = useSettings()
  const [openModal, setOpenModal] = useState(false)
  const [alertData, setAlertData] = useState({ openSnackbar: false, type: '', message: '', variant: 'filled' })
  const [allAreaCategoryData, setAreaCat] = useState([])
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
  const [tableHeaderData, setTableHeaderData] = useState({
    esignStatus: '',
    searchVal: ''
  })
  const [pendingAction, setPendingAction] = useState(null)
  const [authUser, setAuthUser] = useState({})
  const [formData, setFormData] = useState({})
  const searchBarRef = useRef(null)
  const apiAccess = useApiAccess('area-category-create', 'area-category-update', 'area-category-approve')

  const tableBody = allAreaCategoryData.map((item, index) => [index + 1, item.area_category_name, item.esign_status])

  const tableData = useMemo(
    () => ({
      tableHeader: ['Sr.No.', 'Area Category', 'E-Sign'],
      tableHeaderText: 'Area Category Report',
      tableBodyText: 'Area Category Data',
      filename: 'AreaCategory'
    }),
    []
  )

  useEffect(() => {
    const handleUserAction = async () => {
      if (formData && pendingAction) {
        const esign_status = config?.config?.esign_status ? 'pending' : 'approved'
        if (pendingAction === 'edit') {
          await editAreaCategory(esign_status, null, authUser)
        } else if (pendingAction === 'add') {
          await addAreaCategory(esign_status, null, authUser)
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

  const closeSnackbar = () => {
    setAlertData({ ...alertData, openSnackbar: false })
  }
  const handleOpenModal = () => {
    setApproveAPI({
      approveAPIName: 'area-category-create',
      approveAPImethod: 'POST',
      approveAPIEndPoint: '/api/v1/area-category'
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
    setFormData(data)
    if (editData?.id) {
      setApproveAPI({
        approveAPIName: 'area-category-update',
        approveAPImethod: 'PUT',
        approveAPIEndPoint: 'api/v1/area-category'
      })
    } else {
      setApproveAPI({
        approveAPIName: 'area-category-create',
        approveAPImethod: 'POST',
        approveAPIEndPoint: 'api/v1/area-category'
      })
    }

    if (config?.config?.esign_status) {
      setAuthModalOpen(true)
      return
    }
    setPendingAction(editData?.id ? 'edit' : 'add')
  }
  const addAreaCategory = async (esign_status, remarks, authUser) => {
    try {
      const data = { areaCategoryName: formData.areaCategoryName }
      const auditlogRemark = remarks
      const audit_log = config?.config?.audit_logs
        ? {
            audit_log: true,
            performed_action: 'add',
            remarks: auditlogRemark?.length > 0 ? auditlogRemark : `area category added - ${formData.areaCategoryName}`,
            AuthUser: authUser
          }
        : {
            audit_log: false,
            performed_action: 'none',
            remarks: `none`,
            AuthUser: 'none'
          }
      data.audit_log = audit_log
      data.esign_status = esign_status
      console.log('Add area category data ', data)
      setIsLoading(true)
      const res = await api('/area-category/', data, 'post', true)
      setIsLoading(false)
      if (res?.data?.success) {
        console.log('res data', res?.data)
        setAlertData({ ...alertData, openSnackbar: true, type: 'success', message: 'Area category added successfully' })
        setOpenModal(false)
        resetForm()
      } else {
        console.log('error to add area category ', res.data)
        setAlertData({ ...alertData, openSnackbar: true, type: 'error', message: res.data?.message })
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('Erorr to add area category ', error)
      setOpenModal(false)

      router.push('/500')
    } finally {
      setApproveAPI({
        approveAPIName: '',
        approveAPImethod: '',
        approveAPIEndPoint: ''
      })
    }
  }
  const editAreaCategory = async (esign_status, remarks) => {
    try {
      const data = { areaCategoryName: formData.areaCategoryName }
      const auditlogRemark = remarks
      let audit_log
      if (config?.config?.audit_logs) {
        audit_log = {
          audit_log: true,
          performed_action: 'edit',
          remarks: auditlogRemark?.length > 0 ? auditlogRemark : `area category edited - ${formData.areaCategoryName}`,
          AuthUser: authUser
        }
      } else {
        audit_log = {
          audit_log: false,
          performed_action: 'none',
          remarks: `none`,
          AuthUser: 'none'
        }
      }
      data.audit_log = audit_log
      data.esign_status = esign_status
      setIsLoading(true)
      const res = await api(`/area-category/${editData.id}`, data, 'put', true)
      setIsLoading(false)
      if (res.data.success) {
        console.log('res ', res.data)
        setAlertData({
          ...alertData,
          openSnackbar: true,
          type: 'success',
          message: 'Area category updated successfully'
        })
        resetForm()
        setOpenModal(false)
      } else {
        console.log('error to edit area category ', res.data)
        setAlertData({ ...alertData, openSnackbar: true, type: 'error', message: res.data.message })
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('Erorr to edit area category ', error)
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
  const handleUpdate = item => {
    resetForm()
    setOpenModal(true)
    setEditData(item)
    console.log('edit area category ', item)
    setFormData({ ...formData, areaCategoryName: item.area_category_name })
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
    if (!isAuthenticated) {
      setAlertData({ openSnackbar: true, type: 'error', message: 'Authentication failed, Please try again.' })
      return
    }
    const handleApproverActions = async () => {
      const data = {
        modelName: 'areacategory',
        esignStatus,
        id: eSignStatusId,
        audit_log: config?.config?.audit_logs
          ? {
              user_id: user.userId,
              authUser: user.user_id,
              user_name: user.userName,
              performed_action: 'approved',
              remarks: remarks.length > 0 ? remarks : `area category approved - ${auditLogMark}`
            }
          : {}
      }
      if (esignStatus === 'approved' && esignDownloadPdf) {
        setOpenModalApprove(false)
        console.log('esign is approved for approver')
        downloadPdf(tableData, tableHeaderData, tableBody, allAreaCategoryData, userDataPdf)
        resetState()
        return
      }
      const res = await api('/esign-status/update-esign-status', data, 'patch', true)
      if (res.data.code == 400) {
        setAlertData({
          ...alertData,
          openSnackbar: true,
          type: 'error',
          message: res.data.message
        })
      } else if (res.data.code == 200) {
        setAlertData({
          ...alertData,
          openSnackbar: true,
          type: 'success',
          message: res.data.message
        })
      } else {
        setAlertData({
          ...alertData,
          openSnackbar: true,
          type: 'error',
          message: res.data.message
        })
      }

      console.log('esign status update', esignStatus, res?.data)
      setPendingAction(true)
      if (res?.data.esign_status === 'rejected') {
        console.log('approver rejected')
        setOpenModalApprove(false)
        resetState()
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
        } else if (!isApprover && approveAPI.approveAPIName === 'area-category-approve') {
          setAlertData({
            ...alertData,
            openSnackbar: true,
            type: 'error',
            message: 'Same user cannot Approve'
          })
        } else {
          console.log('esign is approved for creator')
          setAuthUser(user)
          setPendingAction(editData?.id ? 'edit' : 'add')
        }
      }
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
      handleCreatorActions()
    }
    resetState()
  }
  const handleAuthCheck = async row => {
    console.log('handleAuthCheck', row)
    setApproveAPI({
      approveAPIName: 'area-category-approve',
      approveAPImethod: 'PATCH',
      approveAPIEndPoint: '/api/v1/area-category'
    })
    setAuthModalOpen(true)
    setESignStatusId(row.id)
    setAuditLogMark(row.area_category_name)
    console.log('row', row)
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
    console.log('OPen auth model')
    setApproveAPI({
      approveAPIName: 'area-category-approve',
      approveAPImethod: 'PATCH',
      approveAPIEndPoint: '/api/v1/area-category'
    })
    setAuthModalOpen(true)
  }
  const handleDownloadPdf = () => {
    setApproveAPI({
      approveAPIName: 'area-category-approve',
      approveAPImethod: 'PATCH',
      approveAPIEndPoint: '/api/v1/area-category'
    })
    if (config?.config?.esign_status) {
      console.log('Esign enabled for download pdf')
      setEsignDownloadPdf(true)
      setAuthModalOpen(true)
      return
    }

    downloadPdf(tableData, tableHeaderData, tableBody, allAreaCategoryData, userDataPdf)
  }
  return (
    <Box padding={4}>
      <Head>
        <title>Area Category</title>
      </Head>
      <Grid2 item xs={12}>
        <Typography variant='h2'>Area Category</Typography>
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
                Area Category Data
              </Typography>
              <TableContainer component={Paper}>
                <TableAreaCategory
                  pendingAction={pendingAction}
                  handleUpdate={handleUpdate}
                  setAreaCat={setAreaCat}
                  handleAuthCheck={handleAuthCheck}
                  apiAccess={apiAccess}
                  config={config}
                  tableHeaderData={tableHeaderData}
                />
              </TableContainer>
            </Grid2>
          </Box>
        </Grid2>
      </Grid2>
      <SnackbarAlert openSnackbar={alertData.openSnackbar} closeSnackbar={closeSnackbar} alertData={alertData} />

      <AreaCategoryModal
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
  return validateToken(context, 'Area Category')
}
export default ProtectedRoute(Index)
