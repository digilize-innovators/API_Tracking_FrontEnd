'use-client'
import React, { useState, useEffect, useRef, useCallback, useLayoutEffect, useMemo } from 'react'
import Box from '@mui/material/Box'
import Grid2 from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'

import { Button, TextField, MenuItem, FormHelperText, TableContainer, Paper } from '@mui/material'
import { IoMdAdd } from 'react-icons/io'
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
import { decodeAndSetConfig, getTokenValues } from '../../utils/tokenUtils';
import { useApiAccess } from 'src/@core/hooks/useApiAccess';
import ExportResetActionButtons from 'src/components/ExportResetActionButtons'
import SearchBar from 'src/components/SearchBarComponent'
import EsignStatusFilter from 'src/components/EsignStatusFilter'
import { footerContent } from 'src/utils/footerContentPdf';
import { headerContentFix } from 'src/utils/headerContentPdfFix';
import AreaModel from 'src/components/Modal/AreaModel'
import CustomSearchBar from 'src/components/CustomSearchBar'
import EsignStatusDropdown from 'src/components/EsignStatusDropdown'
import downloadPdf from 'src/utils/DownloadPdf'



const Index = () => {
  const { settings } = useSettings()
  const [eSignStatus, setESignStatus] = useState('')
  const [openModal, setOpenModal] = useState(false)
  const [alertData, setAlertData] = useState({ openSnackbar: false, type: '', message: '', variant: 'filled' })
  const [searchVal, setSearchVal] = useState('')
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
  const router = useRouter();
  const [config, setConfig] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [approveAPI, setApproveAPI] = useState({ approveAPIName: '', approveAPImethod: '', approveAPIEndPoint: '' })
  const [eSignStatusId, setESignStatusId] = useState('');
  const [auditLogMark, setAuditLogMark] = useState('');
  const [esignDownloadPdf, setEsignDownloadPdf] = useState(false);
  const [openModalApprove, setOpenModalApprove] = useState(false);
  const apiAccess = useApiAccess("area-create", "area-update", "area-approve");
  const [formData, setFormData] = useState({})
  const [tableHeaderData, setTableHeaderData] = useState({
    esignStatus: '',
    searchVal: ''
  });
  // const inputRef = useRef(null); // Ref to track input field

  useLayoutEffect(() => {
    let data = getUserData();
    const decodedToken = getTokenValues();
    setConfig(decodedToken);
    setUserDataPdf(data);
    return () => { }
  }, [])
  const tableBody = areaData.map((item, index) =>
    [index + 1, item.area_id, item.area_name, item.area_category?.area_category_name, item.esign_status]);

  const tableData = {
    tableHeader: ['Sr.No.', 'Id', 'Name', 'Area Category', 'E-Sign'],
    tableHeaderText: 'Area Master Report',
    tableBodyText: 'Area Master Data',
    filename: 'AreaMaster'
  };
  const getData = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage === -1 ? -1 : rowsPerPage,
        search: tableHeaderData.searchVal,
        esign_status: tableHeaderData.esignStatus
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
  }, [tableHeaderData.esignStatus, tableHeaderData.searchVal, page, rowsPerPage])

  const closeSnackbar = () => {
    setAlertData({ ...alertData, openSnackbar: false })
  }
  const handleOpenModal = () => {
    setApproveAPI({ approveAPIName: 'area-create', approveAPImethod: 'POST', approveAPIEndPoint: '/api/v1/area' });
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
    setEditData({})
  }
  const resetEditForm = () => {
    setEditData(prev => ({
      ...prev,
      area_name: '',
      area_category_id: '',
      area_id: ''
    }))
  }
  const handleSubmitForm = async (data) => {
    console.log('form data ', data);
    setFormData(data);
    console.log('after set ', editData);

    if (editData?.id) {
      setApproveAPI({ approveAPIName: 'area-update', approveAPImethod: 'PUT', approveAPIEndPoint: '/api/v1/area' })
    } else {
      setApproveAPI({ approveAPIName: 'area-create', approveAPImethod: 'POST', approveAPIEndPoint: '/api/v1/area' })
    }
    //   applyValidation()
    //   const validate = checkValidate()
    //   if (!validate) {
    //     return true
    //   }
    if (config?.config?.esign_status) {
      setAuthModalOpen(true);
      return;
    }
    const esign_status = "approved";
    editData?.area_id ? editArea() : addArea(esign_status)
  }
  const addArea = async (esign_status, remarks) => {
    console.log("add form ", formData);

    try {
      const data = {
        areaId: formData.areaId,
        areaName: formData.areaName,
        areaCategoryId: formData.areaCategoryId,
        location_uuid: formData.location_uuid
      };
      console.log(data, ':-area data')
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
        setAlertData({ ...alertData, openSnackbar: true, type: 'success', message: 'Area added successfully' })
        resetForm()
        getData()
      } else {
        setAlertData({ ...alertData, openSnackbar: true, type: 'error', message: res.data?.message });
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

      setApproveAPI({ approveAPIName: '', approveAPImethod: '', approveAPIEndPoint: '' })

    }
  }
  const editArea = async (esign_status, remarks) => {
    try {
      console.log(formData, "formdata")
      const data = {
        areaId: formData.areaId,
        areaName: formData.areaName,
        areaCategoryId: formData.areaCategoryId,
        location_uuid: formData.location_uuid
      };
      delete data.areaId;
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
      console.log(data, 'aaaa')
      setIsLoading(true)
      const res = await api(`/area/${editData.id}`, data, 'put', true)
      if (res.data.success) {
        setAlertData({ ...alertData, openSnackbar: true, type: 'success', message: 'Area updated successfully' })
        resetForm()
        getData()
      }
      else {
        setAlertData({ ...alertData, openSnackbar: true, type: 'error', message: res.data.message })
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
      setApproveAPI({ approveAPIName: '', approveAPImethod: '', approveAPIEndPoint: '' })

    }
  }
  const handleAuthResult = async (isAuthenticated, user, isApprover, esignStatus, remarks) => {
    console.log("handleAuthResult 01", isAuthenticated, isApprover, esignStatus, user);
    console.log("handleAuthResult 02", config.userId, user.user_id);
    const resetState = () => {

      setApproveAPI({ approveAPIName: '', approveAPImethod: '', approveAPIEndPoint: '' })

      setAuthModalOpen(false);
    };
    if (!isAuthenticated) {
      setAlertData({ openSnackbar: true, type: 'error', message: 'Authentication failed, Please try again.' });
      return;
    }
    const handleEsignApproved = () => {
      if (esignDownloadPdf) {
        console.log("esign is approved for download.");
        setOpenModalApprove(true);
        console.log(tableData, "tabledata")
        downloadPdf(tableData, tableHeaderData, tableBody, areaData, userDataPdf)

      } else {
        console.log("esign is approved for creator.");
        const esign_status = "pending";
        editData?.id ? editArea(esign_status, remarks) : addArea(esign_status, remarks);
      }
    };
    const handleApproverActions = async () => {
      const data = {
        modelName: "area",
        esignStatus: tableHeaderData.esignStatus,
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
        console.log(tableData, "tabledata")

        downloadPdf(tableData, tableHeaderData, tableBody, areaData, userDataPdf)
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
    setApproveAPI({ approveAPIName: 'area-approve', approveAPImethod: 'PATCH', approveAPIEndPoint: '/api/v1/area' })

    setAuthModalOpen(true);
    setESignStatusId(row.id);
    setAuditLogMark(row.area_name)
    console.log("row", row)
  }

  const handleSearchClick = (val) => {
    setTableHeaderData({ ...tableHeaderData, searchVal: val.toLowerCase() });
    setPage(0);
  }
  // }
  const handleTempSearchValue = e => {
    setTempSearchVal(e.target.value.toLowerCase())
  }
  const handleUpdate = item => {
    setOpenModal(true)
    setEditData(item)

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
    setTableHeaderData({
      ...tableHeaderData, esignStatus: "", searchVal: ""
    })
    // setESignStatus('')
    // setSearchVal('')
    // setTempSearchVal('')
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
    setApproveAPI({ approveAPIName: 'area-approve', approveAPImethod: 'PATCH', approveAPIEndPoint: '/api/v1/area' })

    setAuthModalOpen(true);
  };
  const handleDownloadPdf = () => {
    setApproveAPI({ approveAPIName: 'area-create', approveAPImethod: 'POST', approveAPIEndPoint: '/api/v1/area' })

    if (config?.config?.esign_status) {
      console.log("Esign enabled for download pdf");
      setEsignDownloadPdf(true);
      setAuthModalOpen(true);
      return;
    }
    downloadPdf(tableData, tableHeaderData, tableBody, areaData, userDataPdf);
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
                {/* <EsignStatusFilter esignStatus={eSignStatus} setEsignStatus={setESignStatus} /> */}
                <EsignStatusDropdown tableHeaderData={tableHeaderData} setTableHeaderData={setTableHeaderData} />

              </Box>
              <Box className='d-flex justify-content-between align-items-center mx-4 my-2'>
                <ExportResetActionButtons handleDownloadPdf={handleDownloadPdf} resetFilter={resetFilter} />
                <Box className='d-flex justify-content-between align-items-center '>
                  {/* <SearchBar
                    searchValue={tempSearchVal}
                    // handleSearchChange={handleTempSearchValue}
                    inputRef={inputRef}
                    handleSearchClick={handleSearchClick}

                  /> */}
                  <CustomSearchBar handleSearchClick={handleSearchClick} />

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
      <SnackbarAlert openSnackbar={alertData.openSnackbar} closeSnackbar={closeSnackbar} alertData={alertData} />
      <AreaModel open={openModal}
        onClose={handleCloseModal}
        editData={editData}
        handleSubmitForm={handleSubmitForm}
        />

      <AuthModal
        open={authModalOpen}
        handleClose={handleAuthModalClose}
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