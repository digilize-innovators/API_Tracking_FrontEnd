import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { headerContentFix } from 'src/utils/headerContentPdfFix'
import { footerContent } from 'src/utils/footerContentPdf'
import moment from 'moment';


const salePdf = (row, title, tableBody, orderDetail, userDataPdf, uniquecode) => {
  const head = ['Sr.No.', 'Product', 'Batch', 'Total Quantity', 'Scanned Quantity']
  const doc = new jsPDF()

  const headerContent = () => {
    headerContentFix(doc, `${title}`)
    doc.setFontSize(10)
    doc.text(`Order No: ${row.order_no}`, 15, 30)
    doc.text(`Order Date:  ${moment(row.order_date).format('DD-MM-YYYY')}`, 15, 35)
    doc.text(`From: ${row.order_from_location.location_name}`, 15, 40)
    doc.text(`To: ${row.order_to_location.location_name}`, 15, 45)
    doc.text(`Status: ${row.status}`, 15, 50)
  }

  // Call before any table to ensure first page header
  headerContent()

  // Order Details Table
  autoTable(doc, {
    startY: 70,
    head: [head],
    body: tableBody,
    styles: { halign: 'center', cellWidth: 'auto', minCellWidth: 20 },
    headStyles: { fontSize: 8, fillColor: [80, 189, 160] },
    alternateRowStyles: { fillColor: [249, 250, 252] },
    tableLineColor: [80, 189, 160],
    tableLineWidth: 0.1,
    margin: { bottom: 20 },
    didDrawPage: function (data) {
      const pageCount = doc.internal.getNumberOfPages()
      footerContent(doc.internal.getCurrentPageInfo().pageNumber, pageCount, userDataPdf, doc)
    }
  })

  // Unique Codes Table
  if (row?.status === 'INVOICE_GENERATED' || row.status === 'GRN_GENERATED') {
    const codesBody = uniquecode?.codes.map((item, index) => [
      index + 1, item.product_name, item.batch_name, item.unique_code
    ]) || []

    if (codesBody.length > 0) {
      const startY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 70
      doc.setFontSize(12).setFont(undefined, 'bold')
      doc.text('Unique Codes Details', 14, startY)

      autoTable(doc, {
        startY: startY + 5,
        head: [['Sr.No.', 'Product', 'Batch', 'Unique code']],
        body: codesBody,
        styles: { halign: 'center', cellWidth: 'auto', minCellWidth: 20 },
        headStyles: { fontSize: 8, fillColor: [80, 189, 160] },
        alternateRowStyles: { fillColor: [249, 250, 252] },
        tableLineColor: [80, 189, 160],
        tableLineWidth: 0.1,
        margin: { bottom: 20 },
        didDrawPage: function () {
          const pageCount = doc.internal.getNumberOfPages()
          footerContent(doc.internal.getCurrentPageInfo().pageNumber, pageCount, userDataPdf, doc)
        }
      })
    }
  }

  // Missing Codes Table
  if (row.status === 'GRN_GENERATED') {
    const missingBody = uniquecode?.missingcode.map((item, index) => [
      index + 1, item.product_name, item.batch_name, item.unique_code
    ]) || []

    if (missingBody.length > 0) {
      const startY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 70
      doc.setFontSize(12).setFont(undefined, 'bold')
      doc.text('Missing Codes Details', 14, startY)

      autoTable(doc, {
        startY: startY + 5,
        head: [['Sr.No.', 'Product', 'Batch', 'Unique code']],
        body: missingBody,
        styles: { halign: 'center', cellWidth: 'auto', minCellWidth: 20 },
        headStyles: { fontSize: 8, fillColor: [80, 189, 160] },
        alternateRowStyles: { fillColor: [249, 250, 252] },
        tableLineColor: [80, 189, 160],
        tableLineWidth: 0.1,
        margin: { bottom: 20 },
        didDrawPage: function () {
          const pageCount = doc.internal.getNumberOfPages()
          footerContent(doc.internal.getCurrentPageInfo().pageNumber, pageCount, userDataPdf, doc)
        }
      })
    }
  }

  // Save PDF with timestamp
  const currentDate = new Date()
  const formattedDate = currentDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')
  const formattedTime = currentDate.toLocaleTimeString('en-US', { hour12: false }).replace(/:/g, '-')
  const fileName = `${row?.order_no}_${formattedDate}_${formattedTime}.pdf`

  doc.save(fileName)
}

export default salePdf
