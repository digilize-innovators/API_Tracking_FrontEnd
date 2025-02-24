import React, { useState, Fragment } from 'react';
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
  Tooltip,
} from '@mui/material';
import { MdModeEdit, MdOutlineDomainVerification } from 'react-icons/md';
import ChevronUp from 'mdi-material-ui/ChevronUp';
import ChevronDown from 'mdi-material-ui/ChevronDown';
import CustomTable from 'src/components/CustomTable';
import moment from 'moment';
import PropTypes from 'prop-types';
import { statusObj } from 'src/configs/statusConfig';
import { getSortIcon } from 'src/utils/sortUtils';
import { getSerialNumber } from 'src/configs/generalConfig';
import { handleRowToggleHelper } from 'src/utils/rowUtils';
import StatusChip from 'src/components/StatusChip';

const Row = ({ row, index, page, rowsPerPage, openRows, handleRowToggle, historyData, config, handleAuthCheck, handleUpdate, apiAccess, }) => {
  const isOpen = openRows[row.id];
  const serialNumber = getSerialNumber(index, page, rowsPerPage);
  return (
    <Fragment>
      <TableRow sx={{ '& > *': { borderBottom: '1px solid rgba(224, 224, 224, 1)' } }}>
        <TableCell className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          <IconButton align='center' aria-label='expand row' size='small' onClick={() => handleRowToggle(row.id)}>
            {isOpen ? <ChevronUp /> : <ChevronDown />}
          </IconButton>
        </TableCell>
        <TableCell align='center' component='th' scope='row' className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          {serialNumber}
        </TableCell>
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          {row.user_id}
        </TableCell>
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          {row.user_name}
        </TableCell>
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          {row.department?.department_name}
        </TableCell>
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          {row.designation?.designation_name}
        </TableCell>
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          {row.location?.location_name}
        </TableCell>
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          {row.email}
        </TableCell>
        <StatusChip
          label={row.is_active ? 'enabled' : 'disabled'}
          color={statusObj[row.is_active ? 'enabled' : 'disabled']?.color || 'default'}
        />
        {config?.config?.esign_status === true && (
          <StatusChip
            label={row.esign_status}
            color={statusObj[row.esign_status]?.color || 'default'}
          />
        )}
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >{moment(row?.created_at).format('DD/MM/YYYY, hh:mm:ss')}</TableCell>
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
                <Box style={{ display: 'flex', justifyContent: 'center' }}>
                  <Table size='small' aria-label='purchases'>
                    <TableHead>
                      <TableRow>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Sr.No.</TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>User ID</TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>User Name</TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Department Name</TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Designation Name</TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Location Name</TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Email</TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Status</TableCell>
                        {config?.config?.esign_status === true && <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>E-Sign</TableCell>}
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Updated At</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {historyData[row.id]?.map((historyRow, idx) => (
                        <TableRow key={historyRow.id} align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                          <TableCell component='th' scope='row' align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >
                            {idx + 1}
                          </TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >{historyRow.user_id}</TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >{historyRow.user_name}</TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >{historyRow.department.department_name}</TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >{historyRow.designation.designation_name}</TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >{historyRow.location.location_name}</TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >{historyRow.email}</TableCell>
                          <StatusChip
                            label={historyRow.is_active ? 'enabled' : 'disabled'}
                            color={statusObj[historyRow.is_active ? 'enabled' : 'disabled']?.color || 'default'}
                          />
                          {config?.config?.esign_status === true && (
                            <StatusChip
                              label={historyRow.esign_status}
                              color={statusObj[historyRow.esign_status]?.color || 'default'}
                            />
                          )}
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >
                            {moment(historyRow?.created_at).format('DD/MM/YYYY, hh:mm:ss')}
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
const TableCollapsibleUser = ({
  userData,
  handleSortByDepName,
  handleSortByDesName,
  handleSortByEmail,
  handleSortByUserID,
  handleSortByUserName,
  handleUpdate,
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
    await handleRowToggleHelper(rowId, openRows, setOpenRows, setHistoryData, '/user/history');
  };
  const handleSortBy = (value) => {
    if (value === 'UserID') {
      handleSortByUserID();
      setSortBy('UserID');
    } else if (value === 'UserName') {
      handleSortByUserName();
      setSortBy('UserName');
    } else if (value === 'DepName') {
      handleSortByDepName();
      setSortBy('DepName');
    } else if (value === 'DesName') {
      handleSortByDesName();
      setSortBy('DesName');
    } else if (value === 'Email') {
      handleSortByEmail();
      setSortBy('Email');
    }
  };
  return (
    <CustomTable
      data={userData}
      page={page}
      rowsPerPage={rowsPerPage}
      totalRecords={totalRecords}
      handleChangePage={handleChangePage}
      handleChangeRowsPerPage={handleChangeRowsPerPage}
    >
      <Box sx={{ position: 'relative', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
              <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} />
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >Sr.No.</TableCell>
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSortBy('UserID')}>
                User ID
                <IconButton align='center' aria-label='expand row' size='small' data-testid={`sort-icon-${sortBy}`}>
                  {getSortIcon(sortBy, 'UserID', sortDirection)}
                </IconButton>
              </TableCell>
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSortBy('UserName')}>
                User Name
                <IconButton align='center' aria-label='expand row' size='small'>
                  {getSortIcon(sortBy, 'UserName', sortDirection)}
                </IconButton>
              </TableCell>
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSortBy('DepName')}>
                Department Name
                <IconButton align='center' aria-label='expand row' size='small'>
                  {getSortIcon(sortBy, 'DepName', sortDirection)}
                </IconButton>
              </TableCell>
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSortBy('DesName')}>
                Designation Name
                <IconButton align='center' aria-label='expand row' size='small'>
                  {getSortIcon(sortBy, 'DesName', sortDirection)}
                </IconButton>
              </TableCell>
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >Location Name</TableCell>
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSortBy('Email')}>
                Email
                <IconButton align='center' aria-label='expand row' size='small'>
                  {getSortIcon(sortBy, 'Email', sortDirection)}
                </IconButton>
              </TableCell>
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >Status</TableCell>
              {config?.config?.esign_status === true && <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >E-Sign</TableCell>}
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >Created At</TableCell>
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {userData?.map((item, index) => (
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
            {userData?.length === 0 && (
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
TableCollapsibleUser.propTypes = {
  userData: PropTypes.any,
  handleSortByDepName: PropTypes.any,
  handleSortByDesName: PropTypes.any,
  handleSortByEmail: PropTypes.any,
  handleSortByUserID: PropTypes.any,
  handleSortByUserName: PropTypes.any,
  handleUpdate: PropTypes.any,
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
export default TableCollapsibleUser;
