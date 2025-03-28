import { useState, Fragment, useEffect } from 'react'
import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import Collapse from '@mui/material/Collapse'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import Typography from '@mui/material/Typography'
import { MdModeEdit, MdOutlineDomainVerification } from 'react-icons/md'
import IconButton from '@mui/material/IconButton'
import ChevronUp from 'mdi-material-ui/ChevronUp'
import ChevronDown from 'mdi-material-ui/ChevronDown'
import moment from 'moment'
import { Tooltip } from '@mui/material';
import PropTypes from 'prop-types';
import { statusObj } from 'src/configs/statusConfig';
import { getSortIcon } from 'src/utils/sortUtils';
import { handleRowToggleHelper } from 'src/utils/rowUtils'
import StatusChip from 'src/components/StatusChip'
import { useLoading } from 'src/@core/hooks/useLoading'
import { useAuth } from 'src/Context/AuthContext'
import { api } from 'src/utils/Rest-API'
import { useRouter } from 'next/router'

const Row = ({
  row,
  index,
  openRows,
  handleRowToggle,
  historyData,
  handleAuthCheck,
  apiAccess,
  handleUpdateDes,
  config_dept
}) => {
  const isOpen = openRows[row.id];
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
          {index + 1}
        </TableCell>
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>{row.designation_id}</TableCell>
        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>{row.designation_name}</TableCell>
        {config_dept?.config?.esign_status === true && config_dept?.role!=='admin' && (
          <StatusChip
            label={row.esign_status}
            color={statusObj[row.esign_status]?.color || 'default'} />
        )}
        <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} align='center' className='p-2'>
          {row.esign_status === 'pending' && config_dept?.config?.esign_status === true && config_dept?.role!=='admin' ? (
            <span>
              <MdOutlineDomainVerification
                fontSize={20}
                data-testid={`auth-check-icon-${row.id}`}
                onClick={() => handleAuthCheck(row)}
              />
            </span>
          ) : (
            <Tooltip title={!apiAccess.editDesignationApiAccess ? 'No edit access' : ''}>
              <span>
                <MdModeEdit
                  fontSize={20}
                  data-testid={`edit-designation-${row.id}`}
                  onClick={apiAccess.editDesignationApiAccess ? () => handleUpdateDes(row) : null}
                  style={{ cursor: apiAccess.editDesignationApiAccess ? 'pointer' : 'not-allowed', opacity: apiAccess.editDesignationApiAccess ? 1 : 0.5 }}
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
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)', fontSize: '10px' }}>
                          Sr.No.
                        </TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)', fontSize: '8px' }}>
                          Designation ID
                        </TableCell>
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                          Designation Name
                        </TableCell>
                        {

                          config_dept?.config?.esign_status === true  && config_dept?.role!=='admin' &&
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                            E-Sign
                          </TableCell>
                        }
                        <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)', width: '20%' }}>
                          Updated At
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {historyData[row.id]?.map((historyRow, idx) => (
                        <TableRow key={historyRow.created_at} align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                          <TableCell component='th' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} scope='row' align='center'>
                            {idx + 1}
                          </TableCell>
                          <TableCell component='th' scope='row' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} align='center'>
                            {historyRow.designation_id}
                          </TableCell>
                          <TableCell component='th' scope='row' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} align='center'>
                            {historyRow.designation_name}
                          </TableCell>
                          {
                            config_dept?.config?.esign_status === true  && config_dept?.role!=='admin' &&
                            <StatusChip
                              label={historyRow.esign_status}
                              color={statusObj[historyRow.esign_status]?.color || 'default'}
                            />
                          }
                          <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                            {moment(historyRow.created_at).format('DD/MM/YYYY, hh:mm:ss a')}
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
  historyData: PropTypes.any,
  handleAuthCheck: PropTypes.any,
  apiAccess: PropTypes.any,
  handleUpdateDes: PropTypes.any,
  config_dept: PropTypes.any
};
const TableDesignation = ({
  handleUpdateDes,
  departmentId,
  handleAuthCheck,
  apiAccess,
  config_dept,
  openModalDes,
  setArrayDesignation
}) => {
  const [sortBy, setSortBy] = useState('');
  const [sortDirection, setSortDirection] = useState('asc')
  const [openRows, setOpenRows] = useState({});
  const [historyData, setHistoryData] = useState({});
  const [designationData, setDesignationData] = useState([])
  const handleRowToggle = async (rowId) => {
    await handleRowToggleHelper(rowId, openRows, setOpenRows, setHistoryData, '/designation/history');
  };

  const { setIsLoading } = useLoading()
  const { removeAuthToken } = useAuth()
  const router = useRouter()



  const getDesignations = async () => {
    try {
      setIsLoading(true)
      const res = await api(`/designation/${departmentId}`, {}, 'get', true)
      setIsLoading(false)
      console.log('All designations ', res.data)
      if (res.data.success) {
        setDesignationData(res.data.data.designations)
        setArrayDesignation(res.data.data.designations)
      } else if (res.data.code === 401) {
        removeAuthToken()
        router.push('/401')
      }
    } catch (error) {
      console.log('Error in get designation ', error)
      setIsLoading(false)
    }
  }
  useEffect(() => {
    getDesignations()
  }, [departmentId, openModalDes])
  const handleSort = (key, isBoolean = false) => {
    const newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    const booleanSort = (a, b) => {
      if (a[key] === b[key]) return 0;
      let comparison = a[key] ? 1 : -1;
      if (newSortDirection !== 'asc') {
        comparison = a[key] ? -1 : 1;
      }
      return comparison;
    };
    const regularSort = (a, b) => {
      if (a[key] === b[key]) return 0;
      let comparison = a[key] > b[key] ? 1 : -1;
      if (newSortDirection !== 'asc') {
        comparison = a[key] > b[key] ? -1 : 1;
      }
      return comparison;
    };
    const sorted = [...designationData].sort(isBoolean ? booleanSort : regularSort);
    setDesignationData(sorted);
    setSortDirection(newSortDirection);
    setSortBy(key)
  };
  return (
    <Box sx={{ position: 'relative', maxHeight: 'calc(100vh - 200px)', marginTop: '30px' }}>
      {console.log(designationData)}
      <Box style={{ padding: '40px' }}>
        <Table stickyHeader style={{ border: '1px solid #eeeeee' }}>
          <TableHead>
            <TableRow sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
              <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} />
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Sr.No.</TableCell>
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSort('designation_id')}>
                Designation ID
                <IconButton align='center' aria-label='expand row' size='small' data-testid={`sort-icon-${sortBy}`}>
                  {getSortIcon(sortBy, 'designation_id', sortDirection)}
                </IconButton>
              </TableCell>
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSort('designation_name')}>
                Designation Name
                <IconButton align='center' aria-label='expand row' size='small'>
                  {getSortIcon(sortBy, 'designation_name', sortDirection)}
                </IconButton>
              </TableCell>
              {config_dept?.config?.esign_status === true && config_dept?.role!=='admin' && <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>E-Sign</TableCell>}
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {designationData?.map((item, index) => (
              <Row
                key={index + 1}
                row={item}
                index={index}
                openRows={openRows}
                handleRowToggle={handleRowToggle}
                historyData={historyData}
                handleAuthCheck={handleAuthCheck}
                apiAccess={apiAccess}
                handleUpdateDes={handleUpdateDes}
                config_dept={config_dept}
              />
            ))}
            {designationData?.length === 0 && (
              <TableRow sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                <TableCell colSpan={12} align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                  No data
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
};
TableDesignation.propTypes = {
  handleUpdateDes: PropTypes.any,
  handleAuthCheck: PropTypes.any,
  apiAccess: PropTypes.any,
  config_dept: PropTypes.any,
  departmentId: PropTypes.any,
  setArrayDesignation: PropTypes.any,
  openModalDes: PropTypes.any
};
export default TableDesignation;