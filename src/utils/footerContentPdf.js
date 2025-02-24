export const footerContent = (pageNumber, totalPages, userDataPdf, doc) => {
    const currentDate = new Date()
    const formattedDate = currentDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    })
    const formattedTime = currentDate.toLocaleTimeString('en-US', { hour12: false })
    const dateTimeString = 'Generated on: \n' + formattedDate + ' at ' + formattedTime
    const userInfo = 'User: ' + userDataPdf?.userName + '\nDepartment: ' + userDataPdf?.departmentName
    doc.setFontSize(10)
    doc.text(userInfo, 20, doc.internal.pageSize.height - 15)
    doc.text(dateTimeString, 160, doc.internal.pageSize.height - 15) // Adjust X coordinate as needed
    doc.text(
      `Page ${pageNumber} of ${totalPages}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    )
  }