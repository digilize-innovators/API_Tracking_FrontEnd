'use client'
import React from 'react';
import { TableContainer, TablePagination, Paper, Table } from '@mui/material'
import { useSettings } from '../@core/hooks/useSettings'
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';

const CustomTable = ({ children, page, rowsPerPage, totalRecords, handleChangePage, handleChangeRowsPerPage }) => {
  const { settings } = useSettings()

  return (
    <Box sx={{ position: 'relative' }}>
      <TablePagination
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          position: 'sticky',
          bottom: 0,
          right: 0,
          zIndex: 1,
          '& .MuiTablePagination-selectLabel, & .MuiTablePagination-input, & .MuiTablePagination-displayedRows': {
            margin: 0,
          },
          '& .MuiTablePagination-root': {
            border: 'none',
          },
        }}
        rowsPerPageOptions={[...settings.recordPerPage]}
        colSpan={12}
        count={totalRecords}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        showFirstButton
        showLastButton
      />
      <TableContainer component={Paper}>
        <Table aria-label='collapsible table' stickyHeader>
          {children}
        </Table>
      </TableContainer>
    </Box>

  )
}

CustomTable.propTypes = {
  children: PropTypes.any,
  page: PropTypes.any,
  rowsPerPage: PropTypes.any,
  totalRecords: PropTypes.any,
  handleChangePage: PropTypes.any,
  handleChangeRowsPerPage: PropTypes.any
}

export default CustomTable
