'use-client'
import React, { useState, useEffect, useMemo, useLayoutEffect, useRef } from 'react'
import Select from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import TableCollapsibleuser from 'src/views/tables/TableCollapsibleuser.js'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import { Button, Box, MenuItem, TableContainer, Paper, Grid2 } from '@mui/material'
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
import { validateToken } from 'src/utils/ValidateToken';
import { getTokenValues } from 'src/utils/tokenUtils'
import { useApiAccess } from 'src/@core/hooks/useApiAccess';
import ExportResetActionButtons from 'src/components/ExportResetActionButtons'
import EsignStatusDropdown from 'src/components/EsignStatusDropdown'
import CustomSearchBar from 'src/components/CustomSearchBar'
import downloadPdf from 'src/utils/DownloadPdf'
import UserModel from 'src/components/Modal/UserModel'

const mainUrl = BaseUrl
const Index = () => {
  const router = useRouter()
  const { settings } = useSettings()
  const [userData, setUser] = useState([])
  const [allDepartment, setAllDepartment] = useState([])
  const [alertData, setAlertData] = useState({ openSnackbar: false, type: '', message: '', variant: 'filled' })
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState(null)
  const [openModal, setOpenModal] = useState(false)
  const [editData, setEditData] = useState({})
  const [profilePhoto, setProfilePhoto] = useState('/images/avatars/1.png')
  const [file, setFile] = useState('')
  const { setIsLoading } = useLoading()
  const { getUserData, removeAuthToken } = useAuth()
  const [userDataPdf, setUserDataPdf] = useState()
  const [config, setConfig] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [approveAPI, setApproveAPI] = useState({ approveAPIName: '', approveAPImethod: '', approveAPIEndPoint: '' })
  const [tableHeaderData, setTableHeaderData] = useState({ esignStatus: '',searchVal: ''});
  const [eSignStatusId, setESignStatusId] = useState('');
  const [auditLogMark, setAuditLogMark] = useState('');
  const [esignDownloadPdf, setEsignDownloadPdf] = useState(false);
  const [openModalApprove, setOpenModalApprove] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [userFormData, setUserFormData] = useState({})
  const searchBarRef = useRef(null);

  const apiAccess = useApiAccess("user-create","user-update","user-approve");

  useLayoutEffect(() => {
    let data = getUserData();
    const decodedToken = getTokenValues();
    setConfig(decodedToken);
    setUserDataPdf(data);
    return () => { }
  }, [])

  useEffect(() => {
    const handleUserAction = async () => {
      if (userFormData && pendingAction) {
        const esign_status = config?.config?.esign_status && config?.role !== 'admin' ? "pending" : "approved";
        if (pendingAction === "edit") {
          await editUser(esign_status);  
        } else if (pendingAction === "add") {
          await addUser(esign_status);  
        }
        setPendingAction(null);
      }
    }
    handleUserAction();
  }, [userFormData, pendingAction]);

  useEffect(() => {
    getDepartments()
  }, [departmentFilter, tableHeaderData, statusFilter])

  
  const tableBody = userData.map((item, index) =>
    [index + 1, item.user_id,
    item.user_name,
    item.department?.department_name,
    item.designation?.designation_name,
    item.email,
    item.is_active ? 'enabled' : 'disabled',
    item.esign_status]);

  const tableData = useMemo(() => ({
    tableHeader: ['Sr.No.', 'User Id', 'User Name', 'Department Name', 'Designation Name', 'Email', 'Status', 'E-Sign'],
    tableHeaderText: 'User Master Report',
    tableBodyText: 'User Data',
    Filter: ['department', departmentFilter],
    statusFilter:statusFilter==null?'':statusFilter==true?"enable":"disable",
    filename: "UserMaster"
  }), [departmentFilter,statusFilter]);

  console.log('tableData is index',tableData)

  const getDepartments = async () => {
    try {
      setIsLoading(true);
      const res = await api(`/department?limit=-1`, {}, 'get', true);
      console.log('All department ', res.data);
      if (res.data.success) {
        setAllDepartment(res.data.data.departments);
      } else if (res.data.code === 401) {
        removeAuthToken();
        router.push('/401');
      }
    } catch (error) {
      console.log('Error in get department ', error);
    } finally {
      setIsLoading(false);
    }
  };

  const closeSnackbar = () => {
    setAlertData({ ...alertData, openSnackbar: false })
  }

  const handleOpenModal = () => {
    setApproveAPI({
      approveAPIName: "user-create",
      approveAPImethod: "POST",
      approveAPIEndPoint: "/api/v1/user"
    })
    resetForm();
    setOpenModal(true);
  }

  const handleAuthModalClose = () => {
    setAuthModalOpen(false);
    setOpenModalApprove(false);
  };

  const handleCloseModal = () => {
    resetForm()
    setOpenModal(false)
  }

  const resetForm = () => {
    setEditData({})
    setProfilePhoto('/images/avatars/1.png')
  }

  const handleSubmitForm = async (data) => {
    setUserFormData(data)
    const isEdit = !!editData?.id;
    isEdit ? setApproveAPI({
      approveAPIName: "user-update",
      approveAPImethod: "PUT",
      approveAPIEndPoint: "/api/v1/user"
    }) : setApproveAPI({
      approveAPIName: "user-create",
      approveAPImethod: "POST",
      approveAPIEndPoint: "/api/v1/user"
    })

    if (config?.config?.esign_status && config?.role!='admin') {
      setAuthModalOpen(true);
      return;
    }
    setPendingAction(editData?.id ? "edit" : "add");
  };

  const addUser = async (esign_status, remarks) => {
    const uploadRes = await uploadUserImage();
    if (!uploadRes?.success) {
      setAlertData({ ...alertData, openSnackbar: true, type: 'error', message: uploadRes?.message });
      return;
    }
    console.log('user profile url', uploadRes?.url)
    try {
      setIsLoading(true)
      const data = {
        ...userFormData,
        profilePhoto: uploadRes?.url || "",
        is_active: userFormData.isEnabled,
        role: 'user'
      }
      delete data.isEnabled;
      const auditlogRemark = remarks;
      const audit_log = config?.config?.audit_logs ? {
        "audit_log": true,
        "performed_action": "add",
        "remarks": auditlogRemark?.length > 0 ? auditlogRemark : `user added - ${userFormData.userName}`,
      } : {
        "audit_log": false,
        "performed_action": "none",
        "remarks": `none`,
      };
      data.audit_log = audit_log;
      data.esign_status = esign_status;
      console.log('Add User data ', data)
      const res = await api('/user/', data, 'post', true)
      console.log('Add user res ', res?.data)
      setIsLoading(false)
      if (res?.data?.success) {
        setAlertData({ ...alertData, openSnackbar: true, type: 'success', message: 'User added successfully' });
        resetForm();
        setOpenModal(false);

      } else {
        console.log('error to add User ', res.data)
        setAlertData({ ...alertData, openSnackbar: true, type: 'error', message: res.data?.message });
        if (res.data.code === 401) {
          removeAuthToken();
          router.push('/401');
        }
      }
    } catch (error) {
      setOpenModal(false);
      console.log('Erorr to add User ', error);
      router.push('/500');
    } finally {
      setIsLoading(false);
      setApproveAPI({
        approveAPIName: "",
        approveAPImethod: "",
        approveAPIEndPoint: ""
      })
    }
  }

  const editUser = async (esign_status, remarks) => {
    console.log("formData",userFormData)
    let url = ''
    console.log(profilePhoto !== editData.profile_photo, editData.profile_photo !== "")
    if (profilePhoto !== editData.profile_photo || editData.profile_photo === "") {
      const uploadRes = await uploadUserImage();
      if (!uploadRes?.success) {
        setAlertData({ ...alertData, openSnackbar: true, type: 'error', message: uploadRes?.message });
        return;
      }
      url = uploadRes?.url;
    }
    try {
      const data = {
        ...userFormData,
        profilePhoto: url || editData?.profile_photo,
        is_active: userFormData.isEnabled
      }
      delete data.isEnabled
      delete data.userId
      delete data.password
      delete data.userName
      const auditlogRemark = remarks;
      let audit_log;
      if (config?.config?.audit_logs) {
        audit_log = {
          "audit_log": true,
          "performed_action": "edit",
          "remarks": auditlogRemark > 0 ? auditlogRemark : `user edited - ${userFormData.userName}`,
        };
      } else {
        audit_log = {
          "audit_log": false,
          "performed_action": "none",
          "remarks": `none`,
        };
      }
      data.audit_log = audit_log;
      data.esign_status = esign_status;
      console.log('data', data)
      setIsLoading(true)
      const res = await api(`/user/${editData.id}`, data, 'put', true)
      console.log('res ', res.data)
      setIsLoading(false)
      if (res.data.success) {
        console.log('res ', res.data)
        setAlertData({ ...alertData, openSnackbar: true, type: 'success', message: 'User updated successfully' })
        resetForm()
        setOpenModal(false)


      } else {
        console.log('error to edit User ', res.data)
        setAlertData({ ...alertData, openSnackbar: true, type: 'error', message: res.data.message })
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401');
        }
      }
    } catch (error) {
      console.log('Erorr to edit User ', error)
      router.push('/500');
      setOpenModal(false)

    } finally {
      setIsLoading(false)
      setApproveAPI({
        approveAPIName: "",
        approveAPImethod: "",
        approveAPIEndPoint: ""
      })
    }

  }

  const handleAuthResult = async (isAuthenticated, user, isApprover, esignStatus, remarks) => {
    console.log("handleAuthResult 01", isAuthenticated, isApprover, esignStatus, user);
    console.log("handleAuthResult 02", config.userId, user.user_id);
    const handleAuthenticationError = () => {
      setAlertData({ openSnackbar: true, type: 'error', message: 'Authentication failed, Please try again.' });
    };
    const handleApproverActions = async (user, esignStatus, remarks) => {
      const data = prepareApproverData(user, esignStatus, remarks);
      if (esignStatus === "approved" && esignDownloadPdf) {
        handleApproveDownload();
        return;
      }
      try {
        await updateEsignStatus(data);
      } catch (error) {
        handleEsignUpdateError();
        return;
      }
      if (esignStatus === "rejected" && esignDownloadPdf) {
        handleRejectDownload();
      }
    };
    const prepareApproverData = (user, esignStatus, remarks) => {
      const data = {
        modelName: "user",
        esignStatus,
        id: eSignStatusId,
        audit_log: config?.config?.audit_logs ? {
          user_id: user.user_id,
          user_name: user.userName,
          performed_action: 'approved',
          remarks: remarks.length > 0 ? remarks : `user approved - ${auditLogMark}`,
        } : {},
      };
      return data;
    };
    const handleApproveDownload = () => {
      console.log("esign is approved for approver");
      setOpenModalApprove(false);
      downloadPdf(tableData, tableHeaderData, tableBody, userData, userDataPdf);
      resetApprovalState();
    };
    const handleRejectDownload = () => {
      console.log("approver rejected");
      setOpenModalApprove(false);
      resetApprovalState();
    };
    const updateEsignStatus = async (data) => {
      const res = await api('/esign-status/update-esign-status', data, 'patch', true);
      console.log("esign status update", res?.data);
      setPendingAction(true)
    };
    const handleEsignUpdateError = () => {
      console.error("Error updating esign status:");
      setAlertData({ openSnackbar: true, type: 'error', message: 'Failed to update e-sign status.' });
      resetApprovalState();
    };
    const handleCreatorActions = (esignStatus) => {
      if (esignStatus === "rejected") {
        setAuthModalOpen(false);
        setOpenModalApprove(false);
      } else if (esignStatus === "approved" && esignDownloadPdf) {
        console.log("esign is approved for creator to download");
        setOpenModalApprove(true);
      } else if (esignStatus === "approved") {
        console.log("esign is approved for creator");
        setPendingAction(editData?.id ? "edit" : "add");
      }
    };
    const resetApprovalState = () => {
      setApproveAPI({
        approveAPIName: "",
        approveAPImethod: "",
        approveAPIEndPoint: ""
      })
      setEsignDownloadPdf(false)
      setAuthModalOpen(false);
    };
    if (!isAuthenticated) {
      handleAuthenticationError();
      return;
    }
    if (!isApprover && esignDownloadPdf) {
      setAlertData({
        ...alertData,
        openSnackbar: true,
        type: 'error',
        message: "Access denied: Download pdf disabled for this user."
      })
      resetApprovalState()
      return
    }
    if (isApprover) {
      await handleApproverActions(user, esignStatus, remarks);
    } else {
      handleCreatorActions(esignStatus, remarks);
    }
    resetApprovalState();
  };

  const handleAuthCheck = async (row) => {
    console.log("handleAuthCheck", row)
    setApproveAPI({
      approveAPIName: "user-approve",
      approveAPImethod: "PATCH",
      approveAPIEndPoint: "/api/v1/user"
    })
    setAuthModalOpen(true);
    setESignStatusId(row.id);
    setAuditLogMark(row.user_id)
    console.log("row", row)
  }

  const handleUpdate = (item) => {
    console.log('edit user', item);
    resetForm();
    setOpenModal(true);
    setEditData(item);
    const {
      profile_photo,
    } = item;

    if (profile_photo && profile_photo !== '/images/avatars/1.png') {
      convertImageToBase64(profile_photo);
    } else {
      setProfilePhoto('/images/avatars/1.png');
    }
  };

  const handleSearch = (val) => {
    setTableHeaderData({ ...tableHeaderData, searchVal: val.trim().toLowerCase() });
    if (val === '') {
      setDepartmentFilter('')
      setStatusFilter(null)
    }
  }

  const resetFilter = () => {
    if (searchBarRef.current) {
      searchBarRef.current.resetSearch();
    }
    setTableHeaderData({ ...tableHeaderData, searchVal: "" ,esignStatus:''})
    setDepartmentFilter('')
    setStatusFilter(null)
  }

  const convertImageToBase64 = async imageUrl => {
    console.log('converting to base64')
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePhoto(reader.result)
      }
      reader.onerror = error => {
        console.error('Error reading the image blob:', error)
      }
      reader.readAsDataURL(blob)
    } catch (error) {
      console.error('Error fetching the image:', error)
    }
  }

  const onChange = event => {
    setIsLoading(true);
    const reader = new FileReader();
    const { files } = event.target;
    if (files && files.length !== 0) {
      reader.onload = () => {
        setProfilePhoto(reader.result);
        setIsLoading(false);

      }
      reader.readAsDataURL(files[0]);
      setFile(event.target.files[0]);
      event.target.value = "";
    }
    else {
      setIsLoading(false);
    }
    console.log("profilePhoto", profilePhoto)
    setIsLoading(false);
  }

  const uploadUserImage = async () => {
    try {
      if (!file) {
        return { success: true, url: '' };
      }
      let url = '';
      const formData = new FormData()
      formData.append('photo', file)
      const res = await api('/upload/userProfile', formData, 'upload', true);
      console.log("Response of upload user profile ", res?.data);
      if (res?.data.success) {
        console.log('Encryp data path ', res?.data.data.path)
        const decryptUrl = await decrypt(res?.data.data.path)
        url = `${mainUrl}/${decryptUrl}`;
        return { url, success: true };
      } else if (res?.data.code === 401) {
        removeAuthToken()
        router.push('/401');
      } else {
        return { code: res?.data.code, message: res?.data.message, success: false }
      }
    } catch (error) {
      console.log('Error in upload user image ', error);
    }
  }

  const handleAuthModalOpen = () => {
    console.log("OPen auth model");
    setApproveAPI({
      approveAPIName: "user-approve",
      approveAPImethod: "PATCH",
      approveAPIEndPoint: "/api/v1/user"
    })
    setAuthModalOpen(true);
  };

  const handleDownloadPdf = () => {

    setApproveAPI({
      approveAPIName: "user-create",
      approveAPImethod: "POST",
      approveAPIEndPoint: "/api/v1/user"
    })
    if (config?.config?.esign_status && config?.role!=='admin') {
      console.log("Esign enabled for download pdf");
      setEsignDownloadPdf(true);
      setAuthModalOpen(true);
      return;
    }
    downloadPdf(tableData, tableHeaderData, tableBody, userData, userDataPdf);
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
                {(config?.config?.esign_status && config?.role!=='admin') &&
                  <EsignStatusDropdown tableHeaderData={tableHeaderData} setTableHeaderData={setTableHeaderData} />
                }
                <FormControl className='w-25 mx-2'>
                  <InputLabel id='department-label'>Department</InputLabel>
                  <Select
                    labelId='department-label'
                    id='department-select'
                    value={departmentFilter}
                    label='Department'
                    onChange={e => setDepartmentFilter(e.target.value)}
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
                    value={statusFilter}
                    label='Status'
                    onChange={e => setStatusFilter(e.target.value)}
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

                  {
                    apiAccess.addApiAccess && (
                      <Button variant='contained' className='mx-2' onClick={handleOpenModal} role='button'>
                        <span>
                          <IoMdAdd />
                        </span>
                        <span>Add</span>
                      </Button>
                    )
                  }
                </Box>
              </Box>
            </Grid2>
            <Grid2 item xs={12}>
              <Typography variant='h4' className='mx-4 my-2 mt-3'>
                User Data
              </Typography>
              <TableContainer component={Paper}>
                <TableCollapsibleuser
                  pendingAction={pendingAction}
                  handleUpdate={handleUpdate}
                  setUser={setUser}
                  handleAuthCheck={handleAuthCheck}
                  apiAccess={apiAccess}
                  config={config}
                  tableHeaderData={tableHeaderData}
                  departmentFilter={departmentFilter}
                  statusFilter={statusFilter} />
              </TableContainer>
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
  return validateToken(context, "User Master")
}
export default ProtectedRoute(Index)