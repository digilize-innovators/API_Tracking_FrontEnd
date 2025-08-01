'use-client'
import React, { useState, useEffect, useMemo, useLayoutEffect, useRef } from 'react'
import {
  InputLabel,
  FormControl,
  Typography,
  Select,
  Button,
  Box,
  MenuItem,
  Grid2
} from '@mui/material'
import { IoMdAdd } from 'react-icons/io'
import ProtectedRoute from 'src/components/ProtectedRoute'
import { api } from 'src/utils/Rest-API'
import SnackbarAlert from 'src/components/SnackbarAlert'
import { useLoading } from 'src/@core/hooks/useLoading'
import Head from 'next/head'
import { useAuth } from 'src/Context/AuthContext'
import { BaseUrl } from 'constants'
import { useSettings } from 'src/@core/hooks/useSettings'
import { decrypt } from 'src/utils/Encrypt-Decrypt'
import { useRouter } from 'next/router'
import AuthModal from 'src/components/authModal'
import ChatbotComponent from 'src/components/ChatbotComponent'
import AccessibilitySettings from 'src/components/AccessibilitySettings'
import { validateToken } from 'src/utils/ValidateToken'
import { getTokenValues } from 'src/utils/tokenUtils'
import { useApiAccess } from 'src/@core/hooks/useApiAccess'
import ExportResetActionButtons from 'src/components/ExportResetActionButtons'
import EsignStatusDropdown from 'src/components/EsignStatusDropdown'
import CustomSearchBar from 'src/components/CustomSearchBar'
import downloadPdf from 'src/utils/DownloadPdf'
import UserModel from 'src/components/Modal/UserModel'
import { convertImageToBase64 } from 'src/utils/UrlToBase64'
import TableUser from 'src/views/tables/TableUser'

const mainUrl = BaseUrl
const Index = () => {
  const router = useRouter()
  const { settings } = useSettings()
  const [userData, setUserData] = useState({ data: [], index: 0 })
  const [allDepartment, setAllDepartment] = useState([])
  const [alertData, setAlertData] = useState({ openSnackbar: false, type: '', message: '', variant: 'filled' })
  const [openModal, setOpenModal] = useState(false)
  const [editData, setEditData] = useState({})
  const [profilePhoto, setProfilePhoto] = useState('/images/avatars/1.png')
  const [file, setFile] = useState('')
  const { setIsLoading } = useLoading()
  const { getUserData, removeAuthToken } = useAuth()
  const [userDataPdf, setUserDataPdf] = useState()
  const [config, setConfig] = useState(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [approveAPI, setApproveAPI] = useState({ approveAPIName: '', approveAPImethod: '', approveAPIEndPoint: '' })
  const [tableHeaderData, setTableHeaderData] = useState({ esignStatus: '', searchVal: '', userStatus: null, departmentFilter: '' })
  const [eSignStatusId, setESignStatusId] = useState('')
  const [auditLogMark, setAuditLogMark] = useState('')
  const [esignDownloadPdf, setEsignDownloadPdf] = useState(false)
  const [openModalApprove, setOpenModalApprove] = useState(false)
  const [pendingAction, setPendingAction] = useState(null)
  const [userFormData, setUserFormData] = useState({})
  const searchBarRef = useRef(null)
  const [authUser, setAuthUser] = useState({})
  const [esignRemark, setEsignRemark] = useState('')
  const apiAccess = useApiAccess('user-create', 'user-update', 'user-approve')

  useLayoutEffect(() => {
    let data = getUserData()
    const decodedToken = getTokenValues()
    setConfig(decodedToken)
    setUserDataPdf(data)
    return () => {}
  }, [])

  useEffect(() => {
    const handleUserAction = async () => {
      if (userFormData && pendingAction) {
        const esign_status = config?.config?.esign_status && config?.role !== 'admin' ? 'pending' : 'approved'
        if (pendingAction === 'edit') {
          await editUser(esign_status)
        } else if (pendingAction === 'add') {
          await addUser(esign_status)
        }
        setPendingAction(null)
      }
    }
    handleUserAction()
  }, [userFormData, pendingAction])

  useEffect(() => {
    getDepartments()
  }, [tableHeaderData])

  const tableBody = userData?.data?.map((item, index) => [
    index + userData.index,
    item?.user_id,
    item?.user_name,
    item?.department?.history[0]?.department_name,
    item?.designation?.history[0]?.designation_name,
    item?.email,
    item?.is_active ? 'enabled' : 'disabled',
    item?.esign_status
  ])

 const statusMap = {
  true: 'enable',
  false: 'disable',
};
  const tableData = useMemo(
    () => ({
      tableHeader: [
        'Sr.No.',
        'User Id',
        'User Name',
        'Department Name',
        'Designation Name',
        'Email',
        'Status',
        'E-Sign'
      ],
      tableHeaderText: 'User Master Report',
      tableBodyText: 'User Data',
      Filter: ['department', tableHeaderData.departmentFilter],
     statusFilter: statusMap[tableHeaderData.userStatus] ?? '',
    filename: 'UserMaster'
    }),
    [tableHeaderData.departmentFilter, tableHeaderData.userStatus]
  )

  const getDepartments = async () => {
    try {
      setIsLoading(true)
      const res = await api(`/department?limit=-1&history_latest=true`, {}, 'get', true)
      if (res.data.success) {
        setAllDepartment(res.data.data.departments)
      } else if (res.data.code === 401) {
        removeAuthToken()
        router.push('/401')
      }
    } catch (error) {
      console.log('Error in get department ', error)
    } finally {
      setIsLoading(false)
    }
  }

  const closeSnackbar = () => {
    setAlertData({ ...alertData, openSnackbar: false })
  }

  const handleOpenModal = () => {
    setApproveAPI({
      approveAPIName: 'user-create',
      approveAPImethod: 'POST',
      approveAPIEndPoint: '/api/v1/user'
    })
    resetForm()
    setOpenModal(true)
  }

  const handleAuthModalClose = () => {
    setAuthModalOpen(false)
    setOpenModalApprove(false)
    setEsignDownloadPdf(false)
  }

  const handleCloseModal = () => {
    resetForm()
    setOpenModal(false)
  }

  const resetForm = () => {
    setEditData({})
    setFile('')
    setProfilePhoto('/images/avatars/1.png')
  }

  const handleSubmitForm = async data => {
    setUserFormData(data)
    const isEdit = !!editData?.id
    isEdit
      ? setApproveAPI({
          approveAPIName: 'user-update',
          approveAPImethod: 'PUT',
          approveAPIEndPoint: '/api/v1/user'
        })
      : setApproveAPI({
          approveAPIName: 'user-create',
          approveAPImethod: 'POST',
          approveAPIEndPoint: '/api/v1/user'
        })

    if (config?.config?.esign_status && config?.role != 'admin') {
      setAuthModalOpen(true)
      return
    }
    setPendingAction(editData?.id ? 'edit' : 'add')
  }

  const addUser = async esign_status => {
    const uploadRes = await uploadUserImage()
    if (!uploadRes?.success) {
      setAlertData({ ...alertData, openSnackbar: true, type: 'error', message: uploadRes?.message })
      return
    }
    try {
      setIsLoading(true)
      const data = {
        ...userFormData,
        profilePhoto: uploadRes?.url != '' ? new URL(uploadRes.url).pathname : '',
        is_active: true,
        role: 'user'
      }
      delete data.isEnabled
      if (config?.config?.audit_logs) {
        data.audit_log = {
          audit_log: true,
          remarks: esignRemark?.length > 0 ? esignRemark : `user added - ${userFormData.userName}`,
          authUser
        }
      }
      data.esign_status = esign_status
      const res = await api('/user/', data, 'post', true)
      setIsLoading(false)
      if (res?.data?.success) {
        setAlertData({ ...alertData, openSnackbar: true, type: 'success', message: 'User added successfully' })
        resetForm()
        setOpenModal(false)
      } else {
        console.log('error to add User ', res.data)
        setAlertData({ ...alertData, openSnackbar: true, type: 'error', message: res.data?.error?.details?.message || res.data.message })
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      setOpenModal(false)
      console.log('Erorr to add User ', error)
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

  const editUser = async esign_status => {
    const previousBase64 = await convertImageToBase64(editData.profile_photo)
    
    let url = ''
    if (profilePhoto !== previousBase64) {
      const uploadRes = await uploadUserImage()
      if (!uploadRes?.success) {
        setAlertData({ ...alertData, openSnackbar: true, type: 'error', message: uploadRes?.message })
        return
      }
      url = uploadRes?.url
    }else {
      url = `${BaseUrl}${editData.profile_photo}`
    }
    try {
      const data = {
        ...userFormData,
        profilePhoto: url ? new URL(url).pathname : '',
        is_active: userFormData.isEnabled
      }
      delete data.isEnabled
      delete data.userId
      delete data.password
      delete data.userName
      if (config?.config?.audit_logs) {
        data.audit_log = {
          audit_log: true,
          remarks: esignRemark > 0 ? esignRemark : `user edited - ${userFormData.userName}`,
          authUser
        }
      }
      data.esign_status = esign_status
      setIsLoading(true)
      const res = await api(`/user/${editData.id}`, data, 'put', true)
      setIsLoading(false)
      if (res.data.success) {
        setAlertData({ ...alertData, openSnackbar: true, type: 'success', message: 'User updated successfully' })
        resetForm()
        setOpenModal(false)
      } else {
        console.log('error to edit User ', res.data)
        setAlertData({ ...alertData, openSnackbar: true, type: 'error', message: res.data?.error?.details?.message || res.data.message })
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('Erorr to edit User ', error)
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
        remarks: remarks?.length > 0 ? remarks : `user ${action} - ${auditLogMark}`,
        authUser: user.user_id
      }
    : {};
};

const handleApproverActions = async (user, esignStatus, remarks) => {
  const payload = {
    modelName: 'user',
    esignStatus,
    id: eSignStatusId,
    name: auditLogMark,
    audit_log: buildAuditLog(user, remarks, esignStatus)
  };

  if (esignStatus === 'approved' && esignDownloadPdf) {
    setOpenModalApprove(false);

    downloadPdf(tableData, tableHeaderData, tableBody, userData?.data, user);

    if (config?.config?.audit_logs) {
      const auditPayload = {
        audit_log: {
          audit_log: true,
         performed_action: 'Export report of userMaster ',
         remarks: remarks?.length > 0 ? remarks : `User master export report `,
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
      approveAPIName: 'user-approve',
      approveAPImethod: 'PATCH',
      approveAPIEndPoint: '/api/v1/user'
    })
    setAuthModalOpen(true)
    setESignStatusId(row.id)
    setAuditLogMark(row.user_id)
  }

  const handleUpdate = item => {
    resetForm()
    setOpenModal(true)
    setEditData(item)
    const { profile_photo } = item
    if (profile_photo.trim() !== '' && profile_photo !== '/images/avatars/1.png') {
      convertImageToBase64(profile_photo, setProfilePhoto)
    } else {
      setProfilePhoto('/images/avatars/1.png')
    }
  }

  const handleSearch = val => {
    setTableHeaderData({ ...tableHeaderData, searchVal: val.trim().toLowerCase() })
    if (val === '') {
      setTableHeaderData({ ...tableHeaderData, departmentFilter: '' });
      setTableHeaderData({ ...tableHeaderData, userStatus: null });
    }
  }

  const resetFilter = () => {
    if (searchBarRef.current) {
      searchBarRef.current.resetSearch()
    }
    setTableHeaderData({ ...tableHeaderData, searchVal: '', esignStatus: '', departmentFilter: '', userStatus: null })
  }

  const onChange = event => {
    setIsLoading(true)
    const reader = new FileReader()
    const { files } = event.target
    if (files && files.length !== 0) {
      reader.onload = () => {
        setProfilePhoto(reader.result)
        setIsLoading(false)
      }
      reader.readAsDataURL(files[0])
      setFile(event.target.files[0])
      event.target.value = ''
    } else {
      setIsLoading(false)
    }
    setIsLoading(false)
  }

  const uploadUserImage = async () => {
    try {
      if (!file) {
        return { success: true, url: '' }
      }
      let url = ''
      const formData = new FormData()
      formData.append('photo', file)
      const res = await api('/upload/userProfile', formData, 'upload', true)
      if (res?.data.success) {
        const decryptUrl = await decrypt(res?.data.data.path);
        url = `${mainUrl}/${decryptUrl}`.replace(/\\/g, '/');
        return { url, success: true }
      } else if (res?.data.code === 401) {
        removeAuthToken()
        router.push('/401')
      } else {
        return { code: res?.data.code, message: res?.data.message, success: false }
      }
    } catch (error) {
      console.log('Error in upload user image ', error)
    }
  }

  const handleAuthModalOpen = () => {
    setApproveAPI({
      approveAPIName: 'user-approve',
      approveAPImethod: 'PATCH',
      approveAPIEndPoint: '/api/v1/user'
    })
    setAuthModalOpen(true)
  }

  const handleDownloadPdf = () => {
    setApproveAPI({
      approveAPIName: 'user-approve',
      approveAPImethod: 'PATCH',
      approveAPIEndPoint: '/api/v1/user'
    })
    if (config?.config?.esign_status && config?.role !== 'admin') {
      setEsignDownloadPdf(true)
      setAuthModalOpen(true)
      return
    }
    downloadPdf(tableData, tableHeaderData, tableBody, userData?.data, userDataPdf)
  }

  return (
    <Box padding={4}>
      <Head>
        <title>User Master</title>
      </Head>
      <Grid2 item xs={12}>
        <Typography variant='h2'>User Master</Typography>
      </Grid2>
      <Grid2 item xs={12}>
        <Grid2 item xs={12}>
          <Box sx={{ backgroundColor: settings.mode === 'dark' ? '#212121' : 'white', borderRadius: 1 }}>
            <Typography variant='h4' className='mx-4 my-2 mx-2' sx={{ paddingTop: '1%' }}>
              Filter
            </Typography>
            <Grid2 item xs={12}>
              <Box className='d-flex-row justify-content-start align-items-center mx-4 my-3 '>
                {config?.config?.esign_status && config?.role !== 'admin' && (
                  <EsignStatusDropdown tableHeaderData={tableHeaderData} setTableHeaderData={setTableHeaderData} />
                )}
                <FormControl className='w-25 mx-2'>
                  <InputLabel id='department-label'>Department</InputLabel>
                  <Select
                    labelId='department-label'
                    id='department-select'
                    value={tableHeaderData.departmentFilter}
                    label='Department'
                    onChange={e => setTableHeaderData({ ...tableHeaderData, departmentFilter: e.target.value })}
                  >
                    {allDepartment.map(d => (
                      <MenuItem value={d.department_name} key={d.id}>
                        {d.department_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl className='w-25 ml-2'>
                  <InputLabel id='status-label'>Status</InputLabel>
                  <Select
                    labelId='status-label'
                    id='status-select'
                    value={tableHeaderData.userStatus}
                    label='Status'
                    onChange={e => setTableHeaderData({ ...tableHeaderData, userStatus: e.target.value })}
                  >
                    <MenuItem value={null}>None</MenuItem>
                    <MenuItem value={true}>enabled</MenuItem>
                    <MenuItem value={false}>disabled</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box className='d-flex justify-content-between align-items-center mx-4 my-2'>
                <ExportResetActionButtons handleDownloadPdf={handleDownloadPdf} resetFilter={resetFilter} />
                <Box className='d-flex justify-content-between align-items-center '>
                  <CustomSearchBar ref={searchBarRef} handleSearchClick={handleSearch} />

                  {apiAccess.addApiAccess && (
                    <Button variant='contained' sx={{mx:2}} onClick={handleOpenModal}>
                      <span>
                        <IoMdAdd />
                      </span>
                      <span>Add</span>
                    </Button>
                  )}
                </Box>
              </Box>
            </Grid2>
            <Grid2 item xs={12}>
              <Typography variant='h4' className='mx-4 my-2 mt-3'>
                User Data
              </Typography>
                <TableUser
                  pendingAction={pendingAction}
                  handleUpdate={handleUpdate}
                  setDataCallback={setUserData}
                  handleAuthCheck={handleAuthCheck}
                  apiAccess={apiAccess}
                  config={config}
                  tableHeaderData={tableHeaderData}
                />
            </Grid2>
          </Box>
        </Grid2>
      </Grid2>
      <SnackbarAlert openSnackbar={alertData.openSnackbar} closeSnackbar={closeSnackbar} alertData={alertData} />
      <UserModel
        open={openModal}
        onClose={handleCloseModal}
        editData={editData}
        handleSubmitForm={handleSubmitForm}
        allDepartment={allDepartment}
        profilePhoto={profilePhoto}
        setProfilePhoto={setProfilePhoto}
        onChange={onChange}
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
  return validateToken(context, 'User Master')
}
export default ProtectedRoute(Index)
