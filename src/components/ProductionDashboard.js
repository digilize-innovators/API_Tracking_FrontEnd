

import React, { useMemo, useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Grid2,
} from '@mui/material';
import { useSettings } from 'src/@core/hooks/useSettings';
import moment from 'moment';

export default function ExcelLikeDashboard({ data }) {
  console.log("DATA ---->", data);

  const currentPrintingStatus = data?.printerLineStatus || data || [];
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

      item?.printer_line_name || 'Unknown Line'
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
      item => (item?.printer_line_name || 'Unknown Line') === selectedLine
    );

    console.log('Filtered items for line', selectedLine, ':', filtered);
    return filtered;
  }, [selectedLine, currentPrintingStatus]);

  console.log('Selected line:-', selectedLine);
  console.log('Line orders:-', lineOrders);
  console.log("User pro img :", lineOrders.profile_photo);
  

  // If no data is available, show a message
  if (!currentPrintingStatus || currentPrintingStatus.length === 0) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>No printing status data available.</Typography>
      </Box>
    );
  }
  console.log("Current User Profile Photo :->",lineOrders[0]?.profile_photo)

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          flexDirection: 'row-reverse',
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
                  mt: 2,
                  //mr: 2,
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
      <Grid2 container spacing={2} sx={{ width: '100%', ml: 0, mt: 0, backgroundColor: '#fff', boxShadow: '2px 4px 10px 1px rgba(201, 201, 201, 0.47)', borderRadius: 0, paddingBottom: 5, display:'flex',justifyContent: 'space-between'} }>
        <Grid2 item size={6}  >
          <CurrentOrder selectedLine={lineOrders} />
        </Grid2>

        <Grid2
          item
          xs={12}
          md={5}
          mt={2}
          style={{
            marginRight:'80px'
          }}
         
          //backgroundColor={'red'}
        >
          <Typography
            sx={{ alignSelf: 'flex-start' }}
            variant="subtitle2"
            color='text.secondary'
            fontWeight='bold'
            fontSize='1.3rem'
          >
            Responsible Staff
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' , mt:1}}>
            <img
              src={lineOrders[0]?.profile_photo}
              crossOrigin="anonymous"
              alt="Profile"
              style={{
                width: '110px',
                height: '110px',
                objectFit: 'cover',
                borderRadius: '50%',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            />
            <Typography
              variant="body1"
              fontWeight={600}
              sx={{ mt: 2, px: 2, py: 0.5, backgroundColor: '#f0f2f5', borderRadius: 0 }}
            >
              {lineOrders[0]?.user_name}
            </Typography>
          </Box>
          <Box sx={{ marginLeft: 0, textAlign: 'center'}}>
            <Typography variant="caption" sx={{ color: 'gray' , fontSize:'1rem'}}>
              Last Activity At
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: '#50BDA0', fontWeight: 580 }}
            >
              {moment(lineOrders[0]?.performed_at).calendar()}
            </Typography>
          </Box>
        </Grid2>

      </Grid2>
    </>
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
    <>
      <Grid2 container spacing={2} sx={{ mb: 2, pl: 4, py: 3 }}>
        <Grid2 item size={12}>
          <Typography
            variant="subtitle2"
            color='text.secondary'
            fontWeight='bold'
            fontSize='1.3rem'
          >
            Active Line
          </Typography>
        </Grid2>
        <Grid2 item size={4} >
          <Typography variant="caption" sx={{ color: subtitleColor , fontSize:'1rem'}}>
            Batch Number
          </Typography>
          <Typography variant="body2" sx={{ color: textColor, fontWeight: 500 }}>
            {currentItem?.batch_no || 'N/A'}
          </Typography>
        </Grid2>
        <Grid2 item size={4} mb={1}>
          <Typography variant="caption" sx={{ color: subtitleColor, fontSize:'1rem' }}>
            Product ID
          </Typography>
          <Typography variant="body2" sx={{ color: textColor, fontWeight: 500 }}>
            {currentItem?.product_id || 'N/A'}
          </Typography>
        </Grid2>
        <Grid2 item size={4}>
          <Typography variant="caption" sx={{ color: subtitleColor, fontSize:'1rem' }}>
            Product Name
          </Typography>
          <Typography variant="body2" sx={{ color: textColor, fontWeight: 500 }}>
            {currentItem?.product_name || 'N/A'}
          </Typography>
        </Grid2>
        <Grid2 item size={4} mb={1}>
          <Typography variant="caption" sx={{ color: subtitleColor, fontSize:'1rem' }}>
            Manufacture Date
          </Typography>
          <Typography variant="body2" sx={{ color: textColor, fontWeight: 500 }}>
            {currentItem?.manufacturing_date
              ? new Date(currentItem.manufacturing_date).toLocaleDateString()
              : 'N/A'}
          </Typography>
        </Grid2>
        <Grid2 item size={4}>
          <Typography variant="caption" sx={{ color: subtitleColor, fontSize:'1rem' }}>
            Expiry Date
          </Typography>
          <Typography variant="body2" sx={{ color: textColor, fontWeight: 500 }}>
            {currentItem?.expiry_date
              ? new Date(currentItem.expiry_date).toLocaleDateString()
              : 'N/A'}
          </Typography>
        </Grid2>
        <Grid2 item size={4} >
          <Typography variant="caption" sx={{ color: subtitleColor, fontSize:'1rem' }}>
            Total Quantity
          </Typography>
          <Typography variant="body2" sx={{ color: textColor, fontWeight: 500 }}>
            {currentItem?.qty || 'N/A'}
          </Typography>
        </Grid2>
      </Grid2>
    </>
  );
};