
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemButton from '@mui/material/ListItemButton'
import UserIcon from 'src/layouts/components/UserIcon'
import { useRouter } from 'next/router'
import themeConfig from 'src/configs/themeConfig'
import Box from '@mui/material/Box'
import { handleURLQueries } from 'src/@core/layouts/utils'
import PropTypes from 'prop-types'

const VerticalNavSectionTitle = props => {
  const { item } = props
  const router = useRouter()
  const IconTag = item.icon

  const MenuNavLink = styled(ListItemButton)(({ theme }) => ({
    width: '100%',
    borderTopRightRadius: 100,
    borderBottomRightRadius: 100,
    color: theme.palette.text.primary,
    padding: theme.spacing(2.25, 3.5),
    transition: 'opacity .25s ease-in-out',
    '&.active, &.active:hover': {
      boxShadow: theme.shadows[3],
      backgroundColor: theme.palette.primary.main,
      backgroundImage: 'none'
    },
    '&.active .MuiTypography-root, &.active .MuiSvgIcon-root': {
      color: `${theme.palette.common.white} !important`
    }
  }))


  const isNavLinkActive = () => {
    return router.pathname === item.path || handleURLQueries(router, item.path);
  }

  const MenuItemTextMetaWrapper = styled(Box)({
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'opacity .25s ease-in-out',
    ...(themeConfig.menuTextTruncate && { overflow: 'hidden' })
  })

  return (
    <ListItem disablePadding className='nav-link' sx={{ mt: 1.5, px: '0 !important' }} style={{ width: '100%' }}>
      <Link passHref href={item.path}>
        <MenuNavLink
          component={'a'}
          className={isNavLinkActive() ? 'active' : ''}
          onClick={() => { }}
          sx={{
            pl: 5.5,
            ...{ cursor: 'pointer' }
          }}
        >
          <ListItemIcon
            sx={{
              mr: 2.5,
              color: 'text.primary',
              transition: 'margin .25s ease-in-out'
            }}
          >
            <UserIcon icon={IconTag} />
          </ListItemIcon>

          <MenuItemTextMetaWrapper>
            <Typography {...(themeConfig.menuTextTruncate && { noWrap: true })}>{item.title}</Typography>
          </MenuItemTextMetaWrapper>
        </MenuNavLink>
      </Link>
    </ListItem>
  )
}

VerticalNavSectionTitle.propTypes = {
  item: PropTypes.any
}

export default VerticalNavSectionTitle
