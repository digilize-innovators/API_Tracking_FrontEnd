import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import moment from 'moment'
import { headerContentFix } from 'src/utils/headerContentPdfFix'
import { footerContent } from 'src/utils/footerContentPdf'

const salePdf = (row, title, tableBody, orderDetail, userDataPdf, scannedcode) => {
  const doc = new jsPDF()

  const addHeader = () => {
    headerContentFix(doc, title)
    doc.setFontSize(10)
    if(row?.order_type)
    {
          doc.text(`Order Type: ${row.order_type}`, 15, 25)

    }
    doc.text(`Order No: ${row.order_no}`, 15, 30)
    doc.text(`Order Date: ${moment(row.order_date).format('DD-MM-YYYY')}`, 15, 35)
    doc.text(`From: ${row.order_from_location.location_name}`, 15, 40)
    doc.text(`To: ${row.order_to_location.location_name}`, 15, 45)
    doc.text(`Status: ${row.status}`, 15, 50)
  }

const addTable = (head, body, startY, title = null) => {
  if (!body?.length) return

  let tableStartY = startY || (doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 70)

  const pageHeight = doc.internal.pageSize.height
  const bottomMargin = 30
  const rowHeight = 10 // estimated row height
  const headerHeight = 10
  const titleHeight = title ? 10 : 0

  // Check if there's enough space for at least 1 row
  const availableSpace = pageHeight - tableStartY - bottomMargin
  const requiredForOneRow = titleHeight + headerHeight + rowHeight

  if (availableSpace < requiredForOneRow) {
    doc.addPage()
    tableStartY = 40 // reset top margin for new page
  }

  // Add section title
  if (title) {
    doc.setFontSize(12).setFont(undefined, 'bold')
    doc.text(title, 14, tableStartY)
    tableStartY += 5
  }

  // Draw table
  autoTable(doc, {
    startY: tableStartY,
    head: [head],
    body,
    styles: { halign: 'center', cellWidth: 'auto', minCellWidth: 20 },
    headStyles: { fontSize: 8, fillColor: [80, 189, 160] },
    alternateRowStyles: { fillColor: [249, 250, 252] },
    tableLineColor: [80, 189, 160],
    tableLineWidth: 0.1,
    margin: { bottom: 20 },
    didDrawPage: () => {
      const pageCount = doc.internal.getNumberOfPages()
      footerContent(doc.internal.getCurrentPageInfo().pageNumber, pageCount, userDataPdf, doc)
    }
  })
}


  addHeader()

  // Main Order Table
  addTable(
    ['Sr.No.', 'Product', 'Batch', 'Total Quantity', 'Scanned Quantity'],
    tableBody,
    70,
    'Order Detail'
  )

  // Dynamic Sections
  const sections = [
    { key: 'outward', title: 'Outward Unique Codes Detail' },
    { key: 'inward', title: 'Inward Unique Codes Detail' },
    { key: 'missingcode', title: 'Missing Codes Detail' },
    { key: 'uniqueCodeData', title: 'Unique Codes Detail' }
  ]

  sections.forEach(({ key, title }) => {
    const body = scannedcode?.[key]?.map((item, i) => [
      i + 1, item.common_name, item.batch_name, item.unique_code
    ]) || []
    addTable(['Sr.No.', 'Product', 'Batch', 'Unique code'], body, null, title)
  })

  // Save PDF with timestamp
  const now = new Date()
  const formattedDate = now.toLocaleDateString('en-GB').replace(/\//g, '-')
  const formattedTime = now.toLocaleTimeString('en-US', { hour12: false }).replace(/:/g, '-')
  doc.save(`${row?.order_no}_${formattedDate}_${formattedTime}.pdf`)
}

export default salePdf
