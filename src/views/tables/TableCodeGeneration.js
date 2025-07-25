import { useState, Fragment, useEffect, useMemo } from 'react'
import {
  Box,
  Table,
  Collapse,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Typography,
  IconButton,
  Tooltip
} from '@mui/material'
import { MdOutlineDomainVerification } from 'react-icons/md'
import { ChevronUp, ChevronDown } from 'mdi-material-ui'
import CustomTable from 'src/components/CustomTable'
import PropTypes from 'prop-types'
import { getSortIcon } from 'src/utils/sortUtils'
import { getSerialNumber } from 'src/configs/generalConfig'
import { handleRowToggleHelper } from 'src/utils/rowUtils'
import moment from 'moment'
import { IoMdEye } from 'react-icons/io'
import { useSettings } from 'src/@core/hooks/useSettings'
import { api } from 'src/utils/Rest-API'
import { useLoading } from 'src/@core/hooks/useLoading'
import StatusChip from 'src/components/StatusChip'
import { statusObj } from 'src/configs/statusConfig'
import { isNumber } from '@mui/x-data-grid/internals'

const Row = ({
  row,
  index,
  isOpen,
  handleRowToggle,
  page,
  rowsPerPage,
  historyData,
  config,
  handleAuthCheck,
  handleReopenModal,
  apiAccess
}) => {
  const serialNumber = getSerialNumber(index, page, rowsPerPage)
  return (
    <Fragment>
      <TableRow sx={{ '& > *': { borderBottom: '1px solid rgba(224, 224, 224, 1)' } }}>
        <TableCell className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          <IconButton align='center' aria-label='expand row' size='small' onClick={() => handleRowToggle(row.batch.id)}>
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
          {row.product?.product_history[0]?.product_name}
        </TableCell>
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          {row.batch.batch_no}
        </TableCell>
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          {row.locations?.history[0]?.location_name}
        </TableCell>
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          {row.batch.qty}
        </TableCell>
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          {row.no_of_codes}
        </TableCell>
        {config?.config?.esign_status === true && (
          <TableCell align="center">
            <StatusChip label={row?.esign_status} color={statusObj[row?.esign_status]?.color || 'default'} />
          </TableCell>
        )}
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          <StatusChip label={row.status} color={statusObj[row.status]?.color || 'default'} />
        </TableCell>
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          {moment(row?.updated_at).format('DD/MM/YYYY, hh:mm:ss a')}
        </TableCell>
        <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} align='center' className='p-2'>
          {row.esign_status === 'pending' && config?.config?.esign_status === true ? (
            <span>
              <MdOutlineDomainVerification
                fontSize={20}
                data-testid={`auth-check-icon-${row.id}`}
                onClick={() => handleAuthCheck(row)}
              />
            </span>
          ) : (
            <Tooltip title={!apiAccess.editApiAccess ? 'No access' : ''}>
              <span>
                <IoMdEye
                  fontSize={20}
                  data-testid={`edit-icon-${index + 1}`}
                  onClick={apiAccess.editApiAccess ? () => handleReopenModal(row) : null}
                  style={{
                    cursor: apiAccess.editApiAccess ? 'pointer' : 'not-allowed',
                    opacity: apiAccess.editApiAccess ? 1 : 0.5
                  }}
                />
              </span>
            </Tooltip>
          )}
        </TableCell>
      </TableRow>
      {isOpen && (
        <TableRow sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          <TableCell colSpan={16} sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
            <Collapse in={isOpen} timeout='auto' unmountOnExit>
              <Box sx={{ mx: 2 }}>
                <Typography variant='h6' gutterBottom component='div'>
                  History
                </Typography>
                <Box style={{ display: 'flex', justifyContent: 'center' }}>
                  <Table size='small' aria-label='purchases'>
                    <TableHead>
                      <TableRow align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)', width: '100%' }}>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                          Sr.No.
                        </TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                          Product Name
                        </TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                          Batch No.
                        </TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                          Location
                        </TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                          Batch Qty
                        </TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                          Codes Generated
                        </TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                          Created At
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {historyData[row.batch.id]?.map((historyRow, idx) => (
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
                            {historyRow.product.product_history[0].product_name}
                          </TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                            {historyRow.batch.history[0].batch_no}
                          </TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                            {historyRow.locations.history[0].location_name}
                          </TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                            {historyRow.batch.history[0].qty}
                          </TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                            {historyRow.no_of_codes}
                          </TableCell>
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
  isOpen: PropTypes.any,
  handleRowToggle: PropTypes.any,
  page: PropTypes.any,
  rowsPerPage: PropTypes.any,
  historyData: PropTypes.any,
  config: PropTypes.any,
  handleAuthCheck: PropTypes.any,
  apiAccess: PropTypes.any,
  handleReopenModal:PropTypes.any
  
}

const TableCodeGeneration = ({
  setCodeRequest,
  tableHeaderData,
  apiAccess,
  config,
  handleAuthCheck,
  handleReopenModal,
  isCodeReGeneration
}) => {
  const [sortBy, setSortBy] = useState('')
  const [openRows, setOpenRows] = useState({})
  const [historyData, setHistoryData] = useState({})
  const [page, setPage] = useState(0)
  const { settings } = useSettings()
  const [rowsPerPage, setRowsPerPage] = useState(settings.rowsPerPage)
  const [codeRequestData, setCodeRequestData] = useState({ data: [], total: 0 })
  const [sortDirection, setSortDirection] = useState('asc')
  const { setIsLoading } = useLoading()

  useMemo(() => {
    setPage(0)
  }, [tableHeaderData, rowsPerPage])

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }
  const handleRowToggle = async rowId => {
    await handleRowToggleHelper(rowId, openRows, setOpenRows, setHistoryData, '/codegeneration/history')
  }

  const handleChangeRowsPerPage = event => {
    const newRowsPerPage = parseInt(event.target.value, 10)
    setRowsPerPage(newRowsPerPage)
    setPage(0)
  }
  const getCodeRequestData = async (pageNumber, rowsNumber, status, search) => {
    const paramsPage = pageNumber || page
    const paramsRows = rowsNumber || rowsPerPage
    const paramsEsignStatus = status === '' ? status : tableHeaderData.esignStatus
    const paramsSearchVal = search === '' ? search : tableHeaderData.searchVal
    let query = `/codegeneration?page=${paramsPage + 1}&limit=${paramsRows}`
    if (paramsSearchVal) query += `&search=${paramsSearchVal}`
    if (paramsEsignStatus) query += `&esign_status=${paramsEsignStatus}`

    try {
      setIsLoading(true)
      const res = await api(query, {}, 'get', true)
      setIsLoading(false)
      console.log('Code Request Data ', res.data)
      if (res.data.success) {
        console.log(res.data.data)
        setCodeRequestData({ data: res.data.data.result, total: res.data.data.total })
        setCodeRequest({ data: res.data.data.result, index: res.data.data.offset })
      }
    } catch (error) {
      setIsLoading(false)
      console.log('Error to get code request data ', error)
    }
  }
  useEffect(() => {
    getCodeRequestData()
  }, [page, rowsPerPage, tableHeaderData, isCodeReGeneration])

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
  const compareValues = (aValue, bValue, direction) => {
  if (isNumber(aValue) && isNumber(bValue)) {
    return direction === 'asc' ? aValue - bValue : bValue - aValue;
  }

  const aStr = (aValue ?? '').toString().toLowerCase();
  const bStr = (bValue ?? '').toString().toLowerCase();

  if (aStr > bStr) return direction === 'asc' ? 1 : -1;
  if (aStr < bStr) return direction === 'asc' ? -1 : 1;
  return 0;
};

 const handleSort = path => {
  const newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
  const data = codeRequestData?.data || [];

  const sorted = [...data].sort((a, b) => {
    if (path === 'updated_at') {
      const dateA = new Date(a.updated_at);
      const dateB = new Date(b.updated_at);
      return newSortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    }

    const aValue = getValueByPath(a, path);
    const bValue = getValueByPath(b, path);
    return compareValues(aValue, bValue, newSortDirection);
  });

  setCodeRequestData({ ...codeRequestData, data: sorted });
  setSortDirection(newSortDirection);
  setSortBy(path);
};

  return (
    <CustomTable
      data={codeRequestData?.data}
      totalRecords={codeRequestData?.total}
      rowsPerPage={rowsPerPage}
      page={page}
      setPage={setPage}
      setRowsPerPage={setRowsPerPage}
      handleChangePage={handleChangePage}
      handleChangeRowsPerPage={handleChangeRowsPerPage}
    >
      <Box sx={{ position: 'relative', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
              <TableCell
                sx={{
                  borderBottom: '1px solid rgba(224, 224, 224, 1)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              />
              <TableCell
                align='center'
                sx={{
                  borderBottom: '1px solid rgba(224, 224, 224, 1)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                Sr.No.
              </TableCell>
              <TableCell
                align='center'
                sx={{ cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                <Box display='flex' alignItems='center' justifyContent='center'>
                  Product Name
                </Box>
              </TableCell>
              <TableCell
                align='center'
                sx={{ cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                onClick={() => handleSort('batch.batch_no')}
              >
                <Box display='flex' alignItems='center' justifyContent='center'>
                  Batch No
                  <IconButton aria-label='expand row' size='small'>
                    {getSortIcon(sortBy, 'batch.batch_no', sortDirection)}
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell
                align='center'
                sx={{ cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                onClick={() => handleSort('locations.history[0].location_name')}
              >
                <Box display='flex' alignItems='center' justifyContent='center'>
                  Location
                  <IconButton aria-label='expand row' size='small'>
                    {getSortIcon(sortBy, 'locations.history[0].location_name', sortDirection)}
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell
                align='center'
                sx={{ cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                onClick={() => handleSort('batch.qty')}
              >
                <Box display='flex' alignItems='center' justifyContent='center'>
                  Batch Qty
                  <IconButton aria-label='expand row' size='small'>
                    {getSortIcon(sortBy, 'batch.qty', sortDirection)}
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell
                align='center'
                sx={{ cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                onClick={() => handleSort('no_of_codes')}
              >
                <Box display='flex' alignItems='center' justifyContent='center'>
                  Codes Generated
                  <IconButton aria-label='expand row' size='small'>
                    {getSortIcon(sortBy, 'no_of_codes', sortDirection)}
                  </IconButton>
                </Box>
              </TableCell>
              {config?.config?.esign_status === true && (
                <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                  E-Sign
                </TableCell>
              )}

              <TableCell
                align='center'
                sx={{ cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                onClick={() => handleSort('status')}
              >
                <Box display='flex' alignItems='center' justifyContent='center'>
                  Status
                  <IconButton aria-label='expand row' size='small'>
                    {getSortIcon(sortBy, 'status', sortDirection)}
                  </IconButton>
                </Box>
              </TableCell>

              <TableCell
                align='center'
                sx={{
                  borderBottom: '1px solid rgba(224, 224, 224, 1)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
                onClick={() => handleSort('updated_at')}
              >
                Updated At
                <IconButton aria-label='expand row' size='small'>
                  {getSortIcon(sortBy, 'updated_at', sortDirection)}
                </IconButton>
              </TableCell>
              <TableCell
                align='center'
                sx={{
                  borderBottom: '1px solid rgba(224, 224, 224, 1)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {codeRequestData?.data?.map((item, index) => (
              <Row
                key={item.id}
                row={item}
                index={index}
                isOpen={openRows[item.batch.id]}
                handleRowToggle={handleRowToggle}
                page={page}
                rowsPerPage={rowsPerPage}
                historyData={historyData}
                config={config}
                handleAuthCheck={handleAuthCheck}
                apiAccess={apiAccess}
                handleReopenModal={handleReopenModal}
              />
            ))}
            {codeRequestData.data?.length === 0 && (
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
TableCodeGeneration.propTypes = {
  setCodeRequest: PropTypes.any,
  apiAccess: PropTypes.any,
  config: PropTypes.any,
  tableHeaderData: PropTypes.any,
  handleAuthCheck: PropTypes.any,
  handleReopenModal: PropTypes.any,
  isCodeReGeneration: PropTypes.any
}
export default TableCodeGeneration
