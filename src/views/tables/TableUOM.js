import React, { useState, Fragment, useEffect, useMemo } from 'react'
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
import { MdModeEdit, MdOutlineDomainVerification } from 'react-icons/md'
import { ChevronUp, ChevronDown } from 'mdi-material-ui'
import CustomTable from 'src/components/CustomTable'
import PropTypes from 'prop-types'
import { statusObj } from 'src/configs/statusConfig'
import { getSortIcon } from 'src/utils/sortUtils'
import { getSerialNumber } from 'src/configs/generalConfig'
import { handleRowToggleHelper } from 'src/utils/rowUtils'
import StatusChip from 'src/components/StatusChip'
import moment from 'moment'
import { useSettings } from 'src/@core/hooks/useSettings'
import { useLoading } from 'src/@core/hooks/useLoading'
import { api } from 'src/utils/Rest-API'
import { useRouter } from 'next/router'
import { useAuth } from 'src/Context/AuthContext'
import { sortData } from 'src/utils/sortData'

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
  handleUpdate,
  apiAccess
}) => {
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
        <TableCell align='center' className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          {row.uom_name}
        </TableCell>
        {config?.config?.esign_status === true && (
          <StatusChip label={row.esign_status} color={statusObj[row.esign_status]?.color || 'default'} />
        )}
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          {moment(row?.updated_at).format('DD/MM/YYYY, hh:mm:ss a')}
        </TableCell>
        <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} align='center' className='p-2'>
          {row.esign_status === 'pending' && config?.config?.esign_status === true ? (
            <span>
              <MdOutlineDomainVerification fontSize={20} onClick={() => handleAuthCheck(row)} />
            </span>
          ) : (
            <Tooltip title={!apiAccess.editApiAccess ? 'No edit access' : ''}>
              <span>
                <MdModeEdit
                  data-testid={`edit-icon-${index + 1}`}
                  fontSize={20}
                  onClick={apiAccess.editApiAccess ? () => handleUpdate(row) : null}
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
          <TableCell colSpan={12} sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
            <Collapse in={isOpen} timeout='auto' unmountOnExit>
              <Box sx={{ mx: 2 }}>
                <Typography variant='h6' gutterBottom component='div'>
                  History
                </Typography>
                <Box style={{ display: 'flex', justifyContent: 'center' }}>
                  <Table size='small' aria-label='purchases'>
                    <TableHead>
                      <TableRow sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                          Sr.No.
                        </TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                          Unit Of Measurement
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
                            {historyRow.uom_name}
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
  isOpen: PropTypes.any,
  handleRowToggle: PropTypes.any,
  page: PropTypes.any,
  rowsPerPage: PropTypes.any,
  historyData: PropTypes.any,
  config: PropTypes.any,
  handleAuthCheck: PropTypes.any,
  handleUpdate: PropTypes.any,
  apiAccess: PropTypes.any
}
const TableUOM = ({ handleUpdate, apiAccess, config, handleAuthCheck, tableHeaderData, setAllUOM, pendingAction }) => {
  const [sortBy, setSortBy] = useState('')
  const [openRows, setOpenRows] = useState({})
  const [historyData, setHistoryData] = useState({})

  const { settings } = useSettings()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(settings.rowsPerPage)
  const [allUOMData, setAllUOMData] = useState({ data: [], total: 0 })
  const [sortDirection, setSortDirection] = useState('asc')
  const { setIsLoading } = useLoading()
  const { removeAuthToken } = useAuth()
  const router = useRouter()

  const handleRowToggle = async rowId => {
    await handleRowToggleHelper(rowId, openRows, setOpenRows, setHistoryData, '/uom/history')
  }

  useMemo(() => {
    setPage(0)
  }, [tableHeaderData, rowsPerPage])
 
  const handleSort = (path) => {
   const newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
   const data = allUOMData?.data || [];
   const sortedData = sortData(data, path, newSortDirection);
    setAllUOMData(prev => ({ ...prev, data: sortedData }));
    setSortDirection(newSortDirection)
    setSortBy(path)
  }
  const getData = async () => {
    console.log('AAA')

    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage === -1 ? -1 : rowsPerPage,
        search: tableHeaderData.searchVal,
        esign_status: tableHeaderData.esignStatus
      })
      const res = await api(`/uom/?${params.toString()}`, {}, 'get', true)
      console.log('get data res uom ', res.data)
      if (res?.data?.success) {
        setAllUOMData({ data: res.data.data.uoms, total: res.data.data.total })
        setAllUOM({ data: res.data.data.uoms, index: res.data.data.offset })
      } else if (res?.data?.code === 401) {
        console.log('Error to get all units', res.data)
        removeAuthToken()
        router.push('/401')
      }
    } catch (error) {
      console.log('Error in get units', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getData()
  }, [rowsPerPage, page, tableHeaderData, pendingAction])

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = event => {
    const newRowsPerPage = parseInt(event.target.value, 10)
    setRowsPerPage(newRowsPerPage)
    setPage(0)
  }

  return (
    <CustomTable
      data={allUOMData?.data}
      totalRecords={allUOMData?.total}
      rowsPerPage={rowsPerPage}
      page={page}
      handleChangePage={handleChangePage}
      handleChangeRowsPerPage={handleChangeRowsPerPage}
    >
      <TableHead>
        <TableRow sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} />
          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
            Sr.No.
          </TableCell>
          <TableCell
            align='center'
            sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
            style={{ cursor: 'pointer' }}
            onClick={() => handleSort('uom_name')}
          >
            Unit Of Measurement
            <IconButton align='center' aria-label='expand row' size='small'>
              {getSortIcon(sortBy, 'uom_name', sortDirection)}
            </IconButton>
          </TableCell>
          {config?.config?.esign_status === true && (
            <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
              E-Sign
            </TableCell>
          )}
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
          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
            Action
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {allUOMData?.data?.map((item, index) => (
          <Row
            key={item.id}
            row={item}
            index={index}
            isOpen={openRows[item.id]}
            handleRowToggle={handleRowToggle}
            page={page}
            rowsPerPage={rowsPerPage}
            historyData={historyData}
            config={config}
            handleAuthCheck={handleAuthCheck}
            handleUpdate={handleUpdate}
            apiAccess={apiAccess}
          />
        ))}
        {allUOMData?.data?.length === 0 && (
          <TableRow sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
            <TableCell colSpan={12} align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
              No data
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </CustomTable>
  )
}
TableUOM.propTypes = {
  setAllUOM: PropTypes.any,
  handleUpdate: PropTypes.any,
  tableHeaderData: PropTypes.any,
  pendingAction: PropTypes.any,
  apiAccess: PropTypes.any,
  config: PropTypes.any,
  handleAuthCheck: PropTypes.any
}
export default TableUOM
