// // import React, { useMemo, useState } from 'react';
// // import {
// //   Box,
// //   Button,
// //   Typography,
// //   Paper,
// //   Avatar,
// //   Grid,
// // } from '@mui/material';
// // import { useSettings } from 'src/@core/hooks/useSettings'; // Assuming your useSettings hook is here
// // import { ConsoleLine } from 'mdi-material-ui';



// // export default function ExcelLikeDashboard({data}) {
// //   console.log('data',data)
// //   const { settings } = useSettings();
// //   const lineNumbers = currentPrintingStatus?[...new Set(currentPrintingStatus?.map(item => item..printer_line_name))]:[];
// //   const [selectedLine, setSelectedLine] = useState(lineNumbers[0]);

// //   const lineOrders = useMemo(() => {
// //     return currentPrintingStatus?.filter(
// //       item => item.PrinterLineConfiguration.printer_line_name === selectedLine
// //     );
// //   }, [selectedLine]);

// //   return (
// //     <Box sx={{ backgroundColor: settings.mode === 'dark' ? '#121212' : '#fff' }}>
      
// //       {/* Excel-style tab bar */}
// //       <Box
// //   sx={{
// //       display: 'flex',
// //       justifyContent: 'flex-start',
// //       flexDirection: 'row-reverse',
// //       backgroundColor: '#ffffff',
// //       overflowX: 'auto',
// //       whiteSpace: 'nowrap',
// //       px: 0,
// //       minHeight: 60,
// //   }}
// // >
// //   {lineNumbers.length > 0 ? (
// //     lineNumbers.map(line => {
// //       const isSelected = selectedLine === line;

// //       return (
// //         <Button
// //           key={line}
// //           onClick={() => setSelectedLine(line)}
// //           sx={{
// //             borderRadius: 0,
// //             px: 4,
// //             py: 1.5,
// //             fontWeight: 600,
// //             color: isSelected ? '#fff' : '#333',
// //             backgroundColor: isSelected ? '#5ABDA0' : '#ffffff',
// //             minWidth: 120,
// //             textTransform: 'none',
// //             boxShadow: isSelected ? '0 2px 4px rgba(0,0,0,0.1)' : 'none', // Optional: subtle elevation for selected
// //             '&:hover': {
// //               backgroundColor: isSelected ? '#5ABDA0' : '#f5f5f5',
// //             },
// //           }}
// //         >
// //           LINE {line}
// //         </Button>
// //       );
// //     })
// //   ) : (
// //     <Box sx={{ height: 60, width: '100%' }} />
// //   )}
// // </Box>

// //       {/* Main content */}
// //       <Box sx={{ p: 4 }}>

// //           <Grid container spacing={4}>
// //             {/* Order Card */}
// //             <Grid item xs={12} md={6}>
// //               <CurrentOrder  selectedLine={lineOrders}/>
// //             </Grid>

// //             {/* Staff Card */}
// //             {/* <Grid item xs={12} md={6}>
// //               <Box>
// //                 <Typography variant="subtitle1" fontWeight={600} mb={1}>
// //                   Responsible Staff
// //                 </Typography>
// //                 <Box sx={{ display: 'flex', alignItems: 'center' }}>
// //                   <Avatar sx={{ width: 60, height: 60, mr: 2 }} />
// //                   <Box>
// //                     <Typography variant="body1">{selectedLine?.staff.name}</Typography>
// //                     <Typography variant="body2" color="text.secondary">{selectedLine?.staff.position}</Typography>
// //                     <Typography variant="body2" color="text.secondary">{selectedLine?.staff.contactNumber}</Typography>
// //                   </Box>
// //                 </Box>
// //               </Box>
// //             </Grid> */}
// //           </Grid>
// //       </Box>
// //     </Box>
// //   );
// // }

// // const CurrentOrder = ({ selectedLine }) => {
// //   console.log("selectedLine",selectedLine)
// //   const panelBackground = '#f5f5f5';
// // const textColor = '#333333';
// // const subtitleColor = '#666666';
// //   return (
// //     <Box>
      
      
// //       <Grid container spacing={2} sx={{ mb: 2 }}>
// //         <Grid item xs={6}>
// //           <Typography variant="caption" sx={{ color: subtitleColor }}>Batch Number</Typography>
// //           <Typography variant="body2" sx={{ color: textColor, fontWeight: 500 }}>300</Typography>
// //         </Grid>
// //         <Grid item xs={6}>
// //           <Typography variant="caption" sx={{ color: subtitleColor }}>Product Id </Typography>
// //           <Typography variant="body2" sx={{ color: textColor, fontWeight: 500 }}>544</Typography>
// //         </Grid>
// //         <Grid item xs={6}>
// //           <Typography variant="caption" sx={{ color: subtitleColor }}>Product Name </Typography>
// //           <Typography variant="body2" sx={{ color: textColor, fontWeight: 500 }}>544</Typography>
// //         </Grid>
// //         <Grid item xs={6}>
// //           <Typography variant="caption" sx={{ color: subtitleColor }}>Manufacture Date</Typography>
// //           <Typography variant="body2" sx={{ color: textColor, fontWeight: 500 }}>544</Typography>
// //         </Grid>
// //         <Grid item xs={6}>
// //           <Typography variant="caption" sx={{ color: subtitleColor }}>Expiry Date</Typography>
// //           <Typography variant="body2" sx={{ color: textColor, fontWeight: 500 }}>544</Typography>
// //         </Grid>
       
// //         <Grid item xs={6}>
// //           <Typography variant="caption" sx={{ color: subtitleColor }}>Total Quantity</Typography>
// //           <Typography variant="body2" sx={{ color: textColor, fontWeight: 500 }}>544</Typography>
// //         </Grid>
// //       </Grid>
// //     </Box>
// //   );
// // };



// import React, { useMemo, useState } from 'react';
// import {
//   Box,
//   Button,
//   Typography,
//   Paper,
//   Avatar,
//   Grid,
// } from '@mui/material';
// import { useSettings } from 'src/@core/hooks/useSettings';
// import { ConsoleLine } from 'mdi-material-ui';

// export default function ExcelLikeDashboard({ data }) {
//   const  currentPrintingStatus  = data;
//   console.log('data', data);
//   const { settings } = useSettings();
  
//   // Fixed property path - using line_name instead of printer_line_name
//   const lineNumbers = currentPrintingStatus ? 
//     [...new Set(currentPrintingStatus.map(item => item.PrinterLineConfiguration.printer_line_name))] : [];
  
//   const [selectedLine, setSelectedLine] = useState(lineNumbers[0]);

//   const lineOrders = useMemo(() => {
//     return currentPrintingStatus?.filter(
//       item => item.PrinterLineConfiguration.printer_line_name === selectedLine
//     );
//   }, [selectedLine, currentPrintingStatus]);

//   return (
//     <Box sx={{ backgroundColor: settings.mode === 'dark' ? '#121212' : '#fff' }}>
      
//       {/* Excel-style tab bar */}
//       <Box
//         sx={{
//           display: 'flex',
//           justifyContent: 'flex-start',
//           flexDirection: 'row-reverse',
//           backgroundColor: '#ffffff',
//           overflowX: 'auto',
//           whiteSpace: 'nowrap',
//           px: 0,
//           minHeight: 60,
//         }}
//       >
//         {lineNumbers.length > 0 ? (
//           lineNumbers.map(line => {
//             const isSelected = selectedLine === line;

//             return (
//               <Button
//                 key={line}
//                 onClick={() => setSelectedLine(line)}
//                 sx={{
//                   borderRadius: 0,
//                   px: 4,
//                   py: 1.5,
//                   fontWeight: 600,
//                   color: isSelected ? '#fff' : '#333',
//                   backgroundColor: isSelected ? '#5ABDA0' : '#ffffff',
//                   minWidth: 120,
//                   textTransform: 'none',
//                   boxShadow: isSelected ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
//                   '&:hover': {
//                     backgroundColor: isSelected ? '#5ABDA0' : '#f5f5f5',
//                   },
//                 }}
//               >
//               {line}
//               </Button>
//             );
//           })
//         ) : (
//           <Box sx={{ height: 60, width: '100%' }} />
//         )}
//       </Box>

//       {/* Main content */}
//       <Box sx={{ p: 4 }}>
//         <Grid container spacing={4}>
//           {/* Order Card */}
//           <Grid item xs={12} md={6}>
//             <CurrentOrder selectedLine={lineOrders} />
//           </Grid>
//         </Grid>
//       </Box>
//     </Box>
//   );
// }

// const CurrentOrder = ({ selectedLine }) => {
//   console.log("selectedLine", selectedLine);
//   const panelBackground = '#f5f5f5';
//   const textColor = '#333333'; // Dark color for values
//   const subtitleColor = '#666666';
  
//   // Get the first item from the selected line (if available)
//   const currentItem = selectedLine && selectedLine.length > 0 ? selectedLine[0] : null;
  
//   return (
//     <Box>
//       <Grid container spacing={2} sx={{ mb: 2 }}>
//         <Grid item xs={6}>
//           <Typography variant="caption" sx={{ color: subtitleColor }}>Batch Number</Typography>
//           <Typography variant="body2" sx={{ color: textColor, fontWeight: 500 }}>
//             {currentItem?.batch?.batch_no || 'N/A'}
//           </Typography>
//         </Grid>
//         <Grid item xs={6}>
//           <Typography variant="caption" sx={{ color: subtitleColor }}>Product Id</Typography>
//           <Typography variant="body2" sx={{ color: textColor, fontWeight: 500 }}>
//             {currentItem?.product?.product_id || 'N/A'}
//           </Typography>
//         </Grid>
//         <Grid item xs={6}>
//           <Typography variant="caption" sx={{ color: subtitleColor }}>Product Name</Typography>
//           <Typography variant="body2" sx={{ color: textColor, fontWeight: 500 }}>
//             {currentItem?.product?.product_name || 'N/A'}
//           </Typography>
//         </Grid>
//         <Grid item xs={6}>
//           <Typography variant="caption" sx={{ color: subtitleColor }}>Manufacture Date</Typography>
//           <Typography variant="body2" sx={{ color: textColor, fontWeight: 500 }}>
//             {currentItem?.batch?.manufacturing_date 
//               ? new Date(currentItem.batch.manufacturing_date).toLocaleDateString() 
//               : 'N/A'}
//           </Typography>
//         </Grid>
//         <Grid item xs={6}>
//           <Typography variant="caption" sx={{ color: subtitleColor }}>Expiry Date</Typography>
//           <Typography variant="body2" sx={{ color: textColor, fontWeight: 500 }}>
//             {currentItem?.batch?.expiry_date 
//               ? new Date(currentItem.batch.expiry_date).toLocaleDateString() 
//               : 'N/A'}
//           </Typography>
//         </Grid>
//         <Grid item xs={6}>
//           <Typography variant="caption" sx={{ color: subtitleColor }}>Total Quantity</Typography>
//           <Typography variant="body2" sx={{ color: textColor, fontWeight: 500 }}>
//             {currentItem?.batch?.qty || 'N/A'}
//           </Typography>
//         </Grid>
//       </Grid>
//     </Box>
//   );
// };
import React, { useMemo, useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Grid,
} from '@mui/material';
import { useSettings } from 'src/@core/hooks/useSettings';

export default function ExcelLikeDashboard({ data }) {
  const currentPrintingStatus = data?.currentPrintingStatus || data || [];
  console.log('currentPrintingStatus:', currentPrintingStatus);
  
  const { settings } = useSettings();
  console.log(settings.themeColor)
  
  // Safely extract line names with more detailed logging
  const lineNumbers = useMemo(() => {
    if (!currentPrintingStatus || !Array.isArray(currentPrintingStatus) || currentPrintingStatus.length === 0) {
      console.log('No printing status data available');
      return [];
    }
    
    console.log('First item in currentPrintingStatus:', currentPrintingStatus[0]);
    
    // Extract line names, with fallback for missing properties
    const lines = currentPrintingStatus.map(item => 
      item?.PrinterLineConfiguration?.printer_line_name || 'Unknown Line'
    );
    console.log('Extracted lines:', lines);
    
    // Remove duplicates
    const uniqueLines = [...new Set(lines)];
    console.log('Unique lines:', uniqueLines);
    
    return uniqueLines;
  }, [currentPrintingStatus]);
  
  // Initialize with first line if available
  const [selectedLine, setSelectedLine] = useState(null);
  
  // Set the default selected line when component mounts or when lineNumbers changes
  useEffect(() => {
    if (lineNumbers.length > 0 && !selectedLine) {
      console.log('Setting default selected line:', lineNumbers[0]);
      setSelectedLine(lineNumbers[0]);
    }
  }, [lineNumbers, selectedLine]);

  // Filter items for the selected line
  const lineOrders = useMemo(() => {
    if (!selectedLine || !currentPrintingStatus) {
      console.log('No selected line or printing status');
      return [];
    }
    
    const filtered = currentPrintingStatus.filter(
      item => (item?.PrinterLineConfiguration?.printer_line_name || 'Unknown Line') === selectedLine
    );
    
    console.log('Filtered items for line', selectedLine, ':', filtered);
    return filtered;
  }, [selectedLine, currentPrintingStatus]);

  console.log('Selected line:', selectedLine);
  console.log('Line orders:', lineOrders);
  
  // If no data is available, show a message
  if (!currentPrintingStatus || currentPrintingStatus.length === 0) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>No printing status data available.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: settings.mode === 'dark' ? '#121212' : '#fff' }}>
      
      {/* Excel-style tab bar */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          flexDirection: 'row-reverse',
          backgroundColor: '#ffffff',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          px: 0,
          minHeight: 60,
        }}
      >
        {lineNumbers.length > 0 ? (
          lineNumbers.map(line => {
            const isSelected = selectedLine === line;

            return (
              <Button
                key={line}
                onClick={() => setSelectedLine(line)}
                sx={{
                  borderRadius: 0,
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  color: isSelected ? '#fff' : '#333',
                  backgroundColor: isSelected ? settings.themeColor : '#ffffff',
                  minWidth: 120,
                  textTransform: 'none',
                  boxShadow: isSelected ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                  '&:hover': {
                    backgroundColor: isSelected ? settings.themeColor : '#f5f5f5',
                  },
                }}
              >
                {line}
              </Button>
            );
          })
        ) : (
          <Box sx={{ height: 60, width: '100%' }}>
            <Typography sx={{ p: 2 }}>No lines available</Typography>
          </Box>
        )}
      </Box>

      {/* Main content */}
      <Box sx={{ p: 4 }}>
        <Grid container spacing={4}>
          {/* Order Card */}
          <Grid item xs={12} md={6}>
            <CurrentOrder selectedLine={lineOrders} />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

const CurrentOrder = ({ selectedLine }) => {
  console.log("CurrentOrder received selectedLine:", selectedLine);
  const textColor = '#333333'; // Dark color for values
  const subtitleColor = '#666666';
  
  // Get the first item from the selected line (if available)
  const currentItem = selectedLine && selectedLine.length > 0 ? selectedLine[0] : null;
  
  // If no item is selected, show a message
  if (!currentItem) {
    return (
      <Box>
        <Typography>No item selected or no data available for this line.</Typography>
      </Box>
    );
  }
  
  // Debug the current item to see what's available
  console.log("Current item data:", currentItem);
  
  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={6}>
          <Typography variant="caption" sx={{ color: subtitleColor }}>Batch Number</Typography>
          <Typography variant="body2" sx={{ color: textColor, fontWeight: 500 }}>
            {currentItem?.batch?.batch_no || 'N/A'}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" sx={{ color: subtitleColor }}>Product Id</Typography>
          <Typography variant="body2" sx={{ color: textColor, fontWeight: 500 }}>
            {currentItem?.product?.product_id || 'N/A'}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" sx={{ color: subtitleColor }}>Product Name</Typography>
          <Typography variant="body2" sx={{ color: textColor, fontWeight: 500 }}>
            {currentItem?.product?.product_name || 'N/A'}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" sx={{ color: subtitleColor }}>Manufacture Date</Typography>
          <Typography variant="body2" sx={{ color: textColor, fontWeight: 500 }}>
            {currentItem?.batch?.manufacturing_date 
              ? new Date(currentItem.batch.manufacturing_date).toLocaleDateString() 
              : 'N/A'}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" sx={{ color: subtitleColor }}>Expiry Date</Typography>
          <Typography variant="body2" sx={{ color: textColor, fontWeight: 500 }}>
            {currentItem?.batch?.expiry_date 
              ? new Date(currentItem.batch.expiry_date).toLocaleDateString() 
              : 'N/A'}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" sx={{ color: subtitleColor }}>Total Quantity</Typography>
          <Typography variant="body2" sx={{ color: textColor, fontWeight: 500 }}>
            {currentItem?.batch?.qty || 'N/A'}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};