'use-client'
import React, { useState, useEffect, useMemo, useLayoutEffect } from 'react'
import Grid2 from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import { Button, TableContainer, Paper } from '@mui/material'
import { IoMdAdd } from 'react-icons/io'
import Box from '@mui/material/Box'
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
import { validateToken } from 'src/utils/ValidateToken';
import { getTokenValues} from '../../utils/tokenUtils';
import { useApiAccess } from 'src/@core/hooks/useApiAccess';
import ExportResetActionButtons from 'src/components/ExportResetActionButtons'
import EsignStatusDropdown from 'src/components/EsignStatusDropdown'
import downloadPdf from 'src/utils/DownloadPdf'
import CustomSearchBar from 'src/components/CustomSearchBar'
import DepartmentModel from 'src/components/Modal/DepartmentModel'

const Index = () => {
  const router = useRouter()
  const { settings } = useSettings()
  const [openModal, setOpenModal] = useState(false)
  const [alertData, setAlertData] = useState({ openSnackbar:false,type: '', message: '', variant: 'filled' })
  const [departmentData, setDepartmentData] = useState([])
  const [editData, setEditData] = useState({})
  const [sortDirection, setSortDirection] = useState('asc')
  const { setIsLoading } = useLoading()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(settings.rowsPerPage)
  const [designationData, setDesignationData] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [userDataPdf, setUserDataPdf] = useState()
  const { getUserData, removeAuthToken } = useAuth()
  const [config, setConfig] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [approveAPI,setApproveAPI]=useState({ approveAPIName:'',approveAPImethod:'',approveAPIEndPoint:''})
  const [eSignStatusId, setESignStatusId] = useState('');
  const [auditLogMark, setAuditLogMark] = useState('');
  const [esignDownloadPdf, setEsignDownloadPdf] = useState(false);
  const [openModalApprove, setOpenModalApprove] = useState(false);
  const [tableHeaderData, setTableHeaderData] = useState({
    esignStatus: '',
    searchVal: ''
  });
  const [formData,setFormData]=useState({})
  const apiAccess1 = useApiAccess(
    "department-create",
    "department-update",
    "department-approve");

  const apiAccess2 = useApiAccess(
    "designation-create",
    "designation-update",
    "designation-approve");
  const apiAccess = {
    ...apiAccess1,
    addDesignationApiAccess: apiAccess2.addApiAccess,
    editDesignationApiAccess: apiAccess2.editApiAccess
  };

 
  const tableBody = designationData.map((item, index) => 
    [index + 1,  item.department.department_id,item.department.department_name,
      item.department.is_location_required,item.department.esign_status]);
   const tableData = useMemo(() => ({
      tableHeader: ['Sr.No.', 'Department Id', 'Department Name', 'Location Required', 'E-Sign'],
      tableHeaderText: 'Department Report',
      tableBodyText: 'Department Data',
      filename:'DepartmentMaster'
    }), []);

  useLayoutEffect(() => {
      getDesignations()
      let data = getUserData();
      const decodedToken = getTokenValues();
      setConfig(decodedToken);
      setUserDataPdf(data);
      return () => { }
    }, [openModal])

  useEffect(() => {
    getDepartments()
    getDesignations()
  }, [page, rowsPerPage, tableHeaderData])

  const getDepartments = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage === -1 ? -1 : rowsPerPage,
        search: tableHeaderData.searchVal,
        esign_status: tableHeaderData.esignStatus
      })
      console.log(params.toString())
      const res = await api(`/department/?${params.toString()}`, {}, 'get', true)
      setIsLoading(false)
      if (res.data.success) {
        setTotalCount(res.data.data.total)
        setDepartmentData(res.data.data.departments)
      } else if (res.data.code === 401) {
        removeAuthToken();
        router.push('/401');
      }
    } catch (error) {
      setIsLoading(false)
    }
  }

  const getDesignations = async () => {
    try {
      setIsLoading(true)
      const res = await api('/designation/', {}, 'get', true)
      setIsLoading(false)
      console.log('All designations ', res.data)
      if (res.data.success) {
        setDesignationData(res.data.data.designations)
      } else if (res.data.code === 401) {
        removeAuthToken();
        router.push('/401');
      }
    } catch (error) {
      console.log('Error in get designation ', error)
      setIsLoading(false)
    }
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }
  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }
  const resetFilter = () => {
    setTableHeaderData({...tableHeaderData,esignStatus:"",searchVal:""})
    setPage(0)
  }
  const handleOpenModal = () => {
    setApproveAPI({
      approveAPIName:"department-create",
      approveAPImethod:"POST",
      approveAPIEndPoint:"/api/v1/department"
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
  }
  const resetEditForm = () => {

    setErrorDepartmentId({ isError: false, message: '' })
    setErrorDepartmentName({ isError: false, message: '' })
    setEditData(prev => ({
      ...prev,
      department_id: '',
      department_name: '',
      is_location_required: ''
    }))
  }
  const handleUpdate = item => {
    setOpenModal(true)
    setEditData(item)
    
  }
  const handleAuthResult = async (isAuthenticated, user, isApprover, esignStatus, remarks) => {
    console.log("handleAuthResult 01", isAuthenticated, isApprover, esignStatus, user);
    console.log("handleAuthResult 02", config?.userId, user.user_id);
    const resetState = () => {
      setApproveAPI({
        approveAPIName:"",
        approveAPImethod:"",
        approveAPIEndPoint:""
      })
      setAuthModalOpen(false);
    };
    const handleApprovalActions = () => {
      if (esignDownloadPdf) {
        setOpenModalApprove(true);
        console.log("esign is approved for creator to download");
        downloadPdf(tableData,tableHeaderData,tableBody,departmentData,userDataPdf);
      } else {
        console.log("esign is approved for creator");
        const esign_status = "pending";
        editData?.id ? editDepartment(esign_status, remarks) : addDepartment(esign_status, remarks);
      }
    };
    const handleUnauthenticated = () => {
      setAlertData({ openSnackbar:true,type: 'error', message: 'Authentication failed, Please try again.' });
      resetState();
    };
    const handleApproverActions = async () => {
      const data = {
        modelName: "department",
        esignStatus,
        id: eSignStatusId,
        audit_log: config?.config?.audit_logs ? {
          "user_id": user.userId,
          "user_name": user.userName,
          "performed_action": 'approved',
          "remarks": remarks.length > 0 ? remarks : `department approved - ${auditLogMark}`,
        } : {}
      };
      if (esignStatus === "approved" && esignDownloadPdf) {
        setOpenModalApprove(false);
        console.log("esign is approved for approver");
        resetState();
        downloadPdf(tableData,tableHeaderData,tableBody,departmentData,userDataPdf);
        return;
      }
      const res = await api('/esign-status/update-esign-status', data, 'patch', true);
      console.log("esign status update", res?.data);
      if (esignStatus === "rejected" && esignDownloadPdf) {
        console.log("approver rejected");
        setOpenModalApprove(false);
        resetState();
      }
    };
    const handleCreatorRejection = () => {
      setAuthModalOpen(false);
      setOpenModalApprove(false);
    };
    // Main Logic
    if (!isAuthenticated) {
      handleUnauthenticated();
      return;
    }
    if (isApprover) {
      await handleApproverActions();
    } else if (esignStatus === "rejected") {
      handleCreatorRejection();
    } else if (esignStatus === "approved") {
      handleApprovalActions();
    }
    resetState();
    getDepartments();
    getDesignations();
  };
  const handleAuthCheck = async (row) => {
    console.log("handleAuthCheck", row)
    setApproveAPI({
      approveAPIName:"department-approve",
      approveAPImethod:"PATCH",
      approveAPIEndPoint:"/api/v1/department"
    })
    setAuthModalOpen(true);
    setESignStatusId(row.id);
    setAuditLogMark(row.department_id)
    console.log("row", row)
  }
  const handleSort = (key, isBoolean = false) => {
    const newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    const booleanSort = (a, b) => {
      if (a[key] === b[key]) return 0;
      let comparison = a[key] ? 1 : -1;
      if (newSortDirection !== 'asc') {
        comparison = a[key] ? -1 : 1;
      }
      return comparison;
    };
    const regularSort = (a, b) => {
      if (a[key] === b[key]) return 0;
      let comparison = a[key] > b[key] ? 1 : -1;
      if (newSortDirection !== 'asc') {
        comparison = a[key] > b[key] ? -1 : 1;
      }
      return comparison;
    };
    const sorted = [...departmentData].sort(isBoolean ? booleanSort : regularSort);
    setDepartmentData(sorted);
    setSortDirection(newSortDirection);
  };
  const handleSortById = () => handleSort('department_id');
  const handleSortByName = () => handleSort('department_name');
  const handleSortByLocation = () => handleSort('is_location_required', true);
  const handleSubmitForm = async (data) => {
    setFormData(data)
    if (editData?.id) {
      setApproveAPI({
        approveAPIName:"department-update",
        approveAPImethod:"PUT",
        approveAPIEndPoint:"/api/v1/department"
      })
    } else {
      setApproveAPI({
        approveAPIName:"department-create",
        approveAPImethod:"POST",
        approveAPIEndPoint:"/api/v1/department"
      })
    }
    
    if (config?.config?.esign_status) {
      setAuthModalOpen(true);
      return;
    }
    const esign_status = "approved";
    editData?.id ? editDepartment() : addDepartment(esign_status);
  }
  const addDepartment = async (esign_status, remarks) => {
    try {
        console.log("formData",formData)
      const data = { ...formData }
      const auditlogRemark = remarks;
      const audit_log = config?.config?.audit_logs ? {
        "audit_log": true,
        "performed_action": "add",
        "remarks": auditlogRemark?.length > 0 ? auditlogRemark : `Department added - ${formData.departmentId}`,
      } : {
        "audit_log": false,
        "performed_action": "none",
        "remarks": `none`,
      };
      data.audit_log = audit_log;
      data.esign_status = esign_status;
      setIsLoading(true);
      const res = await api('/department/', data, 'post', true)
      setIsLoading(false)
      if (res?.data?.success) {
        setAlertData({ ...alertData,openSnackbar:true, type: 'success', message: 'Department added successfully' })
        getDepartments()
        resetForm()
      } else {
        setAlertData({ ...alertData,openSnackbar:true, type: 'error', message: res.data?.message })
        if (res.data.code === 401) {
          removeAuthToken();
          router.push('/401');
        }
      }
    } catch (error) {
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
  const editDepartment = async (esign_status, remarks) => {
    try {
      const data = { ...formData };
      delete data.departmentId;
      const auditlogRemark = remarks;
      let audit_log;
      if (config?.config?.audit_logs) {
        audit_log = {
          "audit_log": true,
          "performed_action": "edit",
          "remarks": auditlogRemark > 0 ? auditlogRemark : `department edited - ${formData.departmentName}`,
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
      setIsLoading(true)
      const res = await api(`/department/${editData.id}`, data, 'put', true)
      setIsLoading(false)
      if (res.data.success) {
        setAlertData({ ...alertData,openSnackbar:true, type: 'success', message: 'Department updated successfully' })
        getDepartments()
        resetForm()
      } else {
        setAlertData({ ...alertData,openSnackbar:true, type: 'error', message: res.data.message });
        if (res.data.code === 401) {
          removeAuthToken();
          router.push('/401');
        }
      }
    } catch (error) {
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
  const closeSnackbar = () => {
    setAlertData({...alertData,openSnackbar:false})
  }
  const handleSearch = (val) => {
    setTableHeaderData({ ...tableHeaderData,searchVal:val.toLowerCase()});
    setPage(0);
  }
  
  
  const handleAuthModalOpen = () => {
    console.log("OPen auth model");
    setApproveAPI({
      approveAPIName:"department-approve",
      approveAPImethod:"PATCH",
      approveAPIEndPoint:"/api/v1/department"
    })
    setAuthModalOpen(true);
  };
  const handleDownloadPdf = () => {
    setApproveAPI({
      approveAPIName:"department-create",
      approveAPImethod:"POST",
      approveAPIEndPoint:"/api/v1/department"
    })
    if (config?.config?.esign_status) {
      console.log("Esign enabled for download pdf");
      setEsignDownloadPdf(true);
      setAuthModalOpen(true);
      return;
    }
    downloadPdf(tableData,tableHeaderData,tableBody,departmentData,userDataPdf);
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
       <EsignStatusDropdown tableHeaderData={tableHeaderData} setTableHeaderData={setTableHeaderData} />
                
              </Box>
              <Box className='d-flex justify-content-between align-items-center mx-4 my-2'>
                <ExportResetActionButtons handleDownloadPdf={handleDownloadPdf} resetFilter={resetFilter} />
                <Box className='d-flex justify-content-between align-items-center '>
                  
                   <CustomSearchBar handleSearchClick={handleSearch} />
                  
                  {
                    apiAccess.addApiAccess && (
                      <Box className='mx-2'>
                        <Button variant='contained' className='py-2' onClick={handleOpenModal} role='button'>
                          <span>
                            <IoMdAdd />
                          </span>
                          <span>Add</span>
                        </Button>
                      </Box>
                    )
                  }
                </Box>
              </Box>
            </Grid2>
            <Grid2 item xs={12}>
              <Typography variant='h4' className='mx-4 mt-3'>
                Department Data
              </Typography>
              <TableContainer component={Paper}>
                <TableDepartment
                  getDesignations={getDesignations}
                  designationData={designationData}
                  openSnackbar={alertData.openSnackbar}
                  setOpenSnackbar={alertData.openSnackbar}
                  alertData={alertData}
                  setAlertData={setAlertData}
                  departmentData={departmentData}
                  handleUpdate={handleUpdate}
                  handleSortById={handleSortById}
                  handleSortByName={handleSortByName}
                  sortDirection={sortDirection}
                  handleSortByLocation={handleSortByLocation}
                  page={page}
                  totalRecords={totalCount}
                  rowsPerPage={rowsPerPage}
                  handleChangePage={handleChangePage}
                  handleChangeRowsPerPage={handleChangeRowsPerPage}
                  editable={apiAccess.editApiAccess}
                  handleAuthCheck={handleAuthCheck}
                  apiAccess={apiAccess}
                  config_dept={config}
                />
              </TableContainer>
            </Grid2>
          </Box>
        </Grid2>
      </Grid2>
      <SnackbarAlert openSnackbar={alertData.openSnackbar} closeSnackbar={closeSnackbar} alertData={alertData} />
      {/* <Modal
        open={openModal}
        onClose={handleCloseModal}
        data-testid="modal"
        role='dialog'
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
      >
        <Box sx={style}>
          <Typography variant='h4' className='my-2'>
            {editData?.id ? 'Edit Department' : 'Add Department'}
          </Typography>

          <Grid2 container spacing={2}>
            <Grid2 size={6}>
              <TextField
                fullWidth
                id='outlined-controlled'
                label='Department ID'
                placeholder='Department ID'
                value={departmentId}
                onChange={e => {
                  setDepartmentId(e.target.value)
                  e.target.value && setErrorDepartmentId({ isError: false, message: '' })
                }}
                required={true}
                error={errorDepartmentId.isError}
                disabled={!!editData?.id}
              />
            </Grid2>
            <Grid2 size={6}>
              <TextField
                fullWidth
                id='outlined-controlled'
                label='Department Name'
                placeholder='Department Name'
                value={departmentName}
                onChange={e => {
                  setDepartmentName(e.target.value)
                  e.target.value && setErrorDepartmentName({ isError: false, message: '' })
                }}
                required={true}
                error={errorDepartmentName.isError}
              />
            </Grid2>
          </Grid2>

          <Grid2 container spacing={2}>
            <Grid2 size={6} sx={{ padding: "0rem 0.8rem" }} >
              <FormHelperText error={errorDepartmentId.isError} >
                {errorDepartmentId.isError ? errorDepartmentId.message : ''}
              </FormHelperText>
            </Grid2>
            <Grid2 size={6} sx={{ padding: "0rem 0.8rem" }}>
              <FormHelperText error={errorDepartmentName.isError} >
                {errorDepartmentName.isError ? errorDepartmentName.message : ''}
              </FormHelperText>
            </Grid2>
          </Grid2>

          <Grid2 item xs={12} sm={6} >
            <FormControlLabel
              control={
                <Switch
                  checked={isLocationRequire}
                  size='medium'
                  color='primary'
                  onChange={event => setIsLocationRequire(event.target.checked)}
                />
              }
              label='Location required'
            />
          </Grid2>

          <Grid2 item xs={12} className='my-3 '>
            <Button variant='contained' sx={{ marginRight: 3.5 }} onClick={() => handleSubmitForm()}>
              Save Changes
            </Button>
            <Button
              type='reset'
              variant='outlined'
              color='primary'
              onClick={() => editData?.id ? resetEditForm() : resetForm()}
            >
              Reset
            </Button>
            <Button variant='outlined' color='error' sx={{ marginLeft: 3.5 }} onClick={() => handleCloseModal()}>
              Close
            </Button>
          </Grid2>

        </Box>
      </Modal > */}
      <DepartmentModel open={openModal}
               onClose={handleCloseModal} 
         editData={editData}
          handleSubmitForm={handleSubmitForm}/>
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
    </Box >
  )
}
export async function getServerSideProps(context) {
  return validateToken(context, 'Department Master')
}

export default ProtectedRoute(Index)