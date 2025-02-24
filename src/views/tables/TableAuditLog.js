import React from 'react';
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
const TableAuditLog = ({
    auditLogData,
    handleSortBy,
    sortDirection,
    sortBy,
    page,
    rowsPerPage,
    totalRecords,
    handleChangePage,
    handleChangeRowsPerPage,
}) => {
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
            totalRecords={totalRecords}
            handleChangePage={handleChangePage}
            handleChangeRowsPerPage={handleChangeRowsPerPage}
        >
            <Box sx={{ position: 'relative', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                <Table stickyHeader>
                    <TableHead style={{ backgroundColor: '#fff' }}>
                        <TableRow sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                            <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >Sr.No.</TableCell>
                            <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSortBy('performed_action')}>
                                Action
                                <IconButton align='center' aria-label='sort' size='small'>
                                    {getSortIcon('performed_action')}
                                </IconButton>
                            </TableCell>
                            <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSortBy('remarks')}>
                                Remarks
                                <IconButton align='center' aria-label='sort' size='small'>
                                    {getSortIcon('remarks')}
                                </IconButton>
                            </TableCell>
                            <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSortBy('user_name')}>
                                User Name
                                <IconButton align='center' aria-label='sort' size='small'>
                                    {getSortIcon('user_name')}
                                </IconButton>
                            </TableCell>
                            <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSortBy('user_id')}>
                                User ID
                                <IconButton align='center' aria-label='sort' size='small'>
                                    {getSortIcon('user_id')}
                                </IconButton>
                            </TableCell>
                            <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSortBy('performed_at')}>
                                Timestamp
                                <IconButton align='center' aria-label='sort' size='small'>
                                    {getSortIcon('performed_at')}
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {auditLogData?.map((item, index) => (
                            <TableRow key={index + 1}>
                                <TableCell align='center' className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >{index + 1 + page * rowsPerPage}</TableCell>
                                <TableCell align='center' className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >{item.performed_action}</TableCell>
                                <TableCell align='center' className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >{item.remarks}</TableCell>
                                <TableCell align='center' className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >{item.user_name}</TableCell>
                                <TableCell align='center' className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >{item.user_id}</TableCell>
                                <TableCell align='center' className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >{item.performed_at.split('.')[0]}</TableCell>
                            </TableRow>
                        ))}
                        {auditLogData?.length === 0 && (
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
    auditLogData: PropTypes.any,
    handleSortBy: PropTypes.any,
    sortBy: PropTypes.any,
    sortDirection: PropTypes.any,
    page: PropTypes.any,
    rowsPerPage: PropTypes.any,
    totalRecords: PropTypes.any,
    handleChangePage: PropTypes.any,
    handleChangeRowsPerPage: PropTypes.any
}
export default TableAuditLog;
