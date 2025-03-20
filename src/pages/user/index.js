'use-client'
import React, { useState, useEffect, useMemo, useLayoutEffect } from 'react'
import Select from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import TableCollapsibleuser from 'src/views/tables/TableCollapsibleuser.js'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import { Button,  Box, MenuItem, TableContainer, Paper, Grid2 } from '@mui/material'
import { IoMdAdd } from 'react-icons/io'
import ProtectedRoute from 'src/components/ProtectedRoute'
import { api } from 'src/utils/Rest-API'
import SnackbarAlert from 'src/components/SnackbarAlert'
import { useLoading } from 'src/@core/hooks/useLoading'
import Head from 'next/head'
import { useAuth } from 'src/Context/AuthContext'
import { BaseUrl } from '../../../constants'
import { useSettings } from 'src/@core/hooks/useSettings'
import { decrypt } from 'src/utils/Encrypt-Decrypt'
import { useRouter } from 'next/router'
import AuthModal from 'src/components/authModal'
import ChatbotComponent from 'src/components/ChatbotComponent'
import AccessibilitySettings from 'src/components/AccessibilitySettings'
import { validateToken } from 'src/utils/ValidateToken';
import { getTokenValues} from '../../utils/tokenUtils';
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
  const [userData, setUserData] = useState([])
  const [allDepartment, setAllDepartment] = useState([])
  const [allDesignation, setAllDesignation] = useState([])
  const [allLocation, setAllLocation] = useState([])
  const [alertData, setAlertData] = useState({openSnackbar:false, type: '', message: '', variant: 'filled' })
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [openModal, setOpenModal] = useState(false)
  const [editData, setEditData] = useState({})
  const [sortDirection, setSortDirection] = useState('asc')
  const [profilePhoto, setProfilePhoto] = useState('/images/avatars/1.png')
  const [file, setFile] = useState('')
  const { setIsLoading } = useLoading()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(settings.rowsPerPage)
  const [totalRecords, setTotalRecords] = useState(0)
  const [sortBy, setSortBy] = useState('')
  const { getUserData, removeAuthToken } = useAuth()
  const [userDataPdf, setUserDataPdf] = useState()
  const [config, setConfig] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [approveAPI,setApproveAPI]=useState({ approveAPIName:'',approveAPImethod:'',approveAPIEndPoint:''})
  const [tableHeaderData, setTableHeaderData] = useState({
    esignStatus: '',
    searchVal: ''
  });
  const [eSignStatusId, setESignStatusId] = useState('');
  const [auditLogMark, setAuditLogMark] = useState('');
  const [esignDownloadPdf, setEsignDownloadPdf] = useState(false);
  const [openModalApprove, setOpenModalApprove] = useState(false);
 const [pendingAction, setPendingAction] = useState(null);
  const [formData,setFormData]=useState({})
  const apiAccess = useApiAccess(
    "user-create",
    "user-update",
    "user-approve");

  useLayoutEffect(() => {
      let data = getUserData();
      const decodedToken = getTokenValues();
      setConfig(decodedToken);
      setUserDataPdf(data);
      return () => { }
    }, [])

     useEffect(() => {
            if (formData && pendingAction) {
                const esign_status = "approved";
                if (pendingAction === "edit") {
                  editUser() 
                } else {
                  addUser(esign_status);
                }
                setPendingAction(null);
            }
        }, [formData, pendingAction]);

  useEffect(() => {
    getDepartments()
    getUser()
    getDesignation()
    getLocation()
  }, [departmentFilter, tableHeaderData, page, rowsPerPage, statusFilter])
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
     Filter:['department',departmentFilter],
     filename:"UserMaster"
   }), [departmentFilter]);
  useEffect(() => {
    if (departmentId) {
      getDesignation()
    }
  }, [departmentId])


  const getUser = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage === -1 ? -1 : rowsPerPage,
        search: tableHeaderData.searchVal,
        esign_status: tableHeaderData.esignStatus,
        status: statusFilter,
        department_name: departmentFilter
      });
      console.log('params', params.toString());
      const res = await api(`/user/?${params.toString()}`, {}, 'get', true);
      console.log('All User ', res.data);
      if (res.data.success) {
        setUserData(res.data.data.users);
        setTotalRecords(res.data.data.total);
        if (rowsPerPage === -1) {
          setRowsPerPage(res.data.data.total);
        }
      } else if (res.data.code === 401) {
        removeAuthToken();
        router.push('/401');
      }
    } catch (error) {
      console.log('Error in getting User ', error);
    } finally {
      setIsLoading(false);
    }
  };
  const getDesignation = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: 1,
        limit: -1
      })
      const res = await api(`/designation/${departmentId}/?${params.toString()}`, {}, 'get', true)
      console.log('designation by department ', res.data, formData.departmentId)
      setIsLoading(false)
      console.log('All Designation ', res.data)
      if (res.data.success) {
        setAllDesignation(res.data.data.designations)
      } else {
        console.log('Error to get all designation ', res.data)
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401');
        }
      }
    } catch (error) {
      console.log('Error in get designation ', error)
      setIsLoading(false)
    }
  }
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
  const getLocation = async () => {
    try {
      setIsLoading(true)
      const res = await api(`/location?limit=-1}`, {}, 'get', true)
      setIsLoading(false)
      console.log('All location ', res.data)
      if (res.data.success) {
        setAllLocation(res.data.data.locations)
      } else {
        console.log('Error to get all location', res.data)
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401');
        }
      }
    } catch (error) {
      console.log('Error in get location ', error)
      setIsLoading(false)
    }
  }

  const closeSnackbar = () => {
    setAlertData({...alertData,openSnackbar:false})
  }

  const handleOpenModal = () => {
    setApproveAPI({
      approveAPIName:"user-create",
      approveAPImethod:"POST",
      approveAPIEndPoint:"/api/v1/user"
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
    console.log("data",data)
    setFormData(data)
    const isEdit = !!editData?.id;
    isEdit? setApproveAPI({
      approveAPIName:"user-update",
      approveAPImethod:"PUT",
      approveAPIEndPoint:"/api/v1/user"
    }): setApproveAPI({
      approveAPIName:"user-create",
      approveAPImethod:"POST",
      approveAPIEndPoint:"/api/v1/user"
    })
    
    if (config?.config?.esign_status) {
      setAuthModalOpen(true);
      return;
    }
    setPendingAction(editData?.id ? "edit" : "add");
  };
  const addUser = async (esign_status, remarks) => {
    const uploadRes = await uploadUserImage();
    if (!uploadRes?.success) {
      setAlertData({ ...alertData,openSnackbar:true, type: 'error', message: uploadRes?.message });
      return;
    }
    console.log('user profile url', uploadRes?.url)
    try {
      console.log(formData)
      setIsLoading(true)
      const data = {
       ...formData,
        profilePhoto: uploadRes?.url || "",
        is_active: formData.isEnabled,
        role: 'user'
      }
      delete data.isEnabled;
      console.log(data)
      const auditlogRemark = remarks;
      const audit_log = config?.config?.audit_logs ? {
        "audit_log": true,
        "performed_action": "add",
        "remarks": auditlogRemark?.length > 0 ? auditlogRemark : `user added - ${formData.userName}`,
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
        setAlertData({ ...alertData,openSnackbar:true, type: 'success', message: 'User added successfully' });
        getUser();
        resetForm();
      } else {
        console.log('error to add User ', res.data)
        setAlertData({ ...alertData,openSnackbar:true, type: 'error', message: res.data?.message });
        if (res.data.code === 401) {
          removeAuthToken();
          router.push('/401');
        }
      }
    } catch (error) {
      console.log('Erorr to add User ', error);
      router.push('/500');
    } finally {
      setOpenModal(false);
      setIsLoading(false);
      setApproveAPI({
        approveAPIName:"",
        approveAPImethod:"",
        approveAPIEndPoint:""
      })
    }
  }
  const editUser = async (esign_status, remarks) => {
    let url = ''
    console.log(profilePhoto !== editData.profile_photo, editData.profile_photo !== "")
    if (profilePhoto !== editData.profile_photo || editData.profile_photo === "") {
      const uploadRes = await uploadUserImage();
      if (!uploadRes?.success) {
        setAlertData({ ...alertData,openSnackbar:true, type: 'error', message: uploadRes?.message });
        return;
      }
      url = uploadRes?.url;
    }
    try {
      const data = {
        ...formData,
        profilePhoto: url || editData?.profile_photo,
        is_active: formData.isEnabled
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
          "remarks": auditlogRemark > 0 ? auditlogRemark : `user edited - ${formData.userName}`,
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
        setAlertData({ ...alertData,openSnackbar:true, type: 'success', message: 'User updated successfully' })
        resetForm()
        getUser()
      } else {
        console.log('error to edit User ', res.data)
        setAlertData({ ...alertData,openSnackbar:true, type: 'error', message: res.data.message })
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401');
        }
      }
    } catch (error) {
      console.log('Erorr to edit User ', error)
      router.push('/500');
    } finally {
      setOpenModal(false)
      setIsLoading(false)
      setApproveAPI({
        approveAPIName:"",
        approveAPImethod:"",
        approveAPIEndPoint:""
      })
    }

  }
  const handleAuthResult = async (isAuthenticated, user, isApprover, esignStatus, remarks) => {
    console.log("handleAuthResult 01", isAuthenticated, isApprover, esignStatus, user);
    console.log("handleAuthResult 02", config.userId, user.user_id);
    const handleAuthenticationError = () => {
      setAlertData({ openSnackbar:true,type: 'error', message: 'Authentication failed, Please try again.' });
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
      downloadPdf(tableData,tableHeaderData,tableBody,userData,userDataPdf);
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
    };
    const handleEsignUpdateError = () => {
      console.error("Error updating esign status:");
      setAlertData({openSnackbar:true, type: 'error', message: 'Failed to update e-sign status.' });
      resetApprovalState();
    };
    const handleCreatorActions = (esignStatus, remarks) => {
      if (esignStatus === "rejected") {
        setAuthModalOpen(false);
        setOpenModalApprove(false);
      } else if (esignStatus === "approved" && esignDownloadPdf) {
        console.log("esign is approved for creator to download");
        setOpenModalApprove(true);
      } else if (esignStatus === "approved") {
        console.log("esign is approved for creator");
        const esign_status = "pending";
        editData?.id ? editUser(esign_status, remarks) : addUser(esign_status, remarks);
      }
    };
    const resetApprovalState = () => {
      setApproveAPI({
        approveAPIName:"",
        approveAPImethod:"",
        approveAPIEndPoint:""
      })
      setAuthModalOpen(false);
    };
    if (!isAuthenticated) {
      handleAuthenticationError();
      return;
    }
    if (isApprover) {
      await handleApproverActions(user, esignStatus, remarks);
    } else {
      handleCreatorActions(esignStatus, remarks);
    }
    resetApprovalState();
    getUser();
  };
  const handleAuthCheck = async (row) => {
    console.log("handleAuthCheck", row)
    setApproveAPI({
      approveAPIName:"user-approve",
      approveAPImethod:"PATCH",
      approveAPIEndPoint:"/api/v1/user"
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
    setTableHeaderData({ ...tableHeaderData,searchVal:val.toLowerCase()});
    if(val===''){
      setDepartmentFilter('')
      setStatusFilter('')
    }
  }
  
  const handleSortByUserName = () => {
    const newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    const sorted = [...userData].sort((a, b) => {
      if (a.user_name > b.user_name) {
        return newSortDirection === 'asc' ? 1 : -1;
      }
      if (a.user_name < b.user_name) {
        return newSortDirection === 'asc' ? -1 : 1;
      }
      return 0;
    });
    setUserData(sorted);
    setSortDirection(newSortDirection);
  };
  const handleSortByDepName = () => {
    const newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    const sorted = [...userData].sort((a, b) => {
      return newSortDirection === 'asc'
        ? a.department_name.localeCompare(b.department_name)
        : b.department_name.localeCompare(a.department_name);
    });
    setUserData(sorted);
    setSortDirection(newSortDirection);
  };
  const handleSortByDesName = () => {
    const newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    const sorted = userData.toSorted((a, b) => {
      return (a.designation_name > b.designation_name ? 1 : -1) * (newSortDirection === 'asc' ? 1 : -1);
    });
    setUserData(sorted);
    setSortDirection(newSortDirection);
  };
  const handleSortByEmail = () => {
    const newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    const sorted = userData.toSorted((a, b) => {
      return (a.email > b.email ? 1 : -1) * (newSortDirection === 'asc' ? 1 : -1);
    });
    setUserData(sorted);
    setSortDirection(newSortDirection);
  };
  const handleSortByUserID = () => {
    const newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    const sorted = userData.toSorted((a, b) => {
      return (a.user_user_id > b.user_user_id ? 1 : -1) * (newSortDirection === 'asc' ? 1 : -1);
    });
    setUserData(sorted);
    setSortDirection(newSortDirection);
  };
  const resetFilter = () => {
    setTableHeaderData({...tableHeaderData,searchVal:""})
    setDepartmentFilter('')
    setStatusFilter('')
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
      }
      reader.readAsDataURL(files[0]);
      setFile(event.target.files[0]);
    }
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
  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }
  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value))
  }
  const handleSort = property => {
    const isAsc = sortBy === property && sortDirection === 'asc'
    setSortDirection(isAsc ? 'desc' : 'asc')
    setSortBy(property)
  }
 
  const handleAuthModalOpen = () => {
    console.log("OPen auth model");
    setApproveAPI({
      approveAPIName:"user-approve",
      approveAPImethod:"PATCH",
      approveAPIEndPoint:"/api/v1/user"
    })
    setAuthModalOpen(true);
  };
  const handleDownloadPdf = () => {
  
    setApproveAPI({
      approveAPIName:"user-create",
      approveAPImethod:"POST",
      approveAPIEndPoint:"/api/v1/user"
    })
    if (config?.config?.esign_status) {
      console.log("Esign enabled for download pdf");
      setEsignDownloadPdf(true);
      setAuthModalOpen(true);
      return;
    }
    downloadPdf(tableData,tableHeaderData,tableBody,userData,userDataPdf);
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
          <EsignStatusDropdown tableHeaderData={tableHeaderData} setTableHeaderData={setTableHeaderData} />
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
                    <MenuItem value={''}>None</MenuItem>
                    <MenuItem value={true}>enabled</MenuItem>
                    <MenuItem value={false}>disabled</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box className='d-flex justify-content-between align-items-center mx-4 my-2'>
                <ExportResetActionButtons handleDownloadPdf={handleDownloadPdf} resetFilter={resetFilter} />
                <Box className='d-flex justify-content-between align-items-center '>
                  {/* <SearchBar
                    searchValue={tempSearchVal}
                    handleSearchChange={handleTempSearchValue}
                    handleSearchClick={handleSearch}
                  /> */}
                <CustomSearchBar handleSearchClick={handleSearch} />
                  
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
                  page={page}
                  rowsPerPage={rowsPerPage}
                  userData={userData}
                  handleSortByUserID={handleSortByUserID}
                  handleSortByUserName={handleSortByUserName}
                  handleSortByDepName={handleSortByDepName}
                  handleSortByDesName={handleSortByDesName}
                  handleSortByEmail={handleSortByEmail}
                  totalRecords={totalRecords}
                  sortDirection={sortDirection}
                  handleUpdate={handleUpdate}
                  handleChangePage={handleChangePage}
                  handleChangeRowsPerPage={handleChangeRowsPerPage}
                  handleSort={handleSort}
                  editable={apiAccess.editApiAccess}
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
      <UserModel open={openModal} onClose={handleCloseModal}editData={editData}
      handleSubmitForm={handleSubmitForm} allDepartment={allDepartment}
      allDesignation={allDesignation} allLocation={allLocation}
       profilePhoto={profilePhoto}setProfilePhoto={setProfilePhoto} onChange={onChange}
       setDepartmentId={setDepartmentId}/>
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