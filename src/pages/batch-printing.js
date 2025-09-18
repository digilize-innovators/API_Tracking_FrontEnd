/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
'use-client'
import {
  Button,
  TextField,
  Chip,
  Box,
  Grid2,
  Typography,
  IconButton,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Paper,
  Divider
} from '@mui/material'
import { AiOutlineSetting } from 'react-icons/ai'
import Head from 'next/head'
import { useRef, useEffect, useState } from 'react'
import { useLoading } from 'src/@core/hooks/useLoading'
import { useSettings } from 'src/@core/hooks/useSettings'
import ProtectedRoute from 'src/components/ProtectedRoute'
import SnackbarAlert from 'src/components/SnackbarAlert'
import { api } from 'src/utils/Rest-API'
import { validateToken } from 'src/utils/ValidateToken'
import { io } from 'socket.io-client'
import { useAuth } from 'src/Context/AuthContext'
import { useRouter } from 'next/router'
import { useApiAccess } from 'src/@core/hooks/useApiAccess'
import { getTokenValues } from 'src/utils/tokenUtils'
import AuthModal from 'src/components/authModal'
import ProjectSettings from 'src/components/Modal/ProjectSettingModal'

const Index = ({ userId, ip }) => {
  const { settings } = useSettings()
  const [alertData, setAlertData] = useState({ openSnackbar: false, type: '', message: '', variant: 'filled' })
  const [openProjectModal, setOpenProjectModal] = useState(false)
  const [printerLines, setPrinterLines] = useState([])
  const { setIsLoading } = useLoading()
  const socket = useRef(null)
  const [socketId, setSocketId] = useState('')
  const { removeAuthToken } = useAuth()
  const router = useRouter()
  const [projectSettingData, setProjectSettingData] = useState({ lineId: '', printerId: '' })
  const apiAccess = useApiAccess('batch-printing-create', 'batch-printing-update', 'batch-printing-approve')
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [openModalApprove, setOpenModalApprove] = useState(false)
  const [approveAPI, setApproveAPI] = useState({
    approveAPIName: '',
    approveAPImethod: '',
    approveAPIEndPoint: '',
    session: '',
    authUser: {},
    lineId: null
  })
  const [config, setConfig] = useState(null)

  useEffect(() => {
    (async () => {
      await getLinesByPcIp()
      const decodedToken = getTokenValues()
      setConfig(decodedToken)
    })()

    if (!socket.current) {
      // Connect to the backend server
      socket.current = io(`http://${ip}:4000`, { query: { userId } })
    }

    socket.current.on('connect', () => {
      setSocketId(socket.current.id)
    })

    socket.current.on('dataPrinted', handleDataPrinted)
    function handleDataPrinted(data) {
      const { lineId, printCount, panelName } = data
      setPrinterLines(prevLines => {
        return prevLines.map(panel => {
          if (panel.panelName !== panelName) return panel

          return {
            ...panel,
            lines: panel.lines.map(line => {
              if (line.id !== lineId) return line

              return {
                ...line,
                printCount,
                pendingCount: Number(line.codeToPrint) - printCount
              }
            })
          }
        })
      })
    }

    socket.current.on('dataScanned', handleDataScanned)

    function handleDataScanned(data) {
      const { lineId, scanned, panelName } = data
      // console.log('dataScanned', data)
      setPrinterLines(prevLines => {
        return prevLines.map(panel => {
          if (panel.panelName !== panelName) return panel

          return {
            ...panel,
            lines: panel.lines.map(line => {
              if (line.id !== lineId) return line

              return {
                ...line,
                scanned
              }
            })
          }
        })
      })
    }

    socket.current.on('printStarted', handlePrintStarted)

    function handlePrintStarted(data) {
      // console.log('printStarted', data)
      setPrinterLines(prevLines => {
        return prevLines.map(panel => {
          if (panel.panelName !== data.panelName) return panel

          return {
            ...panel,
            connected: true,
            lines: panel.lines.map(line => {
              if (line.id !== data.lineId) return line

              return {
                ...line,
                disabledStartPrint: true,
                disabledStopPrint: false,
                disabledReset: true,
                disabledCodeToPrint: true,
                disabledStopSession: true,
                scanned: 0
              }
            })
          }
        })
      })
      setAlertData({
        openSnackbar: true,
        type: 'success',
        message: 'Printer started',
        variant: 'filled'
      })
    }

    socket.current.on('printStoped', handlePrintStopped)

    function handlePrintStopped(data) {
      console.log('printStoped', data)
      setPrinterLines(prevLines => {
        return prevLines.map(panel => {
          if (panel.panelName !== data.panelName) return panel

          return {
            ...panel,
            connected: false,
            lines: panel.lines.map(line => {
              if (line.id !== data.lineId) return line

              return {
                ...line,
                codeToPrint: data?.pendingCount ? String(data.pendingCount) : line.pendingCount,
                availableToCode: data?.availableCodes ?? line.availableToCode - line.printCount,
                printCount: data?.printCount ?? line.printCount,
                scanned: data?.scanCount ?? line.scanned,
                disabledStartPrint: true,
                disabledStopPrint: true,
                disabledCodePrintSave: false,
                disabledReset: true,
                disabledCodeToPrint: false,
                disabledStopSession: false,
                pendingCount: 0
              }
            })
          }
        })
      })
      setAlertData({
        openSnackbar: true,
        type: 'success',
        message: 'Printer stopped Successfully',
        variant: 'filled'
      })
    }

    socket.current.on('panelPing', handlePanelPing)

    function handlePanelPing(data) {
      setPrinterLines(prevLines => {
        return prevLines.map(panel => {
          if(panel.panelName !== data.panelName) return panel;

          return { ...panel, connected: data.panelConnected }
        })
      })
    }

    socket.current.on('printingCompleted', data => {
      console.log('complete printing ', data)

      setPrinterLines(prev => updatePrintCompleted(prev, data))
      setAlertData({
        openSnackbar: true,
        type: 'success',
        message: 'Printing completed',
        variant: 'filled'
      })
    })

    function updatePrintCompleted(prevLines, data) {
      return prevLines.map(panel => {
        if (panel.panelName !== data.panelName) return panel

        return {
          ...panel,
          connected: false,
          lines: panel.lines.map(line => {
            if (line.id !== data.lineId) return line

            return {
              ...line,
              disabledStartPrint: true,
              disabledStopPrint: true,
              disabledCodeToPrint: false,
              disabledCodePrintSave: false,
              pendingCount: 0,
              printCount: data.printCount,
              scanned: data.scanCount,
              disabledReset: true,
              disabledStopSession: false,
              availableToCode: data.availableCodes
            }
          })
        }
      })
    }

    socket.current.on('onMessage', data => {
      // console.log('onMessage ', data)
      setAlertData({ openSnackbar: true, type: data.type, message: data.message, variant: 'filled' })
    })

    const handleBeforeUnload = event => {
      const message = 'Are you sure you want to leave? Printing Data might be lost.'
      event.preventDefault()
      event.returnValue = message // Shows the confirmation dialog.
      return message // Required for older browsers.
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      if (socket.current) {
        socket.current.disconnect()
      }
    }
  }, [])

  const getPrintingStatus = async groupedPanels => {
    try {
      setIsLoading(true)
      const panels = [...groupedPanels]
      const updatedPanels = await Promise.all(
        panels.map(async panel => {
          // Process all lines asynchronously
          panel.lines = await Promise.all(
            panel.lines.map(async line => {
              const res = await api(`/printLineSetting/restore/${line.id}`, {}, 'get', true, ip, true)
              console.log('Response of restore ', res.data)

              if (res?.data?.success && res?.data?.data) {
                const data = res.data.data.result
                line.product = data.product_id

                // Fetch additional data
                const [productRes, batchRes, levelRes, availRes] = await Promise.all([
                  api('/batchprinting/getAllProducts', {}, 'get', true, ip, true),
                  api(`/batchprinting/getBatchesByProduct/${data.product_id}`, {}, 'get', true, ip, true),
                  api(
                    `/batchprinting/getPackagingHeirarchyFromProductAndBatch/${data.product_id}/${data.batch_id}`,
                    {},
                    'get',
                    true,
                    ip,
                    true
                  ),
                  api(
                    `/batchprinting/getAvailableCodesFromProductAndBatch/${data.product_id}/${data.batch_id}/${data.packing_hierarchy}/${line.ControlPanel.id}/${line.id}`,
                    {},
                    'get',
                    true,
                    ip,
                    true
                  )
                ])

                // Update line properties
                line.products = productRes.data.data.products
                line.batch = data.batch_id
                line.batches = batchRes.data.data.batches
                line.packagingHierarchy = data.packing_hierarchy
                line.packagingHierarchies = [levelRes.data.data.packagingheirarchy]
                line.saveData = true
                line.availableToCode = availRes.data.data.availableCodes
                line.printCount = res.data.data.printCount
                line.scanned = res.data.data.scanCount
                line.pendingCount = res.data.data.pendingCount
                line.codeToPrint = String(res.data.data.codesLength)
                line.disabledStartPrint = true
                line.disabledReset = true
                line.sessionStarted = res.data.data.result.session === 'started'
                line.disabledStartSession = true

                if (data.status === 'running') {
                  line.disabledStopSession = true
                  line.disabledCodePrintSave = true
                  line.disabledStopPrint = false
                  line.disabledCodeToPrint = true
                } else if (data.status === 'pending') {
                  line.disabledStopSession = false
                  line.disabledCodePrintSave = false
                  line.disabledStopPrint = true
                  line.disabledCodeToPrint = false
                } else {
                  line.disabledStopSession = false
                  line.disabledCodePrintSave = false
                  line.disabledStopPrint = true
                  line.disabledCodeToPrint = false
                }
              }
              return line // Return the modified line
            })
          )
          return panel // Return updated panel
        })
      )
      setPrinterLines(updatedPanels) // Now updatedPanels has all the async results
      setIsLoading(false)
    } catch (error) {
      console.log('while fetch data', error)
      setIsLoading(false)
      console.log('Error to get Printing status')
    }
  }

  const getLinesByPcIp = async () => {
    setIsLoading(true)
    try {
      const res = await api(`/batchprinting/getLinesByPcIp/${ip}`, {}, 'get', true, ip, true)
      if (!res) {
        setAlertData({
          openSnackbar: true,
          type: 'error',
          message: 'Error to connect with printing backend',
          variant: 'filled'
        })
      }
      if (res?.data?.success) {
        const groupedPanels = []
        Object.keys(res.data.data.groupedPanels).forEach(key => {
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
            disabledCodeToPrint: true,
            disabledStartSession: true,
            disabledStopSession: true,
            sessionStarted: false,
            pendingCount: 0,
            printCount: 0,
            scanned: 0
          }))
          groupedPanels.push({ panelName: key, lines: values, connected: false })
        })
        console.log('GROUPED PANEL ', groupedPanels)
        setPrinterLines(groupedPanels)
        await getPrintingStatus(groupedPanels)
      } else {
        console.log('Error fetching lines', res?.data)
        if (res?.data?.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('Error to connect with printing backend ', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getProducts = async (panelIndex, lineIndex) => {
    try {
      const res = await api('/batchprinting/getAllProducts', {}, 'get', true, ip, true)
      // console.log('Res of getProducts ', res.data)
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
      const res = await api(`/batchprinting/getBatchesByProduct/${productId}`, {}, 'get', true, ip, true)
      // console.log("Get batches by product " , res.data);

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
      const res = await api(
        `/batchprinting/getPackagingHeirarchyFromProductAndBatch/${productID}/${batchId}`,
        {},
        'get',
        true,
        ip,
        true
      )
      if (res.data.success) {
        // console.log('handleBatchChange', res.data.data)
        const packagingHierarchies = res.data.data.packagingheirarchy
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

  const applyValidationBeforeStart = (panelIndex, lineIndex) => {
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

      if (!line.codeToPrint || parseInt(line.codeToPrint) <= 0) {
        line.errorCodeToPrint = { isError: true, message: 'Code to print must be positive number' }
      } else if (parseInt(line.codeToPrint) > line.availableToCode) {
        line.errorCodeToPrint = { isError: true, message: 'Code to print can not grater than available code' }
      } else if (parseInt(line.codeToPrint) > 1000000) {
        line.errorCodeToPrint = { isError: true, message: 'Code to print can not grater than 1000000' }
      } else {
        line.errorCodeToPrint = { isError: false, message: '' }
      }
      return newLines
    })
  }

  const checkValidate = (panelIndex, lineIndex) => {
    const line = printerLines[panelIndex].lines[lineIndex]
    return line.batch !== '' && line.product !== '' && line.packagingHierarchy !== ''
  }

  const checkValidateBeforeStart = (panelIndex, lineIndex) => {
    const line = printerLines[panelIndex].lines[lineIndex]
    return line.batch !== '' && line.product !== '' && line.packagingHierarchy !== '' && parseInt(line.codeToPrint) > 0 && parseInt(line.codeToPrint) <= parseInt(line.availableToCode) && parseInt(line.codeToPrint) <= 1000000
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
    try {
      setIsLoading(true)
      const res = await api(
        `/batchprinting/getAvailableCodesFromProductAndBatch/${productID}/${batchId}/${packagingHierarchy}/${controlPanelId}/${line.id}`,
        {},
        'get',
        true,
        ip,
        true
      )
      // console.log('Res of submit form ', res.data)
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
          line.disabledCodeToPrint = false
          return panels
        })
      } else {
        console.log('Error fetching codes', res.data)
        setAlertData({ openSnackbar: true, variant: 'filled', type: 'error', message: res.data?.message })
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
    applyValidationBeforeStart(panelIndex, lineIndex)
    // Check validation
    if (!checkValidateBeforeStart(panelIndex, lineIndex)) {
      return
    }
    try {
      const res = await api(`/batchprinting/sendCodesToPrinter`, { line, socketId }, 'post', true, ip, true)
      // console.log('res of handlestart printing ', res.data)

      if (res.data.success) {
        setPrinterLines(prevLines => {
          const panels = [...prevLines]
          const panel = panels[panelIndex]
          panel.connected = false
          const line = panel.lines[lineIndex]
          line.saveData = true
          line.disabledCodePrintSave = true
          line.disabledStartPrint = false
          line.disabledReset = true
          line.disabledCodeToPrint = true
          return panels
        })
      } else {
        console.log('Error send codes to printer', res.data)
        setAlertData({ openSnackbar: true, type: 'error', message: res.data.message, variant: 'filled' })
        setPrinterLines(prevLines => {
          const panels = [...prevLines]
          const panel = panels[panelIndex]
          panel.connected = false
          return panels
        })
        if (res.data.code === 401) {
          removeAuthToken()
          router.push('/401')
        }
      }
    } catch (error) {
      console.log('Error fetching codes', error)
    }
  }

  const handleStartPrinting = async line => {
    try {
      const data = {
        printerId: line.printer_id,
        panelId: line.ControlPanel.id,
        panelName: line.ControlPanel.name,
        cameraEnable: line.camera_enable,
        cameraId: line.cameraId,
        lineId: line.id,
        productId: line.product,
        batchId: line.batch,
        packagingHierarchy: line.packagingHierarchy,
        codeToPrint: line.codeToPrint,
        lineNo: line.line_no
      }
      socket.current.emit('startPrinting', data)
    } catch (error) {
      console.log('Error handleStart Printing', error)
      setAlertData({ ...alertData, type: 'error', message: error, openSnackbar: true })
    }
  }

  const handleStopPrinting = async line => {
    try {
      const data = {
        printerId: line.printer_id,
        panelId: line.ControlPanel.id,
        panelName: line.ControlPanel.name,
        cameraEnable: line.camera_enable,
        cameraId: line.cameraId,
        lineId: line.id,
        productId: line.product,
        batchId: line.batch,
        packagingHierarchy: line.packagingHierarchy,
        codeToPrint: line.codeToPrint,
        lineNo: line.line_no
      }
      socket.current.emit('stopPrinting', data)
      const updatedPrinterLines = [...printerLines]
      const panel = updatedPrinterLines?.find(p => p.panelName === line.ControlPanel.name)
      if (!panel) return
      const panelLine = panel.lines.find(l => l.id === line.id)
      if (!panelLine) return
      panelLine.disabledStopPrint = true
      setPrinterLines(updatedPrinterLines)
    } catch (error) {
      console.log('Error handleStop Printing', error)
      setAlertData({ ...alertData, type: 'error', message: error, openSnackbar: true })
    }
  }

  const closeSnackbar = () => {
    setAlertData({ ...alertData, openSnackbar: false })
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
      const res = await api(
        '/batchprinting/removeTableFromRedis',
        { redisKey, lineId: line.id },
        'delete',
        true,
        ip,
        true
      )
      console.log('res of reset ', res.data)
      setIsLoading(false)
    } catch (error) {
      console.log(error)
      setIsLoading(false)
    }
  }

  const handleOpenSetting = async line => {
    setProjectSettingData({ ...projectSettingData, lineId: line.id, printerId: line.printer_id })
    setOpenProjectModal(!openProjectModal)
  }

  const handleAfterStartSession = async lineId => {
    const data = { stop: false, userId, lineId }
    const updatedPanels = printerLines.map(panel => {
      const updatedLines = panel.lines.map(line => {
        if (line.id === lineId) {
          return {
            ...line,
            disabledCodePrintSave: false,
            disabledStartSession: true,
            disabledCodeToPrint: true,
            disabledStopSession: false,
            disabledReset: true,
            sessionStarted: true
          }
        }
        return line
      })
      return { ...panel, lines: updatedLines }
    })
    setPrinterLines(updatedPanels)
    try {
      socket.current.emit('stopPrintingSession', data)
    } catch (error) {
      console.log('Error handle Stop Printing Session ', error)
      setAlertData({ ...alertData, type: 'error', message: error, openSnackbar: true })
    }
  }

  const handleAfterStopSession = async lineId => {
    const data = { stop: true, userId, lineId }
    const updatedPanels = printerLines.map(panel => {
      const updatedLines = panel.lines.map(line => {
        if (line.id === lineId) {
          return {
            ...line,
            disabledCodePrintSave: true,
            disabledStartSession: true,
            disabledStopSession: true,
            disabledCodeToPrint: true,
            disabledStartPrint: true,
            disabledStopPrint: true,
            disabledReset: false,
            sessionStarted: false
          }
        }
        return line
      })
      return { ...panel, lines: updatedLines }
    })
    setPrinterLines(updatedPanels)
    try {
      socket.current.emit('stopPrintingSession', data)
    } catch (error) {
      console.log('Error handle Stop Printing Session ', error)
      setAlertData({ ...alertData, type: 'error', message: error, openSnackbar: true })
    }
  }

  const handleSessionStart = async data => {
    if (config?.config?.esign_status) {
      setApproveAPI({
        approveAPIName: 'batch-printing-create',
        approveAPImethod: 'POST',
        approveAPIEndPoint: '/api/v1/batch-printing',
        session: 'start',
        authUser: {},
        lineId: data.id
      })
      setAuthModalOpen(true)
    } else {
      handleAfterStartSession(data.id)
    }
  }

  const handleSessionStop = async data => {
    if (config?.config?.esign_status) {
      setApproveAPI({
        approveAPIName: 'batch-printing-create',
        approveAPImethod: 'POST',
        approveAPIEndPoint: '/api/v1/batch-printing',
        session: 'stop',
        authUser: {},
        lineId: data.id
      })
      setAuthModalOpen(true)
    } else {
      handleAfterStopSession(data.id)
    }
  }

  const handleAuthModalClose = () => {
    setAuthModalOpen(false)
    setOpenModalApprove(false)
  }

  const handleAuthModalOpen = user => {
    setApproveAPI({
      ...approveAPI,
      approveAPIName: 'batch-printing-approve',
      approveAPImethod: 'PATCH',
      approveAPIEndPoint: '/api/v1/batch-printing',
      authUser: user
    })
    setAuthModalOpen(true)
  }

  const handleAuthResult = async (isAuthenticated, user, isApprover, esignStatus) => {
    const resetState = () => {
      setApproveAPI({
        approveAPIName: '',
        approveAPImethod: '',
        approveAPIEndPoint: '',
        session: '',
        authUser: {},
        lineId: null
      })
      setAuthModalOpen(false)
      setOpenModalApprove(false)
    }

    if (!isAuthenticated) {
      setAlertData({ type: 'error', message: 'Authentication failed, please try again.', openSnackbar: true })
      return
    }

    const prepareData = () => ({
      esignStatus,
      session: approveAPI.session,
      lineId: approveAPI.lineId,
      audit_log: config?.config?.audit_logs ? { authUser: user.user_id } : {}
    })

    try {
      if (esignStatus === 'rejected') {
        console.log('eSign rejected.')
        resetState()
        return
      }

      if (esignStatus === 'approved') {
        if (isApprover) {
          if (approveAPI.authUser.userId === user.userId) {
            setAlertData({ type: 'error', message: 'Same user cannot approve.', openSnackbar: true })
            return
          }
          await api('/esign-status/double-esign', prepareData(), 'patch', true)
          approveAPI.session === 'start'
            ? handleAfterStartSession(approveAPI.lineId)
            : handleAfterStopSession(approveAPI.lineId)
          resetState()
        } else {
          await api(
            '/esign-status/double-esign',
            {
              esignStatus: 'approved',
              audit_log: config?.config?.audit_logs ? { authUser: user.user_id } : {}
            },
            'patch',
            true
          )
          handleAuthModalOpen(user)
        }
      }
    } catch (error) {
      console.error('Error handling auth result:', error)
      setAlertData({ type: 'error', message: 'An error occurred during authentication.', openSnackbar: true })
    }
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
          key={panel?.panelName}
          sx={{
            padding: '10px 32px',
            marginTop: '16px',
            backgroundColor: settings.mode === 'dark' ? '#212121' : '#dedfe529',
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
            return (
              line.line_pc_ip === ip && (
                <Paper
                  key={line.id}
                  sx={{
                    borderRadius: 2,
                    padding: '10px 20px 20px 20px',
                    marginBottom: 5,
                    backgroundColor: settings.mode === 'dark' ? '#212121' : '#f9fbf92e'
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
                            <MenuItem key={product.product_uuid} value={product.product_uuid}>
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
                          <MenuItem value={'firstLayer'}>{'First Layer'}</MenuItem>
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
                            disabled={line.disabledCodeToPrint}
                            value={line.codeToPrint}
                            onChange={e => {
                              handleInputChange(panelIndex, lineIndex, 'codeToPrint', e.target.value)
                              if (!line.sessionStarted && e.target.value !== '')
                                handleInputChange(panelIndex, lineIndex, 'disabledStartSession', false)
                              else handleInputChange(panelIndex, lineIndex, 'disabledStartSession', true)
                            }}
                            error={line.errorCodeToPrint.isError}
                            helperText={line.errorCodeToPrint.isError ? line.errorCodeToPrint.message : ''}
                            fullWidth
                            type='number'
                            aria-label='code-to-print'
                            label='Code To Print'
                          />
                        </Grid2>
                        <Grid2 size={3} item sx={{ width: '20%' }}>
                          <Button
                            variant='contained'
                            className='py-2'
                            onClick={() => handleSessionStart(line)}
                            disabled={line.disabledStartSession}
                          >
                            Start Session
                          </Button>
                        </Grid2>
                        <Grid2 size={3} item sx={{ width: '20%' }}>
                          <Button
                            variant='contained'
                            className='py-2'
                            onClick={() => handleSessionStop(line)}
                            disabled={line.disabledStopSession}
                          >
                            Stop Session
                          </Button>
                        </Grid2>
                      </Grid2>
                      <Divider />
                      <Grid2 container className='d-flex justify-content-end align-items-center mb-2'>
                        <Grid2 size={3} item sx={{ paddingLeft: 2 }}>
                          <Typography variant='h4'>{`Pending: ${line.pendingCount || 0}`}</Typography>
                        </Grid2>
                        <Grid2 size={3} item>
                          <Typography variant='h4'>{`Printed: ${line.printCount || 0}`}</Typography>
                        </Grid2>
                        {line.camera_enable && (
                          <Grid2 size={3} item>
                            <Typography variant='h4'>{`Scanned: ${line.scanned || 0}`}</Typography>
                          </Grid2>
                        )}
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
                            {apiAccess.addApiAccess && (
                              <>
                                <Button
                                  variant='contained'
                                  className='py-2 mx-3'
                                  onClick={() => handleStartPrinting(line)}
                                  disabled={line.disabledStartPrint}
                                >
                                  Start
                                </Button>
                                <Button
                                  variant='contained'
                                  color='error'
                                  className='py-2'
                                  onClick={() => handleStopPrinting(line)}
                                  disabled={line.disabledStopPrint}
                                >
                                  Stop
                                </Button>
                              </>
                            )}
                          </Box>
                        </Grid2>
                      </Grid2>
                    </>
                  )}
                </Paper>
              )
            )
          })}
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
          setAlertData={setAlertData}
        />
      )}
      <SnackbarAlert openSnackbar={alertData.openSnackbar} closeSnackbar={closeSnackbar} alertData={alertData} />
      <AuthModal
        open={authModalOpen}
        handleClose={handleAuthModalClose}
        approveAPI={{
          approveAPIName: approveAPI.approveAPIName,
          approveAPImethod: approveAPI.approveAPImethod,
          approveAPIEndPoint: approveAPI.approveAPIEndPoint
        }}
        handleAuthResult={handleAuthResult}
        config={config}
        handleAuthModalOpen={handleAuthModalOpen}
        openModalApprove={openModalApprove}
      />
    </Box>
  )
}

export async function getServerSideProps(context) {
  return validateToken(context, 'Batch Printing')
}
export default ProtectedRoute(Index)
