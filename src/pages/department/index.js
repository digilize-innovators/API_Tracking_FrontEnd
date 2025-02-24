'use-client'
import React, { useState, useEffect } from 'react'
import Grid2 from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import { Button, FormControlLabel, Switch, TextField, TableContainer, Paper, FormHelperText } from '@mui/material'
import { IoMdAdd } from 'react-icons/io'
import Modal from '@mui/material/Modal'
import Box from '@mui/material/Box'
import { api } from 'src/utils/Rest-API'
import ProtectedRoute from 'src/components/ProtectedRoute'
import TableDepartment from 'src/views/tables/TableDepartment'
import SnackbarAlert from 'src/components/SnackbarAlert'
import { useLoading } from 'src/@core/hooks/useLoading'
import Head from 'next/head'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useAuth } from 'src/Context/AuthContext'
import { useSettings } from 'src/@core/hooks/useSettings'
import { useRouter } from 'next/router'
import AuthModal from 'src/components/authModal'
import ChatbotComponent from 'src/components/ChatbotComponent'
import AccessibilitySettings from 'src/components/AccessibilitySettings'
import { validateToken } from 'src/utils/ValidateToken';
import { style } from 'src/configs/generalConfig';
import { decodeAndSetConfig } from '../../utils/tokenUtils';
import { useApiAccess } from 'src/@core/hooks/useApiAccess';
import ExportResetActionButtons from 'src/components/ExportResetActionButtons'
import SearchBar from 'src/components/SearchBarComponent'
import EsignStatusFilter from 'src/components/EsignStatusFilter'
import { footerContent } from 'src/utils/footerContentPdf';
import { headerContentFix } from 'src/utils/headerContentPdfFix';

const Index = () => {
  const router = useRouter()
  const { settings } = useSettings()
  const [searchVal, setSearchVal] = useState('')
  const [tempSearchVal, setTempSearchVal] = useState('')
  const [openModal, setOpenModal] = useState(false)
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [alertData, setAlertData] = useState({ type: '', message: '', variant: 'filled' })
  const [departmentData, setDepartmentData] = useState([])
  const [eSignStatus, setESignStatus] = useState('')
  const [editData, setEditData] = useState({})
  const [sortDirection, setSortDirection] = useState('asc')
  const [departmentId, setDepartmentId] = useState('')
  const [departmentName, setDepartmentName] = useState('')
  const [isLocationRequire, setIsLocationRequire] = useState(true)
  const [errorDepartmentId, setErrorDepartmentId] = useState({ isError: false, message: '' })
  const [errorDepartmentName, setErrorDepartmentName] = useState({ isError: false, message: '' })
  const { setIsLoading } = useLoading()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(settings.rowsPerPage)
  const [designationData, setDesignationData] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [userDataPdf, setUserDataPdf] = useState()
  const { getUserData, removeAuthToken } = useAuth()
  const [config, setConfig] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [approveAPIName, setApproveAPIName] = useState('');
  const [approveAPImethod, setApproveAPImethod] = useState('');
  const [approveAPIEndPoint, setApproveAPIEndPoint] = useState('');
  const [eSignStatusId, setESignStatusId] = useState('');
  const [auditLogMark, setAuditLogMark] = useState('');
  const [esignDownloadPdf, setEsignDownloadPdf] = useState(false);
  const [openModalApprove, setOpenModalApprove] = useState(false);
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

  useEffect(() => {
    console.log("department page useEffect ....");
    getDesignations();
    let data = getUserData();
    setUserDataPdf(data);
    decodeAndSetConfig(setConfig);
    return () => { }
  }, [openModal])

  useEffect(() => {
    getDepartments()
    getDesignations()
  }, [page, rowsPerPage, eSignStatus, searchVal])

  const getDepartments = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage === -1 ? -1 : rowsPerPage,
        search: searchVal,
        esign_status: eSignStatus
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
    setESignStatus('')
    setSearchVal('')
    setTempSearchVal('')
    setPage(0)
  }
  const handleOpenModal = () => {
    setApproveAPIName("department-create");
    setApproveAPImethod("POST");
    setApproveAPIEndPoint("/api/v1/department");
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
    setDepartmentId('')
    setDepartmentName('')
    setIsLocationRequire(true)
    setErrorDepartmentId({ isError: false, message: '' })
    setErrorDepartmentName({ isError: false, message: '' })
    setEditData({})
  }
  const resetEditForm = () => {
    setDepartmentName('')
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
    setDepartmentId(item.department_id)
    setDepartmentName(item.department_name)
    setIsLocationRequire(item.is_location_required)
  }
  const handleAuthResult = async (isAuthenticated, user, isApprover, esignStatus, remarks) => {
    console.log("handleAuthResult 01", isAuthenticated, isApprover, esignStatus, user);
    console.log("handleAuthResult 02", config?.userId, user.user_id);
    const resetState = () => {
      setApproveAPIName('');
      setApproveAPImethod('');
      setApproveAPIEndPoint('');
      setAuthModalOpen(false);
    };
    const handleApprovalActions = () => {
      if (esignDownloadPdf) {
        setOpenModalApprove(true);
        console.log("esign is approved for creator to download");
        downloadPdf();
      } else {
        console.log("esign is approved for creator");
        const esign_status = "pending";
        editData?.id ? editDepartment(esign_status, remarks) : addDepartment(esign_status, remarks);
      }
    };
    const handleUnauthenticated = () => {
      setAlertData({ type: 'error', message: 'Authentication failed, Please try again.' });
      setOpenSnackbar(true);
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
        downloadPdf();
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
    setApproveAPIName("department-approve");
    setApproveAPImethod("PATCH");
    setApproveAPIEndPoint("/api/v1/department");
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
  const handleSubmitForm = async () => {
    if (editData?.id) {
      setApproveAPIName("department-update");
      setApproveAPImethod("PUT");
      setApproveAPIEndPoint("/api/v1/department");
    } else {
      setApproveAPIName("department-create");
      setApproveAPImethod("POST");
      setApproveAPIEndPoint("/api/v1/department");
    }
    if (departmentId.trim() === '' || departmentId.length > 20 || departmentName.trim() === '' || departmentName.length > 50 || !(/^[a-zA-Z0-9]+\s*$/.test(departmentId))|| !(/^[a-zA-Z0-9]+\s*(?:[a-zA-Z0-9]+\s*)*$/.test(departmentName))) {
      if (departmentId.length > 20) {
        setErrorDepartmentId({ isError: true, message: 'Department ID length should be <= 20' })
      } else if (departmentId.trim() === '') {
        setErrorDepartmentId({ isError: true, message: "Department ID can't be empty" })
      } 
      else if(!(/^[a-zA-Z0-9]+\s*$/.test(departmentId))){
        setErrorDepartmentId({ isError: true, message: "Department ID cannot contain any special symbols" 

        })
      }
      
      else {
        setErrorDepartmentId({ isError: false, message: '' })
      }
      if (departmentName.length > 50) {
        setErrorDepartmentName({ isError: true, message: 'Department name length should be <= 50' })
      } else if (departmentName.trim() === '') {
        setErrorDepartmentName({ isError: true, message: "Department name can't be empty" })
      }
      else if (!(/^[a-zA-Z0-9]+\s*(?:[a-zA-Z0-9]+\s*)*$/.test(departmentName))) {
        setErrorDepartmentName({ isError: true, message: "Department name cannot contain any special symbols" })
      }
      else {
        setErrorDepartmentName({ isError: false, message: '' })
      }
      return
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
      const data = { departmentId, departmentName, isLocationRequire }
      const auditlogRemark = remarks;
      const audit_log = config?.config?.audit_logs ? {
        "audit_log": true,
        "performed_action": "add",
        "remarks": auditlogRemark?.length > 0 ? auditlogRemark : `Department added - ${departmentId}`,
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
        setOpenSnackbar(true)
        setAlertData({ ...alertData, type: 'success', message: 'Department added successfully' })
        getDepartments()
        resetForm()
      } else {
        setOpenSnackbar(true)
        setAlertData({ ...alertData, type: 'error', message: res.data?.message })
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
      setApproveAPIName('');
      setApproveAPImethod('');
      setApproveAPIEndPoint('');
    }
  }
  const editDepartment = async (esign_status, remarks) => {
    try {
      const data = { departmentName, isLocationRequire };
      const auditlogRemark = remarks;
      let audit_log;
      if (config?.config?.audit_logs) {
        audit_log = {
          "audit_log": true,
          "performed_action": "edit",
          "remarks": auditlogRemark > 0 ? auditlogRemark : `department edited - ${departmentId}`,
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
        setOpenSnackbar(true)
        setAlertData({ ...alertData, type: 'success', message: 'Department updated successfully' })
        getDepartments()
        resetForm()
      } else {
        setOpenSnackbar(true);
        setAlertData({ ...alertData, type: 'error', message: res.data.message });
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
      setApproveAPIName('');
      setApproveAPImethod('');
      setApproveAPIEndPoint('');
    }
  }
  const closeSnackbar = () => {
    setOpenSnackbar(false)
  }
  const handleSearch = () => {
    setSearchVal(tempSearchVal.toLowerCase())
    setPage(0)
  }
  const handleTempSearchValue = e => {
    setTempSearchVal(e.target.value.toLowerCase())
  }
  const downloadPdf = () => {
    console.log('clicked on download btn')
    const doc = new jsPDF()
    const headerContent = () => {
      headerContentFix(doc, 'Department Report');

      if (searchVal) {
        doc.setFontSize(10)
        doc.text('Search : ' + `${tempSearchVal}`, 15, 25)
      } else {
        doc.setFontSize(10)
        doc.text('Search : ' + '__', 15, 25)
      }
      doc.text('Filters :\n', 15, 30)
      if (eSignStatus) {
        doc.setFontSize(10)
        doc.text('E-Sign : ' + `${eSignStatus}`, 20, 35)
      } else {
        doc.setFontSize(10)
        doc.text('E-Sign : ' + '__', 20, 35)
      }
      doc.setFontSize(12)
      doc.text('Department Data', 15, 55)
    }
    const bodyContent = () => {
      let currentPage = 1
      let dataIndex = 0
      const totalPages = Math.ceil(departmentData.length / 25)
      headerContent()
      while (dataIndex < departmentData.length) {
        if (currentPage > 1) {
          doc.addPage()
        }
        footerContent(currentPage, totalPages, userDataPdf, doc);

        const body = departmentData.slice(dataIndex, dataIndex + 25).map((item, index) => [
          dataIndex + index + 1,
          item.department_id,
          item.department_name,
          item.is_location_required,
          item.esign_status,
        ]);
        autoTable(doc, {
          startY: currentPage === 1 ? 60 : 40,
          styles: { halign: 'center' },
          headStyles: {
            fontSize: 8,
            fillColor: [80, 189, 160]
          },
          alternateRowStyles: { fillColor: [249, 250, 252] },
          tableLineColor: [80, 189, 160],
          tableLineWidth: 0.1,
          head: [['Sr.No.', 'Department Id', 'Department Name', 'Location Required', 'E-Sign']],
          body: body,
          columnWidth: 'wrap'
        })
        dataIndex += 25
        currentPage++
      }
    }

    bodyContent()
    const currentDate = new Date()
    const formattedDate = currentDate
      .toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
      .replace(/\//g, '-')
    const formattedTime = currentDate.toLocaleTimeString('en-US', { hour12: false }).replace(/:/g, '-')
    const fileName = `Department_${formattedDate}_${formattedTime}.pdf`
    doc.save(fileName)
  }
  const handleAuthModalOpen = () => {
    console.log("OPen auth model");
    setApproveAPIName("department-approve");
    setApproveAPImethod("PATCH");
    setApproveAPIEndPoint("/api/v1/department");
    setAuthModalOpen(true);
  };
  const handleDownloadPdf = () => {
    setApproveAPIName("department-create");
    setApproveAPImethod("POST");
    setApproveAPIEndPoint("/api/v1/department");
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
                <EsignStatusFilter esignStatus={eSignStatus} setEsignStatus={setESignStatus} />
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
                  openSnackbar={openSnackbar}
                  setOpenSnackbar={setOpenSnackbar}
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
      </Modal >
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
    </Box >
  )
}
export async function getServerSideProps(context) {
  return validateToken(context, 'Department Master')
}

export default ProtectedRoute(Index)