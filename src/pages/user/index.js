'use-client'
import React, { useState, useEffect } from 'react'
import Select from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import TableCollapsibleuser from 'src/views/tables/TableCollapsibleuser.js'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import { Button, FormHelperText, Modal, TextField, Box, MenuItem, Switch, TableContainer, Paper, Grid2 } from '@mui/material'
import { IoMdAdd } from 'react-icons/io'
import ProtectedRoute from 'src/components/ProtectedRoute'
import { api } from 'src/utils/Rest-API'
import SnackbarAlert from 'src/components/SnackbarAlert'
import styled from '@emotion/styled'
import { useLoading } from 'src/@core/hooks/useLoading'
import Head from 'next/head'
import { useAuth } from 'src/Context/AuthContext'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { BaseUrl } from '../../../constants'
import { useSettings } from 'src/@core/hooks/useSettings'
import { decrypt } from 'src/utils/Encrypt-Decrypt'
import { useRouter } from 'next/router'
import AuthModal from 'src/components/authModal'
import ChatbotComponent from 'src/components/ChatbotComponent'
import AccessibilitySettings from 'src/components/AccessibilitySettings'
import { validateToken } from 'src/utils/ValidateToken';
import { style } from 'src/configs/generalConfig';
import { decodeAndSetConfig } from '../../utils/tokenUtils';
import { useApiAccess } from 'src/@core/hooks/useApiAccess';
import SearchBar from 'src/components/SearchBarComponent'
import EsignStatusFilter from 'src/components/EsignStatusFilter'
import { footerContent } from 'src/utils/footerContentPdf';
import { headerContentFix } from 'src/utils/headerContentPdfFix';
import ExportResetActionButtons from 'src/components/ExportResetActionButtons'
const mainUrl = BaseUrl

const ImgStyled = styled('img')(({ theme }) => ({
  width: 120,
  height: 120,
  marginRight: theme.spacing(6.25),
  borderRadius: theme.shape.borderRadius
}))
const ButtonStyled = styled(Button)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    textAlign: 'center'
  }
}))
const ResetButtonStyled = styled(Button)(({ theme }) => ({
  marginLeft: theme.spacing(4.5),
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    marginLeft: 0,
    textAlign: 'center',
    marginTop: theme.spacing(4)
  }
}))
const Index = () => {
  const router = useRouter()
  const { settings } = useSettings()
  const [userData, setUserData] = useState([])
  const [allDepartment, setAllDepartment] = useState([])
  const [allDesignation, setAllDesignation] = useState([])
  const [allLocation, setAllLocation] = useState([])
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [alertData, setAlertData] = useState({ type: '', message: '', variant: 'filled' })
  const [searchVal, setSearchVal] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [eSignStatus, setESignStatus] = useState('')
  const [userId, setUserId] = useState('')
  const [userName, setUserName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('Dummy@1234')
  const [departmentId, setDepartmentId] = useState('')
  const [designationId, setDesignationId] = useState('')
  const [locationId, setLocationId] = useState('')
  const [errorUserId, setErrorUserId] = useState({ isError: false, message: '' })
  const [errorUserName, setErrorUserName] = useState({ isError: false, message: '' })
  const [errorEmail, setErrorEmail] = useState({ isError: false, message: '' })
  const [errorPhoneNumber, setErrorPhoneNumber] = useState({ isError: false, message: '' })
  const [errorPassword, setErrorPassword] = useState({ isError: false, message: '' })
  const [errorDepartmentId, setErrorDepartmentId] = useState({ isError: false, message: '' })
  const [errorDesignationId, setErrorDesignationId] = useState({ isError: false, message: '' })
  const [errorLocationId, setErrorLocationId] = useState({ isError: false, message: '' })
  const [openModal, setOpenModal] = useState(false)
  const [editData, setEditData] = useState({})
  const [sortDirection, setSortDirection] = useState('asc')
  const [profilePhoto, setProfilePhoto] = useState('/images/avatars/1.png')
  const [isEnabled, setIsEnabled] = useState(true)
  const [file, setFile] = useState('')
  const { setIsLoading } = useLoading()
  const [tempSearchVal, setTempSearchVal] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(settings.rowsPerPage)
  const [totalRecords, setTotalRecords] = useState(0)
  const [sortBy, setSortBy] = useState('')
  const { getUserData, removeAuthToken } = useAuth()
  const [userDataPdf, setUserDataPdf] = useState()
  const [config, setConfig] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [approveAPIName, setApproveAPIName] = useState('');
  const [approveAPImethod, setApproveAPImethod] = useState('');
  const [approveAPIEndPoint, setApproveAPIEndPoint] = useState('');
  const [eSignStatusId, setESignStatusId] = useState('');
  const [auditLogMark, setAuditLogMark] = useState('');
  const [esignDownloadPdf, setEsignDownloadPdf] = useState(false);
  const [openModalApprove, setOpenModalApprove] = useState(false);
  const apiAccess = useApiAccess(
    "user-create",
    "user-update",
    "user-approve");

  useEffect(() => {
    let data = getUserData();
    setUserDataPdf(data);
    decodeAndSetConfig(setConfig);
  }, [])

  useEffect(() => {
    getDepartments()
    getUser()
    getDesignation()
    getLocation()
  }, [departmentFilter, eSignStatus, searchVal, page, rowsPerPage, statusFilter])

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
        search: searchVal,
        esign_status: eSignStatus,
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
      console.log('designation by department ', res.data, departmentId)
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
      const params = new URLSearchParams({
        limit: -1
      })
      setIsLoading(true)
      const res = await api(`/location/?${params.toString()}`, {}, 'get', true)
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
    setOpenSnackbar(false)
  }

  const handleOpenModal = () => {
    setApproveAPIName("user-create");
    setApproveAPImethod("POST");
    setApproveAPIEndPoint("/api/v1/user");
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
  const applyValidation = () => {
    const MAX_LENGTH = 50;
    const PHONE_LENGTH = 10;
    const MIN_PASSWORD_LENGTH = 8;
    const setError = (setter, condition, errorMessage) => {
      setter({ isError: condition, message: condition ? errorMessage : '' });
    };
    const validateLength = (value, maxLength,) => value.length >= maxLength ? true : false;
    const validateEmpty = (value) => value === '' ? true : false;
    const errors = {
      userIdLength: `User id length should be less than ${MAX_LENGTH} characters`,
      userIdInvalid: `User id cannot contain special symbols`,
      
      userIdEmpty: "User id can't be empty",
      userNameInvalid: 'Username cannot contain special symbols',
      userNameLength: `User name length should be less than ${MAX_LENGTH} characters`,
      userNameEmpty: "User Name can't be empty",
      emailInvalid: 'Email is not valid',
      phoneInvalid: `Phone number must be ${PHONE_LENGTH} digits`,
      phoneContainsAlphabets: 'Phone number cannot contain alphabets',
      departmentIdEmpty: 'Department Id cannot be empty',
      designationIdEmpty: 'Designation Id cannot be empty',
      locationIdEmpty: 'Location Id cannot be empty',
      passwordShort: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      passwordInvalid: 'Password must contain at least 1 uppercase, 1 lowercase, 1 digit, and 1 special character (@#$%^&*)',
    };
    !userId ? setError(setErrorUserId, validateEmpty(userId), errors.userIdEmpty) : setError(setErrorUserId, validateLength(userId, MAX_LENGTH), errors.userIdLength);
    !userName ? setError(setErrorUserName, validateEmpty(userName), errors.userNameEmpty) : setError(setErrorUserName, validateLength(userName, MAX_LENGTH), errors.userNameLength);
    setError(setErrorUserId, (!(/^[a-zA-Z0-9]+\s*$/.test(userId))), errors.userIdInvalid);
     setError(setErrorUserName, (!(/^[a-zA-Z0-9]+\s*(?:[a-zA-Z0-9]+\s*)*$/.test(userName))), errors.userNameInvalid);
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    setError(setErrorEmail, !emailRegex.test(email), errors.emailInvalid);
    setError(
      setErrorPhoneNumber,
      phoneNumber.length !== PHONE_LENGTH || !/^\d+$/.test(phoneNumber),
      phoneNumber.length !== PHONE_LENGTH ? errors.phoneInvalid : errors.phoneContainsAlphabets
    );
    setError(setErrorDepartmentId, validateEmpty(departmentId), errors.departmentIdEmpty);
    setError(setErrorDesignationId, validateEmpty(designationId), errors.designationIdEmpty);
    setError(setErrorLocationId, validateEmpty(locationId), errors.locationIdEmpty);
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%^&*])[A-Za-z\d@#$%^&*()\-_=+]{8,}$/;
    setError(
      setErrorPassword,
      password?.length < MIN_PASSWORD_LENGTH || !passwordRegex.test(password),
      password?.length < MIN_PASSWORD_LENGTH ? errors.passwordShort : errors.passwordInvalid
    );
  };
  const checkValidate = () => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    const phoneRegex = /^\d{10}$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%^&*])[A-Za-z\d@#$%^&*()\-_=+]{8,}$/;
    const isInvalid =
      userId.length >= 50 || !userId ||
      userName.length >= 50 || !userName ||
      !(/^[a-zA-Z0-9]+\s*(?:[a-zA-Z0-9]+\s*)*$/.test(userName)) ||!(/^[a-zA-Z0-9]+\s*$/.test(userId)) ||
      !emailRegex.test(email) ||
      !phoneRegex.test(phoneNumber) ||
      !departmentId || !designationId || !locationId ||
      !password || password.length < 8 || !passwordRegex.test(password);
    return !isInvalid;
  };
  const resetForm = () => {
    setUserId('')

    setUserName('')
    setEmail('')
    setPhoneNumber('')
    setPassword('')
    setDepartmentId('')
    setDesignationId('')
    setLocationId('')
    setIsEnabled(true)
    setErrorUserId({ isError: false, message: '' })
    setErrorUserName({ isError: false, message: '' })
    setErrorEmail({ isError: false, message: '' })
    setErrorPhoneNumber({ isError: false, message: '' })
    setErrorPassword({ isError: false, message: '' })
    setErrorDepartmentId({ isError: false, message: '' })
    setErrorDesignationId({ isError: false, message: '' })
    setErrorLocationId({ isError: false, message: '' })
    setEditData({})
    setAllDesignation([])
    setProfilePhoto('/images/avatars/1.png')
  }
  const resetEditForm = () => {
    console.log('REset edit field')
    setEmail('')
    setPhoneNumber('')
    setDepartmentId('')
    setDesignationId('')
    setLocationId('')
    setIsEnabled(true)
    setErrorUserId({ isError: false, message: '' })
    setErrorUserName({ isError: false, message: '' })
    setErrorEmail({ isError: false, message: '' })
    setErrorPhoneNumber({ isError: false, message: '' })
    setErrorPassword({ isError: false, message: '' })
    setErrorDepartmentId({ isError: false, message: '' })
    setErrorDesignationId({ isError: false, message: '' })
    setErrorLocationId({ isError: false, message: '' })
    setEditData(prev => ({
      ...prev,
      email: '',
      phone_number: '',
      user_location_id: '',
      user_department_id: '',
      user_designation_id: '',
      profile_photo: ''
    }))
  }
  const handleSubmitForm = async () => {
    const isEdit = !!editData?.id;
    setApproveAPIName(isEdit ? "user-update" : "user-create");
    setApproveAPImethod(isEdit ? "PUT" : "POST");
    setApproveAPIEndPoint("/api/v1/user");
    applyValidation();
    const isValid = checkValidate();
    if (!isValid) {
      return true;
    }
    if (config?.config?.esign_status) {
      setAuthModalOpen(true);
      return;
    }
    const esign_status = "approved";
    isEdit ? editUser() : addUser(esign_status);
  };
  const addUser = async (esign_status, remarks) => {
    const uploadRes = await uploadUserImage();
    if (!uploadRes?.success) {
      setOpenSnackbar(true);
      setAlertData({ ...alertData, type: 'error', message: uploadRes?.message });
      return;
    }
    console.log('user profile url', uploadRes?.url)
    try {
      setIsLoading(true)
      const data = {
        userId,
        userName,
        password,
        departmentId,
        designationId,
        locationId,
        email,
        phoneNumber,
        profilePhoto: uploadRes?.url || "",
        is_active: isEnabled,
        role: 'user'
      }
      const auditlogRemark = remarks;
      const audit_log = config?.config?.audit_logs ? {
        "audit_log": true,
        "performed_action": "add",
        "remarks": auditlogRemark?.length > 0 ? auditlogRemark : `user added - ${userName}`,
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
        setOpenSnackbar(true);
        setAlertData({ ...alertData, type: 'success', message: 'User added successfully' });
        getUser();
        resetForm();
      } else {
        console.log('error to add User ', res.data)
        setOpenSnackbar(true);
        setAlertData({ ...alertData, type: 'error', message: res.data?.message });
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
      setApproveAPIName('');
      setApproveAPImethod('');
      setApproveAPIEndPoint('');
    }
  }
  const editUser = async (esign_status, remarks) => {
    let url = ''
    console.log(profilePhoto !== editData.profile_photo, editData.profile_photo !== "")
    if (profilePhoto !== editData.profile_photo || editData.profile_photo === "") {
      const uploadRes = await uploadUserImage();
      if (!uploadRes?.success) {
        setOpenSnackbar(true);
        setAlertData({ ...alertData, type: 'error', message: uploadRes?.message });
        return;
      }
      url = uploadRes?.url;
    }
    try {
      const data = {
        departmentId,
        designationId,
        locationId,
        email,
        phoneNumber,
        profilePhoto: url || editData?.profile_photo,
        is_active: isEnabled
      }
      const auditlogRemark = remarks;
      let audit_log;
      if (config?.config?.audit_logs) {
        audit_log = {
          "audit_log": true,
          "performed_action": "edit",
          "remarks": auditlogRemark > 0 ? auditlogRemark : `user edited - ${userName}`,
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
        setOpenSnackbar(true)
        setAlertData({ ...alertData, type: 'success', message: 'User updated successfully' })
        resetForm()
        getUser()
      } else {
        console.log('error to edit User ', res.data)
        setOpenSnackbar(true)
        setAlertData({ ...alertData, type: 'error', message: res.data.message })
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
      setApproveAPIName('');
      setApproveAPImethod('');
      setApproveAPIEndPoint('');
    }
  }
  const handleAuthResult = async (isAuthenticated, user, isApprover, esignStatus, remarks) => {
    console.log("handleAuthResult 01", isAuthenticated, isApprover, esignStatus, user);
    console.log("handleAuthResult 02", config.userId, user.user_id);
    const handleAuthenticationError = () => {
      setAlertData({ type: 'error', message: 'Authentication failed, Please try again.' });
      setOpenSnackbar(true);
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
      downloadPdf();
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
      setAlertData({ type: 'error', message: 'Failed to update e-sign status.' });
      setOpenSnackbar(true);
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
      setApproveAPIName('');
      setApproveAPImethod('');
      setApproveAPIEndPoint('');
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
    setApproveAPIName("user-approve");
    setApproveAPImethod("PATCH");
    setApproveAPIEndPoint("/api/v1/user");
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
      department,
      user_id,
      user_name,
      email,
      phone_number,
      location,
      profile_photo,
      is_active,
      designation,
    } = item;
    setDepartmentId(department?.id);
    setUserId(user_id);
    setUserName(user_name);
    setEmail(email);
    setPhoneNumber(phone_number);
    setPassword('Dummy@1234');
    setLocationId(location?.id);
    setIsEnabled(is_active);
    setDesignationId(designation?.id);
    if (profile_photo && profile_photo !== '/images/avatars/1.png') {
      convertImageToBase64(profile_photo);
    } else {
      setProfilePhoto('/images/avatars/1.png');
    }
  };
  const handleSearch = () => {
    let currentVal = tempSearchVal
    currentVal = currentVal.toLowerCase()
    setSearchVal(currentVal)
    if (currentVal === '') {
      resetFilter()
    }
  }
  const handleTempSearchValue = e => {
    let currentVal = e.target.value
    currentVal = currentVal.toLowerCase()
    setTempSearchVal(currentVal)
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
    setTempSearchVal('')
    setSearchVal('')
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
  const downloadPdf = () => {
    console.log('clicked on download btn')
    const doc = new jsPDF()
    const headerContent = () => {
      headerContentFix(doc, 'User Master Report');

      if (searchVal) {
        doc.setFontSize(10)
        doc.text('Search : ' + `${tempSearchVal}`, 15, 25)
      } else {
        doc.setFontSize(10)
        doc.text('Search : ' + '__', 15, 25)
      }
      doc.text('Filters :\n', 15, 30)
      if (departmentFilter) {
        doc.setFontSize(10)
        doc.text('Department : ' + `${departmentFilter}`, 20, 35)
      } else {
        doc.setFontSize(10)
        doc.text('Department : ' + '__', 20, 35)
      }
      if (eSignStatus) {
        doc.setFontSize(10)
        doc.text(`Status : ${eSignStatus ? 'enabled' : 'disabled'}`, 20, 40)
      } else {
        doc.setFontSize(10)
        doc.text('Status : ' + '__', 20, 40)
      }
      doc.setFontSize(12)
      doc.text('User Data', 15, 55)
    }
    const bodyContent = () => {
      let currentPage = 1;
      let dataIndex = 0;
      const totalPages = Math.ceil(userData.length / 25);
      headerContent();
      while (dataIndex < userData.length) {
        if (currentPage > 1) {
          doc.addPage();
        }
        footerContent(currentPage, totalPages, userDataPdf, doc);

        const body = userData
          .slice(dataIndex, dataIndex + 25)
          .map((item, index) => [
            dataIndex + index + 1,
            item.user_user_id,
            item.user_name,
            item.department?.department_name,
            item.designation?.designation_name,
            item.email,
            item.is_active ? 'enabled' : 'disabled',
            item.esign_status,
          ]);
        autoTable(doc, {
          startY: currentPage === 1 ? 60 : 40,
          styles: { halign: 'center' },
          headStyles: {
            fontSize: 8,
            fillColor: [80, 189, 160],
          },
          alternateRowStyles: { fillColor: [249, 250, 252] },
          tableLineColor: [80, 189, 160],
          tableLineWidth: 0.1,
          head: [
            ['Sr.No.', 'User Id', 'User Name', 'Department Name', 'Designation Name', 'Email', 'Status', 'E-Sign'],
          ],
          body: body,
          columnWidth: 'wrap',
        });
        dataIndex += 25;
        currentPage++;
      }
    };

    bodyContent()
    const currentDate = new Date()
    const formattedDate = currentDate
      .toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
      .replace(/\//g, '-')
    const formattedTime = currentDate.toLocaleTimeString('en-US', { hour12: false }).replace(/:/g, '-')
    const fileName = `User_${formattedDate}_${formattedTime}.pdf`
    doc.save(fileName)
  }
  const handleAuthModalOpen = () => {
    console.log("OPen auth model");
    setApproveAPIName("user-approve");
    setApproveAPImethod("PATCH");
    setApproveAPIEndPoint("/api/v1/user");
    setAuthModalOpen(true);
  };
  const handleDownloadPdf = () => {
    setApproveAPIName("user-create");
    setApproveAPImethod("POST");
    setApproveAPIEndPoint("/api/v1/user");
    if (config?.config?.esign_status) {
      console.log("Esign enabled for download pdf");
      setEsignDownloadPdf(true);
      setAuthModalOpen(true);
      return;
    }
    downloadPdf();
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
                <EsignStatusFilter esignStatus={eSignStatus} setEsignStatus={setESignStatus} />
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
                  <SearchBar
                    searchValue={tempSearchVal}
                    handleSearchChange={handleTempSearchValue}
                    handleSearchClick={handleSearch}
                  />
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
      <SnackbarAlert openSnackbar={openSnackbar} closeSnackbar={closeSnackbar} alertData={alertData} />
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        data-testid="modal"
        role='dialog'
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
      >
        <Box sx={style}>
          <Typography variant='h4' className='my-2'>
            {editData?.id ? 'Edit User' : 'Add User'}
          </Typography>

          <Grid2 item xs={12} className='d-flex justify-content-between align-items-center'>
            <Box >
              <Grid2 item xs={12} sx={{ marginTop: 4.8, marginBottom: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ImgStyled src={profilePhoto} alt='Profile Pic' />
                  <Box>
                    <ButtonStyled
                      component='label'
                      variant='contained'
                      htmlFor='account-settings-upload-image'
                    >
                      Upload New Photo{/* */}
                      <input
                        hidden
                        type='file'
                        onChange={onChange}
                        accept='image/png, image/jpeg, image/jpg'
                        id='account-settings-upload-image'
                      />
                    </ButtonStyled>
                    <ResetButtonStyled
                      color='error'
                      variant='outlined'
                      onClick={() => setProfilePhoto('/images/avatars/1.png')}
                    >
                      Reset
                    </ResetButtonStyled>
                    <Typography variant='body2' sx={{ marginTop: 5 }}>
                      Allowed PNG, JPG or JPEG. Max size of 8MB.
                    </Typography>
                  </Box>
                </Box>
              </Grid2>
            </Box>
          </Grid2>

          <Grid2 container spacing={2}>
            <Grid2 size={6}>
              <TextField
                fullWidth
                label='User ID'
                placeholder='User ID'
                value={userId}
                onChange={e => {
                  setUserId(e.target.value)
                  e.target.value && setErrorUserId({ isError: false, message: '' })
                }}
                required={true}
                error={errorUserId.isError}
                disabled={!!editData?.id}
              />
            </Grid2>
            <Grid2 size={6}>
              <TextField
                fullWidth
                label='User Name'
                placeholder='User Name'
                value={userName}
                onChange={e => {
                  setUserName(e.target.value)
                  e.target.value && setErrorUserName({ isError: false, message: '' })
                }}
                required={true}
                error={errorUserName.isError}
                disabled={!!editData?.id}
              />
            </Grid2>
          </Grid2>
          <Grid2 container spacing={2} sx={{ margin: "0.5rem 0rem" }}>
            <Grid2 size={6}>
              <FormHelperText error={errorUserId.isError}>
                {errorUserId.isError ? errorUserId.message : ''}
              </FormHelperText>
            </Grid2>
            <Grid2 size={6}>
              <FormHelperText error={errorUserName.isError}>
                {errorUserName.isError ? errorUserName.message : ''}
              </FormHelperText>
            </Grid2>
          </Grid2>
          <Grid2 container spacing={2}>
            <Grid2 size={6}>
              <TextField
                fullWidth
                label='Email'
                placeholder='Email'
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value)) {
                    setErrorEmail({ isError: false, message: '' })
                  } else {
                    setErrorEmail({ isError: true, message: 'Email is not Valid' })
                  }
                }}
                required={true}
                error={errorEmail.isError}
              />
            </Grid2>
            <Grid2 size={6}>
              <TextField
                fullWidth
                type='password'
                label='Password'
                placeholder='Password'
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%^&*])[A-Za-z\d@#$%^&*()\-_=+]{8,}$/;
                  if (e.target.value?.length < 8) {
                    setErrorPassword({ isError: true, message: 'Password must be at least 8 characters' });
                  } else if (passwordRegex.test(e.target.value)) {
                    setErrorPassword({ isError: false, message: '' });
                  } else {
                    setErrorPassword({
                      isError: true,
                      message: 'Password must include at least 1 uppercase, 1 lowercase, 1 digit, and 1 special character (@#$%^&*)'
                    });
                  }
                }}
                required={true}
                error={errorPassword.isError}
                disabled={!!editData?.id}
              />
            </Grid2>
          </Grid2>

          <Grid2 container spacing={2} sx={{ margin: "0.5rem 0rem" }}>
            <Grid2 size={6}>
              <FormHelperText error={errorEmail.isError}>
                {errorEmail.isError ? errorEmail.message : ''}
              </FormHelperText>
            </Grid2>
            <Grid2 size={6}>
              <FormHelperText error={errorPassword.isError}>
                {errorPassword.isError ? errorPassword.message : ''}
              </FormHelperText>
            </Grid2>
          </Grid2>

          <Grid2 container spacing={2}>
            <Grid2 size={6}>
              <TextField
                fullWidth
                label='Phone'
                placeholder='Enter Phone'
                value={phoneNumber}
                onChange={e => {
                  const value = e.target.value;
                  setPhoneNumber(value);
                  if (value.length !== 10) {
                    setErrorPhoneNumber({ isError: true, message: 'Phone number must be 10 digits' });
                  } else if (!/^\d+$/.test(value)) {
                    setErrorPhoneNumber({ isError: true, message: 'Phone number cannot contain alphabets' });
                  } else {
                    setErrorPhoneNumber({ isError: false, message: '' });
                  }
                }}
                required={true}
                error={errorPhoneNumber.isError}
              />
            </Grid2>
            <Grid2 size={6}>
              <FormControl fullWidth required error={errorDepartmentId.isError}>
                <InputLabel required>Department</InputLabel>
                <Select
                  labelId='user-select-by-department-id'
                  id='user-select-by-department-id'
                  label='Department Name'
                  value={departmentId}
                  onChange={e => {
                    setDepartmentId(e.target.value)
                    setErrorDepartmentId({ isError: false, message: '' })
                  }}
                >
                  {allDepartment?.map(d => {
                    return (
                      <MenuItem key={d?.id} value={d?.id} selected={departmentId === d.id}>
                        {d?.department_name}
                      </MenuItem>
                    )
                  })}
                </Select>
                <FormHelperText className='dropDown-error'>
                </FormHelperText>
              </FormControl>

            </Grid2>
          </Grid2>
          <Grid2 container spacing={2} sx={{ margin: "0.5rem 0rem" }}>
            <Grid2 size={6}>
              <FormHelperText error={errorPhoneNumber.isError}>
                {errorPhoneNumber.isError ? errorPhoneNumber.message : ''}
              </FormHelperText>

            </Grid2>
            <Grid2 size={6}>
              <FormHelperText error={errorDepartmentId.isError}>
                {errorDepartmentId.isError ? errorDepartmentId.message : ''}
              </FormHelperText>
            </Grid2>
          </Grid2>

          <Grid2 container spacing={2}>
            <Grid2 size={6}>
              <FormControl fullWidth required error={errorDesignationId.isError}>
                <InputLabel>Designation</InputLabel>
                <Select
                  labelId='user-select-by-designation-id'
                  id='user-select-by-designation-id'
                  label='Designation Name'
                  value={designationId}
                  onChange={e => {
                    setDesignationId(e.target.value)
                    setErrorDesignationId({ isError: false, message: '' })
                  }}
                >
                  {allDesignation?.map(d => {
                    return (
                      <MenuItem key={d?.id} value={d?.id} selected={designationId === d.id}>
                        {d?.designation_name}
                      </MenuItem>
                    )
                  })}
                </Select>
              </FormControl>
            </Grid2>
            <Grid2 size={6}>
              <FormControl fullWidth required error={errorLocationId.isError}>
                <InputLabel>Location</InputLabel>
                <Select
                  labelId='user-select-by-location-id'
                  id='user-select-by-location-id'
                  label='Location Name'
                  value={locationId}
                  onChange={e => {
                    setLocationId(e.target.value)
                    setErrorLocationId({ isError: false, message: '' })
                  }}
                >
                  {allLocation?.map(d => {
                    return (
                      <MenuItem key={d?.id} value={d?.id} selected={locationId === d.id}>
                        {d?.location_name}
                      </MenuItem>
                    )
                  })}
                </Select>
              </FormControl>
            </Grid2>
          </Grid2>
          <Grid2 container spacing={2}>
            <Grid2 size={6}>
              <FormHelperText error={errorDesignationId.isError}>
                {errorDesignationId.isError ? errorDesignationId.message : ''}
              </FormHelperText>

            </Grid2>
            <Grid2 size={6}>
              <FormHelperText error={errorLocationId.isError}>
                {errorLocationId.isError ? errorLocationId.message : ''}
              </FormHelperText>
            </Grid2>
          </Grid2>

          {editData?.id && (
            <Grid2 item xs={12} sm={6}>
              <Typography component='Box'>
                <Switch
                  checked={isEnabled}
                  onChange={event => setIsEnabled(event.target.checked)}
                  name='enabled'
                  color='primary'
                />
                User Enabled
              </Typography>
            </Grid2>
          )}
          <Grid2 item xs={12} className='my-3 '>
            <Button variant='contained' sx={{ marginRight: 3.5 }} onClick={handleSubmitForm}>
              Save Changes
            </Button>
            <Button
              type='reset'
              variant='outlined'
              color='primary'
              onClick={editData?.id ? resetEditForm : resetForm}
            >
              Reset
            </Button>
            <Button variant='outlined' color='error' sx={{ marginLeft: 3.5 }} onClick={handleCloseModal}>
              Close
            </Button>
          </Grid2>
        </Box>
      </Modal>
      <AuthModal
        open={authModalOpen}
        handleClose={handleAuthModalClose}
        approveAPIName={approveAPIName}
        approveAPImethod={approveAPImethod}
        approveAPIEndPoint={approveAPIEndPoint}
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