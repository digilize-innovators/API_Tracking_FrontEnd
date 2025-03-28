'use-client'
import React, { useState, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import Box from '@mui/material/Box'
import Select from '@mui/material/Select'
import Grid2 from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import { Button, MenuItem } from '@mui/material'
import { IoMdAdd } from 'react-icons/io'
import { api } from 'src/utils/Rest-API'
import ProtectedRoute from 'src/components/ProtectedRoute'
import SnackbarAlert from 'src/components/SnackbarAlert'
import TableBatch from 'src/views/tables/TableBatch'
import { useLoading } from 'src/@core/hooks/useLoading'
import Head from 'next/head'
import { useSettings } from 'src/@core/hooks/useSettings'
import { useAuth } from 'src/Context/AuthContext'
import { useRouter } from 'next/router'
import AuthModal from 'src/components/authModal'
import ChatbotComponent from 'src/components/ChatbotComponent'
import AccessibilitySettings from 'src/components/AccessibilitySettings'
import { validateToken } from 'src/utils/ValidateToken';
import { useApiAccess } from 'src/@core/hooks/useApiAccess';
import ExportResetActionButtons from 'src/components/ExportResetActionButtons'
import BatchModal from "src/components/Modal/BatchModal";
import CustomSearchBar from 'src/components/CustomSearchBar'
import EsignStatusDropdown from 'src/components/EsignStatusDropdown'
import downloadPdf from 'src/utils/DownloadPdf'
import { getTokenValues } from 'src/utils/tokenUtils'
import moment from 'moment'

const Index = () => {
  const { settings } = useSettings();
  const [openModal, setOpenModal] = useState(false);
  const [alertData, setAlertData] = useState({ openSnackbar: false, type: '', message: '', variant: 'filled' })
  const [editData, setEditData] = useState({});
  const { setIsLoading } = useLoading();
  const [pendingAction,setPendingAction]=useState()
  const { getUserData, removeAuthToken } = useAuth();
  const [userDataPdf, setUserDataPdf] = useState();
  const router = useRouter();
  const [config, setConfig] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [approveAPI, setApproveAPI] = useState({ approveAPIName: '', approveAPImethod: '', approveAPIEndPoint: '' })
  const [eSignStatusId, setESignStatusId] = useState('');
  const [auditLogMark, setAuditLogMark] = useState('');
  const [esignDownloadPdf, setEsignDownloadPdf] = useState(false);
  const [openModalApprove, setOpenModalApprove] = useState(false);
  const apiAccess = useApiAccess("batch-create", "batch-update", "batch-approve");
  const [tableHeaderData, setTableHeaderData] = useState({esignStatus: '',searchVal: ''});
  const searchBarRef = useRef('')
  const [allProductData, setAllProductData] = useState([]);
  const [ allLocationData,setAllLocationData]=useState([])
  const [formData, setFormData] = useState({})

  const [filterLocationVal, setFilterLocationVal] = useState('');
  const [filterProductVal, setFilterProductVal] = useState('');
  const [batchData,setBatch]=useState([])


  useLayoutEffect(() => {
    getAllProducts();
    getAllLocations();
    let data = getUserData();
    const decodedToken = getTokenValues();
    setConfig(decodedToken);
    setUserDataPdf(data);
    return () => { }
 }, [])

   useEffect(() => {
     if (pendingAction && formData) {
       const esign_status=config?.config?.esign_status?"pending":"approved";
       if (pendingAction === 'edit') {
         editBatch(esign_status)
       } 
       else if(pendingAction=='add') {
         addBatch(esign_status)
       }
     }
     setPendingAction(null)
   }, [formData, pendingAction])
 
  const tableBody = batchData?.map((item, index) =>[
      index + 1, 
      item.batch_no, 
      item?.productHistory?.product_name, 
      item?.location?.location_name, 
      item?.manufacturing_date ? moment(item.manufacturing_date).format("DD-MM-YYYY") : "N/A",
      item?.expiry_date ? moment(item.expiry_date).format("DD-MM-YYYY") : "N/A",
      item?.qty, 
      item?.esign_status
    ]);

  const tableData = useMemo(() => ({
    tableHeader: ['Sr.No.', 'Batch No', 'Product Name', 'Location Name', 'Manufacturing Date', 'Expiry Date', 'Quantity', 'E-Sign'],
    tableHeaderText: 'Batch Master Report',
    tableBodyText: 'Batch Master Data',
    filename: "BatchMaster"
  }), []);

  const closeSnackbar = () => {
    setAlertData({ ...alertData, openSnackbar: false })
  }

  const handleOpenModal = () => {
    setApproveAPI({approveAPIName: "batch-create",approveAPImethod: "POST",approveAPIEndPoint: "/api/v1/batch"});
    setEditData({})
    setOpenModal(true)
  }

  const handleAuthModalClose = () => {
    setAuthModalOpen(false);
    setOpenModalApprove(false);
  };

  const handleCloseModal = () => {
    setEditData({})
    setOpenModal(false)
  }

  const handleSearch = (val) => {
    setTableHeaderData({ ...tableHeaderData, searchVal: val.trim().toLowerCase() });
  }

  const resetForm = () => {
    setEditData({})
  }

  const handleSubmitForm = async (data) => {
    console.log('Data :', data)
    setFormData(data)
    if (editData?.id) {
      setApproveAPI(()=>({approveAPIName: "batch-update",approveAPImethod: "PUT",approveAPIEndPoint: "/api/v1/batch"}));
    } else {
      setApproveAPI({approveAPIName: "batch-create",approveAPImethod: "POST",approveAPIEndPoint: "/api/v1/batch"});
    }
    if (config?.config?.esign_status) {
      setAuthModalOpen(true);
      return;
    }
    setPendingAction(editData?.id?"edit":"add")
  }

  const addBatch = async (esign_status, remarks) => {
    try {
      const data = {...formData}
      const auditlogRemark = remarks;
      const audit_log = config?.config?.audit_logs ? {
        audit_log: true,
        performed_action: "add",
        remarks: auditlogRemark?.length > 0 ? auditlogRemark : `Batch added - ${formData.batchNo}`,
      } : {
        audit_log: false,
        performed_action: "none",
        remarks: `none`,
      };
      data.audit_log = audit_log;
      data.esign_status = esign_status;
      console.log('Add batch data ', data)
      setIsLoading(true);
      const res = await api('/batch/', data, 'post', true)
      setIsLoading(false);
      if (res?.data?.success) {
        console.log('res ', res?.data)
        setAlertData({ ...alertData, type: 'success', message: 'Batch added successfully', openSnackbar: true })
        resetForm()
        setOpenModal(false)
      } else {
        console.log('error to add batch ', res.data)
        setAlertData({ ...alertData, type: 'error', message: res.data?.message, openSnackbar: true })
        if (res.data.code === 401) {
          removeAuthToken();
          router.push('/401');
        }
      }
    } catch (error) {
      console.log('Erorr to add batch ', error)
      router.push('/500');
    } finally {
      setApproveAPI({
        approveAPIName: "",
        approveAPImethod: "",
        approveAPIEndPoint: ""
      });
    }
  }

  const editBatch = async (esign_status, remarks) => {
    try {
      const data = { ...formData}
      const auditlogRemark = remarks;
      let audit_log;
      if (config?.config?.audit_logs) {
        audit_log = {
          audit_log: true,
          performed_action: "edit",
          remarks: auditlogRemark?.length > 0 ? auditlogRemark : `Batch editted - ${formData.batchNo}`,
        };
      } else {
        audit_log = {
          audit_log: false,
          performed_action: "none",
          remarks: `none`,
        };
      }
      data.audit_log = audit_log;
      data.esign_status = esign_status;
      setIsLoading(true);
      const res = await api(`/batch/${editData.id}`, data, 'put', true)
      setIsLoading(false);
      if (res.data.success) {
        setAlertData({ ...alertData, type: 'success', message: 'Batch updated successfully', openSnackbar: true })
        resetForm()
        setOpenModal(false)
      } else {
        console.log('error to edit batch ', res.data)
        setAlertData({ ...alertData, type: 'error', message: res.data.message, openSnackbar: true })
        if (res.data.code === 401) {
          removeAuthToken();
          router.push('/401');
        }
      }
    } catch (error) {
      console.log('Erorr to edit batch ', error)
      router.push('/500');
    } finally {
      setIsLoading(false)
      setApproveAPI({
        approveAPIName: "",
        approveAPImethod: "",
        approveAPIEndPoint: ""
      });
    }
  }

  const handleUpdate = item => {
    // resetForm()
    // handleOpenModal()
    // setEditData(item)
    // console.log('edit batch ', item)
    setEditData(item)
    console.log('edit controlpanel master', item)
    setOpenModal(true)
  }

  const handleLocationFilter = (e) => {
    setFilterLocationVal(e.target.value);
  }

  const handleAuthResult = async (isAuthenticated, user, isApprover, esignStatus, remarks) => {
    console.log('handleAuthResult 01', isAuthenticated, isApprover, esignStatus, user)
    console.log('handleAuthResult 02', config?.userId, user.user_id)
    const resetState = () => {
      setApproveAPI({approveAPIName: '',approveAPImethod: '',approveAPIEndPoint: ''})
      setAuthModalOpen(false)
      setEsignDownloadPdf(false)
    }

    const handleUnauthenticated = () => {
      setAlertData({ type: 'error', message: 'Authentication failed, Please try again.', openSnackbar: true })
      resetState()
    }

    const handleModalActions = isApproved => {
      setOpenModalApprove(!isApproved)
      if (isApproved && esignDownloadPdf) {
        console.log('esign is approved for download')
        downloadPdf(tableData, tableHeaderData, tableBody, batchData, userDataPdf)
      }
    }

    const createAuditLog = action =>
      config?.config?.audit_logs
        ? {
            user_id: user.userId,
            user_name: user.userName,
            performed_action: action,
            remarks: remarks?.length > 0 ? remarks : `batch approved  ${action} - ${auditLogMark}`
          }
        : {}

    const handleUpdateStatus = async () => {
      const data = {
        modelName: 'batch',
        esignStatus,
        id: eSignStatusId,
        audit_log: createAuditLog(esignStatus)
      }
      const res = await api('/esign-status/update-esign-status', data, 'patch', true)
      console.log('esign status update', res?.data)
      setPendingAction(true)
    }

    const processApproverActions = async () => {
      if (esignStatus === 'approved' || esignStatus === 'rejected') {
        handleModalActions(esignStatus === 'approved')
        if (esignStatus === 'approved' && esignDownloadPdf) {
          resetState()
          return
        }
      }
      await handleUpdateStatus()
      resetState()
    }

    const processNonApproverActions = () => {
      if (esignStatus === 'rejected') {
        resetState()
        return
      }
      if (esignStatus === 'approved') {
        handleModalActions(true)
        if (!esignDownloadPdf) {
          console.log('esign is approved for creator')
          setPendingAction(editData?.id ? 'edit' : 'add')
        }
      }
    }

    if (!isAuthenticated) {
      handleUnauthenticated()
      return
    }
    if (isApprover) {
      await processApproverActions()
      return
    }
    processNonApproverActions()
    resetState()
  }
  
  const handleAuthCheck = async (row) => {
    setApproveAPI({
      approveAPIName: "batch-approve",
      approveAPImethod: "PATCH",
      approveAPIEndPoint: "/api/v1/batch"
    });
    setAuthModalOpen(true);
    setESignStatusId(row.id);
    setAuditLogMark(row.batch_no)
  }

  const resetFilter = () => {
    if (searchBarRef.current) {
      searchBarRef.current.resetSearch();
    }
    setTableHeaderData({ ...tableHeaderData, esignStatus: '', searchVal: '' })
    setFilterLocationVal('');
    setFilterProductVal('');
  }

  const handleAuthModalOpen = () => {
    console.log("OPen auth model");
    setApproveAPI({
      approveAPIName: "batch-approve",
      approveAPImethod: "PATCH",
      approveAPIEndPoint: "/api/v1/batch"
    });
    setAuthModalOpen(true);
  }

  const handleDownloadPdf = () => {
    setApproveAPI({
      approveAPIName: "batch-create",
      approveAPImethod: "POST",
      approveAPIEndPoint: "/api/v1/batch"
    });
    if (config?.config?.esign_status) {
      console.log("Esign enabled for download pdf");
      setEsignDownloadPdf(true);
      setAuthModalOpen(true);
      return;
    }
    downloadPdf(tableData, tableHeaderData, tableBody, batchData, userDataPdf);
  }

  const getAllProducts = async () => {
    try {
      setIsLoading(true);
      const res = await api('/product/', {}, 'get', true)
      setIsLoading(false);
      if (res.data.success) {
        setAllProductData(res.data.data.products)
      } else {
        console.log('Error to get all products ', res.data)
        if (res.data.code === 401) {
          removeAuthToken();
          router.push('/401');
        }
      }
    } catch (error) {
      console.log('Error in get products ', error)
      setIsLoading(true);``
    }
  }

const getAllLocations = async () => {
  try {
      setIsLoading(true);
      const res = await api('/location/', {}, 'get', true)
      setIsLoading(false);
      console.log('All locations ', res.data)
      if (res.data.success) {
        setAllLocationData(res.data.data.locations)
      } else {
        console.log('Error to get all locations ', res.data)
        if (res.data.code === 401) {
          removeAuthToken();
          router.push('/401');
        }
      }
    } catch (error) {
      console.log('Error in get locations ', error)
      setIsLoading(false);
    }
  }

  return (
    <Box padding={4}>
      <Head>
        <title>Batch Master</title>
      </Head>
      <Grid2 item xs={12}>
        <Typography variant='h2'>Batch Master</Typography>
      </Grid2>
      <Grid2 item xs={12}>
        <Grid2 item xs={12}>
          <Box sx={{ backgroundColor: settings.mode === 'dark' ? '#212121' : 'white', borderRadius: 1 }}>
            <Typography variant='h4' className='mx-4 my-2 mx-2' sx={{ paddingTop: '1%' }}>
              Filter
            </Typography>
            <Grid2 item xs={12}>
              <Box className='d-flex-row justify-content-start align-items-center mx-4 my-3 '>
                {config?.config?.esign_status &&
                  <EsignStatusDropdown tableHeaderData={tableHeaderData} setTableHeaderData={setTableHeaderData} />
                }
                <FormControl className='w-25 mx-2'>
                  <InputLabel id='batch-filter-by-location'>Location</InputLabel>
                  <Select
                    labelId='batch-select-by-location'
                    id='product-select-by-location'
                    value={filterLocationVal}
                    label='Location'
                    onChange={handleLocationFilter}
                  >
                    {
                      allLocationData?.map(item => {
                        return (
                          <MenuItem key={item?.id} value={item?.location_name}>
                            {item?.location_name}
                          </MenuItem>
                        )
                      })}
                  </Select>
                </FormControl>

                <FormControl className='w-25 ml-2'>
                  <InputLabel id='batch-filter-by-product'>Product</InputLabel>
                  <Select
                    labelId='batch-select-by-product'
                    id='product-select-by-product'
                    value={filterProductVal}
                    label='Product'
                    onChange={(e) => setFilterProductVal(e.target.value)}
                  >
                    {allProductData?.map((item) => {
                      return (
                        <MenuItem key={item?.id} value={item?.product_name}>
                          {item?.product_name}
                        </MenuItem>
                      )
                    })}
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
                Batch Data
              </Typography>
              <TableBatch
                isBatchCloud={false}
                handleUpdate={handleUpdate}
                filterProductVal={filterProductVal}
                filterLocationVal={filterLocationVal}
                tableHeaderData={tableHeaderData}
                setBatch={setBatch}
                handleAuthCheck={handleAuthCheck}
                apiAccess={apiAccess}
                config={config}
                pendingAction={pendingAction}
              />
            </Grid2>
          </Box>
        </Grid2>
      </Grid2>
      
      <BatchModal
        setUserDataPdf={setUserDataPdf}
        openModal={openModal} 
        handleCloseModal={handleCloseModal} 
        editData={editData} 
        allProductData={allProductData} 
        allLocationData={allLocationData} 
        handleSubmitForm={handleSubmitForm}
      />

      <SnackbarAlert alertData={alertData} closeSnackbar={closeSnackbar} openSnackbar={alertData.openSnackbar}  />

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
  return validateToken(context, 'Batch Master')
}
export default ProtectedRoute(Index)