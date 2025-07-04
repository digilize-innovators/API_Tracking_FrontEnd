'use-client'
import React, { useState, useEffect, useMemo, useLayoutEffect, useRef } from 'react'
import Box from '@mui/material/Box'
import Grid2 from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import { Button } from '@mui/material'
import { IoMdAdd } from 'react-icons/io'
import Head from 'next/head'
import { useSettings } from 'src/@core/hooks/useSettings'
import { useApiAccess } from 'src/@core/hooks/useApiAccess'
import { useLoading } from 'src/@core/hooks/useLoading'
import { useRouter } from 'next/router'
import AuthModal from 'src/components/authModal'
import AccessibilitySettings from 'src/components/AccessibilitySettings'
import ChatbotComponent from 'src/components/ChatbotComponent'
import ProtectedRoute from 'src/components/ProtectedRoute'
import SnackbarAlert from 'src/components/SnackbarAlert'
import { useAuth } from 'src/Context/AuthContext'
import { api } from 'src/utils/Rest-API'
import { validateToken } from 'src/utils/ValidateToken'
import { getTokenValues } from 'src/utils/tokenUtils'
import TableCompany from 'src/views/tables/TableCompany'
import ExportResetActionButtons from 'src/components/ExportResetActionButtons'
import downloadPdf from 'src/utils/DownloadPdf'
import EsignStatusDropdown from 'src/components/EsignStatusDropdown'
import CustomSearchBar from 'src/components/CustomSearchBar'
import CompanyModal from 'src/components/Modal/CompanyModal'

const Index = () => {
  const [openModal, setOpenModal] = useState(false)
  const [alertData, setAlertData] = useState({ openSnackbar: false, type: '', message: '', variant: 'filled' })
  const [companyData, setCompanyData] = useState({ data: [], index: 0 })
  const [editData, setEditData] = useState({})
  const { setIsLoading } = useLoading()
  const { settings } = useSettings()
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
  const apiAccess = useApiAccess('company-create', 'company-update', 'company-approve')
  const [tableHeaderData, setTableHeaderData] = useState({ esignStatus: '', searchVal: '' })
  const [formData, setFormData] = useState({})
  const [pendingAction, setPendingAction] = useState(null)
  const searchRef = useRef()
  const [authUser, setAuthUser] = useState({})
  const [esignRemark, setEsignRemark] = useState('')

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
        const esign_status = config?.config?.esign_status && config?.role !== 'admin' ? 'pending' : 'approved'

        if (pendingAction === 'edit') {
          await editCompany(esign_status)
        } else if (pendingAction === 'add') {
          await addCompany(esign_status)
        }

        setPendingAction(null)
      }
    }

    handleUserAction()
  }, [formData, pendingAction])

  const tableBody = companyData?.data?.map((item, index) => [
    index + companyData.index,
    item?.company_id,
    item?.company_name,
    item?.mfg_licence_no,
    item?.email,
    item?.contact,
    item?.address,
    item?.esign_status
  ])

  const tableData = useMemo(
    () => ({
      tableHeader: ['Sr.No.', 'Id', 'Company Name', 'Mfg.No.', 'Email', 'Contact No', 'Address', 'E-Sign'],
      tableHeaderText: 'Company Master Report ',
      tableBodyText: 'Company Master Data',
      filename: 'Company'
    }),
    []
  )

  const closeSnackbar = () => {
    setAlertData({ ...alertData, openSnackbar: false })
  }

  const handleOpenModal = () => {
    setApproveAPI({ approveAPIName: 'company-create', approveAPIEndPoint: '/api/v1/company', approveAPImethod: 'POST' })
    setOpenModal(true)
    setEditData({})
  }

  const handleCloseModal = () => {
    setEditData({})
    setOpenModal(false)
  }

  const handleAuthModalClose = () => {
    setAuthModalOpen(false)
    setOpenModalApprove(false)
  }

  const resetForm = () => {
    setEditData({})
  }

  const handleSubmitForm = async data => {
    console.log('data', data)
    setFormData(data)
    if (editData?.id) {
      setApproveAPI({
        approveAPIName: 'company-update',
        approveAPImethod: 'PUT',
        approveAPIEndPoint: '/api/v1/company'
      })
    } else {
      setApproveAPI({
        approveAPIName: 'company-create',
        approveAPImethod: 'POST',
        approveAPIEndPoint: '/api/v1/company'
      })
    }
    if (config?.config?.esign_status) {
      setAuthModalOpen(true)
      return
    }
    setPendingAction(editData?.id ? 'edit' : 'add')
  }

  const addCompany = async esign_status => {
    try {
      const data = { ...formData, contact: formData.contactNo }
      delete data.contactNo
      if (config?.config?.audit_logs) {
        data.audit_log = {
          audit_log: true,
          remarks: esignRemark?.length > 0 ? esignRemark : `company added - ${formData.companyId}`,
          authUser
        }
      }
      data.esign_status = esign_status
      setIsLoading(true)
      const res = await api('/company/', data, 'post', true)
      setIsLoading(false)
      if (res?.data?.success) {
        setAlertData({ ...alertData, openSnackbar: true, type: 'success', message: 'Company added successfully' })
        setOpenModal(false)
        resetForm()
      } else {
        console.log('error to add company ', res.data)
        setAlertData({ ...alertData, openSnackbar: true, type: 'error', message: res.data?.message })
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('Erorr to add company ', error)
      router.push('/500')
    } finally {
      setIsLoading(false)
      setApproveAPI({ approveAPIName: '', approveAPIEndPoint: '', approveAPImethod: '' })
    }
  }

  const editCompany = async esign_status => {
    try {
      const data = { ...formData, contact: formData.contactNo }
      delete data.companyId
      delete data.contactNo
      if (config?.config?.audit_logs) {
        data.audit_log = {
          audit_log: true,
          remarks: esignRemark > 0 ? esignRemark : `company edited - ${formData.companyId}`,
          authUser
        }
      }
      data.esign_status = esign_status
      setIsLoading(true)
      const res = await api(`/company/${editData.id}`, data, 'put', true)
      setIsLoading(false)
      if (res.data.success) {
        setAlertData({ ...alertData, openSnackbar: true, type: 'success', message: 'Company updated successfully' })
        setOpenModal(false)
        resetForm()
      } else {
        console.log('error to edit company ', res.data)
        setAlertData({ ...alertData, openSnackbar: true, type: 'error', message: res.data?.message })
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('Erorr to edit company ', error)
      router.push('/500')
    } finally {
      setIsLoading(false)
      setApproveAPI({ approveAPIName: '', approveAPIEndPoint: '', approveAPImethod: '' })
    }
  }

  const handleAuthResult = async (isAuthenticated, user, isApprover, esignStatus, remarks) => {
    console.log('handleAuthResult 01', isAuthenticated, isApprover, esignStatus, user)
    console.log('handleAuthResult 02', config?.userId, user.user_id)

    const resetState = () => {
      setApproveAPI({ approveAPIName: '', approveAPIEndPoint: '', approveAPImethod: '' })
      setEsignDownloadPdf(false)
      setAuthModalOpen(false)
    }

    if (!isAuthenticated) {
      setAlertData({ type: 'error', openSnackbar: true, message: 'Authentication failed, Please try again.' })
      resetState()
      return
    }

    const handleApproverActions = async () => {
      const data = {
        modelName: 'company',
        esignStatus,
        id: eSignStatusId,
        name: auditLogMark,
        audit_log: config?.config?.audit_logs
          ? {
              user_id: user.userId,
              user_name: user.userName,
              remarks: remarks.length > 0 ? remarks : `company ${esignStatus} - ${auditLogMark}`,
              authUser: user.user_id
            }
          : {}
      }

      if (esignStatus === 'approved' && esignDownloadPdf) {
        setOpenModalApprove(false)
        downloadPdf(tableData, tableHeaderData, tableBody, companyData.data, user)
        if (config?.config?.audit_logs) {
          const data = {}
          data.audit_log = {
            audit_log: true,
            performed_action: 'Export report of company ',
            remarks: remarks?.length > 0 ? remarks : `Company master export report `,
            authUser: user
          }
          await api(`/auditlog/`, data, 'post', true)
        }
        resetState()
        return
      }

      const res = await api('/esign-status/update-esign-status', data, 'patch', true)
      if (res.data) {
        setAlertData({
          ...alertData,
          openSnackbar: true,
          type: res.data.code === 200 ? 'success' : 'error',
          message: res.data.message
        })
      }
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
        setAlertData({
          ...alertData,
          openSnackbar: true,
          type: 'error',
          message: 'Access denied for this user.'
        })
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
      if (esignStatus === 'approved') {
        console.log('Esign Download pdf ', esignDownloadPdf)
        if (esignDownloadPdf) {
          console.log('esign is approved for creator to download')
          setEsignDownloadPdf(false)
          setOpenModalApprove(true)
          resetState()
        } else {
          console.log('esign is approved for creator')
          setAuthUser(user)
          setEsignRemark(remarks)
          setPendingAction(editData?.id ? 'edit' : 'add')
        }
      }
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
      approveAPIName: 'company-approve',
      approveAPIEndPoint: '/api/v1/company',
      approveAPImethod: 'PATCH'
    })
    setAuthModalOpen(true)
    setESignStatusId(row.id)
    setAuditLogMark(row.company_id)
    console.log('row', row)
  }

  const handleUpdate = item => {
    resetForm()
    setEditData(item)
    console.log('edit company ', item)
    setOpenModal(true)
  }

  const resetFilter = () => {
    if (searchRef.current) {
      searchRef.current.resetSearch()
    }
    setTableHeaderData({ ...tableHeaderData, esignStatus: '', searchVal: '' })
  }

  const handleSearch = val => {
    setTableHeaderData({ ...tableHeaderData, searchVal: val.trim().toLowerCase() })
  }

  const handleAuthModalOpen = () => {
    console.log('open auth model')
    setApproveAPI({
      approveAPIName: 'company-approve',
      approveAPIEndPoint: '/api/v1/company',
      approveAPImethod: 'PATCH'
    })
    setAuthModalOpen(true)
  }

  const handleDownloadPdf = () => {
    setApproveAPI({
      approveAPIName: 'company-approve',
      approveAPIEndPoint: '/api/v1/company',
      approveAPImethod: 'PATCH'
    })
    if (config?.config?.esign_status) {
      console.log('Esign enabled for download pdf')
      setEsignDownloadPdf(true)
      setAuthModalOpen(true)
      return
    }
    downloadPdf(tableData, tableHeaderData, tableBody, companyData.data, userDataPdf)
  }

  return (
    <Box padding={4}>
      <Head>
        <title>Company Master</title>
      </Head>
      <Grid2 item xs={12}>
        <Typography variant='h2'>Company Master</Typography>
      </Grid2>
      <Grid2 item xs={12}>
        <Grid2 item xs={12}>
          <Box sx={{ backgroundColor: settings.mode === 'dark' ? '#212121' : 'white', borderRadius: 1 }}>
            <Grid2 item xs={12}>
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
                    <CustomSearchBar handleSearchClick={handleSearch} ref={searchRef} />
                    {apiAccess.addApiAccess && (
                      <Box className='mx-2'>
                        <Button variant='contained' sx={{py:2}} onClick={handleOpenModal}>
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
              <Typography variant='h4' className='mx-4 my-2 mt-3'>
                Company Data
              </Typography>
              <TableCompany
                pendingAction={pendingAction}
                tableHeaderData={tableHeaderData}
                handleAuthCheck={handleAuthCheck}
                apiAccess={apiAccess}
                config={config}
                handleUpdate={handleUpdate}
                setCompany={setCompanyData}
              />
            </Grid2>
          </Box>
        </Grid2>
      </Grid2>
      <SnackbarAlert openSnackbar={alertData.openSnackbar} closeSnackbar={closeSnackbar} alertData={alertData} />

      <CompanyModal
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
  return validateToken(context, 'Company')
}
export default ProtectedRoute(Index)
