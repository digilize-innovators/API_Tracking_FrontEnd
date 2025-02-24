'use-client'
import React, { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Select from '@mui/material/Select'
import Grid2 from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import { Button, TextField, MenuItem, FormHelperText, TableContainer, Paper } from '@mui/material'
import { IoMdAdd } from 'react-icons/io'
import Modal from '@mui/material/Modal'
import TableArea from 'src/views/tables/TableArea'
import { api } from 'src/utils/Rest-API'
import ProtectedRoute from 'src/components/ProtectedRoute'
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
  const { settings } = useSettings()
  const [eSignStatus, setESignStatus] = useState('')
  const [openModal, setOpenModal] = useState(false)
  const [areaId, setAreaId] = useState('')
  const [areaName, setAreaName] = useState('')
  const [areaCategoryId, setAreaCategoryId] = useState('')
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [alertData, setAlertData] = useState({ type: '', message: '', variant: 'filled' })
  const [searchVal, setSearchVal] = useState('')
  const [errorAreaId, setErrorAreaId] = useState({ isError: false, message: '' })
  const [errorAreaName, setErrorAreaName] = useState({ isError: false, message: '' })
  const [errorAreaCategory, setErrorAreaCategory] = useState({ isError: false, message: '' })
  const [errorLocation, setErrorLocation] = useState({ isError: false, message: '' })

  const [areaData, setAreaData] = useState([])
  const [userDataPdf, setUserDataPdf] = useState()
  const { getUserData, removeAuthToken } = useAuth()
  const { setIsLoading } = useLoading()
  const [tempSearchVal, setTempSearchVal] = useState('')
  const [totalCount, setTotalCount] = useState(0)
  const [sortDirection, setSortDirection] = useState('asc')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(settings.rowsPerPage)
  const [editData, setEditData] = useState({})
  const [allAreaCategory, setAllAreaCategory] = useState([])
  const router = useRouter();
  const [config, setConfig] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [approveAPIName, setApproveAPIName] = useState('');
  const [approveAPImethod, setApproveAPImethod] = useState('');
  const [approveAPIEndPoint, setApproveAPIEndPoint] = useState('');
  const [eSignStatusId, setESignStatusId] = useState('');
  const [auditLogMark, setAuditLogMark] = useState('');
  const [esignDownloadPdf, setEsignDownloadPdf] = useState(false);
  const [openModalApprove, setOpenModalApprove] = useState(false);
  const apiAccess = useApiAccess("area-create", "area-update", "area-approve");
  const [location_uuid, setLocation_uuid] = useState('');
  const [allLocationsData, setAllLocationData] = useState([]);

  const getData = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage === -1 ? -1 : rowsPerPage,
        search: searchVal,
        esign_status: eSignStatus
      })
      const response = await api(`/area/?${params.toString()}`, {}, 'get', true)
      if (response.data.success) {
        setAreaData(response.data.data.areas)
        setTotalCount(response.data.data.total)
      }
      else {
        console.log('Error to get all areas ', response.data)
        if (response.data.code === 401) {
          removeAuthToken();
          router.push('/401');
        }
      }
    } catch (error) {
      console.log('Error in get areas ', error)
    } finally {
      setIsLoading(false)
    }
  }
  useEffect(() => {
    getData();
    getAllLocations();
  }, [eSignStatus, searchVal, page, rowsPerPage])
  useEffect(() => {
    let data = getUserData();
    setUserDataPdf(data);
    decodeAndSetConfig(setConfig);
    return () => { }
  }, [])

  const getAllAreaCategory = async () => {
    setIsLoading(true)
    try {
      const res = await api(`/area-category/`, {}, 'get', true)
      if (res.data.success) {
        setAllAreaCategory(res.data.data.areaCategories)
      } else if (res.data.code === 401) {
        removeAuthToken();
        router.push('/401');
      } else {
        console.log('Error: Unexpected response', res.data);
      }
    } catch (error) {
      console.log('Error in get area categories ', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getAllLocations = async () => {
    try {
      setIsLoading(true);
      const res = await api('/location/', {}, 'get', true);
      setIsLoading(false);
      console.log('All locations ', res.data);
      if (res.data.success) {
        setAllLocationData(res.data.data.locations);
      } else {
        console.log('Error to get all locations ', res.data);
        if (res.data.code === 401) {
          removeAuthToken();
          router.push('/401');
        }
      }
    } catch (error) {
      console.log('Error in get locations ', error);
      setIsLoading(false);
    }
  };

  const closeSnackbar = () => {
    setOpenSnackbar(false)
  }
  const handleOpenModal = () => {
    setApproveAPIName("area-create");
    setApproveAPImethod("POST");
    setApproveAPIEndPoint("/api/v1/area");
    resetForm()
    getAllAreaCategory()
    getAllLocations()
    setOpenModal(true)
  }
  const handleAuthModalClose = () => {
    setAuthModalOpen(false);
    setOpenModalApprove(false);
  };
  const handleCloseModal = () => {
    resetForm()
    setEditData({})
    setOpenModal(false)
  }
  const applyValidation = () => {
    if (areaId.length > 51) {
      setErrorAreaId({ isError: true, message: 'Area id length should be less than 51' })
    } else if (areaId.trim() === '') {
      setErrorAreaId({ isError: true, message: "Area id can't be empty" })
    } else {
      setErrorAreaId({ isError: false, message: '' })
    }
    if (areaName.length > 256) {
      setErrorAreaName({ isError: true, message: 'Area name length should be less than 256' })
    } else if (areaName.trim() === '') {
      setErrorAreaName({ isError: true, message: "Area name can't be empty" })
    }
    else if (!(/^[a-zA-Z0-9]+\s*(?:[a-zA-Z0-9]+\s*)*$/.test(areaName))) {
      setErrorAreaName({ isError: true, message: "Area name cannot contain any special symbols" })
    }
    else {
      setErrorAreaName({ isError: false, message: '' })
    }
    if (areaCategoryId.trim() === '') {
      setErrorAreaCategory({ isError: true, message: 'Select area category' })
    } else {
      setErrorAreaCategory({ isError: false, message: '' })
    }
    if (location_uuid.trim() === '') {
      setErrorLocation({ isError: true, message: 'Select location' })
    }
    else {
      setErrorLocation({ isError: false, message: '' })
    }
  }
  const checkValidate = () => {
    return areaId.trim() !== '' && areaId.length <= 51 && areaName.trim() !== '' && areaName.length <= 256 && areaCategoryId !== '' && location_uuid.trim() != '' && /^[a-zA-Z0-9]+\s*(?:[a-zA-Z0-9]+\s*)*$/.test(areaName);
  };
  const resetForm = () => {
    setAreaId('')
    setAreaName('')
    setAreaCategoryId('')
    setLocation_uuid('')
    setErrorAreaId({ isError: false, message: '' })
    setErrorAreaName({ isError: false, message: '' })
    setErrorLocation({ isError: false, message: '' })
    setErrorAreaCategory({ isError: false, message: '' })
  }
  const resetEditForm = () => {
    setAreaName('')
    setAreaCategoryId('')
    setLocation_uuid('')
    setErrorAreaName({ isError: false, message: '' })
    setEditData(prev => ({
      ...prev,
      area_name: '',
      area_category_id: '',
      area_id: ''
    }))
  }
  const handleSubmitForm = async () => {
    if (editData?.id) {
      setApproveAPIName("area-update");
      setApproveAPImethod("PUT");
      setApproveAPIEndPoint("/api/v1/area");
    } else {
      setApproveAPIName("area-create");
      setApproveAPImethod("POST");
      setApproveAPIEndPoint("/api/v1/area");
    }
    applyValidation()
    const validate = checkValidate()
    if (!validate) {
      return true
    }
    if (config?.config?.esign_status) {
      setAuthModalOpen(true);
      return;
    }
    const esign_status = "approved";
    editData?.area_id ? editArea() : addArea(esign_status)
  }
  const addArea = async (esign_status, remarks) => {
    try {
      const data = { areaId, areaName, areaCategoryId, location_uuid };
      const auditlogRemark = remarks;
      const audit_log = config?.config?.audit_logs ? {
        "audit_log": true,
        "performed_action": "add",
        "remarks": auditlogRemark?.length > 0 ? auditlogRemark : `area added - ${areaName}`,
      } : {
        "audit_log": false,
        "performed_action": "none",
        "remarks": `none`,
      };
      data.audit_log = audit_log;
      data.esign_status = esign_status;
      setIsLoading(true)
      console.log("add area", data)
      const res = await api('/area/', data, 'post', true)
      if (res?.data?.success) {
        setOpenSnackbar(true)
        setAlertData({ ...alertData, type: 'success', message: 'Area added successfully' })
        getData()
        resetForm()
      } else {
        setOpenSnackbar(true)
        setAlertData({ ...alertData, type: 'error', message: res.data?.message });
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
  const editArea = async (esign_status, remarks) => {
    try {
      const data = { areaName, areaCategoryId, location_uuid };
      const auditlogRemark = remarks;
      let audit_log;
      if (config?.config?.audit_logs) {
        audit_log = {
          "audit_log": true,
          "performed_action": "edit",
          "remarks": auditlogRemark > 0 ? auditlogRemark : `area edited - ${areaName}`,
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
      const res = await api(`/area/${editData.id}`, data, 'put', true)
      if (res.data.success) {
        setOpenSnackbar(true)
        setAlertData({ ...alertData, type: 'success', message: 'Area updated successfully' })
        resetForm()
        getData()
      }
      else {
        setOpenSnackbar(true)
        setAlertData({ ...alertData, type: 'error', message: res.data.message })
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
  const handleAuthResult = async (isAuthenticated, user, isApprover, esignStatus, remarks) => {
    console.log("handleAuthResult 01", isAuthenticated, isApprover, esignStatus, user);
    console.log("handleAuthResult 02", config.userId, user.user_id);
    const resetState = () => {
      setApproveAPIName('');
      setApproveAPImethod('');
      setApproveAPIEndPoint('');
      setAuthModalOpen(false);
    };
    if (!isAuthenticated) {
      setAlertData({ type: 'error', message: 'Authentication failed, Please try again.' });
      setOpenSnackbar(true);
      return;
    }
    const handleEsignApproved = () => {
      if (esignDownloadPdf) {
        console.log("esign is approved for download.");
        setOpenModalApprove(true);
        downloadPdf();
      } else {
        console.log("esign is approved for creator.");
        const esign_status = "pending";
        editData?.id ? editArea(esign_status, remarks) : addArea(esign_status, remarks);
      }
    };
    const handleApproverActions = async () => {
      const data = {
        modelName: "area",
        esignStatus: esignStatus,
        id: eSignStatusId,
        audit_log: config?.config?.audit_logs ? {
          "user_id": user.userId,
          "user_name": user.userName,
          "performed_action": 'approved',
          "remarks": remarks.length > 0 ? remarks : `area approved - ${auditLogMark}`,
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
    if (isApprover) {
      await handleApproverActions();
    } else if (esignStatus === "rejected") {
      console.log("esign is rejected.");
      setAuthModalOpen(false);
      setOpenModalApprove(false);
    } else if (esignStatus === "approved") {
      handleEsignApproved();
    }
    resetState();
    getData();
  };
  const handleAuthCheck = async (row) => {
    console.log("handleAuthCheck", row)
    setApproveAPIName("area-approve");
    setApproveAPImethod("PATCH");
    setApproveAPIEndPoint("/api/v1/area");
    setAuthModalOpen(true);
    setESignStatusId(row.id);
    setAuditLogMark(row.area_name)
    console.log("row", row)
  }
  const handleSearch = () => {
    setSearchVal(tempSearchVal.toLowerCase())
    setPage(0)
  }
  const handleTempSearchValue = e => {
    setTempSearchVal(e.target.value.toLowerCase())
  }
  const handleUpdate = item => {
    resetForm()
    getAllAreaCategory()
    getAllLocations()
    setOpenModal(true)
    setEditData(item)
    setAreaId(item.area_id)
    setAreaName(item.area_name)
    setAreaCategoryId(item.area_category_id)
    setLocation_uuid(item.location_uuid)
  }
  const handleSort = (key) => {
    const newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    const sorted = [...areaData].sort((a, b) => {
      if (a[key] > b[key]) {
        return newSortDirection === 'asc' ? 1 : -1;
      }
      if (a[key] < b[key]) {
        return newSortDirection === 'asc' ? -1 : 1;
      }
      return 0;
    });
    setAreaData(sorted);
    setSortDirection(newSortDirection);
  };
  const handleSortByName = () => handleSort('area_name');
  const handleSortByAreaCateName = () => handleSort('area_category_name');
  const handleSortByID = () => handleSort('area_id');
  const resetFilter = () => {
    setESignStatus('')
    setSearchVal('')
    setTempSearchVal('')
  }
  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }
  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }
  const handleAuthModalOpen = () => {
    console.log("OPen auth model");
    setApproveAPIName("area-approve");
    setApproveAPImethod("PATCH");
    setApproveAPIEndPoint("/api/v1/area");
    setAuthModalOpen(true);
  };
  const handleDownloadPdf = () => {
    setApproveAPIName("area-create");
    setApproveAPImethod("POST");
    setApproveAPIEndPoint("/api/v1/area");
    if (config?.config?.esign_status) {
      console.log("Esign enabled for download pdf");
      setEsignDownloadPdf(true);
      setAuthModalOpen(true);
      return;
    }
    downloadPdf();
  }
  const downloadPdf = () => {
    console.log('clicked on download btn')
    const doc = new jsPDF()
    const headerContent = () => {
      headerContentFix(doc, 'Area Master Report');

      if (searchVal) {
        doc.setFontSize(10)
        doc.text('Search : ' + `${tempSearchVal}`, 15, 25)
      } else {
        doc.setFontSize(10)
        doc.text('Search' + '__', 15, 25)
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
      doc.text('Area Master Data', 15, 55)
    }

    const bodyContent = () => {
      let currentPage = 1
      let dataIndex = 0
      const totalPages = Math.ceil(areaData.length / 25)
      headerContent()
      while (dataIndex < areaData.length) {
        if (currentPage > 1) {
          doc.addPage()
        }

        footerContent(currentPage, totalPages, userDataPdf, doc);

        const body = areaData
          .slice(dataIndex, dataIndex + 25)
          .map((item, index) => [dataIndex + index + 1, item.area_id, item.area_name, item.area_category?.area_category_name, item.esign_status]);
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
          head: [['Sr.No.', 'Id', 'Name', 'Area Category', 'E-Sign']],
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
    const fileName = `Area_${formattedDate}_${formattedTime}.pdf`
    doc.save(fileName)
  }
  return (
    <Box padding={4}>
      <Head>
        <title>Area Master</title>
      </Head>
      <Grid2 item xs={12}>
        <Typography variant='h2' >Area Master</Typography>
      </Grid2>
      <Grid2 item xs={12}>
        <Grid2 item xs={12} >
          <Box sx={{ backgroundColor: settings.mode === 'dark' ? '#212121' : 'white', borderRadius: 1 }}>
            <Typography variant='h4' className='mx-4 my-2 mx-2' sx={{ paddingTop: '1%' }}>
              Filter
            </Typography>
            <Grid2 item xs={12} >
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
                        <Button variant='contained' className='py-2' onClick={handleOpenModal}>
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
              <Typography variant='h4' className='mx-4 my-2 mt-3'>
                Area Data
              </Typography>
              <TableContainer component={Paper}>
                <TableArea
                  areaData={areaData}
                  handleUpdate={handleUpdate}
                  handleSortByID={handleSortByID}
                  handleSortByName={handleSortByName}
                  handleSortByAreaCateName={handleSortByAreaCateName}
                  sortDirection={sortDirection}
                  page={page}
                  rowsPerPage={rowsPerPage}
                  totalRecords={totalCount}
                  handleChangePage={handleChangePage}
                  handleChangeRowsPerPage={handleChangeRowsPerPage}
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
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
      >
        <Box sx={style}>
          <Typography variant='h4' className='my-2'>
            {editData?.id ? 'Edit Area' : 'Add Area'}
          </Typography>
          <Grid2 container spacing={2}>
            <Grid2 size={6}>
              <TextField
                fullWidth
                id='outlined-controlled'
                label='Area ID'
                placeholder='Area ID'
                value={areaId}
                onChange={e => {
                  setAreaId(e.target.value)
                  e.target.value && setErrorAreaId({ isError: false, message: '' })
                }}
                required
                error={errorAreaId.isError}
                disabled={!!editData?.id}
              />
            </Grid2>
            <Grid2 size={6}>
              <TextField
                fullWidth
                id='outlined-controlled'
                label='Area Name'
                placeholder='Area Name'
                value={areaName}
                onChange={e => {
                  setAreaName(e.target.value)
                  e.target.value && setErrorAreaName({ isError: false, message: '' })
                }}
                required
                error={errorAreaName.isError}
              />
            </Grid2>
          </Grid2>
          <Grid2 container spacing={2} >
            <Grid2 size={6} sx={{ padding: "0.5rem 1rem" }}>
              <FormHelperText error={errorAreaId.isError}>
                {errorAreaId.isError ? errorAreaId.message : ''}
              </FormHelperText>
            </Grid2>
            <Grid2 size={6} sx={{ padding: "0.5rem 1rem" }}>
              <FormHelperText error={errorAreaName.isError}>
                {errorAreaName.isError ? errorAreaName.message : ''}
              </FormHelperText>
            </Grid2>
          </Grid2>

          <Grid2 container spacing={2}>
            <Grid2 size={6}>
              <FormControl
                fullWidth
                required
                error={errorAreaCategory.isError}>
                <InputLabel id='label-area-category'>Area Category</InputLabel>
                <Select
                  labelId='label-area-category'
                  id='area-category'
                  label='Area-category *'
                  value={areaCategoryId}
                  onChange={e => {
                    setAreaCategoryId(e.target.value)
                    setErrorAreaCategory({ isError: false, message: '' })
                  }}
                >
                  {allAreaCategory?.map(item => (
                    <MenuItem key={item.id} value={item.id} selected={areaCategoryId === item.id}>
                      {item.area_category_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid2>
            <Grid2 size={6}>
              <FormControl
                fullWidth
                required
                error={errorAreaCategory.isError}>
                <InputLabel id='label-location'>Location</InputLabel>
                <Select
                  labelId='label-location'
                  id='location'
                  label='Location *'
                  value={location_uuid}
                  onChange={e => {
                    setLocation_uuid(e.target.value)
                    setErrorLocation({ isError: false, message: '' })

                  }}
                >
                  {allLocationsData?.map(item => (
                    <MenuItem key={item.id} value={item.id} selected={location_uuid === item.id}>
                      {item.location_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid2>
          </Grid2>
          <Grid2 container spacing={2}>
            <Grid2 size={6}>
              <FormHelperText sx={{ padding: "0.5rem 1rem" }} error={errorAreaCategory.isError}>
                {errorAreaCategory.isError ? errorAreaCategory.message : ''}
              </FormHelperText>
            </Grid2>
            <Grid2 size={6} sx={{ padding: "0.5rem 1rem" }}>
              <FormHelperText error={errorLocation.isError}>
                {/* {console.log(errorLocation)} */}
                {errorLocation.isError ? errorLocation.message : ''}
              </FormHelperText>
            </Grid2>
          </Grid2>

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
  return validateToken(context, 'Area Master')
}
export default ProtectedRoute(Index)