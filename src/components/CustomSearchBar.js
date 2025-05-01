import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import Box from '@mui/material/Box';
import { TextField, Button } from '@mui/material';
import { IoMdSearch } from 'react-icons/io';
import PropTypes from 'prop-types';

const CustomSearchBar = forwardRef(({ handleSearchClick }, ref) => {
    const searchInputRef = useRef(null);

    const handleClick = () => {
        if (searchInputRef.current) {
            handleSearchClick(searchInputRef.current.value);
        }
    };

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
                    type='search'
                    size='small'
                    style={{ height: '40px' }}
                    id='outlined-basic'
                    label='Search'
                    variant='outlined'
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

CustomSearchBar.propTypes = {
    handleSearchClick: PropTypes.func.isRequired
};

export default CustomSearchBar;
