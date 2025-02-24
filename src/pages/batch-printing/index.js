/* eslint-disable no-unused-vars */
'use clients'
'use-client'
import {
  Button,
  TextField,
  Chip,
  Box,
  Grid2,
  Modal,
  Typography,
  IconButton,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Checkbox,
  Paper,
  Divider,
  ListItemText,
  OutlinedInput
} from '@mui/material'
import { AiOutlineSetting } from 'react-icons/ai'
import Head from 'next/head'
import { useRef, useEffect, useState, Fragment } from 'react'
import { useLoading } from 'src/@core/hooks/useLoading'
import { useSettings } from 'src/@core/hooks/useSettings'
import ProtectedRoute from 'src/components/ProtectedRoute'
import SnackbarAlert from 'src/components/SnackbarAlert'
import { api } from 'src/utils/Rest-API'
import { validateToken } from 'src/utils/ValidateToken'
import { io } from 'socket.io-client'
import { useAuth } from 'src/Context/AuthContext'
import { useRouter } from 'next/router'
import { style } from 'src/configs/generalConfig'
import { useApiAccess } from 'src/@core/hooks/useApiAccess';
import axios from 'axios'

const ProjectSettings = ({ openModal, setOpenModal, projectSettingData, apiAccess, ip }) => {
  console.log('Project setting data ', projectSettingData);
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [alertData, setAlertData] = useState({ type: '', message: '', variant: 'filled' })
  const [editId, setEditId] = useState(null);
  const { removeAuthToken } = useAuth();
  const router = useRouter();
  const [settingData, setSettingData] = useState({
    label: '',
    dateFormat: '',
    noOfGroups: '',
    printPerGroup: '',
    selectedVariables: [],
    variables: [
      {
        label: 'MRP',
        value: 'MRP',
        checked: false
      },
      {
        label: 'NDC',
        value: 'NDC',
        checked: false
      },
      {
        label: 'GTIN',
        value: 'GTIN',
        checked: false
      },
      {
        label: 'Batch No',
        value: 'BatchNo',
        checked: false
      },
      {
        label: 'Manufacturing Date',
        value: 'ManufacturingDate',
        checked: false
      },
      {
        label: 'Expiry Date',
        value: 'ExpiryDate',
        checked: false
      },
      {
        label: 'Batch Size',
        value: 'BatchSize',
        checked: false
      },
      {
        label: 'USP',
        value: 'USP',
        checked: false
      },
      {
        label: 'Unique Code',
        value: 'UniqueCode',
        checked: false
      },
      {
        label: 'Country Code',
        value: 'CountryCode',
        checked: false
      }
    ]
  });

  useEffect(() => {
    getPrintlineSetting();
    return () => {
    }
  }, []);

  // const [errorNoOfVariable, setErrorNoOfVariable] = useState({ isError: false, message: '' })
  const { setIsLoading } = useLoading()

  const getPrintlineSetting = async ()=> {
    try {
      const res = await api(`/printLineSetting/${projectSettingData.lineId}`, {}, 'get', true, true, ip);
      console.log("GET printline setting data ", res.data);
      if (res.data.success && res.data.data) {
        setEditId(res.data.data.id);
        setSettingData({
          label: res.data.data.label,
          dateFormat: res.data.data.date_format,
          noOfGroups: res.data.data.no_of_groups,
          printPerGroup: res.data.data.print_per_group,
          selectedVariables: res.data.data.variables,
          variables: settingData.variables?.map((item) => {
            return {
              ...item,
              checked: res.data.data.variables?.includes(item.value)
            }
          })
        })  
      }else {
        setSettingData({
          ...settingData,
        })
      }
    } catch (error) {
      console.log('Error to get printline setting ', error);
    }
  }

  const applyValidated = () => {
    // if (label === '') {
    //   setErrorLabel({ isError: true, message: 'Label must be required' })
    // } else {
    //   setErrorLabel({ isError: false, message: '' })
    // }
    // if (dateFormat === null) {
    //   setErrorDateFormat({ isError: true, message: 'DateFormat must be required' })
    // } else {
    //   setErrorDateFormat({ isError: false, message: '' })
    // }
    // if (!selectedVariable.length) {
    //   setErrorNoOfVariable({ isError: true, message: 'No of Variable must be required' })
    // } else {
    //   setErrorNoOfVariable({ isError: false, message: '' })
    // }
  }

  const validated = () => {
    // return label != '' && selectedVariable.length >= 0 && dateFormat !== ''
  }

  const addSetting = async ()=> {
    const data = { 
      printerLineId: projectSettingData.lineId, 
      label: settingData.label, 
      dateFormat: settingData.dateFormat, 
      noOfGroups: settingData.noOfGroups.toString(), 
      printPerGroup: settingData.printPerGroup.toString(), 
      variables: settingData.selectedVariables 
    };

    console.log('add setting data ', data)

    try {
      setIsLoading(true);
      const res = await api('/printLineSetting/', data, 'post', true, true, ip)
      console.log('Response add printLineSetting:', res.data);
      if(res.data.success){
        setAlertData({ type: 'success', message: 'Printline setting added successfully', variant: 'filled' })
        setOpenSnackbar(true)
      }else if (res.data.code === 401) {
        removeAuthToken();
        router.push('/401');
      } else {
        setAlertData({ type: 'error', message: res.data.error.details.message, variant: 'filled' })
        setOpenSnackbar(true)
      }
    } catch (error) {
      console.error('Error applying settings:', error)
    } finally {
      setIsLoading(false);
    }
  }

  const editSetting = async ()=> {
    const data = { 
      printerLineId: projectSettingData.lineId, 
      label: settingData.label, 
      dateFormat: settingData.dateFormat, 
      noOfGroups: settingData.noOfGroups.toString(), 
      printPerGroup: settingData.printPerGroup.toString(), 
      variables: settingData.selectedVariables 
    };
    console.log('edit setting data', data)

    try {
      setIsLoading(true);
      const res = await api('/printLineSetting/', data, 'put', true, true, ip)
      console.log('Response update printLineSetting:', res.data);
      if(res.data.success){
        setAlertData({ type: 'success', message: 'Printline setting updated successfully', variant: 'filled' })
        setOpenSnackbar(true)
      }
    } catch (error) {
      console.error('Error applying settings:', error)
    } finally {
      setIsLoading(false);
    }
  }

  const applySettings = async () => {
    editId ? await editSetting() : await addSetting()
  }

  const closeModal = () => {
    setOpenModal(false)
  };

  const handleInput = (e)=> {
    setSettingData(prevSetting => ({
      ...prevSetting,
      [e.target.name]: e.target.value
    }))
  };

  const closeSnackbar = () => {
    setOpenSnackbar(false)
  }

  return (
    <>
      <Modal open={openModal} onClose={closeModal}>
        <Box sx={{ ...style, width: '40%' }}>
          <Typography variant='h4' gutterBottom>
            Project Settings
          </Typography>
          <Typography variant='h6'>Adjust the settings to customize.</Typography>
          <Grid2 container spacing={2} margin={'1rem 0rem'}>
            <Grid2 size={6}>
              <FormControl fullWidth>
                <InputLabel id='label'>Label</InputLabel>
                <Select labelId='label' id='label' label='Label' fullWidth onChange={handleInput} name='label' value={settingData.label}>
                  {projectSettingData.labels?.map((item, index) => (
                    <MenuItem key={index} value={item}>
                      {item}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid2>

            <Grid2 size={6}>
              <FormControl fullWidth>
                <InputLabel id='date'>Date Format</InputLabel>
                <Select labelId='date' id='date' label='DateFormat' fullWidth onChange={handleInput} name='dateFormat' value={settingData.dateFormat}>
                  <MenuItem value='DD/MM/YYYY'>DD/MM/YYYY</MenuItem>
                  <MenuItem value='MM-DD-YY'>MM-DD-YY</MenuItem>
                  <MenuItem value='DD-MM-YY'>DD-MM-YY</MenuItem>
                  <MenuItem value='DD/MM/YY'>DD/MM/YY</MenuItem>
                  <MenuItem value='MM/YYYY'>MM/YYYY</MenuItem>
                  <MenuItem value='MM-YYYY'>MM-YYYY</MenuItem>
                  <MenuItem value='MMM.YYYY'>MMM.YYYY</MenuItem>
                </Select>
              </FormControl>
            </Grid2>
          </Grid2>

          <Grid2 container spacing={3} sx={{ marginTop: '1rem' }}>
            <Grid2 size={6}>
              <FormControl fullWidth>
                <InputLabel id='no_of_groups_lbl'>No. of Groups</InputLabel>
                <Select labelId='no_of_groups_lbl' id='no_of_groups' label='No. of Groups' fullWidth onChange={handleInput} name='noOfGroups' value={settingData.noOfGroups}>
                  <MenuItem value='1'>1</MenuItem>
                  <MenuItem value='2'>2</MenuItem>
                  <MenuItem value='3'>3</MenuItem>
                  <MenuItem value='4'>4</MenuItem>
                </Select>
              </FormControl>
            </Grid2>
            <Grid2 size={6}>
              <FormControl fullWidth>
                <InputLabel id='group_prnt_lbl'>Print per group</InputLabel>
                <Select labelId='group_prnt_lbl' id='group_prnt' label='Print per group' fullWidth onChange={handleInput} name='printPerGroup' value={settingData.printPerGroup}>
                  <MenuItem value='1'>1</MenuItem>
                  <MenuItem value='2'>2</MenuItem>
                  <MenuItem value='3'>3</MenuItem>
                  <MenuItem value='4'>4</MenuItem>
                  <MenuItem value='5'>5</MenuItem>
                  <MenuItem value='6'>6</MenuItem>
                </Select>
              </FormControl>
            </Grid2>
          </Grid2>
          
          <Grid2 container spacing={1} sx={{ marginTop: '1rem' }}>
            <Grid2 size={12}>
              <FormControl sx={{ width: '100%' }}>
                <InputLabel id='no-of-variable'>No of Variable</InputLabel>
                <Select
                  labelId='no-of-variable'
                  id='no-of-variable'
                  multiple
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 48 * 4.5 + 8,
                        width: 250
                      }
                    }
                  }}
                  // onChange={handleInput} name='noOfGroups'
                  value={settingData.selectedVariables}
                  renderValue={selected => selected.join(', ')}
                  onChange={e => {
                    // const value = ...e.target.value;
                    console.log("Event value ", e.target.value)
                    setSettingData(prevData => {
                      const data = { ...prevData }
                      data.variables.map(i => {
                        if (e.target.value.includes(i.value)) {
                          i.checked = true
                        } else {
                          i.checked = false
                        }
                        return i
                      })
                      data.selectedVariables = e.target.value;
                      return data;
                    })
                  }}
                  input={<OutlinedInput label='None' />}
                >
                  {settingData.variables?.map((item, index) => (
                    <MenuItem key={index} value={item.value} >
                      <Checkbox checked={item.checked} />
                      <ListItemText primary={item.label} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid2>
          </Grid2>


          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          {
            apiAccess.addApiAccess && (
              <Button variant='contained' onClick={applySettings} sx={{ minWidth: 100 }}>
                Apply
              </Button>
            )
          }
            <Button
              variant='outlined'
              color='error'
              onClick={() => {
                setOpenModal(!openModal)
              }}
              sx={{ minWidth: 100 }}
            >
              Close
            </Button>
          </Box>
        </Box>
      </Modal>
      <SnackbarAlert openSnackbar={openSnackbar} closeSnackbar={closeSnackbar} alertData={alertData} />
    </>
  )
}

const Index = ({ userId, ip }) => {
  const { settings } = useSettings()
  const [openSnackbar, setOpenSnackbar] = useState(false)
  const [alertData, setAlertData] = useState({ type: '', message: '', variant: 'filled' })
  const [openProjectModal, setOpenProjectModal] = useState(false)
  const [printerLines, setPrinterLines] = useState([])
  const { setIsLoading } = useLoading()
  const socket = useRef(null)
  const [socketId, setSocketId] = useState('')
  const { removeAuthToken } = useAuth()
  const router = useRouter()
  const [projectSettingData, setProjectSettingData] = useState({ labels: [], printingTechnology: '', lineId: '', controlPanelId: '' })
  const apiAccess = useApiAccess("batch-printing-create", "batch-printing-update", "batch-printing-approve");

  useEffect(() => {
    if (!socket.current) {
      // Connect to the backend server
      socket.current = io(`http://${ip}:4000`, { query: { userId } });
      console.log("User id ", userId);
    }

    socket.current.on('connect', () => {
      console.log('Connected to socket server, socket id:', socket.current.id)
      setSocketId(socket.current.id)
    })

    socket.current.on('dataPrinted', data => {
      const { lineId, printCount, panelName } = data;
      setPrinterLines(prevLines => {
        const panels = [...prevLines]
        const panel = panels.find(i => i.panelName === panelName)
        const line = panel.lines.find(line => line.id === lineId)
        line.printCount = printCount
        line.pendingCount = line.codeToPrint - printCount
        return panels
      })
    })

    socket.current.on('dataScanned', data => {
      const { lineId, scanned, panelName } = data
      console.log('dataScanned', data)
      setPrinterLines(prevLines => {
        const panels = [...prevLines]
        const panel = panels.find(i => i.panelName === panelName)
        const line = panel.lines.find(line => line.id === lineId)
        line.scanned = scanned
        console.log("dataScanned panels ", panels)
        return panels
      })
    })

    socket.current.on('printStarted', data => {
      console.log('printStarted ', data)
      setPrinterLines(prevLines => {
        const panels = [...prevLines]
        const panel = panels.find(i => i.panelName === data.panelName)
        const line = panel.lines.find(line => line.id === data.lineId)
        line.disabledStartPrint = true
        line.disabledStopPrint = false
        line.disabledReset = true
        return panels
      })
      setAlertData({ type: 'success', message: 'Printer started', variant: 'filled' })
      setOpenSnackbar(true)
    })

    socket.current.on('printStoped', data => {
      console.log('printStoped ', data)
      setPrinterLines(prevLines => {
        const panels = [...prevLines]
        const panel = panels.find(i => i.panelName === data.panelName)
        const line = panel.lines.find(line => line.id === data.lineId)
        line.codeToPrint = String(data.pendingCount)
        line.disabledStartPrint = true
        line.disabledStopPrint = true
        line.disabledCodePrintSave = false
        line.disabledReset = false
        line.pendingCount = 0
        line.printCount = data.printCount
        line.scanned = data.scanCount
        return panels
      })
      setAlertData({ type: 'success', message: 'Printer stopped Successfully', variant: 'filled' })
      setOpenSnackbar(true)
    })

    socket.current.on('panelPing', data => {
      setPrinterLines(prevLines => {
        const panels = [...prevLines]
        const panel = panels.find(i => i.panelName === data.panelName)
        if(panel){
          panel.connected = data.panelConnected
        }
        return panels
      })
    })

    socket.current.on('printingCompleted', async data => {
      try {
        await api("/batchprinting/panelStop", { 
          line: { 
            ControlPanel: { id: data.panelId },
            id: data.lineId
          },
          panelStopPing: true
        }, 'post', true, true, ip);
        setPrinterLines(prevLines => {
          const panels = [...prevLines]
          const panel = panels.find(i => i.panelName === data.panelName)
          const line = panel.lines.find(i => (i.id === data.lineId))
          line.disabledStartPrint = true
          line.disabledStopPrint = true
          line.pendingCount = 0
          line.printCount = data.printCount
          line.scanned = data.scanCount
          line.disabledReset = false
          console.log("panel line competed ", panels)
          return panels
        })
        setOpenSnackbar(true)
        setAlertData({ type: 'success', message: 'Printing completed', variant: 'filled' })
        
      } catch (error) {
        console.log("Error to stop printing ", error)
      }
    })

    socket.current.on("onMessage", data => {
      console.log("onMessage ", data);
      setAlertData({ type: data.type, message: data.message, variant: 'filled' })
      setOpenSnackbar(true)
    })

    return () => {
      if (socket.current) {
        socket.current.disconnect()
      }
    }
  }, [])

  useEffect(() => {
    (async ()=> {
      await getAllControlPanelWiseLines()
    })()
    const handleBeforeUnload = (event) => {
      const message = 'Are you sure you want to leave? Printing Data might be lost.';
      event.preventDefault();
      event.returnValue = message; // Shows the confirmation dialog.
      return message; // Required for older browsers.
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [])

  const getAllControlPanelWiseLines = async () => {
    setIsLoading(true)
    try {
      const res = await api('/batchprinting/getAllControlPanelWiseLines/', {}, 'get', true, true, ip)
      console.log('Get Printer line name and control panel for Batch printing', res.data)
      if (res.data.success) {
        const groupedPanels = []
        Object.keys(res.data.data.groupedPanels).map(key => {
          const values = res.data.data.groupedPanels[key].map(line => ({
            ...line,
            batch: '',
            product: '',
            packagingHierarchy: '',
            codeToPrint: '',
            availableToCode: '',
            errorBatch: { isError: false, message: '' },
            errorProduct: { isError: false, message: '' },
            errorPackagingHierarchy: { isError: false, message: '' },
            errorCodeToPrint: { isError: false, message: '' },
            errorAvailableToCode: { isError: false, message: '' },
            saveData: false,
            products: [],
            batches: [],
            packagingHierarchies: [],
            disabledCodePrintSave: true,
            disabledStartPrint: true,
            disabledStopPrint: true,
            disabledReset: false,
            pendingCount: 0,
            printCount: 0,
            scanned: 0
          }))
          groupedPanels.push({ panelName: key, lines: values, connected: false })
        })
        console.log('GROUPED PANEL ', groupedPanels)
        setPrinterLines(groupedPanels)
      } else {
        console.log('Error fetching lines', res.data)
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('Error fetching lines', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getProducts = async (panelIndex, lineIndex) => {
    console.log('calling ..')
    try {
      const res = await api('/batchprinting/getAllProducts', {}, 'get', true, true, ip)
      console.log('Res of getProducts ', res.data)
      if (res.data.success) {
        const products = res.data.data.products
        updatePrinterLine(panelIndex, lineIndex, 'products', products)
      } else {
        console.log('Error fetching products', res.data)
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('Error fetching products', error)
    }
  }

  const handleProductChange = async (panelIndex, lineIndex, productId) => {
    setIsLoading(true)
    try {
      const res = await api(`/batchprinting/getBatchesByProduct/${productId}`, {}, 'get', true, true, ip)
      if (res.data.success) {
        const batches = res.data.data.batches
        setPrinterLines(prevLines => {
          const panels = [...prevLines]
          const line = panels[panelIndex].lines[lineIndex]
          line.product = productId
          line.batches = batches
          line.batch = ''
          line.packagingHierarchy = ''
          line.packagingHierarchies = []
          return panels
        })
      } else {
        console.log('Error fetching batches', res.data)
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('Error fetching batches', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBatchChange = async (panelIndex, lineIndex, batchId, line) => {
    const productID = line.product
    try {
      setIsLoading(true)
      const res = await api( `/batchprinting/getPackagingHeirarchyFromProductAndBatch/${productID}/${batchId}`, {}, 'get', true, true, ip)
      if (res.data.success) {
        console.log('handleBatchChange', res.data.data)
        const packagingHierarchies = res.data.data.packagingheirarchy
        console.log('packaging', packagingHierarchies)
        setPrinterLines(prevLines => {
          const panels = [...prevLines]
          const line = panels[panelIndex].lines[lineIndex]
          line.batch = batchId
          line.packagingHierarchy = ''
          line.packagingHierarchies = [packagingHierarchies]
          return panels
        })
      } else {
        console.log('Error fetching packaging hierarchies', res.data)
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('Error fetching packaging hierarchies', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getLayerOptions = ph => {
    const options = []
    options.push({ label: `Product Number`, value: 'productNumber' })
    if (ph.packagingHierarchy >= 2) options.push({ label: `First Layer`, value: 'firstLayer' })
    if (ph.packagingHierarchy >= 3) options.push({ label: `Second Layer`, value: 'secondLayer' })
    if (ph.packagingHierarchy >= 4) options.push({ label: `Third Layer`, value: 'thirdLayer' })
    options.push({ label: `Outer Layer`, value: 'outerLayer' })
    return options
  }

  const updatePrinterLine = (panelIndex, lineIndex, field, value) => {
    setPrinterLines(prevLines => {
      const panles = [...prevLines]
      panles[panelIndex].lines[lineIndex] = { ...panles[panelIndex].lines[lineIndex], [field]: value }
      return panles
    })
  }

  const handleInputChange = (panelIndex, lineIndex, field, value) => {
    updatePrinterLine(panelIndex, lineIndex, field, value)
  }

  const applyValidation = (panelIndex, lineIndex) => {
    setPrinterLines(prevLines => {
      const newLines = [...prevLines]
      const line = newLines[panelIndex].lines[lineIndex]
      line.errorBatch =
        line.batch === '' ? { isError: true, message: 'Batch is required' } : { isError: false, message: '' }
      line.errorProduct =
        line.product === '' ? { isError: true, message: 'Product is required' } : { isError: false, message: '' }
      line.errorPackagingHierarchy =
        line.packagingHierarchy === ''
          ? { isError: true, message: 'Packaging Hierarchy is required' }
          : { isError: false, message: '' }
      return newLines
    })
  }

  const checkValidate = (panelIndex, lineIndex) => {
    const line = printerLines[panelIndex].lines[lineIndex]
    return line.batch !== '' && line.product !== '' && line.packagingHierarchy !== ''
  }

  const handleSubmitForm = async (panelIndex, lineIndex, line) => {
    const productID = line.product
    const batchId = line.batch
    const packagingHierarchy = line.packagingHierarchy
    const controlPanelId = line.ControlPanel.id

    applyValidation(panelIndex, lineIndex)
    if (!checkValidate(panelIndex, lineIndex)) {
      return
    }
    console.log("Panles group ",  printerLines);
    try {
      setIsLoading(true)
      const res = await api( `/batchprinting/getAvailableCodesFromProductAndBatch/${productID}/${batchId}/${packagingHierarchy}/${controlPanelId}/${line.id}`, {}, 'get', true, true, ip)
      console.log('Res of submit form ', res.data)
      if (res.data.success) {
        const { availableCodes, codeToPrint } = res.data.data
        setPrinterLines(prevLines => {
          const panels = [...prevLines]
          const panel = panels[panelIndex]
          const line = panel.lines[lineIndex]
          line.saveData = true
          line.availableToCode = availableCodes
          line.codeToPrint = codeToPrint
          line.scanned = 0
          return panels
        })
      } else {
        console.log('Error fetching codes', res.data)
        setOpenSnackbar(true);
        setAlertData({ ...alertData, type: 'error', message: res.data?.message });
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('Error fetching codes', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCodeToPrint = async (panelIndex, lineIndex, line) => {
    // ApplyValidation
    applyValidation(panelIndex, lineIndex)
    // Check validation
    if (!checkValidate(panelIndex, lineIndex)) {
      return
    }
    console.log("LIne send ", line)
    try {
      const res = await api(`/batchprinting/sendCodesToPrinter`, { line, socketId }, 'post', true, true, ip)
      console.log('res of handlestart printing ', res.data)

      if (res.data.success) {
        setPrinterLines(prevLines => {
          const panels = [...prevLines]
          const panel = panels[panelIndex]
          panel.connected = true
          const line = panel.lines[lineIndex]
          line.saveDate = true
          line.disabledCodePrintSave = true
          line.disabledStartPrint = false
          line.disabledReset = true
          return panels
        })
      } else {
        console.log('Error send codes to printer', res.data)
        setAlertData({ type: 'error', message: res.data.message, variant: 'filled' })
        setPrinterLines(prevLines => {
          const panels = [...prevLines]
          const panel = panels[panelIndex]
          panel.connected = false
          return panels
        })
        setOpenSnackbar(true)
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('Error fetching codes', error)
    }
  }

  const handleStartPrinting = async (panelIndex, lineIndex, line) => {
    try {
      const data = { line }
      socket.current.emit('startPrinting', data)
    } catch (error) {
      console.log('Error handleStart Printing', error)
      setOpenSnackbar(true);
      setAlertData({ ...alertData, type: 'error', message: error });
    }
  }

  const handleStopPrinting = async (panelIndex, lineIndex, line) => {
    console.log("STop printing clicked...")
    try {
      const data = { line }
      socket.current.emit('stopPrinting', data)
    } catch (error) {
      console.log('Error handleStop Printing', error)
      setOpenSnackbar(true);
      setAlertData({ ...alertData, type: 'error', message: error });
    }
  }

  const closeSnackbar = () => {
    setOpenSnackbar(false)
  }

  const handleResetPanel = async (panelIndex, lineIndex) => {
    const lines = [...printerLines]
    const line = lines[panelIndex].lines[lineIndex]
    const redisKey = `product:${line.product}:batch:${line.batch}:hierarchy:${line.packagingHierarchy}`
    line.batches = []
    line.codeToPrint = ''
    line.errorAvailableToCode = { isError: false, message: '' }
    line.errorBatch = { isError: false, message: '' }
    line.errorCodeToPrint = { isError: false, message: '' }
    line.errorPackagingHierarchy = { isError: false, message: '' }
    line.errorProduct = { isError: false, message: '' }
    line.packagingHierarchy = ''
    line.packagingHierarchies = []
    line.products = []
    line.product = ''
    line.saveData = false
    line.pendingCount = 0
    line.printCount = 0
    line.scanned = 0
    setPrinterLines(lines)
    try {
      setIsLoading(true)
      console.log('redis key ', redisKey)
      const res = await api('/batchprinting/removeTableFromRedis', { redisKey }, 'delete', true, true, ip)
      console.log('res of reset ', res.data)
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
    }
  }

  const getLabels = async (line) => {
    try {
      setIsLoading(true)
      const res = await api(`/batchprinting/getPrinterLabels/${line.printer_id}`, {}, 'get', true, true, ip)
      console.log('Get labels ', res?.data?.data)
      setIsLoading(false);
      if(res?.data.success){
        setProjectSettingData({ ...projectSettingData, labels: res.data?.data?.projectNames, printingTechnology: line.printingTechnology, lineId: line.id, controlPanelId: line.ControlPanel.id });
      }else {
        setProjectSettingData({ ...projectSettingData, printingTechnology: line.printingTechnology, lineId: line.id, controlPanelId: line.ControlPanel.id });
      }
      setOpenProjectModal(!openProjectModal);

    } catch (error) {
      console.error("Error to get print line setting")
      setIsLoading(false)
    }
  }

  const handleOpenSetting = async (line) => {
    console.log('setting of line ', line)
    await getLabels(line);
  }

  return (
    <Box padding={4}>
      <Head>
        <title>Batch Printing</title>
      </Head>
      <Grid2 item xs={12}>
        <Typography variant='h2'>Batch Printing</Typography>
      </Grid2>

      {printerLines?.map((panel, panelIndex) => (
        <Paper
          key={panelIndex}
          sx={{
            padding: '10px 32px',
            marginTop: '16px',
            backgroundColor: settings.mode === 'dark' ? '#212121' : 'white',
            borderRadius: 4
          }}
          elevation={3}
        >
          <Grid2 container spacing={3} sx={{ marginBottom: '16px' }}>
            <Grid2
              item
              xs={12}
              sm={12}
              md={12}
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}
            >
              <Grid2 item xs={12} sm={6} md={6}>
                <Typography variant='h3' className='mx-1 my-2' sx={{ paddingTop: '1%' }}>
                  Control Panel: {panel.panelName}
                </Typography>
              </Grid2>

              <Grid2 item xs={12} sm={6} md={6}>
                <Chip
                  label={panel.connected ? 'Connected' : 'Disconnected'}
                  sx={{ backgroundColor: panel.connected ? '#4caf50' : '#E04347', color: 'white' }}
                />
              </Grid2>
            </Grid2>
          </Grid2>
          {panel?.lines.map((line, lineIndex) => {
              return line.line_pc_ip === ip && (
            <Paper
              key={line.id}
              sx={{
                borderRadius: 2,
                padding: '10px 20px 20px 20px',
                marginBottom: 5,
                backgroundColor: settings.mode === 'dark' ? '#212121' : '#f9fbf9'
              }}
              elevation={3}
            >
              <Grid2 container spacing={2} sx={{ alignItems: 'center', marginBottom: '16px' }}>
                <Grid2 item size={6}>
                  <Typography variant='h4' className='mx-1 my-2' sx={{ paddingTop: '1%' }}>
                    Line Name: {line.printer_line_name}
                  </Typography>
                </Grid2>
                <Grid2 item size={6} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                  <Typography variant='h4' className='mx-3 my-2' sx={{ paddingTop: '1%' }}>
                    Line No: {line.line_no}
                  </Typography>
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: settings.themeColor,
                      borderRadius: 2
                    }}
                  >
                    <IconButton
                      aria-label='settings'
                      onClick={() => handleOpenSetting(line)}
                      disabled={openProjectModal}
                      sx={{ color: 'white', padding: 0 }}
                    >
                      <AiOutlineSetting size={20} />
                    </IconButton>
                  </Box>
                </Grid2>
              </Grid2>
              <Grid2 container spacing={3} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Grid2 item xs={12} sm={3} md={3} lg={3} sx={{ width: '24%' }}>
                  <FormControl className='w-100'>
                    <InputLabel id={`select-product-${panelIndex}-${lineIndex}`}>Select Product</InputLabel>
                    <Select
                      fullWidth
                      disabled={line.saveData}
                      labelId={`select-product-${panelIndex}-${lineIndex}`}
                      id={`select-product-${panelIndex}-${lineIndex}`}
                      label='Select Product'
                      value={line.product}
                      onChange={e => handleProductChange(panelIndex, lineIndex, e.target.value)}
                      onOpen={() => getProducts(panelIndex, lineIndex)}
                    >
                      {line?.products?.map(product => (
                        <MenuItem key={product.id} value={product.id}>
                          {product?.product_name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid2>
                <Grid2 item xs={12} sm={3} md={3} lg={3} sx={{ width: '24%' }}>
                  <FormControl className='w-100' sx={{ ml: 2 }}>
                    <InputLabel id={`select-batch-${panelIndex}-${lineIndex}`}>Select Batch</InputLabel>
                    <Select
                      fullWidth
                      disabled={line.saveData || !line.product}
                      labelId={`select-batch-${panelIndex}-${lineIndex}`}
                      id={`select-batch-${panelIndex}-${lineIndex}`}
                      label='Select Batch'
                      value={line.batch}
                      onChange={e => handleBatchChange(panelIndex, lineIndex, e.target.value, line)}
                    >
                      {line?.batches?.map(batch => (
                        <MenuItem key={batch.id} value={batch.id}>
                          {batch?.batch_no}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid2>
                <Grid2 item xs={12} sm={3} md={3} lg={3} sx={{ width: '24%' }}>
                  <FormControl className='w-100' sx={{ ml: 2 }}>
                    <InputLabel id={`packaging-hierarchy-${panelIndex}-${lineIndex}`}>
                      Select Packaging Hierarchy
                    </InputLabel>
                    <Select
                      fullWidth
                      disabled={line.saveData || !line.batch}
                      labelId={`packaging-hierarchy-${panelIndex}-${lineIndex}`}
                      id={`packaging-hierarchy-${panelIndex}-${lineIndex}`}
                      label='Packaging Hierarchy'
                      value={line.packagingHierarchy}
                      onChange={e => handleInputChange(panelIndex, lineIndex, 'packagingHierarchy', e.target.value)}
                    >
                      {line.packagingHierarchies.map(ph =>
                        getLayerOptions(ph).map((option, idx) => (
                          <MenuItem key={`${ph.id}-${idx}`} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                </Grid2>
                <Grid2 item xs={12} sm={3} md={3} lg={3} sx={{ width: '24%' }}>
                  <Box
                    fullWidth
                    sx={{
                      ml: 1,
                      display: 'flex',
                      gap: '2rem',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <Button
                      variant='contained'
                      onClick={() => handleSubmitForm(panelIndex, lineIndex, line)}
                      disabled={line.saveData}
                    >
                      Save
                    </Button>
                    <Button
                      type='reset'
                      variant='outlined'
                      color='error'
                      onClick={() => handleResetPanel(panelIndex, lineIndex)}
                      disabled={line.disabledReset}
                    >
                      Reset
                    </Button>
                  </Box>
                </Grid2>
              </Grid2>
              {line.saveData && (
                <>
                  <Grid2 container spacing={3} sx={{ marginTop: 2, alignItems: 'center' }}>
                    <Grid2 size={3} item sx={{ width: '24%', marginRight: 1 }}>
                      <TextField
                        disabled={line.availableToCode}
                        value={line.availableToCode}
                        onChange={e => handleInputChange(panelIndex, lineIndex, 'availableToCode', e.target.value)}
                        error={line.errorAvailableToCode.isError}
                        helperText={line.errorAvailableToCode.isError ? line.errorAvailableToCode.message : ''}
                        fullWidth
                        aria-label='available-code'
                        label='Available Code'
                      />
                    </Grid2>
                    <Grid2 size={3} item sx={{ width: '24%' }}>
                      <TextField
                        id='code-to-print'
                        value={line.codeToPrint}
                        onChange={e => {
                          handleInputChange(panelIndex, lineIndex, 'codeToPrint', e.target.value)
                          handleInputChange(panelIndex, lineIndex, 'disabledCodePrintSave', false)
                        }}
                        error={line.errorCodeToPrint.isError}
                        helperText={line.errorCodeToPrint.isError ? line.errorCodeToPrint.message : ''}
                        fullWidth
                        aria-label='code-to-print'
                        label='Code To Print'
                      />
                    </Grid2>
                  </Grid2>
                  <Divider />
                  <Grid2 container className='d-flex justify-content-end align-items-center mb-2'>
                    <Grid2 size={3} item sx={{ paddingLeft: 2 }}>
                      <Typography variant='h4'>
                        {`Pending: ${line.pendingCount || 0}`}
                      </Typography>
                    </Grid2>
                    <Grid2 size={3} item>
                      <Typography variant='h4'>{`Printed: ${line.printCount || 0}`}</Typography>
                    </Grid2>
                    <Grid2 size={3} item>
                      <Typography variant='h4'>{`Scanned: ${line.scanned || 0}`}</Typography>
                    </Grid2>
                    <Grid2 size={3} item>
                      <Box className='w-100' sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          variant='contained'
                          className='py-2'
                          onClick={() => handleCodeToPrint(panelIndex, lineIndex, line)}
                          disabled={line.disabledCodePrintSave}
                        >
                          Save
                        </Button>
                        {
                          apiAccess.addApiAccess && (
                            <>
                              <Button
                                variant='contained'
                                className='py-2 mx-3'
                                onClick={() => handleStartPrinting(panelIndex, lineIndex, line)}
                                disabled={line.disabledStartPrint}
                              >
                                Start
                              </Button>
                              <Button
                                variant='contained'
                                color='error'
                                className='py-2'
                                onClick={() => handleStopPrinting(panelIndex, lineIndex, line)}
                                disabled={line.disabledStopPrint}
                              >
                                Stop
                              </Button>
                            </>
                          )
                        }
                      </Box>
                    </Grid2>
                  </Grid2>
                </>
              )}
            </Paper>
          )})}
        </Paper>
      ))}

      {printerLines.length === 0 && (
        <Box sx={{ marginTop: 5, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Typography variant='h3'>No data found</Typography>
        </Box>
      )}

      {openProjectModal && (
        <ProjectSettings
          openModal={openProjectModal}
          setOpenModal={setOpenProjectModal}
          projectSettingData={projectSettingData}
          apiAccess={apiAccess}
          ip={ip}
        />
      )}
      <SnackbarAlert openSnackbar={openSnackbar} closeSnackbar={closeSnackbar} alertData={alertData} />
    </Box>
  )
}

export async function getServerSideProps(context) {
  return validateToken(context, 'Printer Category')
}
export default ProtectedRoute(Index)
