export const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '50%',
    bgcolor: 'background.paper',
    borderRadius: '10px',
    boxShadow: 24,
    p: 4,
};

export const getSerialNumber = (index, page, rowsPerPage) => {
    return index + 1 + page * rowsPerPage;
};