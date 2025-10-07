import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Box, Table, TableBody, TableRow, TableHead, TableCell, IconButton, Tooltip } from '@mui/material'
import CustomTable from 'src/components/CustomTable'
import { getSortIcon } from 'src/utils/sortUtils'
import { useSettings } from 'src/@core/hooks/useSettings'
import { CiExport } from 'react-icons/ci'
import { useLoading } from 'src/@core/hooks/useLoading'
import { api } from 'src/utils/Rest-API'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { headerContentFix } from 'src/utils/headerContentPdfFix'
import { footerContent } from 'src/utils/footerContentPdf'
import { useAuth } from 'src/Context/AuthContext'
import { sortData } from 'src/utils/sortData'
import { FiDownload } from 'react-icons/fi';


const Row = ({ row, index, page, rowsPerPage, orderDetail, userDataPdf, setAlertData, endpoint }) => {
  const { setIsLoading } = useLoading()
  const { removeAuthToken } = useAuth()

const downloadPdf = data => {
  const doc = new jsPDF()

  const headerContent = () => {
    headerContentFix(doc, 'Scanned Detail')
    doc.setFontSize(10)
    doc.text('Order No : ' + (orderDetail?.order_no || '__'), 15, 25)
    doc.text('Product Name  : ' + (row?.common_name || '__'), 15, 30)
    doc.text('Batch No. : ' + (row?.batch_no || '__'), 15, 35)
  }

  const addTableSection = (title, items, startIndex, startY) => {
    const codes = items?.map((item, index) => [startIndex + index, item])

    // Print section title
    if (startIndex <= 1) {
      doc.setFontSize(12)
      doc.text(title, 15, startY - 5)
    }

    autoTable(doc, {
      startY: startY,
      styles: { halign: 'center' },
      headStyles: { fontSize: 8, fillColor: [80, 189, 160] },
      alternateRowStyles: { fillColor: [249, 250, 252] },
      tableLineColor: [80, 189, 160],
      tableLineWidth: 0.1,
      head: [['Sr.No.', 'Unique Code']],
      body: codes,
      margin: { bottom: 20 }
    })

    return doc.lastAutoTable.finalY + 10 // return next Y position with spacing
  }

  const bodyContent = () => {
    headerContent()

    const totalPagesGetter = () => doc.internal.getNumberOfPages()

    let serialNumber = 1
    let startY = 60

    // ---- Unique Codes Section ----
    if (data?.outwardcode?.length > 0) {
      startY = addTableSection('Outward codes', data.outwardcode, serialNumber, startY)
      serialNumber += data.outwardcode.length
      startY += 10 
    }
     if (data?.inwardcode?.length > 0) {
      startY = addTableSection('Inward codes', data.inwardcode, 1, startY)
      serialNumber += data.inwardcode.length
      startY += 10 
    }

     if (data?.uniqueCode?.length > 0) {
      startY = addTableSection('Unique codes', data.uniqueCode, 1, startY)
      serialNumber += data.uniqueCode.length
      startY += 10 
    }


    // ---- Missing Codes Section ----
    if (data?.missingcode && data.missingcode.length > 0) {
      startY = addTableSection('Missing codes', data.missingcode, 1, startY)
    }

    // ---- FOOTER ONCE PER PAGE ----
    const totalPages = totalPagesGetter()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      footerContent(i, totalPages, userDataPdf, doc)
    }
  }

  bodyContent()

  // ---- FILE NAME ----
  const currentDate = new Date()
  const formattedDate = currentDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).replace(/\//g, '-')

  const formattedTime = currentDate.toLocaleTimeString('en-US', {
    hour12: false
  }).replace(/:/g, '-')

  const fileName = `Scanned_Detail_${formattedDate}_${formattedTime}.pdf`
  doc.save(fileName)
}


  const getUniqueCode = async row => {
    try {
      let query = `${endpoint}scanned-codes/${orderDetail.id}/${row.batch_id}`
      setIsLoading(true)
      const res = await api(query, {}, 'get', true)
      setIsLoading(false)
      if (res.data.success ) {
        downloadPdf(res.data.data)
        setAlertData({ openSnackbar: true, type: 'success', message: 'Code Export Successfully', variant: 'filled' })

      }  else {
        setAlertData({ openSnackbar: true, type: 'error', message: 'Something went wrong', variant: 'filled' })
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('Error in get scanned code ', error)
      setIsLoading(false)
    }
  }

  return (
    <TableRow sx={{ '& > *': { borderBottom: '1px solid rgba(224, 224, 224, 1)' } }}>
      <TableCell
        align='center'
        component='th'
        scope='row'
        className='p-2'
        sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
      >
        {index + 1 + page * rowsPerPage}
      </TableCell>

      <TableCell align='center' className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
        {row?.common_name}
      </TableCell>
      <TableCell align='center' className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
        {row?.batch_no}
      </TableCell>

      <TableCell align='center' className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
        {row?.qty}
      </TableCell>
      <TableCell align='center' className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
        {/* {row.} */} {row.scanned_qty}
      </TableCell>
      <TableCell align='center' className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
        <span>
          <Tooltip title={row.scanned_qty<=0 ? 'No access' : 'Export'}>
            <IconButton data-testid={`auth-check-icon-${row.id}`} color={ 'default'}>
              <FiDownload 
                fontSize={20}
                onClick={row.scanned_qty>0 ? () => getUniqueCode(row) : null}
                style={{
                  cursor: row.scanned_qty>0 ? 'pointer' : 'not-allowed',
                  opacity: row.scanned_qty>0 ? 1 : 0.3
                }}
              />
            </IconButton>
          </Tooltip>
        </span>
      </TableCell>
    </TableRow>
  )
}
Row.propTypes = {
  row: PropTypes.any,
  index: PropTypes.any,
  page: PropTypes.any,
  rowsPerPage: PropTypes.any,
  orderDetail: PropTypes.any,
  userDataPdf: PropTypes.any,
  setAlertData: PropTypes.any,
  endpoint: PropTypes.string.isRequired
}

const TableOrderDetails = ({
  transactionsDetail,
  setOrderDetail,
  orderDetail,
  userDataPdf,
  setAlertData,
  endpoint
}) => {
  const [sortBy, setSortBy] = useState('')
  const [page, setPage] = useState(0)
  const { settings } = useSettings()
  const [rowsPerPage, setRowsPerPage] = useState(settings.rowsPerPage)
  const [data, setData] = useState([])
  const [sortDirection, setSortDirection] = useState('asc')

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }
  useEffect(() => {
    setData(transactionsDetail?.orders)
    setOrderDetail(transactionsDetail?.orders?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage))
  }, [transactionsDetail, page, rowsPerPage])

  const handleSort = path => {
    const newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc'
    const sortedData = sortData(data, path, newSortDirection)
    setData(sortedData)
    setSortDirection(newSortDirection)
    setSortBy(path)
  }

  return (
    <CustomTable
      data={data}
      page={page}
      rowsPerPage={rowsPerPage}
      totalRecords={transactionsDetail?.orders?.length}
      handleChangePage={handleChangePage}
      handleChangeRowsPerPage={handleChangeRowsPerPage}
    >
      <Box sx={{ position: 'relative', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', width: '100%' }}>
        <Table stickyHeader sx={{ width: '100%' }}>
          <TableHead style={{ backgroundColor: '#fff', height: '60px' }}>
            <TableRow sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                Sr.No.
              </TableCell>
              <TableCell
                align='center'
                sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
                style={{ cursor: 'pointer' }}
                onClick={() => handleSort('common_name')}
              >
                Product
                <IconButton align='center' aria-label='expand row' size='small'>
                  {getSortIcon(sortBy, 'common_name', sortDirection)}
                </IconButton>
              </TableCell>
              <TableCell
                align='center'
                sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
                style={{ cursor: 'pointer' }}
                onClick={() => handleSort('batch_no')}
              >
                Batch
                <IconButton align='center' aria-label='expand row' size='small'>
                  {getSortIcon(sortBy, 'batch_no', sortDirection)}
                </IconButton>
              </TableCell>
              <TableCell
                align='center'
                sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
                style={{ cursor: 'pointer' }}
                onClick={() => handleSort('qty')}
              >
                Total Quantity
                <IconButton align='center' aria-label='expand row' size='small'>
                  {getSortIcon(sortBy, 'qty', sortDirection)}
                </IconButton>
              </TableCell>
              <TableCell
                align='center'
                sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
                style={{ cursor: 'pointer' }}
                onClick={() => handleSort('port')}
              >
                Scanned Quantity
                <IconButton align='center' aria-label='expand row' size='small'>
                  {getSortIcon(sortBy, 'port', sortDirection)}
                </IconButton>
              </TableCell>
              <TableCell
                align='center'
                sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
                style={{ cursor: 'pointer' }}
              >
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item, index) => (
              <Row
                key={item.id}
                orderDetail={orderDetail}
                userDataPdf={userDataPdf}
                row={item}
                index={index}
                page={page}
                rowsPerPage={rowsPerPage}
                setAlertData={setAlertData}
                endpoint={endpoint}
              />
            ))}
            {data?.length === 0 && (
              <TableRow sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                <TableCell colSpan={12} align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                  No data
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
    </CustomTable>
  )
}

TableOrderDetails.propTypes = {
  transactionsDetail: PropTypes.any,
  setOrderDetail: PropTypes.any,
  orderDetail: PropTypes.any,
  userDataPdf: PropTypes.object.isRequired,
  setAlertData: PropTypes.func.isRequired,
  endpoint: PropTypes.string.isRequired
}
export default TableOrderDetails
