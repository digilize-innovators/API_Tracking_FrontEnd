import { useState, Fragment, useMemo } from 'react'
import { Box, Table, Collapse, TableRow, TableHead, TableBody, TableCell, Typography, Tooltip } from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import StopIcon from '@mui/icons-material/Stop'
import IconButton from '@mui/material/IconButton'
import ChevronUp from 'mdi-material-ui/ChevronUp'
import ChevronDown from 'mdi-material-ui/ChevronDown'
import PropTypes from 'prop-types'
import { CiExport } from 'react-icons/ci'
import TableStockSummary from './TableStockSummary'
import downloadPdf from 'src/utils/DownloadPdf'

const Row = ({ row, index }) => {
  const [isopen, setIsopen] = useState(false)

  const handleProductDetail = row => {
    setIsopen(true)
  }
  const handleProductClose = row => {
    setIsopen(false)
  }
  const stockSummaryData = [
  {
    srNo: 1,
    product: "Paracetamol 500mg",
    batch: "BCH001",
    mfgDate: "2025-01-10",
    expireDate: "2027-01-09",
    uniqueCode: "PC500-BCH001-0001",
    countryCode: "IN"
  },
  {
    srNo: 2,
    product: "Amoxicillin 250mg",
    batch: "BCH002",
    mfgDate: "2025-02-15",
    expireDate: "2027-02-14",
    uniqueCode: "AM250-BCH002-0002",
    countryCode: "US"
  },
  {
    srNo: 3,
    product: "Cough Syrup 100ml",
    batch: "BCH003",
    mfgDate: "2025-03-01",
    expireDate: "2026-03-01",
    uniqueCode: "CS100-BCH003-0003",
    countryCode: "UK"
  },
  {
    srNo: 4,
    product: "Vitamin C 1000mg",
    batch: "BCH004",
    mfgDate: "2025-04-10",
    expireDate: "2027-04-09",
    uniqueCode: "VC1000-BCH004-0004",
    countryCode: "AU"
  },
  {
    srNo: 5,
    product: "Ibuprofen 400mg",
    batch: "BCH005",
    mfgDate: "2025-05-05",
    expireDate: "2026-11-04",
    uniqueCode: "IB400-BCH005-0005",
    countryCode: "CA"
  },
  {
    srNo: 6,
    product: "Azithromycin 500mg",
    batch: "BCH006",
    mfgDate: "2025-06-20",
    expireDate: "2027-06-19",
    uniqueCode: "AZ500-BCH006-0006",
    countryCode: "IN"
  },
  {
    srNo: 7,
    product: "Loratadine 10mg",
    batch: "BCH007",
    mfgDate: "2025-07-01",
    expireDate: "2026-07-01",
    uniqueCode: "LR10-BCH007-0007",
    countryCode: "ZA"
  },
  {
    srNo: 8,
    product: "Metformin 850mg",
    batch: "BCH008",
    mfgDate: "2025-08-15",
    expireDate: "2027-08-14",
    uniqueCode: "MF850-BCH008-0008",
    countryCode: "SG"
  },
  {
    srNo: 9,
    product: "Cetirizine 10mg",
    batch: "BCH009",
    mfgDate: "2025-09-30",
    expireDate: "2027-09-29",
    uniqueCode: "CT10-BCH009-0009",
    countryCode: "DE"
  },
  {
    srNo: 10,
    product: "Omeprazole 20mg",
    batch: "BCH010",
    mfgDate: "2025-10-10",
    expireDate: "2027-10-09",
    uniqueCode: "OM20-BCH010-0010",
    countryCode: "FR"
  }
];

   const tableData = useMemo(
          () => ({
              tableHeader: ['Sr.No.', 'Product', 'Batch', 'MFG Date','Expire Date', 'Unique Code','Country Code'],
              tableHeaderText: `Stock Summary`,
              tableBodyText: `Stock Summary list`,
              filename: `Stock_Summary`
          }),
          []
      )
  
      const tableBody = stockSummaryData?.map((item, index) => [
          index + 1,
           item.product,
    item.batch,
    item.mfgDate,
    item.expireDate,
     item.uniqueCode,
    item.countryCode
      ])
  
      const handleDownloadPdf = () => {
          downloadPdf(tableData, null, tableBody, stockSummaryData, null)
      }
  
  return (
    <Fragment>
      <TableRow sx={{ '& > *': { borderBottom: '1px solid rgba(224, 224, 224, 1)' } }}>
      
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
         <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          {row.qty}
        </TableCell>

        <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} align='center' className='p-2'>
          <span>
            <Tooltip title='Export'>
              <IconButton data-testid={`auth-check-icon-${row.id}`} onClick={() =>handleDownloadPdf()}>
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
const TableStockSummaryDetail = () => {
  const AhmedabadLocation = [
    {
      product: 'product1',
      qty:500
    },
    {
      product: 'product2',
      qty:1000
    }
  ]
  return (
    <Box sx={{ position: 'relative', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
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
              onClick={() => handleSort('designation_id')}
            >
              Product
             
            </TableCell>
              <TableCell
              align='center'
              sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
              style={{ cursor: 'pointer' }}
              onClick={() => handleSort('designation_id')}
            >
              Quantity
             
            </TableCell>
            <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
              Action
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {AhmedabadLocation?.map((item, index) => (
            <Row key={index + 1} row={item} index={index} />
          ))}
          {AhmedabadLocation?.length === 0 && (
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
TableStockSummaryDetail.propTypes = {}
export default TableStockSummaryDetail
