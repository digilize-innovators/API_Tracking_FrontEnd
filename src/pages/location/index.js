'use-client'
import React, { useState, useEffect, useLayoutEffect, useMemo } from 'react'
import { Box, Grid2, Typography, Button, TableContainer, Paper } from '@mui/material'
import { IoMdAdd } from 'react-icons/io'
import TableCollapsiblelocation from 'src/views/tables/TableCollapsiblelocation'
import { api } from 'src/utils/Rest-API'
import ProtectedRoute from 'src/components/ProtectedRoute'
import SnackbarAlert from 'src/components/SnackbarAlert'
import { useLoading } from 'src/@core/hooks/useLoading'
import { useAuth } from 'src/Context/AuthContext'
import Head from 'next/head'
import { useSettings } from 'src/@core/hooks/useSettings'
import { useRouter } from 'next/router'
import AuthModal from 'src/components/authModal'
import ChatbotComponent from 'src/components/ChatbotComponent'
import AccessibilitySettings from 'src/components/AccessibilitySettings'
import { getTokenValues } from 'src/utils/tokenUtils';
import { useApiAccess } from 'src/@core/hooks/useApiAccess';
import ExportResetActionButtons from 'src/components/ExportResetActionButtons'

import { validateToken } from 'src/utils/ValidateToken'
import LocationModal from 'src/components/Modal/LocationModal'
import CustomSearchBar from 'src/components/CustomSearchBar'
import EsignStatusDropdown from 'src/components/EsignStatusDropdown'
import downloadPdf from 'src/utils/DownloadPdf'


const Index = () => {
  const router = useRouter()
  const { settings } = useSettings()
 
  const [openModal, setOpenModal] = useState(false)
  const [alertData, setAlertData] = useState({openSnackbar:false, type: '', message: '', variant: 'filled' })
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
 const [approveAPI,setApproveAPI]=useState({ approveAPIName:'',approveAPImethod:'',approveAPIEndPoint:''})
  const [eSignStatusId, setESignStatusId] = useState('');
  const [auditLogMark, setAuditLogMark] = useState('');
  const [esignDownloadPdf, setEsignDownloadPdf] = useState(false);
  const [openModalApprove, setOpenModalApprove] = useState(false);
  const [formData, setFormData] = useState({});
  const [tableHeaderData, setTableHeaderData] = useState({
      esignStatus: '',
      searchVal: ''
    });
    const [pendingAction, setPendingAction] = useState(null);
    const searchBarRef = useRef(null);

  const apiAccess = useApiAccess(
    "location-create",
    "location-update",
    "location-approve");

  useLayoutEffect(() => {
    const data =getUserData()
    const decodedToken = getTokenValues();
    setConfig(decodedToken);
    setUserDataPdf(data)
    return () => { }
  }, [])


  useEffect(() => {
    if (formData && pendingAction) {
        const esign_status = "approved";
        if (pendingAction === "edit") {
          editLocation() ;
        } else {
          addLocation(esign_status);
        }
        setPendingAction(null);
    }
}, [formData, pendingAction]);

  const tableBody = locationData.map((item, index) => [
      index + 1, 
      item.location_id,
      item.location_name,
      item.mfg_licence_no,
      item.mfg_name,
      item.address,
      item.esign_status || "N/A"
    ]);
    const tableData = useMemo(() => ({
      tableHeader: ['Sr.No.', 'Id', 'Name', 'Mfg.Licence No.', 'Mfg Name', 'Address', 'E-Sign'],
      tableHeaderText: 'Location Master Report',
      tableBodyText: 'Location Master Data',
      filename:'LocationMaster'
    }), []);

  useEffect(() => {
    getData()
  }, [tableHeaderData , page, rowsPerPage])

  const getData = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage === -1 ? -1 : rowsPerPage,
        search: tableHeaderData.searchVal,
        esign_status: tableHeaderData.esignStatus
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
    setAlertData({...alertData,openSnackbar:false})
  }
  const handleOpenModal = () => {
    setApproveAPI({
      approveAPIName:"location-create",
      approveAPImethod:"POST",
      approveAPIEndPoint:"/api/v1/location"
    })
     setEditData({})
     setFormData({})
     setOpenModal(true)

  }
  const handleCloseModal = () => {
    setOpenModal(false)
    setFormData({})
    setEditData({})
  }

  const handleAuthModalClose = () => {
    setAuthModalOpen(false);
    setOpenModalApprove(false);
  };
   
  
  const handleSubmitForm = async (data) => {
    console.log("handle form data ", data);
    setFormData((prevData) => {
      const updatedData = { ...prevData, ...data };
      return updatedData
    })   
   console.log("afterSubmit",formData)
    if (editData?.location_id) {;
      setApproveAPI({
        approveAPIName:"location-update",
        approveAPImethod:"PUT",
        approveAPIEndPoint:"/api/v1/location"
      })
    } else {
      setApproveAPI({
        approveAPIName:"location-create",
        approveAPImethod:"POST",
        approveAPIEndPoint:"/api/v1/location"
      })
    }
    if (config?.config?.esign_status) {
      setAuthModalOpen(true);
      return;
    }
       setPendingAction(editData?.id ? "edit" : "add");
    // editData?.location_id ? editLocation() : addLocation("approved");
  };
  const handleAuthResult = async (isAuthenticated, user, isApprover, esignStatus, remarks) => {
    const resetState = () => {
      setApproveAPI({
        approveAPIName:"",
        approveAPImethod:"",
        approveAPIEndPoint:""
      })
      setAuthModalOpen(false);
    };
    const handleUnauthenticated = () => {
      setAlertData({SnackbarAlert:true, type: 'error', message: 'Authentication failed, Please try again.' });
      resetState();
    };
    const handleModalActions = (isApproved) => {
      setOpenModalApprove(!isApproved);
      if (isApproved && esignDownloadPdf) {
        console.log("esign is approved for download");
        downloadPdf(tableData,tableHeaderData,tableBody,locationData,userDataPdf);
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
      resetState();
      getData();
      return;
    }
    processNonApproverActions();
    resetState();
    getData();
  };
  const handleAuthCheck = async (row) => {
    console.log("handleAuthCheck", row)
    setApproveAPI({
      approveAPIName:"location-approve",
      approveAPImethod:"PATCH",
      approveAPIEndPoint:"/api/v1/location"
    })
    setAuthModalOpen(true);
    setESignStatusId(row.id);
    setAuditLogMark(row.location_id)
  }
  const addLocation = async (esign_status, remarks) => {
    try {
      console.log('formdata',formData)
      const data = { ...formData };
      const audit_log = config?.config?.audit_logs ? {
        "audit_log": true,
        "performed_action": "add",
        "remarks": remarks?.length > 0 ? remarks : `location added - ${formData.locationName}`,
      } : {
        "audit_log": false,
        "performed_action": "none",
        "remarks": 'none',
      };
      data.audit_log = audit_log;
      data.esign_status = esign_status;
      console.log(data)
      setIsLoading(true)
      const res = await api('/location/', data, 'post', true)
      console.log(res,'res')
      setIsLoading(false)

      if (res?.data?.success) {
        setAlertData({ ...alertData,openSnackbar:true, type: 'success', message: 'Location added successfully' })
        getData();
        setEditData({})
        
      } else {
        setAlertData({ ...alertData,openSnackbar:true, type: 'error', message: res.data?.message })
        if (res.data.code === 401) {
          removeAuthToken();
          router.push('/401');
        }
      }
    } catch (error) {
      console.log("Error in add locaiton ", error);
      router.push('/500');
    } finally {
      setApproveAPI({
        approveAPIName:"",
        approveAPImethod:"",
        approveAPIEndPoint:""
      })
      setOpenModal(false)
      setIsLoading(false)
    }
  }
  const editLocation = async (esign_status, remarks) => {
    try {
      const data = { ...formData };
      console.log(data)
      delete data.locationId;
      const auditlogRemark = remarks
      let audit_log;
      if (config?.config?.audit_logs) {
        audit_log = {
          "audit_log": true,
          "performed_action": "edit",
          "remarks": auditlogRemark?.length > 0 ? auditlogRemark : `location edited - ${formData.locationName}`,
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
        setAlertData({ ...alertData,openSnackbar:true, type: 'success', message: 'Location updated successfully' });
        getData()
      } else {
        setAlertData({ ...alertData,openSnackbar:true, type: 'error', message: res.data.message })
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
  const handleSearch = (val) => {
    setTableHeaderData({...tableHeaderData,searchVal:val.toLowerCase()})
    setPage(0)
  }
  // const handleTempSearchValue = e => {
  //   setTempSearchVal(e.target.value.toLowerCase())
  // }
  const handleUpdate = item => {
    
    // setFormData({...FormData, locationId: item.location_id ,
    //   locationName: item.location_name ,
    //   mfgLicenceNo:item.mfg_licence_no, 
    //   mfgName: item.mfg_name ,
    //   address: item.address });
    setEditData(item)
    setOpenModal(true)
    
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
  if (searchBarRef.current) {
            searchBarRef.current.resetSearch(); // Call the reset method in the child
        }
    setTableHeaderData({...tableHeaderData,esignStatus:'',searchVal:""})
  }
  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }
  const handleChangeRowsPerPage = event => {
    const newRowsPerPage = parseInt(event.target.value, 10)
    setRowsPerPage(newRowsPerPage)
    setPage(0)
  }
    const handleAuthModalOpen = () => {
    console.log("OPen auth model");
    setApproveAPI({
      approveAPIName:"location-approve",
      approveAPImethod:"PATCH",
      approveAPIEndPoint:"/api/v1/location"
    })
    setAuthModalOpen(true);
  };
  const handleDownloadPdf = () => {
    setApproveAPI({
      approveAPIName:"location-create",
      approveAPImethod:"POST",
      approveAPIEndPoint:"/api/v1/location"
    })
    let data = getUserData();
    setUserDataPdf(data);
    if (config?.config?.esign_status) {
      console.log("Esign enabled for download pdf");
      setEsignDownloadPdf(true);
      setAuthModalOpen(true);
      return;
    }
    downloadPdf(tableData,tableHeaderData,tableBody,locationData,userDataPdf);
  }
  return (
    <Box padding={4}>
      {console.log('config',config?.config?.esign_status)}
      <Head>
        <title>Location Master</title>
      </Head>
      <Grid2 item xs={12}>
        <Typography variant='h2'>Location Master </Typography>
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
                  {/* <EsignStatusFilter esignStatus={eSignStatus} setEsignStatus={setESignStatus} /> */}
                  {(config?.config?.esign_status) &&
                  <EsignStatusDropdown tableHeaderData={tableHeaderData} setTableHeaderData={setTableHeaderData} />
                  }
                </Box>
                <Box className='d-flex justify-content-between align-items-center mx-4 my-2'>
                  
                  <ExportResetActionButtons handleDownloadPdf={handleDownloadPdf} resetFilter={resetFilter} />
                  <Box className='d-flex justify-content-between align-items-center '>
                    {/* <SearchBar
                      searchValue={tempSearchVal}
                      handleSearchChange={handleTempSearchValue}
                      handleSearchClick={handleSearch}
                    /> */}
             <CustomSearchBar ref={searchBarRef} handleSearchClick={handleSearch}  />
                    
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
      <SnackbarAlert openSnackbar={alertData.openSnackbar} closeSnackbar={closeSnackbar} alertData={alertData} />
      <LocationModal open={openModal}
       handleClose={handleCloseModal}
        editData={editData} handleSubmitForm={handleSubmitForm}  />
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
  return validateToken(context, "Location Master")
}

export default ProtectedRoute(Index)

