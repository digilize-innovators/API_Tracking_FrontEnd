import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import ListItem from '@mui/material/ListItem'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemButton from '@mui/material/ListItemButton'
import themeConfig from 'src/configs/themeConfig'
import UserIcon from 'src/layouts/components/UserIcon'
import { handleURLQueries } from 'src/@core/layouts/utils'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import ChevronUp from 'mdi-material-ui/ChevronUp'
import ChevronDown from 'mdi-material-ui/ChevronDown'
import PropTypes from 'prop-types';

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
  },
  '&.active .MuiTypography-root, &.active .MuiSvgIcon-root': {
    color: `${theme.palette.common.white} !important`
  }
}));

const MenuItemTextMetaWrapper = styled(Box)({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  transition: 'opacity .25s ease-in-out',
  ...(themeConfig.menuTextTruncate && { overflow: 'hidden' })
})

const VerticalNavLink = ({ item, navVisible, toggleNavVisibility, index }) => {


  const router = useRouter()
  const [expanded, setExpanded] = React.useState(false);
  const [openMaster, setOpenMaster] = React.useState(false);
  const arrowIcon = openMaster ? ChevronUp : ChevronDown;
  const IconTag = item.icon;

  const handleChange = panel => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false)
  }

  const isNavLinkActive = (i) => {

    return (
      router.pathname === item.subPages[i].path ||
      handleURLQueries(router, item.subPages[i].path)
    );
  }

  return (
    <Accordion
      expanded={expanded == `panel${index}`}
      onChange={handleChange(`panel${index}`)}
      style={{
        backgroundColor: 'transparent', boxShadow: 'none', borderTop: 'none',
      }}
      sx={{
        '&::before': {
          display: 'none',
        }
      }}
    >
      <AccordionSummary

        aria-controls={`panel${index}bh-content`}
        id={`panel${index}bh-header`}
        style={{
          padding: 0,
          margin: '5px 0',
          height: '40px',
          minHeight: '30px',
          borderTop: 'none',
        }}
      >
        <Typography sx={{ width: '100%', flexShrink: 0, margin: 0 }}>
          <ListItem
            disablePadding
            className='nav-link'
            disabled={item.disabled || false}
            sx={{
              mt: 1.5,
              px: '0 !important',
              borderTop: 'none',
              boxShadow: 'none'
            }}
            style={{ width: '100%' }}
          >
            <Link passHref href={''} style={{ paddingLeft: '30px', marginTop: '5px', marginBottom: '5px' }}>
              <MenuNavLink
                component={'a'}
                {...(item.openInNewTab ? { target: '_blank' } : null)}
                onClick={() => {
                  setOpenMaster(!openMaster);
                }}
                sx={{
                  pl: 5.5,
                  color: 'text.primary',
                  transition: 'margin .25s ease-in-out',
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
                  <Typography {...(themeConfig.menuTextTruncate && { noWrap: true })} style={{ maxWidth: '145px' }}>{item.title}</Typography>
                  <ListItemIcon
                    sx={{
                      mr: 2.5,
                      color: 'text.primary',
                      transition: 'margin .25s ease-in-out'
                    }}
                  >
                    <UserIcon icon={arrowIcon} />
                  </ListItemIcon>
                </MenuItemTextMetaWrapper>
              </MenuNavLink>
            </Link>
          </ListItem>
        </Typography>
      </AccordionSummary>
      <AccordionDetails style={{ padding: 0 }}>
        <Typography sx={{ width: '100%', flexShrink: 0 }}>
          {item.subPages?.map((item, index) => {
            return (
              <ListItem
                key={index + 1}
                disablePadding
                className='nav-link'
                disabled={item.disabled || false}
                sx={{ px: '0 !important' }}
                style={{
                  width: '100%', paddingLeft: '10px !important', marginTop: '5px', marginBottom: '5px', borderTop: 'none', boxShadow: 'none'
                }}
              >
                <Link passHref href={item.path === undefined ? '/' : `${item.path}`} style={{ paddingLeft: '30px' }}>
                  <MenuNavLink
                    component={'a'}
                    className={isNavLinkActive(index) ? 'active' : ''}
                    {...(item.openInNewTab ? { target: '_blank' } : null)}
                    onClick={e => {
                      if (item.path === undefined) {
                        e.preventDefault()
                        e.stopPropagation()
                      }
                      if (navVisible) {
                        toggleNavVisibility()
                      }
                    }}
                    sx={{
                      pl: 5.5,
                      ...{ cursor: 'pointer' }
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        fontSize: 18,
                        mr: 2.5,
                        color: 'text.primary',
                        transition: 'margin .25s ease-in-out',
                        ...{ cursor: 'pointer' }
                      }}
                    >
                      <UserIcon icon={item.icon} />
                    </ListItemIcon>
                    <MenuItemTextMetaWrapper>
                      <Typography {...(themeConfig.menuTextTruncate && { noWrap: true })} style={{ maxWidth: '150px' }}>{item.title}</Typography>
                    </MenuItemTextMetaWrapper>
                  </MenuNavLink>
                </Link>
              </ListItem>
            )
          })}
        </Typography>
      </AccordionDetails>
    </Accordion>
  )
}

VerticalNavLink.propTypes = {
  item: PropTypes.object,
  navVisible: PropTypes.any,
  toggleNavVisibility: PropTypes.any,
  index: PropTypes.any
};

export default VerticalNavLink
