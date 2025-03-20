'use-client'
import React, { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Grid2 from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import { Button, TextField, TableContainer, Paper, FormHelperText } from '@mui/material'
import { IoMdAdd } from 'react-icons/io'
import Modal from '@mui/material/Modal'
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
import TableControlPanelMaster from 'src/views/tables/TableControlPanelMaster'
import ControlPanelModal from 'src/components/Modal/ControlPanelModal'

const Index = () => {
    const router = useRouter()
    const { settings } = useSettings()
    const [eSignStatus, setESignStatus] = useState('')
    const [tempSearchVal, setTempSearchVal] = useState('')
    const [openModal, setOpenModal] = useState(false)

    const [name, setName] = useState('')
    const [ip, setIp] = useState('')
    const [port, setPort] = useState('')

    const [openSnackbar, setOpenSnackbar] = useState(false)
    const [alertData, setAlertData] = useState({ type: '', message: '', variant: 'filled' })
    const [searchVal, setSearchVal] = useState('')

    const [errorName, setErrorName] = useState({ isError: false, message: '' })
    const [errorIp, setErrorIp] = useState({ isError: false, message: '' })
    const [errorPort, setErrorPort] = useState({ isError: false, message: '' })

    const [controlPanelData, setControlPanelData] = useState([])

    const [totalCount, setTotalCount] = useState(0)
    const [sortDirection, setSortDirection] = useState('asc')
    const [sortBy, setSortBy] = useState('name')
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
    const [formData,setFormData]=useState({})
    const [esignDownloadPdf, setEsignDownloadPdf] = useState(false);
    const [openModalApprove, setOpenModalApprove] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);

    const apiAccess = useApiAccess(
        "controlpanelmaster-create",
        "controlpanelmaster-update",
        "controlpanelmaster-approve"
    );
    useEffect(() => {
        if (formData && pendingAction) {
            const esign_status = "approved";
            if (pendingAction === "edit") {
                editControlPanelMaster();
            } else {
                addControlPanelMaster(esign_status);
            }
            setPendingAction(null);
        }
    }, [formData, pendingAction]);

    useEffect(() => {
        let data = getUserData();
        setUserDataPdf(data);
        decodeAndSetConfig(setConfig);
        return () => { }
    }, []);

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
            const response = await api(`/controlpanelmaster/?${params.toString()}`, {}, 'get', true)
            console.log('controlpanelmaster data res ', response.data)
            if (response.data.success) {
                setControlPanelData(response.data.data.controlPanelMasters)
                setTotalCount(response.data.data.total)
            } else {
                console.log('Error to get all controlpanelmasters ', response.data)
                if (response.data.code === 401) {
                    removeAuthToken();
                    router.push('/401');
                }
            }
        } catch (error) {
            console.log(error)
            console.log('Error in get controlpanelmasters ', error)
        } finally {
            setIsLoading(false)
        }
    }

    const closeSnackbar = () => {
        setOpenSnackbar(false)
    }
    const handleOpenModal = () => {
        setApproveAPIName("controlpanelmaster-create");
        setApproveAPImethod("POST");
        setApproveAPIEndPoint("/api/v1/controlpanelmaster");
        setEditData({})
        setOpenModal(true);
    }
    const handleCloseModal = () => {
        setOpenModal(false)
        setEditData({})
        // setErrorName({ isError: false, message: '' })
        // setErrorIp({ isError: false, message: '' })
        // setErrorPort({ isError: false, message: '' })
    }
    const applyValidation = () => {
        console.log(name.trim().length,)
        if (name.length > 256) {
            setErrorName({ isError: true, message: 'Control Panel Name length should be less than 256' })
        } else if (name.trim() === '') {
            setErrorName({ isError: true, message: "Control Panel Name can't be empty" })
        } else if (!(/^[a-zA-Z0-9]+\s*(?:[a-zA-Z0-9]+\s*)*$/.test(name))) {
            setErrorName({ isError: true, message: "Control Panel Name cannot contain any special symbols" })
        }
        else {
            setErrorName({ isError: false, message: '' })
        }

        if (ip.trim() === '') {
            setErrorIp({ isError: true, message: "IP Address can't be empty" });
        } else {
            const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}$/;
            const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

            if (ipv4Regex.test(ip) || ipv6Regex.test(ip)) {
                setErrorIp({ isError: false, message: '' });
            } else {
                setErrorIp({ isError: true, message: 'Provide a valid IP address' });
            }
        }

        if (port === '') {
            setErrorPort({ isError: true, message: "Port Number can't be empty" });
        } else if (!/^\d+$/.test(port)) {
            setErrorPort({ isError: true, message: 'Port Number must be a valid number' });
        } else if (parseInt(port, 10) < 1 || parseInt(port, 10) > 65535) {
            setErrorPort({ isError: true, message: 'Port Number must be between 1 and 65535' });
        } else {
            setErrorPort({ isError: false, message: '' });
        }

    }
    const checkValidate = () => {
        const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}$/;
        const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
        const nameRegex = !(/^[a-zA-Z0-9]+\s*(?:[a-zA-Z0-9]+\s*)*$/.test(name))

        return (
            name.trim() === '' ||
            nameRegex ||
            name.length > 51 ||
            ip.trim() === '' ||
            ip.length > 30 ||
            port === '' ||
            (parseInt(port, 10) < 1 || parseInt(port, 10) > 65535) ||
            !(ipv4Regex.test(ip) || ipv6Regex.test(ip))
        );
    };
    const handleAuthModalClose = () => {
        setAuthModalOpen(false);
        setOpenModalApprove(false);
    };
    const resetForm = () => {
        // setName('')
        // setIp('')
        // setPort('')
        // setErrorName({ isError: false, message: '' })
        // setErrorIp({ isError: false, message: '' })
        // setErrorPort({ isError: false, message: '' })
        setEditData({})
    }
    const resetEditForm = () => {
        setName('')
        setIp('')
        setPort('')
        setErrorName({ isError: false, message: '' })
        setErrorIp({ isError: false, message: '' })
        setErrorPort({ isError: false, message: '' })
    }
    const handleSubmitForm = async (data) => {
        console.log('data',data)
        setFormData(data)

        if (editData?.id) {
            setApproveAPIName("controlpanelmaster-update");
            setApproveAPImethod("PUT");
            setApproveAPIEndPoint("/api/v1/controlpanelmaster");
        } else {
            setApproveAPIName("controlpanelmaster-create");
            setApproveAPImethod("POST");
            setApproveAPIEndPoint("/api/v1/controlpanelmaster");
        }
        // applyValidation();
        // const validate = checkValidate();
        // if (validate) {
        //     return;
        // }
        if (config?.config?.esign_status) {
            setAuthModalOpen(true);
            return;
        }
        const esign_status = "approved";
        console.log("data",formData)
        setPendingAction(editData?.id ? "edit" : "add");

        // editData?.id ? editControlPanelMaster() : addControlPanelMaster(esign_status);
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
            "remarks": remarks?.length > 0 ? remarks : `control panel master ${action} - ${auditLogMark}`,
        } : {};
        const handleUpdateStatus = async () => {
            const data = {
                modelName: "controlpanelmaster",
                esignStatus,
                id: eSignStatusId,
                audit_log: createAuditLog(esignStatus),
            };
            const res = await api('/esign-status/update-esign-status', data, 'patch', true);
            console.log("esign status update", res?.data);
            getData();
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
                    editData?.id ? editControlPanelMaster(esign_status, remarks) : addControlPanelMaster(esign_status, remarks);
                }
            }
        };

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
        setApproveAPIName("controlpanelmaster-approve");
        setApproveAPImethod("PATCH");
        setApproveAPIEndPoint("/api/v1/controlpanelmaster");
        setAuthModalOpen(true);
        setESignStatusId(row.id);
        setAuditLogMark(row.name)
    }
    const addControlPanelMaster = async (esign_status, remarks) => {
        try {

            console.log("formData",formData)
            const data = { name:formData.name, ip:formData.ip, port:formData.port  };

            const auditlogRemark = remarks
            const audit_log = config?.config?.audit_logs ? {
                "audit_log": true,
                "performed_action": "add",
                "remarks": auditlogRemark?.length > 0 ? auditlogRemark : `control panel master added - ${formData.name}`,
            } : {
                "audit_log": false,
                "performed_action": "none",
                "remarks": `none`,
            };
            data.audit_log = audit_log;
            data.esign_status = esign_status;
            setIsLoading(true)
            const res = await api('/controlpanelmaster/', data, 'post', true)
            setIsLoading(false)

            if (res?.data?.success) {
                setOpenSnackbar(true)
                setAlertData({ ...alertData, type: 'success', message: 'Control panel master added successfully' })
                getData()
                setEditData({})
            } else {
                setOpenSnackbar(true)
                setAlertData({ ...alertData, type: 'error', message: res.data?.message })
                if (res.data.code === 401) {
                    removeAuthToken();
                    router.push('/401');
                }
            }
        } catch (error) {
            console.log("Error in add controlpanelmaster ", error);
            router.push('/500');
        } finally {
            setApproveAPIName('')
            setApproveAPImethod('')
            setApproveAPIEndPoint('')
            setOpenModal(false)
            setIsLoading(false)
        }
    }
    const editControlPanelMaster = async (esign_status, remarks) => {
        try {
            const data = { name, ip, port }
            const auditlogRemark = remarks
            let audit_log;
            if (config?.config?.audit_logs) {
                audit_log = {
                    "audit_log": true,
                    "performed_action": "edit",
                    "remarks": auditlogRemark?.length > 0 ? auditlogRemark : `control panel master edited - ${name}`,
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
            const res = await api(`/controlpanelmaster/${editData.id}`, data, 'put', true)
            setIsLoading(false)
            if (res.data.success) {
                setOpenSnackbar(true)
                setAlertData({ ...alertData, type: 'success', message: 'Control panel master updated successfully' })
                setEditData({})
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
            setEditData({})
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
        setEditData(item);
        // setFormData({...FormData, name: formData.name,  // Set a default value for name
        //     ip:formData.ip,     // Set a default IP
        //     port: formData.ip,});
        setOpenModal(true);

        
    }
    const handleSortByName = () => {
        const newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc'
        const sorted = [...controlPanelData].sort((a, b) => {
            if (a.name > b.name) {
                return newSortDirection === 'asc' ? 1 : -1
            }
            if (a.name < b.name) {
                return newSortDirection === 'asc' ? -1 : 1
            }
            return 0
        })
        setControlPanelData(sorted)
        setSortDirection(newSortDirection)
    }

    const handleSortByPort = () => {
        const newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        const sorted = [...controlPanelData].sort((a, b) =>
            newSortDirection === 'asc' ? a.port - b.port : b.port - a.port
        );
        setControlPanelData(sorted);
        setSortDirection(newSortDirection);
    };


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
            headerContentFix(doc, 'Control panel master Report');

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
            doc.text('Control panel master Data', 15, 55)
        }
        const bodyContent = () => {
            let currentPage = 1
            let dataIndex = 0
            const totalPages = Math.ceil(controlPanelData.length / 25)
            headerContent()
            while (dataIndex < controlPanelData.length) {
                if (currentPage > 1) {
                    doc.addPage()
                }
                footerContent(currentPage, totalPages, userDataPdf, doc);

                const body = controlPanelData
                    .slice(dataIndex, dataIndex + 25)
                    .map((item, index) => [
                        dataIndex + index + 1,
                        item.name,
                        item.ip,
                        item.port,
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
                    head: [['Sr.No.', 'Name', 'IP', 'Port', 'E-Sign']],
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
        const fileName = `control_panel_master_report_${formattedDate}_${formattedTime}.pdf`
        doc.save(fileName)
    }
    const handleAuthModalOpen = () => {
        console.log("OPen auth model");
        setApproveAPIName("controlpanelmaster-approve");
        setApproveAPImethod("PATCH");
        setApproveAPIEndPoint("/api/v1/controlpanelmaster");
        setAuthModalOpen(true);
    };
    const handleDownloadPdf = () => {
        setApproveAPIName("controlpanelmaster-create");
        setApproveAPImethod("POST");
        setApproveAPIEndPoint("/api/v1/controlpanelmaster");
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
                <title>Control Panel Master</title>
            </Head>
            <Grid2 item xs={12}>
                <Typography variant='h2'>Control Panel Master</Typography>
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
                                Control Panel Master Data
                            </Typography>
                            <TableContainer component={Paper}>
                                <TableControlPanelMaster
                                    controlPanelData={controlPanelData}
                                    handleUpdate={handleUpdate}
                                    handleSortByName={handleSortByName}
                                    handleSortByPort={handleSortByPort}
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
            {/* <Modal
                open={openModal}
                onClose={handleCloseModal}
                aria-labelledby='modal-modal-title'
                aria-describedby='modal-modal-description'
                data-testid="modal"
                role='dialog'
            >
                <Box sx={style}>
                    <Typography variant='h4' className='my-2'>
                        {editData?.id ? 'Edit Control Panel' : 'Add Control Panel'}
                    </Typography>
                    <Grid2 container spacing={2}>
                        <Grid2 size={6}>
                            <TextField
                                fullWidth
                                id='outlined-controlled'
                                label='Control Panel Name'
                                placeholder='Control Panel Name'
                                value={name}
                                onChange={e => {
                                    setName(e.target.value)
                                    e.target.value && setErrorName({ isError: false, message: '' })
                                }}
                                required={true}
                                error={errorName.isError}
                                disabled={!!editData?.id}
                            />
                        </Grid2>
                        <Grid2 size={6}>
                            <TextField
                                fullWidth
                                id='outlined-controlled'
                                label='IP Address'
                                placeholder='IP Address'
                                value={ip}
                                onChange={e => {
                                    setIp(e.target.value)
                                    e.target.value && setErrorIp({ isError: false, message: '' })
                                }}
                                required={true}
                                error={errorIp.isError}
                            />
                        </Grid2>
                    </Grid2>
                    <Grid2 container spacing={2} >
                        <Grid2 size={6} sx={{ padding: "0.5rem 0.5rem" }}>
                            <FormHelperText error={errorName.isError}>
                                {errorName.isError ? errorName.message : ''}
                            </FormHelperText>
                        </Grid2>
                        <Grid2 size={6} sx={{ padding: "0.5rem 0.5rem" }}>
                            <FormHelperText error={errorIp.isError}>
                                {errorIp.isError ? errorIp.message : ''}
                            </FormHelperText>
                        </Grid2>

                    </Grid2>
                    <Grid2 container spacing={2}>
                        <Grid2 size={6}>
                            <TextField
                                fullWidth
                                id='outlined-controlled'
                                label='Port No.'
                                placeholder='Port No.'
                                value={port}
                                onChange={e => {
                                    setPort(parseInt(e.target.value, 10) || '')
                                    e.target.value && setErrorPort({ isError: false, message: '' })
                                }}
                                required={true}
                                error={errorPort.isError}
                            />
                        </Grid2>
                        <Grid2 size={6}>

                        </Grid2>
                    </Grid2>
                    <Grid2 container>
                        <Grid2 size={6} sx={{ padding: "0.5rem 0.5rem" }}>
                            <FormHelperText error={errorPort.isError}>
                                {errorPort.isError ? errorPort.message : ''}                            </FormHelperText>
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
            </Modal> */}
<ControlPanelModal
                openModal={openModal}
                handleCloseModal={handleCloseModal}
                editData={editData}
                handleSubmitForm={handleSubmitForm}
            />            <AuthModal
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
    return validateToken(context, "Control Panel Master")
}

export default ProtectedRoute(Index)