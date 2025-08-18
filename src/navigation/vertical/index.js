import AccountPlusOutline from 'mdi-material-ui/AccountPlusOutline'
import {
  MdDeviceHub,
  MdOutlineBatchPrediction,
  MdLocationCity,
  MdLocationSearching,
  MdOutlineCategory,
  MdOutlineFormatAlignCenter,
  MdOutlineLocalFireDepartment,
  MdCloudUpload,
  MdShoppingCart,
  MdDashboard,
  MdOutlineAddHome,
  MdFactory,
  MdSettingsOverscan,
  MdListAlt,
  MdInventory2,
  MdReceiptLong,
  MdCameraAlt,
  MdSync,
  MdSummarize     
  
} from 'react-icons/md'
import { TbReportAnalytics } from 'react-icons/tb';


import { AiOutlineProduct, AiOutlineAudit } from 'react-icons/ai'
import { IoLocationOutline } from 'react-icons/io5'
import { FaChartArea } from 'react-icons/fa'
import { TfiLayoutMediaRightAlt } from 'react-icons/tfi'
import { SiStrapi } from 'react-icons/si'
import { TbApiApp } from 'react-icons/tb'
import { GrUserAdmin } from 'react-icons/gr'
// import { FcDataConfiguration } from 'react-icons/fc'
import { HiDocumentReport } from 'react-icons/hi'
import Cookies from 'js-cookie'
import jwt from 'jsonwebtoken'

const navigation = () => {
  let role = ''
  let screens = (Cookies.get('screens')?.length ? JSON.parse(Cookies.get('screens')) : []) || []
  if (
    screens === null ||
    screens === undefined ||
    screens === 'undefined' ||
    screens === 'null' ||
    !screens.length ||
    screens.length === 0 ||
    screens === 'All'
  ) {
    screens = []
  }

  try {
    const authToken = Cookies.get('token')
    if (authToken) {
      const decodedToken = jwt.decode(authToken)
      role = decodedToken.role
    } else {
      console.log('No auth token found.')
    }
  } catch (error) {
    console.error('Error decoding token:', error)
  }

  if (role === 'superadmin') {
    screens.push('SuperAdmin Configuration', 'API-Screen Relation')
    Cookies.set('screens', JSON.stringify(screens))
    return [
      {
        title: 'SuperAdmin Configuration',
        icon: IoLocationOutline,
        path: '/superadmin-settings',
        mainTitle: true
      },
      {
        title: 'API-Screen Relation',
        icon: TbApiApp,
        path: '/api-relation-screen',
        mainTitle: true
      },
      {
        title: 'Country master',
        icon: TbApiApp,
        path: '/country-master',
        mainTitle: true
      }
    ]
  }

  const auditScreens = [
    {
      title: 'Audit Logs',
      icon: AiOutlineAudit,
      path: '/audit-log',
      mainTitle: false
    },
    {
      title: 'Batch Report',
      icon: HiDocumentReport,
      path: '/batch-report',
      mainTitle: false
    }
  ]

  const productionScreens = [
    {
      title: 'Batch Master',
      icon: MdOutlineBatchPrediction,
      path: '/batch-master',
      mainTitle: false
    },
    {
      title: 'Code Generation',
      icon: MdDeviceHub,
      path: '/code-generation',
      mainTitle: false
    },
    {
      title: 'Batch Printing',
      icon: MdOutlineBatchPrediction,
      path: '/batch-printing',
      mainTitle: false
    },
    {
      title: 'Batch Cloud Upload',
      icon: MdCloudUpload,
      path: '/batch-cloud-upload',
      mainTitle: false
    }
  ]

  const printerScreens = [
    {
      title: 'Printer Category',
      icon: AiOutlineProduct,
      path: '/printercategory',
      mainTitle: false
    },
    {
      title: 'Printer Master',
      icon: MdOutlineCategory,
      path: '/printermaster',
      mainTitle: false
    },

    {
      title: 'Control Panel Master',
      icon: AiOutlineProduct,
      path: '/controlpanelmaster',
      mainTitle: false
    },

    {
      title: 'Printer Line Configuration',
      icon: TfiLayoutMediaRightAlt,
      path: '/printerlineconfiguration',
      mainTitle: false
    },
    {
      title: 'Camera Master',
      icon: MdCameraAlt,
      path: '/cameramaster',
      mainTitle: false
    }
  ]

  const masterScreens = [
    {
      title: 'Company',
      icon: MdLocationCity,
      path: '/company',
      mainTitle: false
    },
    {
      title: 'Location Master',
      icon: IoLocationOutline,
      path: '/location',
      mainTitle: false
    },
    {
      title: 'Department Master',
      icon: MdOutlineLocalFireDepartment,
      path: '/department',
      mainTitle: false
    },
    {
      title: 'User Master',
      icon: AccountPlusOutline,
      path: '/user',
      mainTitle: false
    },
    {
      title: 'Area Category',
      icon: MdLocationSearching,
      path: '/area-category',
      mainTitle: false
    },
    {
      title: 'Area Master',
      icon: FaChartArea,
      path: '/area',
      mainTitle: false
    },
    {
      title: 'Product Master',
      icon: AiOutlineProduct,
      path: '/product',
      mainTitle: false
    },
    {
      title: 'Unit Of Measurement',
      icon: AiOutlineProduct,
      path: '/unit-of-measurement',
      mainTitle: false
    }
  ]
  const salesScreens = [
    {
      title: 'Purchase Order',
      icon: MdShoppingCart,
      path: '/purchase-order',
      mainTitle: false
    },
    {
      title: 'Stock Transfer Order',
      icon: MdInventory2,
      path: '/stocktransfer-order',
      mainTitle: false
    },
    {
      title: 'Sales Order',
      icon: MdReceiptLong,
      path: '/sales-order',
      mainTitle: false
    },
    {
      title: 'Stock Reconciliation',
      icon: MdSync,
      path: '/stock-reconciliation',
      mainTitle: false
    },
      {
      title: 'Stock Summary',
      icon: TbReportAnalytics    ,
      path: '/stock-summary',
      mainTitle: false
    },
  ]
  const configurationScreen = [
    {
      title: 'SuperAdmin Configuration',
      icon: GrUserAdmin,
      path: '/superadmin-settings',
      mainTitle: true
    },
    {
      title: 'API Privilege',
      icon: SiStrapi,
      path: '/api-privilege',
      mainTitle: false
    },
    {
      title: 'Screen Privilege',
      icon: TfiLayoutMediaRightAlt,
      path: '/screen-privilege',
      mainTitle: false
    }
  ]

  const dashboardScreen = [
    {
      title: 'Dashboard',
      icon: MdDashboard,
      path: '/',
      mainTitle: true,
      isolation: true
    }
  ]

  if (role === 'admin') {
    screens.push(
      'Super Admin',
      'API Privilege',
      'Screen Privilege',
      'Location Master',
      'Department Master',
      'User Master',
      'Dashboard',
      'Stock Summary',
      'Batch Master'
    )
    Cookies.set('screens', JSON.stringify(screens))
  }

  const filteredConfigurationScreens = configurationScreen.filter(item => screens.includes(item.title))

  const filteredMasterScreens = masterScreens.filter(item => screens.includes(item.title))

  // const fiiterProcessScreens = processScreens.filter(item => screens.includes(item.title))
  // const fiiterProcessScreens = processScreens.filter(item => screens.includes(item.title))

  const filteredProductionScreens = productionScreens.filter(item => screens.includes(item.title))

  const filteredAuditScreens = auditScreens.filter(item => screens.includes(item.title))

  const filteredDashboardScreen = dashboardScreen.filter(item => screens.includes(item.title))
  const filteredPrinterScreen = printerScreens.filter(item => screens.includes(item.title))
  const filterSalesScreen = salesScreens.filter(item => screens.includes(item.title))
  const drawerArray = [
    {
      title: 'Home Screen',
      icon: MdOutlineAddHome,
      mainTitle: true,
      path: '/home-screen',
      isolation: true
    },
    {
      title: 'Access Privileges',
      icon: MdSettingsOverscan,
      mainTitle: true,
      path: '/configurations',
      subPages: filteredConfigurationScreens
    },
    {
      title: 'Master Screens',
      icon: MdOutlineFormatAlignCenter,
      mainTitle: true,
      path: '/master',
      subPages: filteredMasterScreens
    },

    {
      title: 'Printer Configurations',
      icon: MdSettingsOverscan,
      mainTitle: true,
      path: '/master',
      subPages: filteredPrinterScreen
    },
    {
      title: 'Packaging Production',
      icon: MdFactory,
      mainTitle: true,
      path: '/master',
      subPages: filteredProductionScreens
    },
    {
      title: 'Order',
      icon: MdListAlt,
      mainTitle: true,
      path: '/master',
      subPages: filterSalesScreen
    },
    {
      title: 'Audit Logs',
      icon: MdOutlineFormatAlignCenter,
      mainTitle: true,
      path: '/master',
      subPages: filteredAuditScreens
    }
  ].filter(item => item?.subPages?.length > 0 || item?.isolation)

  drawerArray.unshift(...filteredDashboardScreen)

  return drawerArray
}

export default navigation
