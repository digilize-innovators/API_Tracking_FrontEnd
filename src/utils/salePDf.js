import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { headerContentFix } from 'src/utils/headerContentPdfFix'
import { footerContent } from 'src/utils/footerContentPdf'

const salePdf = (row, title, tableBody, orderDetail, userDataPdf,uniquecode) => {
  const head =  ['Sr.No.', 'Product', 'Batch', 'Total Quantity', 'Scanned Quantity']
  const doc = new jsPDF()

  const headerContent = () => {
    headerContentFix(doc, `${title}`)

    doc.setFontSize(10)

    doc.text(`Order No:${row.order_no}`, 15, 30)
   doc.text(`Order Date:${row.order_no}`, 15, 35)
  doc.text(`From:${row.order_from_location.location_name}`, 15, 40)
  doc.text(`To:${row.order_to_location.location_name}`, 15, 45)
  doc.text(`Status:${row.status}`, 15, 50)




    
  }
let currentPage = 1
  const bodyContent = () => {
    
    let dataIndex = 0
    const totalPages = Math.ceil(orderDetail.length / 25)
    headerContent()

    while (dataIndex < orderDetail.length) {
      if (currentPage > 1) {
        doc.addPage()
        headerContent() 
      }

      const body = tableBody.slice(dataIndex, dataIndex + 25)
       doc.setFontSize(12).setFont(undefined, 'bold');
  doc.text('Order Details', 15, 65);

      autoTable(doc, {
        startY: currentPage === 1 ? 70 : 50, // Ensure consistent spacing
        styles: {
          halign: 'center',
          cellWidth: 'auto', // Let widths adjust automatically
          minCellWidth: 20
        },
        headStyles: { fontSize: 8, fillColor: [80, 189, 160] },
        alternateRowStyles: { fillColor: [249, 250, 252] },
        tableLineColor: [80, 189, 160],
        tableLineWidth: 0.1,
        head: [head],
        body: body,
        columnWidth: 'wrap',
        margin: { bottom: 20 }, // Add margin to prevent footer overlap
        didDrawPage: function () {
          footerContent(currentPage, totalPages, userDataPdf, doc)
        }
      })

      dataIndex += 25
      currentPage++
    }
  }
  

  

  bodyContent()
  if (row?.status === 'INVOICE_GENERATED') {
        const totalPages = Math.ceil(uniquecode.length / 25)
       const header= uniquecode?.map((item, index) => [
        index + 1,
        item.product_name,
        item.batch_name,
        item.unique_code
       
    ])
  headerContent()

  const startY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 20;

  doc.setFontSize(12).setFont(undefined, 'bold');
  doc.text('Unique Codes Details', 14, startY);

  autoTable(doc, {
    startY: startY + 5,
    head: [['Sr.No.', 'Product', 'Batch', 'Unique code']],
    body:header, // Provide the data for codes here
    styles: { halign: 'center', cellWidth: 'auto', minCellWidth: 20 },
    headStyles: { fontSize: 8, fillColor: [80, 189, 160] },
    alternateRowStyles: { fillColor: [249, 250, 252] },
    tableLineColor: [80, 189, 160],
    tableLineWidth: 0.1,
    margin: { bottom: 20 },
   didDrawPage: function () {
          footerContent(currentPage, totalPages, userDataPdf, doc)
        },
  });
}

  const currentDate = new Date()
  const formattedDate = currentDate
    .toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    .replace(/\//g, '-')
  const formattedTime = currentDate.toLocaleTimeString('en-US', { hour12: false }).replace(/:/g, '-')
  const fileName = `${row?.order_no}_${formattedDate}_${formattedTime}.pdf`
  doc.save(fileName)
}

export default salePdf 
