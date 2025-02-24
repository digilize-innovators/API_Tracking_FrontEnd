import React, { useState, Fragment } from 'react';
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
import PropTypes from 'prop-types';
import { statusObj } from 'src/configs/statusConfig';
import { getSortIcon } from 'src/utils/sortUtils';
import { handleRowToggleHelper } from 'src/utils/rowUtils';
import StatusChip from 'src/components/StatusChip';
import moment from 'moment';

const Row = ({ row, index, page, rowsPerPage, openRows, handleRowToggle, historyData, config, handleAuthCheck, handleUpdate, apiAccess }) => {
    const isOpen = openRows[row.id];
    return (
        <Fragment>
            <TableRow sx={{ '& > *': { borderBottom: '1px solid rgba(224, 224, 224, 1)' } }}>
                <TableCell className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                    <IconButton align='center' aria-label='expand row' size='small' onClick={() => handleRowToggle(row.id)}>
                        {isOpen ? <ChevronUp /> : <ChevronDown />}
                    </IconButton>
                </TableCell>
                <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} align='center' component='th' scope='row' className='p-2'>
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
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <Table size='small' aria-label='purchases'>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Sr.No.</TableCell>
                                                <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Control Panel Name</TableCell>
                                                <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>IP Address</TableCell>
                                                <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Port No.</TableCell>
                                                {config?.config?.esign_status === true && <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>E-Sign</TableCell>}
                                                <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Action</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {historyData[row.id]?.map((historyRow, idx) => (
                                                <TableRow key={historyRow.created_at} align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                                                    <TableCell component='th' scope='row' align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >
                                                        {idx + 1}
                                                    </TableCell>
                                                    <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >{historyRow.name}</TableCell>
                                                    <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >{historyRow.ip}</TableCell>
                                                    <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >{historyRow.port}</TableCell>
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
                                </div>
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
const TableControlPanelMaster = ({
    controlPanelData,
    handleUpdate,
    handleSortByName,
    handleSortByPort,
    sortDirection,
    page,
    rowsPerPage,
    totalRecords,
    handleChangePage,
    handleChangeRowsPerPage,
    apiAccess,
    config,
    handleAuthCheck,
}) => {
    const [sortBy, setSortBy] = useState('');
    const [openRows, setOpenRows] = useState({});
    const [historyData, setHistoryData] = useState({});
    const handleRowToggle = async (rowId) => {
        await handleRowToggleHelper(rowId, openRows, setOpenRows, setHistoryData, '/controlpanelmaster/history');
    };
    const handleSortBy = (value) => {
        if (value === 'Name') {
            handleSortByName();
            setSortBy('Name');
        } else if (value === 'Port') {
            handleSortByPort();
            setSortBy('Port');
        }
    };
    return (
        <CustomTable
            controlPanelData={controlPanelData}
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
                            <TableCell className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} />
                            <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >Sr.No.</TableCell>

                            <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSortBy('Name')}>
                               Control Panel Name
                                <IconButton align='center' aria-label='expand row' size='small'>
                                    {getSortIcon(sortBy, 'Name', sortDirection)}
                                </IconButton>
                            </TableCell>
                            <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >
                                IP Address
                            </TableCell>
                            <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSortBy('Port')}>
                                Port No.
                                <IconButton align='center' aria-label='expand row' size='small'>
                                    {getSortIcon(sortBy, 'Port', sortDirection)}
                                </IconButton>
                            </TableCell>

                            {config?.config?.esign_status === true && <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >E-Sign</TableCell>}
                            <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >Created At</TableCell>
                            <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {controlPanelData?.map((item, index) => (
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
                        {controlPanelData.length === 0 && (
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
TableControlPanelMaster.propTypes = {
    controlPanelData: PropTypes.any,
    handleUpdate: PropTypes.any,
    handleSortByName: PropTypes.any,
    handleSortByPort: PropTypes.any,
    sortDirection: PropTypes.any,
    page: PropTypes.any,
    rowsPerPage: PropTypes.any,
    totalRecords: PropTypes.any,
    handleChangePage: PropTypes.any,
    handleChangeRowsPerPage: PropTypes.any,
    apiAccess: PropTypes.any,
    config: PropTypes.any,
    handleAuthCheck: PropTypes.any,
};
export default TableControlPanelMaster;