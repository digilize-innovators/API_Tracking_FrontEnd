import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { TextField, Button,Box} from '@mui/material';
import { IoMdSearch } from 'react-icons/io';

const CustomSearchBar = forwardRef(({ handleSearchClick }, ref) => {
    const searchInputRef = useRef(null);

    const handleClick = () => {
        if (searchInputRef.current) {
            handleSearchClick(searchInputRef.current.value);
        }
    };
    //    const handleKeyDown = (event) => {
    //     if (event.key === 'Enter') {
    //         handleClick();
    //     }
    // };

    useImperativeHandle(ref, () => ({
        resetSearch: () => {
            if (searchInputRef.current) {
                searchInputRef.current.value = '';
            }
        }
    }));

    return (
        <Box display="flex" alignItems="center">
            <Box className='mx-2'>
              <TextField
  inputRef={searchInputRef}
  type="search"
  size="small"
  style={{ height: '40px' }}
  id="outlined-basic"
  label="Search"
  variant="outlined"
  inputProps={{
    maxLength: 20, 
  }}
//    onKeyDown={handleKeyDown}
/>
            </Box>
            <Box className='mx-2'>
                <Button variant='contained' className='py-2' onClick={handleClick}>
                    <span>
                        <IoMdSearch size={24} style={{ fontSize: '1.5em' }} />
                    </span>
                </Button>
            </Box>
        </Box>
    );
});


export default CustomSearchBar;
