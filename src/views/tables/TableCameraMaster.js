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
import ChevronUp from 'mdi-material-ui/ChevronUp'
import ChevronDown from 'mdi-material-ui/ChevronDown'
import CustomTable from 'src/components/CustomTable'
import PropTypes from 'prop-types'
import { statusObj } from 'src/configs/statusConfig'
import { getSortIcon } from 'src/utils/sortUtils'
import { handleRowToggleHelper } from 'src/utils/rowUtils'
import StatusChip from 'src/components/StatusChip'
import moment from 'moment'
import { useSettings } from 'src/@core/hooks/useSettings'
import { useLoading } from 'src/@core/hooks/useLoading'
import { useAuth } from 'src/Context/AuthContext'
import { useRouter } from 'next/router'
import { api } from 'src/utils/Rest-API'
import { offset } from '@popperjs/core'

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
  apiAccess
}) => {
  const isOpen = openRows[row.id]
  return (
    <Fragment>
      <TableRow sx={{ '& > *': { borderBottom: '1px solid rgba(224, 224, 224, 1)' } }}>
        <TableCell className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          <IconButton align='center' aria-label='expand row' size='small' onClick={() => handleRowToggle(row.id)}>
            {isOpen ? <ChevronUp /> : <ChevronDown />}
          </IconButton>
        </TableCell>
        <TableCell
          sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
          align='center'
          component='th'
          scope='row'
          className='p-2'
        >
          {index + 1 + page * rowsPerPage}
        </TableCell>
        <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} align='center' className='p-2'>
          {row.name}
        </TableCell>
        <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} align='center' className='p-2'>
          {row.ip}
        </TableCell>
        <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} align='center' className='p-2'>
          {row.port}
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
              <MdOutlineDomainVerification
                fontSize={20}
                data-testid={`auth-check-icon-${row.id}`}
                onClick={() => handleAuthCheck(row)}
              />
            </span>
          ) : (
            <Tooltip title={!apiAccess.editApiAccess ? 'No edit access' : ''}>
              <span>
                <MdModeEdit
                  fontSize={20}
                  data-testid={`edit-icon-${index + 1}`}
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
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <Table size='small' aria-label='purchases'>
                    <TableHead>
                      <TableRow>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                          Sr.No.
                        </TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                          Camera Name
                        </TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                          IP Address
                        </TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                          Port No.
                        </TableCell>
                        {config?.config?.esign_status === true && (
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                            E-Sign
                          </TableCell>
                        )}
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                          created at
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
                            {historyRow.name}
                          </TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                            {historyRow.ip}
                          </TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                            {historyRow.port}
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
                </div>
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

const TableCameraMaster = ({
  setCamera,
  handleUpdate,
  apiAccess,
  tableHeaderData,
  config,
  handleAuthCheck,
  pendingAction
}) => {
  const [sortBy, setSortBy] = useState('')
  const [openRows, setOpenRows] = useState({})
  const [historyData, setHistoryData] = useState({})
  const [page, setPage] = useState(0)
  const { settings } = useSettings()
  const [sortDirection, setSortDirection] = useState('asc')
  const [rowsPerPage, setRowsPerPage] = useState(settings.rowsPerPage)
  const { setIsLoading } = useLoading()
  const { removeAuthToken } = useAuth()
  const router = useRouter()
  const [cameraData, setCameraData] = useState({ data: [], total: 0 })

  const handleRowToggle = async rowId => {
    await handleRowToggleHelper(rowId, openRows, setOpenRows, setHistoryData, '/cameramaster/history')
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = event => {
    const newRowsPerPage = parseInt(event.target.value, 10)
    setRowsPerPage(newRowsPerPage)
    setPage(0)
  }

  const getData = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage === -1 ? -1 : rowsPerPage,
        search: tableHeaderData.searchVal,
        esign_status: tableHeaderData.esignStatus
      })
      const response = await api(`/cameramaster/?${params.toString()}`, {}, 'get', true)
      console.log('controlpanelmaster data res ', response.data)
      if (response.data.success) {
        setCameraData({ data: response.data.data.cameraMasters, total: response.data.data.total })
        setCamera({ data: response.data.data.cameraMasters, index: response.data.data.offset })
      } else {
        console.log('Error to get all controlpanelmasters ', response.data)
        if (response.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log(error)
      console.log('Error in get controlpanelmasters ', error)
    } finally {
      setIsLoading(false)
    }
  }

  useMemo(() => {
    setPage(0)
  }, [tableHeaderData, rowsPerPage])

  useEffect(() => {
    getData()
  }, [tableHeaderData, page, rowsPerPage, pendingAction])

  const handleSort = (key, child) => {
    const newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc'
    const data = cameraData?.data || []
    const sorted = [...data].sort((a, b) => {
      if (key === 'updated_at') {
        const dateA = new Date(a.updated_at)
        const dateB = new Date(b.updated_at)
        return newSortDirection === 'asc' ? dateA - dateB : dateB - dateA
      } else if (!child) {
        if (a[key].toLowerCase() > b[key].toLowerCase()) {
          return newSortDirection === 'asc' ? 1 : -1
        }

        if (a[key].toLowerCase() < b[key].toLowerCase()) {
          return newSortDirection === 'asc' ? -1 : 1
        }
        return 0
      } else {
        if (a[key][child] > b[key][child]) {
          return newSortDirection === 'asc' ? 1 : -1
        }

        if (a[key][child] < b[key][child]) {
          return newSortDirection === 'asc' ? -1 : 1
        }
        return 0
      }
    })
    setCameraData({ ...cameraData, data: sorted })
    setSortDirection(newSortDirection)
    setSortBy(key)
  }

  return (
    <CustomTable
      data={cameraData?.data}
      totalRecords={cameraData?.total}
      page={page}
      rowsPerPage={rowsPerPage}
      setpage={setPage}
      setRowsPerPage={setRowsPerPage}
      handleChangePage={handleChangePage}
      handleChangeRowsPerPage={handleChangeRowsPerPage}
    >
      <Box sx={{ position: 'relative', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
        <Table stickyHeader>
          <TableHead style={{ backgroundColor: '#fff' }}>
            <TableRow sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
              <TableCell className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} />
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                Sr.No.
              </TableCell>

              <TableCell
                align='center'
                sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
                style={{ cursor: 'pointer' }}
                onClick={() => handleSort('name')}
              >
                Camera Name
                <IconButton align='center' aria-label='expand row' size='small'>
                  {getSortIcon(sortBy, 'name', sortDirection)}
                </IconButton>
              </TableCell>
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                IP Address
              </TableCell>
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                Port No.
                <IconButton align='center' aria-label='expand row' size='small'>
                  {getSortIcon(sortBy, 'port', sortDirection)}
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
            {cameraData?.data?.map((item, index) => (
              <Row
                key={index + 1}
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
                apiAccess={apiAccess}
              />
            ))}
            {cameraData?.data?.length === 0 && (
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

TableCameraMaster.propTypes = {
  setCamera: PropTypes.any,
  handleUpdate: PropTypes.any,
  tableHeaderData: PropTypes.any,
  apiAccess: PropTypes.any,
  config: PropTypes.any,
  handleAuthCheck: PropTypes.any
}
export default TableCameraMaster
