'use-client'
import React, { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Grid2 from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import { Button, TextField } from '@mui/material'
import { IoMdAdd } from 'react-icons/io'
import Modal from '@mui/material/Modal'
import { api } from 'src/utils/Rest-API'
import { useLoading } from 'src/@core/hooks/useLoading'
import Head from 'next/head'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useAuth } from 'src/Context/AuthContext';
import TableUOM from '../../views/tables/TableUOM'
import SnackbarAlert from 'src/components/SnackbarAlert'
import ProtectedRoute from 'src/components/ProtectedRoute'
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
import { useSettings } from 'src/@core/hooks/useSettings'

const Index = () => {
  const [openModal, setOpenModal] = useState(false);
  const [unitName, setUnitName] = useState('')
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [alertData, setAlertData] = useState({ type: '', message: '', variant: 'filled' })
  const [searchVal, setSearchVal] = useState('')
  const [errorUnitName, setErrorUnitName] = useState({ isError: false, message: '' })
  const [uomData, setUomData] = useState([])
  const [editData, setEditData] = useState({})
  const [sortDirection, setSortDirection] = useState('asc')
  const { setIsLoading } = useLoading();
  const { getUserData, removeAuthToken } = useAuth();
  const [userDataPdf, setUserDataPdf] = useState();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [eSignStatus, setESignStatus] = useState('');
  const [tempSearchVal, setTempSearchVal] = useState('');
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
  const { settings } = useSettings()

  const apiAccess = useApiAccess("uom-create",
    "uom-update",
    "uom-approve");
  useEffect(() => {
    let data = getUserData()
    decodeAndSetConfig(setConfig);

    setUserDataPdf(data)
    return () => { }
  }, [])
  useEffect(() => {
    getData()
    return () => { }
  }, [])
  useEffect(() => {
    getData();
  }, [searchVal, page, rowsPerPage, eSignStatus]);
  const getData = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage === -1 ? -1 : rowsPerPage,
        search: searchVal,
        esign_status: eSignStatus,
      });
      const res = await api(`/uom/?${params.toString()}`, {}, 'get', true);
      console.log("get data res uom ", res.data);
      if (res?.data?.success) {
        setUomData(res.data.data.uoms);
        setTotalRecords(res.data.data.total);
      }
      else if (res?.data?.code === 401) {
        console.log('Error to get all units', res.data);
        removeAuthToken();
        router.push('/401');
      }
    } catch (error) {
      console.log('Error in get units', error);
    } finally {
      setIsLoading(false);
    }
  };
  const closeSnackbar = () => {
    setOpenSnackbar(false);
  };
  const resetForm = () => {
    setUnitName('');
    setErrorUnitName({ isError: false, message: '' });
    setEditData({});
  };
  const handleOpenModal = () => {
    setApproveAPIName("uom-create");
    setApproveAPImethod("POST");
    setApproveAPIEndPoint("/api/v1/uom");
    resetForm();
    setOpenModal(true);
  };
  const handleCloseModal = () => {
    resetForm();
    setOpenModal(false);
  };
  const applyValidation = () => {
    if (unitName.length > 50) {
      setErrorUnitName({ isError: true, message: 'Unit name length should be <= 50' });
    } else if (unitName === '') {
      setErrorUnitName({ isError: true, message: "Unit name can't be empty" });
    } else {
      setErrorUnitName({ isError: false, message: '' });
    }
  };
  const checkValidate = () => {
    return !(unitName === '' || unitName.length > 50);
  };
  const handleAuthModalClose = () => {
    setAuthModalOpen(false);
    setOpenModalApprove(false);
  };
  const handleSubmitForm = async () => {
    if (editData?.id) {
      setApproveAPIName("uom-update");
      setApproveAPImethod("PUT");
      setApproveAPIEndPoint("/api/v1/uom");
    } else {
      setApproveAPIName("uom-create");
      setApproveAPImethod("POST");
      setApproveAPIEndPoint("/api/v1/location");
    }
    applyValidation();
    const validate = checkValidate();
    if (!validate) {
      return;
    }
    if (config?.config?.esign_status) {
      setAuthModalOpen(true);
      return;
    }
    const esign_status = "approved";
    editData?.id ? editUOM() : addUOM(esign_status);
  };
  const handleAuthResult = async (isAuthenticated, user, isApprover, esignStatus, remarks) => {
    console.log("handleAuthResult 01", isAuthenticated, isApprover, esignStatus, user);
    console.log("handleAuthResult 02", config.userId, user.user_id);
    const handleAuthenticationError = () => {
      setAlertData({ type: 'error', message: 'Authentication failed, Please try again.' });
      setOpenSnackbar(true);
    };
    const handleApproverActions = async (user, esignStatus, remarks) => {
      const data = prepareApproverData(user, esignStatus, remarks);
      if (esignStatus === "approved" && esignDownloadPdf) {
        handleApproveDownload();
        return;
      }
      try {
        const res = await api('/esign-status/update-esign-status', data, 'patch', true);
        console.log("esign status update", res?.data);
      } catch (error) {
        console.error("Error updating e-sign status:", error);
      }
      if (esignStatus === "rejected" && esignDownloadPdf) {
        handleRejectDownload();
      }
    };
    const prepareApproverData = (user, esignStatus, remarks) => {
      return {
        modelName: "uom",
        esignStatus,
        id: eSignStatusId,
        audit_log: config?.config?.audit_logs ? {
          user_id: user.userId,
          user_name: user.userName,
          performed_action: 'approved',
          remarks: remarks.length > 0 ? remarks : `uom approved - ${auditLogMark}`,
        } : {},
      };
    };
    const handleApproveDownload = () => {
      setOpenModalApprove(false);
      console.log("esign is approved for approver");
      resetApprovalState();
      downloadPdf();
    };
    const handleRejectDownload = () => {
      console.log("approver rejected");
      setOpenModalApprove(false);
      resetApprovalState();
      setAuthModalOpen(false);
    };
    const handleCreatorActions = (esignStatus, remarks) => {
      if (esignStatus === "rejected") {
        setAuthModalOpen(false);
        setOpenModalApprove(false);
      } else if (esignStatus === "approved" && esignDownloadPdf) {
        console.log("esign is approved for creator to download");
        setOpenModalApprove(true);
      } else if (esignStatus === "approved") {
        console.log("esign is approved for creator");
        const esign_status = "pending";
        editData?.id ? editUOM(esign_status, remarks) : addUOM(esign_status, remarks);
      }
    };
    const resetApprovalState = () => {
      setApproveAPIName('');
      setApproveAPImethod('');
      setApproveAPIEndPoint('');
      setAuthModalOpen(false);
    };
    if (!isAuthenticated) {
      handleAuthenticationError();
      return;
    }
    if (isApprover) {
      await handleApproverActions(user, esignStatus, remarks);
    } else {
      handleCreatorActions(esignStatus, remarks);
    }
    resetApprovalState();
    getData();
  };
  const handleAuthCheck = async (row) => {
    console.log("handleAuthCheck", row)
    setApproveAPIName("uom-approve");
    setApproveAPImethod("PATCH");
    setApproveAPIEndPoint("/api/v1/uom");
    setAuthModalOpen(true);
    setESignStatusId(row.id);
    setAuditLogMark(row.uom_name)
  }
  const addUOM = async (esign_status, remarks) => {
    try {
      const data = { UOMName: unitName };
      const auditlogRemark = remarks
      const audit_log = config?.config?.audit_logs ? {
        "audit_log": true,
        "performed_action": "add",
        "remarks": auditlogRemark?.length > 0 ? auditlogRemark : `UOM added - ${unitName}`,
      } : {
        "audit_log": false,
        "performed_action": "none",
        "remarks": `none`,
      };
      data.audit_log = audit_log;
      data.esign_status = esign_status;
      console.log('data add uom ', data);
      setIsLoading(true);
      const res = await api('/uom/', data, 'post', true);
      console.log('add res uom', res);
      if (res?.data?.success) {
        setAlertData({ type: 'success', message: 'Unit added successfully' });
        setOpenSnackbar(true);
        getData();
        resetForm();
      } else {
        setAlertData({ type: 'error', message: res.data?.message });
        if (res.data?.code === 401) {
          removeAuthToken();
          router.push('/401');
        }
      }
    } catch (error) {
      router.push('/500');
    } finally {
      setApproveAPIName('')
      setApproveAPImethod('')
      setApproveAPIEndPoint('')
      setOpenModal(false);
      setIsLoading(false);
    }
  };
  const editUOM = async (esign_status, remarks) => {
    try {
      const data = { UOMName: unitName };
      const auditlogRemark = remarks
      let audit_log;
      if (config?.config?.audit_logs) {
        audit_log = {
          "audit_log": true,
          "performed_action": "edit",
          "remarks": auditlogRemark > 0 ? auditlogRemark : `UOM edited - ${unitName}`,
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
      const res = await api(`/uom/${editData.id}`, data, 'put', true);
      if (res.data.success) {
        setOpenSnackbar(true);
        setAlertData({ ...alertData, type: 'success', message: 'Unit updated successfully' });
        resetForm();
        getData();
      } else {
        setOpenSnackbar(true);
        setAlertData({ ...alertData, type: 'error', message: res.data.message });
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
    }
  };
  const resetData = () => {
    setUnitName('');
    setErrorUnitName({ isError: false, message: '' });
  }
  const handleUpdate = item => {
    resetForm();
    setOpenModal(true);
    setEditData(item);
    setUnitName(item.uom_name);
  };
  const handleSortByName = () => {
    const newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    const sorted = [...uomData].sort((a, b) => {
      if (a.uom_name > b.uom_name) {
        return newSortDirection === 'asc' ? 1 : -1;
      }
      if (a.uom_name < b.uom_name) {
        return newSortDirection === 'asc' ? -1 : 1;
      }
      return 0;
    });
    setUomData(sorted);
    setSortDirection(newSortDirection);
  };
  const resetFilter = () => {
    setESignStatus('');
    setSearchVal('');
    setTempSearchVal('');
  };
  const handleSearch = () => {
    setSearchVal(tempSearchVal.toLowerCase());
    setPage(0);
  };
  const handleTempSearchValue = e => {
    setTempSearchVal(e.target.value.toLowerCase());
  };
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = event => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };
  const downloadPdf = () => {
    console.log('clicked on download btn')
    const doc = new jsPDF()
    const headerContent = () => {
      headerContentFix(doc, 'UOM Report');

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
      doc.text('UOM Data', 15, 55)
    }
    const bodyContent = () => {
      let currentPage = 1
      let dataIndex = 0
      const totalPages = Math.ceil(uomData.length / 25)
      headerContent()
      while (dataIndex < uomData.length) {
        if (currentPage > 1) {
          doc.addPage()
        }
        footerContent(currentPage, totalPages, userDataPdf, doc);

        const body = uomData
          .slice(dataIndex, dataIndex + 25)
          .map((item, index) => [dataIndex + index + 1, item.uom_name, item.esign_status])
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
          head: [['Sr.No.', 'UOM Name', 'E-Sign']],
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
    const fileName = `UOM_${formattedDate}_${formattedTime}.pdf`;
    doc.save(fileName);
  }
  const handleAuthModalOpen = () => {
    console.log("OPen auth model");
    setApproveAPIName("uom-approve");
    setApproveAPImethod("PATCH");
    setApproveAPIEndPoint("/api/v1/uom");
    setAuthModalOpen(true);
  };
  const handleDownloadPdf = () => {
    setApproveAPIName("uom-create");
    setApproveAPImethod("POST");
    setApproveAPIEndPoint("/api/v1/uom");
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
        <title>Unit Of Measurement</title>
      </Head>
      <Grid2 item xs={12}>
        <Typography variant='h2'>Unit of Measurement</Typography>
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
                Unit Of Measurement Data
              </Typography>
              <TableUOM
                uomData={uomData}
                handleUpdate={handleUpdate}
                handleSortByName={handleSortByName}
                sortDirection={sortDirection}
                totalRecords={totalRecords}
                rowsPerPage={rowsPerPage}
                page={page}
                handleChangePage={handleChangePage}
                handleChangeRowsPerPage={handleChangeRowsPerPage}
                editable={apiAccess.editApiAccess}
                handleAuthCheck={handleAuthCheck}
                apiAccess={apiAccess}
                config={config}
              />
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
            {editData?.id ? 'Edit Unit' : 'Add Unit'}
          </Typography>
          <Grid2 item xs={12}>
            <Grid2 item xs={12} sm={6}>
              <TextField
                className='w-50'
                id='outlined-controlled'
                label='Unit Of Measurement'
                placeholder='Unit Of Measurement'
                value={unitName}
                onChange={e => {
                  setUnitName(e.target.value);
                  e.target.value && setErrorUnitName({ isError: false, message: '' });
                }}
                required={true}
                error={errorUnitName.isError}
                helperText={errorUnitName.isError ? errorUnitName.message : ''}
              />
            </Grid2>
          </Grid2>
          <Grid2 item xs={12} className='mt-3'>
            <Button variant='contained' sx={{ marginRight: 3.5 }} onClick={handleSubmitForm}>
              Save Changes
            </Button>
            <Button type='reset' variant='outlined' color='primary' onClick={resetData}>
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
  );
}

export async function getServerSideProps(context) {
  return validateToken(context, 'Unit Of Measurement')
}
export default ProtectedRoute(Index)