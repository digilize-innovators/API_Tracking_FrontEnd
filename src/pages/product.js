'use-client'
import React, { useState, useEffect, useMemo, useLayoutEffect, useRef } from 'react'
import { Button, Box, Grid2, Typography } from '@mui/material'
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
import { BaseUrl } from 'constants'
import { useSettings } from 'src/@core/hooks/useSettings'
import { useRouter } from 'next/router'
import AuthModal from 'src/components/authModal'
import ChatbotComponent from 'src/components/ChatbotComponent'
import AccessibilitySettings from 'src/components/AccessibilitySettings'
import { validateToken } from 'src/utils/ValidateToken'
import CustomSearchBar from 'src/components/CustomSearchBar'

const mainUrl = BaseUrl
import { useApiAccess } from 'src/@core/hooks/useApiAccess'
import ExportResetActionButtons from 'src/components/ExportResetActionButtons'
import EsignStatusDropdown from 'src/components/EsignStatusDropdown'
import ProductModal from 'src/components/Modal/productModal'
import { getTokenValues } from 'src/utils/tokenUtils'
import { convertImageToBase64 } from 'src/utils/UrlToBase64'

const Index = () => {
  const router = useRouter()
  const { settings } = useSettings()
  const [openModal, setOpenModal] = useState(false)
  const [editData, setEditData] = useState({})
  const [productData, setProductData] = useState({ data: [], index: 0 })
  const [alertData, setAlertData] = useState({ openSnackbar: false, type: '', message: '', variant: 'filled' })
  const [productImage, setProductImage] = useState('/images/avatars/p.png')
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
  const [authUser, setAuthUser] = useState({})
  const [esignRemark, setEsignRemark] = useState('')

  useLayoutEffect(() => {
    let data = getUserData()
    setUserDataPdf(data)
    const decodedToken = getTokenValues()
    setConfig(decodedToken)
    return () => {}
  }, [])
  const tableBody = productData?.data?.map((item, index) => [
    index + productData.index,
    item?.product_id,
    item?.product_name,
    item?.gtin,
    item?.ndc,
    item?.generic_name,
    item?.packaging_size,
    item?.company.CompanyHistory[0]?.company_name,
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
      tableHeaderText: 'Product Master Report',
      tableBodyText: 'Product Master Data',
      filename: 'ProductMaster'
    }),
    []
  )

  useEffect(() => {
    const handleUserAction = async () => {
      if (formData && pendingAction) {
        const esign_status = config?.config?.esign_status ? 'pending' : 'approved'
        if (pendingAction === 'edit') {
          await editProduct(esign_status)
        } else if (pendingAction === 'add') {
          await addProduct(esign_status)
        }
        setPendingAction(null)
      }
    }
    handleUserAction()
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
    setAlertData({ ...alertData, openSnackbar: false })
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
    setEditData({})
  }

  const handleAuthModalClose = () => {
    setEsignDownloadPdf(false)
    setAuthModalOpen(false)
    setOpenModalApprove(false)
  }
  const handleSubmitForm = async data => {
    console.log('submit form', data )
    setFormData({
      ...data,
      productNumber_print: data.productNumber_print ? data.productNumber_print : data.productNumber_aggregation,
      firstLayer_print: data.firstlayer_print ? data.firstlayer_print : data.firstLayer_aggregation,
      secondLayer_print: data.secondLayer_print ? data.secondLayer_print : data.secondLayer_aggregation,
      thirdLayer_print: data.thirdLayer_print ? data.thirdLayer_print : data.thirdLayer_aggregation,
      pallet_size: data.palletisation_applicable ? data.pallet_size : '',
      pallet_size_unit_of_measurement: data.palletisation_applicable ? data.pallet_size_unit_of_measurement : '',
    })
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
      const res = await api(endpoint, formData, 'upload', true);
      console.log('upload prod res ', res.data);
      
      if (res?.data?.success) {
        const decryptUrl = await decrypt(res.data.data.path)
        url = `${mainUrl}/${decryptUrl}`.replace(/\\/g, '/')
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
        remarks: remarks?.length > 0 ? remarks : `product master ${action} - ${auditLogMark}`,
        authUser: user.user_id
      }
    : {};
};

const handleApproverActions = async (user, esignStatus, remarks) => {
  const payload = {
    modelName: 'product',
    esignStatus,
    id: eSignStatusId,
    name: auditLogMark,
    audit_log: buildAuditLog(user, remarks, esignStatus)
  };

  if (esignStatus === 'approved' && esignDownloadPdf) {
    setOpenModalApprove(false);

    downloadPdf(tableData, tableHeaderData, tableBody, productData?.data, user);

    if (config?.config?.audit_logs) {
      const auditPayload = {
        audit_log: {
          audit_log: true,
          performed_action: 'Export report of productMaster ',
          remarks: remarks?.length > 0 ? remarks : `Product master export report `,
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
      approveAPIName: 'product-approve',
      approveAPImethod: 'PATCH',
      approveAPIEndPoint: '/api/v1/product'
    })
    setAuthModalOpen(true)
    setESignStatusId(row.id)
    setAuditLogMark(row.product_id)
    console.log('row', row)
  }
  const addProduct = async esign_status => {
    const uploadRes = await uploadFile(formData?.file, '/upload/productImage')
    if (!uploadRes?.success) {
      setAlertData({ ...alertData, type: 'error', message: 'File upload failed', openSnackbar: true })
      return
    }
    try {
      delete formData?.['file']
      const data = {
        ...formData,
        mrp: formData?.mrp === '' ? null : formData?.mrp,
        pallet_size: formData?.pallet_size?.toString(),
        productImage: uploadRes?.url != '' ? new URL(uploadRes.url).pathname : ''
      }
      if (config?.config?.audit_logs) {
        data.audit_log = {
          audit_log: true,
          remarks: esignRemark?.length > 0 ? esignRemark : `product added - ${formData?.productId}`,
          authUser
        }
      }
      data.esign_status = esign_status
      setIsLoading(true)
      const res = await api('/product/', data, 'post', true)
      setIsLoading(false)
      if (res?.data?.success) {
        setAlertData({ ...alertData, type: 'success', message: 'Product added successfully', openSnackbar: true })
        resetForm()
        setOpenModal(false)
      } else {
        console.log('error to add product ', res.data)
        setAlertData({ ...alertData, type: 'error', message: res.data?.error?.details?.message ||res.data?.message, openSnackbar: true })
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
  const editProduct = async esign_status => {
    console.log('Check Image is new pic is upload ')
    let productImageUrl =
      productImage !== editData.product_image
        ? (await uploadFile(formData?.file, '/upload/productImage'))?.url
        : editData.product_image
    try {
      delete formData?.['productId']
      delete formData?.['file']
      const data = {
        ...formData,
        mrp: formData?.mrp === '' ? null : formData?.mrp,
        pallet_size: formData?.pallet_size?.toString(),
        productImage: productImageUrl ? new URL(productImageUrl).pathname : ''
      }
      if (config?.config?.audit_logs) {
        data.audit_log = {
          audit_log: true,
          remarks: esignRemark > 0 ? esignRemark : `product edited - ${formData?.productName}`,
          authUser
        }
      }
      data.esign_status = esign_status
      setIsLoading(true)
      const res = await api(`/product/${editData.id}`, data, 'put', true)
      setIsLoading(false)
      if (res?.data?.success) {
        setProductImage('/images/avatars/p.png')
        console.log('res of edit product ', res?.data)
        setAlertData({ ...alertData, type: 'success', message: 'Product updated successfully', openSnackbar: true })
        setOpenModal(false)
        resetForm()
      } else {
        console.log('error to edit product ', res.data)
        setAlertData({ ...alertData, type: 'error', message:  res.data?.error?.details?.message ||res.data.message, openSnackbar: true })
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
    if (config?.config?.esign_status) {
      setESignStatusId(item.id)
    }

    if (item.product_image.trim() !== '' && item.product_image !== '/images/avatars/p.png') {
      convertImageToBase64(item.product_image, setProductImage)
    } else {
      setProductImage('/images/avatars/p.png')
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
      approveAPIName: 'product-approve',
      approveAPImethod: 'PATCH',
      approveAPIEndPoint: '/api/v1/product'
    })
    if (config?.config?.esign_status) {
      console.log('Esign enabled for download pdf')
      setEsignDownloadPdf(true)
      setAuthModalOpen(true)
      return
    }
    downloadPdf(tableData, tableHeaderData, tableBody, productData?.data, userDataPdf)
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
            <Grid2 item xs={12}>
              <Typography variant='h4' className='mx-4 my-2 mt-3'>
                Product Data
              </Typography>
                <TableProduct
                  tableHeaderData={tableHeaderData}
                  setDataCallback={setProductData}
                  pendingAction={pendingAction}
                  handleUpdate={handleUpdate}
                  handleAuthCheck={handleAuthCheck}
                  apiAccess={apiAccess}
                  config={config}
                />
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
