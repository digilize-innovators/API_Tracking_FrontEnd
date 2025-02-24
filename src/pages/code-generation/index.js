/* eslint-disable no-unused-vars */
'use-client'
import React, { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Grid2 from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import {
  Button,
  TableContainer,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  TextField,
  FormHelperText,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from '@mui/material'
import Modal from '@mui/material/Modal'
import { IoMdAdd } from 'react-icons/io'
import { api } from 'src/utils/Rest-API'
import SnackbarAlert from 'src/components/SnackbarAlert'
import { useLoading } from 'src/@core/hooks/useLoading'
import ProtectedRoute from 'src/components/ProtectedRoute'
import Head from 'next/head'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useAuth } from 'src/Context/AuthContext'
import { useSettings } from 'src/@core/hooks/useSettings'
import { useRouter } from 'next/router'
import AuthModal from 'src/components/authModal'
import ChatbotComponent from 'src/components/ChatbotComponent'
import AccessibilitySettings from 'src/components/AccessibilitySettings'
import { validateToken } from 'src/utils/ValidateToken'
import { style } from 'src/configs/generalConfig'
import { decodeAndSetConfig } from '../../utils/tokenUtils'
import { useApiAccess } from 'src/@core/hooks/useApiAccess'
import ExportResetActionButtons from 'src/components/ExportResetActionButtons'
import SearchBar from 'src/components/SearchBarComponent'
import EsignStatusFilter from 'src/components/EsignStatusFilter'
import { footerContent } from 'src/utils/footerContentPdf'
import { headerContentFix } from 'src/utils/headerContentPdfFix'
import TableCodeGeneration from 'src/views/tables/TableCodeGeneration'
import moment from 'moment'

const Index = () => {
  const router = useRouter()
  const { settings } = useSettings()
  const [openModal, setOpenModal] = useState(false)
  const [openModal2, setOpenModal2] = useState(false)
  const [searchVal, setSearchVal] = useState('')
  const [productData, setProductData] = useState([])
  const [batches, setBatches] = useState([])
  const [sortDirection, setSortDirection] = useState('asc')
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [alertData, setAlertData] = useState({ type: '', message: '', variant: 'filled' })
  const [productId, setProductId] = useState('')
  const [batchId, setBatchId] = useState('')
  const [showBox1Data, setShowBox1Data] = useState([])
  const [packagingHierarchyData, setPackagingHierarchyData] = useState({})
  const [generateQuantity, setGenerateQuantity] = useState('')
  const [selected, setSelected] = useState([])
  const [showBox, setShowBox] = useState(false)
  const [eSignStatus, setESignStatus] = useState('')
  const [tempSearchVal, setTempSearchVal] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(settings.rowsPerPage)
  const [totalRecords, setTotalRecords] = useState(0)
  const { setIsLoading } = useLoading()
  const { getUserData, removeAuthToken } = useAuth()
  const [userDataPdf, setUserDataPdf] = useState()
  const [config, setConfig] = useState(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [approveAPIName, setApproveAPIName] = useState('')
  const [approveAPImethod, setApproveAPImethod] = useState('')
  const [approveAPIEndPoint, setApproveAPIEndPoint] = useState('')
  const [eSignStatusId, setESignStatusId] = useState('')
  const [auditLogMark, setAuditLogMark] = useState('')
  const [esignDownloadPdf, setEsignDownloadPdf] = useState(false)
  const [openModalApprove, setOpenModalApprove] = useState(false)
  const [codeRequestData, setCodeRequestData] = useState([])
  const [availableCodeData, setAvailableCodeData] = useState({})
  const apiAccess = useApiAccess('product-create', 'product-update', 'product-approve')
  const [errorProduct, setErrorProduct] = useState({ isError: false, message: '' })
  const [errorBatch, setErrorBatch] = useState({ isError: false, message: '' })

  useEffect(() => {
    let data = getUserData()
    setUserDataPdf(data)
    decodeAndSetConfig(setConfig)
    getCodeRequestData()
    getProducts()
    return () => { }
  }, [])

  useEffect(() => {
    if (productId) {
      console.log('productId on useEffect ', productId)
      getBatches(productId)
    }
  }, [productId])

  useEffect(() => {
    getCodeRequestData()
  }, [page, rowsPerPage, eSignStatus, searchVal])

  useEffect(() => {
    if (generateQuantity !== "") {
      console.log('generateQuantity on useEffect ', generateQuantity)
      const batchSize = showBox1Data?.qty
      const level0 = showBox1Data?.productHistory?.productNumber
      const level1 = showBox1Data?.productHistory?.firstLayer
      const level2 = showBox1Data?.productHistory?.secondLayer
      const level3 = showBox1Data?.productHistory?.thirdLayer

      const generateLevel0 = batchSize * (generateQuantity / 100) * (level0 / level0)
      const generateLevel1 = batchSize * (generateQuantity / 100) * (level1 / level0)
      const generateLeve2 = batchSize * (generateQuantity / 100) * (level2 / level0)
      const generateLeve3 = batchSize * (generateQuantity / 100) * (level3 / level0)
      const outerLayer = batchSize * (generateQuantity / 100) * (1 / level0)

      setPackagingHierarchyData({
        ...packagingHierarchyData,
        productNumber: Math.ceil(generateLevel0),
        firstLayer: Math.ceil(generateLevel1),
        secondLayer: Math.ceil(generateLeve2),
        thirdLayer: Math.ceil(generateLeve3),
        outerLayer: Math.ceil(outerLayer)
      });
    }

    return () => { }
  }, [generateQuantity])

  const getCodeRequestData = async (pageNumber, rowsNumber, status, search) => {
    const paramsPage = pageNumber || page;
    const paramsRows = rowsNumber || rowsPerPage;
    const paramsEsignStatus = status === '' ? status : eSignStatus;
    const paramsSearchVal = search === '' ? search : searchVal;
    let query = `/codegeneration?page=${paramsPage}&limit=${paramsRows}`;
    if (paramsSearchVal) query += `&search=${paramsSearchVal}`;
    if (paramsEsignStatus) query += `&esign_status=${paramsEsignStatus}`;
    console.log('query ', query);
    try {
      setIsLoading(true)
      const res = await api(query, {}, 'get', true)
      setIsLoading(false)
      console.log('Code Request Data ', res.data)
      if (res.data.success) {
        setCodeRequestData(res.data.data.result);
        setTotalRecords(res.data.data.total);
      }
    } catch (error) {
      setIsLoading(false)
      console.log('Error to get code request data ', error)
    }
  }

  const level = packagingHierarchyData?.packagingHierarchy
  const levelFields = {
    1: ['productNumber', 'outerLayer'],
    2: ['productNumber', 'firstLayer', 'outerLayer'],
    3: ['productNumber', 'firstLayer', 'secondLayer', 'outerLayer'],
    4: ['productNumber', 'firstLayer', 'secondLayer', 'thirdLayer', 'outerLayer']
  }
  const fieldsToDisplay = levelFields[level] || []

  const getProducts = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage === -1 ? -1 : rowsPerPage,
        search: searchVal,
        esign_status: eSignStatus
      })
      const res = await api(`/product/?${params.toString()}`, {}, 'get', true)
      setIsLoading(false)
      // console.log('All products ', res?.data?.data)
      if (res.data.success) {
        setProductData(res.data.data.products)
      } else {
        console.log('Error to get all products ', res.data)
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('Error in get products ', error)
      setIsLoading(false)
    }
  }

  const getBatches = async productId => {
    console.log('clicked on get batches - productId ', productId)
    try {
      setIsLoading(true)
      const res = await api(`/batch/getbatchesbyproduct/${productId}`, {}, 'get', true)
      setIsLoading(false)
      console.log('All batches... ', res?.data?.data)
      if (res.data.success) {
        setBatches(res.data.data)
      } else {
        console.log('Error to get all batches ', res.data)
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('Error in get batches ', error)
      setIsLoading(false)
    }
  }

  const getShowBox1Data = async (productId, batchId) => {
    console.log('clicked on get batch from productId and batchId - getShowBox1Data', productId, batchId)
    try {
      setIsLoading(true)
      setPackagingHierarchyData({})
      const res = await api(`/batch/getbatchbyproduct/${productId}/${batchId}`, {}, 'get', true)
      setIsLoading(false)
      console.log('batch from productId and batchNo', res.data)
      if (res.data.success) {
        setShowBox(true)
        setShowBox1Data(res.data.data)
        setPackagingHierarchyData({
          packagingHierarchy: res.data.data?.productHistory?.packagingHierarchy,
          productNumber: res.data.data?.productHistory?.productNumber,
          firstLayer: res.data.data?.productHistory?.firstLayer,
          secondLayer: res.data.data?.productHistory?.secondLayer,
          thirdLayer: res.data.data?.productHistory?.thirdLayer,
          outerLayer: 1
        })
      } else {
        console.log('Error to get batch from productId and batchNo ', res.data)
        setShowBox(false)
        setOpenSnackbar(true);
        setAlertData({ type: 'error', message: res.data.message, variant: 'filled' });
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('Error in get batch from productId and batchNo', error)
      setIsLoading(false)
    }
  }

  const closeSnackbar = () => {
    setOpenSnackbar(false)
  }
  const handleOpenModal = () => {
    setApproveAPIName('product-create')
    setApproveAPImethod('POST')
    setApproveAPIEndPoint('/api/v1/product')
    resetForm()
    setProductId('')
    setBatchId('')
    setBatches([])
    setGenerateQuantity('')
    setOpenModal(true)
  }
  const handleCloseModal = () => {
    resetForm()
    setOpenModal(false)
    setShowBox(false)
  }
  const handleCloseModal2 = () => {
    setOpenModal2(false)
    setAvailableCodeData({})
  }

  const handleAuthModalClose = () => {
    setAuthModalOpen(false)
    setOpenModalApprove(false)
  }

  const handleAuthResult = async (isAuthenticated, user, isApprover, esignStatus, remarks) => {
    console.log('handleAuthResult', { isAuthenticated, isApprover, esignStatus, user })
    const closeApprovalModal = () => setOpenModalApprove(false)
    const resetState = () => {
      setApproveAPIName('')
      setApproveAPImethod('')
      setApproveAPIEndPoint('')
      setAuthModalOpen(false)
    }
    if (!isAuthenticated) {
      setAlertData({ type: 'error', message: 'Authentication failed, Please try again.' })
      setOpenSnackbar(true)
      resetState()
      return
    }
    const processApproval = async () => {
      const data = {
        modelName: 'state',
        esignStatus,
        id: eSignStatusId,
        audit_log: config.audit_logs
          ? {
            user_id: user.userId,
            user_name: user.userName,
            performed_action: 'approved',
            remarks: remarks || `product approved - ${auditLogMark}`
          }
          : {}
      }
      await api('/esign-status/update-esign-status', data, 'patch', true)
      console.log('eSign status updated')
      if (esignDownloadPdf) {
        downloadPdf()
      }
    }
    const handleEsignStatus = () => {
      if (esignStatus === 'approved') {
        if (esignDownloadPdf) {
          setOpenModalApprove(true)
        } else {
          // const esign_status = "pending";
          // editData?.id ? editProduct(esign_status, remarks) : addProduct(esign_status, remarks);
        }
      } else if (esignStatus === 'rejected') {
        closeApprovalModal()
      }
    }
    if (isApprover) {
      if (esignStatus === 'approved' && esignDownloadPdf) {
        closeApprovalModal()
        await processApproval()
      } else {
        await processApproval()
        if (esignStatus === 'rejected') closeApprovalModal()
      }
    } else {
      handleEsignStatus()
    }
    resetState()
    getProducts()
  }
  const handleAuthCheck = async row => {
    console.log('handleAuthCheck', row)
    setApproveAPIName('product-approve')
    setApproveAPImethod('PATCH')
    setApproveAPIEndPoint('/api/v1/product')
    setAuthModalOpen(true)
    setESignStatusId(row.id)
    setAuditLogMark(row.product_id)
    console.log('row', row)
  }

  const handleSort = key => {
    const newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc'
    const sorted = [...productData].sort((a, b) => {
      if (a[key] > b[key]) {
        return newSortDirection === 'asc' ? 1 : -1
      }
      if (a[key] < b[key]) {
        return newSortDirection === 'asc' ? -1 : 1
      }
      return 0
    })
    setProductData(sorted)
    setSortDirection(newSortDirection)
  }
  const handleSortById = () => handleSort('product_id')

  const resetFilter = () => {
    setESignStatus('')
    setSearchVal('')
    setTempSearchVal('')
  }
  const handleSearch = () => {
    setSearchVal(tempSearchVal.toLowerCase())
    setPage(0)
  }
  const handleTempSearchValue = e => {
    setTempSearchVal(e.target.value.toLowerCase())
  }
  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }
  const handleChangeRowsPerPage = event => {
    const newRowsPerPage = parseInt(event.target.value, 10)
    setRowsPerPage(newRowsPerPage)
    setPage(0)
  }
  const downloadPdf = () => {
    console.log('clicked on download btn')
    const doc = new jsPDF()
    const headerContent = () => {
      headerContentFix(doc, 'Product Master Report')

      if (searchVal) {
        doc.setFontSize(10)
        doc.text('Search : ' + `${tempSearchVal}`, 15, 25)
      } else {
        doc.setFontSize(10)
        doc.text('Search : ' + '__', 15, 25)
      }
      doc.text('Filters :\n', 15, 30)
      if (eSignStatus) {
        doc.setFontSize(10)
        doc.text('E-Sign : ' + `${eSignStatus}`, 20, 35)
      } else {
        doc.setFontSize(10)
        doc.text('E-Sign : ' + '__', 20, 35)
      }
      doc.setFontSize(12)
      doc.text('Product Master Data', 15, 55)
    }
    const bodyContent = () => {
      let currentPage = 1
      let dataIndex = 0
      const totalPages = Math.ceil(productData.length / 25)
      headerContent()
      while (dataIndex < productData.length) {
        if (currentPage > 1) {
          doc.addPage()
        }
        footerContent(currentPage, totalPages, userDataPdf, doc)

        const body = productData
          .slice(dataIndex, dataIndex + 25)
          .map((item, index) => [
            dataIndex + index + 1,
            item.product_id,
            item.product_name,
            item.gtin,
            item.ndc,
            item.mrp,
            item.generic_name,
            item.esign_status
          ])
        autoTable(doc, {
          startY: currentPage === 1 ? 60 : 40,
          styles: { halign: 'center' },
          headStyles: {
            fontSize: 8,
            fillColor: [80, 189, 160]
          },
          alternateRowStyles: { fillColor: [249, 250, 252] },
          tableLineColor: [80, 189, 160],
          tableLineWidth: 0.1,
          head: [['Sr.No.', 'Product Id', 'Product Name', 'Gtin', 'Ndc', 'Mrp', 'Generic Name', 'E-Sign']],
          body: body,
          columnWidth: 'wrap'
        })
        dataIndex += 25
        currentPage++
      }
    }

    bodyContent()
    const currentDate = new Date()
    const formattedDate = currentDate
      .toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
      .replace(/\//g, '-')
    const formattedTime = currentDate.toLocaleTimeString('en-US', { hour12: false }).replace(/:/g, '-')
    const fileName = `Product Master_${formattedDate}_${formattedTime}.pdf`
    doc.save(fileName)
  }
  const handleAuthModalOpen = () => {
    console.log('OPen auth model')
    setApproveAPIName('area-approve')
    setApproveAPImethod('PATCH')
    setApproveAPIEndPoint('/api/v1/area')
    setAuthModalOpen(true)
  }
  const handleDownloadPdf = () => {
    setApproveAPIName('area-create')
    setApproveAPImethod('POST')
    setApproveAPIEndPoint('/api/v1/area')
    if (config?.config?.esign_status) {
      console.log('Esign enabled for download pdf')
      setEsignDownloadPdf(true)
      setAuthModalOpen(true)
      return
    }
    downloadPdf()
  }

  const getWantToGenerate = (level) => {
    const findedLevel = availableCodeData?.packagingHierarchyData?.find(i => i.level === level);
    const value = findedLevel ? findedLevel.generate : 0;
    return parseInt(value || 0);
  }

  const handleGenerateCode = async (regenerate) => {
    try {
      let data = {};
      if (regenerate) {
        data = {
          product_id: availableCodeData?.product_id,
          packaging_hierarchy_data: {
            packagingHierarchy: availableCodeData?.batch?.productHistory?.packagingHierarchy,
            productNumber: getWantToGenerate(0),
            firstLayer: getWantToGenerate(1),
            secondLayer: getWantToGenerate(2),
            thirdLayer: getWantToGenerate(3),
            outerLayer: getWantToGenerate('Outer'),
          },
          batch_id: availableCodeData?.batch_id
        }
      } else {
        data = {
          product_id: productId,
          packaging_hierarchy_data: packagingHierarchyData,
          batch_id: batchId
        }
      }
      console.log('data on handleGenerateCode', data)
      setIsLoading(true);
      const response = await api('/codegeneration', data, 'post', true)
      if (response.data.success) {
        console.log('Code Generated Successfully', response.data)
        setAlertData({ type: 'success', message: 'Code Generated Successfully', variant: 'filled' })
        setOpenSnackbar(true);
        getCodeRequestData();
        handleCloseModal();
        handleCloseModal2();
        setIsLoading(false);

      }
      else {
        setAlertData({ type: 'error', message: response.data.message, variant: 'filled' })
        setIsLoading(false);
        handleCloseModal()
        handleCloseModal2();
      }
    } catch (error) {
      setAlertData({ type: 'error', message: error?.message, variant: 'filled' })
      console.log('Error in handleGenerateCode', error)
      setIsLoading(false);
      handleCloseModal()
      handleCloseModal2();
    }
  }

  const handleCheckboxChange = id => {
    setSelected(prevSelected =>
      prevSelected.includes(id) ? prevSelected.filter(item => item !== id) : [...prevSelected, id]
    )
  }

  const changeGenereateCode = (id, value, availableValue) => {
    if (value <= availableValue) {
      const packagingHierarchyData = availableCodeData?.packagingHierarchyData;
      const updatedData = packagingHierarchyData.map(item => {
        if (item.id === id) {
          return { ...item, generate: value };
        } else {
          return item;
        }
      })
      setAvailableCodeData({ ...availableCodeData, packagingHierarchyData: updatedData })
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
    const packagingHierarchyLevel = row.batch.productHistory.packagingHierarchy // packagingHierarchyLevel
    const batchSize = row.batch.qty
    const packagingHierarchyData = []
    const baseLevel = {
      0: row.batch.productHistory.productNumber,
      1: row.batch.productHistory.firstLayer,
      2: row.batch.productHistory.secondLayer,
      3: row.batch.productHistory.thirdLayer
    }

    for (let i = 0; i < packagingHierarchyLevel; i++) {
      const batchQty = batchSize * (baseLevel[i] / baseLevel[0])
      const generatedCodes = levelWiseData.find(item => item.packaging_hierarchy === `level${i}`).no_of_codes
      packagingHierarchyData.push({
        id: i,
        level: i,
        batchQty,
        generatedCodes,
        availableCodes: batchQty - generatedCodes,
        generate: ''
      })
    }
    const outerBatchQty = batchSize * 1 / baseLevel[0];
    console.log("TOTAL outer ", outerBatchQty);
    const lastLevelSize = levelWiseData.find(item => item.packaging_hierarchy === `level${packagingHierarchyLevel - 1}`).no_of_codes;
    console.log("TOTAL outer ", lastLevelSize, baseLevel[packagingHierarchyLevel - 1]);

    const generatedOuter = lastLevelSize * (1 / baseLevel[packagingHierarchyLevel - 1]);
    console.log("generatedOuter outer ", generatedOuter);

    packagingHierarchyData.push({
      id: packagingHierarchyData.length,
      level: 'Outer',
      batchQty: outerBatchQty,
      generatedCodes: generatedOuter,
      availableCodes: outerBatchQty - generatedOuter,
      generate: ''
    })
    setAvailableCodeData({ ...row, packagingHierarchyData })
    setOpenModal2(true)
  }


  const applyValidation = () => {
    if (productId == '') {
      setErrorProduct({ isError: true, message: 'Select Product' });
    }
    else {
      setErrorProduct({ isError: false, message: '' })
    }

    if (batchId == '') {
      setErrorBatch({ isError: true, message: 'Select Batch' });
    }
    else {
      setErrorBatch({ isError: false, message: '' })
    }
  }

  const resetForm = () => {
    setShowBox1Data([])
    setProductId('')
    setBatchId('')
    setErrorBatch({ isError: false, message: '' })
    setErrorProduct({ isError: false, message: '' })

  }

  const checkValidation = () => {
    return !(productId.trim() != '' && productId != undefined && productId != null && batchId != '' && batchId != null && batchId != undefined)
  }
  const handleModal1Save = () => {
    const validation = checkValidation();
    console.log("Validation :", validation)
    if (validation) {
      applyValidation()
      return
    }
    console.log('clicked on save handleModal1Save')
    getShowBox1Data(productId, batchId)
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
                <EsignStatusFilter esignStatus={eSignStatus} setEsignStatus={setESignStatus} />
              </Box>
              <Box className='d-flex justify-content-between align-items-center mx-4 my-2'>
                <ExportResetActionButtons handleDownloadPdf={handleDownloadPdf} resetFilter={resetFilter} />
                <Box className='d-flex justify-content-between align-items-center '>
                  <SearchBar
                    searchValue={tempSearchVal}
                    handleSearchChange={handleTempSearchValue}
                    handleSearchClick={handleSearch}
                  />
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
                  codeRequestData={codeRequestData}
                  sortDirection={sortDirection}
                  handleSortById={handleSortById}
                  handleOpenModal2={handleOpenModal2}
                  totalRecords={totalRecords}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  handleChangePage={handleChangePage}
                  handleChangeRowsPerPage={handleChangeRowsPerPage}
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
      <SnackbarAlert openSnackbar={openSnackbar} closeSnackbar={closeSnackbar} alertData={alertData} />
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        data-testid='modal'
        role='dialog'
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
      >
        <Box sx={{ ...style, width: '70%' }}>
          <Typography variant='h3' className='my-2'>
            Generate Codes
          </Typography>

          <Grid2 item xs={12} className='d-flex justify-content-between align-items-center mb-4 mt-4'>
            <Box className='w-50'>
              <FormControl fullWidth required error={errorProduct.isError}>
                <InputLabel id='label-product'>Product</InputLabel>
                <Select
                  labelId='label-product'
                  id='product'
                  label='Product *'
                  value={productId}
                  onChange={e => {
                    console.log('e.target.value', e.target.value)
                    setProductId(e.target.value)
                    setErrorProduct({ isError: false, message: '' })
                  }}
                >
                  {productData?.map(item => (
                    <MenuItem key={item.id} value={item.id} selected={productId === item.id}>
                      {item.product_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box className='w-50' sx={{ ml: 2 }}>
              <FormControl fullWidth required error={errorBatch.isError}>
                <InputLabel id='label-batch'>Batch No</InputLabel>
                <Select
                  labelId='label-batch'
                  id='batch'
                  label='Batch No *'
                  value={batchId}
                  onChange={e => {
                    setBatchId(e.target.value)
                    setErrorBatch({ isError: false, message: '' })
                  }}
                >
                  {batches?.map(item => (
                    <MenuItem key={item.id} value={item.id} selected={batchId === item.id}>
                      {item.batch_no}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box className='w-45' sx={{ ml: 2 }}>
              <Button variant='outlined' sx={{ mx: 14 }} onClick={() => handleModal1Save()}>
                Save
              </Button>
            </Box>
          </Grid2>
          <Grid2 container spacing={2} sx={{ padding: "0rem 1rem" }}>
            <Grid2 size={5}>
              <FormHelperText error={errorProduct.isError}>
                {errorProduct.isError ? errorProduct.message : ''}

              </FormHelperText>
            </Grid2>
            <Grid2 size={4}>
              <FormHelperText error={errorBatch.isError}>
                {errorBatch.isError ? errorBatch.message : ''}
              </FormHelperText>
            </Grid2>
          </Grid2>
          <Box
            sx={{
              display: showBox ? 'block' : 'none'
            }}
          >
            <Grid2 item xs={12} className='d-flex justify-content-between align-items-center mb-2'>
              <Box className='w-50'>
                <TextField
                  fullWidth
                  id='location'
                  label='Location'
                  placeholder='Location'
                  value={showBox1Data?.location?.location_name || ''}
                  disabled={true}
                />
              </Box>
              <Box className='w-50' sx={{ ml: 2 }}>
                <TextField
                  fullWidth
                  id='manufacturingDate'
                  label='Mfg. Date'
                  placeholder='Mfg. Date'
                  value={
                    showBox1Data?.manufacturing_date
                      ? new Date(showBox1Data.manufacturing_date).toLocaleDateString()
                      : ''
                  }
                  disabled={true}
                />
              </Box>
              <Box className='w-50' sx={{ ml: 2 }}>
                <TextField
                  fullWidth
                  id='expiryDate'
                  label='Exp. Date'
                  placeholder='Exp. Date'
                  value={showBox1Data?.expiry_date ? new Date(showBox1Data.expiry_date).toLocaleDateString() : ''}
                  disabled={true}
                />
              </Box>
            </Grid2>
            <Divider sx={{ my: 6, backgroundColor: 'black', width: '90%', mx: 'auto' }} />

            <Grid2 item xs={12} className='d-flex justify-content-between align-items-start mb-2'>
              <Box className='w-50'>
                <TextField
                  fullWidth
                  id='batchQuantity'
                  label='Batch Quantity'
                  placeholder='Batch Quantity'
                  value={showBox1Data?.qty || 0}
                  disabled={true}
                />
                <Box sx={{ mt: '30%' }}>
                  <ul style={{ listStyleType: 'disc', paddingLeft: '30%' }}>
                    {fieldsToDisplay.map(
                      field =>
                        packagingHierarchyData[field] !== undefined && (
                          <li key={field}>
                            <Typography variant='h4' className='text-nowrap'>
                              {`${field.charAt(0).toUpperCase() + field.slice(1)} : ${packagingHierarchyData[field]}`}
                            </Typography>
                          </li>
                        )
                    )}
                  </ul>
                </Box>
              </Box>
              <Box className='w-50' sx={{ ml: 2 }}>
                <TextField
                  fullWidth
                  id='generateQuantity'
                  label='Generate Qty in %'
                  placeholder='Generate Qty in %'
                  value={generateQuantity}
                  type='number'
                  inputProps={{ step: '0.01' }}
                  onChange={event => {
                    const value = event.target.value;
                    if (value <= 100 && value >= 0)
                      setGenerateQuantity(value)
                  }}
                />
              </Box>
              <Box className='w-50' sx={{ ml: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box
                  component='img'
                  sx={{
                    width: '60%',
                    height: '60%',
                    borderRadius: '8px',
                    border: '1px solid grey',
                    mb: 4
                  }}
                  src='/images/packaginghierarchy01.png'
                  alt='description'
                />
                <TextField
                  fullWidth
                  id='packagingHierarchy'
                  label='Packaging Hierarchy'
                  placeholder='Packaging Hierarchy'
                  value={packagingHierarchyData?.packagingHierarchy}
                  disabled={true}
                />
              </Box>
            </Grid2>

            <Grid2 item xs={12} className='my-3 '>
              <Button variant='contained' sx={{ marginRight: 3.5 }} onClick={() => handleGenerateCode(false)}>
                Generate
              </Button>
              <Button type='reset' variant='outlined' color='primary' onClick={resetForm}>
                Reset
              </Button>
              <Button variant='outlined' color='error' sx={{ marginLeft: 3.5 }} onClick={() => handleCloseModal()}>
                Close
              </Button>
            </Grid2>
          </Box>
        </Box>
      </Modal>

      <Modal
        open={openModal2}
        onClose={handleCloseModal2}
        data-testid='modal'
        role='dialog'
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
      >
        <Box sx={{ ...style, width: '70%' }}>
          <Typography variant='h3' className='my-2'>
            Generate Codes
          </Typography>

          <Grid2 item xs={12} className='d-flex justify-content-between align-items-center mb-2'>
            <Box className='w-50'>
              <TextField
                fullWidth
                id='productId'
                label='Product'
                placeholder='Product'
                value={availableCodeData?.batch?.productHistory?.product_name}
                disabled={true}
              />
            </Box>
            <Box className='w-50' sx={{ ml: 2 }}>
              <TextField
                fullWidth
                id='batchId'
                label='Batch No.'
                placeholder='Batch No.'
                value={availableCodeData?.batch?.batch_no}
                disabled={true}
              />
            </Box>
            <Box className='w-50' sx={{ ml: 2 }}>
              <TextField
                fullWidth
                id='location'
                label='Location'
                placeholder='Location'
                value={availableCodeData?.locations?.location_name}
                disabled={true}
              />
            </Box>
          </Grid2>
          <Grid2 item xs={12} className='d-flex justify-content-between align-items-center mb-2'>
            <Box className='w-50'>
              <TextField
                fullWidth
                id='manufacturingDate'
                label='Mfg. Date'
                placeholder='Mfg. Date'
                value={moment(availableCodeData?.batch?.manufacturing_date).format('DD-MM-YYYY')}
                disabled={true}
              />
            </Box>
            <Box className='w-50' sx={{ ml: 2 }}>
              <TextField
                fullWidth
                id='expiryDate'
                label='Expiry Date'
                placeholder='Expiry Date'
                value={moment(availableCodeData?.batch?.expiry_date).format('DD-MM-YYYY')}
                disabled={true}
              />
            </Box>
            <Box className='w-50' sx={{ ml: 2 }}>
              <TextField
                fullWidth
                id='batchQuantity'
                label='Batch Quantity'
                placeholder='Batch Quantity'
                value={availableCodeData?.batch?.qty}
                disabled={true}
              />
            </Box>
          </Grid2>
          <Divider sx={{ my: 6, backgroundColor: 'black', width: '90%', mx: 'auto' }} />

          <Grid2 item xs={12} className='d-flex justify-content-between align-items-center mb-2'>
            <Box className='w-75'>
              <TableContainer component={Paper}>
                <Table aria-label='simple table'>
                  <TableHead>
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell>Packing Level</TableCell>
                      <TableCell>Batch Qty</TableCell>
                      <TableCell>Generated Codes</TableCell>
                      <TableCell>Available Codes</TableCell>
                      <TableCell>Generate</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {availableCodeData?.packagingHierarchyData?.map(row => (
                      <TableRow key={row.id}>
                        <TableCell padding='checkbox'>
                          <Checkbox checked={selected.includes(row.id)} onChange={() => handleCheckboxChange(row.id)} />
                        </TableCell>
                        <TableCell>{row.level}</TableCell>
                        <TableCell>{row.batchQty}</TableCell>
                        <TableCell>{row.generatedCodes}</TableCell>
                        <TableCell>{row.availableCodes}</TableCell>
                        <TableCell>
                          <TextField value={row.generate} onChange={e => changeGenereateCode(row.id, e.target.value, row.availableCodes)} size='medium' />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            <Box className='w-25' sx={{ ml: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box
                component='img'
                sx={{
                  marginTop: 3,
                  width: '60%',
                  height: '60%',
                  borderRadius: '8px',
                  border: '1px solid grey',
                  mb: 4 // Adds a little spacing between the image and the TextField
                }}
                src='/images/packaginghierarchy01.png'
                alt='description'
              />
              <TextField
                fullWidth
                id='packagingHierarchy'
                label='Packaging Hierarchy'
                placeholder='Packaging Hierarchy'
                value={availableCodeData?.batch?.productHistory?.packagingHierarchy}
                disabled={true}
              />
            </Box>
          </Grid2>

          <Grid2 item xs={12} className='my-3 '>
            <Button variant='contained' sx={{ marginRight: 3.5 }} onClick={() => handleGenerateCode(true)}>
              Generate
            </Button>
            <Button type='reset' variant='outlined' color='primary' onClick={resetForm}>
              Reset
            </Button>
            <Button variant='outlined' color='error' sx={{ marginLeft: 3.5 }} onClick={handleCloseModal2}>
              Close
            </Button>
          </Grid2>
        </Box>
      </Modal>
      <AuthModal
        open={authModalOpen}
        handleClose={handleAuthModalClose}
        approveAPIName={approveAPIName}
        approveAPImethod={approveAPImethod}
        approveAPIEndPoint={approveAPIEndPoint}
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
