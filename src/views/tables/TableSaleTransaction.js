import { useState, Fragment, useEffect } from 'react'
import{Box,Table,Collapse,TableRow,TableHead,TableBody,TableCell,Typography} from '@mui/material'
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
 
}) => {
  return (
    <Fragment>
      <TableRow sx={{ '& > *': { borderBottom: '1px solid rgba(224, 224, 224, 1)' } }}>
        
        <TableCell
          align='center'
          component='th'
          scope='row'
          className='p-2'
          sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
        >
          {index + 1}
        </TableCell>
        {/* <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>{row.designation_id}</TableCell>
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
        </TableCell> */}
      </TableRow>
     
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
const TableSaleTransaction = ({
  saleDetail
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
    console.log('1212')
    getDesignations()
  }, [])
  
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
  console.log("saleDetail",'in view',saleDetail)
  return (
      <Box sx={{ position: 'relative', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', width: '100%' }}>
      
        <Table stickyHeader sx={{ width: '100%' }}>
          <TableHead>
            <TableRow sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>Sr.No.</TableCell>
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSort('designation_id')}>
               Status
                <IconButton align='center' aria-label='expand row' size='small' data-testid={`sort-icon-${sortBy}`}>
                  {getSortIcon(sortBy, 'designation_id', sortDirection)}
                </IconButton>
              </TableCell>
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSort('designation_name')}>
                Transaction Id
                <IconButton align='center' aria-label='expand row' size='small'>
                  {getSortIcon(sortBy, 'designation_name', sortDirection)}
                </IconButton>
              </TableCell>
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSort('designation_name')}>
                User
                <IconButton align='center' aria-label='expand row' size='small'>
                  {getSortIcon(sortBy, 'designation_name', sortDirection)}
                </IconButton>
              </TableCell>
              <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} style={{ cursor: 'pointer' }} onClick={() => handleSort('designation_name')}>
                   Created At
                <IconButton align='center' aria-label='expand row' size='small'>
                  {getSortIcon(sortBy, 'designation_name', sortDirection)}
                </IconButton>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
             {saleDetail?.map((item, index) => (
              <Row
                key={index + 1}
                row={item}
                index={index}
                openRows={openRows}
              />
            ))} 
            {saleDetail?.length === 0 && (
              <TableRow sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                <TableCell colSpan={12} align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                  No data
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
   
  );
};
TableSaleTransaction.propTypes = {
  saleDetail:PropTypes.any
};
export default TableSaleTransaction;