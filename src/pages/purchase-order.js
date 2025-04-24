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
  const [purchaseOrder, setPurchaseOrder] = useState([])
  const { setIsLoading } = useLoading()
  const [editData, setEditData] = useState({})
  const [userDataPdf, setUserDataPdf] = useState()
  const { getUserData, removeAuthToken } = useAuth()
  const [config, setConfig] = useState(null)
  const [formData, setFormData] = useState({})
  const [tableHeaderData, setTableHeaderData] = useState({searchVal: ''})
  const apiAccess = useApiAccess('purchase-order-create', 'purchase-order-update','purchase-order-approve')
  console.log("apiAccess",apiAccess)

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
  

  console.log(purchaseOrder)
  const tableBody = purchaseOrder?.map((item, index) => [
    index + 1,
    item.order_no,
    item.order_from_location.location_name,
    item.order_to_location.location_name,
    moment(item.order_date ).format('DD/MM/YYYY, hh:mm:ss a')
  ])

  const tableData = useMemo(
    () => ({
      tableHeader: ['Sr.No.', 'Order No', 'From', 'To',  'Order Date'],
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
  const handleCloseModal = () => {
    setOpenModal(false)
    setFormData({})
    setEditData({})
  }

  const handleSubmitForm = async data => {
    console.log('handle submit form data : ', data)
    setFormData(data)
    setPendingAction(editData?.id ? 'edit' : 'add')
  }

  const addPurchaseOrder = async (esign_status, remarks) => {
    try {
      console.log('formdata', formData)
      const data = { ...formData }
      setIsLoading(true)
      const res = await api('/purchase-order/', data, 'post', true)
      console.log('res Add purchase order ', res)

      console.log(res, 'res')
      setIsLoading(false)

      if (res?.data?.success) {
        setOpenModal(false)
        console.log('Add purchase order :-', res?.data)
        setAlertData({ ...alertData, openSnackbar: true, type: 'success', message: 'purchase order added successfully' })
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
  const editPurchaseOrder = async (esign_status, remarks) => {
    try {
      const data = { ...formData }
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

  const handleUpdate = item => {
    setEditData(item)
    setOpenModal(true)
    
  }

  const resetFilter = () => {
    if (searchRef.current) {
      searchRef.current.resetSearch()
    }
    setTableHeaderData({ ...tableHeaderData, searchVal: '' })
  }

  
  const handleDownloadPdf = () => {
    let data = getUserData()
    setUserDataPdf(data)
    downloadPdf(tableData, tableHeaderData, tableBody, purchaseOrder, userDataPdf)
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
              <TableContainer component={Paper}>
                <TablePurchaseOrder
                  handleUpdate={handleUpdate}
                  tableHeaderData={tableHeaderData}
                  pendingAction={pendingAction}
                  setPurchaseOrder={setPurchaseOrder}
                  apiAccess={apiAccess}
                  config={config}
                />
              </TableContainer>
            </Grid2>
          </Box>
        </Grid2>
      </Grid2>
      <SnackbarAlert openSnackbar={alertData.openSnackbar} closeSnackbar={closeSnackbar} alertData={alertData} />
      <PurchaseOrderModel
        open={openModal}
        handleClose={handleCloseModal}
        editData={editData}
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
