'use-client'
import { Button, Paper, TableContainer, TextField } from '@mui/material'
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
import TableAreaCategory from 'src/views/tables/TableAreaCategory'
import { getTokenValues} from '../../utils/tokenUtils'
import ExportResetActionButtons from 'src/components/ExportResetActionButtons'
import { validateToken } from 'src/utils/ValidateToken'
import EsignStatusDropdown from 'src/components/EsignStatusDropdown'
import CustomSearchBar from 'src/components/CustomSearchBar'
import AreaCategoryModal from 'src/components/Modal/AreaCategoryModal'
import downloadPdf from 'src/utils/DownloadPdf'

const Index = () => {
  const { settings } = useSettings()
  const [openModal, setOpenModal] = useState(false)
  const [alertData, setAlertData] = useState({openSnackbar:false, type: '', message: '', variant: 'filled' })
  const [allAreaCategoryData, setAllAreaCategoryData] = useState([])
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
  const [approveAPI,setApproveAPI]=useState({ approveAPIName:'',approveAPImethod:'',approveAPIEndPoint:''})
  const [eSignStatusId, setESignStatusId] = useState('');
  const [auditLogMark, setAuditLogMark] = useState('');
  const [esignDownloadPdf, setEsignDownloadPdf] = useState(false);
  const [openModalApprove, setOpenModalApprove] = useState(false);
  const [tableHeaderData, setTableHeaderData] = useState({
      esignStatus: '',
      searchVal: ''
    });
 const [formData, setFormData] = useState({}); 
const apiAccess = useApiAccess("area-category-create", "area-category-update", "area-category-approve")

const tableBody = allAreaCategoryData.map((item, index) => 
  [index + 1, item.area_category_name, item.esign_status]);

 const tableData = useMemo(() => ({
    tableHeader: ['Sr.No.', 'Area Category', 'E-Sign'],
    tableHeaderText: 'Area Category Report',
    tableBodyText: 'Area Category Data'
  }), []);
  
  useLayoutEffect(() => {
    let data = getUserData();
    const decodedToken = getTokenValues();
    setConfig(decodedToken);
    setUserDataPdf(data);
    return () => { }
  }, [])
  useEffect(() => {
    getData()
  }, [tableHeaderData.esignStatus,tableHeaderData.searchVal, rowsPerPage, page])
  const getData = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage === -1 ? -1 : rowsPerPage,
        search: tableHeaderData.searchVal,
        esign_status: tableHeaderData.esignStatus,
      });
      const res = await api(`/area-category/?${params.toString()}`, {}, 'get', true);
      console.log("get area category ", res?.data)
      if (res.data.success) {
        setAllAreaCategoryData(res.data.data.areaCategories)
        setTotalRecords(res.data.data.total)
      } else {
        console.log('Error to get all area categories ', res.data)
        if (res.data.code === 401) {
          removeAuthToken();
          router.push('/401');
        }
      }
    } catch (error) {
      console.log('Error in get area categories ', error)
    } finally {
      setIsLoading(false)
    }
  }
  const closeSnackbar = () => {
    setAlertData({...alertData,openSnackbar:false})
  }
  const handleOpenModal = () => {
    setApproveAPI({
      approveAPIName:"area-category-create",
      approveAPImethod:"POST",
      approveAPIEndPoint:"/api/v1/area-category"
    })
  
    resetForm();
    setOpenModal(true)
  }
  const handleCloseModal = () => {
    resetForm();
    setOpenModal(false)
  }
  const handleAuthModalClose = () => {
    setAuthModalOpen(false);
    setOpenModalApprove(false);
  };
 
  const resetForm = () => {
    
    setEditData({});
  }
  
  const handleSubmitForm = async (data) => {
    setFormData(data)
    if (editData?.id) {
      
      setApproveAPI({
         approveAPIName:'area-category-update',approveAPImethod:'PUT',approveAPIEndPoint:'api/v1/area-category'
      })
    } else {
     
      setApproveAPI({
        approveAPIName:'area-category-create',approveAPImethod:'POST',approveAPIEndPoint:'api/v1/area-category'
     })
    }

    if (config?.config?.esign_status) {
      setAuthModalOpen(true);
      return;
    }
    const esign_status = "approved";
    editData?.id ? editAreaCategory() : addAreaCategory(esign_status);
  }
  const addAreaCategory = async (esign_status, remarks) => {
    try {
      const data =  {areaCategoryName:formData.areaCategoryName} ;
      const auditlogRemark = remarks;
      const audit_log = config?.config?.audit_logs ? {
        "audit_log": true,
        "performed_action": "add",
        "remarks": auditlogRemark?.length > 0 ? auditlogRemark : `area category added - ${formData.areaCategoryName}`,
      } : {
        "audit_log": false,
        "performed_action": "none",
        "remarks": `none`,
      };
      data.audit_log = audit_log;
      console.log(data)
      data.esign_status = esign_status;
      console.log('Add area category data ', data)
      setIsLoading(true);
      const res = await api('/area-category/', data, 'post', true)
      setIsLoading(false);
      if (res?.data?.success) {
        console.log('res data', res?.data)
        setAlertData({ ...alertData,openSnackbar:true, type: 'success', message: 'Area category added successfully' });
        getData();
        resetForm();
      } else {
        console.log('error to add area category ', res.data)
        setAlertData({ ...alertData,openSnackbar:true, type: 'error', message: res.data?.message })
        if (res.data.code === 401) {
          removeAuthToken();
          router.push('/401');
        }
      }
    } catch (error) {
      console.log('Erorr to add area category ', error)
      router.push('/500');
    } finally {
      setOpenModal(false);
      setApproveAPI({
        approveAPIName:'',approveAPImethod:'',approveAPIEndPoint:''
     })
    }
  }
  const editAreaCategory = async (esign_status, remarks) => {
    try {
      const data = { areaCategoryName:formData.areaCategoryName };
      const auditlogRemark = remarks;
      let audit_log;
      if (config?.config?.audit_logs) {
        audit_log = {
          "audit_log": true,
          "performed_action": "edit",
          "remarks": auditlogRemark?.length > 0 ? auditlogRemark : `area category edited - ${formData.areaCategoryName}`,
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
      const res = await api(`/area-category/${editData.id}`, data, 'put', true)
      setIsLoading(false);
      if (res.data.success) {
        console.log('res ', res.data)
        setAlertData({ ...alertData, openSnackbar:true,type: 'success', message: 'Area category updated successfully' })
        resetForm();
        getData()
      } else {
        console.log('error to edit area category ', res.data)
        setAlertData({ ...alertData,openSnackbar:true, type: 'error', message: res.data.message })
        if (res.data.code === 401) {
          removeAuthToken();
          router.push('/401');
        }
      }
    } catch (error) {
      console.log('Erorr to edit area category ', error)
      router.push('/500');
    } finally {
      setOpenModal(false);
      setIsLoading(false);
      setApproveAPI({
        approveAPIName:'',approveAPImethod:'',approveAPIEndPoint:''
     })
    }
  }
  const handleUpdate = item => {
    resetForm()
    setOpenModal(true)
    setEditData(item)
    console.log('edit area category ', item)
    setFormData({...formData,areaCategoryName:item.area_category_name})
  }
  const handleAuthResult = async (isAuthenticated, user, isApprover, esignStatus, remarks) => {
    console.log("handleAuthResult 01", isAuthenticated, isApprover, esignStatus, user);
    console.log("handleAuthResult 02", config?.userId, user.user_id);
    const resetState = () => {
      setApproveAPI({
        approveAPIName:'',approveAPImethod:'',approveAPIEndPoint:''
     })
      setAuthModalOpen(false);
    };
    const handleApproverActions = async () => {
      const data = {
        modelName: "areacategory",
        esignStatus:tableHeaderData.esignStatus,
        id: eSignStatusId,
        audit_log: config?.config?.audit_logs ? {
          "user_id": user.userId,
          "user_name": user.userName,
          "performed_action": 'approved',
          "remarks": remarks.length > 0 ? remarks : `area category approved - ${auditLogMark}`,
        } : {}
      };
      if (esignStatus === "approved" && esignDownloadPdf) {
        setOpenModalApprove(false);
        console.log("esign is approved for approver");
        resetState();
        downloadPdf(tableData,tableHeaderData,tableBody,allAreaCategoryData,userDataPdf);
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
          editData?.id ? editAreaCategory(esign_status, remarks) : addAreaCategory(esign_status, remarks);
        }
      }
    };
    if (!isAuthenticated) {
      setAlertData({openSnackbar:true, type: 'error', message: 'Authentication failed, Please try again.' });
      return;
    }
    if (isApprover) {
      await handleApproverActions();
    } else {
      handleCreatorActions();
    }
    resetState();
    getData();
  };
  const handleAuthCheck = async (row) => {
    console.log("handleAuthCheck", row)
    setApproveAPI({
      approveAPIName:'area-category-approve',approveAPImethod:'PATCH',approveAPIEndPoint:'/api/v1/area-category'
   })
    setAuthModalOpen(true);
    setESignStatusId(row.id);
    setAuditLogMark(row.area_category_name)
    console.log("row", row)
    
  }
  const handleSortByName = () => {
    const newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc'
    const sorted = [...allAreaCategoryData].sort((a, b) => {
      if (a.area_category_name > b.area_category_name) {
        return newSortDirection === 'asc' ? 1 : -1
      }
      if (a.area_category_name < b.area_category_name) {
        return newSortDirection === 'asc' ? -1 : 1
      }
      return 0
    })
    setAllAreaCategoryData(sorted)
    setSortDirection(newSortDirection)
  }
  const resetFilter = () => {
    setTableHeaderData({ ...tableHeaderData, esignStatus: "",searchVal:"" })
  }
  const handleSearch = (val) => {
   
    setTableHeaderData({ ...tableHeaderData,searchVal:val.toLowerCase()});
    setPage(0);
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
    setApproveAPI({
     approveAPIName:"area-category-approve",
     approveAPImethod:"PATCH",
     approveAPIEndPoint:"/api/v1/area-category" 
    })
    setAuthModalOpen(true);
  };
  const handleDownloadPdf = () => {
  
    setApproveAPI({
      approveAPIName:"area-category-create",
      approveAPImethod:"POST",
      approveAPIEndPoint:"/api/v1/area-category" 
     })
    if (config?.config?.esign_status) {
      console.log("Esign enabled for download pdf");
      setEsignDownloadPdf(true);
      setAuthModalOpen(true);
      return;
    }
    downloadPdf(tableData,tableHeaderData,tableBody,allAreaCategoryData,userDataPdf);
  }
  return (
    <Box padding={4}>
      <Head>
        <title>Area Category</title>
      </Head>
      <Grid2 item xs={12}>
        <Typography variant='h2'>Area Category</Typography>
      </Grid2>
      <Grid2 item xs={12}>
        <Grid2 item xs={12}>
          <Box sx={{ backgroundColor: settings.mode === 'dark' ? '#212121' : 'white', borderRadius: 1 }}>
            <Typography variant='h4' className='mx-4 my-2 mx-2' sx={{ paddingTop: '1%' }}>
              Filter
            </Typography>
            <Grid2 item xs={12}>
              <Box className='d-flex justify-content-between align-items-center my-3 mx-4'>
                {/* <EsignStatusFilter esignStatus={eSignStatus} setEsignStatus={setESignStatus} /> */}
           <EsignStatusDropdown tableHeaderData={tableHeaderData} setTableHeaderData={setTableHeaderData} />
               
              </Box>
              <Box className='d-flex justify-content-between align-items-center mx-4 my-2'>
                <ExportResetActionButtons handleDownloadPdf={handleDownloadPdf} resetFilter={resetFilter} />
                <Box className='d-flex justify-content-between align-items-center '>
                
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
                Area Category Data
              </Typography>
              <TableContainer component={Paper}>
                <TableAreaCategory
                  areaCategoryData={allAreaCategoryData}
                  handleUpdate={handleUpdate}
                  handleSortByName={handleSortByName}
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
      
      <AreaCategoryModal
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
  )
}
export async function getServerSideProps(context) {
  return validateToken(context, 'Area Category')
}
export default ProtectedRoute(Index)