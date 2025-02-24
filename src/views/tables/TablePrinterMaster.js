import React, { useState, Fragment } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import Collapse from '@mui/material/Collapse';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { MdModeEdit, MdOutlineDomainVerification } from 'react-icons/md';
import ChevronUp from 'mdi-material-ui/ChevronUp';
import ChevronDown from 'mdi-material-ui/ChevronDown';
import CustomTable from 'src/components/CustomTable';
import { Tooltip } from '@mui/material';
import { statusObj } from 'src/configs/statusConfig';
import { getSortIcon } from 'src/utils/sortUtils';
import { handleRowToggleHelper } from 'src/utils/rowUtils';
import StatusChip from 'src/components/StatusChip';
import moment from 'moment';

const Row = ({ row, index, page, rowsPerPage, openRows, handleRowToggle, historyData, config, handleAuthCheck, handleUpdate, apiAccess }) => {
    console.log('historyData', historyData);
    const isOpen = openRows[row.id];
    return (
        <Fragment>
            <TableRow sx={{ '& > *': { borderBottom: '1px solid rgba(224, 224, 224, 1)' } }}>
                <TableCell className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                    <IconButton align='center' aria-label='expand row' size='small' onClick={() => handleRowToggle(row.id)}>
                        {isOpen ? <ChevronUp /> : <ChevronDown />}
                    </IconButton>
                </TableCell>
                <TableCell align='center' component='th' scope='row' className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                    {index + 1 + page * rowsPerPage}
                </TableCell>

                <TableCell align='center' className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                    {row.PrinterCategory.printer_category_name}
                </TableCell>
                <TableCell align='center' className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                    {row.printer_id}
                </TableCell>
                <TableCell align='center' className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                    {row.printer_ip}
                </TableCell>
                <TableCell align='center' className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                    {row.printer_port}
                </TableCell>
                {config?.config?.esign_status === true && (
                    <StatusChip
                        label={row.esign_status}
                        color={statusObj[row.esign_status]?.color || 'default'}
                    />
                )}
                <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >
                    {moment(row?.created_at).format('DD/MM/YYYY, hh:mm:ss a')}
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
                                    style={{ cursor: apiAccess.editApiAccess ? 'pointer' : 'not-allowed', opacity: apiAccess.editApiAccess ? 1 : 0.5 }}
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
                                                    Printer Category
                                                </TableCell>
                                                <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                                                    Printer ID
                                                </TableCell>
                                                <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                                                    Printer IP
                                                </TableCell>
                                                <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                                                    Printer Port
                                                </TableCell>
                                                {config?.config?.esign_status === true && <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>E-Sign</TableCell>}
                                                <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Updated At</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {historyData[row.id]?.map((historyRow, idx) => (
                                                <TableRow key={historyRow.created_at} align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                                                    <TableCell component='th' scope='row' align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >
                                                        {idx + 1}
                                                    </TableCell>

                                                    <TableCell component='th' scope='row' align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >
                                                        {historyRow?.PrinterCategory?.printer_category_name}
                                                    </TableCell>
                                                    <TableCell component='th' scope='row' align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >
                                                        {historyRow?.printer_id}
                                                    </TableCell>
                                                    <TableCell component='th' scope='row' align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >
                                                        {historyRow?.printer_ip}
                                                    </TableCell>
                                                    <TableCell component='th' scope='row' align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >
                                                        {historyRow?.printer_port}
                                                    </TableCell>


                                                    {config?.config?.esign_status === true && (
                                                        <StatusChip
                                                            label={historyRow.esign_status}
                                                            color={statusObj[historyRow.esign_status]?.color || 'default'}
                                                        />
                                                    )}
                                                    <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >
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
    );
};
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
    apiAccess: PropTypes.any,
};
const TablePrinterMaster = ({
    allPrinterMasterData,
    handleUpdate,
    handleSortByPrinterCategoryId,
    handleSortByPrinterId,
    handleSortByPrinterIp,
    handleSortByPrinterPort,
    sortDirection,
    page,
    rowsPerPage,
    totalRecords,
    handleChangePage,
    handleChangeRowsPerPage,
    apiAccess,
    config,
    handleAuthCheck
}) => {
    const [sortBy, setSortBy] = useState('');
    const [openRows, setOpenRows] = useState({});
    const [historyData, setHistoryData] = useState({});
    const handleRowToggle = async (rowId) => {
        await handleRowToggleHelper(rowId, openRows, setOpenRows, setHistoryData, '/printermaster/history');
    };
    const handleSortBy = (value) => {
        if (value === 'printer_category_id') {
            handleSortByPrinterCategoryId();
            setSortBy('printer_category_id');
        }
        else if (value === 'id') {
            handleSortByPrinterId();
            setSortBy('id');
        }
        else if (value === 'AreaCategoryId') {
            handleSortByPrinterIp();
            setSortBy('AreaCategoryId');
        }
        else if (value === 'AreaId') {
            handleSortByPrinterPort();
            setSortBy('AreaId');
        }
    };
    return (
        <CustomTable
            data={allPrinterMasterData}
            page={page}
            rowsPerPage={rowsPerPage}
            totalRecords={totalRecords}
            handleChangePage={handleChangePage}
            handleChangeRowsPerPage={handleChangeRowsPerPage}
        >
            <Box sx={{ position: 'relative', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', width: '100%' }}>
                <Table stickyHeader sx={{ width: '100%' }}>
                    <TableHead style={{ backgroundColor: '#fff', height: '60px' }}>
                        <TableRow sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                            <TableCell className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} />
                            <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >Sr.No.</TableCell>
                            <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSortBy('printer_category_id')}>
                                Printer Category
                                <IconButton align='center' aria-label='expand row' size='small'>
                                    {getSortIcon(sortBy, 'printer_category_id', sortDirection)}
                                </IconButton>
                            </TableCell>
                            <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSortBy('id')}>
                                Printer ID
                                <IconButton align='center' aria-label='expand row' size='small'>
                                    {getSortIcon(sortBy, 'id', sortDirection)}
                                </IconButton>
                            </TableCell>
                            <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSortBy('ip')}>
                                Printer IP
                                <IconButton align='center' aria-label='expand row' size='small'>
                                    {getSortIcon(sortBy, 'ip', sortDirection)}
                                </IconButton>
                            </TableCell>
                            <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSortBy('port')}>
                                Printer Port
                                <IconButton align='center' aria-label='expand row' size='small'>
                                    {getSortIcon(sortBy, 'port', sortDirection)}
                                </IconButton>
                            </TableCell>

                            {config?.config?.esign_status === true && <TableCell align='center'>E-Sign</TableCell>}
                            <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >Created At</TableCell>
                            <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {allPrinterMasterData?.map((item, index) => (
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
                        {allPrinterMasterData?.length === 0 && (
                            <TableRow sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                                <TableCell colSpan={12} align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >
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
TablePrinterMaster.propTypes = {
    handleUpdate: PropTypes.any,
    handleSortByName: PropTypes.any,
    sortDirection: PropTypes.any,
    page: PropTypes.any,
    rowsPerPage: PropTypes.any,
    totalRecords: PropTypes.any,
    handleChangePage: PropTypes.any,
    handleChangeRowsPerPage: PropTypes.any,
    apiAccess: PropTypes.any,
    config: PropTypes.any,
    handleAuthCheck: PropTypes.any
};
export default TablePrinterMaster;
