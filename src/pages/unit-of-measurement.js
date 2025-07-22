'use-client'
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {Box,Grid2,Typography,Button} from '@mui/material'
import { IoMdAdd } from 'react-icons/io'
import { api } from 'src/utils/Rest-API'
import { useLoading } from 'src/@core/hooks/useLoading'
import Head from 'next/head'
import { useAuth } from 'src/Context/AuthContext'
import TableUOM from '../views/tables/TableUOM'
import SnackbarAlert from 'src/components/SnackbarAlert'
import ProtectedRoute from 'src/components/ProtectedRoute'
import { useRouter } from 'next/router'
import AuthModal from 'src/components/authModal'
import ChatbotComponent from 'src/components/ChatbotComponent'
import AccessibilitySettings from 'src/components/AccessibilitySettings'
import { validateToken } from 'src/utils/ValidateToken'
import { getTokenValues } from '../utils/tokenUtils'
import { useApiAccess } from 'src/@core/hooks/useApiAccess'
import ExportResetActionButtons from 'src/components/ExportResetActionButtons'
import EsignStatusDropdown from 'src/components/EsignStatusDropdown'
import { useSettings } from 'src/@core/hooks/useSettings'
import UomModal from 'src/components/Modal/UomModal'
import CustomSearchBar from 'src/components/CustomSearchBar'
import downloadPdf from 'src/utils/DownloadPdf'

const Index = () => {
  const [openModal, setOpenModal] = useState(false)
  const [alertData, setAlertData] = useState({ openSnackbar: false, type: '', message: '', variant: 'filled' })
  const [editData, setEditData] = useState({})
  const [allUOMData, setAllUOMData] = useState({ data: [], index: 0 })
  const { setIsLoading } = useLoading()
  const { getUserData, removeAuthToken } = useAuth()
  const [userDataPdf, setUserDataPdf] = useState()
  const router = useRouter()
  const [config, setConfig] = useState(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [approveAPI, setApproveAPI] = useState({ approveAPIName: '', approveAPImethod: '', approveAPIEndPoint: '' })
  const [eSignStatusId, setESignStatusId] = useState('')
  const [auditLogMark, setAuditLogMark] = useState('')
  const [esignDownloadPdf, setEsignDownloadPdf] = useState(false)
  const [openModalApprove, setOpenModalApprove] = useState(false)
  const searchBarRef = useRef(null)
  const [pendingAction, setPendingAction] = useState(null)
  const { settings } = useSettings()
  const [tableHeaderData, setTableHeaderData] = useState({
    esignStatus: '',
    searchVal: ''
  })
  const [formData, setFormData] = useState({})
  const [authUser, setAuthUser] = useState({})
  const [esignRemark, setEsignRemark] = useState('')
  const apiAccess = useApiAccess('uom-create', 'uom-update', 'uom-approve')

  useLayoutEffect(() => {
    let data = getUserData()
    const decodedToken = getTokenValues()
    setConfig(decodedToken)
    setUserDataPdf(data)
    return () => {}
  }, [])

  useEffect(() => {
    const handleUserAction = async () => {
      if (formData && pendingAction) {
        const esign_status = config?.config?.esign_status ? 'pending' : 'approved'
        if (pendingAction === 'edit') {
          await editUOM(esign_status)
        } else if (pendingAction === 'add') {
          await addUOM(esign_status)
        }
        setPendingAction(null)
      }
    }
    handleUserAction()
  }, [formData, pendingAction])

  const tableBody = allUOMData?.data?.map((item, index) => [
    index + allUOMData.index,
    item?.uom_name,
    item?.esign_status || 'N/A'
  ])
  const tableData = useMemo(
    () => ({
      tableHeader: ['Sr.No.', 'UOM Name', 'E-Sign'],
      tableHeaderText: 'UOM Report',
      tableBodyText: 'UOM Data',
      filename: 'UOM'
    }),
    []
  )

  const closeSnackbar = () => {
    setAlertData({ ...alertData, openSnackbar: false })
  }

  const resetForm = () => {
    setEditData({})
  }

  const handleOpenModal = () => {
    setApproveAPI({
      approveAPIName: 'uom-create',
      approveAPImethod: 'POST',
      approveAPIEndPoint: '/api/v1/uom'
    })
    resetForm()
    setOpenModal(true)
  }

  const handleCloseModal = () => {
    setOpenModal(false)
  }

  const handleAuthModalClose = () => {
    setEsignDownloadPdf(false)
    setAuthModalOpen(false)
    setOpenModalApprove(false)
    setEsignDownloadPdf(false)
  }

  const handleSubmitForm = async UomData => {
    console.log('UomData :-', UomData)
    setFormData(UomData)
    console.log('edit data', editData)
    if (editData?.id) {
      setApproveAPI({
        approveAPIName: 'uom-update',
        approveAPImethod: 'PUT',
        approveAPIEndPoint: '/api/v1/uom'
      })
    } else {
      setApproveAPI({
        approveAPIName: 'uom-create',
        approveAPImethod: 'POST',
        approveAPIEndPoint: '/api/v1/uom'
      })
    }
    if (config?.config?.esign_status) {
      setAuthModalOpen(true)
      return
    }
    setPendingAction(editData?.id ? 'edit' : 'add')
  }
  
  const handleAuthResult = async (isAuthenticated, user, isApprover, esignStatus, remarks) => {
  console.log('handleAuthResult 01', isAuthenticated, isApprover, esignStatus, user);
  console.log('handleAuthResult 02', config?.userId, user.user_id);

  if (!isAuthenticated) {
    setAlertData({
      type: 'error',
      openSnackbar: true,
      message: 'Authentication failed, Please try again.'
    });
    resetState();
    return;
  }

  if (isApprover) {
    await handleApproverActions(user, esignStatus, remarks);
  } else {
    handleCreatorActions(user, esignStatus, remarks,isApprover);
  }

  resetState();
};
const resetState = () => {
  setApproveAPI({ approveAPIName: '', approveAPIEndPoint: '', approveAPImethod: '' });
  setEsignDownloadPdf(false);
  setAuthModalOpen(false);
};

const buildAuditLog = (user, remarks, action) => {
  return config?.config?.audit_logs
    ? {
        user_id: user.userId,
        user_name: user.userName,
        remarks: remarks?.length > 0 ? remarks : `uom ${action} - ${auditLogMark}`,
        authUser: user.user_id
      }
    : {};
};

const handleApproverActions = async (user, esignStatus, remarks) => {
  const payload = {
    modelName: 'uom',
    esignStatus,
    id: eSignStatusId,
    name: auditLogMark,
    audit_log: buildAuditLog(user, remarks, esignStatus)
  };

  if (esignStatus === 'approved' && esignDownloadPdf) {
    setOpenModalApprove(false);

    downloadPdf(tableData, tableHeaderData, tableBody, allUOMData?.data, user);

    if (config?.config?.audit_logs) {
      const auditPayload = {
        audit_log: {
          audit_log: true,
           performed_action: 'Export report of unit of measurement ',
          remarks: remarks?.length > 0 ? remarks : `Unit of measurement export report `,
          authUser: user
        }
      };
      await api('/auditlog/', auditPayload, 'post', true);
    }

    return;
  }

  const res = await api('/esign-status/update-esign-status', payload, 'patch', true);

  if (res?.data) {
    setAlertData({
      ...alertData,
      openSnackbar: true,
      type: res.data.code === 200 ? 'success' : 'error',
      message: res.data.message
    });
  }

  setPendingAction(true);

  if (esignStatus === 'rejected' && esignDownloadPdf) {
    console.log('approver rejected');
    setOpenModalApprove(false);
  }
};
const handleCreatorActions = (user, esignStatus, remarks,isApprover) => {
  if (esignStatus === 'rejected') {
    setAuthModalOpen(false);
    setOpenModalApprove(false);
    setAlertData({
      ...alertData,
      openSnackbar: true,
      type: 'error',
      message: 'Access denied for this user.'
    });
    return;
  }

  if (!isApprover && esignDownloadPdf) {
    setAlertData({
      ...alertData,
      openSnackbar: true,
      type: 'error',
      message: 'Access denied: Download pdf disabled for this user.'
    });
    resetState();
    return;
  }

  if (esignStatus === 'approved') {
    console.log('Esign Download pdf', esignDownloadPdf);

    if (esignDownloadPdf) {
      console.log('esign is approved for creator to download');
      setEsignDownloadPdf(false);
      setOpenModalApprove(true);
    } else {
      console.log('esign is approved for creator');
      setAuthUser(user);
      setEsignRemark(remarks);
      setPendingAction(editData?.id ? 'edit' : 'add');
    }
  }
};
  const handleAuthCheck = async row => {
    console.log('handleAuthCheck', row)
    setApproveAPI({
      approveAPIName: 'uom-approve',
      approveAPIEndPoint: '/api/v1/uom',
      approveAPImethod: 'PATCH'
    })
    setAuthModalOpen(true)
    setESignStatusId(row.id)
    setAuditLogMark(row.uom_name)
  }
  const addUOM = async esign_status => {
    try {
      const data = { UOMName: formData.unitName }
      if (config?.config?.audit_logs) {
        data.audit_log = {
          audit_log: true,
          remarks: esignRemark?.length > 0 ? esignRemark : `UOM added - ${formData.unitName}`,
          authUser
        }
      }
      data.esign_status = esign_status
      console.log('data add uom ', data)
      setIsLoading(true)
      const res = await api('/uom/', data, 'post', true)
      setIsLoading(false)
      console.log('add res uom', res)
      if (res?.data?.success) {
        setAlertData({ ...alertData, openSnackbar: true, type: 'success', message: 'Unit added successfully' })
        setOpenModal(false)
      } else {
        setAlertData({ ...alertData, openSnackbar: true, type: 'error', message: res.data?.message })
        if (res.data?.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('internal error while adding uom',error)
      router.push('/500')
      setOpenModal(false)
    } finally {
      setIsLoading(false)
      setApproveAPI({
        approveAPIName: '',
        approveAPIEndPoint: '',
        approveAPImethod: ''
      })
    }
  }
  const editUOM = async esign_status => {
    try {
      console.log(formData, 'edit')
      const data = { UOMName: formData.unitName }
      if (config?.config?.audit_logs) {
        data.audit_log = {
          audit_log: true,
          remarks: esignRemark?.length > 0 ? esignRemark : `UOM added - ${formData.unitName}`,
          authUser
        }
      }
      data.esign_status = esign_status
      setIsLoading(true)
      const res = await api(`/uom/${editData.id}`, data, 'put', true)
      setIsLoading(false)
      console.log(res, 'editdata')
      if (res.data.success) {
        setAlertData({ ...alertData, openSnackbar: true, type: 'success', message: 'Unit updated successfully' })
        resetForm()
        setOpenModal(false)
      } else {
        setAlertData({ ...alertData, openSnackbar: true, type: 'error', message: res.data.message })
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('internal error while updating uom',error)
      router.push('/500')
      setOpenModal(false)
    } finally {
      setIsLoading(false)
    }
  }
  const handleUpdate = item => {
    setEditData(item)
    setFormData({ ...FormData, unitName: item.uom_name })
    setOpenModal(true)
  }

  const resetFilter = () => {
    if (searchBarRef.current) {
      searchBarRef.current.resetSearch()
    }
    setTableHeaderData({ ...tableHeaderData, esignStatus: '', searchVal: '' })
  }
  const handleSearch = val => {
    setTableHeaderData({ ...tableHeaderData, searchVal: val.trim().toLowerCase() })
  }

  const handleAuthModalOpen = () => {
    console.log('OPen auth model')
    setApproveAPI({
      approveAPIName: 'uom-approve',
      approveAPImethod: 'PATCH',
      approveAPIEndPoint: '/api/v1/uom'
    })
    setAuthModalOpen(true)
  }
  const handleDownloadPdf = () => {
    setApproveAPI({
      approveAPIName: 'uom-approve',
      approveAPImethod: 'PATCH',
      approveAPIEndPoint: '/api/v1/uom'
    })
    if (config?.config?.esign_status) {
      console.log('Esign enabled for download pdf')
      setEsignDownloadPdf(true)
      setAuthModalOpen(true)
      return
    }
    downloadPdf(tableData, tableHeaderData, tableBody, allUOMData?.data, userDataPdf)
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
                {config?.config?.esign_status && (
                  <EsignStatusDropdown tableHeaderData={tableHeaderData} setTableHeaderData={setTableHeaderData} />
                )}
              </Box>
              <Box className='d-flex justify-content-between align-items-center mx-4 my-2'>
                <ExportResetActionButtons handleDownloadPdf={handleDownloadPdf} resetFilter={resetFilter} />
                <Box className='d-flex justify-content-between align-items-center '>
                  <CustomSearchBar ref={searchBarRef} handleSearchClick={handleSearch} />
                  {apiAccess.addApiAccess && (
                    <Box className='mx-2'>
                      <Button variant='contained' sx={{py:2}} onClick={handleOpenModal} >
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
            <Grid2 item xs={12}>
              <Typography variant='h4' className='mx-4 my-2 mt-3'>
                Unit Of Measurement Data
              </Typography>
              <TableUOM
                setAllUOM={setAllUOMData}
                handleUpdate={handleUpdate}
                tableHeaderData={tableHeaderData}
                handleAuthCheck={handleAuthCheck}
                apiAccess={apiAccess}
                config={config}
                pendingAction={pendingAction}
              />
            </Grid2>
          </Box>
        </Grid2>
      </Grid2>

      <SnackbarAlert openSnackbar={alertData.openSnackbar} closeSnackbar={closeSnackbar} alertData={alertData} />
      <UomModal open={openModal} onClose={handleCloseModal} editData={editData} handleSubmitForm={handleSubmitForm} />

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
  return validateToken(context, 'Unit Of Measurement')
}

export default ProtectedRoute(Index)
