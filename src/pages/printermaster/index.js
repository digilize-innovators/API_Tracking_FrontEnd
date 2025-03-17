'use-client'
import { Button, Paper, TableContainer } from '@mui/material'
import Box from '@mui/material/Box'
import Grid2 from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { IoMdAdd } from 'react-icons/io'
import { useApiAccess } from 'src/@core/hooks/useApiAccess'
import { useLoading } from 'src/@core/hooks/useLoading'
import { useSettings } from 'src/@core/hooks/useSettings'
import AccessibilitySettings from 'src/components/AccessibilitySettings'
import AuthModal from 'src/components/authModal'
import ChatbotComponent from 'src/components/ChatbotComponent'
import ProtectedRoute from 'src/components/ProtectedRoute'
import SnackbarAlert from 'src/components/SnackbarAlert'
import { useAuth } from 'src/Context/AuthContext'
import { api } from 'src/utils/Rest-API'
import { getTokenValues } from '../../utils/tokenUtils'
import ExportResetActionButtons from 'src/components/ExportResetActionButtons'
import { validateToken } from 'src/utils/ValidateToken'
// import { style } from 'src/configs/generalConfig'
// import FormControl from '@mui/material/FormControl'
// import Modal from '@mui/material/Modal'
// import InputLabel from '@mui/material/InputLabel'
// import FormHelperText from '@mui/material/FormHelperText'
// import Select from '@mui/material/Select'
// import MenuItem from '@mui/material/MenuItem'
import TablePrinterMaster from 'src/views/tables/TablePrinterMaster'
import EsignStatusDropdown from 'src/components/EsignStatusDropdown'
import CustomSearchBar from 'src/components/CustomSearchBar'
import downloadPdf from 'src/utils/DownloadPdf'
import PrinterMasterModal from 'src/components/Modal/PrinterMasterModal'

const Index = () => {
    const { settings } = useSettings()
    const [openModal, setOpenModal] = useState(false)
    // const [printerCategoryId, setPrinterCategoryId] = useState('')
    // const [printerId, setPrinterId] = useState('')
    // const [printerIp, setPrinterIp] = useState('')
    // const [printerPort, setPrinterPort] = useState('')
    const [alertData, setAlertData] = useState({openSnackbar: false, type: '', message: '', variant: 'filled' })
    // const [errorPrinterCategoryId, setErrorPrinterCategoryId] = useState({ isError: false, message: '' })
    // const [errorPrinterId, setErrorPrinterId] = useState({ isError: false, message: '' })
    // const [errorPrinterIp, setErrorPrinterIp] = useState({ isError: false, message: '' })
    // const [errorPrinterPort, setErrorPrinterPort] = useState({ isError: false, message: '' })
    const [allPrinterMasterData, setAllPrinterMasterData] = useState([])
    const [allPrinterCategory, setAllPrinterCategory] = useState([])
    const [editData, setEditData] = useState({})
    const [sortDirection, setSortDirection] = useState('asc')
    const { setIsLoading } = useLoading();
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(settings.rowsPerPage)
    const [totalRecords, setTotalRecords] = useState(0)
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
    const apiAccess = useApiAccess("printermaster-create", "printermaster-update", "printermaster-approve")
     const [tableHeaderData, setTableHeaderData] = useState({esignStatus: '', searchVal: ''});
  const [formData, setFormData] = useState({})

    useLayoutEffect(() => {
        let data = getUserData();
        const decodedToken = getTokenValues();
        setConfig(decodedToken);
        setUserDataPdf(data);
        getAllPrinterCategory()
        return () => { }
      }, [])

    useEffect(() => {
        getAllPrinterMasterData()
    }, [tableHeaderData, rowsPerPage, page])
     const tableBody = allPrinterMasterData.map((item, index) => [
        index + 1, 
        item.PrinterCategory.printer_category_name, item.printer_id, item.printer_ip, item.printer_port, item.esign_status
      ]);
      allPrinterMasterData.map((item)=>{
        console.log(item)
      })
      const tableData = useMemo(() => ({
        tableHeader: ['Sr.No.', 'Printer Category', 'Printer ID', 'Printer IP', 'Printer PORT', 'E-Sign'],
        tableHeaderText: 'Printer Master Report ',
        tableBodyText: 'Printer Master Data',
        filename:"PrinterMaster" 
      }), []);

    const getAllPrinterCategory = async () => {
        try {
            setIsLoading(true)
            const res = await api('/printercategory', {}, 'get', true)
            if (res.data.success) {
                setAllPrinterCategory(res.data.data.printerCategories)
                setTotalRecords(res.data.data.total)
                console.log('All printer category', res.data)
            } else {
                console.log('Error to get all printer category', res.data)
                if (res.data.code === 401) {
                    removeAuthToken();
                    router.push('/401');
                }
            }
        } catch (error) {
            console.log('Error in get printer category', error)
        } finally {
            setIsLoading(false)
        }
    }

    const getAllPrinterMasterData = async () => {
        try {
            setIsLoading(true)
            const params = new URLSearchParams({
                page: page + 1,
                limit: rowsPerPage === -1 ? -1 : rowsPerPage,
                search: tableHeaderData.searchVal,
                esign_status: tableHeaderData.esignStatus,
            });
            const res = await api(`/printermaster/?${params.toString()}`, {}, 'get', true);
            console.log('All printer master data', res.data)
            if (res.data.success) {
                setAllPrinterMasterData(res.data.data.printerMasters)
                setTotalRecords(res.data.data.total)
                console.log('All printer master data', res.data)
            } else {
                console.log('Error to get printer master data', res.data)
                if (res.data.code === 401) {
                    removeAuthToken();
                    router.push('/401');
                }
            }
        } catch (error) {
            console.log('Error in get printer master data', error)
        } finally {
            setIsLoading(false)
        }
    }

    const closeSnackbar = () => {
        setAlertData({ ...alertData, openSnackbar: false })
    }

    const handleOpenModal = () => {
        setApproveAPI({ approveAPIEndPoint:'/api/v1/printermaster',approveAPImethod:'POST',approveAPIName:'printermaster-create'})
        getAllPrinterCategory()
        setOpenModal(true)

        // setErrorPrinterCategoryId({ isError: false, message: '' })
        // setErrorPrinterId({ isError: false, message: '' })
        // setErrorPrinterIp({ isError: false, message: '' })
        // setErrorPrinterPort({ isError: false, message: '' })

        // setPrinterCategoryId('')
        // setPrinterId('')
        // setPrinterIp('')
        // setPrinterPort('')

        setEditData({})

        // resetForm();
    }
    const handleCloseModal = () => {
        setEditData({})
        setOpenModal(false)
    }
    const handleAuthModalClose = () => {
        setAuthModalOpen(false);
        setOpenModalApprove(false);
    };

    // const applyValidation = () => {

    //     if (printerCategoryId.trim() === '') {
    //         setErrorPrinterCategoryId({ isError: true, message: "Printer category can't be empty" })
    //     } else {
    //         setErrorPrinterCategoryId({ isError: false, message: '' })
    //     }

    //     if (printerId.trim() === '') {
    //         setErrorPrinterId({ isError: true, message: "Printer can't be empty" })
    //     }
    //     else if (!(/^[a-zA-Z0-9]+$/.test(printerId))) {
    //         setErrorPrinterId({ isError: true, message: "Printer ID cannot contain any special symbols" })
    //     }
    //     else if (printerId.length > 50) {
    //         setErrorPrinterId({ isError: true, message: "Invalid Printer ID" })
    //     } else {
    //         setErrorPrinterId({ isError: false, message: '' })
    //     }
    //     if (printerIp.trim() === '') {
    //         setErrorPrinterIp({ isError: true, message: "Printer IP can't be empty" })
    //     } else if (!/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(printerIp)) {
    //         setErrorPrinterIp({ isError: true, message: "Invalid IP address" })
    //     } else {
    //         setErrorPrinterIp({ isError: false, message: '' })
    //     }

    //     if (printerPort.trim() === '') {
    //         setErrorPrinterPort({ isError: true, message: "Printer port can't be empty" })
    //     }
    //     else if (!/^((6553[0-5])|(655[0-2][0-9])|(65[0-4][0-9]{2})|(6[0-4][0-9]{3})|([1-5][0-9]{4})|([0-5]{0,5})|([0-9]{1,4}))$/.test(printerPort)) {
    //         setErrorPrinterPort({ isError: true, message: "Invalid port number" })
    //     }
    //     else {
    //         setErrorPrinterPort({ isError: false, message: '' })
    //     }

    // }

    // const checkValidate = () => {
    //     return !(
    //         printerCategoryId.trim() === '' ||
    //         printerId.trim() === '' ||
    //         printerIp.trim() === '' ||
    //         (!(/^[a-zA-Z0-9]+$/.test(printerId))) || printerPort.trim() === '' ||
    //         !/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(printerIp) ||
    //         !/^[0-9]+$/.test(printerPort) ||
    //         !/^((6553[0-5])|(655[0-2][0-9])|(65[0-4][0-9]{2})|(6[0-4][0-9]{3})|([1-5][0-9]{4})|([0-5]{0,5})|([0-9]{1,4}))$/.test(printerPort)
    //     )
    // }

    const resetForm = () => {
        setEditData({})
    }
    // const resetEditForm = () => {
    //     setPrinterCategoryId('')
    //     setPrinterIp('')
    //     setPrinterPort('')
    // }
    const handleSubmitForm = async (data) => {
        console.log("data",data)
        setFormData(data)
        if (editData?.id) {
            setApproveAPI({approveAPIEndPoint:"/api/v1/printermaster",approveAPImethod:"PUT",approveAPIName:"printermaster-update"})
        } else {
            setApproveAPI({approveAPIEndPoint:"/api/v1/printermaster",approveAPImethod:"POST",approveAPIName:"printermaster-create"})
        }
        if (config?.config?.esign_status) {
            setAuthModalOpen(true);
            return;
        }
        const esign_status = "approved";
        editData?.id ? editPrinterMaster() : AddPrinterMaster(esign_status);
    }
    const AddPrinterMaster = async (esign_status, remarks) => {
        try {
            console.log(formData);
            
            const data = { ...formData };
            const auditlogRemark = remarks;
            const audit_log = config?.config?.audit_logs ? {
                "audit_log": true,
                "performed_action": "add",
                "remarks": auditlogRemark?.length > 0 ? auditlogRemark : `Printer Master added - ${formData.printerId}`,
            } : {
                "audit_log": false,
                "performed_action": "none",
                "remarks": `none`,
            };
            data.audit_log = audit_log;
            data.esign_status = esign_status;
            console.log('Add printer Master data ', data)
            setIsLoading(true);
            const res = await api('/printermaster/', data, 'post', true)
            setIsLoading(false);
            if (res?.data?.success) {
                console.log('res data', res?.data)
                setAlertData({ ...alertData,openSnackbar:true, type: 'success', message: 'Printer Master added successfully' });
                getAllPrinterMasterData();
                resetForm();
            } else {
                console.log('Erorr to add printer master', res.data)
                setAlertData({ ...alertData, openSnackbar:true, type: 'error', message: res.data?.message })
                if (res.data.code === 401) {
                    removeAuthToken();
                    router.push('/401');
                }
            }
        } catch (error) {
            console.log('Erorr to add printer master', error)
            router.push('/500');
        } finally {
            setOpenModal(false);
            setApproveAPI({approveAPIEndPoint:'',approveAPImethod:'',approveAPIName:''})
        }
    }
    const editPrinterMaster = async (esign_status, remarks) => {
        try {
            const data = {...formData };
            const auditlogRemark = remarks;
            let audit_log;
            if (config?.config?.audit_logs) {
                audit_log = {
                    "audit_log": true,
                    "performed_action": "edit",
                    "remarks": auditlogRemark?.length > 0 ? auditlogRemark : `Printer Master edited - ${formData.printerId}`,
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
            setIsLoading(true);
            const res = await api(`/printermaster/${editData.id}`, data, 'put', true)
            setIsLoading(false);
            if (res.data.success) {
                console.log('res ', res.data)
                setAlertData({ ...alertData,openSnackbar:true, type: 'success', message: 'Printer master updated successfully' })
                resetForm();
                getAllPrinterMasterData();
            } else {
                console.log('error to edit Printer Master', res.data)
                setAlertData({ ...alertData,openSnackbar:true, type: 'error', message: res.data.message })
                if (res.data.code === 401) {
                    removeAuthToken();
                    router.push('/401');
                }
            }
        } catch (error) {
            console.log('Erorr to edit Printer Master', error)
            router.push('/500');
        } finally {
            setOpenModal(false);
            setIsLoading(false);
            setApproveAPI({approveAPIEndPoint:'',approveAPImethod:'',approveAPIName:''})
        }
    }
    const handleUpdate = item => {

        // setErrorPrinterCategoryId({ isError: false, message: '' })
        // setErrorPrinterId({ isError: false, message: '' })
        // setErrorPrinterIp({ isError: false, message: '' })
        // setErrorPrinterPort({ isError: false, message: '' })

        resetForm()
        setEditData(item)
        console.log('edit Printer Master', item)
        getAllPrinterCategory()
        setOpenModal(true)
    }

    const handleAuthResult = async (isAuthenticated, user, isApprover, esignStatus, remarks) => {
        console.log("handleAuthResult 01", isAuthenticated, isApprover, esignStatus, user);
        console.log("handleAuthResult 02", config?.userId, user.user_id);
        const resetState = () => {
            setApproveAPI({approveAPIEndPoint:'',approveAPImethod:'',approveAPIName:''})
            setAuthModalOpen(false);
        };
        const handleApproverActions = async () => {
            const data = {
                modelName: "printermaster",
                esignStatus,
                id: eSignStatusId,
                audit_log: config?.config?.audit_logs ? {
                    "user_id": user.userId,
                    "user_name": user.userName,
                    "performed_action": 'approved',
                    "remarks": remarks.length > 0 ? remarks : `printer master approved - ${auditLogMark}`,
                } : {}
            };
            if (esignStatus === "approved" && esignDownloadPdf) {
                setOpenModalApprove(false);
                console.log("esign is approved for approver");
                resetState();
                downloadPdf(tableData,tableHeaderData,tableBody,allPrinterMasterData,userDataPdf);
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
        const handleCreatorActions = () => {
            if (esignStatus === "rejected") {
                setAuthModalOpen(false);
                setOpenModalApprove(false);
            }
            if (esignStatus === "approved") {
                if (esignDownloadPdf) {
                    console.log("esign is approved for creator to download");
                    setOpenModalApprove(true);
                } else {
                    console.log("esign is approved for creator");
                    const esign_status = "pending";
                    editData?.id ? editPrinterMaster(esign_status, remarks) : AddPrinterMaster(esign_status, remarks);
                }
            }
        };
        if (!isAuthenticated) {
            setAlertData({ type: 'error', openSnackbar:true, message: 'Authentication failed, Please try again.' });
            return;
        }
        if (isApprover) {
            await handleApproverActions();
        } else {
            handleCreatorActions();
        }
        resetState();
        getAllPrinterMasterData();
    };
    const handleAuthCheck = async (row) => {
        console.log("handleAuthCheck", row)
        setApproveAPI({approveAPIEndPoint:'/api/v1/printermaster',approveAPImethod:'PATCH',approveAPIName:'printermaster-approve'})
        setAuthModalOpen(true);
        setESignStatusId(row.id);
        setAuditLogMark(row.printer_id)
        console.log("row", row)
    }

    const resetFilter = () => {
        // setESignStatus('')
        setTableHeaderData({...tableHeaderData,esignStatus:"",searchVal:""})

    }
    const handleSearch = (val) => {
        // let currentVal = tempSearchVal
        // currentVal = currentVal.toLowerCase()
        // setSearchVal(currentVal)
        setTableHeaderData({ ...tableHeaderData,searchVal:val.toLowerCase()});

        if (val === '') {
            getAllPrinterMasterData();
        }
    }
    //const handleTempSearchValue = (e) => {
    //     let currentVal = e.target.value
    //     currentVal = currentVal.toLowerCase()
    //     setTempSearchVal(currentVal)
    // }
    const handleChangePage = (event, newPage) => {
        setPage(newPage)
    }
    const handleChangeRowsPerPage = event => {
        setRowsPerPage(parseInt(event.target.value, 10))
        setPage(0)
    }
    const handleAuthModalOpen = () => {
        console.log("OPen auth model");
        setApproveAPI({approveAPIEndPoint:'/api/v1/printermaster',approveAPImethod:'PATCH',approveAPIName:'printermaster-approve'})
        setAuthModalOpen(true);
    };
    const handleDownloadPdf = () => {
        setApproveAPI({approveAPIEndPoint:'/api/v1/printermaster',approveAPImethod:'POST',approveAPIName:'printermaster-create'})
        if (config?.config?.esign_status) {
            console.log("Esign enabled for download pdf");
            setEsignDownloadPdf(true);
            setAuthModalOpen(true);
            return;
        }
        downloadPdf(tableData,tableHeaderData,tableBody,allPrinterMasterData,userDataPdf);
    }
    // const downloadPdf = () => {
    //     console.log('clicked on download btn')
    //     const doc = new jsPDF()
    //     const headerContent = () => {
    //         headerContentFix(doc, 'Printer Master Report');

    //         if (searchVal) {
    //             doc.setFontSize(10)
    //             doc.text('Search : ' + `${tempSearchVal}`, 15, 25)
    //         } else {
    //             doc.setFontSize(10)
    //             doc.text('Search : ' + '__', 15, 25)
    //         }
    //         doc.text("Filters :\n", 15, 30)
    //         if (eSignStatus) {
    //             doc.setFontSize(10)
    //             doc.text('E-Sign : ' + `${eSignStatus}`, 20, 35)
    //         } else {
    //             doc.setFontSize(10)
    //             doc.text('E-Sign : ' + '__', 20, 35)
    //         }
    //         doc.setFontSize(12)
    //         doc.text('Printer Master Data', 15, 55)
    //     }
    //     const bodyContent = () => {
    //         let currentPage = 1
    //         let dataIndex = 0
    //         const totalPages = Math.ceil(allPrinterMasterData.length / 25)
    //         headerContent()
    //         while (dataIndex < allPrinterMasterData.length) {
    //             if (currentPage > 1) {
    //                 doc.addPage()
    //             }

    //             footerContent(currentPage, totalPages, userDataPdf, doc);

    //             const body = allPrinterMasterData
    //                 .slice(dataIndex, dataIndex + 25)
    //                 .map((item, index) => [dataIndex + index + 1, item.printer_line_name, item.printer_id, item.printer_ip, item.printer_port, item.esign_status]);
    //             autoTable(doc, {
    //                 startY: currentPage === 1 ? 60 : 40,
    //                 styles: { halign: 'center' },
    //                 headStyles: {
    //                     fontSize: 8,
    //                     fillColor: [80, 189, 160],
    //                 },
    //                 alternateRowStyles: { fillColor: [249, 250, 252] },
    //                 tableLineColor: [80, 189, 160],
    //                 tableLineWidth: 0.1,
    //                 head: [['Sr.No.', 'Printer Category', 'Printer ID', 'Printer IP', 'Printer PORT', 'E-Sign']],
    //                 body: body,
    //                 columnWidth: 'wrap'
    //             })
    //             dataIndex += 25
    //             currentPage++
    //         }
    //     }

    //     bodyContent()
    //     const currentDate = new Date();
    //     const formattedDate = currentDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
    //     const formattedTime = currentDate.toLocaleTimeString('en-US', { hour12: false }).replace(/:/g, '-');
    //     const fileName = `PrinterMaster_${formattedDate}_${formattedTime}.pdf`;
    //     doc.save(fileName);

    // }

    const handleSort = (key) => {
        const newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        const sorted = [...allPrinterMasterData].sort((a, b) => {
            if (a[key] > b[key]) {
                return newSortDirection === 'asc' ? 1 : -1;
            }
            if (a[key] < b[key]) {
                return newSortDirection === 'asc' ? -1 : 1;
            }
            return 0;
        });
        setAllPrinterMasterData(sorted);
        setSortDirection(newSortDirection);
    };

    const handleSortByPrinterCategoryId = () => handleSort('printer_category_id');
    const handleSortByPrinterId = () => handleSort('id');
    const handleSortByPrinterIp = () => handleSort('ip');
    const handleSortByPrinterPort = () => handleSort('port');

    return (
        <Box padding={4}>
            <Head>
                <title>Printer Master</title>
            </Head>
            <Grid2 item xs={12}>
                <Typography variant='h2'>Printer Master</Typography>
            </Grid2>
            <Grid2 item xs={12}>
                <Grid2 item xs={12}>
                    <Box sx={{ backgroundColor: settings.mode === 'dark' ? '#212121' : 'white', borderRadius: 1 }}>
                        <Typography variant='h4' className='mx-4 my-2 mx-2' sx={{ paddingTop: '1%' }}>
                            Filter
                        </Typography>
                        <Grid2 item xs={12}>
                            <Box className='d-flex justify-content-between align-items-center my-3 mx-4'>
                                {/* remove e sign status dropdown */}
                       <EsignStatusDropdown tableHeaderData={tableHeaderData} setTableHeaderData={setTableHeaderData} />
                        {/* <EsignStatusFilter esignStatus={eSignStatus} setEsignStatus={setESignStatus} /> */}
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
                            <Typography variant='h4' className='mx-4 my-2 mt-3'>
                                Printer Master Data
                            </Typography>
                            <TableContainer component={Paper}>
                                <TablePrinterMaster
                                    allPrinterMasterData={allPrinterMasterData}
                                    handleUpdate={handleUpdate}
                                    handleSortByPrinterCategoryId={handleSortByPrinterCategoryId}
                                    handleSortByPrinterId={handleSortByPrinterId}
                                    handleSortByPrinterIp={handleSortByPrinterIp}
                                    handleSortByPrinterPort={handleSortByPrinterPort}
                                    sortDirection={sortDirection}
                                    page={page}
                                    rowsPerPage={rowsPerPage}
                                    totalRecords={totalRecords}
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
                        {editData?.id ? 'Edit Printer Master' : 'Add Printer Master'}
                    </Typography>

                    <Grid2 container spacing={2} >
                        <Grid2 size={6}>

                            <TextField
                                fullWidth
                                id='outlined-controlled'
                                label='Printer ID'
                                placeholder='Printer ID'
                                value={printerId}
                                onChange={e => {
                                    setPrinterId(e.target.value)
                                    e.target.value && setErrorPrinterId({ isError: false, message: '' })
                                }}
                                required
                                error={errorPrinterId.isError}
                            />
                        </Grid2>
                        <Grid2 size={6}>
                            <FormControl fullWidth required error={errorPrinterCategoryId.isError}>
                                <InputLabel id='label-printer-category'>Printer Category</InputLabel>
                                <Select
                                    labelId='label-printer-category'
                                    id='printer-category'
                                    label='Printer Category'
                                    value={printerCategoryId}
                                    data-testid='printer-category-select'
                                    onChange={(e) => {
                                        setPrinterCategoryId(e.target.value);
                                        setErrorPrinterCategoryId({ isError: false, message: '' });
                                    }}
                                >
                                    {allPrinterCategory?.map((item) => (
                                        <MenuItem role="listbox"
                                            key={item.id} value={item.id}>
                                            {item.printer_category_name}
                                        </MenuItem>
                                    ))}
                                </Select>

                            </FormControl>
                        </Grid2>
                    </Grid2>

                    <Grid2 container spacing={2} sx={{ margin: "0.5rem 0rem" }}>
                        <Grid2 size={6}>
                            <FormHelperText error={errorPrinterId.isError}>
                                {errorPrinterId.isError ? errorPrinterId.message : ''}
                            </FormHelperText>
                        </Grid2>
                        <Grid2 size={6}>
                            <FormHelperText error={errorPrinterCategoryId.isError}>
                                {errorPrinterCategoryId.isError ? errorPrinterCategoryId.message : ''}
                            </FormHelperText>
                        </Grid2>
                    </Grid2>


                    <Grid2 container spacing={2}>
                        <Grid2 size={6}>
                            <TextField
                                fullWidth
                                id='outlined-controlled'
                                label='Printer Port'
                                placeholder='Printer Port'
                                value={printerPort}
                                onChange={e => {
                                    setPrinterPort(e.target.value)
                                    e.target.value && setErrorPrinterPort({ isError: false, message: '' })
                                }}
                                required
                                error={errorPrinterPort.isError}
                            />
                        </Grid2>
                        <Grid2 size={6}>
                            <TextField
                                fullWidth
                                id='outlined-controlled'
                                label='Printer IP'
                                placeholder='Printer IP'
                                value={printerIp}
                                onChange={e => {
                                    setPrinterIp(e.target.value)
                                    e.target.value && setErrorPrinterIp({ isError: false, message: '' })
                                }}
                                required
                                error={errorPrinterIp.isError}
                            />
                        </Grid2>
                    </Grid2>

                    <Grid2 container spacing={2}>
                        <Grid2 size={6}>
                            <FormHelperText error={errorPrinterPort.isError}>
                                {errorPrinterPort.isError ? errorPrinterPort.message : ''}
                            </FormHelperText>
                        </Grid2>
                        <Grid2 size={6}>
                            <FormHelperText error={errorPrinterIp.isError}>
                                {errorPrinterIp.isError ? errorPrinterIp.message : ''}
                            </FormHelperText>
                        </Grid2>
                    </Grid2>

                    <Grid2 item xs={12} className='mt-3'>
                        <Button variant='contained' sx={{ marginRight: 3.5 }} onClick={handleSubmitForm}>
                            Save Changes
                        </Button>
                        <Button type='reset' variant='outlined' color='primary' onClick={editData?.id ? resetEditForm : resetForm}>
                            Reset
                        </Button>
                        <Button variant='outlined' color='error' sx={{ marginLeft: 3.5 }} onClick={handleCloseModal}>
                            Close
                        </Button>
                    </Grid2>
                </Box>
            </Modal> */}

            <PrinterMasterModal open={openModal} onClose={handleCloseModal} editData={editData} handleSubmitForm={handleSubmitForm} allPrinterCategory={allPrinterCategory} />

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
    return validateToken(context, 'Printer Master')
}
export default ProtectedRoute(Index)