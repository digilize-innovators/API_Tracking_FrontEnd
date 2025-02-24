'use-client'
import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import SnackbarAlert from 'src/components/SnackbarAlert';
import { api } from 'src/utils/Rest-API';
import ProtectedRoute from 'src/components/ProtectedRoute';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import moment from 'moment';
import { useRouter } from 'next/router'
import { useAuth } from 'src/Context/AuthContext'
import { useLoading } from 'src/@core/hooks/useLoading'
import AuthModal from 'src/components/authModal';
import ChatbotComponent from 'src/components/ChatbotComponent'
import AccessibilitySettings from 'src/components/AccessibilitySettings'
import { validateToken } from 'src/utils/ValidateToken';
import { decodeAndSetConfig } from 'src/utils/tokenUtils';
import Head from 'next/head'
import { Grid2, Typography } from '@mui/material';
import { columnsStateInitializer } from '@mui/x-data-grid/internals';

const BatchReport = () => {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState('');
    const [report, setReport] = useState(null);
    const router = useRouter();
    const [alertData, setAlertData] = useState({ type: '', message: '', variant: 'filled' });
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const { getUserData, removeAuthToken } = useAuth()
    const { setIsLoading } = useLoading()
    const [config, setConfig] = useState(null);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [esignModalForCreator, setEsignModalForCreator] = useState(true);
    const [approveAPIName, setApproveAPIName] = useState('');
    const [approveAPImethod, setApproveAPImethod] = useState('');
    const [approveAPIEndPoint, setApproveAPIEndPoint] = useState('');
    const [openModalApprove, setOpenModalApprove] = useState(false);
    const [exportedBy, setExportedBy] = useState('');
    const [approvedBy, setApprovedBy] = useState('');
    useEffect(() => {
        fetchProducts();
        decodeAndSetConfig(setConfig);
        let data = getUserData();
        setExportedBy(data);
    }, []);
    useEffect(() => {
        if (selectedProduct) {
            getAllBatches();
        }
    }, [selectedProduct]);
    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            const response = await api('/product/', {}, 'get', true);
            console.log("All products ", response.data);
            if (response.data.success) {
                setProducts(response.data.data.products);
                setIsLoading(false);
            } else {
                setIsLoading(false);
                if (response.data.code === 401) {
                    removeAuthToken();
                    router.push('/401');
                }
            }
        } catch (error) {
            setIsLoading(false);
            console.error('Error fetching products:', error);
            setAlertData({ type: 'error', message: 'Failed to fetch products', variant: 'filled' });
            setOpenSnackbar(true);
        }
    };
    const getAllBatches = async () => {
        try {
            setIsLoading(true);
            const res = await api(`/batch/${selectedProduct}`, {}, 'get', true)

            console.log('All batches ', res.data)
            if (res.data.success) {
                setBatches(res.data.data.batches);
                setIsLoading(false);
            } else {
                setIsLoading(false);
                console.log('Error to get all batches ', res.data);
                setBatches([]);
                setAlertData({ type: 'warning', message: 'No batches found for selected product.', variant: 'filled' });
                setOpenSnackbar(true);
                if (res.data.code === 401) {
                    removeAuthToken();
                    router.push('/401');
                }
            }
        } catch (error) {
            console.log('Error in get batches ', error);
            setAlertData({ type: 'error', message: 'Failed to fetch batches', variant: 'filled' });
            setOpenSnackbar(true);
        } finally {
            setIsLoading(false)
        }
    }
    const handleProductChange = (event) => {
        setSelectedProduct(event.target.value);
        setSelectedBatch('');
        setBatches([]);
        setReport(null);
    };
    const handleBatchChange = (event) => {
        setSelectedBatch(event.target.value);
    };
    const handleGenerateReport = async () => {
        if (!selectedProduct || !selectedBatch) {
            setAlertData({ type: 'warning', message: 'Please select both product and batch before generating report.', variant: 'filled' });
            setOpenSnackbar(true);
            return;
        }
        try {
            const response = await api('/batch/getbatchreportbyproduct', {
                productId: selectedProduct,
                batchId: selectedBatch,
            }, 'post', true);
            console.log("BAtch report res ", response.data.data.dynamicTable);
            if (response.data.success && response.data.data === null) {
                setAlertData({ type: 'error', message: response.data.message, variant: 'filled' });
                setOpenSnackbar(true);
            }
            if (response.data.success && response.data.data !== null) {
                setReport(response.data.data);

                setAlertData({ type: 'success', message: 'Report generated successfully.', variant: 'filled' });
                setOpenSnackbar(true);
            }
            if (!response.data.success) {
                setAlertData({ type: 'error', message: 'Failed to generate report.', variant: 'filled' });
                setOpenSnackbar(true);

            }
        } catch (error) {
            console.error('Error generating report:', error);
            setAlertData({ type: 'error', message: 'Error generating report: ' + error.message, variant: 'filled' });
            setOpenSnackbar(true);
        }
    };
    const handleDownloadReport = () => {
        if (esignModalForCreator) {
            setApproveAPIName("batch-report-create");
            setApproveAPImethod("POST");
            setApproveAPIEndPoint("/api/v1/batch-report");
        } else {
            setApproveAPIName("batch-report-approve");
            setApproveAPImethod("PATCH");
            setApproveAPIEndPoint("/api/v1/batch-report");
        }
        if (config?.config?.esign_status) {
            setAuthModalOpen(true);
            return;
        }
        downloadPdf();
    };
    const downloadPdf = (approver) => {
        if (!report) {
            setAlertData({
                type: 'warning',
                message: 'Please generate the report before downloading.',
                variant: 'filled',
            });
            setOpenSnackbar(true);
            return;
        }
        const data = report;
        const doc = new jsPDF();
        const HEADER_HEIGHT = 40;
        const FOOTER_HEIGHT = 30;
        let currentY = HEADER_HEIGHT;
        const headerContent = () => {
            const img = new Image();
            img.src = '/images/brand.png';
            const logoWidth = 45;
            const logoHeight = 28;
            const logoX = doc.internal.pageSize.width - logoWidth - 12;
            const logoY = 8;
            doc.addImage(img, 'PNG', logoX, logoY, logoWidth, logoHeight);
            doc
                .setFontSize(16)
                .setFont(undefined, 'bold')
                .text('Batch Report', 105, 14, null, null, 'center');
        };
        const footerContent = (pageNumber, totalPages) => {
            doc.setFontSize(8).setFont(undefined, 'normal');
            doc.text(
                `Exported By: ${exportedBy.userName}`,
                20,
                doc.internal.pageSize.height - FOOTER_HEIGHT + 10
            );
            doc.text(
                `Exported At: ${moment(exportedBy.exportedAt || new Date()).format(
                    'DD/MM/YYYY hh:mm:ss a'
                )}`,
                20,
                doc.internal.pageSize.height - FOOTER_HEIGHT + 15
            );
            if (config?.config?.esign_status) {
                doc.text(
                    `Approved By: ${approver.approverUserName}`,
                    20,
                    doc.internal.pageSize.height - FOOTER_HEIGHT + 20
                );
                doc.text(
                    `Approved At: ${moment(approver.approvedAt || new Date()).format(
                        'DD/MM/YYYY hh:mm:ss a'
                    )}`,
                    20,
                    doc.internal.pageSize.height - FOOTER_HEIGHT + 25
                );
            }
            doc.text(
                `Page ${pageNumber} of ${totalPages || 1}`,
                doc.internal.pageSize.width - 50,
                doc.internal.pageSize.height - FOOTER_HEIGHT + 25,
                null,
                null,
                'center'
            );
        };
        const drawFooterOnAllPages = () => {
            const totalPages = doc.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                footerContent(i, totalPages);
            }
        };
        const renderBatchDetails = () => {
            const rows =
                [
                    data.batchinfo.ProductID,
                    data.batchinfo.ProductName,
                    data.batchinfo.BatchNo,
                    data.batchinfo.Location,
                    data.batchinfo.Quantity,
                    data.batchinfo.ManufactureDate
                        ? moment(data.batchinfo.ManufactureOn).format('DD/MM/YYYY ')
                        : 'N/A',
                    data.batchinfo.ExpireDate
                        ? moment(data.batchinfo.ExpireDate).format('DD/MM/YYYY ')
                        : 'N/A',
                    data.batchinfo.CreatedAt
                        ? moment(data.batchinfo.CreatedAt).format('DD/MM/YYYY ')
                        : 'N/A',

                ]

            doc.setFontSize(12).setFont(undefined, 'bold');
            currentY += 10;
            doc.text('Batch Details:', 14, currentY);
            currentY += 10;
            autoTable(doc, {
                startY: currentY + 5,
                head: [
                    [
                        'Product ID',
                        'Product Name',
                        'Batch No.',
                        'Location',
                        'Batch Quantity',
                        'Manufacture Date',
                        'Expire Date',
                        'Created At'

                    ],
                ],
                body: [rows],

                styles: { fontSize: 8, cellPadding: 1, overflow: 'linebreak' },
                theme: 'grid',
                margin: { top: HEADER_HEIGHT + 5, bottom: FOOTER_HEIGHT + 10 },
                headStyles: { halign: 'center', fontStyle: 'bold' },
                didDrawPage: headerContent,
            });
            currentY = doc.lastAutoTable.finalY + 10;
        };
        const renderBatchExecutionHistory = () => {
            const rows = data.dynamicTable
            let unique = []
            let columns = ["Code", "Parent Code", "Grand Parent Code", "Grand Parent Code", "Grand Parent Code"]
            for (let [key, value] of Object.entries(rows)) {
                if (value.length > 0) {
                    unique.push([...value])
                    // columns.push(key)
                }


            }
            const uniqueData = unique.map((item) => {
                return item.map((Uc) => {
                    return (Uc.unique_code)
                })
            })

            doc.setFontSize(12).setFont(undefined, 'bold');
            currentY += 10;
            // doc.text('Batch Execution History:', 14, currentY);
            //   autoTable(doc, {
            //       startY: currentY + 5,
            //       head: 
            //         [['qunicode0']],

            //       body: [uniqueData[0]],
            //       styles: { fontSize: 8, cellPadding: 1, overflow: 'linebreak' },
            //       theme: 'grid',
            //       margin: { top: HEADER_HEIGHT + 5, bottom: FOOTER_HEIGHT + 10 },
            //       headStyles: { halign: 'center', fontStyle: 'bold' },
            //       didDrawPage: headerContent,
            //   });
            console.log(uniqueData)
            //  uniqueData.forEach((data, index) => {
            //     console.log(data)
            //     autoTable(doc, {
            //         startY: currentY + 5,
            //         head: [[columns[index]]],
            //         body: [data],
            //         styles: { fontSize: 8, cellPadding: 1, overflow: 'linebreak' },
            //         theme: 'grid',
            //         margin: { top: HEADER_HEIGHT + 5, bottom: FOOTER_HEIGHT + 10 },
            //         headStyles: { halign: 'center', fontStyle: 'bold' },
            //         didDrawPage: headerContent,
            //     });
            // });
            // uniqueData.forEach((data, index) => {
            //     console.log(data); // Ensure data is properly formatted

            //     autoTable(doc, {
            //         startY: currentY + 5, // Ensure `currentY` is correctly calculated before
            //         head: [[columns[index]]], // `columns[index]` should match the current table's header
            //         body: Array.isArray(data) ? data.map((item) => [item]) : [[data]], // Ensure body is a 2D array
            //         styles: { fontSize: 8, cellPadding: 1, overflow: 'linebreak' },
            //         theme: 'grid',
            //         margin: { top: HEADER_HEIGHT + 5, bottom: FOOTER_HEIGHT + 10 },
            //         headStyles: { halign: 'center', fontStyle: 'bold' },
            //         didDrawPage: (data) => {
            //             // Redraw the header for each page
            //             if (headerContent) headerContent(data);
            //         },
            //     });

            //     currentY = doc.lastAutoTable.finalY + 10; // Add spacing after each table
            // });
            doc.text('Printed Code Summary', 14, currentY);
            uniqueData.forEach((data, index) => {
                console.log(data); // Ensure data is properly formatted
                autoTable(doc, {
                    startY: currentY + 10, // Ensure `currentY` is correctly calculated
                    head: [["Sr.No", columns[index]]], // `columns[index]` should match the current table's header
                    body: Array.isArray(data) ? data.map((item) => [item]) : [[data]], // Ensure body is a 2D array
                    styles: { fontSize: 8, cellPadding: 1, overflow: 'linebreak', halign: 'center' },
                    theme: 'grid',
                    margin: { top: HEADER_HEIGHT + 5, bottom: FOOTER_HEIGHT + 10 },
                    headStyles: { halign: 'center', fontStyle: 'bold' },
                    bodyStyles: { halign: 'center' },
                    // columnStyles: {
                    //     0: { cellWidth: 100 } // Adjust the width of the first (and only) column
                    // },
                    didParseCell: (data) => {
                        if (data.section === "body" && data.column.index === 0) {
                            data.cell.text = `${data.row.index + 1}`; // Sr. No.
                        }
                        if (data.section === "body" && data.column.index === 1) {
                            data.cell.text = `${data.row.raw[0]}`; // Sr. No.
                        }
                    },
                    // tableWidth: 'wrap', // Wraps the table to its content; set to 'auto' or '100%' for full width
                    didDrawPage: (data) => {
                        // Redraw the header for each page
                        if (headerContent) headerContent(data);
                    },
                });

                // Update `currentY` to the end of the last table
                currentY = doc.lastAutoTable.finalY + 10; // Add spacing after each table
            });
        };


        const renderScannedCode = () => {
            const rows = data.scannedTable
            let unique = []
            let columns = ["Code", "Parent Code", "Parent Code", "Parent Code", "Grand Parent Code"]
            for (let [key, value] of Object.entries(rows)) {
                if (value.length > 0) {
                    unique.push([...value])
                    // columns.push(key)
                }


            }
            const uniqueData = unique.map((item) => {
                return item.map((Uc) => {
                    return (Uc.unique_code)
                })
            })

            doc.setFontSize(12).setFont(undefined, 'bold');
            currentY += 10;
            // doc.text('Batch Execution History:', 14, currentY);
            //   autoTable(doc, {
            //       startY: currentY + 5,
            //       head: 
            //         [['qunicode0']],

            //       body: [uniqueData[0]],
            //       styles: { fontSize: 8, cellPadding: 1, overflow: 'linebreak' },
            //       theme: 'grid',
            //       margin: { top: HEADER_HEIGHT + 5, bottom: FOOTER_HEIGHT + 10 },
            //       headStyles: { halign: 'center', fontStyle: 'bold' },
            //       didDrawPage: headerContent,
            //   });
            console.log(uniqueData)
            //  uniqueData.forEach((data, index) => {
            //     console.log(data)
            //     autoTable(doc, {
            //         startY: currentY + 5,
            //         head: [[columns[index]]],
            //         body: [data],
            //         styles: { fontSize: 8, cellPadding: 1, overflow: 'linebreak' },
            //         theme: 'grid',
            //         margin: { top: HEADER_HEIGHT + 5, bottom: FOOTER_HEIGHT + 10 },
            //         headStyles: { halign: 'center', fontStyle: 'bold' },
            //         didDrawPage: headerContent,
            //     });
            // });
            // uniqueData.forEach((data, index) => {
            //     console.log(data); // Ensure data is properly formatted

            //     autoTable(doc, {
            //         startY: currentY + 5, // Ensure `currentY` is correctly calculated before
            //         head: [[columns[index]]], // `columns[index]` should match the current table's header
            //         body: Array.isArray(data) ? data.map((item) => [item]) : [[data]], // Ensure body is a 2D array
            //         styles: { fontSize: 8, cellPadding: 1, overflow: 'linebreak' },
            //         theme: 'grid',
            //         margin: { top: HEADER_HEIGHT + 5, bottom: FOOTER_HEIGHT + 10 },
            //         headStyles: { halign: 'center', fontStyle: 'bold' },
            //         didDrawPage: (data) => {
            //             // Redraw the header for each page
            //             if (headerContent) headerContent(data);
            //         },
            //     });

            //     currentY = doc.lastAutoTable.finalY + 10; // Add spacing after each table
            // });
            doc.text('Scanned Summary Report', 14, currentY);
            uniqueData.forEach((data, index) => {
                console.log(data); // Ensure data is properly formatted
                autoTable(doc, {
                    startY: currentY + 10, // Ensure `currentY` is correctly calculated
                    head: [["SR.NO", columns[index]]], // `columns[index]` should match the current table's header
                    body: Array.isArray(data) ? data.map((item) => [item]) : [[data]], // Ensure body is a 2D array
                    styles: { fontSize: 8, cellPadding: 1, overflow: 'linebreak', halign: 'center' },
                    theme: 'grid',
                    margin: { top: HEADER_HEIGHT + 5, bottom: FOOTER_HEIGHT + 10 },
                    headStyles: { halign: 'center', fontStyle: 'bold' },
                    bodyStyles: { halign: 'center' },
                    // columnStyles: {
                    //     0: { cellWidth: 100 } // Adjust the width of the first (and only) column
                    // },
                    didParseCell: (data) => {
                        if (data.section === "body" && data.column.index === 0) {
                            data.cell.text = `${data.row.index + 1}`; // Sr. No.
                        }
                        if (data.section === "body" && data.column.index === 1) {
                            data.cell.text = `${data.row.raw[0]}`; // Sr. No.
                        }
                    },
                    // tableWidth: 'wrap', // Wraps the table to its content; set to 'auto' or '100%' for full width
                    didDrawPage: (data) => {
                        // Redraw the header for each page
                        if (headerContent) headerContent(data);
                    },
                });

                // Update `currentY` to the end of the last table
                currentY = doc.lastAutoTable.finalY + 10; // Add spacing after each table
            });
        };


        // const renderProcessExecutionHistory = (item) => {
        //     console.log(item)
        //     doc.setFontSize(12).setFont(undefined, 'bold');
        //     currentY += 10;
        //     doc.text('Batch Process Execution History:', 14, currentY);
        //     autoTable(doc, {
        //         startY: currentY + 5,
        //         head: [
        //             [
        //                 'Process Name',
        //                 'Started By',
        //                 'Started At',
        //                 'Stopped By',
        //                 'Stopped At',
        //                 'Completed By',
        //                 'Completed At',
        //             ],
        //         ],
        //         body: [
        //             [
        //                 item.ProcessName || 'N/A',
        //                 item.StartedBy || 'N/A',
        //                 item.StartedAt
        //                     ? moment(item.startedAt).format('DD/MM/YYYY hh:mm:ss a')
        //                     : 'N/A',
        //                 item.StoppedBy || 'N/A',
        //                 item.StoppedAt
        //                     ? moment(item.stopedAt).format('DD/MM/YYYY hh:mm:ss a')
        //                     : 'N/A',
        //                 item.CompletedBy || 'N/A',
        //                 item.CompletedAt
        //                     ? moment(item.CompletedAt).format('DD/MM/YYYY hh:mm:ss a')
        //                     : 'N/A',
        //             ],
        //             [
        //                 {
        //                     content: 'Test Details',
        //                     colSpan: 7,
        //                     styles: { fontStyle: 'bold', fontSize: 12 },
        //                 },
        //             ],
        //             [
        //                 {
        //                     content: '',
        //                     colSpan: 7,
        //                     styles: { halign: 'left' },
        //                 },
        //             ],
        //         ],
        //         styles: { fontSize: 8, cellPadding: 1, overflow: 'linebreak' },
        //         theme: 'grid',
        //         margin: { top: HEADER_HEIGHT + 5, bottom: FOOTER_HEIGHT + 10 },
        //         headStyles: { halign: 'center', fontStyle: 'bold' },
        //         didDrawPage: headerContent,
        //         didDrawCell: (cellData) => {
        //             renderTestExecutionHistory(cellData, item);
        //         },
        //     });
        //     currentY = doc.lastAutoTable.finalY + 10;
        // };
        // const renderTestExecutionHistory = (cellData, item) => {
        //     if (
        //         cellData.section === 'body' &&
        //         cellData.row.index === 2 &&
        //         cellData.column.index === 0
        //     ) {
        //         console.log(item.testExecutionHistory)
        //         const testExecutionHistory = Array.isArray(item.testExecutionHistory)
        //             ? item.testExecutionHistory
        //             : [];

        //         const rows = testExecutionHistory.map((test) => [
        //             test.TestName || 'N/A',
        //             test.Interval || 'N/A',
        //             test.InstrumentCategory || 'N/A',
        //             test.InstrumentID || 'N/A',
        //             test.Type || 'N/A',
        //             test.ParameterName || 'N/A',
        //             test.Min || 'N/A',
        //             test.Max || 'N/A',
        //             test.Measure || 'N/A',
        //             test.UOM || 'N/A',
        //             test.Result ? 'Pass' : 'Fail',
        //             test.StartAt
        //                 ? moment(test.startedAt).format('DD/MM/YYYY hh:mm:ss a')
        //                 : 'N/A',
        //             test.StopAt
        //                 ? moment(test.stopedAt).format('DD/MM/YYYY hh:mm:ss a')
        //                 : 'N/A',
        //         ]);

        //         const nestedTableHeight =
        //             (item.testExecutionHistory?.length || 0) * 10 + 20;
        //         const availableHeight =
        //             doc.internal.pageSize.height - FOOTER_HEIGHT - cellData.cell.y;
        //         if (nestedTableHeight > availableHeight) {
        //             doc.addPage();
        //             headerContent();
        //             cellData.cell.y = HEADER_HEIGHT + 10;
        //         }
        //         autoTable(doc, {
        //             startY: cellData.cell.y,
        //             head: [

        //                 [
        //                     'Test Name',
        //                     'Interval',
        //                     'Instrument Category',
        //                     'Instrument ID',
        //                     'Type',
        //                     'Parameter Name',
        //                     'Min',
        //                     'Max',
        //                     'Measure',
        //                     'UOM',
        //                     'Result',
        //                     'Start At',
        //                     'Stop At',
        //                 ],

        //             ],
        //             body: rows,
        //             styles: { fontSize: 8, cellPadding: 1, overflow: 'linebreak' },
        //             theme: 'grid',
        //             tableWidth: 'auto',
        //             headStyles: { halign: 'center', fontStyle: 'bold' },
        //             margin: { left: cellData.cell.x },
        //         });
        //         cellData.row.height = nestedTableHeight;
        //     }
        // };
        const buildPdfContent = () => {
            renderBatchDetails();
            renderBatchExecutionHistory();
            renderScannedCode();
            // data.processExecutionHistory.forEach(renderProcessExecutionHistory);
        };
        buildPdfContent();
        drawFooterOnAllPages();
        const currentDate = new Date();
        const formattedDate = currentDate
            .toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            })
            .replace(/\//g, '-');
        const formattedTime = currentDate
            .toLocaleTimeString('en-US', { hour12: false })
            .replace(/:/g, '-');
        const fileName = `Batch_Report_${formattedDate}_${formattedTime}.pdf`;
        doc.save(fileName);
    };
    const handleAuthModalClose = () => {
        setAuthModalOpen(false);
        setOpenModalApprove(false);
    };
    const handleAuthResult = async (isAuthenticated, user, isApprover, esignStatus, remarks) => {
        console.log("handleAuthResult 01", isAuthenticated, isApprover, esignStatus, user);
        console.log("handleAuthResult 02", config.userId, user.user_id);
        const resetState = () => {
            setApproveAPIName('');
            setApproveAPImethod('');
            setApproveAPIEndPoint('');
            setAuthModalOpen(false);
        };
        if (!isAuthenticated) {
            setAlertData({ type: 'error', message: 'Authentication failed, Please try again.' });
            setOpenSnackbar(true);
            resetState();
            return;
        }
        const data = {
            modelName: "batchreport",
            esignStatus,
            audit_log: {},
        };
        if (config?.config?.audit_logs) {
            const auditlogRemark = remarks;
            data.audit_log = {
                "user_id": user.userId,
                "user_name": user.userName,
                "performed_action": 'approved',
                "remarks": auditlogRemark?.length > 0 ? auditlogRemark : `batch report approved - ${approvedBy}`,
            };
        }
        if (isApprover) {
            if (esignStatus === "approved") {
                console.log("esign is approved for approver", user.userName);
                setApprovedBy({ userId: user.user_id, userName: user.userName, timeStamp: new Date() });
                setOpenModalApprove(false);
                resetState();
                downloadPdf({ approverUserId: user.user_id, approverUserName: user.userName, approvedAt: new Date() });
                return;
            } else if (esignStatus === "rejected") {
                console.log("approver rejected");
                setOpenModalApprove(false);
                resetState();
                return;
            }
            const res = await api('/esign-status/update-esign-status', data, 'patch', true);
            console.log("esign status update", res?.data);
        } else if (esignStatus === "rejected") {
            setAuthModalOpen(false);
            setOpenModalApprove(false);
        } else if (esignStatus === "approved") {
            console.log("esign is approved for creator to download");
            setOpenModalApprove(true);
            setExportedBy({ userId: user.user_id, userName: user.userName, exportedAt: new Date() });
        }
        resetState();
    };
    const handleAuthModalOpen = () => {
        console.log("OPen auth model");
        setApproveAPIName("batch-report-approve");
        setApproveAPImethod("PATCH");
        setApproveAPIEndPoint("/api/v1/batch-report");
        setAuthModalOpen(true);
        setEsignModalForCreator(true);
    };
    return (
        <Box>
            <Head>
                <title>Batch Report</title>
            </Head>
            <Grid2 item xs={12}>
                <Typography variant='h2' >Batch Report</Typography>
            </Grid2>
            <Box className='d-flex justify-content-start align-items-center my-3'>
                <FormControl className='w-25'>
                    <InputLabel id='product-label'>Product</InputLabel>
                    <Select
                        labelId='product-label'
                        value={selectedProduct}
                        label='Product'
                        onChange={handleProductChange}
                    >
                        {products.map((product) => (
                            <MenuItem key={product.id} value={product.id}>{product.product_name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl className='w-25 ms-2'>
                    <InputLabel id='batch-label'>Batch</InputLabel>
                    <Select
                        labelId='batch-label'
                        value={selectedBatch}
                        label='Batch'
                        onChange={handleBatchChange}
                    >
                        {

                            batches.map((batch) => (
                                <MenuItem key={batch.id} value={batch.id}>{batch.batch_no}</MenuItem>
                            ))}
                    </Select>
                </FormControl>
            </Box>

            <Box>
                <Button variant="contained" color="primary" onClick={handleGenerateReport} sx={{ marginTop: 2, marginBottom: 2 }}>
                    Generate Report
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleDownloadReport}
                    sx={{ marginTop: 2, marginBottom: 2, marginLeft: 2 }}
                    disabled={!report}
                >
                    Download Report
                </Button>
            </Box>
            <SnackbarAlert openSnackbar={openSnackbar} closeSnackbar={() => setOpenSnackbar(false)} alertData={alertData} />
            <AuthModal
                open={authModalOpen}
                handleClose={handleAuthModalClose}
                approveAPIName={approveAPIName}
                approveAPImethod={approveAPImethod}
                approveAPIEndPoint={approveAPIEndPoint}
                handleAuthResult={handleAuthResult}
                config={config}
                handleAuthModalOpen={handleAuthModalOpen}
                openModalApprove={openModalApprove}
            />
            <AccessibilitySettings />
            <ChatbotComponent />
        </Box>
    );
};
export async function getServerSideProps(context) {
    return validateToken(context, 'Batch Report')
}
export default ProtectedRoute(BatchReport);