import * as React from 'react'
import VerticalNavLink from './VerticalNavLink'
import VerticalNavSectionTitle from './VerticalNavSectionTitle'
import PropTypes from 'prop-types'

const resolveNavItemComponent = (item) => {
  if (!item?.subPages) return VerticalNavSectionTitle;
  return VerticalNavLink;
}

const VerticalNavItems = props => {
  const { verticalNavItems } = props
  const RenderMenuItems = verticalNavItems ? (
    verticalNavItems.map((item, index) => {

      const TagName = resolveNavItemComponent(item)

      return <TagName {...props} key={index + 1} item={item} index={index} />
    })
  ) : null;

  return (
    <div>
      {RenderMenuItems}
    </div>
  )
}
VerticalNavItems.propTypes = {
  verticalNavItems: PropTypes.any
}
export default VerticalNavItems
