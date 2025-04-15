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
import PurchaseOrderModel from 'src/components/Modal/PurchaseOrderModel'
import CustomSearchBar from 'src/components/CustomSearchBar'
import EsignStatusDropdown from 'src/components/EsignStatusDropdown'
import downloadPdf from 'src/utils/DownloadPdf'
import TablePurchaseOrder from 'src/views/tables/TablePurchaseOrder'

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
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [approveAPI, setApproveAPI] = useState({ approveAPIName: '', approveAPImethod: '', approveAPIEndPoint: '' })
  const [eSignStatusId, setESignStatusId] = useState('')
  const [auditLogMark, setAuditLogMark] = useState('')
  const [esignDownloadPdf, setEsignDownloadPdf] = useState(false)
  const [openModalApprove, setOpenModalApprove] = useState(false)
  const [formData, setFormData] = useState({})
  const [tableHeaderData, setTableHeaderData] = useState({esignStatus: '',searchVal: ''})

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
          const esign_status = config?.config?.esign_status && config?.role !== 'admin' ? "pending" : "approved";
          if (pendingAction === "edit") {
            await editPurchaseOrder(esign_status); 
          } else if (pendingAction === "add") {
            await addPurchaseOrder(esign_status);  
          }
          setPendingAction(null);
        }
      };
      handleUserAction();
    }, [formData, pendingAction]);
  

  console.log(purchaseOrder)
  const tableBody = purchaseOrder.map((item, index) => [
    index + 1,
    item.orderNo,
    item.pofl.location_name,
    item.potl.location_name,
    item.esign_status || 'N/A'
  ])

  const tableData = useMemo(
    () => ({
      tableHeader: ['Sr.No.', 'Order No', 'From', 'To',  'E-Sign'],
      tableHeaderText: 'Purchase Order Report',
      tableBodyText: 'Purchase Order Data',
      filename: 'PurchaseOrder'
    }),[])

  const closeSnackbar = () => {
    setAlertData({ ...alertData, openSnackbar: false })
  }
  const handleOpenModal = () => {
    setApproveAPI({
      approveAPIName: 'purchase-order-create',
      approveAPImethod: 'POST',
      approveAPIEndPoint: '/api/v1/purchase-order'
    })
    setEditData({})
    setFormData({})
    setOpenModal(true)
  }
  const handleCloseModal = () => {
    setOpenModal(false)
    setFormData({})
    setEditData({})
  }

  const handleAuthModalClose = () => {
    setAuthModalOpen(false)
    setOpenModalApprove(false)
  }

  const handleSubmitForm = async data => {
    console.log('handle submit form data : ', data)
    setFormData(data)
    if (editData?.orderNo) {
      setApproveAPI({
        approveAPIName: 'purchase-order-update',
        approveAPImethod: 'PUT',
        approveAPIEndPoint: '/api/v1/purchase-order'
      })
    } else {
      setApproveAPI({
        approveAPIName: 'purchase-order-create',
        approveAPImethod: 'POST',
        approveAPIEndPoint: '/api/v1/purchase-order'
      })
    }
    if (config?.config?.esign_status && config?.role !== 'admin') {
      setAuthModalOpen(true)
      return
    }
    setPendingAction(editData?.id ? 'edit' : 'add')
  }
  const handleAuthResult = async (isAuthenticated, user, isApprover, esignStatus, remarks) => {
    console.log('handleAuthResult 01', isAuthenticated, isApprover, esignStatus, user)
    console.log('handleAuthResult 02', config?.userId, user.user_id)

    const resetState = () => {
      setApproveAPI({ approveAPIEndPoint: '', approveAPImethod: '', approveAPIName: '' })
      setEsignDownloadPdf(false)
      setAuthModalOpen(false)
    }

    if (!isAuthenticated) {
      setAlertData({ type: 'error', openSnackbar: true, message: 'Authentication failed, Please try again.' })
      return
    }

    const handleApproverActions = async () => {
      const data = {
        modelName: 'purchaseorder',
        esignStatus,
        id: eSignStatusId,
        audit_log: config?.config?.audit_logs
          ? {
              user_id: user.userId,
              user_name: user.userName,
              performed_action: 'approved',
              remarks: remarks.length > 0 ? remarks : `purchase order approved - ${auditLogMark}`
            }
          : {}
      }
      if (esignStatus === 'approved' && esignDownloadPdf) {
        setOpenModalApprove(false)
        console.log('esign is approved for approver')
        downloadPdf(tableData, tableHeaderData, tableBody, purchaseOrder, userDataPdf)
        resetState()
        return
      }

      const res = await api('/esign-status/update-esign-status', data, 'patch', true)
      console.log('esign status update', res?.data)
      setPendingAction(true)
      if (esignStatus === 'rejected' && esignDownloadPdf) {
        console.log('approver rejected')
        setOpenModalApprove(false)
        resetState()
      }
    }

    const handleCreatorActions = () => {
      if (esignStatus === 'rejected') {
        setAuthModalOpen(false)
        setOpenModalApprove(false)
      }

      if (esignStatus === 'approved') {
        if (esignDownloadPdf) {
          console.log('esign is approved for creator to download')
          setOpenModalApprove(true)
        } else {
          console.log('esign is approved for creator')
          setPendingAction(editData?.id ? 'edit' : 'add')
        }
      }
    }
    if (!isApprover && esignDownloadPdf) {
      setAlertData({
        ...alertData,
        openSnackbar: true,
        type: 'error',
        message: 'Access denied: Download pdf disabled for this user.'
      })
      resetState()
      return
    }
    if (isApprover) {
      await handleApproverActions()
    } else {
      handleCreatorActions()
    }
    resetState()
  }
  const handleAuthCheck = async row => {
    console.log('handleAuthCheck', row)
    setApproveAPI({
      approveAPIName: 'purchase-order-approve',
      approveAPImethod: 'PATCH',
      approveAPIEndPoint: '/api/v1/purchase-order'
    })
    setAuthModalOpen(true)
    setESignStatusId(row.id)
    setAuditLogMark(row.location_id)
    console.log('row', row)
  }
  const addPurchaseOrder = async (esign_status, remarks) => {
    try {
      console.log('formdata', formData)
      const data = { ...formData }
      const audit_log = config?.config?.audit_logs
        ? {
            audit_log: true,
            performed_action: 'add',
            remarks: remarks?.length > 0 ? remarks : `order purchase added - ${formData.orderNo}`
          }
        : {
            audit_log: false,
            performed_action: 'none',
            remarks: 'none'
          }
      data.audit_log = audit_log
      data.esign_status = esign_status
      console.log(data)
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
      setApproveAPI({
        approveAPIName: '',
        approveAPImethod: '',
        approveAPIEndPoint: ''
      })
      //setOpenModal(false)
      setIsLoading(false)
    }
  }
  const editPurchaseOrder = async (esign_status, remarks) => {
    try {
      const data = { ...formData }

      console.log('EDIT FORM DATA :->', data)
      const auditlogRemark = remarks
      let audit_log
      if (config?.config?.audit_logs) {
        audit_log = {
          audit_log: true,
          performed_action: 'edit',
          remarks: auditlogRemark?.length > 0 ? auditlogRemark : `purchase order edited - ${formData.orderNo}`
        }
      } else {
        audit_log = {
          audit_log: false,
          performed_action: 'none',
          remarks: `none`
        }
      }
      data.audit_log = audit_log
      data.esign_status = esign_status
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
    setTableHeaderData({ ...tableHeaderData, searchVal: val.trim().toLowerCase() })
  }

  const handleUpdate = item => {
    console.log("item",item.pofl.location_name)
    setEditData(item)
    setOpenModal(true)
    if (config?.config?.esign_status) {
      setESignStatusId(item.id)
    }
  }

  const resetFilter = () => {
    if (searchRef.current) {
      searchRef.current.resetSearch() // Call the reset method in the child
    }
    setTableHeaderData({ ...tableHeaderData, esignStatus: '', searchVal: '' })
  }

  const handleAuthModalOpen = () => {
    console.log('OPen auth model')
    setApproveAPI({
      approveAPIName: 'purchase-order-approve',
      approveAPImethod: 'PATCH',
      approveAPIEndPoint: '/api/v1/purchase-order'
    })
    setAuthModalOpen(true)
  }
  const handleDownloadPdf = () => {
    setApproveAPI({
      approveAPIName: 'purchase-order-create',
      approveAPImethod: 'POST',
      approveAPIEndPoint: '/api/v1/purchase-order'
    })
    let data = getUserData()
    setUserDataPdf(data)
    if (config?.config?.esign_status && config?.role !== 'admin') {
      console.log('Esign enabled for download pdf')
      setEsignDownloadPdf(true)
      setAuthModalOpen(true)
      return
    }
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
                  {config?.config?.esign_status && config?.role !== 'admin' && (
                    <EsignStatusDropdown tableHeaderData={tableHeaderData} setTableHeaderData={setTableHeaderData} />
                  )}
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
                  handleAuthCheck={handleAuthCheck}
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
      {/* <StockTrasferModel
        open={openModal}
        handleClose={handleCloseModal}
        editData={editData}
        handleSubmitForm={handleSubmitForm}
      /> */}

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
  return validateToken(context, 'Location Master')
}

export default ProtectedRoute(Index)
