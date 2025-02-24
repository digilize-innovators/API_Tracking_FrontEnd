import Box from '@mui/material/Box'
import UserDropdown from 'src/@core/layouts/components/shared-components/UserDropdown'

const AppBarContent = () => {

  return (
    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
      <Box className='actions-right' sx={{ display: 'flex', alignItems: 'center' }}>
        <UserDropdown />
      </Box>
    </Box>
  )
}
export default AppBarContent