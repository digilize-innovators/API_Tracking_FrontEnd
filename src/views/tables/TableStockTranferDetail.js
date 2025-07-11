



import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import {Box,Table,TableBody,TableRow,TableHead,TableCell,IconButton, Tooltip} from '@mui/material'
import CustomTable from 'src/components/CustomTable'
import { getSortIcon } from 'src/utils/sortUtils'
import { useSettings } from 'src/@core/hooks/useSettings'
import { CiExport } from 'react-icons/ci'
const Row = ({
  row,
  index,
  page,
  rowsPerPage,
  
}) => {
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
             {row.product_name}
           </TableCell>
           <TableCell align='center' className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
             {row.batch_no}
           </TableCell>
           
           <TableCell align='center' className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
             {row.qty}
           </TableCell>
           <TableCell align='center' className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
             0
           </TableCell>
           <TableCell align='center' className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                     <span>
                                 
                                 <Tooltip title="Export">
                     <IconButton data-testid={`auth-check-icon-${row.id}`}>
                                           <CiExport fontSize={20} />
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

}
const TableStockTranferDetail = ({
    stocktransferDetail,
    setOrderDetail
}) => {

  const [sortBy, setSortBy] = useState('')
  const [page, setPage] = useState(0)
  const { settings } = useSettings()
  const [rowsPerPage, setRowsPerPage] = useState(settings.rowsPerPage)
  const [data,setData] = useState([])
  const [sortDirection,setSortDirection] = useState('asc')
  

   useEffect(()=>{
     setData(stocktransferDetail)
     setOrderDetail(stocktransferDetail.slice(page*rowsPerPage,page*rowsPerPage+rowsPerPage))
   },[stocktransferDetail,page,rowsPerPage])
   
  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }
      
  const handleSort = (key,child) => {
    const newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc'
    const sorted = [...data].sort((a, b) => {
        if(!child){
            if (a[key] > b[key]) {
            return newSortDirection === 'asc' ? 1 : -1
          }

          if (a[key] < b[key]) {
            return newSortDirection === 'asc' ? -1 : 1
          }
          return 0
        }
        else{
            if (a[key][child] > b[key][child]) {
                return newSortDirection === 'asc' ? 1 : -1
              }
    
              if (a[key][child] < b[key][child]) {
                return newSortDirection === 'asc' ? -1 : 1
              }
              return 0
        }
    })
    setData(sorted)

    setSortDirection(newSortDirection)
    setSortBy(key)
  }
  


  return (
    <CustomTable
      data={data}
      page={page}
      rowsPerPage={rowsPerPage}
      totalRecords={data.length}
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
                onClick={() => handleSort('product_name')}
              >
            Product
                <IconButton align='center' aria-label='expand row' size='small'>
                  {getSortIcon(sortBy, 'product_name', sortDirection)}
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
            {data.slice(page*rowsPerPage,page*rowsPerPage+rowsPerPage)?.map((item, index) => (
              <Row
                key={index}
                row={item}
                index={index}
                page={page}
                rowsPerPage={rowsPerPage}
              />
            ))}
            {data.slice(page*rowsPerPage,page*rowsPerPage+rowsPerPage)?.length === 0 && (
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
TableStockTranferDetail.propTypes = {
  orderId:PropTypes.any,
  stocktransferDetail:PropTypes.any,
  setOrderDetail:PropTypes.any
  
}
export default TableStockTranferDetail
 