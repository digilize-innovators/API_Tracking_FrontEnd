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
import { useAuth } from 'src/Context/AuthContext'
import { useSettings } from 'src/@core/hooks/useSettings'
import { useRouter } from 'next/router'
import AuthModal from 'src/components/authModal'
import ChatbotComponent from 'src/components/ChatbotComponent'
import AccessibilitySettings from 'src/components/AccessibilitySettings'
import { validateToken } from 'src/utils/ValidateToken'
import { getTokenValues } from '../../utils/tokenUtils'
import { useApiAccess } from 'src/@core/hooks/useApiAccess'
import ExportResetActionButtons from 'src/components/ExportResetActionButtons'

import AreaModel from 'src/components/Modal/AreaModel'
import CustomSearchBar from 'src/components/CustomSearchBar'
import EsignStatusDropdown from 'src/components/EsignStatusDropdown'
import downloadPdf from 'src/utils/DownloadPdf'

const Index = () => {
  const { settings } = useSettings()
  const [openModal, setOpenModal] = useState(false)
  const [alertData, setAlertData] = useState({ openSnackbar: false, type: '', message: '', variant: 'filled' })
  const [areaData, setArea] = useState([])
  const [userDataPdf, setUserDataPdf] = useState()
  const { getUserData, removeAuthToken } = useAuth()
  const { setIsLoading } = useLoading()
  const [editData, setEditData] = useState({})
  const router = useRouter()
  const [config, setConfig] = useState(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [approveAPI, setApproveAPI] = useState({ approveAPIName: '', approveAPImethod: '', approveAPIEndPoint: '' })
  const [eSignStatusId, setESignStatusId] = useState('')
  const [auditLogMark, setAuditLogMark] = useState('')
  const [esignDownloadPdf, setEsignDownloadPdf] = useState(false)
  const [openModalApprove, setOpenModalApprove] = useState(false)
  const apiAccess = useApiAccess('area-create', 'area-update', 'area-approve')
  const [formData, setFormData] = useState({})
  const [pendingAction, setPendingAction] = useState(null)
  const [tableHeaderData, setTableHeaderData] = useState({
    esignStatus: '',
    searchVal: ''
  })
  const searchBarRef = useRef(null)

  useEffect(() => {
    if (formData && pendingAction) {
      const esign_status = config?.config.esign_status ? 'pending' : 'approved'
      if (pendingAction === 'edit') {
        editArea(esign_status)
      } else if (pendingAction == 'add') {
        addArea(esign_status)
      }
      setPendingAction(null)
    }
  }, [formData, pendingAction])

  useLayoutEffect(() => {
    let data = getUserData()
    const decodedToken = getTokenValues()
    setConfig(decodedToken)
    setUserDataPdf(data)
    return () => {}
  }, [])

  const tableBody = areaData.map((item, index) => [
    index + 1,
    item.area_id,
    item.area_name,
    item.area_category?.area_category_name,
    item.esign_status
  ])

  const tableData = {
    tableHeader: ['Sr.No.', 'Id', 'Name', 'Area Category', 'E-Sign'],
    tableHeaderText: 'Area Master Report',
    tableBodyText: 'Area Master Data',
    filename: 'AreaMaster'
  }

  const closeSnackbar = () => {
    setAlertData({ ...alertData, openSnackbar: false })
  }
  const handleOpenModal = () => {
    setApproveAPI({ approveAPIName: 'area-create', approveAPImethod: 'POST', approveAPIEndPoint: '/api/v1/area' })
    setOpenModal(true)
  }
  const handleAuthModalClose = () => {
    setAuthModalOpen(false)
    setOpenModalApprove(false)
  }
  const handleCloseModal = () => {
    setEditData({})
    setOpenModal(false)
  }
  const resetForm = () => {
    setEditData({})
  }
  const handleSubmitForm = async data => {
    console.log('form data ', data)
    setFormData(data)
    console.log('after set ', editData)

    if (editData?.id) {
      setApproveAPI({ approveAPIName: 'area-update', approveAPImethod: 'PUT', approveAPIEndPoint: '/api/v1/area' })
    } else {
      setApproveAPI({ approveAPIName: 'area-create', approveAPImethod: 'POST', approveAPIEndPoint: '/api/v1/area' })
    }

    if (config?.config?.esign_status) {
      setAuthModalOpen(true)
      return
    }

    setPendingAction(editData?.id ? 'edit' : 'add')
  }
  const addArea = async (esign_status, remarks) => {
    console.log('add form ', formData)

    try {
      const data = {
        areaId: formData.areaId,
        areaName: formData.areaName,
        areaCategoryId: formData.areaCategoryId,
        location_uuid: formData.location_uuid
      }
      console.log(data, ':-area data')
      const auditlogRemark = remarks
      const audit_log = config?.config?.audit_logs
        ? {
            audit_log: true,
            performed_action: 'add',
            remarks: auditlogRemark?.length > 0 ? auditlogRemark : `area added - ${formData.areaName}`
          }
        : {
            audit_log: false,
            performed_action: 'none',
            remarks: `none`
          }
      data.audit_log = audit_log
      data.esign_status = esign_status
      setIsLoading(true)
      console.log('add area', data)
      const res = await api('/area/', data, 'post', true)
      if (res?.data?.success) {
        setAlertData({ ...alertData, openSnackbar: true, type: 'success', message: 'Area added successfully' })

        resetForm()
      } else {
        setAlertData({ ...alertData, openSnackbar: true, type: 'error', message: res.data?.message })
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      router.push('/500')
    } finally {
      setOpenModal(false)
      setIsLoading(false)
      setApproveAPI({ approveAPIName: '', approveAPImethod: '', approveAPIEndPoint: '' })
    }
  }
  const editArea = async (esign_status, remarks) => {
    try {
      console.log(formData, 'formdata')
      const data = {
        areaId: formData.areaId,
        areaName: formData.areaName,
        areaCategoryId: formData.areaCategoryId,
        location_uuid: formData.location_uuid
      }
      delete data.areaId
      const auditlogRemark = remarks
      let audit_log
      if (config?.config?.audit_logs) {
        audit_log = {
          audit_log: true,
          performed_action: 'edit',
          remarks: auditlogRemark > 0 ? auditlogRemark : `area edited - ${formData.areaName}`
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
      console.log(data, 'aaaa')
      setIsLoading(true)
      const res = await api(`/area/${editData.id}`, data, 'put', true)
      if (res.data.success) {
        setAlertData({ ...alertData, openSnackbar: true, type: 'success', message: 'Area updated successfully' })
        resetForm()
      } else {
        setAlertData({ ...alertData, openSnackbar: true, type: 'error', message: res.data.message })
        if (res.data.code === 401) {
          removeAuthToken()
          console.log(res.data.message)
          router.push('/401')
        }
      }
    } catch (error) {
      console.log(error, 'error while edit')
      router.push('/500')
    } finally {
      setOpenModal(false)
      setIsLoading(false)
      setApproveAPI({ approveAPIName: '', approveAPImethod: '', approveAPIEndPoint: '' })
    }
  }
  const handleAuthResult = async (isAuthenticated, user, isApprover, esignStatus, remarks) => {
    console.log('handleAuthResult 01', isAuthenticated, isApprover, esignStatus, user)
    console.log('handleAuthResult 02', config.userId, user.user_id)
    const resetState = () => {
      setApproveAPI({ approveAPIName: '', approveAPImethod: '', approveAPIEndPoint: '' })
      setEsignDownloadPdf(false)
      setAuthModalOpen(false)
    }
    if (!isAuthenticated) {
      setAlertData({ openSnackbar: true, type: 'error', message: 'Authentication failed, Please try again.' })
      return
    }
    const handleEsignApproved = () => {
      console.log('else EsignDownloadpdf is false')
      console.log('esign is approved for creator.')
      setPendingAction(editData?.id?"edit":"add")
      // editData?.id ? editArea(esign_status, remarks) : addArea(esign_status, remarks);
    }
    const handleApproverActions = async () => {
      console.log('Handle Aprove Action ()')
      const data = {
        modelName: 'area',
        esignStatus,
        id: eSignStatusId,
        audit_log: config?.config?.audit_logs
          ? {
              user_id: user.userId,
              user_name: user.userName,
              performed_action: 'approved',
              remarks: remarks.length > 0 ? remarks : `area approved - ${auditLogMark}`
            }
          : {}
      }
      console.log('esignAppprove', data)
      console.log('EsignStatus is Approved ', esignStatus === 'approved', 'EsignDownloadPdf is ', esignDownloadPdf)
      if (esignStatus === 'approved' && esignDownloadPdf) {
        setOpenModalApprove(false)
        console.log('esign is approved for approver')
        resetState()
        console.log(tableData, 'tabledata')

        downloadPdf(tableData, tableHeaderData, tableBody, areaData, userDataPdf)
        resetState()

        return
      }
      const res = await api('/esign-status/update-esign-status', data, 'patch', true)
      setPendingAction(true)
      console.log('esign status update', esignStatus, esignDownloadPdf, res?.data)
      console.log('EsignStatus is Rejected ', esignStatus === 'rejected', 'EsignDownloadPdf is ', esignDownloadPdf)
      if (esignStatus === 'rejected' && esignDownloadPdf) {
        console.log('approver rejected')
        setOpenModalApprove(false)
        resetState()
      }
    }
    console.log('isApproved :', isApprover)
    console.log('Esign is rejected :', esignStatus === 'rejected')
    if (!isApprover && esignDownloadPdf) {
      setAlertData({
        ...alertData,
        openSnackbar: true,
        type: 'error',
        message: "Access denied: Download pdf disabled for this user."
      })
      resetState()
      return
    }
    if (isApprover) {
      await handleApproverActions()
    } else if (esignStatus === 'rejected') {
      console.log('esign is rejected.')
      setAuthModalOpen(false)
      setOpenModalApprove(false)
    } else if (esignStatus === 'approved') {
      handleEsignApproved()
    }
    resetState()
  }
  const handleAuthCheck = async row => {
    console.log('handleAuthCheck', row)
    setApproveAPI({ approveAPIName: 'area-approve', approveAPImethod: 'PATCH', approveAPIEndPoint: '/api/v1/area' })

    setAuthModalOpen(true)
    setESignStatusId(row.id)
    setAuditLogMark(row.area_name)
    console.log('row', row)
    setPendingAction(false)
  }

  const handleSearch = val => {
    setTableHeaderData({ ...tableHeaderData, searchVal: val.toLowerCase() })
  }
  // }

  const handleUpdate = item => {
    setOpenModal(true)
    setEditData(item)
    if(config?.config?.esign_status){
      setESignStatusId(item.id)
    }
  }

  // const handleSortByName = () => handleSort('area_name');
  // const handleSortByAreaCateName = () => handleSort('area_category_name');
  // const handleSortByID = () => handleSort('area_id');
  const resetFilter = () => {
    if (searchBarRef.current) {
      searchBarRef.current.resetSearch()
    }
    setTableHeaderData({
      ...tableHeaderData,
      esignStatus: '',
      searchVal: ''
    })
    // setESignStatus('')
    // setSearchVal('')
    // setTempSearchVal('')
  }

  const handleAuthModalOpen = () => {
    console.log('OPen auth model')
    setApproveAPI({ approveAPIName: 'area-approve', approveAPImethod: 'PATCH', approveAPIEndPoint: '/api/v1/area' })

    setAuthModalOpen(true)
  }
  const handleDownloadPdf = () => {
    setApproveAPI({ approveAPIName: 'area-create', approveAPImethod: 'POST', approveAPIEndPoint: '/api/v1/area' })

    if (config?.config?.esign_status) {
      console.log('Esign enabled for download pdf')
      setEsignDownloadPdf(true)
      setAuthModalOpen(true)
      return
    }
    downloadPdf(tableData, tableHeaderData, tableBody, areaData, userDataPdf)
  }

  return (
    <Box padding={4}>
      <Head>
        <title>Area Master</title>
      </Head>
      <Grid2 item xs={12}>
        <Typography variant='h2'>Area Master</Typography>
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
                      <Button variant='contained' className='py-2' onClick={handleOpenModal}>
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
                Area Data
              </Typography>
              <TableContainer component={Paper}>
                <TableArea
                  pendingAction={pendingAction}
                  handleUpdate={handleUpdate}
                  setArea={setArea}
                  handleAuthCheck={handleAuthCheck}
                  apiAccess={apiAccess}
                  config={config}
                  tableHeaderData={tableHeaderData}
                />
              </TableContainer>
            </Grid2>
          </Box>
        </Grid2>
      </Grid2>
      <SnackbarAlert openSnackbar={alertData.openSnackbar} closeSnackbar={closeSnackbar} alertData={alertData} />
      <AreaModel open={openModal} onClose={handleCloseModal} editData={editData} handleSubmitForm={handleSubmitForm} />

      <AuthModal
        open={authModalOpen}
        handleClose={handleAuthModalClose}
        handleAuthResult={handleAuthResult}
        approveAPIName={approveAPI.approveAPIName}
        approveAPIEndPoint={approveAPI.approveAPIEndPoint}
        approveAPImethod={approveAPI.approveAPImethod}
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
  return validateToken(context, 'Area Master')
}
export default ProtectedRoute(Index)