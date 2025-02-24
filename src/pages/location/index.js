'use-client'
import React, { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Grid2 from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import { Button, TextField, TableContainer, FormHelperText, Paper } from '@mui/material'
import { IoMdAdd } from 'react-icons/io'
import Modal from '@mui/material/Modal'
import TableCollapsiblelocation from 'src/views/tables/TableCollapsiblelocation'
import { api } from 'src/utils/Rest-API'
import ProtectedRoute from 'src/components/ProtectedRoute'
import SnackbarAlert from 'src/components/SnackbarAlert'
import { useLoading } from 'src/@core/hooks/useLoading'
import { useAuth } from 'src/Context/AuthContext'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Head from 'next/head'
import { useSettings } from 'src/@core/hooks/useSettings'
import { useRouter } from 'next/router'
import AuthModal from 'src/components/authModal'
import ChatbotComponent from 'src/components/ChatbotComponent'
import AccessibilitySettings from 'src/components/AccessibilitySettings'
import { style } from 'src/configs/generalConfig';
import { decodeAndSetConfig } from '../../utils/tokenUtils';
import { useApiAccess } from 'src/@core/hooks/useApiAccess';
import ExportResetActionButtons from 'src/components/ExportResetActionButtons'
import SearchBar from 'src/components/SearchBarComponent'
import EsignStatusFilter from 'src/components/EsignStatusFilter'
import { footerContent } from 'src/utils/footerContentPdf';
import { headerContentFix } from 'src/utils/headerContentPdfFix';
import { validateToken } from 'src/utils/ValidateToken'

const Index = () => {
  const router = useRouter()
  const { settings } = useSettings()
  const [eSignStatus, setESignStatus] = useState('')
  const [tempSearchVal, setTempSearchVal] = useState('')
  const [openModal, setOpenModal] = useState(false)
  const [locationId, setLocationId] = useState('')
  const [locationName, setLocationName] = useState('')
  const [mfgLicenceNo, setMfgLicenceNo] = useState('')
  const [mfgName, setMfgName] = useState('')
  const [address, setAddress] = useState('')
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [alertData, setAlertData] = useState({ type: '', message: '', variant: 'filled' })
  const [searchVal, setSearchVal] = useState('')
  const [errorLocationId, setErrorLocationId] = useState({ isError: false, message: '' })
  const [errorLocationName, setErrorLocationName] = useState({ isError: false, message: '' })
  const [errorMfgLicNo, setErrorMfgLicNo] = useState({ isError: false, message: '' })
  const [errorMfgName, setErrorMfgName] = useState({ isError: false, message: '' })
  const [errorAddress, setErrorAddress] = useState({ isError: false, message: '' })
  const [locationData, setLocationData] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [sortDirection, setSortDirection] = useState('asc')
  const [sortBy, setSortBy] = useState('location_id')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(settings.rowsPerPage)
  const { setIsLoading } = useLoading()
  const [editData, setEditData] = useState({})
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
  const apiAccess = useApiAccess(
    "location-create",
    "location-update",
    "location-approve");

  useEffect(() => {
    let data = getUserData();
    setUserDataPdf(data);
    decodeAndSetConfig(setConfig);
    return () => { }
  }, [])

  useEffect(() => {
    getData()
  }, [eSignStatus, searchVal, page, rowsPerPage])

  const getData = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage === -1 ? -1 : rowsPerPage,
        search: searchVal,
        esign_status: eSignStatus
      })
      console.log(params.toString())
      const response = await api(`/location/?${params.toString()}`, {}, 'get', true)
      console.log('Location data res ', response.data)
      if (response.data.success) {
        setLocationData(response.data.data.locations)
        setTotalCount(response.data.data.total)
      } else {
        console.log('Error to get all locations ', response.data)
        if (response.data.code === 401) {
          removeAuthToken();
          router.push('/401');
        }
      }
    } catch (error) {
      console.log(error)
      console.log('Error in get locations ', error)
    } finally {
      setIsLoading(false)
    }
  }

  const closeSnackbar = () => {
    setOpenSnackbar(false)
  }
  const handleOpenModal = () => {
    setApproveAPIName("location-create");
    setApproveAPImethod("POST");
    setApproveAPIEndPoint("/api/v1/location");
    resetForm()
    setOpenModal(true)
  }
  const handleCloseModal = () => {
    resetForm()
    setEditData({})
    setOpenModal(false)
  }
  const applyValidation = () => {
    if (locationId.length > 51) {
      setErrorLocationId({ isError: true, message: 'Location id length should be less than 51' })
    } else if (locationId.trim() === '') {
      setErrorLocationId({ isError: true, message: "Location id can't be empty" })
    } 
    
    else if (!(/^[a-zA-Z0-9]+\s*$/.test(locationId))) {
      setErrorLocationId({ isError: true, message: "Location ID cannot contain any special symbols" })
    }
    
    else {
      setErrorLocationId({ isError: false, message: '' })
    }
    if (locationName.length > 256) {
      setErrorLocationName({ isError: true, message: 'Location name length should be less than 256' })
    }
    else if (!(/^[a-zA-Z0-9]+\s*(?:[a-zA-Z0-9]+\s*)*$/.test(locationName))) {
      setErrorLocationName({ isError: true, message: "Location Name is not accept only number and special symbols" })
    }
    else if (locationName.trim() === '') {
      setErrorLocationName({ isError: true, message: "Location Name can't be empty" })
    } else {
      setErrorLocationName({ isError: false, message: '' })
    }
    if (mfgLicenceNo.length > 256) {
      setErrorMfgLicNo({ isError: true, message: 'Mfg licence no length should be less than 256' })
    } else if (mfgLicenceNo.trim() === '') {
      setErrorMfgLicNo({ isError: true, message: "Mfg licence no can't be empty" })
    } else {
      setErrorMfgLicNo({ isError: false, message: '' })
    }
    if (mfgName.length > 266) {
      setErrorMfgName({ isError: true, message: 'Mfg name length should be less than 255' })
    } else {
      setErrorMfgName({ isError: false, message: '' })
    }
    if (address.length > 151) {
      setErrorAddress({ isError: true, message: 'Address length should be less than 151' })
    } else {
      setErrorAddress({ isError: false, message: '' })
    }
  }
  const checkValidate = () => {
    return !(
      locationId === '' ||
      !(/^[a-zA-Z0-9]+\s*$/.test(locationId))
      ||
      !(/^[a-zA-Z0-9]+\s*(?:[a-zA-Z0-9]+\s*)*$/.test(locationName)) ||
      locationId.length > 51 ||
      locationName.trim() === '' ||
      locationName.length > 256 ||
      mfgLicenceNo.trim() === '' ||
      mfgLicenceNo.length > 256 ||
      mfgName.length > 266 ||
      address.length > 150
    );
  };
  const handleAuthModalClose = () => {
    setAuthModalOpen(false);
    setOpenModalApprove(false);
  };
  const resetForm = () => {
    setLocationId('')
    setLocationName('')
    setMfgLicenceNo('')
    setMfgName('')
    setAddress('')
    setErrorLocationId({ isError: false, message: '' })
    setErrorLocationName({ isError: false, message: '' })
    setErrorMfgLicNo({ isError: false, message: '' })
    setErrorMfgName({ isError: false, message: '' })
    setErrorAddress({ isError: false, message: '' })
  }
  const resetEditForm = () => {
    setLocationName('')
    setMfgLicenceNo('')
    setMfgName('')
    setAddress('')
    setErrorLocationName({ isError: false, message: '' })
    setErrorMfgLicNo({ isError: false, message: '' })
    setErrorMfgName({ isError: false, message: '' })
    setErrorAddress({ isError: false, message: '' })
  }
  const handleSubmitForm = async () => {
    if (editData?.location_id) {
      setApproveAPIName("location-update");
      setApproveAPImethod("PUT");
      setApproveAPIEndPoint("/api/v1/location");
    } else {
      setApproveAPIName("location-create");
      setApproveAPImethod("POST");
      setApproveAPIEndPoint("/api/v1/location");
    }
    applyValidation();
    const validate = checkValidate();
    console.log('validation', !validate)
    if (!validate) {
      return;
    }
    if (config?.config?.esign_status) {
      setAuthModalOpen(true);
      return;
    }
    const esign_status = "approved";
    editData?.location_id ? editLocation() : addLocation(esign_status);
  };
  const handleAuthResult = async (isAuthenticated, user, isApprover, esignStatus, remarks) => {
    console.log("handleAuthResult 01", isAuthenticated, isApprover, esignStatus, user);
    console.log("handleAuthResult 02", config?.userId, user.user_id);
    const resetState = () => {
      setApproveAPIName('');
      setApproveAPImethod('');
      setApproveAPIEndPoint('');
      setAuthModalOpen(false);
    };
    const handleUnauthenticated = () => {
      setAlertData({ type: 'error', message: 'Authentication failed, Please try again.' });
      setOpenSnackbar(true);
      resetState();
    };
    const handleModalActions = (isApproved) => {
      setOpenModalApprove(!isApproved);
      if (isApproved && esignDownloadPdf) {
        console.log("esign is approved for download");
        downloadPdf();
      }
    };
    const createAuditLog = (action) => config?.config?.audit_logs ? {
      "user_id": user.userId,
      "user_name": user.userName,
      "performed_action": action,
      "remarks": remarks?.length > 0 ? remarks : `location ${action} - ${auditLogMark}`,
    } : {};
    const handleUpdateStatus = async () => {
      const data = {
        modelName: "location",
        esignStatus,
        id: eSignStatusId,
        audit_log: createAuditLog(esignStatus),
      };
      const res = await api('/esign-status/update-esign-status', data, 'patch', true);
      console.log("esign status update", res?.data);
    };
    const processApproverActions = async () => {
      if (esignStatus === "approved" || esignStatus === "rejected") {
        handleModalActions(esignStatus === "approved");
        if (esignStatus === "approved" && esignDownloadPdf) {
          resetState();
          return;
        }
      }
      await handleUpdateStatus();
      resetState();
    };
    const processNonApproverActions = () => {
      if (esignStatus === "rejected") {
        resetState();
        return;
      }
      if (esignStatus === "approved") {
        handleModalActions(true);
        if (!esignDownloadPdf) {
          console.log("esign is approved for creator");
          const esign_status = "pending";
          editData?.id ? editLocation(esign_status, remarks) : addLocation(esign_status, remarks);
        }
      }
    };
    // Main logic flow
    if (!isAuthenticated) {
      handleUnauthenticated();
      return;
    }
    if (isApprover) {
      await processApproverActions();
      return;
    }
    processNonApproverActions();
    resetState();
    getData();
  };
  const handleAuthCheck = async (row) => {
    console.log("handleAuthCheck", row)
    setApproveAPIName("location-approve");
    setApproveAPImethod("PATCH");
    setApproveAPIEndPoint("/api/v1/location");
    setAuthModalOpen(true);
    setESignStatusId(row.id);
    setAuditLogMark(row.location_id)
  }
  const addLocation = async (esign_status, remarks) => {
    try {
      const data = { locationId, locationName, mfgLicenceNo, mfgName, address }

      const auditlogRemark = remarks
      const audit_log = config?.config?.audit_logs ? {
        "audit_log": true,
        "performed_action": "add",
        "remarks": auditlogRemark?.length > 0 ? auditlogRemark : `location added - ${locationName}`,
      } : {
        "audit_log": false,
        "performed_action": "none",
        "remarks": `none`,
      };
      data.audit_log = audit_log;
      data.esign_status = esign_status;
      setIsLoading(true)
      const res = await api('/location/', data, 'post', true)
      setIsLoading(false)

      if (res?.data?.success) {
        setOpenSnackbar(true)
        setAlertData({ ...alertData, type: 'success', message: 'Location added successfully' })
        getData()
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
      console.log("Error in add locaiton ", error);
      router.push('/500');
    } finally {
      setApproveAPIName('')
      setApproveAPImethod('')
      setApproveAPIEndPoint('')
      setOpenModal(false)
      setIsLoading(false)
    }
  }
  const editLocation = async (esign_status, remarks) => {
    try {
      const data = { locationName, mfgLicenceNo, mfgName, address }
      const auditlogRemark = remarks
      let audit_log;
      if (config?.config?.audit_logs) {
        audit_log = {
          "audit_log": true,
          "performed_action": "edit",
          "remarks": auditlogRemark?.length > 0 ? auditlogRemark : `location edited - ${locationName}`,
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
      const res = await api(`/location/${editData.id}`, data, 'put', true)
      setIsLoading(false)
      if (res.data.success) {
        setOpenSnackbar(true)
        setAlertData({ ...alertData, type: 'success', message: 'Location updated successfully' })
        resetForm()
        scrollTo({ top: 0, left: 0, behavior: 'smooth' })
        getData()
      } else {
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
      setOpenModal(false)
      setIsLoading(false)
    }
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
    setOpenModal(true)
    setEditData(item)
    setLocationId(item.location_id)
    setLocationName(item.location_name)
    setMfgLicenceNo(item.mfg_licence_no)
    setMfgName(item.mfg_name)
    setAddress(item.address)
  }
  const handleSortByName = () => {
    const newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc'
    const sorted = [...locationData].sort((a, b) => {
      if (a.location_name > b.location_name) {
        return newSortDirection === 'asc' ? 1 : -1
      }
      if (a.location_name < b.location_name) {
        return newSortDirection === 'asc' ? -1 : 1
      }
      return 0
    })
    setLocationData(sorted)
    setSortDirection(newSortDirection)
  }
  const handleSortByMfgName = () => {
    const newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc'
    const sorted = [...locationData].sort((a, b) => {
      if (a.mfg_name > b.mfg_name) {
        return newSortDirection === 'asc' ? 1 : -1
      }
      if (a.mfg_name < b.mfg_name) {
        return newSortDirection === 'asc' ? -1 : 1
      }
      return 0
    })
    setLocationData(sorted)
    setSortDirection(newSortDirection)
  }
  const handleSortByMfgLicNo = () => {
    const newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc'
    const sorted = [...locationData].sort((a, b) => {
      if (a.mfg_licence_no > b.mfg_licence_no) {
        return newSortDirection === 'asc' ? 1 : -1
      }
      if (a.mfg_licence_no < b.mfg_licence_no) {
        return newSortDirection === 'asc' ? -1 : 1
      }
      return 0
    })
    setLocationData(sorted)
    setSortDirection(newSortDirection)
  }
  const handleSortByAddress = () => {
    const newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc'
    const sorted = [...locationData].sort((a, b) => {
      if (a.address > b.address) {
        return newSortDirection === 'asc' ? 1 : -1
      }
      if (a.address < b.address) {
        return newSortDirection === 'asc' ? -1 : 1
      }
      return 0
    })
    setLocationData(sorted)
    setSortDirection(newSortDirection)
  }
  const handleSortByID = () => {
    const newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc'
    const sorted = [...locationData].sort((a, b) => {
      if (a.location_id > b.location_id) {
        return newSortDirection === 'asc' ? 1 : -1
      }
      if (a.location_id < b.location_id) {
        return newSortDirection === 'asc' ? -1 : 1
      }
      return 0
    })
    setLocationData(sorted)
    setSortDirection(newSortDirection)
  }
  const handleSort = property => {
    const isAsc = sortBy === property && sortDirection === 'asc'
    setSortDirection(isAsc ? 'desc' : 'asc')
    setSortBy(property)
  }
  const resetFilter = () => {
    setESignStatus('')
    setSearchVal('')
    setTempSearchVal('')
  }
  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }
  const handleChangeRowsPerPage = event => {
    const newRowsPerPage = parseInt(event.target.value, 10)
    setRowsPerPage(newRowsPerPage)
    setPage(0)
  }
  const downloadPdf = () => {
    console.log('clicked on download btn')
    const doc = new jsPDF()
    const headerContent = () => {
      headerContentFix(doc, 'Location Master Report');

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
      doc.text('Location Data', 15, 55)
    }
    const bodyContent = () => {
      let currentPage = 1
      let dataIndex = 0
      const totalPages = Math.ceil(locationData.length / 25)
      headerContent()
      while (dataIndex < locationData.length) {
        if (currentPage > 1) {
          doc.addPage()
        }
        footerContent(currentPage, totalPages, userDataPdf, doc);

        const body = locationData
          .slice(dataIndex, dataIndex + 25)
          .map((item, index) => [
            dataIndex + index + 1,
            item.location_id,
            item.location_name,
            item.mfg_licence_no,
            item.mfg_name,
            item.address,
            item.esign_status
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
          head: [['Sr.No.', 'Id', 'Name', 'Mfg.Licence No.', 'Mfg Name', 'Address', 'E-Sign']],
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
    const fileName = `Location_${formattedDate}_${formattedTime}.pdf`
    doc.save(fileName)
  }
  const handleAuthModalOpen = () => {
    console.log("OPen auth model");
    setApproveAPIName("location-approve");
    setApproveAPImethod("PATCH");
    setApproveAPIEndPoint("/api/v1/location");
    setAuthModalOpen(true);
  };
  const handleDownloadPdf = () => {
    setApproveAPIName("location-create");
    setApproveAPImethod("POST");
    setApproveAPIEndPoint("/api/v1/location");
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
        <title>Location Master</title>
      </Head>
      <Grid2 item xs={12}>
        <Typography variant='h2'>Location Master</Typography>
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
                          <Button variant='contained' className='py-2' onClick={handleOpenModal} role="button">
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
            </Grid2>
            <Grid2 item xs={12}>
              <Typography variant='h4' className='mx-4 mt-3'>
                Location Data
              </Typography>
              <TableContainer component={Paper}>
                <TableCollapsiblelocation
                  locationData={locationData}
                  handleUpdate={handleUpdate}
                  handleSortByName={handleSortByName}
                  handleSortByMfgName={handleSortByMfgName}
                  handleSortByMfgLicNo={handleSortByMfgLicNo}
                  handleSortByAddress={handleSortByAddress}
                  handleSortByID={handleSortByID}
                  sortDirection={sortDirection}
                  page={page}
                  rowsPerPage={rowsPerPage}
                  totalRecords={totalCount}
                  handleChangePage={handleChangePage}
                  handleChangeRowsPerPage={handleChangeRowsPerPage}
                  handleSort={handleSort}
                  sortBy={sortBy}
                  apiAccess={apiAccess}
                  handleAuthCheck={handleAuthCheck}
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
        data-testid="modal"
        role='dialog'
      >
        <Box sx={style}>
          <Typography variant='h4' className='my-2'>
            {editData?.location_id ? 'Edit Location' : 'Add Location'}
          </Typography>
          <Grid2 container spacing={2}>
            <Grid2 size={6}>
              <TextField
                fullWidth
                id='outlined-controlled'
                label='Location ID'
                placeholder='Location ID'
                value={locationId}
                onChange={e => {
                  setLocationId(e.target.value)
                  e.target.value && setErrorLocationId({ isError: false, message: '' })
                }}
                required={true}
                error={errorLocationId.isError}
                disabled={!!editData?.location_id}
              />
            </Grid2>
            <Grid2 size={6}>
              <TextField
                fullWidth
                id='outlined-controlled'
                label='Location Name'
                placeholder='Location Name'
                value={locationName}
                onChange={e => {
                  setLocationName(e.target.value)
                  e.target.value && setErrorLocationName({ isError: false, message: '' })
                }}
                required={true}
                error={errorLocationName.isError}
              />
            </Grid2>
          </Grid2>
          <Grid2 container>
            <Grid2 size={6} >
              <FormHelperText sx={{ padding: "0.5rem 1rem" }} error={errorLocationId.isError}>
                {errorLocationId.isError ? errorLocationId.message : ''}
              </FormHelperText>
            </Grid2>
            <Grid2 size={6} >
              <FormHelperText sx={{ padding: "0.5rem 1rem" }} error={errorLocationName.isError} >
                {errorLocationName.isError ? errorLocationName.message : ''}
              </FormHelperText>
            </Grid2>
          </Grid2>
          <Grid2 container spacing={2}>
            <Grid2 size={6}>
              <TextField
                fullWidth
                id='outlined-controlled'
                label='Mfg Lic No.'
                placeholder='Mfg Lic No.'
                value={mfgLicenceNo}
                onChange={e => {
                  setMfgLicenceNo(e.target.value)
                  e.target.value && setErrorMfgLicNo({ isError: false, message: '' })
                }}
                required={true}
                error={errorMfgLicNo.isError}
              />
            </Grid2>
            <Grid2 size={6}>
              <TextField
                fullWidth
                id='outlined-controlled'
                label='Mfg Name'
                placeholder='Mfg Name'
                value={mfgName}
                onChange={e => setMfgName(e.target.value)}
                error={errorMfgName.isError}
              />
            </Grid2>
          </Grid2>
          <Grid2 container spacing={6}>
            <Grid2 size={6} >
              <FormHelperText sx={{ padding: "0.5rem 1rem" }} error={errorMfgLicNo.isError}>
                {errorMfgLicNo.isError ? errorMfgLicNo.message : ''}
              </FormHelperText>
            </Grid2>
            <Grid2 size={6} >
              <FormHelperText error={errorMfgName.isError} >
                {errorMfgName.isError ? errorMfgName.message : ''}
              </FormHelperText>
            </Grid2>
          </Grid2>
          <Grid2 container spacing={2}>
            <Grid2 size={6}>
              <TextField
                fullWidth
                id='outlined-controlled'
                label='Address'
                placeholder='Address'
                value={address}
                onChange={e => setAddress(e.target.value)}
                error={errorAddress.isError}
              />
            </Grid2>
            <Grid2 size={6} >
              <FormHelperText sx={{ padding: "0.5rem 1rem" }} error={errorAddress.isError}>
                {errorAddress.isError ? errorAddress.message : ''}
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
  return validateToken(context, "Location Master")
}

export default ProtectedRoute(Index)