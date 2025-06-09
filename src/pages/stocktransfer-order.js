'use-client'
import React, { useState, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { Box, Grid2, Typography, Button, TableContainer, Paper } from '@mui/material'
import { IoMdAdd } from 'react-icons/io'
import { api } from 'src/utils/Rest-API'
import ProtectedRoute from 'src/components/ProtectedRoute'
import SnackbarAlert from 'src/components/SnackbarAlert'
import { useLoading } from 'src/@core/hooks/useLoading'
import { useAuth } from 'src/Context/AuthContext'
import Head from 'next/head'
import { useSettings } from 'src/@core/hooks/useSettings'
import { useRouter } from 'next/router'
import AuthModal from 'src/components/authModal'
import ChatbotComponent from 'src/components/ChatbotComponent'
import AccessibilitySettings from 'src/components/AccessibilitySettings'
import { getTokenValues } from 'src/utils/tokenUtils'
import { useApiAccess } from 'src/@core/hooks/useApiAccess'
import ExportResetActionButtons from 'src/components/ExportResetActionButtons'
import { validateToken } from 'src/utils/ValidateToken'
import CustomSearchBar from 'src/components/CustomSearchBar'
import EsignStatusDropdown from 'src/components/EsignStatusDropdown'
import downloadPdf from 'src/utils/DownloadPdf'
import StockTrasferModel from 'src/components/Modal/StockTrasferModel'
import TableStocktransfer from 'src/views/tables/TableStocktransfer'
import moment from 'moment/moment'
const Index = () => {
  const router = useRouter()
  const { settings } = useSettings()
  const searchRef = useRef()
  const [pendingAction, setPendingAction] = useState(null)
  const [openModal, setOpenModal] = useState(false)
  const [alertData, setAlertData] = useState({ openSnackbar: false, type: '', message: '', variant: 'filled' })
  const [stocktransfer,setStocktransfer] = useState([])
  const { setIsLoading } = useLoading()
  const [editData, setEditData] = useState({})
  const [userDataPdf, setUserDataPdf] = useState()
  const { getUserData, removeAuthToken } = useAuth()
  const [config, setConfig] = useState(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [approveAPI, setApproveAPI] = useState({ approveAPIName: '', approveAPImethod: '', approveAPIEndPoint: '' })
  const [eSignStatusId, setESignStatusId] = useState('')
  const [auditLogMark, setAuditLogMark] = useState('')
  const [esignDownloadPdf, setEsignDownloadPdf] = useState(false)
  const [openModalApprove, setOpenModalApprove] = useState(false)
  const [formData, setFormData] = useState({})
  const [tableHeaderData, setTableHeaderData] = useState({esignStatus: '',searchVal: ''})
  const [stocktransferDetail,setStocktranferDetail]=useState([])

  const apiAccess = useApiAccess('stocktransfer-order-create', 'stocktransfer-order-update','stocktransfer-order-approve')

  useLayoutEffect(() => {
    const data = getUserData()
    const decodedToken = getTokenValues()
    setConfig(decodedToken)
    setUserDataPdf(data)
    return () => {}
  }, [])

  useEffect(() => {
      const handleUserAction = async () => {
        if (formData && pendingAction) {
          if (pendingAction === "edit") {
            await editStockTrasfer(); 
          } else if (pendingAction === "add") {
            await addStockTransfer();  
          }
          setPendingAction(null);
        }
      };
      handleUserAction();
    }, [formData, pendingAction]);
  

  const tableBody = stocktransfer?.map((item, index) => [
        index + 1,
        item.order_no,
        item.status,
        item.order_from_location.location_name,
        item.order_to_location.location_name,
        moment(item.order_date ).format('DD/MM/YYYY, hh:mm:ss a')   
  ])

  const tableData = useMemo(
    () => ({
      tableHeader: ['Sr.No.', 'Order No','Status', 'From', 'To',  'Order Date'],
      tableHeaderText: 'stock Transfer Order Report',
      tableBodyText: 'stock Transfer Order Data',
      filename: 'stocktransfer'
    }),[])
   const getStockTransferDetail = async (id) => {
            setIsLoading(true);
            try {
                const res = await api(`/stocktransfer-order/details/${id}`, {}, 'get', true);
                if (res.data.success) {
                    const fetchedOrders = res.data.data.orders || [];
        
                    // Set raw detail (if needed elsewhere)
                    setStocktranferDetail(fetchedOrders);
        
                       
                } else if (res.data.code === 401) {
                    removeAuthToken();
                    router.push('/401');
                } else {
                    console.log('Error: Unexpected response', res.data);
                }
            } catch (error) {
                console.log('Error in getPurchaseDetail', error);
            } finally {
                setIsLoading(false);
            }
        };
  const closeSnackbar = () => {
    setAlertData({ ...alertData, openSnackbar: false })
  }
  const handleOpenModal = () => {
    setApproveAPI({
      approveAPIName: 'stocktransfer-order-create',
      approveAPImethod: 'POST',
      approveAPIEndPoint: '/api/v1/stocktransfer-order'
    })
    setEditData({})
    setFormData({})
    setOpenModal(true)
  }
  const handleCloseModal = () => {
    setOpenModal(false)
    setFormData({})
    setEditData({})
    setStocktranferDetail([])
  }

  const handleAuthModalClose = () => {
    setAuthModalOpen(false)
    setOpenModalApprove(false)
  }

  const handleSubmitForm = async data => {
    console.log('handle submit form data : ', data)
    setFormData(data)
    setPendingAction(editData?.id ? 'edit' : 'add')
  }
 
  const addStockTransfer = async (esign_status, remarks) => {
    try {
      console.log('formdata', formData)
      const data = { ...formData }
      setIsLoading(true)
      const res = await api('/stocktransfer-order/', data, 'post', true)
      console.log('res Add purchase order ', res)

      console.log(res, 'res')
      setIsLoading(false)

      if (res?.data?.success) {
        setOpenModal(false)
        console.log('Add order :-', res?.data)
        setAlertData({ ...alertData, openSnackbar: true, type: 'success', message: 'Added successfully' })
        setEditData({})
      } else {
        setAlertData({ ...alertData, openSnackbar: true, type: 'error', message: res.data?.message })
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        } else if (res.data.code === 409) {
          setAlertData({ ...alertData, openSnackbar: true, type: 'error', message: res.data.message })
          console.log('409 :', res.data.message)
        } else if (res.data.code == 500) {
          setOpenModal(false)
        }
      }
    } catch (error) {
      setOpenModal(false)
      console.log('Error in add locaiton ', error)
      router.push('/500')
    } finally {
      setIsLoading(false)
    }
  }
  const editStockTrasfer = async () => {
    try {
      const data = { ...formData }
      const filteredOrders = data.orders.filter(order =>
        !stocktransferDetail.some(purchase => purchase.product_id === order.productId)
      );
      filteredOrders.length>0?data.orders=filteredOrders:delete data.orders
      setIsLoading(true)
      const res = await api(`/stocktransfer-order/${editData.id}`, data, 'put', true)
      setIsLoading(false)
      if (res.data.success) {
        setOpenModal(false)
        setAlertData({ ...alertData, openSnackbar: true, type: 'success', message: 'Updated successfully' })
      } else {
        setAlertData({ ...alertData, openSnackbar: true, type: 'error', message: res.data.message })
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        } else if (res.data.code === 500) {
          setOpenModal(false)
        }
      }
    } catch (error) {
      setOpenModal(false)
      router.push('/500')
    } finally {
      setIsLoading(false)
    }
  }
  const handleSearch = val => {
    setTableHeaderData({ ...tableHeaderData, searchVal: val.trim().toLowerCase() })
  }

  const handleUpdate = async item => {
    await getStockTransferDetail(item.id)
    setEditData(item)
    setOpenModal(true)
  }
  const updateView= async item =>{
    await getStockTransferDetail(item.id)
  }

  const resetFilter = () => {
    if (searchRef.current) {
      searchRef.current.resetSearch() // Call the reset method in the child
    }
    setTableHeaderData({ ...tableHeaderData, searchVal: '' })
  }

 
  const handleDownloadPdf = () => { 
    let data = getUserData()
    setUserDataPdf(data)
    downloadPdf(tableData, tableHeaderData, tableBody, stocktransfer, userDataPdf)
  }
  return (
    <Box padding={4}>
      <Head>
        <title>Stock Transfer Order</title>
      </Head>
      <Grid2 item xs={12}>
        <Typography variant='h2'>Stock Transfer Order </Typography>
      </Grid2>
      <Grid2 item xs={12}>
        <Grid2 item xs={12}>
          <Box sx={{ backgroundColor: settings.mode === 'dark' ? '#212121' : 'white', borderRadius: 1 }}>
            <Grid2 item xs={12}>
              {config?.config?.esign_status && (
                <Typography variant='h4' className='mx-4 my-2 mx-2' sx={{ paddingTop: '1%' }}>
                  Filter
                </Typography>
              )}
              <Grid2 item xs={12}>
                <Box className='d-flex justify-content-between align-items-center my-3 mx-4'>
                </Box>
                <Box className='d-flex justify-content-between align-items-center mx-4 my-2'>
                  <ExportResetActionButtons handleDownloadPdf={handleDownloadPdf} resetFilter={resetFilter} />
                  <Box className='d-flex justify-content-between align-items-center '>
                    <CustomSearchBar ref={searchRef} handleSearchClick={handleSearch} />

                    {apiAccess.addApiAccess && (
                      <Box className='mx-2'>
                        <Button variant='contained' className='py-2' onClick={handleOpenModal} role='button'>
                          <span>
                            <IoMdAdd />
                          </span>
                          <span>Add</span>
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Grid2>
            </Grid2>
            <Grid2 item xs={12}>
              <Typography variant='h4' className='mx-4 mt-3'>
              Stock Transfer Order Data
              </Typography>
              <TableContainer component={Paper}>
                <TableStocktransfer
                  handleUpdate={handleUpdate}
                  tableHeaderData={tableHeaderData}
                  pendingAction={pendingAction}
                  setStocktransfer={setStocktransfer}
                  apiAccess={apiAccess}
                  updateView={updateView}
                  stocktransferDetail={stocktransferDetail}
                />
              </TableContainer>
            </Grid2>
          </Box>
        </Grid2>
      </Grid2>
      <SnackbarAlert openSnackbar={alertData.openSnackbar} closeSnackbar={closeSnackbar} alertData={alertData} />
     
      <StockTrasferModel
        open={openModal}
        handleClose={handleCloseModal}
        editData={editData}
        stocktransferDetail={stocktransferDetail}
        handleSubmitForm={handleSubmitForm}
      />
      <AccessibilitySettings />
      <ChatbotComponent />
    </Box>
  )
}

export async function getServerSideProps(context) {
  return validateToken(context, 'Stock Transfer Order')
}

export default ProtectedRoute(Index)
