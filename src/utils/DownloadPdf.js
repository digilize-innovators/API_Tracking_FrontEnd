import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { headerContentFix } from 'src/utils/headerContentPdfFix';
import { footerContent } from 'src/utils/footerContentPdf';

const downloadPdf = (tableData, tableHeaderData, tableBody, Data, userDataPdf) => {
    console.log(tableData, tableHeaderData, tableBody, Data, userDataPdf);
    console.log('Clicked on download button');

    const head = tableData.tableHeader;
    const doc = new jsPDF();

    const headerContent = () => {
        headerContentFix(doc, `${tableData.tableHeaderText}`);

        doc.setFontSize(10);
        tableHeaderData!==null?doc.text('Search : ' + (tableHeaderData?.searchVal || '__'), 15, 25):'';
        doc.text('Filters :\n', 15, 30);

        if (tableData.Filter) {
            console.log("Table status Filter ",tableData.statusFilter)
            doc.text(`${tableData.Filter[0]} : ` + (tableData.Filter[1] || '__'), 20, 35);
            const statusText = tableData.Filter[0] === 'department' 
                ? `Status : ${tableData?.statusFilter || '__'}` 
                :tableData.Filter[0] !== 'Order Type' ? `E-Sign : ${tableHeaderData?.esignStatus || '__'}`:'';
            doc.text(statusText, 20, 40);
        } else if(tableHeaderData?.esignStatus) {
            doc.text('E-Sign : ' + (tableHeaderData?.esignStatus || '__'), 20, 35);
        }

        doc.setFontSize(12);
        doc.text(`${tableData.tableBodyText}`, 15, 55);
    };

    const bodyContent = () => {
        let currentPage = 1;
        let dataIndex = 0;
        const totalPages = Math.ceil(Data.length / 25);
        headerContent();

        while (dataIndex < Data.length) {
            if (currentPage > 1) {
                doc.addPage();
                headerContent(); // Ensure header is added on new pages
            }

            const body = tableBody.slice(dataIndex, dataIndex + 25);

            autoTable(doc, {
                startY: currentPage === 1 ? 60 : 50, // Ensure consistent spacing
                styles: { halign: 'center' },
                headStyles: { fontSize: 8, fillColor: [80, 189, 160] },
                alternateRowStyles: { fillColor: [249, 250, 252] },
                tableLineColor: [80, 189, 160],
                tableLineWidth: 0.1,
                head: [head],
                body: body,
                columnWidth: 'wrap',
                margin: { bottom: 20 }, // Add margin to prevent footer overlap
                didDrawPage: function (data) {
                    footerContent(currentPage, totalPages, userDataPdf, doc);
                }
            });

            dataIndex += 25;
            currentPage++;
        }
    };

    bodyContent();

    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
    const formattedTime = currentDate.toLocaleTimeString('en-US', { hour12: false }).replace(/:/g, '-');
    const fileName = `${tableData.filename}_${formattedDate}_${formattedTime}.pdf`;
    doc.save(fileName);
};

export default downloadPdf;
