import React, { useState, useEffect, useMemo } from 'react'
import {
  IconButton,
  TableCell,
  TableBody,
  TableHead,
  TableRow,
  
} from '@mui/material'
import ChevronUp from 'mdi-material-ui/ChevronUp'
import ChevronDown from 'mdi-material-ui/ChevronDown'
import CustomTable from 'src/components/CustomTable'
import PropTypes from 'prop-types'
import { statusObj } from 'src/configs/statusConfig'
import { getSortIcon } from 'src/utils/sortUtils'
import { getSerialNumber } from 'src/configs/generalConfig'
import { handleRowToggleHelper } from 'src/utils/rowUtils'
import StatusChip from 'src/components/StatusChip'
import moment from 'moment'
import { useAuth } from 'src/Context/AuthContext'
import { useSettings } from 'src/@core/hooks/useSettings'
import { useLoading } from 'src/@core/hooks/useLoading'
import { useRouter } from 'next/router'
import { api } from 'src/utils/Rest-API'
import { sortData } from 'src/utils/sortData'
import BatchAction from '../TableAction/BatchAction'
import BatchHistory from '../TableHistory/BatchHistory'
const Row = ({
  row,
  index,
  page,
  rowsPerPage,
  openRows,
  handleRowToggle,
  historyData,
  config,
  handleAuthCheck,
  handleUpdate,
  apiAccess,
  isBatchCloud
}) => {
  const isOpen = openRows[row.id];
  const serialNumber = getSerialNumber(index, page, rowsPerPage);

  return (
    <>
      <TableRow>
        <TableCell>
          <IconButton size="small" onClick={() => handleRowToggle(row.id)}>
            {isOpen ? <ChevronUp /> : <ChevronDown />}
          </IconButton>
        </TableCell>
        <TableCell align="center">{serialNumber}</TableCell>
        <TableCell align="center">{row.batch_no}</TableCell>
        <TableCell align="center">{row.product?.product_history[0]?.product_name}</TableCell>
        <TableCell align="center">{row.location?.history[0]?.location_name}</TableCell>
        <TableCell align="center">{moment(row.manufacturing_date).format('DD/MM/YYYY')}</TableCell>
        <TableCell align="center">{moment(row.expiry_date).format('DD/MM/YYYY')}</TableCell>
        <TableCell align="center">{row.qty}</TableCell>
        {config?.config?.esign_status && (
          <TableCell align="center">
            <StatusChip label={row.esign_status} color={statusObj[row.esign_status]?.color || 'default'} />
          </TableCell>
        )}
        <TableCell align="center">{moment(row?.updated_at).format('DD/MM/YYYY, hh:mm:ss a')}</TableCell>
        {isBatchCloud && (
          <TableCell align="center">{row.sent_to_cloud ? 'Completed' : 'Pending'}</TableCell>
        )}
        <BatchAction
          row={row}
          config={config}
          apiAccess={apiAccess}
          isBatchCloud={isBatchCloud}
          handleAuthCheck={handleAuthCheck}
          handleUpdate={handleUpdate}
        />
      </TableRow>
      {isOpen && (
        <BatchHistory historyData={historyData} row={row} config={config} />
      )}
    </>
  );
};

Row.propTypes = {
  row: PropTypes.any,
  index: PropTypes.any,
  page: PropTypes.any,
  rowsPerPage: PropTypes.any,
  openRows: PropTypes.any,
  handleRowToggle: PropTypes.any,
  historyData: PropTypes.any,
  config: PropTypes.any,
  handleAuthCheck: PropTypes.any,
  handleUpdate: PropTypes.any,
  apiAccess: PropTypes.any,
  isBatchCloud:PropTypes.any
}
const TableBatch = ({
  handleUpdate,
  handleAuthCheck,
  apiAccess,
  setBatch,
  config,
  isBatchCloud,
  filterProductVal,
  filterLocationVal,
  tableHeaderData,
  pendingAction
}) => {
  const [sortBy, setSortBy] = useState('')
  const router = useRouter()
  const [openRows, setOpenRows] = useState({})
  const [historyData, setHistoryData] = useState({})
  const [batchData, setBatchData] = useState({ data: [], total: 0 })
  const [page, setPage] = useState(1)
  const { settings } = useSettings()
  const { setIsLoading } = useLoading()
  const [rowsPerPage, setRowsPerPage] = useState(settings.rowsPerPage)
  const [sortDirection, setSortDirection] = useState('asc')
  const { removeAuthToken } = useAuth()

  const handleRowToggle = async rowId => {
    await handleRowToggleHelper(rowId, openRows, setOpenRows, setHistoryData, '/batch/history')
  }
  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

 

   const handleSort = (path) => {
   const newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
   const data = batchData?.data || [];
   const sortedData = sortData(data, path, newSortDirection);
    setBatchData(prev => ({ ...prev, data: sortedData }));
    setSortDirection(newSortDirection)
    setSortBy(path)
  }
  const getBatches = async () => {
    const paramsPage = page
    const paramsRows =  rowsPerPage
    const paramsEsignStatus =  tableHeaderData.esignStatus
    const paramsSearchVal = tableHeaderData.searchVal
    const paramsFilterLocationVal =  filterLocationVal
    const paramsFilterProductVal = filterProductVal
    try {
      const params = new URLSearchParams({
        page: paramsPage + 1,
        limit: paramsRows,
        search: paramsSearchVal,
        esign_status: paramsEsignStatus,
        locationName: paramsFilterLocationVal,
        productName: paramsFilterProductVal
      })
      setIsLoading(true)
      const res = await api(`/batch/?${params.toString()}`, {}, 'get', true)
      setIsLoading(false)
      if (res.data.success) {
        setBatchData({ data: res.data.data.batches, total: res.data.data.totalRecords })
        setBatch({ data: res.data.data.batches, index: res.data.data.offset })
      } else {
        console.log('Error to get all batches ', res.data)
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('Error in get batches ', error)
      setIsLoading(false)
    }
  }

  useMemo(() => {
    setPage(0)
  }, [tableHeaderData, rowsPerPage])

  useEffect(() => {
    getBatches()
    return () => {}
  }, [tableHeaderData, page, rowsPerPage, filterLocationVal, filterProductVal, setBatch, pendingAction])

  return (
    <CustomTable
      data={batchData?.data}
      totalRecords={batchData?.total}
      page={page}
      rowsPerPage={rowsPerPage}
      setPage={setPage}
      setRowsPerPage={setRowsPerPage}
      handleChangePage={handleChangePage}
      handleChangeRowsPerPage={handleChangeRowsPerPage}
    >
      <TableHead>
        <TableRow sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          <TableCell />
          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
            Sr.No.
          </TableCell>
          <TableCell
            align='center'
            sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
            style={{ cursor: 'pointer' }}
            onClick={() => handleSort('batch_no')}
          >
            Batch No.
            <IconButton align='center' aria-label='expand row' size='small'>
              {getSortIcon(sortBy, 'batch_no', sortDirection)}
            </IconButton>
          </TableCell>
          <TableCell
            align='center'
            sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
            style={{ cursor: 'pointer' }}
            onClick={() => handleSort('product.product_history[0].product_name')}
          >
            Product Name
            <IconButton align='center' aria-label='expand row' size='small'>
              {getSortIcon(sortBy, 'product.product_history[0].product_name', sortDirection)}
            </IconButton>
          </TableCell>
          <TableCell
            align='center'
            sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
            style={{ cursor: 'pointer' }}
            onClick={() => handleSort('location.history[0].location_name')}
          >
            Location Name
            <IconButton align='center' aria-label='expand row' size='small'>
              {getSortIcon(sortBy, 'location.history[0].location_name', sortDirection)}
            </IconButton>
          </TableCell>
          <TableCell
            align='center'
            sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
            style={{ cursor: 'pointer' }}
            onClick={() => handleSort('manufacturing_date')}
          >
            Manufacturing Date
            <IconButton align='center' aria-label='expand row' size='small'>
              {getSortIcon(sortBy, 'manufacturing_date', sortDirection)}
            </IconButton>
          </TableCell>
          <TableCell
            align='center'
            sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
            style={{ cursor: 'pointer' }}
            onClick={() => handleSort('expiry_date')}
          >
            Expiry Date
            <IconButton align='center' aria-label='expand row' size='small'>
              {getSortIcon(sortBy, 'expiry_date', sortDirection)}
            </IconButton>
          </TableCell>
          <TableCell
            align='center'
            sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
            style={{ cursor: 'pointer' }}
            onClick={() => handleSort('qty')}
          >
            Quantity
            <IconButton align='center' aria-label='expand row' size='small'>
              {getSortIcon(sortBy, 'qty', sortDirection)}
            </IconButton>
          </TableCell>
          {config?.config?.esign_status === true && <TableCell align='center'>E-Sign</TableCell>}
          <TableCell
            align='center'
            sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
            style={{ cursor: 'pointer' }}
            onClick={() => handleSort('updated_at')}
          >
            Updated At
            <IconButton align='center' aria-label='expand row' size='small'>
              {getSortIcon(sortBy, 'updated_at', sortDirection)}
            </IconButton>
          </TableCell>
          {isBatchCloud && (
            <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
              Status
            </TableCell>
          )}
          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
            Action
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {batchData?.data?.map((item, index) => (
          <Row
            key={item.id}
            row={item}
            index={index}
            page={page}
            rowsPerPage={rowsPerPage}
            openRows={openRows}
            handleRowToggle={handleRowToggle}
            historyData={historyData}
            config={config}
            handleAuthCheck={handleAuthCheck}
            handleUpdate={handleUpdate}
            filterProductVal={filterProductVal}
            apiAccess={apiAccess}
            isBatchCloud={isBatchCloud}
          />
        ))}
        {batchData?.data?.length === 0 && (
          <TableRow>
            <TableCell colSpan={12} align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
              No data
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </CustomTable>
  )
}
TableBatch.propTypes = {
  handleUpdate: PropTypes.any,
  handleAuthCheck: PropTypes.any,
  apiAccess: PropTypes.any,
  config: PropTypes.any,
  setBatch:PropTypes.any,
  pendingAction:PropTypes.any,
  isBatchCloud: PropTypes.any,
  filterProductVal: PropTypes.any,
  filterLocationVal: PropTypes.any,
  tableHeaderData: PropTypes.any
}
export default TableBatch
