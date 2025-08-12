import { useState, Fragment, useMemo, useLayoutEffect } from 'react'
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
import { api } from 'src/utils/Rest-API'
import { useAuth } from 'src/Context/AuthContext'
import { useRouter } from 'next/router'
import moment from 'moment'
import SnackbarAlert from 'src/components/SnackbarAlert'

const Row = ({ row, index ,locationId,locationName}) => {
          const { removeAuthToken ,getUserData} = useAuth()
             const router = useRouter()
           const [userDataPdf,setUserDataPdf]=useState()
             const [alertData, setAlertData] = useState({ openSnackbar: false, type: '', message: '', variant: 'filled' })
           

               useLayoutEffect(() => {
                 let data = getUserData()
                 setUserDataPdf(data)
                 return () => {}
               }, [])
             
   const tableData = useMemo(
          () => ({
              tableHeader: ['Sr.No.',  'Batch', 'MFG Date','Expire Date', 'Unique Code','Country Code'],
              tableHeaderText: `Stock Summary`,
              tableBodyText: `Stock Summary list`,
              filename: `Stock_Summary`
          }),
          []
      )
  
   
  
      const handleDownloadPdf = async(productName) => {
        try{
          const res= await api(`/stock-summary/getStockDataByProduct?productName=${encodeURIComponent(productName)}&locationId=${locationId}`,{}, 'get', true)
            if (res.data.success) {
              console.log(res.data.data)
              const tableData={
              tableHeader: ['Sr.No.',  'Batch', 'MFG Date','Expire Date', 'Unique Code','Country Code'],
              tableHeaderText: `Stock Summary`,
              tableBodyText: `Stock Summary list`,
              filename: `Stock_Summary`,
              filter
          }
                const tableBody = res.data.data.stockDetail?.map((item, index) => [
     index + 1,
    item.batch_no,
    item.manufacturing_date? moment(item.manufacturing_date).format('DD-MM-YYYY'):'NA',
    item.expiry_date? moment( item.expiry_date).format('DD-MM-YYYY'):'NA',
    item.unique_code,
    item.country_code
      ])
         if(tableBody.length>0)
         {
                  setAlertData({ ...alertData, type: 'success', message: 'Export Detail Successfully', openSnackbar: true })

           downloadPdf(tableData, null, tableBody, res.data.data.stockDetail, userDataPdf)
         }
         else{
                  setAlertData({ ...alertData, type: 'error', message: 'No unique Code', openSnackbar: true })
         }

      } else if (res.data.code === 401) {
        removeAuthToken()
        router.push('/401')
      } else {
        console.error('Failed to fetch data:', res.data)
      }
        }
        catch(error)
        {
          console.log('error while fetch unique code the product',error)
        }
          // downloadPdf(tableData, null, tableBody, stockSummaryData, null)
      }
      const closeSnackbar = () => {
    setAlertData({ ...alertData, openSnackbar: false })
  }
  
  return (
    <>
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
          {row.finalStock}
        </TableCell>

        <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} align='center' className='p-2'>
          <span>
            <Tooltip title='Export'>
              <IconButton data-testid={`auth-check-icon-${row.id}`} onClick={() =>handleDownloadPdf(row.product)}>
                <CiExport fontSize={20} />
              </IconButton>
            </Tooltip>
          </span>
        </TableCell>
      </TableRow>
            <SnackbarAlert alertData={alertData} closeSnackbar={closeSnackbar} openSnackbar={alertData.openSnackbar} />
      </>
  )
}
Row.propTypes = {
  row: PropTypes.any,
  index: PropTypes.any
}
const TableStockSummaryDetail = ({data,locationId,locationName}) => {
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
          {data?.map((item, index) => (
    <Row key={index + 1} row={item} index={index} locationId={locationId} locationName={locationName} />
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
  )
}
TableStockSummaryDetail.propTypes = {}
export default TableStockSummaryDetail
