import { useState, Fragment } from 'react'
import { Box, Table, Collapse, TableRow, TableHead, TableBody, TableCell, Typography, Tooltip } from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import StopIcon from '@mui/icons-material/Stop'
import IconButton from '@mui/material/IconButton'
import ChevronUp from 'mdi-material-ui/ChevronUp'
import ChevronDown from 'mdi-material-ui/ChevronDown'
import PropTypes from 'prop-types'
import { CiExport } from 'react-icons/ci'

const Row = ({ row, index }) => {
  const [isopen, setIsopen] = useState(false)

  const handleProductDetail = row => {
    setIsopen(true)
  }
  const handleProductClose = row => {
    setIsopen(false)
  }
  const ExportProduct = row => {
    console.log(row)
  }
  return (
    <Fragment>
      <TableRow sx={{ '& > *': { borderBottom: '1px solid rgba(224, 224, 224, 1)' } }}>
        <TableCell className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          <IconButton align='center' aria-label='expand row' size='small'>
            {isopen ? <ChevronUp /> : <ChevronDown />}
          </IconButton>
        </TableCell>
        <TableCell
          align='center'
          component='th'
          scope='row'
          className='p-2'
          sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
        >
          {index + 1}
        </TableCell>
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          {row.product}
        </TableCell>

        <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} align='center' className='p-2'>
          <span>
            <Tooltip title='Play'>
              <IconButton data-testid={`auth-check-icon-${row.id}`} onClick={() => handleProductDetail(row)}>
                <PlayArrowIcon />
              </IconButton>
            </Tooltip>
          </span>
          <span>
            <Tooltip title='Pause'>
              <IconButton data-testid={`auth-check-icon-${row.id}`} onClick={() => handleProductClose(row)}>
                <StopIcon />
              </IconButton>
            </Tooltip>
          </span>
          <span>
            <Tooltip title='Export'>
              <IconButton data-testid={`auth-check-icon-${row.id}`} onClick={() => ExportProduct(row)}>
                <CiExport fontSize={20} />
              </IconButton>
            </Tooltip>
          </span>
        </TableCell>
      </TableRow>
      {isopen && (
        <TableRow sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          <TableCell colSpan={12} sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
            <Collapse in={isopen} timeout='auto' unmountOnExit>
              <Box sx={{ mx: 2 }}>
                <Typography variant='h6' gutterBottom component='div'>
                  Stock Reconciliation for {row.product}
                </Typography>
                <Box style={{ display: 'flex', justifyContent: 'center' }}>
                  <Table size='small' aria-label='purchases'>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          align='center'
                          sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)', fontSize: '10px' }}
                        >
                          Sr.No.
                        </TableCell>
                        <TableCell
                          align='center'
                          sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)', fontSize: '8px' }}
                        >
                          Batch
                        </TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                          Quantity
                        </TableCell>
                      </TableRow>
                    </TableHead>
                  </Table>
                </Box>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </Fragment>
  )
}
Row.propTypes = {
  row: PropTypes.any,
  index: PropTypes.any
}
const TableStockReconcilDetail = () => {
  const StockReconciliation = [
    {
      product: 'product1'
    },
    {
      product: 'product2'
    }
  ]
  return (
    <Box sx={{ position: 'relative', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
      <Table stickyHeader sx={{ width: '100%' }}>
        <TableHead style={{ backgroundColor: '#fff', height: '60px' }}>
          <TableRow sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
            <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} />
            <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
              Sr.No.
            </TableCell>
            <TableCell
              align='center'
              sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
              style={{ cursor: 'pointer' }}
              onClick={() => handleSort('designation_id')}
            >
              Product
             
            </TableCell>
            <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
              Action
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {StockReconciliation?.map((item, index) => (
            <Row key={index + 1} row={item} index={index} />
          ))}
          {StockReconciliation?.length === 0 && (
            <TableRow sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
              <TableCell colSpan={12} align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                No data
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  )
}
TableStockReconcilDetail.propTypes = {}
export default TableStockReconcilDetail
