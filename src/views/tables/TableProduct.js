import { useState, Fragment } from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import Collapse from '@mui/material/Collapse';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { MdModeEdit, MdOutlineDomainVerification } from "react-icons/md";
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
import { BsDiamondHalf } from 'react-icons/bs';

const Row = ({
  row,
  index,
  isOpen,
  handleRowToggle,
  page,
  rowsPerPage,
  historyData,
  config,
  handleAuthCheck,
  handleUpdate,
  apiAccess
}) => {
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
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>{row.product_id}</TableCell>
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>{row.product_name}</TableCell>
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>{row.gtin}</TableCell>
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>{row.ndc}</TableCell>
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>{row.mrp}</TableCell>
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>{row.generic_name}</TableCell>
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>{row.packaging_size}</TableCell>
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>{row.company.company_name}</TableCell>
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>{row.countryMaster.country}</TableCell>


        {config?.config?.esign_status === true && (
          <StatusChip
            label={row.esign_status}
            color={statusObj[row.esign_status]?.color || 'default'} />
        )}
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
          {moment(row?.created_at).format('DD/MM/YYYY, hh:mm:ss a')}
          {/* {moment(row?.created_at).format('DD/MM/YYYY, hh:mm:ss a')} */}
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
          <TableCell colSpan={16} sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
            <Collapse in={isOpen} timeout='auto' unmountOnExit>
              <Box sx={{ mx: 2 }}>
                <Typography variant='h6' gutterBottom component='div'>
                  History
                </Typography>
                <Box style={{ display: 'flex', justifyContent: 'center' }}>
                  <Table size='small' aria-label='purchases'>
                    <TableHead>
                      <TableRow align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)', width: '100%' }}>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Sr.No.</TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Product ID</TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Product Name</TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>GTIN</TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>NDC No.</TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>MRP</TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Generic Name</TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Packaging Size</TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Company Name</TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Country</TableCell>
                        {config?.config?.esign_status === true && <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>E-Sign</TableCell>}
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Updated At</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {console.log(historyData)}
                      {historyData[row.id]?.map((historyRow, idx) => (
                        <TableRow key={historyRow.created_at} align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                          <TableCell component='th' scope='row' align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                            {idx + 1}
                          </TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>{historyRow.product_id}</TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>{historyRow.product_name}</TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>{historyRow.gtin}</TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>{historyRow.ndc}</TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>{historyRow.mrp}</TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>{historyRow.generic_name}</TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>{historyRow.packaging_size}</TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>{historyRow?.company?.company_name}</TableCell>
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>{historyRow?.countryMaster?.country || "NA"}</TableCell>
                          {/* {console.log(historyRow)} */}
                          {config?.config?.esign_status === true && (
                            <StatusChip
                              label={historyRow.esign_status}
                              color={statusObj[historyRow.esign_status]?.color || 'default'}
                            />
                          )}
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                            {moment(historyRow?.created_at).format('DD/MM/YYYY, hh:mm:ss a')}
                            {/* {moment(historyRow?.created_at).format('DD/MM/YYYY, hh:mm:ss a')} */}
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
  isOpen: PropTypes.any,
  handleRowToggle: PropTypes.any,
  page: PropTypes.any,
  rowsPerPage: PropTypes.any,
  historyData: PropTypes.any,
  config: PropTypes.any,
  handleAuthCheck: PropTypes.any,
  handleUpdate: PropTypes.any,
  apiAccess: PropTypes.any,
};
const TableProduct = ({
  productData,
  handleUpdate,
  sortDirection,
  handleSortById,
  handleSortByName,
  handleSortByGTIN,
  handleSortByPLevel,
  handleSortByNDC,
  handleSortByMRP,
  handleSortByGenericName,
  handleSortByCountry,
  totalRecords,
  rowsPerPage,
  page,
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
    await handleRowToggleHelper(rowId, openRows, setOpenRows, setHistoryData, '/product/history');
  };
  
  const handleSortBy = (value) => {
    if (value === 'Id') {
      handleSortById();
      setSortBy('Id');
    } else if (value === 'Name') {
      handleSortByName();
      setSortBy('Name');
    } else if (value === 'GTIN') {
      handleSortByGTIN();
      setSortBy('GTIN');
    } else if (value === 'NDC') {
      handleSortByNDC();
      setSortBy('NDC');
    } else if (value === 'MRP') {
      handleSortByMRP();
      setSortBy('MRP');
    } else if (value === 'PLevel') {
      handleSortByPLevel();
      setSortBy('PLevel');
    } else if (value === 'GenericName') {
      handleSortByGenericName();
      setSortBy('GenericName');
    }
    else if (value === 'country') {
      handleSortByCountry();
      setSortBy('country');
    }
  };
  return (
    <CustomTable
      data={productData}
      totalRecords={totalRecords}
      rowsPerPage={rowsPerPage}
      page={page}
      handleChangePage={handleChangePage}
      handleChangeRowsPerPage={handleChangeRowsPerPage}
    >
      <Box sx={{ position: 'relative', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
              <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} />
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Sr.No.</TableCell>
              <TableCell align='center' sx={{ cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} onClick={() => handleSortBy('Id')}>
                <Box display='flex' alignItems='center' justifyContent='center'>
                  Product ID
                  <IconButton aria-label='expand row' size='small'>
                    {getSortIcon(sortBy, 'ID', sortDirection)}
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell align='center' sx={{ cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} onClick={() => handleSortBy('Name')}>
                <Box display='flex' alignItems='center' justifyContent='center'>
                  Product Name
                  <IconButton aria-label='expand row' size='small'>
                    {getSortIcon(sortBy, 'Name', sortDirection)}
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell align='center' sx={{ cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} onClick={() => handleSortBy('GTIN')}>
                <Box display='flex' alignItems='center' justifyContent='center'>
                  GTIN
                  <IconButton aria-label='expand row' size='small'>
                    {getSortIcon(sortBy, 'GTIN', sortDirection)}
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell align='center' sx={{ cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} onClick={() => handleSortBy('NDC')}>
                <Box display='flex' alignItems='center' justifyContent='center'>
                  NDC No.
                  <IconButton aria-label='expand row' size='small'>
                    {getSortIcon(sortBy, 'NDC', sortDirection)}
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell align='center' sx={{ cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} onClick={() => handleSortBy('MRP')}>
                <Box display='flex' alignItems='center' justifyContent='center'>
                  MRP
                  <IconButton aria-label='expand row' size='small'>
                    {getSortIcon(sortBy, 'MRP', sortDirection)}
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell align='center' sx={{ cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} onClick={() => handleSortBy('GenericName')}>
                <Box display='flex' alignItems='center' justifyContent='center'>
                  Generic Name
                  <IconButton aria-label='expand row' size='small'>
                    {getSortIcon(sortBy, 'GenericName', sortDirection)}
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell align='center' sx={{ cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} onClick={() => handleSortBy('PackagingSize')}>
                <Box display='flex' alignItems='center' justifyContent='center'>
                  Packaging Size
                  <IconButton aria-label='expand row' size='small'>
                    {getSortIcon(sortBy, 'PackagingSize', sortDirection)}
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell align='center' sx={{ cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} onClick={() => handleSortBy('CompanyName')}>
                <Box display='flex' alignItems='center' justifyContent='center'>
                  Company Name
                  <IconButton aria-label='expand row' size='small'>
                    {getSortIcon(sortBy, 'CompanyName', sortDirection)}
                  </IconButton>
                </Box>
              </TableCell>
              <TableCell align='center' sx={{ cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} onClick={() => handleSortBy('country')}>
                <Box display='flex' alignItems='center' justifyContent='center'>
                  Country
                  <IconButton aria-label='expand row' size='small'>
                    {getSortIcon(sortBy, 'Country', sortDirection)}
                  </IconButton>
                </Box>
              </TableCell>
              {config?.config?.esign_status === true && (
                <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>E-Sign</TableCell>
              )}
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Created At</TableCell>
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {productData?.map((item, index) => (
              <Row
                key={item.id}
                row={item}
                index={index}
                isOpen={openRows[item.id]}
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
            {productData?.length === 0 && (
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
  );
};
TableProduct.propTypes = {
  productData: PropTypes.any,
  handleUpdate: PropTypes.any,
  sortDirection: PropTypes.any,
  handleSortById: PropTypes.any,
  handleSortByName: PropTypes.any,
  handleSortByGTIN: PropTypes.any,
  handleSortByPLevel: PropTypes.any,
  handleSortByNDC: PropTypes.any,
  handleSortByMRP: PropTypes.any,
  handleSortByGenericName: PropTypes.any,
  totalRecords: PropTypes.any,
  rowsPerPage: PropTypes.any,
  page: PropTypes.any,
  handleChangePage: PropTypes.any,
  handleChangeRowsPerPage: PropTypes.any,
  apiAccess: PropTypes.any,
  config: PropTypes.any,
  handleAuthCheck: PropTypes.any
};
export default TableProduct;
