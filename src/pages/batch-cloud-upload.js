'use-client'
import React, { useState, useLayoutEffect, useMemo, useRef } from 'react'
import { Box, Select, Grid2, Typography, FormControl, InputLabel, Button, MenuItem, Modal } from '@mui/material'
import { api } from 'src/utils/Rest-API'
import ProtectedRoute from 'src/components/ProtectedRoute'
import SnackbarAlert from 'src/components/SnackbarAlert'
import { useLoading } from 'src/@core/hooks/useLoading'
import Head from 'next/head'
import { useSettings } from 'src/@core/hooks/useSettings'
import { useAuth } from 'src/Context/AuthContext'
import { useRouter } from 'next/router'
import AuthModal from 'src/components/authModal'
import ChatbotComponent from 'src/components/ChatbotComponent'
import AccessibilitySettings from 'src/components/AccessibilitySettings'
import { validateToken } from 'src/utils/ValidateToken'
import { style } from 'src/configs/generalConfig'
import { getTokenValues } from '../utils/tokenUtils'
import { useApiAccess } from 'src/@core/hooks/useApiAccess'
import ExportResetActionButtons from 'src/components/ExportResetActionButtons'
import CustomSearchBar from 'src/components/CustomSearchBar'
import ImportExportIcon from '@mui/icons-material/ImportExport';
import EsignStatusDropdown from 'src/components/EsignStatusDropdown'
import downloadPdf from 'src/utils/DownloadPdf'
import moment from 'moment'
import TableBatchCloud from 'src/views/tables/TableBatchCloud'

const Index = () => {
  const router = useRouter()
  const [openModal, setOpenModal] = useState(false)
    const [openModalSync, setOpenModalSync] = useState(false)

  const [batchData, setBatchData] = useState([])
  const [alertData, setAlertData] = useState({ openSnackbar: false, type: '', message: '', variant: 'filled' })
  const [allProductData, setAllProductData] = useState([])
  const [allLocationData, setAllLocationData] = useState([])
  const { setIsLoading } = useLoading()
  const { settings } = useSettings()
  const [batchDetail, setBatchDetail] = useState({})
  const [userDataPdf, setUserDataPdf] = useState()
  const { getUserData, removeAuthToken } = useAuth()
  const [config, setConfig] = useState(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [approveAPI, setApproveAPI] = useState({ approveAPIName: '', approveAPImethod: '', approveAPIEndPoint: '' })
  const [esignDownloadPdf, setEsignDownloadPdf] = useState(false)
  const [openModalApprove, setOpenModalApprove] = useState(false)
  const searchBarRef = useRef(null)

  const [tableHeaderData, setTableHeaderData] = useState({
    esignStatus: '',
    searchVal: '',
    filterLocationVal: '',
    filterProductVal: ''
  })

  const apiAccess = useApiAccess('batch-cloud-upload-create', 'batch-cloud-upload-update', 'batch-cloud-upload-approve')
  const tableBody = batchData?.data?.map((item, index) => [
    index + batchData.index,
    item?.batch_no,
    item?.product?.product_history[0]?.common_name,
    item?.location?.history[0]?.location_name,
    item?.manufacturing_date ? moment(item.manufacturing_date).format('DD-MM-YYYY') : 'N/A',
    item?.expiry_date ? moment(item.expiry_date).format('DD-MM-YYYY') : 'N/A',
    item?.qty,
    item?.esign_status
  ])

  const tableData = useMemo(
    () => ({
      tableHeader: ['Sr.No.', 'Batch No.', 'Product Name', 'Location Name', 'Quality', 'E-Sign'],
      tableHeaderText: 'Batch Master Report',
      tableBodyText: 'Batch Master Data',
      filename: 'BatchMaster',
      Filter: ['location', tableHeaderData.filterLocationVal]
    }),
    [tableHeaderData]
  )

  useLayoutEffect(() => {
    getAllProducts()
    getAllLocations()
    let data = getUserData()
    const decodedToken = getTokenValues()
    setConfig(decodedToken)
    setUserDataPdf(data)
    return () => {}
  }, [openModal])
  const getAllProducts = async () => {
    try {
      setIsLoading(true)
      const res = await api('/product?limit=-1&history_latest=true', {}, 'get', true)
      setIsLoading(false)
      if (res.data.success) {
        setAllProductData(res.data.data.products)
      } else {
        console.log('Error to get all products ', res.data)
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('Error in get products ', error)
      setIsLoading(true)
    }
  }
  const getAllLocations = async () => {
    try {
      setIsLoading(true)
      const res = await api('/location/', {}, 'get', true)
      setIsLoading(false)
      console.log('All locations ', res.data)
      if (res.data.success) {
        setAllLocationData(res.data.data.locations)
      } else {
        console.log('Error to get all locations ', res.data)
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('Error in get locations ', error)
      setIsLoading(false)
    }
  }
  const closeSnackbar = () => {
    setAlertData({ ...alertData, openSnackbar: false })
  }
  const handleOpenModal = () => {
    setOpenModal(true)
  }
  const handleAuthModalClose = () => {
    setEsignDownloadPdf(false)
    setAuthModalOpen(false)
    setOpenModalApprove(false)
    setEsignDownloadPdf(false)
  }
  const handleCloseModal = () => {
    setOpenModal(false)
  }

  const handleSubmitForm = () => {
    setApproveAPI({
      approveAPIName: 'batch-cloud-upload-approve',
      approveAPImethod: 'PATCH',
      approveAPIEndPoint: '/api/v1/batch-cloud-upload'
    })
    if (config?.config?.esign_status) {
      setEsignDownloadPdf(false)
      setAuthModalOpen(true)
      return
    }
    BatchDataUploadOnCloud(batchDetail)
  }

   
  const BatchDataUploadOnCloud = async (batch, remarks) => {
    try {
      const data = { dataId: batch.id, tableName: 'batch' }
      const auditlogRemark = remarks
      if (config?.config?.audit_logs) {
        data.audit_logs = {
          audit_log: true,
          performed_action: `Copy Batch data of ${batch.batch_no}`,
          remarks: auditlogRemark?.length > 0 ? auditlogRemark : `Copy Batch data of ${batch.batch_no}`
        }
      }
      console.log('Add batch data ', data)
      setIsLoading(true)
      const res = await api('/batch-cloud-upload/', data, 'post', true)
      setIsLoading(false)
      console.log('Batch Upload :', res.data)
      if (res?.data?.success) {
        console.log('res ', res?.data)
        setAlertData({
          ...alertData,
          openSnackbar: true,
          type: 'success',
          message: 'Batch cloud data added successfully on target database'
        })
      } else {
        console.log('error to add batch ', res.data)
        setAlertData({ ...alertData, openSnackbar: true, type: 'error', message: res.data?.message })
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('Erorr to add batch ', error)
      router.push('/500')
    } finally {
      setOpenModal(false)
      setIsLoading(false)

      setApproveAPI({
        approveAPIName: '',
        approveAPImethod: '',
        approveAPIEndPoint: ''
      })
    }
  }

  const handleAuthResult = async (isAuthenticated, user, isApprover, esignStatus, remarks) => {
    const resetState = () => {
      setApproveAPI({
        approveAPIName: '',
        approveAPImethod: '',
        approveAPIEndPoint: ''
      })
      setAuthModalOpen(false)
      setEsignDownloadPdf(false)
    }
    if (!isAuthenticated) {
      setAlertData({ openSnackbar: true, type: 'error', message: 'Authentication failed, Please try again.' })
      return
    }

    const handleApproverActions = async () => {
      if (esignStatus === 'approved' && esignDownloadPdf) {
        setOpenModalApprove(false)
        console.log('esign is approved for approver.')
        resetState()
        downloadPdf(tableData, tableHeaderData, tableBody, batchData.data, user)
        if (config?.config?.audit_logs) {
          const data = {}
          data.audit_log = {
            audit_log: true,
            performed_action: `Export report of batchClould of product= ${tableHeaderData.filterProductVal}`,
            remarks: remarks?.length > 0 ? remarks : `Batch clould export report of product =${tableHeaderData.filterProductVal} `,
            authUser: user
          }
          await api(`/auditlog/`, data, 'post', true)
        }
      } else if (esignStatus === 'rejected' && esignDownloadPdf) {
        console.log('approver rejected.')
        setOpenModalApprove(false)
        resetState()
      }
    }

    const handleCreatorActions = () => {
      if (esignStatus === 'rejected') {
        setAuthModalOpen(false)
        setOpenModalApprove(false)
        setOpenModal(false)
        // setAlertData({
        //   ...alertData,
        //   openSnackbar: BatchDataUploadOnCloudtrue,
        //   type: 'error',
        //   message: 'Access denied for this user.'
        // })
      }

      if (esignStatus === 'approved') {

        BatchDataUploadOnCloud(batchDetail, remarks)
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
    if (isApprover && esignDownloadPdf) {
      await handleApproverActions()
    } else if (isApprover) {
      console.log('hello for batch cloud')
      handleCreatorActions()
    }
    resetState()
  }

  const handleUpdate = row => {
    setBatchDetail(row)
    handleOpenModal()
  }

  const resetFilter = () => {
    if (searchBarRef.current) {
      searchBarRef.current.resetSearch()
    }
    setTableHeaderData({ esignStatus: '', searchVal: '', filterLocationVal: '', filterProductVal: '' })
  }

  const handleSearch = val => {
    setTableHeaderData({ ...tableHeaderData, searchVal: val.toLowerCase() })
  }
  const handleLocationFilter = e => {
    setTableHeaderData({ ...tableHeaderData, filterLocationVal: e.target.value })
  }
  const handleAuthModalOpen = () => {
    console.log('OPen auth model')

    setApproveAPI({
      approveAPIName: 'batch-cloud-upload-approve',
      approveAPImethod: 'PATCH',
      approveAPIEndPoint: '/api/v1/batch-cloud-upload'
    })
    setAuthModalOpen(true)
  }
  const handleDownloadPdf = () => {
    setApproveAPI({
      approveAPIName: 'batch-cloud-upload-approve',
      approveAPImethod: 'PATCH',
      approveAPIEndPoint: '/api/v1/batch-cloud-upload'
    })
    if (config?.config?.esign_status) {
      setEsignDownloadPdf(true)
      setAuthModalOpen(true)
      return
    }
    downloadPdf(tableData, tableHeaderData, tableBody, batchData, userDataPdf)
  }
  const syncData =async()=>{
   try{
   const data ={
   }

     if (config?.config?.audit_logs) {
        data.audit_log = {
          audit_log: true,
          remarks: `Sync Cloud Data`,
        }
      }
  setIsLoading(true)
   const res = await api('/batch-cloud-upload/synCloudData', data, 'post', true)
       setIsLoading(false)
      console.log('Batch Upload :', res.data)
      if (res?.data?.success) {
        console.log('res ', res?.data)
        setAlertData({
          ...alertData,
          openSnackbar: true,
          type: 'success',
          message: 'Data Sync successfully on target database'
        })
      } else {
        console.log('error to add batch ', res.data)
        setAlertData({ ...alertData, openSnackbar: true, type: 'error', message: res.data?.message })
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('Erorr to sync data ', error)
      router.push('/500')
    } finally {
      setOpenModalSync(false)
      setIsLoading(false)
      setApproveAPI({
        approveAPIName: '',
        approveAPImethod: '',
        approveAPIEndPoint: ''
      })
    }
  }
   
   
  return (
    <Box padding={4}>
      <Head>
        <title>Batch Sync</title>
      </Head>
      <Grid2 item xs={12}>
        <Typography variant='h2'>Batch Cloud Upload</Typography>
      </Grid2>
      <Grid2 item xs={12}>
        <Grid2 item xs={12}>
          <Box sx={{ backgroundColor: settings.mode === 'dark' ? '#212121' : 'white', borderRadius: 1 }}>
            <Typography variant='h4' className='mx-4 my-2 mx-2' sx={{ paddingTop: '1%' }}>
              Filter
            </Typography>
            <Grid2 item xs={12}>
              <Box className='d-flex-row justify-content-start align-items-center mx-4 my-3 '>
                {config?.config?.esign_status && (
                  <EsignStatusDropdown tableHeaderData={tableHeaderData} setTableHeaderData={setTableHeaderData} />
                )}

                <FormControl className='w-25 mx-2'>
                  <InputLabel id='batch-filter-by-location'>Location</InputLabel>
                  <Select
                    labelId='batch-select-by-location'
                    id='product-select-by-location'
                    value={tableHeaderData.filterLocationVal}
                    label='Location'
                    onChange={handleLocationFilter}
                  >
                    {allLocationData?.map(item => {
                      return (
                        <MenuItem key={item?.id} value={item?.location_name}>
                          {item?.location_name}
                        </MenuItem>
                      )
                    })}
                  </Select>
                </FormControl>
                <FormControl className='w-25 ml-2'>
                  <InputLabel id='batch-filter-by-product'>Product</InputLabel>
                  <Select
                    labelId='batch-select-by-product'
                    id='product-select-by-product'
                    value={tableHeaderData.filterProductVal}
                    label='Product'
                    onChange={e => setTableHeaderData({ ...tableHeaderData, filterProductVal: e.target.value })}
                  >
                    {allProductData?.map(item => {
                      return (
                        <MenuItem key={item?.id} value={item?.common_name}>
                          {item?.common_name}
                        </MenuItem>
                      )
                    })}
                  </Select>
                </FormControl>
              </Box>
              <Box className='d-flex justify-content-between align-items-center mx-4 my-2'>
                <ExportResetActionButtons handleDownloadPdf={handleDownloadPdf} resetFilter={resetFilter} />
                <Box className='d-flex justify-content-between align-items-center '>
                  <CustomSearchBar ref={searchBarRef} handleSearchClick={handleSearch} />
                   <Box className='mx-2'>
                                        <Button variant='contained' className='py-2' onClick={()=>setOpenModalSync(true)}>
                                          <span>
                                            <ImportExportIcon/>
                                          </span>
                                          <span>Sync Data</span>
                                        </Button>
                                      </Box>
                </Box>
              </Box>
            </Grid2>
            <Grid2 item xs={12}>
              {tableHeaderData != '' && (
                <TableBatchCloud
                  handleUpdate={handleUpdate}
                  tableHeaderData={tableHeaderData}
                  setDataCallback={setBatchData}
                  handleAuthCheck={()=> {}}
                  apiAccess={apiAccess}
                  config={config}
                  pendingAction={openModal}
                />
              )}
            </Grid2>
          </Box>
        </Grid2>
      </Grid2>
      <SnackbarAlert openSnackbar={alertData.openSnackbar} closeSnackbar={closeSnackbar} alertData={alertData} />
      <Modal
        open={openModalSync}
        onClose={()=>setOpenModalSync(false)}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
        data-testid='modal'
      >
        <Box sx={style}>
          <Typography variant='h4' className='my-2'>
           Are you want sync Data
          </Typography>

          <Grid2 item xs={12} className='my-3 '>
            <Button variant='contained' sx={{ marginRight: 3.5 }} onClick={syncData}>
              Yes
            </Button>

            <Button variant='outlined' color='error' sx={{ marginLeft: 3.5 }} onClick={()=>setOpenModalSync(false)}>
              No
            </Button>
          </Grid2>
        </Box>
      </Modal>

       <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
        data-testid='modal'
      >
        <Box sx={style}>
          <Typography variant='h4' className='my-2'>
            Are you sure you want to upload this batch of data to the cloud?
          </Typography>

          <Grid2 item xs={12} className='my-3 '>
            <Button variant='contained' sx={{ marginRight: 3.5 }} onClick={handleSubmitForm}>
              Yes
            </Button>

            <Button variant='outlined' color='error' sx={{ marginLeft: 3.5 }} onClick={handleCloseModal}>
              No
            </Button>
          </Grid2>
        </Box>
      </Modal>
      <AuthModal
        open={authModalOpen}
        handleClose={handleAuthModalClose}
        approveAPI={approveAPI}
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
  return validateToken(context, 'Batch Cloud Upload')
}
export default ProtectedRoute(Index)
