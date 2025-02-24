'use-client'
import React, { useState, useEffect } from 'react'
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
import { decodeAndSetConfig } from '../../utils/tokenUtils';
import { useApiAccess } from 'src/@core/hooks/useApiAccess';
import ExportResetActionButtons from 'src/components/ExportResetActionButtons'
import SearchBar from 'src/components/SearchBarComponent'
import EsignStatusFilter from 'src/components/EsignStatusFilter'
import { footerContent } from 'src/utils/footerContentPdf';
import { headerContentFix } from 'src/utils/headerContentPdfFix';

const Index = () => {
    const router = useRouter();
    const [filterLocationVal, setFilterLocationVal] = useState('');
    const [filterProductVal, setFilterProductVal] = useState('');
    const [openModal, setOpenModal] = useState(false);

    const [batchData, setBatchData] = useState([]);

    const [sortDirection, setSortDirection] = useState('asc');
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [alertData, setAlertData] = useState({ type: '', message: '', variant: 'filled' });
    const [searchVal, setSearchVal] = useState('');
    const [allProductData, setAllProductData] = useState([]);
    const [allLocationData, setAllLocationData] = useState([]);
    const { setIsLoading } = useLoading();
    const [eSignStatus, setESignStatus] = useState('');
    const [page, setPage] = useState(1);
    const { settings } = useSettings();
    const [id, setId] = useState('')
    const [rowsPerPage, setRowsPerPage] = useState(settings.rowsPerPage);
    const [totalRecords, setTotalRecords] = useState(0);
    const [userDataPdf, setUserDataPdf] = useState();
    const { getUserData, removeAuthToken } = useAuth();
    const [config, setConfig] = useState(null);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [approveAPIName, setApproveAPIName] = useState('');
    const [approveAPImethod, setApproveAPImethod] = useState('');
    const [approveAPIEndPoint, setApproveAPIEndPoint] = useState('');
    const [eSignStatusId, setESignStatusId] = useState('');
    const [auditLogMark, setAuditLogMark] = useState('');
    const [esignDownloadPdf, setEsignDownloadPdf] = useState(false);
    const [openModalApprove, setOpenModalApprove] = useState(false);
    const apiAccess = useApiAccess("batch-cloud-upload-create", "batch-cloud-upload-update", "batch-cloud-upload-approve");
    
    useEffect(() => {
        getAllProducts();
        getAllLocations();
        let data = getUserData();
        setUserDataPdf(data);
        decodeAndSetConfig(setConfig);
        return () => { }
    }, [])
    useEffect(() => {
        getBatches();
        return () => { }
    }, [page, rowsPerPage, eSignStatus, filterLocationVal, filterProductVal])
    const getBatches = async (pageNumber, rowsNumber, status, search, filterLocation, filterProduct) => {
        const paramsPage = pageNumber || page;
        const paramsRows = rowsNumber || rowsPerPage;
        const paramsEsignStatus = status === '' ? status : eSignStatus;
        const paramsSearchVal = search === '' ? search : searchVal;
        const paramsFilterLocationVal = filterLocation === '' ? filterLocation : filterLocationVal;
        const paramsFilterProductVal = filterProduct === '' ? filterProduct : filterProductVal;
        try {
            let query = `/batch?page=${paramsPage}&limit=${paramsRows}`;
            if (paramsSearchVal) query += `&search=${paramsSearchVal}`;
            if (paramsEsignStatus) query += `&esign_status=${paramsEsignStatus}`;
            if (paramsFilterLocationVal) query += `&locationName=${paramsFilterLocationVal}`;
            if (paramsFilterProductVal) query += `&productName=${paramsFilterProductVal}`;
            console.log('query ', query);
            setIsLoading(true);
            const res = await api(query, {}, 'get', true);
            console.log("get batches", res.data);
            setIsLoading(false);
            console.log('All batch ', res.data)
            if (res.data.success) {
                setBatchData(res.data.data.batches);
                setTotalRecords(res.data.data.totalRecords);
            } else {
                console.log('Error to get all batches ', res.data);
                if (res.data.code === 401) {
                    removeAuthToken();
                    router.push('/401');
                }
            }
        } catch (error) {
            console.log('Error in get batches ', error)
            setIsLoading(false);
        }
    }

    const getAllProducts = async () => {
        try {
            setIsLoading(true);
            const res = await api('/product/', {}, 'get', true)
            setIsLoading(false);
            // console.log('All products ', res?.data?.data)
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
        setOpenSnackbar(false)
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
                setOpenSnackbar(true)
                setAlertData({ ...alertData, type: 'success', message: 'Batch cloud data added successfully on target database' })
                getBatches()
            } else {
                console.log('error to add batch ', res.data)
                setOpenSnackbar(true)
                setAlertData({ ...alertData, type: 'error', message: res.data?.message })
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
                downloadPdf();
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
                downloadPdf();
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
        getBatches();
    };
    const handleAuthCheck = async (row) => {
        console.log("handleAuthCheck", row)
        setApproveAPIName("batch-approve");
        setApproveAPImethod("PATCH");
        setApproveAPIEndPoint("/api/v1/batch");
        setAuthModalOpen(true);
        setESignStatusId(row.id);
        setAuditLogMark(row.batch_no)
        console.log("row", row)
    }
    const handleUpdate = row => {
        setId(row.id)
        handleOpenModal()
    }
    const handleSort = (key) => {
        const newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        const sorted = [...batchData].sort((a, b) => {
            if (a[key] > b[key]) {
                return newSortDirection === 'asc' ? 1 : -1;
            }
            if (a[key] < b[key]) {
                return newSortDirection === 'asc' ? -1 : 1;
            }
            return 0;
        });
        setBatchData(sorted);
        setSortDirection(newSortDirection);
    };
    const handleSortLocationId = () => handleSort('location_name');
    const handleSortByBatchNo = () => handleSort('batch_no');
    const handleSortByQty = () => handleSort('qty');
    const handleSortByProductId = () => handleSort('product_id');
    const handleSortByExpiryDate = () => handleSort('expiry_date');
    const handleSortByManufacturingDate = () => handleSort('manufacturing_date');

    const resetFilter = () => {
        setSearchVal('');
        setPage(1);
        setESignStatus('');
        setFilterLocationVal('');
        setFilterProductVal('');
        getBatches(1, rowsPerPage, '', '', '', '');
    }
    const handleChangePage = (event, newPage) => {
        console.log('page ', newPage)
        setPage(newPage + 1)
    }
    const handleChangeRowsPerPage = event => {
        setRowsPerPage(parseInt(event.target.value, 10))
        setPage(1)
    }
    const downloadPdf = () => {
        console.log('clicked on download btn')
        const doc = new jsPDF()
        const headerContent = () => {
            headerContentFix(doc, 'Batch Master Report');

            if (searchVal) {
                doc.setFontSize(10)
                doc.text('Search : ' + `${searchVal}`, 15, 25)
            } else {
                doc.setFontSize(10)
                doc.text('Search : ' + '__', 15, 25)
            }
            doc.text("Filters :\n", 15, 30)
            if (filterLocationVal) {
                doc.setFontSize(10)
                doc.text('Location : ' + `${filterLocationVal}`, 20, 35)
            } else {
                doc.setFontSize(10)
                doc.text('Location : ' + '__', 20, 35)
            }
            if (eSignStatus) {
                doc.setFontSize(10)
                doc.text('E-Sign : ' + `${eSignStatus}`, 20, 40)
            } else {
                doc.setFontSize(10)
                doc.text('E-Sign : ' + '__', 20, 40)
            }
            doc.setFontSize(12)
            doc.text('Batch Master Data', 15, 55)
        }
        const bodyContent = () => {
            let currentPage = 1
            let dataIndex = 0
            const totalPages = Math.ceil(batchData.length / 25)
            headerContent()
            while (dataIndex < batchData.length) {
                if (currentPage > 1) {
                    doc.addPage()
                }

                footerContent(currentPage, totalPages, userDataPdf, doc);

                const body = batchData
                    .slice(dataIndex, dataIndex + 25)
                    .map((item, index) => [dataIndex + index + 1, item.batch_no, item.product.product_name, item.location.location_name, item.qty, item.esign_status]);
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
                    head: [['Sr.No.', 'Batch No.', 'Product Name', 'Location Name', 'Quality', 'E-Sign']],
                    body: body,
                    columnWidth: 'wrap'
                })
                dataIndex += 25
                currentPage++
            }
        }

        bodyContent()
        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
        const formattedTime = currentDate.toLocaleTimeString('en-US', { hour12: false }).replace(/:/g, '-');
        const fileName = `Batch Master_${formattedDate}_${formattedTime}.pdf`;
        doc.save(fileName);
    }
    const handleSearch = () => {
        getBatches();
    }
    const handleTempSearchValue = e => {
        setSearchVal(e.target.value.toLowerCase());
    }
    const handleLocationFilter = (e) => {
        setFilterLocationVal(e.target.value);
    }
    const handleAuthModalOpen = () => {
        console.log("OPen auth model");
        setApproveAPIName("batch-approve");
        setApproveAPImethod("PATCH");
        setApproveAPIEndPoint("/api/v1/batch");
        setAuthModalOpen(true);
    };
    const handleDownloadPdf = () => {
        setApproveAPIName("batch-create");
        setApproveAPImethod("POST");
        setApproveAPIEndPoint("/api/v1/batch");
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
                                <EsignStatusFilter esignStatus={eSignStatus} setEsignStatus={setESignStatus} />
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
                                    <SearchBar
                                        searchValue={searchVal}
                                        handleSearchChange={handleTempSearchValue}
                                        handleSearchClick={handleSearch}
                                    />

                                </Box>
                            </Box>
                        </Grid2>
                        <Grid2 item xs={12}>

                            {(filterProductVal != '') && <TableBatch
                                page={page - 1}
                                rowsPerPage={rowsPerPage}
                                setPage={setPage}
                                setRowsPerPage={setRowsPerPage}
                                handleChangePage={handleChangePage}
                                handleChangeRowsPerPage={handleChangeRowsPerPage}
                                totalRecords={totalRecords}
                                handleUpdate={handleUpdate}
                                handleSortByProductId={handleSortByProductId}
                                handleSortLocationId={handleSortLocationId}
                                handleSortByBatchNo={handleSortByBatchNo}
                                handleSortByQty={handleSortByQty}
                                handleSortByManufacturingDate={handleSortByManufacturingDate}
                                handleSortByExpiryDate={handleSortByExpiryDate}
                                sortDirection={sortDirection}
                                batchData={batchData}
                                handleAuthCheck={handleAuthCheck}
                                apiAccess={apiAccess}
                                config={config}
                                isBatchCloud={true}
                            />}
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
    return validateToken(context, 'Batch Cloud Upload')
}
export default ProtectedRoute(Index)