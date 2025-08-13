import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { headerContentFix } from 'src/utils/headerContentPdfFix'
import { footerContent } from 'src/utils/footerContentPdf'

const downloadPdf = (tableData, tableHeaderData, tableBody, Data, userDataPdf) => {
  const head = tableData.tableHeader
  const doc = new jsPDF()

  const headerContent = () => {
    headerContentFix(doc, `${tableData.tableHeaderText}`)

    doc.setFontSize(10)
    if (tableHeaderData !== null) {
      doc.text('Search : ' + (tableHeaderData?.searchVal || '__'), 15, 25)
    }
    console.log(tableData.tableHeaderText, 'tableData.tableHeaderText')
    if (
      tableData.tableHeaderText !== 'Stock Summary' &&
      tableData.tableHeaderText !== 'Sale Order Detail' &&
      tableData.tableHeaderText !== 'Purchase Order Detail' &&
      tableData.tableHeaderText !== 'StockTransfer Order Detail'
    ) {
      doc.text('Filters :\n', 15, 30)
    }

    if (tableData.Filter[0] !== 'Stock_Summary') {
      doc.text(`${tableData.Filter[0]} : ` + (tableData.Filter[1] || '__'), 20, 35)
      let labelText = ''
      if (tableData.Filter[0] === 'department') {
        labelText = `Status : ${tableData?.statusFilter || '__'}`
      } else if (tableData.Filter[0] !== 'Order Type') {
        labelText = `E-Sign : ${tableHeaderData?.esignStatus || '__'}`
      }
      doc.text(labelText, 20, 40)
    } else if (tableData.Filter[0] == 'Stock_Summary') {
      doc.text(`Location Name : ` + (tableData.Filter[2] || '__'), 20, 35)
      doc.text(`Product Name : ` + (tableData.Filter[1] || '__'), 20, 40)
    } else if (tableHeaderData?.esignStatus) {
      doc.text('E-Sign : ' + (tableHeaderData?.esignStatus || '__'), 20, 35)
    }

    doc.setFontSize(12)
    doc.text(`${tableData.tableBodyText}`, 15, 55)
  }

  const bodyContent = () => {
    let currentPage = 1
    let dataIndex = 0
    const totalPages = Math.ceil(Data.length / 25)
    headerContent()

    while (dataIndex < Data.length) {
      if (currentPage > 1) {
        doc.addPage()
        headerContent() 
      }

      const body = tableBody.slice(dataIndex, dataIndex + 25)

      autoTable(doc, {
        startY: currentPage === 1 ? 60 : 50, // Ensure consistent spacing
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

  const currentDate = new Date()
  const formattedDate = currentDate
    .toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    .replace(/\//g, '-')
  const formattedTime = currentDate.toLocaleTimeString('en-US', { hour12: false }).replace(/:/g, '-')
  const fileName = `${tableData.filename}_${formattedDate}_${formattedTime}.pdf`
  doc.save(fileName)
}

export default downloadPdf
