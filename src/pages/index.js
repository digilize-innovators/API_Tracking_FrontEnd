import React, { useEffect, useState } from 'react'
import {
  Grid2,
  Typography,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormControl,
  FormLabel,
  styled,
  TextField,
  Button,
  Box
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers'
import ProtectedRoute from '../components/ProtectedRoute'
import { jwt_secret } from '../../constants'
import { parseCookies } from 'nookies'
import { verify } from 'jsonwebtoken'
import dynamic from 'next/dynamic'
import AccessibilitySettings from 'src/components/AccessibilitySettings'
import PieChartWithYearValues from 'src/components/PieChartWithYearValues'
import { api } from 'src/utils/Rest-API'
import SnackbarAlert from 'src/components/SnackbarAlert'
import Barchart from 'src/components/BarChart'
import Areachart from 'src/components/AreaChart'
import Linechart from 'src/components/LineChart'
import Scatterchart from 'src/components/ScatterChart'
import Piechart from 'src/components/PieChart'
import Widget from 'src/components/Widget/Widget';
import moment from 'moment';
import Featured from 'src/components/Featured';
import List from 'src/components/DashboardTable'
import ProductionDashboard from 'src/components/ProductionDashboard'
import { useAuth } from 'src/Context/AuthContext'
import { useRouter } from 'next/router'


const ChatbotComponent = dynamic(() => import('src/components/ChatbotComponent'), {
  ssr: false
})

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    padding: theme.spacing(0.5),
    fontSize: theme.typography.h5.fontSize
  },
  '& .MuiInputLabel-root': {
    fontSize: theme.typography.h4.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    marginBottom: theme.spacing(0.5)
  },
  '& .MuiSelect-select': {
    fontSize: theme.typography.h5.fontSize,
    paddingRight: theme.spacing(3)
  },
  '& .MuiNativeSelect-select': {
    paddingRight: '225px !important',
    fontSize: theme.typography.h5.fontSize,
    lineHeight: 1
  }
}))

const StyledRadio = styled(props => <Radio color='primary' {...props} />)(({ theme }) => ({
  '& .MuiSvgIcon-root': {
    fontSize: 28
  },
  '&.Mui-checked + .MuiFormControlLabel-label': {
    fontWeight: 500,
    color: theme.palette.primary.main
  }
}))

const Dashboard = () => {
  const [timePeriod, setTimePeriod] = useState('yearly')
  const [customDate, setCustomDate] = useState({ customEndDate: '', customStartDate: '' }) //useoneState
  
  const [batchData, setBatchData] = useState([])

  const [alertData, setAlertData] = useState({ type: '', message: '', variant: 'filled', openSnackbar: false })
  const [monthlyDate, setMonthlyDate] = useState({ start: '', end: '' })
    const [data,setData]=useState()
       const { removeAuthToken } = useAuth()
           const router=useRouter()
      const getData = async () => {
         try {   
           const response = await api(`/dashboard`, {}, 'get', true)
           console.log('GET sale order response :- ', response.data.data)
           if (response?.data?.success) {
             setData(response.data.data)
           } else {
             console.log('Error to get all purchase-order  ', response.data)
             if (response.data.code === 401) {
               removeAuthToken();
               router.push('/401');
             }
           }
         } catch (error) {
           console.log(error)
           console.log('Error in get locations ', error)
         } 
         
       }
     
       useEffect(()=>{ 
        getData()
       },[])
  const getBatchData = async () => {
    try {
      // const param = {}
      const params = new URLSearchParams();
      let errorMessage = '';
      switch (timePeriod) {
        case 'yearly':
          params.append('selectOption', 'year');
          break;
      
        case 'monthly':
          console.log(monthlyDate?.start!='' && monthlyDate?.end!='')
          params.append('selectOption', 'month');
          if (monthlyDate?.start!='' && monthlyDate?.end!='') {
            params.append('start', monthlyDate.start);
            params.append('end', monthlyDate.end);
          } else {
            errorMessage = 'Please select both the start and end month and year.';
          }
          break;
      
        case 'custom':
          params.append('selectOption', 'custom');
          console.log(
          (customDate?.customStartDate!='' && customDate?.customEndDate!='') 
          )
          if (customDate?.customStartDate!='' && customDate?.customEndDate!='') {
            params.append('startDate', customDate.customStartDate);
            params.append('endDate', customDate.customEndDate);
          } else {
            errorMessage = 'Please select both the start and end date.';
          }
          break;
      
        default:
          errorMessage = 'Invalid time period selected.';
      }
      
      if (errorMessage) {
        console.error(errorMessage);
        setAlertData({
          ...alertData,
          openSnackbar: true,
          message: errorMessage,
          type: 'error',
          variant: 'filled'
        })
      }
      else{
        const response = await api(`/dashboard/batch?&${params.toString()}`, {}, 'get', true)
        setBatchData(response?.data.data)
        setAlertData({
          ...alertData,
          openSnackbar: true,
          message: response.data.message,
          type: 'success',
          variant: 'filled'
        })
      } 

      
    } catch (error) {
      console.error(error)
    }
  }
 
  const handleChange = event => {
    setTimePeriod(event.target.value)
    setBatchData([])
    if (event.target.value !== 'custom') {
      setCustomDate({ customEndDate: '', customStartDate: '' })
    }
    if (event.target.value !== 'yearly') {
      setMonthlyDate({start:'',end:''});
    }
  }

  const handleCustomStartDateChange = date => {
    // setCustomStartDate(date);
    setCustomDate({ ...customDate, customStartDate: date })
    console.log('Custom Start Date:', date)
  }

  const handleCustomEndDateChange = date => {
    setCustomDate({ ...customDate, customEndDate: date })
    console.log('Custom End Date:', date)
  }

  const handleMonthlyStartYearChange = event => {
    console.log(new Date(event).getMonth())
    const startDate=moment(event).format('MM/YYYY').toString();
    console.log('Monthly Start Year:',startDate)
    setMonthlyDate({...monthlyDate,start:startDate})
  }

  const handleMonthlyEndYearChange = event => {
    console.log(new Date(event).getMonth())
    const endDate=moment(event).format('MM/YYYY').toString()
    console.log('Monthly End Year:', endDate)
    setMonthlyDate({...monthlyDate,end:endDate});
  }

  const handleMonthlySubmit = async () => {
    await getBatchData()
  }


  const handleCustomSubmit = async () => {
    console.log('custom submit btn press..')
    await getBatchData()
  }

  useEffect(() => {
    if (timePeriod != undefined && timePeriod==="yearly") {
      getBatchData()
    }
  }, [timePeriod])

  const closeSnackbar = () => {
    setAlertData({ ...alertData, openSnackbar: false })
  }

  console.log(monthlyDate)

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Grid2 container spacing={6}>
        <Grid2 item xs={12} sm={12} md={12}>
          <Typography variant='h3'>Dashboard</Typography>
          <Grid2 item xs={12} sm={12} md={12} my={3}>
            <FormControl component='fieldset'>
              <FormLabel component='legend'>Select Time Period</FormLabel>
              <RadioGroup
                row
                aria-label='time-period'
                name='time-period-group'
                value={timePeriod}
                onChange={handleChange}
              >
                <FormControlLabel value='yearly' control={<StyledRadio />} label='Yearly' />
                <FormControlLabel value='monthly' control={<StyledRadio />} label='Monthly' />
                <FormControlLabel value='custom' control={<StyledRadio />} label='Custom' />
              </RadioGroup>
            </FormControl>
          </Grid2>

          {timePeriod === 'custom' && (
            <Grid2 item xs={12} sx={{ mt: 2 ,mb:4  }}>
              <Grid2 container spacing={3}>
                <Grid2 item xs={12} sm={6} md={4}>
                  <DatePicker
                    label='Start Date'
                    onChange={handleCustomStartDateChange}
                    renderInput={params => <TextField {...params} fullWidth />}
                  />
                </Grid2>
                <Grid2 item xs={12} sm={6} md={4}>
                  <DatePicker
                    label='End Date'
                    onChange={handleCustomEndDateChange}
                    renderInput={params => <TextField {...params} fullWidth />}
                  />
                </Grid2>
                <Button onClick={handleCustomSubmit} variant='contained'>
                  Submit
                </Button>
              </Grid2>
            </Grid2>
          )}

          {timePeriod === 'monthly' && (
            <Grid2 item xs={12} sx={{ mt: 2, mb:4  }}>
              <Grid2 container spacing={3} alignItems='center'>
                <Grid2 item xs={12} sm={6} md={4}>
                  {/* <StyledTextField
                    label="Start Year"
                    value={yearlyStartYear}
                    onChange={handleYearlyStartYearChange}
                    fullWidth
                    select
                    SelectProps={{
                      native: true,
                    }}
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </StyledTextField> */}
                  <DatePicker
                    label='Start Month'

                    views={['month', 'year']}
                    onChange={handleMonthlyStartYearChange}
                    fullWidth
                    select
                    SelectProps={{
                      native: true
                    }}
                  />
                </Grid2>
                <Grid2 item xs={12} sm={6} md={4}>
                  {/* <StyledTextField
                    label="End Year"
                    value={yearlyEndYear}
                    onChange={handleYearlyEndYearChange}
                    fullWidth
                    select
                    SelectProps={{
                      native: true,
                    }}
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </StyledTextField> */}
                  <DatePicker
                    label='End Month'
                    views={['month', 'year']}
                    onChange={handleMonthlyEndYearChange}
                    fullWidth
                    select
                  />
                </Grid2>
                <Button onClick={handleMonthlySubmit} variant='contained' style={{ padding: 15 }}>
                  Submit
                </Button>
              </Grid2>
            </Grid2>
          )}
             
          {/* <Barchart />
          <Areachart />
          <Linechart />
          <Scatterchart />
          <Piechart />
           <PiarValues Data={data}/> */}

                 <Widget data={data} />
          
                <Grid2 sx={{width:'100%'}}>
           <ProductionDashboard data={data?.currentPrintingStatus}/>
           </Grid2>
           <Grid2 container spacing={16} sx={{ mt: 3 }}>
           <Featured data={data}/>
           <Grid2 sm={12} md={6}>
           <Areachart data={batchData} />
           </Grid2>
           <Grid2 sx={{ width: '100%' }}> 
            <List data={data}/>
           </Grid2>
         
           <Grid2 sm={12} md={6}>
           <Barchart data={batchData} />

           </Grid2>
           <Grid2 sm={12} md={6}>
             <Linechart data={batchData} />
           </Grid2>
           <Grid2 sm={12} md={6}>
             <Scatterchart data={batchData} />
           </Grid2>
           <Grid2 sm={12} md={6}>
             <Piechart data={batchData} />
           </Grid2>
           <Grid2 item sm={12} md={6}>
             <PieChartWithYearValues Data={batchData} />
           </Grid2>
         </Grid2>
         
         
        </Grid2>
        <AccessibilitySettings />
        <ChatbotComponent />
      </Grid2>

      <SnackbarAlert openSnackbar={alertData.openSnackbar} closeSnackbar={closeSnackbar} alertData={alertData} />
    </LocalizationProvider>
  )
}

export async function getServerSideProps(context) {
  const cookies = parseCookies(context)
  const token = cookies.token
  try {
    verify(token, jwt_secret)
  } catch (error) {
    console.error('Error verifying authentication token:', error)
    if (error.name === 'TokenExpiredError') {
      console.log('Token expired')
      return {
        redirect: {
          destination: '/login',
          permanent: false
        }
      }
    }
  }
  if (!token) {
    return {
      redirect: {
        destination: '/login',
        permanent: false
      }
    }
  }
  return {
    props: {
      isAuthenticated: !!token
    }
  }
}

export default ProtectedRoute(Dashboard)