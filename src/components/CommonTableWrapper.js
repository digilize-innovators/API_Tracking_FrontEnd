import React, { useState, useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import {
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
} from '@mui/material'
import CustomTable from './CustomTable'
import { getSortIcon } from 'src/utils/sortUtils'
import { sortData } from 'src/utils/sortData'
import { CommonRow } from './CommonRow'

const CommonTableWrapper = ({
  endpoint,
  columns,
  historyColumns,
  config,
  tableHeaderData,
  pendingAction,
  setDataCallback,
  esignEnabled = false,
  handleAuthCheck,
  handleUpdate,
  apiAccess,
  customActions
}) => {
  const { useSettings } = require('src/@core/hooks/useSettings')
  const { useLoading } = require('src/@core/hooks/useLoading')
  const { useAuth } = require('src/Context/AuthContext')
  const { useRouter } = require('next/router')

  const { settings } = useSettings()
  const [sortBy, setSortBy] = useState('')
  const [openRows, setOpenRows] = useState({})
  const [historyData, setHistoryData] = useState({})
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(settings.rowsPerPage)
  const [sortDirection, setSortDirection] = useState('asc')
  const [tableData, setTableData] = useState({ data: [], total: 0 })
  const { setIsLoading } = useLoading()
  const { removeAuthToken } = useAuth()
  const router = useRouter()

  useMemo(() => {
    setPage(0)
  }, [tableHeaderData, rowsPerPage])

  useEffect(() => {
    getData()
  }, [tableHeaderData, page, rowsPerPage, pendingAction])

  const getData = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage === -1 ? -1 : rowsPerPage,
        search: tableHeaderData?.searchVal,
        esign_status: tableHeaderData?.esignStatus,
        locationName: tableHeaderData?.filterLocationVal,
        productName: tableHeaderData?.filterProductVal,
        type: tableHeaderData?.orderTypeFilter,
        status: tableHeaderData?.userStatus,
        department_name: tableHeaderData?.departmentFilter,
      })

      const { api } = require('src/utils/Rest-API')
      const res = await api(`${endpoint}?${params.toString()}`, {}, 'get', true)

      if (res.data.success) {
        const newData = res.data.data
        setTableData({ data: newData[Object.keys(newData)[0]], total: newData.total })
        setDataCallback({ data: newData[Object.keys(newData)[0]], index: newData.offset })
      } else if (res.data.code === 401) {
        removeAuthToken()
        router.push('/401')
      } else {
        console.error('Failed to fetch data:', res.data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRowToggle = async rowId => {
    const { handleRowToggleHelper } = require('src/utils/rowUtils')
    await handleRowToggleHelper(rowId, openRows, setOpenRows, setHistoryData, `${endpoint}/history`)
  }

  const handleSort = path => {
    const newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc'
    const sorted = sortData(tableData.data, path, newSortDirection)
    setTableData(prev => ({ ...prev, data: sorted }))
    setSortBy(path)
    setSortDirection(newSortDirection)
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  return (
    <CustomTable
      data={tableData?.data}
      totalRecords={tableData?.total}
      page={page}
      rowsPerPage={rowsPerPage}
      handleChangePage={handleChangePage}
      handleChangeRowsPerPage={handleChangeRowsPerPage}
    >
      <Box sx={{ position: 'relative', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
        <Table stickyHeader>
          <TableHead style={{ backgroundColor: '#fff', height: '60px' }}>
            <TableRow sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
              <TableCell />
              <TableCell align='center'>Sr.No.</TableCell>
              {columns.map((col, idx) => {
                const path = typeof col === 'string' ? col : col.path
                const label = col.label || col
                return (
                  <TableCell
                    key={label}
                    align='center'
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleSort(path)}
                  >
                    {label}
                    <IconButton size='small'>
                      {getSortIcon(sortBy, path, sortDirection)}
                    </IconButton>
                  </TableCell>
                )
              })}
              {esignEnabled && <TableCell align='center'>E-Sign</TableCell>}
              <TableCell align='center'>Updated At</TableCell>
              <TableCell align='center'>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData?.data?.map((row, index) => (
              <CommonRow
                key={row.id}
                row={row}
                index={index}
                isOpen={openRows[row.id]}
                handleRowToggle={handleRowToggle}
                page={page}
                rowsPerPage={rowsPerPage}
                columns={columns.map(col => {
                    if (typeof col === 'object' && col.render) {
                    return col // includes custom render logic
                    }
                    return col
                })}
                historyColumns={historyColumns}
                historyData={historyData}
                config={config}
                handleAuthCheck={handleAuthCheck}
                handleUpdate={handleUpdate}
                apiAccess={apiAccess}
                customActions={customActions}
              />
            ))}
            {tableData?.data?.length === 0 && (
              <TableRow>
                <TableCell colSpan={12} align='center'>
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

CommonTableWrapper.propTypes = {
  endpoint: PropTypes.string.isRequired,
  columns: PropTypes.array.isRequired,
  historyColumns: PropTypes.array.isRequired,
  config: PropTypes.object,
  tableHeaderData: PropTypes.object,
  pendingAction: PropTypes.any,
  setDataCallback: PropTypes.func.isRequired,
  esignEnabled: PropTypes.bool,
  handleAuthCheck: PropTypes.func,
  handleUpdate: PropTypes.func,
  apiAccess: PropTypes.any,
  customActions: PropTypes.func
}

export default CommonTableWrapper
