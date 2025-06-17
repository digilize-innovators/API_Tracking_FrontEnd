import React, { useState, Fragment, useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
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
import { statusObj } from 'src/configs/statusConfig'
import { getSortIcon } from 'src/utils/sortUtils'
import { handleRowToggleHelper } from 'src/utils/rowUtils'
import StatusChip from 'src/components/StatusChip'
import moment from 'moment'
import { useSettings } from 'src/@core/hooks/useSettings'
import { useLoading } from 'src/@core/hooks/useLoading'
import { api } from 'src/utils/Rest-API'
import { useAuth } from 'src/Context/AuthContext'
import { useRouter } from 'next/router'

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
          align='center'
          component='th'
          scope='row'
          className='p-2'
          sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
        >
          {index + 1 + page * rowsPerPage}
        </TableCell>
        <TableCell align='center' className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          {row.printer_category_id}
        </TableCell>
        <TableCell align='center' className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          {row.printer_category_name}
        </TableCell>
        {config?.config?.esign_status === true && (
          <StatusChip label={row.esign_status} color={statusObj[row.esign_status]?.color || 'default'} />
        )}

        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          {row.printingTechnology}
        </TableCell>
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
                      <TableRow>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                          Sr.No.
                        </TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                          Printer Category ID
                        </TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                          Printer Category Name
                        </TableCell>
                        {config?.config?.esign_status === true && (
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                            E-Sign
                          </TableCell>
                        )}
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                          Printer Type
                        </TableCell>
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
                          {console.log(historyRow)}
                          <TableCell
                            component='th'
                            scope='row'
                            align='center'
                            sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
                          >
                            {idx + 1}
                          </TableCell>
                          <TableCell
                            component='th'
                            scope='row'
                            align='center'
                            sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
                          >
                            {historyRow.printer_category_id}
                          </TableCell>
                          <TableCell
                            component='th'
                            scope='row'
                            align='center'
                            sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
                          >
                            {historyRow.printer_category_name}
                          </TableCell>
                          {config?.config?.esign_status === true && (
                            <StatusChip
                              label={historyRow.esign_status}
                              color={statusObj[historyRow.esign_status]?.color || 'default'}
                            />
                          )}
                          <TableCell
                            component='th'
                            scope='row'
                            align='center'
                            sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
                          >
                            {historyRow.printingTechnology}
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
const TablePrinterCategory = ({
  handleUpdate,
  setAllPrinterCategory,
  tableHeaderData,
  apiAccess,
  config,
  handleAuthCheck,
  pendingAction
}) => {
  const [sortBy, setSortBy] = useState('')
  const [openRows, setOpenRows] = useState({})
  const [historyData, setHistoryData] = useState({})
  const { removeAuthToken } = useAuth()
  const router = useRouter()
  const { settings } = useSettings()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(settings.rowsPerPage)
  const [allPrinterCategoryData, setAllPrinterCategoryData] = useState({ data: [], total: 0 })
  const [sortDirection, setSortDirection] = useState('asc')
  const { setIsLoading } = useLoading()
  const handleRowToggle = async rowId => {
    await handleRowToggleHelper(rowId, openRows, setOpenRows, setHistoryData, '/printercategory/history')
  }

  useMemo(() => {
    setPage(0)
    console.log(tableHeaderData.searchVal)
  }, [tableHeaderData, rowsPerPage])

  const handleSort = key => {
    const newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc'
    const data = allPrinterCategoryData?.data
    const sorted = [...data].sort((a, b) => {
      if (key == 'updated_at') {
        const dateA = new Date(a.updated_at)
        const dateB = new Date(b.updated_at)
        return newSortDirection === 'asc' ? dateA - dateB : dateB - dateA
      }
      if (a[key].toLowerCase() > b[key].toLowerCase()) {
        return newSortDirection === 'asc' ? 1 : -1
      }
      if (a[key].toLowerCase() < b[key].toLowerCase()) {
        return newSortDirection === 'asc' ? -1 : 1
      }
      return 0
    })
    setAllPrinterCategoryData({ ...allPrinterCategoryData, data: sorted })
    setSortDirection(newSortDirection)
    setSortBy(key)
  }

  const getData = async () => {
    try {
      setIsLoading(true)

      const params = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage === -1 ? -1 : rowsPerPage,
        search: tableHeaderData.searchVal,
        esign_status: tableHeaderData.esignStatus
      })
      console.log('Params', params)
      const res = await api(`/printercategory/?${params.toString()}`, {}, 'get', true)
      if (res.data.success) {
        console.log(res.data.data.printerCategories)
        setAllPrinterCategoryData({
          ...allPrinterCategoryData,
          data: res.data.data.printerCategories,
          total: res.data.data.total
        })
        setAllPrinterCategory({ data: res.data.data.printerCategories, index: res.data.data.offset })
      } else {
        console.log('Error to get all printer categories ', res.data)
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('Error in get printer categories ', error)
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
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }
  return (
    <CustomTable
      data={allPrinterCategoryData?.data}
      page={page}
      rowsPerPage={rowsPerPage}
      totalRecords={allPrinterCategoryData?.total}
      handleChangePage={handleChangePage}
      handleChangeRowsPerPage={handleChangeRowsPerPage}
    >
      <Box sx={{ position: 'relative', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', width: '100%' }}>
        <Table stickyHeader sx={{ width: '100%' }}>
          <TableHead style={{ backgroundColor: '#fff', height: '60px' }}>
            <TableRow sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
              <TableCell className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} />
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                Sr.No.
              </TableCell>
              <TableCell
                align='center'
                sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
                style={{ cursor: 'pointer' }}
                onClick={() => handleSort('printer_category_id')}
              >
                Printer Category ID
                <IconButton align='center' aria-label='expand row' size='small'>
                  {getSortIcon(sortBy, 'printer_category_id', sortDirection)}
                </IconButton>
              </TableCell>
              <TableCell
                align='center'
                sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
                style={{ cursor: 'pointer' }}
                onClick={() => handleSort('printer_category_name')}
              >
                Printer Category Name
                <IconButton align='center' aria-label='expand row' size='small'>
                  {getSortIcon(sortBy, 'printer_category_name', sortDirection)}
                </IconButton>
              </TableCell>
              {config?.config?.esign_status === true && <TableCell align='center'>E-Sign</TableCell>}

              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                Printer Type
              </TableCell>
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
            {allPrinterCategoryData?.data?.map((item, index) => (
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
                apiAccess={apiAccess}
              />
            ))}
            {allPrinterCategoryData?.data?.length === 0 && (
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
TablePrinterCategory.propTypes = {
  setAllPrinterCategory: PropTypes.any,
  handleUpdate: PropTypes.any,
  tableHeaderData: PropTypes.any,
  apiAccess: PropTypes.any,
  config: PropTypes.any,
  handleAuthCheck: PropTypes.any,
  pendingAction: PropTypes.any
}
export default TablePrinterCategory
