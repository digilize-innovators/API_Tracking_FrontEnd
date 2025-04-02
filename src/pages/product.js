'use-client'
import React, { useState, useEffect, useMemo, useLayoutEffect, useRef } from 'react'
import Box from '@mui/material/Box'
import Grid2 from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import { Button, TableContainer, Paper } from '@mui/material'
import { IoMdAdd } from 'react-icons/io'
import TableProduct from 'src/views/tables/TableProduct'
import { api } from 'src/utils/Rest-API'
import SnackbarAlert from 'src/components/SnackbarAlert'
import { decrypt } from 'src/utils/Encrypt-Decrypt'
import { useLoading } from 'src/@core/hooks/useLoading'
import ProtectedRoute from 'src/components/ProtectedRoute'
import Head from 'next/head'
import downloadPdf from 'src/utils/DownloadPdf'
import { useAuth } from 'src/Context/AuthContext'
import { BaseUrl } from '../../constants'
import { useSettings } from 'src/@core/hooks/useSettings'
import { useRouter } from 'next/router'
import AuthModal from 'src/components/authModal'
import ChatbotComponent from 'src/components/ChatbotComponent'
import AccessibilitySettings from 'src/components/AccessibilitySettings'
import { validateToken } from 'src/utils/ValidateToken'
import CustomSearchBar from 'src/components/CustomSearchBar'

const mainUrl = BaseUrl
import { decodeAndSetConfig } from '../utils/tokenUtils'
import { useApiAccess } from 'src/@core/hooks/useApiAccess'
import ExportResetActionButtons from 'src/components/ExportResetActionButtons'
import EsignStatusDropdown from 'src/components/EsignStatusDropdown'
import ProductModal from 'src/components/Modal/productModal'

const Index = () => {
  const router = useRouter()
  const { settings } = useSettings()
  const [openModal, setOpenModal] = useState(false)
  const [editData, setEditData] = useState({})
  const [productData, setProduct] = useState([])
  const [alertData, setAlertData] = useState({ openSnackbar: false, type: '', message: '', variant: 'filled' })

  const [productImage, setProductImage] = useState('/images/avatars/p.png')
  const [file, setFile] = useState('')

  const { setIsLoading } = useLoading()
  const { getUserData, removeAuthToken } = useAuth()
  const [userDataPdf, setUserDataPdf] = useState()
  const [config, setConfig] = useState(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [approveAPI, setApproveAPI] = useState({ approveAPIName: '', approveAPImethod: '', approveAPIEndPoint: '' })
  const [eSignStatusId, setESignStatusId] = useState('')
  const [auditLogMark, setAuditLogMark] = useState('')
  const [esignDownloadPdf, setEsignDownloadPdf] = useState(false)
  const [openModalApprove, setOpenModalApprove] = useState(false)
  const [tableHeaderData, setTableHeaderData] = useState({
    esignStatus: '',
    searchVal: ''
  })
  const apiAccess = useApiAccess('product-create', 'product-update', 'product-approve')
  const [formData, setFormData] = useState()
  const [pendingAction, setPendingAction] = useState(null)
  const searchBarRef = useRef(null)

  useLayoutEffect(() => {
    let data = getUserData()
    setUserDataPdf(data)
    decodeAndSetConfig(setConfig)
    return () => {}
  }, [])

  const tableBody = productData?.map((item, index) => [
    index + 1,
    item.product_id,
    item?.product_name,
    item?.gtin,
    item?.ndc,
    item?.generic_name,
    item?.packaging_hierarchy,
    item?.company.company_name,
    item.countryMaster.country,
    item?.esign_status
  ])

  const tableData = useMemo(
    () => ({
      tableHeader: [
        'Sr.No.',
        'Product Id',
        'Product Name',
        'GTIN',
        'NDC No.',
        'Generic Name',
        'Packaging Size',
        'Company Name',
        'Country',
        'E-Sign'
      ],
      tableHeaderText: 'Batch Master Report',
      tableBodyText: 'Batch Master Data',
      filename: 'BatchMaster'
    }),
    []
  )

  useEffect(() => {
    if (formData && pendingAction) {
      const esign_status = config?.config?.esign_status ? 'pending' : 'approved'
      alert(esign_status)
      if (pendingAction === 'edit') {
        editProduct(esign_status)
      } else if (pendingAction === 'add') {
        addProduct(esign_status)
      }
      setPendingAction(null)
    }
  }, [formData, pendingAction])

  const handleAuthModalOpen = () => {
    console.log('OPen auth model')
    setApproveAPI({
      approveAPIName: 'product-approve',
      approveAPImethod: 'PATCH',
      approveAPIEndPoint: '/api/v1/product'
    })
    setAuthModalOpen(true)
  }

  const closeSnackbar = () => {
    setAlertData({...alertData,openSnackbar:false})
  }
  const handleOpenModal = () => {
    setApproveAPI({
      approveAPIName: 'product-create',
      approveAPImethod: 'POST',
      approveAPIEndPoint: '/api/v1/product'
    })
    resetForm()
    setOpenModal(true)
  }
  const handleCloseModal = () => {
    resetForm()
    setOpenModal(false)
  }
  const resetForm = () => {
    setProductImage('/images/avatars/p.png')
    setProductImage('/images/avatars/p.png')
    setFile('')
    setEditData({})
  }

  const handleAuthModalClose = () => {
    setAuthModalOpen(false)
    setOpenModalApprove(false)
  }
  const handleSubmitForm = async data => {
    console.log('submit form')
    console.log(data)
    setFormData(data)
    if (editData?.id) {
      setApproveAPI({
        approveAPIName: 'product-update',
        approveAPImethod: 'PUT',
        approveAPIEndPoint: '/api/v1/product'
      })
    } else {
      setApproveAPI({
        approveAPIName: 'product-create',
        approveAPImethod: 'POST',
        approveAPIEndPoint: '/api/v1/product'
      })
    }
    if (config?.config?.esign_status) {
      setAuthModalOpen(true)
      return
    }

    setPendingAction(editData?.id ? 'edit' : 'add')
  }
  const uploadFile = async (file, endpoint) => {
    try {
      if (!file) {
        return { success: true, url: '' }
      }
      let url = ''
      const formData = new FormData()
      formData.append('photo', file)
      const res = await api(endpoint, formData, 'upload', true)
      if (res?.data?.success) {
        const decryptUrl = await decrypt(res.data.data.path)
        url = `${mainUrl}/${decryptUrl}`
        return { url, success: true }
      } else if (res?.data?.code === 401) {
        removeAuthToken()
        router.push('/401')
      } else {
        return { code: res?.data.code, message: res?.data.message, success: false }
      }
    } catch (error) {
      console.error(`Error in uploading file to ${endpoint}`, error)
    }
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
        modelName: 'product',
        esignStatus,
        id: eSignStatusId,
        audit_log: config?.config?.audit_logs
          ? {
              user_id: user.userId,
              user_name: user.userName,
              performed_action: 'approved',
              remarks: remarks.length > 0 ? remarks : `product master approved - ${auditLogMark}`
            }
          : {}
      }
      if (esignStatus === 'approved' && esignDownloadPdf) {
        setOpenModalApprove(false)
        console.log('esign is approved for approver')
        downloadPdf(tableData, tableHeaderData, tableBody, productData, userDataPdf)
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
        message: "Access denied: Download pdf disabled for this user."
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
      approveAPIName: 'product-approve',
      approveAPImethod: 'PATCH',
      approveAPIEndPoint: '/api/v1/product'
    })
    setAuthModalOpen(true)
    setESignStatusId(row.id)
    setAuditLogMark(row.product_id)
    console.log('row', row)
  }
  const addProduct = async (esign_status, aduitRemarks) => {
    console.log("formData",formData)
    delete formData['file']
    const uploadRes = await uploadFile(formData.file, '/upload/productImage')
    if (!uploadRes?.success) {
      setAlertData({ ...alertData, type: 'error', message: 'File upload failed', openSnackbar: true })
      return
    }

    try {
      const data = {
        ...formData,
        mrp: formData.mrp === '' ? null : formData.mrp,
        pallet_size:formData?.pallet_size?.toString(),
        productImage: uploadRes?.url.split('/').pop(),
      }
      const auditlogRemark = aduitRemarks
      const audit_log = config?.config?.audit_logs
        ? {
            audit_log: true,
            performed_action: 'add',
            remarks: auditlogRemark?.length > 0 ? auditlogRemark : `product added - ${formData.productId}`
          }
        : {
            audit_log: false,
            performed_action: 'none',
            remarks: `none`
          }
      data.audit_log = audit_log
      data.esign_status = esign_status
      console.log('Add product data ', data)
      setIsLoading(true)
      const res = await api('/product/', data, 'post', true)
      setIsLoading(false)
      console.log('REs of add product ', res.data)
      if (res?.data?.success) {
        console.log('res data of add product', res?.data)
        setAlertData({ ...alertData, type: 'success', message: 'Product added successfully', openSnackbar: true })
        resetForm()
        setOpenModal(false)
      } else {
        console.log('error to add product ', res.data)
        setAlertData({ ...alertData, type: 'error', message: res.data?.message, openSnackbar: true })
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('Erorr to add product ', error)
      router.push('/500')
    } finally {
      setIsLoading(false)
    }
  }
  const editProduct = async (esign_status, aduitRemarks) => {
    let productImageUrl =
      productImage !== editData.product_image
        ? (await uploadFile(formData.file, '/upload/productImage'))?.url
        : editData.product_image

    try {
      delete formData['productId']
      const data = {
        ...formData,
        mrp: formData.mrp === '' ? null : formData.mrp,
        pallet_size:formData?.pallet_size?.toString(),
        productImage: productImageUrl,
      }
      const auditlogRemark = aduitRemarks
      let audit_log
      if (config?.config?.audit_logs) {
        audit_log = {
          audit_log: true,
          performed_action: 'edit',
          remarks: auditlogRemark > 0 ? auditlogRemark : `product edited - ${formData.productName}`
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
      console.log('Edit product data ', data)
      setIsLoading(true)
      const res = await api(`/product/${editData.id}`, data, 'put', true)
      setIsLoading(false)
      if (res?.data?.success) {
        console.log('res of edit product ', res?.data)
        setAlertData({ ...alertData, type: 'success', message: 'Product updated successfully', openSnackbar: true })
        setOpenModal(false)
        resetForm()
      } else {
        console.log('error to edit product ', res.data)
        setAlertData({ ...alertData, type: 'error', message: res.data.message, openSnackbar: true })
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('Erorr to edit product ', error)
      router.push('/500')
    } finally {
      setIsLoading(false)
    }
  }
  const handleUpdate = item => {
    resetForm()
    setOpenModal(true)
    setEditData(item)
    console.log('edit product', item)
    if(config?.config?.esign_status){
      setESignStatusId(item.id)
    }
    const defaultImage = '/images/avatars/p.png'
    if (item.product_image && item.product_image !== defaultImage) {
      convertImageToBase64(item.product_image, setProductImage)
    } else {
      setProductImage(defaultImage)
    }
  }
  const convertImageToBase64 = async (imageUrl, setImageState) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const reader = new FileReader()
      reader.onloadend = () => {
        setImageState(reader.result)
      }
      reader.onerror = error => {
        console.error('Error reading the image blob:', error)
      }
      reader.readAsDataURL(blob)
    } catch (error) {
      console.error('Error fetching the image:', error)
    }
  }


  const resetFilter = () => {
    if (searchBarRef.current) {
      searchBarRef.current.resetSearch()
    }
    setTableHeaderData({ ...tableHeaderData, esignStatus: '', searchVal: '' })
  }

  const handleDownloadPdf = () => {
    setApproveAPI({
      approveAPIName: 'product-create',
      approveAPImethod: 'POST',
      approveAPIEndPoint: '/api/v1/product'
    })
    if (config?.config?.esign_status) {
      console.log('Esign enabled for download pdf')
      setEsignDownloadPdf(true)
      setAuthModalOpen(true)
      return
    }
    downloadPdf(tableData, tableHeaderData, tableBody, productData, userDataPdf)
  }


  const handleSearch = val => {
    setTableHeaderData({ ...tableHeaderData, searchVal: val.trim().toLowerCase() })
  }
  return (
    <Box padding={4}>
      <Head>
        <title>Product Master</title>
      </Head>
      <Grid2 item xs={12}>
        <Typography variant='h2'>Product Master</Typography>
      </Grid2>
      <Grid2 item xs={12}>
        <Grid2 item xs={12}>
          <Box sx={{ backgroundColor: settings.mode === 'dark' ? '#212121' : 'white', borderRadius: 1 }}>
            <Typography variant='h4' className='mx-4 my-2 mx-2' sx={{ paddingTop: '1%' }}>
              Filter
            </Typography>
            <Grid2 item xs={12}>
              <Box className='d-flex justify-content-between align-items-center my-3 mx-4'>
                {config?.config.esign_status && (
                  <EsignStatusDropdown tableHeaderData={tableHeaderData} setTableHeaderData={setTableHeaderData} />
                )}
              </Box>
              <Box className='d-flex justify-content-between align-items-center mx-4 my-2'>
                <ExportResetActionButtons handleDownloadPdf={handleDownloadPdf} resetFilter={resetFilter} />
                <Box className='d-flex justify-content-between align-items-center '>
                  <CustomSearchBar ref={searchBarRef} handleSearchClick={handleSearch} />
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
                Product Data
              </Typography>
              <TableContainer component={Paper}>
                <TableProduct
                  tableHeaderData={tableHeaderData}
                  setProduct={setProduct}
                  pendingAction={pendingAction}
                  handleUpdate={handleUpdate}
                  editable={apiAccess.editApiAccess}
                  handleAuthCheck={handleAuthCheck}
                  apiAccess={apiAccess}
                  config={config}
                />
              </TableContainer>
            </Grid2>
          </Box>
        </Grid2>
      </Grid2>
      <SnackbarAlert openSnackbar={alertData.openSnackbar} closeSnackbar={closeSnackbar} alertData={alertData} />
      <ProductModal
        handleSubmitForm={handleSubmitForm}
        openModal={openModal}
        handleCloseModal={handleCloseModal}
        editData={editData}
        productImage={productImage}
        setProductImage={setProductImage}
        tableHeaderData={tableHeaderData}
        convertImageToBase64={convertImageToBase64}
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
  return validateToken(context, 'Product Master')
}
export default ProtectedRoute(Index)