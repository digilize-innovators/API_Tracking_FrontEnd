import { useState, Fragment, useEffect, useMemo } from 'react';
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
import { useLoading } from 'src/@core/hooks/useLoading';
import { useAuth } from 'src/Context/AuthContext';
import { api } from 'src/utils/Rest-API';
import { useRouter } from 'next/router';
import { useSettings } from 'src/@core/hooks/useSettings';

const Row = ({
    row,
    index,
    handleRowToggle,
    page,
    rowsPerPage,
    config,
    handleUpdate,
    apiAccess
}) => {
    const serialNumber = getSerialNumber(index, page, rowsPerPage);
    return (
        <Fragment>
            <TableRow sx={{ '& > *': { borderBottom: '1px solid rgba(224, 224, 224, 1)' } }}>
                <TableCell className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                    <IconButton align='center' aria-label='expand row' size='small' onClick={() => handleRowToggle(row.id)}>
                        {/* {isOpen ? <ChevronUp /> : <ChevronDown />} */}
                    </IconButton>
                </TableCell>
                <TableCell align='center' component='th' scope='row' className='p-2' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                    {serialNumber}
                </TableCell>
                <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>{row.country}</TableCell>
                <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>{row.codeStructure}</TableCell>

                {config?.config?.esign_status === true && (
                    <StatusChip
                        label={row.esign_status}
                        color={statusObj[row.esign_status]?.color || 'default'} />
                )}
                <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                    {moment(row?.created_at).format('DD/MM/YYYY, hh:mm:ss')}
                </TableCell>
                <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }} align='center' className='p-2'>
                    {row.esign_status === 'pending' && config?.config?.esign_status === true ? (
                        <span>
                            <MdOutlineDomainVerification
                                fontSize={20}
                                data-testid={`auth-check-icon-${row.id}`}
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
    config: PropTypes.any,
    handleUpdate: PropTypes.any,
    apiAccess: PropTypes.any,
};
const TableCountryMaster = ({
    openModal,
    handleUpdate,
    config,
}) => {
    const [sortBy, setSortBy] = useState('');
    const [openRows, setOpenRows] = useState({});
    const [historyData, setHistoryData] = useState({});
    const [countryMasterData,setCountryMasterData]=useState({data:[],total:0})
    const handleRowToggle = async (rowId) => {
        await handleRowToggleHelper(rowId, openRows, setOpenRows, setHistoryData, '/product/history');
    };

    const {setIsLoading}=useLoading()
    const {removeAuthToken}=useAuth()
    const router=useRouter()
    const [page,setPage]=useState(1)
    const {settings}=useSettings()
    const [sortDirection,setSortDirection]=useState('asc')
    const [rowsPerPage,setRowsPerPage]=useState(settings.rowsPerPage)
    console.log(rowsPerPage)
    useMemo(()=>{
        setPage(0)
},[page,rowsPerPage]);

    useEffect(() => {
        getCountryMasterData()
      }, [page,openModal,rowsPerPage]);

      const handleChangePage = (event, newPage) => {
        setPage(newPage)
      }

          
      const handleSort = (key,child) => {
        const newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc'
        const data=countryMasterData?.data
        const sorted = [...data].sort((a, b) => {
            if(!child){
                if (a[key] > b[key]) {
                return newSortDirection === 'asc' ? 1 : -1
              }
    
              if (a[key] < b[key]) {
                return newSortDirection === 'asc' ? -1 : 1
              }
              return 0
            }
            else{
                if (a[key][child] > b[key][child]) {
                    return newSortDirection === 'asc' ? 1 : -1
                  }
        
                  if (a[key][child] < b[key][child]) {
                    return newSortDirection === 'asc' ? -1 : 1
                  }
                  return 0
            }
        })
        setCountryMasterData({...countryMasterData,data:sorted})
        setSortDirection(newSortDirection)
        setSortBy(key)
      }
    
      const handleChangeRowsPerPage = event => {
        const newRowsPerPage = parseInt(event.target.value, 10)
        setRowsPerPage(newRowsPerPage)
        setPage(0)
      }

    const getCountryMasterData = async () => {
        try {
          setIsLoading(true)
          const res = await api(`/country-master?limit=${rowsPerPage}&page=${page+1}`, {}, 'get', true)
          setIsLoading(false)
          console.log('All Country Master Data : ', res?.data?.data)
          if (res.data.success) {
            setCountryMasterData({data:res.data.data.countryMaster,total:res.data.data.totalRecords})

          } else {
            console.log('Error to get all country master ', res.data)
            if (res.data.code === 401) {
              removeAuthToken()
              router.push('/401')
            }
          }
        } catch (error) {
          console.log('Error in get country master ', error)
          setIsLoading(false)
        }
      }

    return (
        <CustomTable
        data={countryMasterData?.data}
        totalRecords={countryMasterData?.total}
        page={page}
        rowsPerPage={rowsPerPage}
        setPage={setPage}
        setRowsPerPage={setRowsPerPage}
        handleChangePage={handleChangePage}
        handleChangeRowsPerPage={handleChangeRowsPerPage}
        >
            {/* <Box sx={{ position: 'relative', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}> */}
                {/* <Table stickyHeader> */}
                    <TableHead>
                        <TableRow sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                            <TableCell sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} />
                            <TableCell align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Sr.No.</TableCell>
                            <TableCell align='center' sx={{ cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} onClick={() => handleSort('country')}>
                                <Box display='flex' alignItems='center' justifyContent='center'>
                                    Country
                                    <IconButton aria-label='expand row' size='small'>
                                        {getSortIcon(sortBy, 'ID', sortDirection)}
                                    </IconButton>
                                </Box>
                            </TableCell>
                            <TableCell align='center' sx={{ cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} onClick={() => handleSort('codeStructure')}>
                                <Box display='flex' alignItems='center' justifyContent='center'>
                                    Code Structure
                                    <IconButton aria-label='expand row' size='small'>
                                        {getSortIcon(sortBy, 'Name', sortDirection)}
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
                        {countryMasterData?.data?.map((item, index) => (
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
                                handleUpdate={handleUpdate}
                                apiAccess={{editApiAccess:true}}
                            />
                        ))}
                        {countryMasterData?.length === 0 && (
                            <TableRow sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                                <TableCell colSpan={12} align='center' sx={{ borderBottom: '1px solid rgba(224, 224, 224, 1)' }}>
                                    No data
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                {/* </Table>
            </Box> */}
        </CustomTable>
    );
};
TableCountryMaster.propTypes = {
    handleUpdate: PropTypes.any,
    openModal:PropTypes.any,
    config: PropTypes.any,
};
export default TableCountryMaster;