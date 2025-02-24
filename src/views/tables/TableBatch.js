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
import { MdModeEdit, MdOutlineDomainVerification, MdOutlineCloudUpload } from 'react-icons/md';
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

const Row = ({ row, index, page, rowsPerPage, openRows, handleRowToggle, historyData, config, handleAuthCheck, handleUpdate, apiAccess, isBatchCloud }) => {
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
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>{row.batch_no}</TableCell>
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>{row.productHistory.product_name}</TableCell>
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>{row.location.location_name}</TableCell>

        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >{moment(row.manufacturing_date).format('DD/MM/YYYY')}
        </TableCell>
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >{moment(row.expiry_date).format('DD/MM/YYYY')}
        </TableCell>

        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>{row.qty}</TableCell>
        {config?.config?.esign_status === true && (
          <StatusChip
            label={row.esign_status}
            color={statusObj[row.esign_status]?.color || 'default'}
          />
        )}
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >
          {moment(row?.created_at).format('DD/MM/YYYY, hh:mm:ss a')}
        </TableCell>
        {
          isBatchCloud &&
          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >{row.sent_to_cloud ? "Completed" : "Pending"}</TableCell>
        }
        {row.esign_status === 'pending' && config?.config?.esign_status === true ? (
          <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} align='center' className='p-2'>
            <span>
              <MdOutlineDomainVerification fontSize={20} onClick={() => handleAuthCheck(row)} />
            </span>
          </TableCell>
        ) : (
          <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} align='center' className='p-2'>
            {isBatchCloud ?
              <Tooltip>
                <span>
                  <MdOutlineCloudUpload
                    fontSize={20}
                    onClick={() => (!row?.sent_to_cloud) && handleUpdate(row)}
                    style={{ cursor: (!row?.sent_to_cloud) ? 'pointer' : 'not-allowed', opacity: (!row?.sent_to_cloud) ? 1 : 0.5 }}
                  />
                </span>
              </Tooltip> :
              <Tooltip title={!apiAccess.editApiAccess ? 'No edit access' : ''}>
                <span>
                  <MdModeEdit
                    fontSize={20}
                    onClick={apiAccess.editApiAccess ? () => handleUpdate(row) : null}
                    style={{ cursor: apiAccess.editApiAccess ? 'pointer' : 'not-allowed', opacity: apiAccess.editApiAccess ? 1 : 0.5 }}
                  />
                </span>
              </Tooltip>
            }
          </TableCell>
        )}
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
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Batch No.</TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Product Name</TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Location Name</TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Manufacturing Date</TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Expiry Date</TableCell>

                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Quantity</TableCell>
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
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >{historyRow.batch_no}</TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >{historyRow.productHistory.product_name}</TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >{historyRow.location.location_name}</TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >{moment(historyRow.manufacturing_date).format('DD/MM/YYYY')}</TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >{moment(historyRow.expiry_date).format('DD/MM/YYYY')}</TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >{historyRow.qty}</TableCell>
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
const TableBatch = ({
  handleUpdate,
  handleSortLocationId,
  handleSortByProductId,
  handleSortByBatchNo,
  handleSortByQty,
  handleSortByExpiryDate,
  handleSortByManufacturingDate,
  sortDirection,
  batchData,
  page,
  rowsPerPage,
  setPage,
  setRowsPerPage,
  handleChangePage,
  totalRecords,
  handleChangeRowsPerPage,
  handleAuthCheck,
  apiAccess,
  config,
  isBatchCloud
}) => {
  const [sortBy, setSortBy] = useState('');
  const [openRows, setOpenRows] = useState({});
  const [historyData, setHistoryData] = useState({});
  const handleRowToggle = async (rowId) => {
    await handleRowToggleHelper(rowId, openRows, setOpenRows, setHistoryData, '/batch/history');
  };
  const handleSortBy = (value) => {
    if (value === 'ID') {
      handleSortByProductId();
      setSortBy('ID');
    } else if (value === 'location') {
      handleSortLocationId();
      setSortBy('location');
    } else if (value === 'batchNo') {
      handleSortByBatchNo();
      setSortBy('batchNo');
    } else if (value === 'Qty') {
      handleSortByQty();
      setSortBy('Qty');
    } else if (value === 'expiryDate') {
      handleSortByExpiryDate();
      setSortBy('expiryDate');
    } else if (value === 'manufacturingDate') {
      handleSortByManufacturingDate();
      setSortBy('manufacturingDate');
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
          <TableCell />
          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >Sr.No.</TableCell>
          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSortBy('batchNo')}>
            Batch No.
            <IconButton align='center' aria-label='expand row' size='small'>
              {getSortIcon(sortBy, 'batchNo', sortDirection)}
            </IconButton>
          </TableCell>
          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSortBy('ID')}>
            Product Name
            <IconButton align='center' aria-label='expand row' size='small'>
              {getSortIcon(sortBy, 'ID', sortDirection)}
            </IconButton>
          </TableCell>
          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSortBy('location')}>
            Location Name
            <IconButton align='center' aria-label='expand row' size='small'>
              {getSortIcon(sortBy, 'location', sortDirection)}
            </IconButton>
          </TableCell>
          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSortBy('manufacturingDate')}>
            Manufacturing Date
            <IconButton align='center' aria-label='expand row' size='small'>
              {getSortIcon(sortBy, 'manufacturingDate', sortDirection)}
            </IconButton>
          </TableCell>
          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSortBy('expiryDate')}>
            Expiry Date
            <IconButton align='center' aria-label='expand row' size='small'>
              {getSortIcon(sortBy, 'expiryDate', sortDirection)}
            </IconButton>
          </TableCell>
          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSortBy('Qty')}>
            Quantity
            <IconButton align='center' aria-label='expand row' size='small'>
              {getSortIcon(sortBy, 'Qty', sortDirection)}
            </IconButton>
          </TableCell>
          {config?.config?.esign_status === true && <TableCell align='center'>E-Sign</TableCell>}
          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >Created At</TableCell>
          {/* {console.log("Batch ", isBatchCloud)} */}
          {isBatchCloud &&
            <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >Status</TableCell>
          }
          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >Action</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {batchData?.map((item, index) => (
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
            isBatchCloud={isBatchCloud}
          />
        ))}
        {batchData?.length === 0 && (
          <TableRow>
            <TableCell colSpan={12} align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} >
              No data
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </CustomTable>
  );
};
TableBatch.propTypes = {
  handleUpdate: PropTypes.any,
  handleSortLocationId: PropTypes.any,
  handleSortByProductId: PropTypes.any,
  handleSortByBatchNo: PropTypes.any,
  handleSortByQty: PropTypes.any,
  sortDirection: PropTypes.any,
  batchData: PropTypes.any,
  page: PropTypes.any,
  rowsPerPage: PropTypes.any,
  setPage: PropTypes.any,
  setRowsPerPage: PropTypes.any,
  handleChangePage: PropTypes.any,
  totalRecords: PropTypes.any,
  handleChangeRowsPerPage: PropTypes.any,
  handleAuthCheck: PropTypes.any,
  apiAccess: PropTypes.any,
  config: PropTypes.any,

};
export default TableBatch;
