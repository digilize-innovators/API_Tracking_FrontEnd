'use-client'
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Grid2 from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import { Button, TextField } from '@mui/material'
import { IoMdAdd } from 'react-icons/io'
import { api } from 'src/utils/Rest-API'
import { useLoading } from 'src/@core/hooks/useLoading'
import Head from 'next/head'
import { useAuth } from 'src/Context/AuthContext';
import TableUOM from '../../views/tables/TableUOM'
import SnackbarAlert from 'src/components/SnackbarAlert'
import ProtectedRoute from 'src/components/ProtectedRoute'
import { useRouter } from 'next/router'
import AuthModal from 'src/components/authModal'
import ChatbotComponent from 'src/components/ChatbotComponent'
import AccessibilitySettings from 'src/components/AccessibilitySettings'
import { validateToken } from 'src/utils/ValidateToken';
import { getTokenValues } from '../../utils/tokenUtils';
import { useApiAccess } from 'src/@core/hooks/useApiAccess';
import ExportResetActionButtons from 'src/components/ExportResetActionButtons'
import SearchBar from 'src/components/SearchBarComponent'
import EsignStatusDropdown from 'src/components/EsignStatusDropdown'
import { useSettings } from 'src/@core/hooks/useSettings'
import UomModal from "src/components/Modal/UomModal";
import CustomSearchBar from 'src/components/CustomSearchBar'
import downloadPdf from 'src/utils/DownloadPdf'

const Index = () => {

  const [openModal, setOpenModal] = useState(false);
  const [alertData, setAlertData] = useState({ openSnackbar: false, type: '', message: '', variant: 'filled' })
  const [uomData, setUomData] = useState([])
  const [editData, setEditData] = useState({})
  const [sortDirection, setSortDirection] = useState('asc')
  const { setIsLoading } = useLoading();
  const { getUserData, removeAuthToken } = useAuth();
  const [userDataPdf, setUserDataPdf] = useState();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const router = useRouter();
  const [config, setConfig] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [approveAPI, setApproveAPI] = useState({ approveAPIName: '', approveAPImethod: '', approveAPIEndPoint: '' })
  const [eSignStatusId, setESignStatusId] = useState('');
  const [auditLogMark, setAuditLogMark] = useState('');
  const [esignDownloadPdf, setEsignDownloadPdf] = useState(false);
  const [openModalApprove, setOpenModalApprove] = useState(false);
  const searchBarRef = useRef(null);
 const [pendingAction, setPendingAction] = useState(null);
  const { settings } = useSettings()
  const [tableHeaderData, setTableHeaderData] = useState({
    esignStatus: '',
    searchVal: ''
  });
  const [formData, setFormData] = useState({});
  const apiAccess = useApiAccess("uom-create",
    "uom-update",
    "uom-approve");

  useLayoutEffect(() => {
    let data = getUserData();
    const decodedToken = getTokenValues();
    setConfig(decodedToken);
    setUserDataPdf(data);
    return () => { }
  }, [])

  useEffect(() => {
      if (formData && pendingAction) {
        const esign_status = "approved";
        if (pendingAction === "edit") {
          editUOM() ;
        }
        else {
          addUOM(esign_status)
        }
        setPendingAction(null);
      }
    }, [formData, pendingAction]);

  useEffect(() => {
    getData();
  }, [ page, rowsPerPage, tableHeaderData.esignStatus,tableHeaderData.searchVal]);
  const tableBody = uomData.map((item, index) => [
    index + 1, 
    item.uom_name, 
    item.esign_status || "N/A"
  ]);
  const tableData = useMemo(() => ({
    tableHeader: ['Sr.No.', 'UOM Name', 'E-Sign'],
    tableHeaderText: 'UOM Report',
    tableBodyText: 'UOM Data',
    filename:'UOM'
  }), []);
  const getData = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage === -1 ? -1 : rowsPerPage,
        search: tableHeaderData.searchVal,
        esign_status: tableHeaderData.esignStatus,
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
    setAlertData({ ...alertData, openSnackbar: false })
  };

  const resetForm = () => {
    setEditData({});
  };

  const handleOpenModal = () => {
    setApproveAPI({
      approveAPIName: "uom-create",
      approveAPImethod: "POST",
      approveAPIEndPoint: "/api/v1/uom"
    })
    resetForm();
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleAuthModalClose = () => {
    setAuthModalOpen(false);
    setOpenModalApprove(false);
  };

  const handleSubmitForm = async (UomData) => {
    console.log(UomData, ':-unit measure')
    setFormData(UomData);
    console.log(editData)
    if (editData?.id) {
      setApproveAPI({
        approveAPIName: "uom-update",
        approveAPImethod: "PUT",
        approveAPIEndPoint: "/api/v1/uom"
      })
    } else {
      setApproveAPI({
        approveAPIName: "uom-create",
        approveAPImethod: "POST",
        approveAPIEndPoint: "/api/v1/uom"
      })
    }
  
    if (config?.config?.esign_status) {
      setAuthModalOpen(true);
      return;
    }
    setPendingAction(editData?.id ? "edit" : "add");
  };

  const handleAuthResult = async (isAuthenticated, user, isApprover, esignStatus, remarks) => {
    console.log("handleAuthResult 01", isAuthenticated, isApprover, esignStatus, user);
    console.log("handleAuthResult 02", config.userId, user.user_id);
    const handleAuthenticationError = () => {
      setAlertData({ openSnackbar: true, type: 'error', message: 'Authentication failed, Please try again.' });
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
      downloadPdf(tableData,tableHeaderData,tableBody,uomData,userDataPdf);
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
      setApproveAPI(({
        approveAPIName: "",
        approveAPImethod: "",
        approveAPIEndPoint: ""
      }))
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
    console.log("handleAuthCheck", row);
    setApproveAPI({
      approveAPIName: "uom-approve",
      approveAPIEndPoint: "PATCH",
      approveAPIMethod: "/api/v1/uom"
    })
    setAuthModalOpen(true);
    setESignStatusId(row.id);
    setAuditLogMark(row.uom_name)
  }
  const addUOM = async (esign_status, remarks) => {
    try {
      const data = { UOMName: formData.unitName };
      const auditlogRemark = remarks
      const audit_log = config?.config?.audit_logs ? {
        "audit_log": true,
        "performed_action": "add",
        "remarks": auditlogRemark?.length > 0 ? auditlogRemark : `UOM added - ${formData.unitName}`,
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
        setAlertData({...alertData ,openSnackbar: true, type: 'success', message: 'Unit added successfully' });
        getData();
        setOpenModal(false);
      } else {
        setAlertData({...alertData, openSnackbar:true,type: 'error', message: res.data?.message });
        if (res.data?.code === 401) {
          removeAuthToken();
          router.push('/401');
        }
      }
    } catch (error) {

      router.push('/500');
      setOpenModal(false);

    } finally {
      setApproveAPI({
        approveAPIName: "",
        approveAPIEndPoint: "",
        approveAPIMethod: ""

      })
      setIsLoading(false);
    }
  };
  const editUOM = async (esign_status, remarks) => {
    try {
      console.log(formData, "edit")
      const data = { UOMName: formData.unitName };
      const auditlogRemark = remarks
      let audit_log;
      if (config?.config?.audit_logs) {
        audit_log = {
          "audit_log": true,
          "performed_action": "edit",
          "remarks": auditlogRemark > 0 ? auditlogRemark : `UOM edited - ${formData.unitName}`,
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
      console.log(res,'editdata')
      if (res.data.success) {

        setAlertData({ ...alertData, openSnackbar: true, type: 'success', message: 'Unit updated successfully' });
        resetForm();
        getData();
        setOpenModal(false);

      } else {
        setAlertData({ ...alertData, openSnackbar: true, type: 'error', message: res.data.message });
        if (res.data.code === 401) {
          removeAuthToken();
          router.push('/401');
        }
      }
    } catch (error) {
      router.push('/500');
      setOpenModal(false);

    } finally {
      setIsLoading(false);
    }
  };
  // const resetData = () => {
  //   setUnitName('');
  //   setErrorUnitName({ isError: false, message: '' });
  // }
  const handleUpdate = item => {
    // console.log(item, "aaaaa")
    setEditData(item);
    setFormData({...FormData,unitName:item.uom_name});
    setOpenModal(true);

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
    if (searchBarRef.current) {
      searchBarRef.current.resetSearch();
    }
    setTableHeaderData({ ...tableHeaderData, esignStatus: "" ,searchVal:""})
  };
  const handleSearch = (val) => {
    setTableHeaderData({ ...tableHeaderData,searchVal:val.toLowerCase()});
    setPage(0);
  };
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = event => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };
 
  const handleAuthModalOpen = () => {
    console.log("OPen auth model");
    setApproveAPI({
      approveAPIName: "uom-approve",
      approveAPIEndPoint: "PATCH",
      approveAPIMethod: "/api/v1/uom"
    })
    setAuthModalOpen(true);
  };
  const handleDownloadPdf = () => {
    setApproveAPI({
      approveAPIName: "uom-create",
      approveAPIEndPoint: "POST",
      approveAPIMethod: "/api/v1/uom"
    })
    if (config?.config?.esign_status) {
      console.log("Esign enabled for download pdf");
      setEsignDownloadPdf(true);
      setAuthModalOpen(true);
      return;
    }
    downloadPdf(tableData,tableHeaderData,tableBody,uomData,userDataPdf);
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

                 <CustomSearchBar ref={searchBarRef} handleSearchClick={handleSearch} />
               

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

      <SnackbarAlert openSnackbar={alertData.openSnackbar} closeSnackbar={closeSnackbar} alertData={alertData} />
      <UomModal
        open={openModal}
        onClose={handleCloseModal}
        editData={editData}
        handleSubmitForm={handleSubmitForm}
      />


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
  );
}

export async function getServerSideProps(context) {
  return validateToken(context, 'Unit Of Measurement')
}
export default ProtectedRoute(Index)