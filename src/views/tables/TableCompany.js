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
import { getSerialNumber } from 'src/configs/generalConfig';
import { handleRowToggleHelper } from 'src/utils/rowUtils';
import StatusChip from 'src/components/StatusChip';
import moment from 'moment';

const Row = ({ row, index, openRows, handleRowToggle, page, rowsPerPage, historyData, config, handleAuthCheck, handleUpdate, apiAccess,
}) => {
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
        <TableCell
          align='center'
          component='th'
          scope='row'
          className='p-2'
          sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
        >
          {serialNumber}
        </TableCell>
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} className='p-2'>
          {row.company_id}
        </TableCell>
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} className='p-2'>
          {row.company_name}
        </TableCell>
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} className='p-2'>
          {row.mfg_licence_no}
        </TableCell>
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} className='p-2'>
          {row.email}
        </TableCell>
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} className='p-2'>
          {row.contact}
        </TableCell>
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} className='p-2'>
          {row.address}
        </TableCell>
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} className='p-2'>
          {row.gs1_prefix}
        </TableCell>
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} className='p-2'>
          {row.gs2_prefix}
        </TableCell>
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} className='p-2'>
          {row.gs3_prefix}
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
                data-testid={`auth-check-icon-${row.id}`}
                fontSize={20}
                onClick={() => handleAuthCheck(row)}
              />
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
                    opacity: apiAccess.editApiAccess ? 1 : 0.5,
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
                          Company ID
                        </TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                          Company Name
                        </TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                          Mfg.Lic
                        </TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                          Email
                        </TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                          Contact No.
                        </TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                          Address
                        </TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                        GS1 Prefix
                        </TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                        GS2 Prefix
                        </TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                        GS3 Prefix
                        </TableCell>
                        {config?.config?.esign_status === true && <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>E-Sign</TableCell>}
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                          Updated At
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
                          <TableCell component='th' scope='row' align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >
                            {idx + 1}
                          </TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >{historyRow.company_id}</TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >{historyRow.company_name}</TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >{historyRow.mfg_licence_no}</TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >{historyRow.email}</TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >{historyRow.contact}</TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >{historyRow.address}</TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >{historyRow.gs1_prefix}</TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >{historyRow.gs2_prefix}</TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >{historyRow.gs3_prefix}</TableCell>
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
  openRows: PropTypes.any,
  handleRowToggle: PropTypes.any,
  page: PropTypes.any,
  rowsPerPage: PropTypes.any,
  historyData: PropTypes.any,
  config: PropTypes.any,
  handleAuthCheck: PropTypes.any,
  handleUpdate: PropTypes.any,
  apiAccess: PropTypes.any,
};
const TableCompany = ({
  companyData,
  handleUpdate,
  sortDirection,
  handleSortByID,
  handleSortByName,
  handleSortByLicNo,
  handleSortByEmail,
  handleSortByContact,
  handleSortByAddress,
  handleSortByFirstGsprefix,
  handleSortBySecondGsprefix,
  handleSortByThirdGsprefix,
  page,
  rowsPerPage,
  setPage,
  setRowsPerPage,
  handleChangePage,
  totalRecords,
  handleChangeRowsPerPage,
  apiAccess,
  config,
  handleAuthCheck,
}) => {
  console.log(companyData,'check224');
  
  const [sortBy, setSortBy] = useState('');
  const [openRows, setOpenRows] = useState({});
  const [historyData, setHistoryData] = useState({});
  const handleRowToggle = async (rowId) => {
    await handleRowToggleHelper(rowId, openRows, setOpenRows, setHistoryData, '/company/history');
  };
  const handleSortBy = (value) => {
    if (value === 'ID') {
      handleSortByID();
      setSortBy('ID');
    } else if (value === 'Name') {
      handleSortByName();
      setSortBy('Name');
    } else if (value === 'LicNo') {
      handleSortByLicNo();
      setSortBy('LicNo');
    } else if (value === 'Email') {
      handleSortByEmail();
      setSortBy('Email');
    } else if (value === 'Contact') {
      handleSortByContact();
      setSortBy('Contact');
    } else if (value === 'Address') {
      handleSortByAddress();
      setSortBy('Address');
    }else if( value === 'GS1 Prefix'){
      handleSortByFirstGsprefix(),
      setSortBy('GS1 Prefix');
    }else if( value === 'GS2 Prefix'){
      handleSortBySecondGsprefix(),
      setSortBy('GS2 Prefix');
    }else if( value === 'GS3 Prefix'){
      handleSortByThirdGsprefix(),
      setSortBy('GS3 Prefix');
    }
  };

  return (
    <CustomTable
      totalRecords={totalRecords}
      page={page}
      rowsPerPage={rowsPerPage}
      setPage={setPage}
      setRowsPerPage={setRowsPerPage}
      handleChangePage={handleChangePage}
      handleChangeRowsPerPage={handleChangeRowsPerPage}
    >
      <TableHead>
        <TableRow sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} />
          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >Sr.No.</TableCell>
          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSortBy('ID')}>
            Company ID
            <IconButton align='center' aria-label='expand row' size='small' data-testid={`sort-icon-${sortBy}`}>
              {getSortIcon(sortBy, 'ID', sortDirection)}
            </IconButton>
          </TableCell>
          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSortBy('Name')}>
            Company Name
            <IconButton align='center' aria-label='expand row' size='small'>
              {getSortIcon(sortBy, 'Name', sortDirection)}
            </IconButton>
          </TableCell>
          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSortBy('LicNo')}>
            Mfg.Lic
            <IconButton align='center' aria-label='expand row' size='small'>
              {getSortIcon(sortBy, 'LicNo', sortDirection)}
            </IconButton>
          </TableCell>
          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSortBy('Email')}>
            Email
            <IconButton align='center' aria-label='expand row' size='small'>
              {getSortIcon(sortBy, 'Email', sortDirection)}
            </IconButton>
          </TableCell>
          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSortBy('Contact')}>
            Contact No.
            <IconButton align='center' aria-label='expand row' size='small'>
              {getSortIcon(sortBy, 'Contact', sortDirection)}
            </IconButton>
          </TableCell>
          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSortBy('Address')}>
            Address
            <IconButton align='center' aria-label='expand row' size='small'>
              {getSortIcon(sortBy, 'Address', sortDirection)}
            </IconButton>
          </TableCell>
          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSortBy('GS1 Prefix')}>
          GS1 Prefix
            <IconButton align='center' aria-label='expand row' size='small'>
              {getSortIcon(sortBy, 'GS1 Prefix', sortDirection)}
            </IconButton>
          </TableCell>
          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSortBy('GS2 Prefix')}>
          GS2 Prefix
            <IconButton align='center' aria-label='expand row' size='small'>
              {getSortIcon(sortBy, 'GS2 Prefix', sortDirection)}
            </IconButton>
          </TableCell>
          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSortBy('GS3 Prefix')}>
          GS3 Prefix
            <IconButton align='center' aria-label='expand row' size='small'>
              {getSortIcon(sortBy, 'GS3 Prefix', sortDirection)}
            </IconButton>
          </TableCell>
          {config?.config?.esign_status === true && <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >E-Sign</TableCell>}
          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >Created At</TableCell>
          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
            Action
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {companyData?.map((item, index) => (
          <Row
            key={index + 1}
            row={item}
            index={index}
            openRows={openRows}
            handleRowToggle={handleRowToggle}
            page={page}
            rowsPerPage={rowsPerPage}
            historyData={historyData}
            config={config}
            handleAuthCheck={handleAuthCheck}
            handleUpdate={handleUpdate}
            apiAccess={apiAccess}
          />
        ))}
        {companyData?.length === 0 && (
          <TableRow sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
            <TableCell colSpan={12} align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >
              No data
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </CustomTable>
  );
};
TableCompany.propTypes = {
  companyData: PropTypes.any,
  handleUpdate: PropTypes.any,
  sortDirection: PropTypes.any,
  handleSortByID: PropTypes.any,
  handleSortByName: PropTypes.any,
  handleSortByLicNo: PropTypes.any,
  handleSortByEmail: PropTypes.any,
  handleSortByContact: PropTypes.any,
  handleSortByAddress: PropTypes.any,
  handleSortByFirstGsprefix: PropTypes.any,
  handleSortBySecondGsprefix: PropTypes.any,
  handleSortByThirdGsprefix: PropTypes.any,
  page: PropTypes.any,
  rowsPerPage: PropTypes.any,
  setPage: PropTypes.any,
  setRowsPerPage: PropTypes.any,
  handleChangePage: PropTypes.any,
  totalRecords: PropTypes.any,
  handleChangeRowsPerPage: PropTypes.any,
  apiAccess: PropTypes.any,
  config: PropTypes.any,
  handleAuthCheck: PropTypes.any,
};
export default TableCompany;
