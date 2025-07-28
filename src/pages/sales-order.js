'use-client'
import React, { useState, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { Box, Grid2, Typography, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
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
import CustomSearchBar from 'src/components/CustomSearchBar'
import downloadPdf from 'src/utils/DownloadPdf'
import SalesOrderModel from 'src/components/Modal/SalesOrderModel'
import TableSaleOrder from 'src/views/tables/TableSaleOrder'
import moment from 'moment/moment'
const Index = () => {
  const router = useRouter()
  const { settings } = useSettings()
  const searchRef = useRef()
  const [pendingAction, setPendingAction] = useState(null)
  const [openModal, setOpenModal] = useState(false)
  const [alertData, setAlertData] = useState({ openSnackbar: false, type: '', message: '', variant: 'filled' })
  const [saleOrder, setSaleOrder] = useState({ data: [], index: 0 })
  const { setIsLoading } = useLoading()
  const [editData, setEditData] = useState({})
  const [userDataPdf, setUserDataPdf] = useState()
  const { getUserData, removeAuthToken } = useAuth()
  const [config, setConfig] = useState(null)
  const [formData, setFormData] = useState({})
  const [tableHeaderData, setTableHeaderData] = useState({ searchVal: '', orderTypeFilter: '' })
  const [saleDetail, setSaleDetail] = useState([])

  const apiAccess = useApiAccess('sales-order-create', 'sales-order-update', 'sales-order-approve')

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
        if (pendingAction === 'edit') {
          await editSaleOrder()
        } else if (pendingAction === 'add') {
          await addSaleOrder()
        }
        setPendingAction(null)
      }
    }
    handleUserAction()
  }, [formData, pendingAction])

  const tableBody = saleOrder.data?.map((item, index) => [
    index + 1,
    item.order_type,
    item.order_no,
    item.status,
    item.order_from_location.location_name,
    item.order_to_location.location_name,
    moment(item.order_date).format('DD/MM/YYYY, hh:mm:ss a')
  ])

  const tableData = useMemo(
    () => ({
      tableHeader: ['Sr.No.', 'Order Type', 'Order No', 'Status', 'From', 'To', 'Order Date'],
      tableHeaderText: 'Sale Order Report',
      tableBodyText: 'Sale  Order Data',
      filename: 'saleOrder',
      Filter: ['Order Type', tableHeaderData.orderTypeFilter]
    }),
    []
  )

  const handleView = async item => {
    await getSaleDetail(item.id)
  }

  const getSaleDetail = async id => {
    setIsLoading(true)
    try {
      const res = await api(`/sales-order/details/${id}`, {}, 'get', true)
      if (res.data.success) {
        console.log(res.data.data.orders)
        const fetchedOrders = res.data.data.orders || []
        // Set raw detail (if needed elsewhere)
        setSaleDetail(fetchedOrders)
      } else if (res.data.code === 401) {
        removeAuthToken()
        router.push('/401')
      } else {
        console.log('Error: Unexpected response', res.data)
      }
    } catch (error) {
      console.log('Error in getPurchaseDetail', error)
    } finally {
      setIsLoading(false)
    }
  }

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
    setSaleDetail([])
  }
  const handleSubmitForm = async data => {
    console.log('handle submit form data : ', data)
    setFormData(data)
    setPendingAction(editData?.id ? 'edit' : 'add')
  }

  const handleOrderTypeChange = e => {
    setTableHeaderData({ ...tableHeaderData, orderTypeFilter: e.target.value })
  }
  const addSaleOrder = async () => {
    try {
      const data = { ...formData }
      setIsLoading(true)
      const res = await api('/sales-order/', data, 'post', true)
      setIsLoading(false)
      if (res?.data?.success) {
        setOpenModal(false)
        console.log('Add purchase order :-', res?.data)
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
  const editSaleOrder = async () => {
    try {
      const data = { ...formData }
      delete data.type

      console.log('EDIT FORM DATA :->', data)
      const filteredOrders = data.orders.filter(
        order => !saleDetail.some(purchase => purchase.product_id === order.productId)
      )
      if (filteredOrders.length > 0) {
        data.orders = filteredOrders
      } else {
        delete data.orders
      }
      // filteredOrders.length>0 ? data.orders=filteredOrders : delete data.orders

      setIsLoading(true)
      const res = await api(`/sales-order/${editData.id}`, data, 'put', true)
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
      console.log('error while updating the sale order', error)
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
    await getSaleDetail(item.id)

    setEditData(item)
    setOpenModal(true)
  }
  const resetFilter = () => {
    if (searchRef.current) {
      searchRef.current.resetSearch() // Call the reset method in the child
    }
    setTableHeaderData({ ...tableHeaderData, searchVal: '', orderTypeFilter: '' })
  }

  const handleDownloadPdf = () => {
    let data = getUserData()
    setUserDataPdf(data)
    downloadPdf(tableData, tableHeaderData, tableBody, saleOrder.data, userDataPdf)
  }
  return (
    <Box padding={4}>
      <Head>
        <title>Sales Order</title>
      </Head>
      <Grid2 item xs={12}>
        <Typography variant='h2'>Sales Order </Typography>
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
                <Box className='d-flex-row justify-content-start align-items-center mx-4 my-3'>
                  <FormControl className='w-25 mx-2'>
                    <InputLabel id='Order-Filter-By-OrderType'>Order Type</InputLabel>
                    <Select
                      labelId='Order-select-by-OrderType'
                      id='Order-select-by-OrderType'
                      value={tableHeaderData.orderTypeFilter}
                      label='Order Type'
                      onChange={handleOrderTypeChange}
                    >
                      <MenuItem key='salesOrder' value='SALES_ORDER'>
                        Sale Order
                      </MenuItem>
                      <MenuItem key='salesReturn' value='SALES_RETURN'>
                        Sale Return
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box className='d-flex justify-content-between align-items-center mx-4 my-2'>
                  <ExportResetActionButtons handleDownloadPdf={handleDownloadPdf} resetFilter={resetFilter} />
                  <Box className='d-flex justify-content-between align-items-center '>
                    <CustomSearchBar ref={searchRef} handleSearchClick={handleSearch} />

                    {apiAccess.addApiAccess && (
                      <Box className='mx-2'>
                        <Button variant='contained' sx={{ py: 2 }} onClick={handleOpenModal}>
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
                Sale Order Data
              </Typography>
              <TableSaleOrder
                handleUpdate={handleUpdate}
                tableHeaderData={tableHeaderData}
                pendingAction={pendingAction}
                setDataCallback={setSaleOrder}
                apiAccess={apiAccess}
                saleDetail={saleDetail}
                handleAuthCheck={() => {}}
                handleView={handleView}
              />
            </Grid2>
          </Box>
        </Grid2>
      </Grid2>
      <SnackbarAlert openSnackbar={alertData.openSnackbar} closeSnackbar={closeSnackbar} alertData={alertData} />

      <SalesOrderModel
        open={openModal}
        handleClose={handleCloseModal}
        editData={editData}
        saleDetail={saleDetail}
        handleSubmitForm={handleSubmitForm}
      />
      <AccessibilitySettings />
      <ChatbotComponent />
    </Box>
  )
}

export async function getServerSideProps(context) {
  return validateToken(context, 'Sales Order')
}

export default ProtectedRoute(Index)
