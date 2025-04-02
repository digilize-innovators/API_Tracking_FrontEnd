import React, { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ChevronUp from 'mdi-material-ui/ChevronUp';
import ChevronDown from 'mdi-material-ui/ChevronDown';
import CustomTable from 'src/components/CustomTable';
import PropTypes from 'prop-types';
import { useSettings } from 'src/@core/hooks/useSettings';
import { useRouter } from 'next/router';
import { api } from 'src/utils/Rest-API';
import { useLoading } from 'src/@core/hooks/useLoading';
import { useAuth } from 'src/Context/AuthContext';
const TableAuditLog = ({
  setAuditLog,
  tableHeaderData,
  startDate,
  endDate,
  setAlertData
}) => {

  const [page, setPage] = useState(0)
  const { settings } = useSettings()
  const router = useRouter();
  const [auditLogData, setAuditLogData] = useState({ data: [], total: 0 })
  const [sortBy, setSortBy] = useState('performed_action')
  const [sortDirection, setSortDirection] = useState('asc')
  const [rowsPerPage, setRowsPerPage] = useState(settings.rowsPerPage)
  const { setIsLoading } = useLoading()
  const { removeAuthToken } = useAuth()
  useMemo(() => {
    setPage(0)
  }, [tableHeaderData,page,rowsPerPage])
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
      })
      const response = await api(`/auditlog/?${params.toString()}`, {}, 'get', true)
      if (response.data.success) {
        setAuditLogData({ data: response.data.data.auditlogs, total: response.data.data.total })
        setAuditLog(response.data.data.auditlogs)
      } else {
        console.error('Error fetching audit logs:', response.data)
        if (response.data.code === 401) {
          removeAuthToken();
          router.push('/401');
        }
      }
    } catch (error) {
      console.error('Error in fetching audit logs:', error)
      setAlertData({ openSnackbar: true, type: 'error', message: 'Error in fetching audit logs', variant: 'filled' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSort = (key, child) => {
    const newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc'
    const data = auditLogData?.data
    const sorted = [...data].sort((a, b) => {
      if (!child) {
        if (a[key] > b[key]) {
          return newSortDirection === 'asc' ? 1 : -1
        }

        if (a[key] < b[key]) {
          return newSortDirection === 'asc' ? -1 : 1
        }
        return 0
      }
      else {
        if (a[key][child] > b[key][child]) {
          return newSortDirection === 'asc' ? 1 : -1
        }

        if (a[key][child] < b[key][child]) {
          return newSortDirection === 'asc' ? -1 : 1
        }
        return 0
      }
    })
    setAuditLogData({ ...auditLogData, data: sorted })
    setSortDirection(newSortDirection)
    setSortBy(key)
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }
  const handleChangeRowsPerPage = event => {
    const newRowsPerPage = parseInt(event.target.value, 10)
    setRowsPerPage(newRowsPerPage)
    setPage(0)
  }
  const getSortIcon = (column) => {
    if (sortBy === column) {
      return sortDirection === 'asc' ? <ChevronDown /> : <ChevronUp />;
    }
    return null;
  };
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
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >Sr.No.</TableCell>
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSort('performed_action')}>
                Action
                <IconButton align='center' aria-label='sort' size='small'>
                  {getSortIcon('performed_action')}
                </IconButton>
              </TableCell>
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSort('remarks')}>
                Remarks
                <IconButton align='center' aria-label='sort' size='small'>
                  {getSortIcon('remarks')}
                </IconButton>
              </TableCell>
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSort('user_name')}>
                User Name
                <IconButton align='center' aria-label='sort' size='small'>
                  {getSortIcon('user_name')}
                </IconButton>
              </TableCell>
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSort('user_id')}>
                User ID
                <IconButton align='center' aria-label='sort' size='small'>
                  {getSortIcon('user_id')}
                </IconButton>
              </TableCell>
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSort('performed_at')}>
                Timestamp
                <IconButton align='center' aria-label='sort' size='small'>
                  {getSortIcon('performed_at')}
                </IconButton>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {auditLogData?.data?.map((item, index) => (
              <TableRow key={index + 1}>
                <TableCell align='center' className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >{index + 1 + page * rowsPerPage}</TableCell>
                <TableCell align='center' className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >{item.performed_action}</TableCell>
                <TableCell align='center' className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >{item.remarks}</TableCell>
                <TableCell align='center' className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >{item.user_name}</TableCell>
                <TableCell align='center' className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >{item.user_id}</TableCell>
                <TableCell align='center' className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >{item.performed_at.split('.')[0]}</TableCell>
              </TableRow>
            ))}
            {auditLogData?.data?.length === 0 && (
              <TableRow sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >
                <TableCell colSpan={6} align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >
                  No data
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
    </CustomTable>
  );
};
TableAuditLog.propTypes = {
  setAuditLog: PropTypes.any,
  tableHeaderData: PropTypes.any,
  startDate: PropTypes.any,
  endDate: PropTypes.any,
  setAlertData: PropTypes.any
}
export default TableAuditLog;