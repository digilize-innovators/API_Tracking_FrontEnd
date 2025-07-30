import React, { useEffect, useMemo, useState } from 'react'
import { Box, Table, TableRow, TableHead, TableBody, TableCell, IconButton } from '@mui/material'
import ChevronUp from 'mdi-material-ui/ChevronUp'
import ChevronDown from 'mdi-material-ui/ChevronDown'
import CustomTable from 'src/components/CustomTable'
import PropTypes from 'prop-types'
import { useSettings } from 'src/@core/hooks/useSettings'
import { useRouter } from 'next/router'
import { api } from 'src/utils/Rest-API'
import { useLoading } from 'src/@core/hooks/useLoading'
import { useAuth } from 'src/Context/AuthContext'
import { sortData } from 'src/utils/sortData'

const columns = [
  { label: 'Action', path: 'performed_action' },
  { label: 'Remarks', path: 'remarks' },
  { label: 'User Name', path: 'user_name' },
  { label: 'User ID', path: 'user_id' },
  { label: 'Timestamp', path: "performed_at" },
]

const TableAuditLog = ({ setAuditLog, tableHeaderData, startDate, endDate, setAlertData }) => {
  const [page, setPage] = useState(0)
  const { settings } = useSettings()
  const router = useRouter()
  const [auditLogData, setAuditLogData] = useState({ data: [], total: 0 })
  const [sortBy, setSortBy] = useState('performed_action')
  const [sortDirection, setSortDirection] = useState('asc')
  const [rowsPerPage, setRowsPerPage] = useState(settings.rowsPerPage)
  const { setIsLoading } = useLoading()
  const { removeAuthToken } = useAuth()

  useMemo(() => {
    setPage(0)
  }, [tableHeaderData, rowsPerPage, startDate, endDate])

  useEffect(() => {
    getData()
  }, [tableHeaderData, startDate, endDate, page, rowsPerPage])

  const getData = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage === -1 ? -1 : rowsPerPage,
        search: tableHeaderData.searchVal,
        startDate: startDate ? startDate.toISOString() : '',
        endDate: endDate ? endDate.toISOString() : ''
      });
      const response = await api(`/auditlog/?${params.toString()}`, {}, 'get', true)
      if (response.data.success) {
        setAuditLogData({ data: response.data.data.auditlogs, total: response.data.data.total })
        setAuditLog({ data: response.data.data.auditlogs, index: response.data.data.offset })
      } else {
        console.error('Error fetching audit logs:', response.data)
        if (response.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.error('Error in fetching audit logs:', error)
      setAlertData({ openSnackbar: true, type: 'error', message: 'Error in fetching audit logs', variant: 'filled' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSort = (path) => {
    const newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    const data = auditLogData?.data || [];
    const sortedData = sortData(data, path, newSortDirection);
    setAuditLogData(prev => ({ ...prev, data: sortedData }));
    setSortDirection(newSortDirection)
    setSortBy(path)
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = event => {
    const newRowsPerPage = parseInt(event.target.value, 10)
    setRowsPerPage(newRowsPerPage)
    setPage(0)
  }

  const getSortIcon = column => {
    if (sortBy === column) {
      return sortDirection === 'asc' ? <ChevronDown /> : <ChevronUp />
    }
    return null
  }

  return (
    <CustomTable
      page={page}
      rowsPerPage={rowsPerPage}
      totalRecords={auditLogData?.total}
      handleChangePage={handleChangePage}
      handleChangeRowsPerPage={handleChangeRowsPerPage}
    >
      <Box sx={{ position: 'relative', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
        <Table stickyHeader>
          <TableHead style={{ backgroundColor: '#fff' }}>
            <TableRow sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                Sr.No.
              </TableCell>
              {
                columns.map((item, idx) => (
                  <TableCell
                    key={idx}
                    align='center'
                    sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort(item.path)}
                  >
                    {item.label}
                    <IconButton align='center' aria-label='sort' size='small'>
                      {getSortIcon(item.path)}
                    </IconButton>
                  </TableCell>
                ))
              }
            </TableRow>
          </TableHead>
          <TableBody>
            {auditLogData?.data?.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell align='center' className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                  {index + 1 + page * rowsPerPage}
                </TableCell>
                {
                  columns.map((col, idx) => (
                    <TableCell align='center' className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} key={idx}>
                      {item[col.path]}
                    </TableCell>
                  ))
                }
              </TableRow>
            ))}
            {auditLogData?.data?.length === 0 && (
              <TableRow sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                <TableCell colSpan={6} align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
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
TableAuditLog.propTypes = {
  setAuditLog: PropTypes.any,
  tableHeaderData: PropTypes.any,
  startDate: PropTypes.any,
  endDate: PropTypes.any,
  setAlertData: PropTypes.any
}
export default TableAuditLog
