'use-client'
import { Button, Paper, TableContainer, TextField } from '@mui/material'
import Box from '@mui/material/Box'
import Grid2 from '@mui/material/Grid2'
import Modal from '@mui/material/Modal'
import Typography from '@mui/material/Typography'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { IoMdAdd } from 'react-icons/io'
import { useApiAccess } from 'src/@core/hooks/useApiAccess'
import { useLoading } from 'src/@core/hooks/useLoading'
import { useSettings } from 'src/@core/hooks/useSettings'
import AccessibilitySettings from 'src/components/AccessibilitySettings'
import AuthModal from 'src/components/authModal'
import ChatbotComponent from 'src/components/ChatbotComponent'
import ProtectedRoute from 'src/components/ProtectedRoute'
import SnackbarAlert from 'src/components/SnackbarAlert'
import { style } from 'src/configs/generalConfig'
import { useAuth } from 'src/Context/AuthContext'
import { api } from 'src/utils/Rest-API'
import { Switch, FormControlLabel } from '@mui/material'
import { decodeAndSetConfig } from '../../utils/tokenUtils'
import ExportResetActionButtons from 'src/components/ExportResetActionButtons'
import SearchBar from 'src/components/SearchBarComponent'
import EsignStatusFilter from 'src/components/EsignStatusFilter'
import { footerContent } from 'src/utils/footerContentPdf';
import { headerContentFix } from 'src/utils/headerContentPdfFix';
import { validateToken } from 'src/utils/ValidateToken'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import FormHelperText from '@mui/material/FormHelperText'
import Select from '@mui/material/Select'

import MenuItem from '@mui/material/MenuItem'
import TablePrinterLineConfiguration from 'src/views/tables/TablePrinterLineConfiguration'

const Index = () => {
    const { settings } = useSettings()
    const [eSignStatus, setESignStatus] = useState('')
    const [searchVal, setSearchVal] = useState('')
    const [tempSearchVal, setTempSearchVal] = useState('')
    const [openModal, setOpenModal] = useState(false)

    const [printerLineName, setPrinterLineName] = useState('')
    const [printer, setPrinter] = useState('')
    const [printerEnabled, setPrinterEnabled] = useState(false)
    const [printerCategoryId, setPrinterCategoryId] = useState("")
    const [locationId, setLocationId] = useState('')
    const [areaCategoryId, setAreaCategoryId] = useState('')
    const [areaId, setAreaId] = useState('')
    const [controlpanelId, setControlpanelId] = useState('')
    const [lineNo, setLineNo] = useState('')

    const [openSnackbar, setOpenSnackbar] = useState(false)
    const [alertData, setAlertData] = useState({ type: '', message: '', variant: 'filled' })
    const [errorPrinterLineName, setErrorPrinterLineName] = useState({ isError: false, message: '' })
    const [errorPrinter, setErrorPrinter] = useState({ isError: false, message: '' })
    const [errorAreaCategoryId, setErrorAreaCategoryId] = useState({ isError: false, message: '' })
    const [errorAreaId, setErrorAreaId] = useState({ isError: false, message: '' })
    const [errorLocationId, setErrorLocationId] = useState({ isError: false, message: '' })
    const [errorPrinterCategory, setErrorPrinterCategory] = useState({ isError: false, message: '' })
    const [errorControlpanelId, setErrorControlpanelId] = useState({ isError: false, message: '' })
    const [errorLineNo, setErrorLineNo] = useState({ isError: false, message: '' })

    const [allAreaCategory, setAllAreaCategory] = useState([])
    const [allArea, setAllArea] = useState([])
    const [allLocation, setAllLocation] = useState([])
    const [allPrinterCategory, setAllPrinterCatergory] = useState([])
    const [allPrinter, setAllPrinter] = useState([])
    const [allPrinterLineConfigurationData, setAllPrinterLineConfigurationData] = useState([])
    const [allControlPanelData, setAllControlPanelData] = useState([])

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
    const [approveAPIName, setApproveAPIName] = useState('');
    const [approveAPImethod, setApproveAPImethod] = useState('');
    const [approveAPIEndPoint, setApproveAPIEndPoint] = useState('');
    const [eSignStatusId, setESignStatusId] = useState('');
    const [auditLogMark, setAuditLogMark] = useState('');
    const [esignDownloadPdf, setEsignDownloadPdf] = useState(false);
    const [openModalApprove, setOpenModalApprove] = useState(false);
    const apiAccess = useApiAccess("printerlineconfiguration-create", "printerlineconfiguration-update", "printerlineconfiguration-approve")
    const [cameraIp, setCameraIp] = useState('')
    const [cameraPort, setCameraPort] = useState('')
    const [linePcAddress, setLinePcAddress] = useState('')
    const [errorCameraIp, setErrorCameraIp] = useState({ isError: false, message: '' })
    const [errorCameraPort, setErrorCameraPort] = useState({ isError: false, message: '' })
    const [errorLinePcAddress, setErrorLinePcAddress] = useState({ isError: false, message: '' })

    useEffect(() => {
        let data = getUserData();
        decodeAndSetConfig(setConfig);
        setUserDataPdf(data);
        getAllPrinterCategories()
        getAllAreaCategory()
        getAllLocation()
        getAllControlPanels()
    }, [])
    useEffect(() => {
        getAllPrinterLineConfigurationData()
    }, [eSignStatus, searchVal, rowsPerPage, page])

    useEffect(() => {
        if (areaCategoryId !== '') {
            console.log('area cate changed');
            getAllArea();
        }
    }, [areaCategoryId])

    const getAllPrinterLineConfigurationData = async () => {
        try {
            setIsLoading(true)
            const params = new URLSearchParams({
                page: page + 1,
                limit: rowsPerPage === -1 ? -1 : rowsPerPage,
                search: searchVal,
                esign_status: eSignStatus,
            });
            const res = await api(`/printerlineconfiguration/?${params.toString()}`, {}, 'get', true);
            console.log("get printer line configuration", res?.data)
            if (res.data.success) {
                setAllPrinterLineConfigurationData(res.data.data.printerLineConfigs)
                setTotalRecords(res.data.data.total)
            } else {
                console.log('Error to get all printer line configuration', res.data)
                if (res.data.code === 401) {
                    removeAuthToken();
                    router.push('/401');
                }
            }
        } catch (error) {
            console.log('Error in get printer line configuration', error)
        } finally {
            setIsLoading(false)
        }
    }
    const getAllAreaCategory = async () => {
        try {
            setIsLoading(true)
            const res = await api(`/area-category/`, {}, 'get', true)
            console.log('All area category ', res.data);
            setIsLoading(false)
            if (res.data.success) {
                setAllAreaCategory(res.data.data.areaCategories)
            } else {
                console.log('Error to get all area category', res.data)
                if (res.data.code === 401) {
                    removeAuthToken();
                    router.push('/401');
                }
            }
        } catch (error) {
            console.log('Error in get area category ', error)
            setIsLoading(false)
        }
    }
    const getAllArea = async () => {
        if (areaCategoryId) {
            try {
                setIsLoading(true)
                const res = await api(`/area/byAreaCategory/${areaCategoryId}`, {}, 'get', true);
                console.log('All area ', res.data)
                setIsLoading(false)
                if (res.data.success) {
                    setAllArea(res.data.data.areas)
                } else {
                    console.log('Error to get area ', res.data)
                    if (res.data.code === 401) {
                        removeAuthToken();
                        router.push('/401');
                    }
                }
            } catch (error) {
                console.log('Error in get area ', error)
                setIsLoading(false)
            }
        }
    }
    const getAllLocation = async () => {
        try {
            setIsLoading(true);
            const res = await api('/location/', {}, 'get', true);
            setIsLoading(false);
            console.log('All locations ', res.data);
            if (res.data.success) {
                setAllLocation(res.data.data.locations);
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
    const getAllPrinterMaster = async (printerCategoryID) => {
        try {
            setIsLoading(true);
            const res = await api(`/printermaster/printerByCategory/?printerCategoryID=${printerCategoryID}`, {}, 'get', true);
            setIsLoading(false);
            console.log("Printer Master")
            console.log(res.data)
            console.log('All Printer Category : ', res.data);
            if (res.data.success) {
                setAllPrinter(res.data.data.printerCategories);
            } else {
                console.log('Error to get all printer master ', res.data);
                if (res.data.code === 401) {
                    removeAuthToken();
                    router.push('/401');
                }
            }
        } catch (error) {
            console.log('Error in get printer master ', error);
            setIsLoading(false);
        }
    };

    const getAllPrinterCategories = async () => {
        try {
            console.log("Printer Categories")
            setIsLoading(true);
            const res = await api('/printercategory/', {}, 'get', true);
            setIsLoading(false);
            console.log('All Printer Category : ', res.data.data.printerCategories);
            if (res.data.success) {
                setAllPrinterCatergory(res.data.data.printerCategories);
            } else {
                console.log('Error to get all printer category ', res.data);
                if (res.data.code === 401) {
                    removeAuthToken();
                    router.push('/401');
                }
            }
        } catch (error) {
            console.log('Error in get printer category ', error);
            setIsLoading(false);
        }
    };

    const getAllControlPanels = async () => {
        try {
            console.log("getAllControlPanels")
            setIsLoading(true);
            const res = await api('/controlpanelmaster/', {}, 'get', true);
            setIsLoading(false);
            console.log('All controlPanelMasters : ', res.data.data.controlPanelMasters);
            if (res.data.success) {
                setAllControlPanelData(res.data.data.controlPanelMasters);
            } else {
                console.log('Error to get all controlPanelMasters ', res.data);
                if (res.data.code === 401) {
                    removeAuthToken();
                    router.push('/401');
                }
            }
        } catch (error) {
            console.log('Error in get controlPanelMasters', error);
            setIsLoading(false);
        }
    };

    const closeSnackbar = () => {
        setOpenSnackbar(false)
    }
    const handleOpenModal = () => {
        setErrorPrinterLineName({ isError: false, message: '' })
        setErrorPrinter({ isError: false, message: '' })
        setErrorAreaCategoryId({ isError: false, message: '' })
        setErrorAreaId({ isError: false, message: '' })
        setErrorLocationId({ isError: false, message: '' })
        setErrorControlpanelId({ isError: false, message: '' })
        setErrorLineNo({ isError: false, message: '' })

        setApproveAPIName("printerlineconfiguration-create");
        setApproveAPImethod("POST");
        setApproveAPIEndPoint("/api/v1/printerlineconfiguration");
        resetForm();
        setOpenModal(true)
    }
    const handleCloseModal = () => {
        resetForm();
        resetEditForm();
        setEditData({})
        setOpenModal(false)
    }
    const handleAuthModalClose = () => {
        setAuthModalOpen(false);
        setOpenModalApprove(false);
    };

    const applyValidation = () => {

        if (printerLineName.length > 50) {
            setErrorPrinterLineName({ isError: true, message: 'Line name length should be less than 50' })
            setErrorPrinterLineName({ isError: true, message: 'Line name length should be less than 50' })
        } else if (printerLineName.trim() === '') {
            setErrorPrinterLineName({ isError: true, message: "Line name can't be empty" })
            setErrorPrinterLineName({ isError: true, message: "Line name can't be empty" })
        }
        else if (!(/^[a-zA-Z0-9\s-]+$/.test(printerLineName))) {
            setErrorPrinterLineName({ isError: true, message: "Line name cannot contain any special symbols" })
        }

        else {
            setErrorPrinterLineName({ isError: false, message: '' })
        }


        if (printer.length > 50) {
            setErrorPrinter({ isError: true, message: 'Printer name length should be less than 50' })
        } else if (printer === '') {
            setErrorPrinter({ isError: true, message: "Printer name can't be empty" })
        } else {
            setErrorPrinter({ isError: false, message: '' })
        }

        if (printerCategoryId.length > 50) {
            setErrorPrinterCategory({ isError: true, message: 'Printer name length should be less than 50' })
        } else if (printerCategoryId === '') {
            setErrorPrinterCategory({ isError: true, message: "Select Printer Category" })
        } else {
            setErrorPrinter({ isError: false, message: '' })
        }

        if (areaCategoryId === '') {
            setErrorAreaCategoryId({ isError: true, message: "Area category can't be empty" })
        } else {
            setErrorAreaCategoryId({ isError: false, message: '' })
        }

        if (areaId === '') {
            setErrorAreaId({ isError: true, message: "Area can't be empty" })
        } else {
            setErrorAreaId({ isError: false, message: '' })
        }

        if (locationId === '') {
            setErrorLocationId({ isError: true, message: "Location can't be empty" })
        } else {
            setErrorLocationId({ isError: false, message: '' })
        }

        if (controlpanelId.trim() === '') {
            setErrorControlpanelId({ isError: true, message: "Control Panel can't be empty" })
            setErrorControlpanelId({ isError: true, message: "Control Panel can't be empty" })
        } else {
            setErrorControlpanelId({ isError: false, message: '' })
        }

        if (lineNo === '') {
            setErrorLineNo({ isError: true, message: "Line no. can't be empty" });
        } else if (!/^\d+$/.test(lineNo)) {
            setErrorLineNo({ isError: true, message: "Line no. must be a number" });
            setErrorLineNo({ isError: true, message: "Line no. must be a number" });
        } else if (!(parseInt(lineNo) >= 1 && parseInt(lineNo) <= 5)) {
            setErrorLineNo({ isError: true, message: "Line no. must be between 1 and 5" });
            setErrorLineNo({ isError: true, message: "Line no. must be between 1 and 5" });
        } else {
            setErrorLineNo({ isError: false, message: '' });
        }

    }

    const checkValidate = () => {
        return !(
            printerLineName.trim() === '' ||
            printerLineName.length > 50 ||
            printer.trim() === '' ||
            printer.length > 50 ||
            locationId === '' ||
            areaCategoryId === '' ||
            areaId === '' ||
            controlpanelId === '' ||
            lineNo === '' ||
            (!(/^[a-zA-Z0-9\s-]+$/.test(printerLineName))) ||
            (!(/^[a-zA-Z0-9\s-]+$/.test(printerLineName))) ||
            !/^\d+$/.test(lineNo) ||
            !(parseInt(lineNo) >= 1 && parseInt(lineNo) <= 5)
        )
    }

    const resetForm = () => {
        setAreaId('');
        setAreaCategoryId('');
        setPrinterEnabled(false)
        setLocationId('');
        setPrinter('');
        setPrinterCategoryId('')
        setControlpanelId('')
        setLineNo('')
        setPrinterLineName('');
        setAllArea([]);
        setAllPrinter([])
        setErrorPrinterLineName({ isError: false, message: '' })
        setErrorPrinterCategory({ isError: false, message: '' })
        setErrorLineNo({ isError: false, message: '' })
        setErrorLocationId({ isError: false, message: '' })
        setErrorPrinter({ isError: false, message: '' })
        setErrorAreaCategoryId({ isError: false, message: '' })
        setErrorControlpanelId({ isError: false, message: '' })
        setErrorAreaId({ isError: false, message: '' })
        setCameraIp('')
        setCameraPort('')
        setLinePcAddress('')
        setErrorCameraIp({ isError: false, message: '' })
        setErrorCameraPort({ isError: false, message: '' })
        setErrorLinePcAddress({ isError: false, message: '' })
    }
    const resetEditForm = () => {
        setAreaId('');
        setAreaCategoryId('');
        setLocationId('');
        setPrinter('');
        setPrinterCategoryId('')
        setControlpanelId('')
        setLineNo('')
        setPrinterEnabled(false)
        setPrinterLineName('');
        setAllArea([]);
        setErrorPrinterLineName({ isError: false, message: '' })
        setErrorPrinterCategory({ isError: false, message: '' })
        setErrorLineNo({ isError: false, message: '' })
        setErrorLocationId({ isError: false, message: '' })
        setErrorPrinter({ isError: false, message: '' })
        setErrorAreaCategoryId({ isError: false, message: '' })
        setErrorControlpanelId({ isError: false, message: '' })
        setErrorAreaId({ isError: false, message: '' })
    }
    const handleSubmitForm = async () => {
        console.log("handleSubmitForm", printerLineName, printer, areaCategoryId, areaId, locationId)

        if (editData?.id) {
            setApproveAPIName("printerlineconfiguration-update");
            setApproveAPImethod("PUT");
            setApproveAPIEndPoint("/api/v1/printerlineconfiguration");
        } else {
            setApproveAPIName("printerlineconfiguration-create");
            setApproveAPImethod("POST");
            setApproveAPIEndPoint("/api/v1/printerlineconfiguration");
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
        editData?.id ? editPrinterLineConfiguration() : AddPrinterLineConfiguration(esign_status);
    }
    const AddPrinterLineConfiguration = async (esign_status, remarks) => {
        try {
            const data = { printerLineName, printer, areaCategoryId, areaId, printerCategoryId, locationId, printerEnabled: printerEnabled, controlpanelId, lineNo, cameraIp, cameraPort, linePcAddress };
            const auditlogRemark = remarks;
            const audit_log = config?.config?.audit_logs ? {
                "audit_log": true,
                "performed_action": "add",
                "remarks": auditlogRemark?.length > 0 ? auditlogRemark : `Printer Line Configuration added - ${printerLineName}`,
            } : {
                "audit_log": false,
                "performed_action": "none",
                "remarks": `none`,
            };
            data.audit_log = audit_log;
            data.esign_status = esign_status;
            console.log('Add printer line configuration data ', data)
            setIsLoading(true);
            const res = await api('/printerlineconfiguration/', data, 'post', true)
            setIsLoading(false);
            // if (!res.data.success) {
            //     console.log('error to add printer line configuration', res.data)
            //     setOpenSnackbar(true);
            //     setAlertData({ ...alertData, type: 'error', message: res.data?.message })
            // }
            if (res?.data?.success) {
                console.log('res data', res?.data)
                setOpenSnackbar(true);
                setAlertData({ ...alertData, type: 'success', message: 'Printer Line configuration added successfully' });
                getAllPrinterLineConfigurationData();
                resetForm();
            } else {
                console.log('Error to add printer line configuration', res.data)
                setOpenSnackbar(true);
                setAlertData({ ...alertData, type: 'error', message: res.data?.message })
                if (res.data.code === 401) {
                    removeAuthToken();
                    router.push('/401');
                }
            }
        } catch (error) {
            console.log('Error to add printer line configuration', error)
            router.push('/500');
        } finally {
            setOpenModal(false);
            setApproveAPIName('');
            setApproveAPImethod('');
            setApproveAPIEndPoint('');
            setEditData({})
        }
    }
    const editPrinterLineConfiguration = async (esign_status, remarks) => {
        try {
            const data = { printerLineName, printer, areaCategoryId, areaId, locationId, printerCategoryId, printerEnabled: printerEnabled, controlpanelId, lineNo, cameraIp, linePcAddress };
            data.cameraPort = String(cameraPort);
            const auditlogRemark = remarks;
            let audit_log;
            if (config?.config?.audit_logs) {
                audit_log = {
                    "audit_log": true,
                    "performed_action": "edit",
                    "remarks": auditlogRemark?.length > 0 ? auditlogRemark : `Printer Line Configuration edited - ${printerLineName}`,
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
            data.printerEnabled = printerEnabled
            setIsLoading(true);
            const res = await api(`/printerlineconfiguration/${editData.id}`, data, 'put', true)
            console.log('Response of update Printer Line Configuration ', res.data)
            setIsLoading(false);
            if (res.data.success) {
                console.log('res ', res.data)
                setOpenSnackbar(true)
                setAlertData({ ...alertData, type: 'success', message: 'Printer Line Configuration updated successfully' })
                resetForm();
                getAllPrinterLineConfigurationData()
            } else {
                setOpenSnackbar(true)
                setAlertData({ ...alertData, type: 'error', message: res.data.message })
                if (res.data.code === 401) {
                    removeAuthToken();
                    router.push('/401');
                }
            }
        } catch (error) {
            console.log('Erorr to edit Printer Line Configuration ', error)
            router.push('/500');
        } finally {
            setOpenModal(false);
            setIsLoading(false);
            setEditData({})
            setApproveAPIName('');
            setApproveAPImethod('');
            setApproveAPIEndPoint('');
        }
    }
    const handleUpdate = item => {

        setErrorPrinterLineName({ isError: false, message: '' })
        setErrorPrinter({ isError: false, message: '' })
        setErrorAreaCategoryId({ isError: false, message: '' })
        setErrorAreaId({ isError: false, message: '' })
        setErrorPrinterCategory({ isError: false, message: '' })
        setErrorLocationId({ isError: false, message: '' })
        setErrorPrinter({ isError: false, message: '' })
        setErrorControlpanelId({ isError: false, message: '' })
        setErrorLineNo({ isError: false, message: '' })

        resetForm()
        setEditData(item)
        console.log('edit Printer Line Configuration', item)
        getAllAreaCategory()
        getAllLocation()
        getAllPrinterCategories()
        getAllPrinterMaster(item.printer_category_id)
        setPrinterLineName(item.printer_line_name)
        setPrinterCategoryId(item.printer_category_id)
        setAreaCategoryId(item.area_category_id)
        setAreaId(item.area_id)
        setPrinter(item.printer_id)
        setPrinterEnabled(item.enabled)
        setLocationId(item.location_id)
        setLineNo(item.line_no)
        setControlpanelId(item.ControlPanel.id)
        setCameraIp(item.camera_ip)
        setCameraPort(item.camera_port)
        setLinePcAddress(item.line_pc_ip)
        getAllArea()
        getAllControlPanels()
        setOpenModal(true)
    }

    const handleAuthResult = async (isAuthenticated, user, isApprover, esignStatus, remarks) => {
        console.log("handleAuthResult 01", isAuthenticated, isApprover, esignStatus, user);
        console.log("handleAuthResult 02", config?.userId, user.user_id);
        const resetState = () => {
            setApproveAPIName("");
            setApproveAPImethod("");
            setApproveAPIEndPoint("");
            setAuthModalOpen(false);
        };
        const handleApproverActions = async () => {
            const data = {
                modelName: "printerlineconfiguration",
                esignStatus,
                id: eSignStatusId,
                audit_log: config?.config?.audit_logs ? {
                    "user_id": user.userId,
                    "user_name": user.userName,
                    "performed_action": 'approved',
                    "remarks": remarks.length > 0 ? remarks : `printer line configuration approved - ${auditLogMark}`,
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
                    editData?.id ? editPrinterLineConfiguration(esign_status, remarks) : AddPrinterLineConfiguration(esign_status, remarks);
                }
            }
        };
        if (!isAuthenticated) {
            setAlertData({ type: 'error', message: 'Authentication failed, Please try again.' });
            setOpenSnackbar(true);
            return;
        }
        if (isApprover) {
            await handleApproverActions();
        } else {
            handleCreatorActions();
        }
        resetState();
        getAllPrinterLineConfigurationData();
    };
    const handleAuthCheck = async (row) => {
        console.log("handleAuthCheck", row)
        setApproveAPIName("printerlineconfiguration-approve");
        setApproveAPImethod("PATCH");
        setApproveAPIEndPoint("/api/v1/printerlineconfiguration");
        setAuthModalOpen(true);
        setESignStatusId(row.id);
        setAuditLogMark(row.printer_line_name)
        console.log("row", row)
    }

    const resetFilter = () => {
        setESignStatus('')
        setSearchVal('')
        setTempSearchVal('')
    }
    const handleSearch = () => {
        let currentVal = tempSearchVal
        currentVal = currentVal.toLowerCase()
        setSearchVal(currentVal)
        if (currentVal === '') {
            getAllPrinterLineConfigurationData();
        }
    }
    const handleTempSearchValue = (e) => {
        let currentVal = e.target.value
        currentVal = currentVal.toLowerCase()
        setTempSearchVal(currentVal)
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
        setApproveAPIName("printerlineconfiguration-approve");
        setApproveAPImethod("PATCH");
        setApproveAPIEndPoint("/api/v1/printerlineconfiguration");
        setAuthModalOpen(true);
    };
    const handleDownloadPdf = () => {
        setApproveAPIName("printerlineconfiguration-create");
        setApproveAPImethod("POST");
        setApproveAPIEndPoint("/api/v1/printerlineconfiguration");
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
            headerContentFix(doc, 'Printer Line Configuration Report');

            if (searchVal) {
                doc.setFontSize(10)
                doc.text('Search : ' + `${tempSearchVal}`, 15, 25)
            } else {
                doc.setFontSize(10)
                doc.text('Search : ' + '__', 15, 25)
            }
            doc.text("Filters :\n", 15, 30)
            if (eSignStatus) {
                doc.setFontSize(10)
                doc.text('E-Sign : ' + `${eSignStatus}`, 20, 35)
            } else {
                doc.setFontSize(10)
                doc.text('E-Sign : ' + '__', 20, 35)
            }
            doc.setFontSize(12)
            doc.text('Printer Line Configuration Data', 15, 55)
        }
        const bodyContent = () => {
            let currentPage = 1
            let dataIndex = 0
            const totalPages = Math.ceil(allPrinterLineConfigurationData.length / 25)
            headerContent()
            while (dataIndex < allPrinterLineConfigurationData.length) {
                if (currentPage > 1) {
                    doc.addPage()
                }

                footerContent(currentPage, totalPages, userDataPdf, doc);

                const body = allPrinterLineConfigurationData
                    .slice(dataIndex, dataIndex + 25)
                    .map((item, index) => [dataIndex + index + 1, item.printer_line_name, item.printer, item.esign_status]);
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
                    head: [['Sr.No.', 'Printer Line Name', 'Printer', 'E-Sign']],
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
        const fileName = `Area Category_${formattedDate}_${formattedTime}.pdf`;
        doc.save(fileName);

    }

    const handleSort = (key) => {
        const newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        const sorted = [...allPrinterLineConfigurationData].sort((a, b) => {
            if (a[key] > b[key]) {
                return newSortDirection === 'asc' ? 1 : -1;
            }
            if (a[key] < b[key]) {
                return newSortDirection === 'asc' ? -1 : 1;
            }
            return 0;
        });
        setAllPrinterLineConfigurationData(sorted);
        setSortDirection(newSortDirection);
    };

    const handleSortByPrinterLineName = () => handleSort('printer_line_name');
    const handleSortByPrinter = () => handleSort('printer');
    const handleSortByAreaCategoryId = () => handleSort('area_category_id');
    const handleSortByAreaId = () => handleSort('area_id');
    const handleSortByLocationId = () => handleSort('location_id');

    return (
        <Box padding={4}>
            <Head>
                <title>Printer Line Configuration</title>
            </Head>
            <Grid2 item xs={12}>
                <Typography variant='h2'>Printer Line Configuration</Typography>
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
                            <Typography variant='h4' className='mx-4 my-2 mt-3'>
                                Printer Line Configuration Data
                            </Typography>
                            <TableContainer component={Paper}>
                                <TablePrinterLineConfiguration
                                    printerLineConfigurationData={allPrinterLineConfigurationData}
                                    handleUpdate={handleUpdate}

                                    handleSortByPrinterLineName={handleSortByPrinterLineName}
                                    handleSortByPrinter={handleSortByPrinter}
                                    handleSortByAreaCategoryId={handleSortByAreaCategoryId}
                                    handleSortByAreaId={handleSortByAreaId}
                                    handleSortByLocationId={handleSortByLocationId}

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
                        {editData?.id ? 'Edit Printer Line Configuration' : 'Add Printer Line Configuration'}
                    </Typography>
                    <Grid2 container spacing={2} sx={{ margin: "0.5rem 0rem" }}>
                        <Grid2 size={6}>

                            <TextField
                                fullWidth
                                id='outlined-controlled'
                                label='Printer Line Name'
                                placeholder='Printer Line Name'
                                value={printerLineName}
                                data-testid="printer-line-name-input"

                                onChange={e => {
                                    setPrinterLineName(e.target.value)
                                    e.target.value && setErrorPrinterLineName({ isError: false, message: '' })
                                }}
                                required
                                error={errorPrinterLineName.isError}
                                helperText={errorPrinterCategory.isError ? errorPrinterCategory.message : ''}
                                x />
                        </Grid2>
                        <Grid2 size={6}>

                            <FormControl fullWidth required error={errorLocationId.isError}>
                                <InputLabel id='label-location'>Location</InputLabel>
                                <Select
                                    labelId='label-location'
                                    id='location'
                                    label='Location'
                                    value={locationId}
                                    onChange={e => {
                                        setLocationId(e.target.value)
                                        setErrorLocationId({ isError: false, message: '' })
                                    }}
                                >
                                    {allLocation?.map(item => (
                                        <MenuItem role="listbox"
                                            key={item.id} value={item.id} selected={locationId === item.id}>
                                            {item.location_name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText className='dropDown-error'>
                                    {errorLocationId.isError ? errorLocationId.message : ''}
                                </FormHelperText>
                            </FormControl>
                        </Grid2>
                    </Grid2>

                    <Grid2 container spacing={2} sx={{ margin: "0.5rem 0rem" }}>
                        <Grid2 size={6}>

                            <FormControl fullWidth required error={errorAreaCategoryId.isError}>
                                <InputLabel id='label-area-category'>Area Category</InputLabel>
                                <Select
                                    labelId='label-area-category'
                                    id='area-category'
                                    label='AreaCategory'
                                    value={areaCategoryId}
                                    onChange={e => {
                                        setAreaCategoryId(e.target.value)
                                        setErrorAreaCategoryId({ isError: false, message: '' })
                                    }}
                                >
                                    {allAreaCategory?.map(item => (
                                        <MenuItem key={item.id} value={item.id} selected={areaCategoryId === item.id}>
                                            {item.area_category_name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText className='dropDown-error'>
                                    {errorAreaCategoryId.isError ? errorAreaCategoryId.message : ''}
                                </FormHelperText>
                            </FormControl>
                        </Grid2>
                        <Grid2 size={6}>

                            <FormControl fullWidth required error={errorAreaId.isError}>
                                <InputLabel id='label-area'>Area</InputLabel>
                                <Select
                                    labelId='label-area'
                                    id='area'
                                    label='Area'
                                    value={areaId}
                                    onChange={e => {
                                        setAreaId(e.target.value)
                                        setErrorAreaId({ isError: false, message: '' })
                                    }}
                                >
                                    {allArea?.map(item => (
                                        <MenuItem key={item.id} value={item.id} selected={areaId === item.id}>
                                            {item.area_name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText className='dropDown-error'>
                                    {errorAreaId.isError ? errorAreaId.message : ''}
                                </FormHelperText>
                            </FormControl>
                        </Grid2>
                    </Grid2>

                    <Grid2 container spacing={2} sx={{ margin: "0.5rem 0rem" }}>
                        <Grid2 size={6}>
                            <FormControl fullWidth required error={errorPrinterCategory.isError}>
                                <InputLabel id='printer-category'>Printer Category</InputLabel>
                                <Select
                                    labelId='printer Category'
                                    id='printer-category'
                                    label='Printer Category*'
                                    value={printerCategoryId}
                                    onChange={e => {
                                        setPrinterCategoryId(e.target.value)
                                        getAllPrinterMaster(e.target.value)
                                        setErrorPrinterCategory({ isError: false, message: '' })
                                    }}
                                >
                                    {console.log(allPrinterCategory)}
                                    {allPrinterCategory?.map(item => (
                                        <MenuItem key={item.id} value={item.id} selected={printerCategoryId === item.printer_category_name}>
                                            {item.printer_category_name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText error={errorPrinterCategory.isError}>
                                    {errorPrinterCategory.isError ? errorPrinterCategory.message : ''}
                                </FormHelperText>
                            </FormControl>
                        </Grid2>
                        <Grid2 size={6}>

                            <FormControl fullWidth required error={errorPrinter.isError}>
                                <InputLabel id='printer-master'>Printer</InputLabel>
                                <Select
                                    labelId='printer-master'
                                    id='printer-master'
                                    label='printer'
                                    value={printer}
                                    onChange={e => {
                                        setPrinter(e.target.value)
                                        setErrorPrinter({ isError: false, message: '' })
                                    }}
                                >
                                    {console.log(allPrinter)}
                                    {allPrinter?.map(item => (
                                        <MenuItem key={item.id} value={item.id} selected={printer === item.id}>
                                            {item.printer_id}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText className='dropDown-error'>
                                    {errorPrinter.isError ? errorPrinter.message : ''}
                                </FormHelperText>
                            </FormControl>
                        </Grid2>
                    </Grid2>
                    <Grid2 container spacing={2} sx={{ margin: "0.5rem 0rem" }}>
                        <Grid2 size={6}>
                            <FormControl fullWidth required error={errorControlpanelId.isError}>
                                <InputLabel id='controlpanel'>Control Panel</InputLabel>
                                <Select
                                    labelId='controlpanel'
                                    id='controlpanel'
                                    label='controlpanel'
                                    value={controlpanelId}
                                    onChange={e => {
                                        setControlpanelId(e.target.value)
                                        setErrorControlpanelId({ isError: false, message: '' })
                                    }}
                                >
                                    {console.log(allControlPanelData)}
                                    {allControlPanelData?.map(item => (
                                        <MenuItem key={item.id} value={item.id} selected={controlpanelId === item.name}>
                                            {item.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText className='dropDown-error'>
                                    {errorControlpanelId.isError ? errorControlpanelId.message : ''}
                                </FormHelperText>
                            </FormControl>
                        </Grid2>
                        <Grid2 size={6}>

                            <TextField
                                fullWidth
                                id='outlined-controlled'
                                label='Line No'
                                placeholder='Line No'
                                value={lineNo}
                                data-testid="printer-line-no-input"

                                onChange={e => {
                                    setLineNo(e.target.value)
                                    e.target.value && setErrorLineNo({ isError: false, message: '' })
                                }}
                                required
                                error={errorLineNo.isError}
                                helperText={errorLineNo.isError ? errorLineNo.message : ''}
                            />
                        </Grid2>
                    </Grid2>
                    <Grid2 container spacing={2} sx={{ margin: "0.5rem 0rem" }}>
                        <Grid2 size={6}>
                            <TextField
                                fullWidth
                                id='outlined-controlled'
                                label='Camera Ip'
                                placeholder='Camera Ip'
                                value={cameraIp}
                                data-testid="printer-camera-ip-input"

                                onChange={e => {
                                    setCameraIp(e.target.value)
                                    e.target.value && setErrorCameraIp({ isError: false, message: '' })
                                }}
                                required
                                error={errorCameraIp.isError}
                                helperText={errorCameraIp.isError ? errorCameraIp.message : ''}
                            />
                        </Grid2>
                        <Grid2 size={6}>
                            <TextField
                                fullWidth
                                id='outlined-controlled'
                                label='Camera Port'
                                placeholder='Camera Port'
                                value={cameraPort}
                                data-testid="printer-camera-port-input"

                                onChange={e => {
                                    setCameraPort(e.target.value)
                                    e.target.value && setErrorCameraPort({ isError: false, message: '' })
                                }}
                                required
                                error={errorCameraPort.isError}
                                helperText={errorCameraPort.isError ? errorCameraPort.message : ''}
                            /> 
                        </Grid2>
                    </Grid2>

                    <Grid2 container spacing={2} sx={{ margin: "0.5rem 0rem" }}>
                        <Grid2 size={6}>
                            <TextField
                                fullWidth
                                id='outlined-controlled'
                                label='Line Pc Address'
                                placeholder='Line Pc Address'
                                data-testid="printer-pc-input"
                                value={linePcAddress}
                                onChange={e => {
                                    setLinePcAddress(e.target.value)
                                    e.target.value && setErrorLinePcAddress({ isError: false, message: '' })
                                }}
                                required
                                error={errorLinePcAddress.isError}
                                helperText={errorLinePcAddress.isError ? errorLinePcAddress.message : ''}
                            />
                        </Grid2>
                    </Grid2>

                    <Grid2 container spacing={2} sx={{ margin: "0.5rem 0rem" }}>
                        <Grid2 size={6}>
                            <FormControlLabel
                                control={<Switch checked={editData.enabled ? editData.enabled : printerEnabled} onChange={() => setPrinterEnabled(!printerEnabled)} />}
                                label={printerEnabled ? "Enable" : "Disable"}
                            />
                        </Grid2>
                        <Grid2 size={6}>
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
    return validateToken(context, 'Printer Line Configuration')
}
export default ProtectedRoute(Index)
