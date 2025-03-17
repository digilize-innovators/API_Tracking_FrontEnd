import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { headerContentFix } from 'src/utils/headerContentPdfFix';
import { footerContent } from 'src/utils/footerContentPdf';


const downloadPdf = (tableData,tableHeaderData,tableBody,Data,userDataPdf) => {
     console.log("departFilter",tableData)
    console.log('clicked on download btn')
    const head=tableData.tableHeader
    const doc = new jsPDF()
    const headerContent = () => {
      headerContentFix(doc, `${tableData.tableHeaderText}`);

      if (tableHeaderData.searchVal) {
        doc.setFontSize(10)
        doc.text('Search : ' + `${tableHeaderData.searchVal}`, 15, 25)
      } else {
        doc.setFontSize(10)
        doc.text('Search : ' + '__', 15, 25)
      }
      doc.text("Filters :\n", 15, 30)
      
      
      if (tableData.departmentFilter=="") {
        if (tableData.departmentFilter) {
                doc.setFontSize(10)
                doc.text('Department : ' + `${tableData.departmentFilter}`, 20, 35)
              } else {
                doc.setFontSize(10)
                doc.text('Department : ' + '__', 20, 35)
              }
              if (tableHeaderData.eSignStatus) {
                doc.setFontSize(10)
                doc.text(`Status : ${tableHeaderData.eSignStatus ? 'enabled' : 'disabled'}`, 20, 40)
              } else {
                doc.setFontSize(10)
                doc.text('Status : ' + '__', 20, 40)
              }
      }
      else{
        if (tableHeaderData.esignStatus) {
          doc.setFontSize(10)
          doc.text('E-Sign : ' + `${tableHeaderData.esignStatus}`, 20, 35)
        } else {
          doc.setFontSize(10)
          doc.text('E-Sign : ' + '__', 20, 35)
        }
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
        }
        footerContent(currentPage, totalPages, userDataPdf, doc);

        const body = tableBody.slice(dataIndex, dataIndex + 25)

        autoTable(doc, {
          startY: currentPage === 1 ? 60 : 40,
          styles: { halign: 'center' },
          headStyles: {
            fontSize: 8,
            fillColor: [80, 189, 160],
          },
          alternateRowStyles: { fillColor: [249, 250, 252] },
          tableLineColor: [80, 189, 160],
          tableLineWidth: 0.1,
          head: [head],
          body: body,
          columnWidth: 'wrap'
        })
        dataIndex += 25
        currentPage++
      }
    }

    bodyContent()
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
    const formattedTime = currentDate.toLocaleTimeString('en-US', { hour12: false }).replace(/:/g, '-');
    const fileName = `${tableData.filename}_${formattedDate}_${formattedTime}.pdf`;
    doc.save(fileName);
  }
  export default downloadPdf