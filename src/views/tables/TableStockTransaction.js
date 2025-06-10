import { useState, useEffect } from 'react'
import{Box,Table,TableRow,TableHead,TableBody,TableCell} from '@mui/material'
import IconButton from '@mui/material/IconButton'
import { getSortIcon } from 'src/utils/sortUtils';
import { useLoading } from 'src/@core/hooks/useLoading'
import { useAuth } from 'src/Context/AuthContext'
import { api } from 'src/utils/Rest-API'
import { useRouter } from 'next/router'

const TableStockTransaction = ({
  
}) => {
  const [sortBy, setSortBy] = useState('');
  const [sortDirection, setSortDirection] = useState('asc')
  const [designationData, setDesignationData] = useState([])
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
          </TableBody>
        </Table>
      </Box>
   
  );
};
TableStockTransaction.propTypes = {
 
};
export default TableStockTransaction;