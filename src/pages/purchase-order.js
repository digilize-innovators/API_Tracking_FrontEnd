'use-client'
import React, { useState, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { Box, Grid2, Typography, Button } from '@mui/material'
import { IoMdAdd } from 'react-icons/io'
import { api } from 'src/utils/Rest-API'
import ProtectedRoute from 'src/components/ProtectedRoute'
import SnackbarAlert from 'src/components/SnackbarAlert'
import { useLoading } from 'src/@core/hooks/useLoading'
import { useAuth } from 'src/Context/AuthContext'
import Head from 'next/head'
import { useSettings } from 'src/@core/hooks/useSettings'
import { useRouter } from 'next/router'
import ChatbotComponent from 'src/components/ChatbotComponent'
import AccessibilitySettings from 'src/components/AccessibilitySettings'
import { getTokenValues } from 'src/utils/tokenUtils'
import { useApiAccess } from 'src/@core/hooks/useApiAccess'
import ExportResetActionButtons from 'src/components/ExportResetActionButtons'
import { validateToken } from 'src/utils/ValidateToken'
import PurchaseOrderModel from 'src/components/Modal/PurchaseOrderModel'
import CustomSearchBar from 'src/components/CustomSearchBar'
import downloadPdf from 'src/utils/DownloadPdf'
import TablePurchaseOrder from 'src/views/tables/TablePurchaseOrder'
import moment from 'moment/moment'

const Index = () => {
  const router = useRouter()
  const { settings } = useSettings()
  const searchRef = useRef()
  const [pendingAction, setPendingAction] = useState(null)
  const [openModal, setOpenModal] = useState(false)
  const [alertData, setAlertData] = useState({ openSnackbar: false, type: '', message: '', variant: 'filled' })
  const [purchaseOrder, setPurchaseOrder] = useState({ data: [], index: 0 })
  const { setIsLoading } = useLoading()
  const [editData, setEditData] = useState({})
  const [userDataPdf, setUserDataPdf] = useState()
  const { getUserData, removeAuthToken } = useAuth()
  const [config, setConfig] = useState(null)
  const [formData, setFormData] = useState({})
  const [tableHeaderData, setTableHeaderData] = useState({searchVal: ''})
  const [purchaseDetail,setPurchaseDetail]=useState([])
  const apiAccess = useApiAccess('purchase-order-create', 'purchase-order-update','purchase-order-approve')

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
            await editPurchaseOrder(); 
          } else if (pendingAction === "add") {
            await addPurchaseOrder();  
          }
          setPendingAction(null);
        }
      };
      handleUserAction();
    }, [formData, pendingAction]);
  

  const tableBody = purchaseOrder.data?.map((item, index) => [
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
      tableHeaderText: 'Purchase Order Report',
      tableBodyText: 'Purchase Order Data',
      filename: 'PurchaseOrder'
    }),[])

  const closeSnackbar = () => {
    setAlertData({ ...alertData, openSnackbar: false })
  }
  const handleOpenModal = () => {
    setEditData({})
    setFormData({})
    setOpenModal(true)
  }
   const getPurchaseDetail = async (id) => {
          setIsLoading(true);
          try {
              const res = await api(`/purchase-order/details/${id}`, {}, 'get', true);
              if (res.data.success) {
                  const fetchedOrders = res.data.data.orders || [];
                  setPurchaseDetail(fetchedOrders);            
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
  const handleCloseModal = () => {
    setOpenModal(false)
    setFormData({})
    setEditData({})
    setPurchaseDetail([])
  }

  const handleSubmitForm = async data => {
    console.log('handle submit form data : ', data)
    setFormData(data)
    setPendingAction(editData?.id ? 'edit' : 'add')
  }

  const addPurchaseOrder = async () => {
    try {
      const data = { ...formData }
      setIsLoading(true)
      const res = await api('/purchase-order/', data, 'post', true);
      setIsLoading(false)
      if (res?.data?.success) {
        setOpenModal(false)
        console.log('Add purchase order :-', res?.data)
        setAlertData({ ...alertData, openSnackbar: true, type: 'success', message: 'Purchase order added successfully' })
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
  const editPurchaseOrder = async () => {   
    try {
      const data = { ...formData }
      console.log("editPurchaseOrder editPurchaseOrder ", data);

      const filteredOrders = data.orders.filter(order =>
        !purchaseDetail.some(purchase => purchase.product_id === order.productId)
      );
      filteredOrders.length>0 ? data.orders=filteredOrders : delete data.orders
      delete data.to
      console.log('EDIT FORM DATA :->', data)
      setIsLoading(true)
      const res = await api(`/purchase-order/${editData.id}`, data, 'put', true)

      setIsLoading(false)
      if (res.data.success) {
        setOpenModal(false)
        setAlertData({ ...alertData, openSnackbar: true, type: 'success', message: 'Purchase Order updated successfully' })
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
    setTableHeaderData({  searchVal: val.trim().toLowerCase() })
  }

  const handleUpdate =async item => {
    await getPurchaseDetail(item.id)
    console.log(item)
    setEditData(item)
    setOpenModal(true)
    
  }

  const resetFilter = () => {
    if (searchRef.current) {
      searchRef.current.resetSearch()
    }
    setTableHeaderData({ ...tableHeaderData, searchVal: '' })
  }
  const handleView=async item => {
    await getPurchaseDetail(item.id)
  }

  
  const handleDownloadPdf = () => {
    let data = getUserData()
    setUserDataPdf(data)
    downloadPdf(tableData, tableHeaderData, tableBody, purchaseOrder?.data, userDataPdf)
  }
  return (
    <Box padding={4}>
      <Head>
        <title>Purchase Order</title>
      </Head>
      <Grid2 item xs={12}>
        <Typography variant='h2'>Purchase Order </Typography>
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
                Purchase Order Data
              </Typography>
              <TablePurchaseOrder
                handleUpdate={handleUpdate}
                tableHeaderData={tableHeaderData}
                pendingAction={pendingAction}
                setDataCallback={setPurchaseOrder}
                apiAccess={apiAccess}
                handleAuthCheck={()=> {}}
                purchaseDetail={purchaseDetail}
                handleView={handleView}
              />
            </Grid2>
          </Box>
        </Grid2>
      </Grid2>
      <SnackbarAlert openSnackbar={alertData.openSnackbar} closeSnackbar={closeSnackbar} alertData={alertData} />
      <PurchaseOrderModel
        open={openModal}
        handleClose={handleCloseModal}
        editData={editData}
        purchaseDetail={purchaseDetail}
        handleSubmitForm={handleSubmitForm}
      />
      <AccessibilitySettings />
      <ChatbotComponent />
    </Box>
  )
}

export async function getServerSideProps(context) {
  return validateToken(context, 'Purchase Order')
}

export default ProtectedRoute(Index)
