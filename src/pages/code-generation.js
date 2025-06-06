/* eslint-disable no-unused-vars */
'use-client'
import React, { useState, useEffect, useMemo, useLayoutEffect, useRef } from 'react'
import { Button, TableContainer, Paper, Box, Grid2, Typography } from '@mui/material'
import { IoMdAdd } from 'react-icons/io'
import { api } from 'src/utils/Rest-API'
import SnackbarAlert from 'src/components/SnackbarAlert'
import { useLoading } from 'src/@core/hooks/useLoading'
import ProtectedRoute from 'src/components/ProtectedRoute'
import Head from 'next/head'
import { useAuth } from 'src/Context/AuthContext'
import { useSettings } from 'src/@core/hooks/useSettings'
import AuthModal from 'src/components/authModal'
import ChatbotComponent from 'src/components/ChatbotComponent'
import AccessibilitySettings from 'src/components/AccessibilitySettings'
import { validateToken } from 'src/utils/ValidateToken'
import { getTokenValues } from 'src/utils/tokenUtils'
import { useApiAccess } from 'src/@core/hooks/useApiAccess'
import ExportResetActionButtons from 'src/components/ExportResetActionButtons'
import TableCodeGeneration from 'src/views/tables/TableCodeGeneration'
import CustomSearchBar from 'src/components/CustomSearchBar'
import downloadPdf from 'src/utils/DownloadPdf'
import CodeGenerationModal from 'src/components/Modal/CodeGenerationModal'
import CodeReGenerationModal from 'src/components/Modal/CodeReGenerationModal'
import EsignStatusDropdown from 'src/components/EsignStatusDropdown'

const Index = () => {
  const { settings } = useSettings()
  const [openModal, setOpenModal] = useState(false)
  const [openModal2, setOpenModal2] = useState(false)
  const [alertData, setAlertData] = useState({ openSnackbar: false, type: '', message: '', variant: 'filled' })
  const [tableHeaderData, setTableHeaderData] = useState({ searchVal: '', esignStatus: '' })
  const { setIsLoading } = useLoading()
  const { getUserData } = useAuth()
  const [userDataPdf, setUserDataPdf] = useState()
  const [config, setConfig] = useState(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [approveAPI, setApproveAPI] = useState({ approveAPIName: '', approveAPImethod: '', approveAPIEndPoint: '' })
  const [eSignStatusId, setESignStatusId] = useState('')
  const [auditLogMark, setAuditLogMark] = useState('')
  const [esignDownloadPdf, setEsignDownloadPdf] = useState(false)
  const [openModalApprove, setOpenModalApprove] = useState(false)
  const [codeRequestData, setCodeRequest] = useState([])
  const [availableCodeData, setAvailableCodeData] = useState({})
  const [formData, setFormData] = useState({})
  const [isCodeReGeneration, setIsCodeReGeneration] = useState(false)
  const apiAccess = useApiAccess('codegeneration-create', 'codegeneration-update', 'codegeneration-approve')
  const searchRef = useRef();

  useLayoutEffect(() => {
    let data = getUserData()
    const decodedToken = getTokenValues()
    setConfig(decodedToken)
    setUserDataPdf(data)
    return () => {}
  }, [])

  const tableData = useMemo(
    () => ({
      tableHeader: ['Sr.No.', 'Product Name', 'Batch No', 'Location', 'Batch Qty', 'Codes Generated', 'Status'],
      tableHeaderText: 'Code Generation Report ',
      tableBodyText: 'Code Generation Data',
      filename: 'CodeGeneration'
    }),
    []
  )

  const tableBody = codeRequestData.map((item, index) => [
    index + 1,
    item.batch.history[0].productHistory.product_name,
    item.batch.history[0].batch_no,
    item.locations.location_name,
    item.batch.history[0].qty,
    item.no_of_codes,
    item.status
  ])

  const closeSnackbar = () => {
    // setOpenSnackbar(false)
    setAlertData({ ...alertData, openSnackbar: false })
  }
  const handleOpenModal = () => {
    setApproveAPI({
      approveAPIName: 'codegeneration-create',
      approveAPImethod: 'POST',
      approveAPIEndPoint: '/api/v1/codegeneration'
    })
    setOpenModal(true)
  }
  const handleCloseModal = () => {
    setApproveAPI({ approveAPIName: '', approveAPImethod: '', approveAPIEndPoint: '' })
    setOpenModal(false)
  }
  const handleCloseModal2 = () => {
    setApproveAPI({ approveAPIName: '', approveAPImethod: '', approveAPIEndPoint: '' })
    setOpenModal2(false)
    setAvailableCodeData({})
  }

  const handleAuthModalClose = () => {
    setAuthModalOpen(false)
    setOpenModalApprove(false)
  }

  const handleAuthResult = async (isAuthenticated, user, isApprover, esignStatus, remarks) => {
    console.log('handleAuthResult', { isAuthenticated, isApprover, esignStatus, user })
    
    const resetState = () => {
      setApproveAPI({ approveAPIName: '', approveAPImethod: '', approveAPIEndPoint: '' })
      setAuthModalOpen(false)
      setEsignDownloadPdf(false)
    }
    if (!isAuthenticated) {
      setAlertData({ type: 'error', message: 'Authentication failed, Please try again.' })
      setAlertData({ ...alertData, openSnackbar: true })
      resetState()
      return
    }

    const handleApproverActions = async () => {
      const data = {
        modelName: 'codeGenerationRequest',
        esignStatus,
        id: eSignStatusId,
        audit_log: config?.config?.audit_logs
          ? {
              user_id: user.userId,
              user_name: user.userName,
              performed_action: 'approved',
              remarks: remarks || `code generation approved - ${auditLogMark}`,
              authUser: user.user_id
            }
          : {}
      }
      if (esignStatus === 'approved' && esignDownloadPdf) {
        setOpenModalApprove(false)
        console.log('esign is approved for approver')
        downloadPdf(tableData, tableHeaderData, tableBody, codeRequestData, userDataPdf)
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
      if (res?.data.esign_status === 'rejected') {
        console.log('approver rejected')
        setOpenModalApprove(false)
        resetState()
      }
      setTableHeaderData({ ...tableHeaderData, searchVal: "", esignStatus: ""})
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
      if (esignStatus === 'approved') {
        if (esignDownloadPdf) {
          console.log('esign is approved for creator to download')
          setOpenModalApprove(true)
        } else {
          console.log('esign is approved for creator ', user);
          isCodeReGeneration
            ? handleGenerateCode(true, null, user, remarks)
            : handleGenerateCode(false, formData, user, remarks)
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
      approveAPIName: 'codegeneration-approve',
      approveAPImethod: 'PATCH',
      approveAPIEndPoint: '/api/v1/codegeneration'
    })
    setAuthModalOpen(true)
    setESignStatusId(row.batch_id)
    setAuditLogMark(row.product_id)
  }

  const resetFilter = () => {
    if (searchRef.current) {
      searchRef.current.resetSearch() // Call the reset method in the child
    }
    setTableHeaderData({ ...tableHeaderData, searchVal: '', esignStatus: '' })
  }
  const handleSearch = val => {
    setTableHeaderData({ ...tableHeaderData, searchVal: val.trim().toLowerCase() })
  }

  const handleAuthModalOpen = () => {
    console.log('OPen auth model')
    setApproveAPI({
      approveAPIName: 'codegeneration-approve',
      approveAPImethod: 'PATCH',
      approveAPIEndPoint: '/api/v1/codegeneration'
    })
    setAuthModalOpen(true)
  }
  const handleDownloadPdf = () => {
    setApproveAPI({
      approveAPIName: 'codegeneration-approve',
      approveAPImethod: 'PATCH',
      approveAPIEndPoint: '/api/v1/codegeneration'
    })
    if (config?.config?.esign_status) {
      console.log('Esign enabled for download pdf')
      setEsignDownloadPdf(true)
      setAuthModalOpen(true)
      return
    }
    downloadPdf(tableData, tableHeaderData, tableBody, codeRequestData, userDataPdf)
  }

  const getWantToGenerate = level => {
    const findedLevel = availableCodeData?.packagingHierarchyData?.find(i => i.level === level)
    const value = findedLevel ? findedLevel.generate : 0
    return parseInt(value || 0)
  }

  const handleGenerateCode = async (regenerate, payload, user, remarks) => {
    try {
      console.log("Handle code generation ", regenerate, user, remarks);
      let data = {}
      if (regenerate) {
        data = {
          product_id: availableCodeData?.product_id,
          packaging_hierarchy_data: {
            packagingHierarchy: availableCodeData?.batch?.productHistory?.packagingHierarchy,
            productNumber: getWantToGenerate(0),
            firstLayer: getWantToGenerate(1),
            secondLayer: getWantToGenerate(2),
            thirdLayer: getWantToGenerate(3),
            outerLayer: getWantToGenerate('Outer')
          },
          batch_id: availableCodeData?.batch_id
        }
      } else {
        data = {
          product_id: payload.productId,
          packaging_hierarchy_data: payload.packagingHierarchyData,
          batch_id: payload.batchId
        }
      }
      if(config?.config?.audit_logs){
        data.audit_log = {
          audit_log: true,
          performed_action: 'Code generation',
          remarks: remarks?.length > 0 ? remarks : `Code generation added batchId = ${availableCodeData.batch_id}`,
          authUser: user
        }
      }
      data.esign_status = "pending";
      setIsLoading(true)
      const response = await api('/codegeneration', data, 'post', true)
      if (response.data.success) {
        console.log('Code Generated Successfully', response.data)
        setAlertData({
          ...alertData,
          openSnackbar: true,
          type: 'success',
          message: 'Code Generated Successfully',
          variant: 'filled'
        })
        handleCloseModal()
        handleCloseModal2()
        setIsLoading(false)
        setTableHeaderData({ ...tableHeaderData, searchVal: "", esignStatus: "" })
      } else {
        setAlertData({ type: 'error', message: response.data.message, variant: 'filled' })
        setIsLoading(false)
        handleCloseModal()
        handleCloseModal2()
      }
    } catch (error) {
      setAlertData({ type: 'error', message: error?.message, variant: 'filled' })
      console.log('Error in handleGenerateCode', error)
      setIsLoading(false)
      handleCloseModal()
      handleCloseModal2()
    } finally {
      setIsCodeReGeneration(false)
    }
  }
  const getAvailableData = async (productId, batchId) => {
    try {
      const res = await api(`/codegeneration/available?productId=${productId}&batchId=${batchId}`, {}, 'get', 'token')
      console.log('Available code ', res.data)
      if (res?.data.success) return res.data.data
    } catch (error) {
      console.log('Error in available codes gettting ', error)
    }
  }

  const handleOpenModal2 = async row => {
    console.log('clicked on handleOpenModal2', row)
    const levelWiseData = await getAvailableData(row.product_id, row.batch_id)
    const packagingHierarchyLevel = row.batch.history[0].productHistory.packagingHierarchy
    const batchSize = row.batch.history[0].qty
    const packagingHierarchyData = []
    const baseLevel = {
      0: row.batch.history[0].productHistory.productNumber,
      1: row.batch.history[0].productHistory.firstLayer,
      2: row.batch.history[0].productHistory.secondLayer,
      3: row.batch.history[0].productHistory.thirdLayer
    }

    for (let i = 0; i < packagingHierarchyLevel; i++) {
      const batchQty = batchSize * (baseLevel[i] / baseLevel[0])
      const generatedCodes = levelWiseData.find(item => item.packaging_hierarchy === `level${i}`)?.no_of_codes
      packagingHierarchyData.push({
        id: i,
        level: i,
        batchQty,
        generatedCodes,
        availableCodes: batchQty - generatedCodes,
        generate: ''
      })
    }
    const outerBatchQty = (batchSize * 1) / baseLevel[0]
    const generatedOuter = levelWiseData.find(item => item.packaging_hierarchy === `level5`)?.no_of_codes

    packagingHierarchyData.push({
      id: packagingHierarchyData.length,
      level: 'Outer',
      batchQty: outerBatchQty,
      generatedCodes: generatedOuter,
      availableCodes: outerBatchQty - generatedOuter,
      generate: ''
    })
    setAvailableCodeData({ ...row, packagingHierarchyData })
    setApproveAPI({
      approveAPIName: 'codegeneration-update',
      approveAPImethod: 'PUT',
      approveAPIEndPoint: '/api/v1/codegeneration'
    })
    setIsCodeReGeneration(true)
    setOpenModal2(true)
  }

  return (
    <Box padding={4}>
      <Head>
        <title>Code Generation</title>
      </Head>
      <Grid2 item xs={12}>
        <Typography variant='h2'>Code Generation</Typography>
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
            <Grid2 item xs={12}>
              <Typography variant='h4' className='mx-4 my-2 mt-3'>
                Code Generation Data
              </Typography>
              <TableContainer component={Paper}>
                <TableCodeGeneration
                  setCodeRequest={setCodeRequest}
                  tableHeaderData={tableHeaderData}
                  handleAuthCheck={handleAuthCheck}
                  apiAccess={apiAccess}
                  config={config}
                  handleOpenModal2={handleOpenModal2}
                  isCodeReGeneration={isCodeReGeneration}
                />
              </TableContainer>
            </Grid2>
          </Box>
        </Grid2>
      </Grid2>
      <SnackbarAlert openSnackbar={alertData.openSnackbar} closeSnackbar={closeSnackbar} alertData={alertData} />
      <CodeGenerationModal
        open={openModal}
        onClose={handleCloseModal}
        handleGenerateCode={handleGenerateCode}
        setForm={setFormData}
        setAuthModalOpen={setAuthModalOpen}
        config={config}
      />
      <CodeReGenerationModal
        open={openModal2}
        onClose={handleCloseModal2}
        availableCodeData={availableCodeData}
        setAvailableCodeData={setAvailableCodeData}
        handleGenerateCode={handleGenerateCode}
        setAuthModalOpen={setAuthModalOpen}
        config={config}
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
  return validateToken(context, 'Code Generation')
}
export default ProtectedRoute(Index)
