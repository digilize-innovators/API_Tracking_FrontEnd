import React, { useState, useEffect, useLayoutEffect } from 'react'
import { Box, Button, Select, MenuItem, InputLabel, FormControl } from '@mui/material'
import SnackbarAlert from 'src/components/SnackbarAlert'
import { api } from 'src/utils/Rest-API'
import ProtectedRoute from 'src/components/ProtectedRoute'
import jsPDF from 'jspdf'
import { XMLBuilder } from 'fast-xml-parser'
import autoTable from 'jspdf-autotable'
import moment from 'moment'
import { useRouter } from 'next/router'
import { useAuth } from 'src/Context/AuthContext'
import { useLoading } from 'src/@core/hooks/useLoading'
import AuthModal from 'src/components/authModal'
import ChatbotComponent from 'src/components/ChatbotComponent'
import AccessibilitySettings from 'src/components/AccessibilitySettings'
import { validateToken } from 'src/utils/ValidateToken'
import { getTokenValues } from 'src/utils/tokenUtils'
import Head from 'next/head'
import { Grid2, Typography } from '@mui/material'

const BatchReport = () => {
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState('')
  const [batches, setBatches] = useState([])
  const [selectedBatch, setSelectedBatch] = useState('')
  const [selectedFormat, setSelectFormat] = useState('')
  const [isReportGenerated, setIsReportGenerated] = useState(false)
  const [report, setReport] = useState(null)
  const router = useRouter()
  const [alertData, setAlertData] = useState({ openSnackbar: false, type: '', message: '', variant: 'filled' })
  const { getUserData, removeAuthToken } = useAuth()
  const { setIsLoading } = useLoading()
  const [config, setConfig] = useState(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [esignModalForCreator, setEsignModalForCreator] = useState(true)
  const [approveAPI, setApproveAPI] = useState({ approveAPIName: '', approveAPImethod: '', approveAPIEndPoint: '' })
  const [openModalApprove, setOpenModalApprove] = useState(false)
  const [exportedBy, setExportedBy] = useState('')
  const [approvedBy, setApprovedBy] = useState('')

  useLayoutEffect(() => {
    let data = getUserData()
    const decodedToken = getTokenValues()
    setConfig(decodedToken)
    setExportedBy(data)
    fetchProducts()
    return () => {}
  }, [])

  useEffect(() => {
    if (selectedProduct) {
      getAllBatches()
    }
  }, [selectedProduct])

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      const response = await api('/product?limit=-1&history_latest=true', {}, 'get', true)
      if (response.data.success) {
        setProducts(response.data.data.products)
        setIsLoading(false)
      } else {
        setIsLoading(false)
        if (response.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      setIsLoading(false)
      console.error('Error fetching products:', error)
      setAlertData({ openSnackbar: true, type: 'error', message: 'Failed to fetch products', variant: 'filled' })
    }
  }
  const getAllBatches = async () => {
    try {
      setIsLoading(true)
      const res = await api(`/batch/${selectedProduct}`, {}, 'get', true)
      if (res.data.success) {
        setBatches(res.data.data.batches)
        setIsLoading(false)
      } else {
        setIsLoading(false)
        console.log('Error to get all batches ', res.data)
        setBatches([])
        setAlertData({
          openSnackbar: true,
          type: 'warning',
          message: 'No batches found for selected product.',
          variant: 'filled'
        })
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('Error in get batches ', error)
      setAlertData({ openSnackbar: true, type: 'error', message: 'Failed to fetch batches', variant: 'filled' })
    } finally {
      setIsLoading(false)
    }
  }
  const handleProductChange = event => {
    setSelectedProduct(event.target.value)
    setSelectedBatch('')
    setBatches([])
    setReport(null)
    setIsReportGenerated(false)
  }
  const handleBatchChange = event => {
    setSelectedBatch(event.target.value)
    setIsReportGenerated(false)
    setSelectFormat('')
  }
  const handleFormatChange = event => {
    setSelectFormat(event.target.value)
    setIsReportGenerated(false)
  }
  const handleGenerateReport = async () => {
    if (!selectedProduct || !selectedBatch || !selectedFormat) {
      setAlertData({
        type: 'error',
        message: 'Please select both product,batch,Report Format before generating report.',
        variant: 'filled',
        openSnackbar: true
      })
      return
    }
    try {
      const response = await api(
        '/batch/getbatchreportbyproduct',
        {
          productId: selectedProduct,
          batchId: selectedBatch,
          Format: selectedFormat
        },
        'post',
        true
      )
      if (response.data.success) {
        setReport(response.data.data)
        setIsReportGenerated(true)
        setAlertData({
          openSnackbar: true,
          type: 'success',
          message: 'Report generated successfully.',
          variant: 'filled'
        })
      } else {
        setAlertData({ openSnackbar: true, type: 'error', message: response.data.message, variant: 'filled' })
      }
    } catch (error) {
      console.log(error)
      console.error('Error generating report:', error)
      setAlertData({
        openSnackbar: true,
        type: 'error',
        message: 'Error generating report: ' + error.message,
        variant: 'filled'
      })
    }
  }
  const handleDownloadReport = () => {
    setIsReportGenerated(false)
    if (esignModalForCreator) {
      setApproveAPI({
        approveAPIName: 'batch-report-create',
        approveAPImethod: 'POST',
        approveAPIEndPoint: '/api/v1/batch-report'
      })
    } else {
      setApproveAPI({
        approveAPIName: 'batch-report-approve',
        approveAPImethod: 'PATCH',
        approveAPIEndPoint: '/api/v1/batch-report'
      })
    }
    if (config?.config?.esign_status) {
      setAuthModalOpen(true)
      return
    }
    switch (selectedFormat) {
      case 'pdfDetail': {
        batchSummaryPdf()
        break
      }
      case 'pdfRecord': {
        batchRecordPdf()
        break
      }
      case 'productxml': {
        productXml()
        break
      }
      case 'batchxml': {
        batchXml()
        break
      }
      case 'aggregatexml': {
        AggregateXml()
        break
      }
      default: {
        console.log('no format is selected')
      }
    }
  }
  const downloadXML = (xmlData, filename) => {
    const blob = new Blob([xmlData], { type: 'application/xml' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    console.log(`${filename} generated and downloaded successfully.`)
  }

  // Function to build XML data
  const buildXMLData = jsonData => {
    const builder = new XMLBuilder({ format: true })
    return builder.build(jsonData)
  }

  // AggregateXml function
  const AggregateXml = async () => {
    const data = report.AggregationXml
    const manufacture = report.batch.product.company.mfg_licence_no
    const gtin = report.batch.product.gtin
    const BatchNo = report.batch.batch_no
    const formattedDate = moment().format('DDMMYYYY')
    let AggregationFile
    if (report.ManageSequence.length == 0) {
      AggregationFile = `${manufacture}TSP${formattedDate}001`
    } else {
      const preFileDate = moment(report.ManageSequence[0].createdAt).format('DDMMYYYY')
      if (preFileDate !== formattedDate) {
        AggregationFile = `${manufacture}TSP${formattedDate}001`
      } else {
        const seq = report.ManageSequence[0].serial_no + 1
        const threeDigit = seq.toString().padStart(3, '0')
        AggregationFile = `${manufacture}TSP${formattedDate}${threeDigit}`
      }
    }
    if (!AggregationFile) {
      setAlertData({ openSnackbar: true, type: 'warning', message: 'file Name not found', variant: 'filled' })
      return
    }

    const jsonData = {
      ProductionInfo: {
        ENVELOPE: {
          FILENAME: AggregationFile,
          Tertiary: data.map(tertiary => ({
            SSCC: tertiary.SSCC,
            SubItemCnt: tertiary.Subitem,
            Product: {
              ProductCode: gtin,
              Secondary: tertiary.secondary.map(secondary => ({
                SecSrNo: secondary.unique_code,
                BatchNo: BatchNo,
                NoOfPrimaries: secondary.count,
                Primary: secondary.level0.map(primary => ({
                  PriSrNo: primary.unique_code
                }))
              }))
            }
          }))
        }
      }
    }

    const xmlData = buildXMLData(jsonData)
    const response = await api(
      '/batch/reportFormat',
      {
        fileName: AggregationFile,
        reportFormat: selectedFormat,
        productId: selectedProduct,
        batchNo: selectedBatch,
        fileType: 'TSP',
        fileExtention: 'xml'
      },
      'post',
      true
    )
    downloadXML(xmlData, `${AggregationFile}.xml`)
  }

  // batchXml function
  const batchXml = async () => {
    try {
      const BatchXml = report.batch
      if (!BatchXml || Object.keys(BatchXml).length === 0) {
        throw new Error('No data available for XML export')
      }
      const formattedDate = moment().format('DDMMYYYY')

      let BatchFileName
      if (report.ManageSequence.length == 0) {
        BatchFileName = `${BatchXml.product.company.mfg_licence_no}BAT${formattedDate}001`
      } else {
        const preFileDate = moment(report.ManageSequence[0].createdAt).format('DDMMYYYY')
        if (preFileDate !== formattedDate) {
          BatchFileName = `${BatchXml.product.company.mfg_licence_no}BAT${formattedDate}001`
        } else {
          const seq = report.ManageSequence[0].serial_no + 1
          const threeDigit = seq.toString().padStart(3, '0')
          BatchFileName = `${BatchXml.product.company.mfg_licence_no}BAT${formattedDate}${threeDigit}`
        }
      }

      if (!BatchFileName) {
        setAlertData({ openSnackbar: true, type: 'warning', message: 'file Name not found', variant: 'filled' })

        return
      }

      const jsonData = {
        BATCHINFO: {
          ENVELOPE: {
            FILENAME: BatchFileName,
            MANUFACTURER_CODE: BatchXml.product.company.mfg_licence_no,
            BATCH: {
              BatchNo: BatchXml.batch_no,
              PRODUCT_CODE: BatchXml.productHistory.gtin,
              BATCH_SIZE: BatchXml.qty,
              EXPIRY_DATE: moment(BatchXml.expiry_date).format('DD/MM/YYYY'),
              UNIT_PRICE: BatchXml.productHistory.mrp,
              BATCH_FOR_EXPORT: BatchXml.BATCH_FOR_EXPORT || 'NA',
              EXEMPTED_FROM_BARCODING: BatchXml.EXEMPTED_FROM_BARCODING || 'NA',
              EXEMPTION_NOTIFICATION_AND_DATE: BatchXml.EXEMPTION_NOTIFICATION_AND_DATE || 'NA',
              EXEMPTED_COUNTRY_CODE: BatchXml.EXEMPTED_COUNTRY_CODE || 'NA',
              BATCH_STATUS: 'A'
            }
          }
        }
      }

      const xmlData = buildXMLData(jsonData)

      const response = await api(
        '/batch/reportFormat',
        {
          fileName: BatchFileName,
          reportFormat: selectedFormat,
          productId: selectedProduct,
          batchNo: selectedBatch,
          fileType: 'BAT',
          fileExtention: 'xml'
        },
        'post',
        true
      )
      downloadXML(xmlData, `${BatchFileName}.xml`)
    } catch (error) {
      console.error('Error generating batch XML:', error.message)
    }
  }

  // productXml function
  const productXml = async () => {
    try {
      const product = report.batch.product

      if (!product || product.length === 0) {
        console.error('No data available for XML export')
        return
      }
      const formattedDate = moment().format('DDMMYYYY')
      let ProductFile

      if (report.ManageSequence.length == 0) {
        ProductFile = `${product.company.mfg_licence_no}PRO${formattedDate}001`
      } else {
        const preFileDate = moment(report.ManageSequence[0].createdAt).format('DDMMYYYY')
        if (preFileDate !== formattedDate) {
          ProductFile = `${product.company.mfg_licence_no}PRO${formattedDate}001`
        } else {
          const seq = report.ManageSequence[0].serial_no + 1
          const threeDigit = seq.toString().padStart(3, '0')
          ProductFile = `${product.company.mfg_licence_no}PRO${formattedDate}${threeDigit}`
        }
      }
      if (!ProductFile) {
        setAlertData({ openSnackbar: true, type: 'warning', message: 'file Name not found', variant: 'filled' })

        return
      }

      const jsonData = {
        PRODUCTS_LIST: {
          ENVELOPE: {
            FILENAME: ProductFile,
            MANUFACTURER_CODE: product.company.mfg_licence_no,
            PRODUCT: {
              PRODUCT_TYPE: 0,
              PRODUCT_CODE: product.gtin,
              PRODUCT_NAME: product.product_name,
              GENERIC_NAME: product.generic_name,
              COMPOSITION: product.composition || 'no data available',
              USAGE: product.dosage || 'no data available',
              REMARK: product.remarks || 'no data available',
              PRODUCT_IMAGE: product.product_image
            }
          }
        }
      }

      const xmlData = buildXMLData(jsonData)
      const response = await api(
        '/batch/reportFormat',
        {
          fileName: ProductFile,
          reportFormat: selectedFormat,
          productId: selectedProduct,
          batchNo: selectedBatch,
          fileType: 'PRO',
          fileExtention: 'xml'
        },
        'post',
        true
      )
      console.log(response)
      downloadXML(xmlData, `${ProductFile}.xml`)
    } catch (error) {
      console.error('Error generating product XML:', error)
    }
  }
  const batchRecordPdf = async approver => {
    if (!report) {
      setAlertData({
        type: 'error',
        message: 'Please generate the report before downloading.',
        variant: 'filled',
        openSnackbar: true
      })
      return
    }
    const data = report
    const doc = new jsPDF()
    const HEADER_HEIGHT = 40
    const FOOTER_HEIGHT = 30
    let currentY = HEADER_HEIGHT
    const headerContent = () => {
      const img = new Image()
      img.src = '/images/brand.png'
      const logoWidth = 45
      const logoHeight = 28
      const logoX = doc.internal.pageSize.width - logoWidth - 12
      const logoY = 8
      doc.addImage(img, 'PNG', logoX, logoY, logoWidth, logoHeight)
      doc
        .setFontSize(16)
        .setFont(undefined, 'bold')
        .text('Fourrts (India) Laboratories Pvt. Ltd.', 90, 16, { align: 'center' })

      doc
        .setFontSize(14) // Set larger font size
        .setFont(undefined, 'normal') // Set font to bold
        .text('Batch Record', 100, 28, { align: 'center' })
    }
    const footerContent = (pageNumber, totalPages) => {
      doc.setFontSize(8).setFont(undefined, 'normal')
      doc.text(`Checked By: `, 20, doc.internal.pageSize.height - FOOTER_HEIGHT + 10)
      doc.text(
        `Date: ${moment(exportedBy.exportedAt || new Date()).format('DD/MM/YYYY hh:mm:ss a')}`,
        20,
        doc.internal.pageSize.height - FOOTER_HEIGHT + 15
      )
      if (config?.config?.esign_status) {
        doc.text(`Approved By: ${approver.approverUserName}`, 20, doc.internal.pageSize.height - FOOTER_HEIGHT + 20)
        doc.text(
          `Approved At: ${moment(approver.approvedAt || new Date()).format('DD/MM/YYYY hh:mm:ss a')}`,
          20,
          doc.internal.pageSize.height - FOOTER_HEIGHT + 25
        )
      }
      doc.text(
        `Page ${pageNumber} of ${totalPages || 1}`,
        doc.internal.pageSize.width - 50,
        doc.internal.pageSize.height - FOOTER_HEIGHT + 25,
        null,
        null,
        'center'
      )
    }
    const drawFooterOnAllPages = () => {
      const totalPages = doc.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        footerContent(i, totalPages)
      }
    }
    const renderBatchDetails = () => {
      const BatchDetail = data.batch
      const rows = [
        BatchDetail.product.gtin,
        BatchDetail.batch_no,
        BatchDetail.product.product_name,
        BatchDetail.manufacturing_date ? moment(BatchDetail.manufacturing_date).format('DD/MM/YYYY ') : 'N/A',
        BatchDetail.expiry_date ? moment(BatchDetail.expiry_date).format('DD/MM/YYYY ') : 'N/A',
        BatchDetail.created_at ? moment(BatchDetail.created_at).format('DD/MM/YYYY ') : 'N/A'
      ]

      doc.setFontSize(12).setFont(undefined, 'bold')
      currentY += 10
      doc.text('Batch Details:', 14, currentY)
      currentY += 3
      autoTable(doc, {
        startY: currentY + 2,
        head: [['GTIN', 'Batch No.', 'Product Name', 'Manufacture Date', 'Expire Date', 'Created At']],
        body: [rows],

        styles: { fontSize: 8, cellPadding: 1, overflow: 'linebreak' },
        theme: 'grid',
        margin: { top: HEADER_HEIGHT + 5, bottom: FOOTER_HEIGHT + 10 },
        headStyles: { halign: 'center', fontStyle: 'bold' },
        bodyStyles: { halign: 'center' },
        didDrawPage: headerContent
      })
      currentY = doc.lastAutoTable.finalY + 10
    }
    const printingSummary = () => {
      const printingDetail = data.printingDetail
      const rows = [
        printingDetail.Totalprinted,
        printingDetail.Accepted,
        printingDetail.Rejected,
        printingDetail.DropOutSample,
        printingDetail.DropOutother
      ]

      doc.setFontSize(12).setFont(undefined, 'bold')
      currentY += 3
      doc.text('Printing Summary:', 14, currentY)
      currentY += 3
      autoTable(doc, {
        startY: currentY + 2,
        head: [['Printed Qty', 'Accepted Qty', 'Rejected Qty', 'Sample Qty', 'Destroy Qty']],
        body: [rows],

        styles: { fontSize: 8, cellPadding: 1, overflow: 'linebreak' },
        theme: 'grid',
        margin: { top: HEADER_HEIGHT + 5, bottom: FOOTER_HEIGHT + 10 },
        headStyles: { halign: 'center', fontStyle: 'bold' },
        bodyStyles: { halign: 'center' },
        didDrawPage: headerContent
      })
      currentY = doc.lastAutoTable.finalY + 10
    }
    const renderBatchReport = (data, heading) => {
      const rows = data
      let unique = []
      let columns = ['Code', 'Parent Code', 'Grand Parent Code']
      let hasData = false

      for (let [key, value] of Object.entries(rows)) {
        if (value.length > 0) {
          unique.push([...value])
          hasData = true
        }
      }
      if (!hasData) return false
      const uniqueData = unique.map(item => {
        return item.map(Uc => {
          return Uc.unique_code
        })
      })

      currentY = currentY + 10
      doc.setFontSize(12).setFont(undefined, 'bold')

      uniqueData.forEach((data, index) => {
        if (data.length > 0) {
          console.log(data)
          doc.text(heading, 14, currentY)
        }
        autoTable(doc, {
          startY: currentY + 5, // Ensure `currentY` is correctly calculated
          head: [['SR.NO', columns[index]]], // `columns[index]` should match the current table's header
          body: Array.isArray(data) ? data.map((item, key) => [key + 1, item]) : [[data]], // Ensure body is a 2D array
          styles: { fontSize: 8, cellPadding: 1, overflow: 'linebreak', halign: 'center' },
          theme: 'grid',
          margin: { top: HEADER_HEIGHT + 5, bottom: FOOTER_HEIGHT + 10 },
          headStyles: { halign: 'center', fontStyle: 'bold' },
          bodyStyles: { halign: 'center' },

          didDrawPage: data => {
            if (headerContent) headerContent(data)
          }
        })

        currentY = doc.lastAutoTable.finalY + 20
      })
    }

    const renderAggregated = (item, name) => {
      const code = []
      item.forEach(item => {
        return item.forEach(item => [code.push(item)])
      })

      doc.setFontSize(12).setFont(undefined, 'bold')
      currentY += 10
      name == 'primary'
        ? doc.text('Aggregation Report Primary to Secondary Codes:', 14, currentY)
        : doc.text('Aggregated codes:', 14, currentY)
      const head = name === 'primary' ? ['SR.', 'level0', 'level1'] : ['SR.', 'Level1', 'SSCC']
      currentY += 5
      autoTable(doc, {
        startY: currentY + 3,
        head: [head],

        body: code.map((item, key) => [key + 1, item.t1_unique_code, item.t2_unique_code]),

        styles: { fontSize: 8, cellPadding: 1, overflow: 'linebreak' },
        theme: 'grid',
        margin: { top: HEADER_HEIGHT + 5, bottom: FOOTER_HEIGHT + 10 },
        headStyles: { halign: 'center', fontStyle: 'bold' },
        bodyStyles: { halign: 'center' },
        didDrawPage: headerContent
      })
      currentY = doc.lastAutoTable.finalY + 10
    }

    const buildPdfContent = () => {
      renderBatchDetails()
      printingSummary()
      const hasPrinted = renderBatchReport(data.dynamicTable, 'Printed code')
      const hasAccepted = renderBatchReport(data.acceptedTable, 'Accepted code')
      const hasRejected = renderBatchReport(data.scannedTable, 'Rejected Summary Report')
      const hasSample = renderBatchReport(data.dropoutSample, 'Dropout Sample')
      const hasDropOther = renderBatchReport(data.dropoutOther, 'Dropout Other')
      const anyReport = hasPrinted || hasRejected || hasSample || hasDropOther || hasAccepted
      if (anyReport) {
        currentY += 10
      }
      if (data.AggregatedTable.length > 0) {
        renderAggregated(data.AggregatedTable, 'primary')
      }
      if (data.AggregatedTable2.length > 0) {
        renderAggregated(data.AggregatedTable2, 'secondary')
      }
    }
    buildPdfContent()
    drawFooterOnAllPages()

    let BatchRecordFile
    const manufacture = report.batch.product.company.mfg_licence_no
    const formattedDate = moment().format('DDMMYYYY')

    if (report.ManageSequence.length == 0) {
      BatchRecordFile = `${manufacture}_PDF_Batch_Record_${formattedDate}001`
    } else {
      const preFileDate = moment(report.ManageSequence[0].createdAt).format('DDMMYYYY')
      if (preFileDate !== formattedDate) {
        BatchRecordFile = `${manufacture}_PDF_Batch_Record_${formattedDate}001`
      } else {
        const seq = report.ManageSequence[0].serial_no + 1
        const threeDigit = seq.toString().padStart(3, '0')
        BatchRecordFile = `${manufacture}_PDF_Batch_Record_${formattedDate}${threeDigit}`
      }
    }

    if (!BatchRecordFile) {
      setAlertData({ openSnackbar: true, type: 'warning', message: 'file Name not found', variant: 'filled' })

      return
    }
    const response = await api(
      '/batch/reportFormat',
      {
        fileName: BatchRecordFile,
        reportFormat: selectedFormat,
        productId: selectedProduct,
        batchNo: selectedBatch,
        fileType: 'PDF',
        fileExtention: 'pdf'
      },
      'post',
      true
    )

    doc.save(`${BatchRecordFile}.pdf`)
  }
  const batchSummaryPdf = async approver => {
    const logoImg = await new Promise((resolve, reject) => {
      const img = new Image()
      img.src = '/images/brand.png'
      img.onload = () => resolve(img)
      img.onerror = err => reject('Logo image failed to load: ' + err)
    })
    if (!report) {
      setAlertData({
        type: 'warning',
        message: 'Please generate the report before downloading.',
        variant: 'filled',
        openSnackbar: true
      })
      return
    }
    const data = report
    const doc = new jsPDF()
    const HEADER_HEIGHT = 40
    const FOOTER_HEIGHT = 30
    let currentY = HEADER_HEIGHT
    const headerContent = () => {
      const logoWidth = 45
      const logoHeight = 28
      const logoX = doc.internal.pageSize.width - logoWidth - 12
      const logoY = 8
      doc.addImage(logoImg, 'PNG', logoX, logoY, logoWidth, logoHeight)
      doc
        .setFontSize(16)
        .setFont(undefined, 'bold')
        .text('Fourrts (India) Laboratories Pvt. Ltd.', 90, 16, { align: 'center' })

      doc
        .setFontSize(14) // Set larger font size
        .setFont(undefined, 'normal') // Set font to bold
        .text('Batch Summary', 100, 28, { align: 'center' })
    }
    const footerContent = () => {
      doc.setFontSize(8).setFont(undefined, 'normal')
      doc.text(`Checked By:`, 20, doc.internal.pageSize.height - FOOTER_HEIGHT + 10)
      doc.text(
        `Date: ${moment(exportedBy.exportedAt || new Date()).format('DD/MM/YYYY hh:mm:ss a')}`,
        20,
        doc.internal.pageSize.height - FOOTER_HEIGHT + 15
      )
      if (config?.config?.esign_status) {
        doc.text(`Approved By: `, 20, doc.internal.pageSize.height - FOOTER_HEIGHT + 20)
        doc.text(
          `Approved At: ${moment(approver.approvedAt || new Date()).format('DD/MM/YYYY hh:mm:ss a')}`,
          20,
          doc.internal.pageSize.height - FOOTER_HEIGHT + 25
        )
      }
    }

    const renderBatchDetails = () => {
      const BatchDetail = data.batch
      const rows = [
        BatchDetail?.product?.gtin || 'N/A',
        BatchDetail?.batch_no || 'N/A',
        BatchDetail?.product?.product_name || 'N/A',
        BatchDetail?.manufacturing_date ? moment(BatchDetail?.manufacturing_date).format('DD/MM/YYYY') : 'N/A',
        BatchDetail?.expiry_date ? moment(BatchDetail?.expiry_date).format('DD/MM/YYYY') : 'N/A',
        BatchDetail?.created_at ? moment(BatchDetail?.created_at).format('DD/MM/YYYY') : 'N/A'
      ]

      doc.setFontSize(12).setFont(undefined, 'bold')
      currentY += 10
      doc.text('Batch Details:', 14, currentY)
      currentY += 3
      autoTable(doc, {
        startY: currentY + 2,
        head: [['GTIN', 'Batch No.', 'Product Name', 'Manufacture Date', 'Expire Date', 'Created At']],
        body: [rows],

        styles: { fontSize: 8, cellPadding: 1, overflow: 'linebreak' },
        theme: 'grid',
        margin: { top: HEADER_HEIGHT + 5, bottom: FOOTER_HEIGHT + 10 },
        headStyles: { halign: 'center', fontStyle: 'bold' },
        bodyStyles: { halign: 'center' },
        didDrawPage: headerContent
      })
      currentY = doc.lastAutoTable.finalY + 10
    }
    const printingSummary = () => {
      const printingDetail = data.printingDetail
      const rows = [
        printingDetail?.Totalprinted || 'N/A',
        printingDetail?.Accepted || 'N/A',
        printingDetail?.Rejected || 'N/A',
        printingDetail?.DropOutSample || 'N/A',
        printingDetail?.DropOutother || 'N/A'
      ]

      doc.setFontSize(12).setFont(undefined, 'bold')
      currentY += 3
      doc.text('Printing Summary:', 14, currentY)
      currentY += 3
      autoTable(doc, {
        startY: currentY + 2,
        head: [['Printed Qty', 'Accepted Qty', 'Rejected Qty', 'Sample Qty', 'Destroy Qty']],
        body: [rows],

        styles: { fontSize: 8, cellPadding: 1, overflow: 'linebreak' },
        theme: 'grid',
        margin: { top: HEADER_HEIGHT + 5, bottom: FOOTER_HEIGHT + 10 },
        headStyles: { halign: 'center', fontStyle: 'bold' },
        bodyStyles: { halign: 'center' },
        didDrawPage: headerContent
      })
      currentY = doc.lastAutoTable.finalY + 10
    }

    const buildPdfContent = () => {
      renderBatchDetails()
      printingSummary()
    }
    buildPdfContent()
    footerContent()
    let BatchSummaryFile
    const manufacture = report?.batch?.product?.company?.mfg_licence_no || 'N/A'
    const formattedDate = moment().format('DDMMYYYY')

    if (report.ManageSequence.length == 0) {
      BatchSummaryFile = `${manufacture}_PDF_Batch_Summary_${formattedDate}001`
    } else {
      const preFileDate = moment(report.ManageSequence[0].createdAt).format('DDMMYYYY')
      if (preFileDate !== formattedDate) {
        BatchSummaryFile = `${manufacture}_PDF_Batch_Summary_${formattedDate}001`
      } else {
        const seq = report.ManageSequence[0].serial_no + 1
        const threeDigit = seq.toString().padStart(3, '0')
        BatchSummaryFile = `${manufacture}_PDF_Batch_Summary_${formattedDate}${threeDigit}`
      }
    }

    if (!BatchSummaryFile) {
      setAlertData({ openSnackbar: true, type: 'error', message: 'file Name not found', variant: 'filled' })

      return
    }
    const response = await api(
      '/batch/reportFormat',
      {
        fileName: BatchSummaryFile,
        reportFormat: selectedFormat,
        productId: selectedProduct,
        batchNo: selectedBatch,
        fileType: 'PDF',
        fileExtention: 'pdf'
      },
      'post',
      true
    )

    doc.save(`${BatchSummaryFile}.pdf`)
  }
  const handleAuthModalClose = () => {
    setAuthModalOpen(false)
    setOpenModalApprove(false)
  }
  const handleAuthResult = async (isAuthenticated, user, isApprover, esignStatus, remarks) => {
    console.log('handleAuthResult 01', isAuthenticated, isApprover, esignStatus, user)
    console.log('handleAuthResult 02', config.userId, user.user_id)
    const resetState = () => {
      setApproveAPI({
        approveAPIName: '',
        approveAPImethod: '',
        approveAPIEndPoint: ''
      })
      setAuthModalOpen(false)
    }
    if (!isAuthenticated) {
      setAlertData({ openSnackbar: true, type: 'error', message: 'Authentication failed, Please try again.' })
      resetState()
      return
    }
    const data = {
      modelName: 'batchreport',
      esignStatus,
      audit_log: {}
    }
    if (config?.config?.audit_logs) {
      const auditlogRemark = remarks
      data.audit_log = {
        user_id: user.userId,
        user_name: user.userName,
        performed_action: 'approved',
        remarks: auditlogRemark?.length > 0 ? auditlogRemark : `batch report approved - ${approvedBy}`
      }
    }
    if (isApprover) {
      if (esignStatus === 'approved') {
        setApprovedBy({ userId: user.user_id, userName: user.userName, timeStamp: new Date() })
        setOpenModalApprove(false)
        resetState()

        switch (selectedFormat) {
          case 'pdfDetail': {
            batchSummaryPdf({ approverUserId: user.user_id, approverUserName: user.userName, approvedAt: new Date() })

            break
          }
          case 'pdfRecord': {
            batchRecordPdf({ approverUserId: user.user_id, approverUserName: user.userName, approvedAt: new Date() })

            break
          }
          case 'productxml': {
            productXml()
            break
          }
          case 'batchxml': {
            batchXml()
            break
          }
          case 'aggregatexml': {
            AggregateXml()
            break
          }
          default: {
            console.log('no format is selected')
          }
        }
        return
      } else if (esignStatus === 'rejected') {
        console.log('approver rejected')
        setOpenModalApprove(false)
        resetState()
        return
      }
      const res = await api('/esign-status/update-esign-status', data, 'patch', true)
      console.log('esign status update', res?.data)
    } else if (esignStatus === 'rejected') {
      setAuthModalOpen(false)
      setOpenModalApprove(false)
      setAlertData({
        ...alertData,
        openSnackbar: true,
        type: 'error',
        message: 'Access denied for this user.'
      })
    } else if (esignStatus === 'approved') {
      console.log('esign is approved for creator to download')
      setOpenModalApprove(true)
      setExportedBy({ userId: user.user_id, userName: user.userName, exportedAt: new Date() })
    }
    resetState()
  }
  const handleAuthModalOpen = () => {
    console.log('OPen auth model')
    setApproveAPI({
      approveAPIName: 'batch-report-approve',
      approveAPImethod: 'PATCH',
      approveAPIEndPoint: '/api/v1/batch-report'
    })
    setAuthModalOpen(true)
    setEsignModalForCreator(true)
  }
  return (
    <Box>
      <Head>
        <title>Batch Report</title>
      </Head>
      <Grid2 item xs={12}>
        <Typography variant='h2'>Batch Report</Typography>
      </Grid2>
      <Box className='d-flex justify-content-start align-items-center my-3'>
        <FormControl className='w-25'>
          <InputLabel id='product-label'>Product</InputLabel>
          <Select labelId='product-label' value={selectedProduct} label='Product' onChange={handleProductChange}>
            {products.map(product => (
              <MenuItem key={product.product_uuid} value={product.product_uuid}>
                {product.product_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl className='w-25 ms-2'>
          <InputLabel id='batch-label'>Batch</InputLabel>
          <Select labelId='batch-label' value={selectedBatch} label='Batch' onChange={handleBatchChange}>
            {batches.map(batch => (
              <MenuItem key={batch.batch_uuid} value={batch.batch_uuid}>
                {batch.batch_no}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl className='w-25 ms-2'>
          <InputLabel id='format-label'>Report Format</InputLabel>
          <Select labelId='format-label' value={selectedFormat} label='Report Format' onChange={handleFormatChange}>
            <MenuItem value='pdfDetail'>PDF Batch Summary </MenuItem>
            <MenuItem value='pdfRecord'>PDF Batch Record</MenuItem>

            <MenuItem value='productxml'>Product XML</MenuItem>
            <MenuItem value='batchxml'>Batch XML</MenuItem>
            <MenuItem value='aggregatexml'>Aggregate XML</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box>
        <Button
          variant='contained'
          color='primary'
          onClick={handleGenerateReport}
          sx={{ marginTop: 2, marginBottom: 2 }}
        >
          Generate Report
        </Button>
        <Button
          variant='contained'
          color='primary'
          onClick={handleDownloadReport}
          sx={{ marginTop: 2, marginBottom: 2, marginLeft: 2 }}
          disabled={!isReportGenerated} // Disable when format is not selected
        >
          Download Report
        </Button>
      </Box>
      <SnackbarAlert
        openSnackbar={alertData.openSnackbar}
        closeSnackbar={() => setAlertData({ ...alertData, openSnackbar: false })}
        alertData={alertData}
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
  return validateToken(context, 'Batch Report')
}
export default ProtectedRoute(BatchReport)
