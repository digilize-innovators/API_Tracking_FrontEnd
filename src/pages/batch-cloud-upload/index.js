'use-client'
import React, { useState, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import Box from '@mui/material/Box'
import Select from '@mui/material/Select'
import Grid2 from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import { Button, MenuItem } from '@mui/material'
import Modal from '@mui/material/Modal'
import { api } from 'src/utils/Rest-API'
import ProtectedRoute from 'src/components/ProtectedRoute'
import SnackbarAlert from 'src/components/SnackbarAlert'
import TableBatch from 'src/views/tables/TableBatch'
import { useLoading } from 'src/@core/hooks/useLoading'
import Head from 'next/head'
import { useSettings } from 'src/@core/hooks/useSettings'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useAuth } from 'src/Context/AuthContext'
import { useRouter } from 'next/router'
import AuthModal from 'src/components/authModal'
import ChatbotComponent from 'src/components/ChatbotComponent'
import AccessibilitySettings from 'src/components/AccessibilitySettings'
import { validateToken } from 'src/utils/ValidateToken';
import { style } from 'src/configs/generalConfig';
import {  getTokenValues } from '../../utils/tokenUtils';
import { useApiAccess } from 'src/@core/hooks/useApiAccess';
import ExportResetActionButtons from 'src/components/ExportResetActionButtons'
import CustomSearchBar from 'src/components/CustomSearchBar'
import EsignStatusDropdown from 'src/components/EsignStatusDropdown'
import downloadPdf from 'src/utils/DownloadPdf'

const Index = () => {
    const router = useRouter();
    const [filterLocationVal, setFilterLocationVal] = useState('');
    const [filterProductVal, setFilterProductVal] = useState('');
    const [openModal, setOpenModal] = useState(false);
    const [batchData, setBatchData] = useState([]);
    const [alertData, setAlertData] = useState({ openSnackbar:false,type: '', message: '', variant: 'filled' });
    const [allProductData, setAllProductData] = useState([]);
    const [allLocationData, setAllLocationData] = useState([]);
    const { setIsLoading } = useLoading();
    const { settings } = useSettings();
    const [id, setId] = useState('')
    const [userDataPdf, setUserDataPdf] = useState();
    const { getUserData, removeAuthToken } = useAuth();
    const [config, setConfig] = useState(null);
    const [authModalOpen, setAuthModalOpen] = useState(false);
 const [approveAPI,setApproveAPI]=useState({ approveAPIName:'',approveAPImethod:'',approveAPIEndPoint:''}) 
    const [eSignStatusId, setESignStatusId] = useState('');
    const [auditLogMark, setAuditLogMark] = useState('');
    const [esignDownloadPdf, setEsignDownloadPdf] = useState(false);
    const [openModalApprove, setOpenModalApprove] = useState(false);
      const searchBarRef = useRef(null)
    
     const [tableHeaderData, setTableHeaderData] = useState({
        esignStatus: '',
        searchVal: ''
      });

    const apiAccess = useApiAccess("batch-cloud-upload-create", "batch-cloud-upload-update", "batch-cloud-upload-approve");
    const tableBody = batchData.map((item, index) => 
        [index + 1,  item.batch_no, item.productHistory.product_name, item.location.location_name, item.qty, item.esign_status]);
       const tableData = useMemo(() => ({
          tableHeader: ['Sr.No.', 'Batch No.', 'Product Name', 'Location Name', 'Quality', 'E-Sign'],
          tableHeaderText: 'Batch Master Report',
          tableBodyText: 'Batch Master Data',
          filename:'BatchMaster',
          Filter:['location',filterLocationVal],

        }), [filterLocationVal]);
    
      useLayoutEffect(() => {
        getAllProducts();
        getAllLocations();
          let data = getUserData();
          const decodedToken = getTokenValues();
          setConfig(decodedToken);
          setUserDataPdf(data);
          return () => { }
        }, [openModal])
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
            setIsLoading(true);
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
    const closeSnackbar = () => {
        setAlertData({...alertData,openSnackbar:false})
    }
    const handleOpenModal = () => {
        setOpenModal(true)
    }
    const handleAuthModalClose = () => {
        setAuthModalOpen(false);
        setOpenModalApprove(false);
    };
    const handleCloseModal = () => {
        setOpenModal(false)
    }

    const
        handleSubmitForm = async () => {
            BatchDataUploadOnCloud(id)
        }
    const BatchDataUploadOnCloud = async (id, remarks) => {
        try {
            const data = { dataId: id, tableName: 'batch' }
            const auditlogRemark = remarks;
            const audit_log = config?.config?.audit_logs ? {
                "audit_log": true,
                "performed_action": `Copy Batch data of ${id}`,
                "remarks": auditlogRemark?.length > 0 ? auditlogRemark : `Copy Batch data of ${id}`,
            } : {
                "audit_log": false,
                "performed_action": "none",
                "remarks": `none`,
            };
            data.audit_log = audit_log;
            console.log('Add batch data ', data)
            setIsLoading(true);
            const res = await api('/batch-cloud-upload/', data, 'post', true)
            setIsLoading(false);
            if (res?.data?.success) {
                console.log('res ', res?.data)
                setAlertData({ ...alertData,openSnackbar:true, type: 'success', message: 'Batch cloud data added successfully on target database' })
            } else {
                console.log('error to add batch ', res.data)
                setAlertData({ ...alertData,openSnackbar:true, type: 'error', message: res.data?.message })
                if (res.data.code === 401) {
                    removeAuthToken();
                    router.push('/401');
                }
            }
        } catch (error) {
            console.log('Erorr to add batch ', error)
            router.push('/500');
        } finally {
            setOpenModal(false)
            setIsLoading(false);
  
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
        const resetState = () => {
         
            setApproveAPI({
                approveAPIName:"",
                approveAPImethod:"",
                approveAPIEndPoint:""
            })
            setAuthModalOpen(false);
        };
        if (!isAuthenticated) {
            setAlertData({openSnackbar:true, type: 'error', message: 'Authentication failed, Please try again.' });
            return;
        }
        const prepareData = () => ({
            modelName: "batch",
            esignStatus: esignStatus,
            id: eSignStatusId,
            audit_log: config?.config?.audit_logs ? {
                "user_id": user.userId,
                "user_name": user.userName,
                "performed_action": 'approved',
                "remarks": remarks.length > 0 ? remarks : `batch approved - ${auditLogMark}`,
            } : {}
        });
        const handleEsignApproved = () => {
            if (esignDownloadPdf) {
                console.log("esign is approved for download.");
                setOpenModalApprove(true);
                downloadPdf(tableData,tableHeaderData,tableBody,batchData,userDataPdf);
            } else {
                console.log("esign is approved for creator.");
                const esign_status = "pending";
                BatchDataUploadOnCloud(esign_status, remarks);
            }
        };
        const handleApproverActions = async () => {
            const data = prepareData();
            if (esignStatus === "approved" && esignDownloadPdf) {
                setOpenModalApprove(false);
                console.log("esign is approved for approver.");
                resetState();
                downloadPdf(tableData,tableHeaderData,tableBody,batchData,userDataPdf);
                return;
            }
            const res = await api('/esign-status/update-esign-status', data, 'patch', true);
            console.log("esign status update", res?.data);
            if (esignStatus === "rejected" && esignDownloadPdf) {
                console.log("approver rejected.");
                setOpenModalApprove(false);
                resetState();
            }
        };

        if (!isApprover && esignDownloadPdf) {
            setAlertData({
              ...alertData,
              openSnackbar: true,
              type: 'error',
              message: 'Access denied: Download pdf disabled for this user.'
            })
            resetState()
            return
          }   
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
    };
    const handleAuthCheck = async (row) => {
        console.log("handleAuthCheck", row)
 
        setApproveAPI({
            approveAPIName:"batch-approve",
            approveAPImethod:"PATCH",
            approveAPIEndPoint:"/api/v1/batch"
        })
        setAuthModalOpen(true);
        setESignStatusId(row.id);
        setAuditLogMark(row.batch_no)
        console.log("row", row)
    }
    const handleUpdate = row => {
        setId(row.id)
        handleOpenModal()
    }
   
    const resetFilter = () => {

        if (searchBarRef.current) {
            searchBarRef.current.resetSearch()
          }
        setTableHeaderData({esignStatus:"",searchVal:""})
        setFilterLocationVal('');
        setFilterProductVal('');
    }
   
    const handleSearch = (val) => {
        setTableHeaderData({ ...tableHeaderData,searchVal:val.toLowerCase()});
    }
    const handleLocationFilter = (e) => {
        setFilterLocationVal(e.target.value);
    }
    const handleAuthModalOpen = () => {
        console.log("OPen auth model");
       
        setApproveAPI({
            approveAPIName:"batch-approve",
            approveAPImethod:"PATCH",
            approveAPIEndPoint:"/api/v1/batch"
        })
        setAuthModalOpen(true);
    };
    const handleDownloadPdf = () => {
      
        setApproveAPI({
            approveAPIName:"batch-create",
            approveAPImethod:"POST",
            approveAPIEndPoint:"/api/v1/batch"
        })
        if (config?.config?.esign_status) {
            console.log("Esign enabled for download pdf");
            setEsignDownloadPdf(true);
            setAuthModalOpen(true);
            return;
        }
        downloadPdf(tableData,tableHeaderData,tableBody,batchData,userDataPdf);
    }
    return (

        <Box padding={4}>
            {console.log('batchdata',batchData)}
            <Head>
                <title>Batch Sync</title>
            </Head>
            <Grid2 item xs={12}>
                <Typography variant='h2'>Batch Cloud Upload</Typography>
            </Grid2>
            <Grid2 item xs={12}>
                <Grid2 item xs={12}>
                    <Box sx={{ backgroundColor: settings.mode === 'dark' ? '#212121' : 'white', borderRadius: 1 }}>
                        <Typography variant='h4' className='mx-4 my-2 mx-2' sx={{ paddingTop: '1%' }}>
                            Filter
                        </Typography>
                        <Grid2 item xs={12}>
                            <Box className='d-flex-row justify-content-start align-items-center mx-4 my-3 '>
                                {
                                    config?.config?.esign_status &&           
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
                                    

                                </Box>
                            </Box>
                        </Grid2>
                        <Grid2 item xs={12}>

                            {(filterProductVal != '') && <TableBatch
                                            isBatchCloud={true}
                                            handleUpdate={handleUpdate}
                                            filterProductVal={filterProductVal}
                                            filterLocationVal={filterLocationVal}
                                            tableHeaderData={tableHeaderData}
                                            setBatch={setBatchData}
                                            handleAuthCheck={handleAuthCheck}
                                            apiAccess={apiAccess}
                                            config={config}
                                            pendingAction={openModal}
                                          />}
                        </Grid2>
                    </Box>
                </Grid2>
            </Grid2>
            <SnackbarAlert openSnackbar={alertData.openSnackbar} closeSnackbar={closeSnackbar} alertData={alertData} />
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
                        Are you sure you want to upload this batch of data to the cloud?
                    </Typography>

                    <Grid2 item xs={12} className='my-3 '>
                        <Button variant='contained' sx={{ marginRight: 3.5 }} onClick={handleSubmitForm}>
                            Yes
                        </Button>

                        <Button variant='outlined' color='error' sx={{ marginLeft: 3.5 }} onClick={handleCloseModal}>
                            No
                        </Button>
                    </Grid2>
                </Box>
            </Modal>
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
    return validateToken(context, 'Batch Cloud Upload')
}
export default ProtectedRoute(Index)