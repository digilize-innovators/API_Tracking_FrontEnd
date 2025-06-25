import React, { useState, Fragment, useEffect, useMemo } from 'react'
import {
  Tooltip,
  Typography,
  IconButton,
  TableCell,
  TableBody,
  TableHead,
  TableRow,
  Collapse,
  Table,
  Box
} from '@mui/material'
import { MdModeEdit, MdOutlineDomainVerification, MdOutlineCloudUpload } from 'react-icons/md'
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
import { isNumber } from '@mui/x-data-grid/internals'

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
  const isOpen = openRows[row.id]
  const serialNumber = getSerialNumber(index, page, rowsPerPage)
  return (
    <Fragment>
      <TableRow sx={{ '& > *': { borderBottom: '1px solid rgba(224, 224, 224, 1)' } }}>
        <TableCell className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          <IconButton align='center' aria-label='expand row' size='small' onClick={() => handleRowToggle(row.id)}>
            {isOpen ? <ChevronUp /> : <ChevronDown />}
          </IconButton>
        </TableCell>
        <TableCell
          align='center'
          component='th'
          scope='row'
          className='p-2'
          sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
        >
          {serialNumber}
        </TableCell>
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          {row.batch_no}
        </TableCell>
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          {row.product.product_history[0].product_name}
        </TableCell>
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          {row.location.history[0].location_name}
        </TableCell>

        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          {moment(row.manufacturing_date).format('DD/MM/YYYY')}
        </TableCell>
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          {moment(row.expiry_date).format('DD/MM/YYYY')}
        </TableCell>

        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          {row.qty}
        </TableCell>
        {config?.config?.esign_status === true && (
          <StatusChip label={row.esign_status} color={statusObj[row.esign_status]?.color || 'default'} />
        )}
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          {moment(row?.updated_at).format('DD/MM/YYYY, hh:mm:ss a')}
        </TableCell>
        {isBatchCloud && (
          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
            {row.sent_to_cloud ? 'Completed' : 'Pending'}
          </TableCell>
        )}
        {row.esign_status === 'pending' && config?.config?.esign_status === true && !isBatchCloud ? (
          <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} align='center' className='p-2'>
            <span>
              <MdOutlineDomainVerification fontSize={20} onClick={() => handleAuthCheck(row)} />
            </span>
          </TableCell>
        ) : (
          <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} align='center' className='p-2'>
            {isBatchCloud ? (
              <Tooltip>
                <span>
                  <MdOutlineCloudUpload
                    fontSize={20}
                    onClick={() =>
                      !row?.sent_to_cloud && row.esign_status === 'approved' && row.isBatchEnd === true
                        ? handleUpdate(row)
                        : ''
                    }
                    style={{
                      cursor:
                        !row?.sent_to_cloud && row.esign_status === 'approved' && row.isBatchEnd === true
                          ? 'pointer'
                          : 'not-allowed',
                      opacity:
                        !row?.sent_to_cloud && row.esign_status === 'approved' && row.isBatchEnd === true ? 1 : 0.5
                    }}
                  />
                </span>
              </Tooltip>
            ) : (
              <Tooltip
                title={
                  !apiAccess.editApiAccess || row.isBatchEnd
                    ? `${row.isBatchEnd ? 'Can not edit batch due to mark end-batch' : 'No edit access'}`
                    : ''
                }
              >
                <span>
                  <MdModeEdit
                    fontSize={20}
                    onClick={apiAccess.editApiAccess && !row.isBatchEnd ? () => handleUpdate(row) : null}
                    style={{
                      cursor: apiAccess.editApiAccess ? 'pointer' : 'not-allowed',
                      opacity: apiAccess.editApiAccess ? 1 : 0.5
                    }}
                  />
                </span>
              </Tooltip>
            )}
          </TableCell>
        )}
      </TableRow>
      {isOpen && (
        <TableRow sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          <TableCell colSpan={12} sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
            <Collapse in={isOpen} timeout='auto' unmountOnExit>
              <Box sx={{ mx: 2 }}>
                <Typography variant='h6' gutterBottom component='div'>
                  History
                </Typography>
                <Box style={{ display: 'flex', justifyContent: 'center' }}>
                  <Table size='small' aria-label='purchases'>
                    <TableHead>
                      <TableRow>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                          Sr.No.
                        </TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                          Batch No.
                        </TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                          Product Name
                        </TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                          Location Name
                        </TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                          Manufacturing Date
                        </TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                          Expiry Date
                        </TableCell>

                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                          Quantity
                        </TableCell>
                        {config?.config?.esign_status === true && (
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                            E-Sign
                          </TableCell>
                        )}
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                          Created At
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {historyData[row.id]?.map((historyRow, idx) => (
                        <TableRow
                          key={historyRow.created_at}
                          align='center'
                          sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
                        >
                          <TableCell
                            component='th'
                            scope='row'
                            align='center'
                            sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
                          >
                            {idx + 1}
                          </TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                            {historyRow.batch_no}
                          </TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                            {historyRow.product.product_history[0].product_name}
                          </TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                            {historyRow.location.history[0].location_name}
                          </TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                            {moment(historyRow.manufacturing_date).format('DD/MM/YYYY')}
                          </TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                            {moment(historyRow.expiry_date).format('DD/MM/YYYY')}
                          </TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                            {historyRow.qty}
                          </TableCell>
                          {config?.config?.esign_status === true && (
                            <StatusChip
                              label={historyRow.esign_status}
                              color={statusObj[historyRow.esign_status]?.color || 'default'}
                            />
                          )}
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                            {moment(historyRow?.created_at).format('DD/MM/YYYY, hh:mm:ss a')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
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
  index: PropTypes.any,
  page: PropTypes.any,
  rowsPerPage: PropTypes.any,
  openRows: PropTypes.any,
  handleRowToggle: PropTypes.any,
  historyData: PropTypes.any,
  config: PropTypes.any,
  handleAuthCheck: PropTypes.any,
  handleUpdate: PropTypes.any,
  apiAccess: PropTypes.any
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

  const getValueByPath = (obj, path) => {
    return path.split('.').reduce((acc, part) => {
      const match = part.match(/^(\w+)\[(\d+)\]$/)
      if (match) {
        const [, arrayKey, index] = match
        return acc?.[arrayKey]?.[parseInt(index, 10)]
      }
      return acc?.[part]
    }, obj)
  }

  const handleSort = path => {
    const newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc'
    const data = batchData?.data || []

    const sorted = [...data].sort((a, b) => {
      if (path == 'updated_at') {
        const dateA = new Date(a.updated_at)
        const dateB = new Date(b.updated_at)
        return newSortDirection === 'asc' ? dateA - dateB : dateB - dateA
      }
      const aValue = getValueByPath(a, path)
      const bValue = getValueByPath(b, path)
      const isNumeric = !isNaN(aValue) && !isNaN(bValue)

      if (isNumeric) {
        return newSortDirection === 'asc' ? Number(aValue) - Number(bValue) : Number(bValue) - Number(aValue)
      }
      if (aValue.toLowerCase() > bValue.toLowerCase()) return newSortDirection === 'asc' ? 1 : -1
      if (aValue.toLowerCase() < bValue.toLowerCase()) return newSortDirection === 'asc' ? -1 : 1
      return 0
    })

    setBatchData({ ...batchData, data: sorted })
    setSortDirection(newSortDirection)
    setSortBy(path)
  }
  const getBatches = async (pageNumber, rowsNumber, status, search, filterLocation) => {
    const paramsPage = pageNumber || page
    const paramsRows = rowsNumber || rowsPerPage
    const paramsEsignStatus = status === '' ? status : tableHeaderData.esignStatus
    const paramsSearchVal = search === '' ? search : tableHeaderData.searchVal
    const paramsFilterLocationVal = filterLocation === '' ? filterLocation : filterLocationVal
    const paramsFilterProductVal = filterProductVal === '' ? filterProductVal : filterProductVal
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
  isBatchCloud: PropTypes.any,
  filterProductVal: PropTypes.any,
  filterLocationVal: PropTypes.any,
  tableHeaderData: PropTypes.any
}
export default TableBatch
