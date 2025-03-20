import React from 'react'
import { Modal, Box, Typography, Button, FormGroup, FormControlLabel, Checkbox, TextField, Grid2 } from '@mui/material'

const modalBoxStyle = {
  width: '70vw', // 70% of viewport width
  maxHeight: '70vh', // 70% of viewport height
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)', // Perfect centering

  // Styling
  backgroundColor: '#fff',
  borderRadius: 1,
  padding: 4,
  overflow: 'auto', // Handle content overflow

  // Responsive adjustments
  '@media (max-width: 600px)': {
    width: '90vw',
    height: '85vh',
    padding: 2
  }
}

const AddCountryModalComponent = ({
  openModal,
  handleCloseModal,
  editData,
  country,
  setCountry,
  errorCountry,
  codeStructure,
  urlMakerData,
  handleCheckboxChange,
  setCodeStructure,
  crmURL,
  handleCRMURLChange,
  handleSubmitForm,
  resetForm,
  resetEditForm,
  undoCodeStructureValue
}) => {

  return (
    <Modal
      open={openModal}
      onClose={handleCloseModal}
      data-testid='modal'
      role='dialog'
      aria-labelledby='modal-modal-title'
      aria-describedby='modal-modal-description'
    >
      <Box sx={modalBoxStyle}>
        <Typography variant='h4' className='my-3' sx={{ textAlign: 'center', fontWeight: 'bold' }}>
          {editData?.id ? 'Edit Country URL' : 'Add Country URL'}
        </Typography>

        <Grid2 container spacing={2}>
          <Grid2 size={5}>
            <Typography variant='body1'>Enter Country Name :</Typography>
          </Grid2>
          <Grid2 size={7} sx={{ mb: 3 }}>
            <TextField
              fullWidth
              id='country'
              onChange={e => setCountry(e.target.value)}
              value={country}
              required
              error={errorCountry.isError}
              helperText={errorCountry.isError ? errorCountry.message : ''}
            />
          </Grid2>
        </Grid2>

        <Grid2 container spacing={2}>
          <Grid2 size={5}>
            <Typography variant='body1'>Code Structure :</Typography>
          </Grid2>
          <Grid2 size={5}>
            <TextField
              fullWidth
              id='url'
              multiline
              rows={3}
              value={codeStructure.join('') || ''}
              required
              disabled
              style={{ backgroundColor: '#dde1e7', borderRadius: 5 }}
            />
          </Grid2>
          <Grid2 size={2}>
            <Button
              variant='outlined'
              fullWidth
              color='primary' 
              sx={{ marginTop: 2 }}
              onClick={undoCodeStructureValue}
            >
              Undo
            </Button>
          </Grid2>
        </Grid2>

        {urlMakerData.map((item, index) => (
          <Grid2 container spacing={2} key={index}>
            <Grid2 size={5}>
              <Typography variant='body1'>{item.label} :</Typography>
            </Grid2>
            <Grid2 size={7}>
              <FormGroup row>
                {item.options.map((option, idx) => (
                  <Grid2 size='auto' key={idx}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          value={option.value}
                          checked={option.checked}
                          onChange={e => handleCheckboxChange(e.target.value, item.label, option.label, option.checked)}
                        />
                      }
                      label={option.label}
                    />
                  </Grid2>
                ))}
              </FormGroup>
            </Grid2>
          </Grid2>
        ))}

        <Grid2 container spacing={2}>
          <Grid2 size={5}>
            <Typography variant='body1'>Separator :</Typography>
          </Grid2>
          <Grid2 size={7}>
            <Button onClick={() => setCodeStructure([...codeStructure, '/'])}>/</Button>
          </Grid2>
        </Grid2>

        <Grid2 container spacing={2}>
          <Grid2 size={5}>
            <Typography variant='body1'>Special Character :</Typography>
          </Grid2>
          <Grid2 size={7}>
            <Button onClick={() => setCodeStructure([...codeStructure, '<FNC>'])}>{'<FNC>'}</Button>
          </Grid2>
        </Grid2>

        {crmURL.value && (
          <Grid2 container spacing={2}>
            <Grid2 size={5}>
              <Typography variant='body1'>CRM URL :</Typography>
            </Grid2>
            <Grid2 size={7}>
              <FormGroup row>
                <FormControlLabel
                  control={<Checkbox value={'CRMURL'} checked={crmURL.checked} onChange={handleCRMURLChange} />}
                  label={'CRMURL'}
                />
              </FormGroup>
            </Grid2>
          </Grid2>
        )}

        <Grid2 container spacing={2} className='mt-2'>
          <Button variant='contained' sx={{ marginRight: 3.5 }} onClick={handleSubmitForm}>
            Save Changes
          </Button>
          <Button variant='outlined' color='primary' onClick={editData?.id ? resetEditForm : resetForm}>
            Reset
          </Button>
          <Button variant='outlined' color='error' sx={{ marginLeft: 3.5 }} onClick={handleCloseModal}>
            Close
          </Button>
        </Grid2>
      </Box>
    </Modal>
  )
}
export default AddCountryModalComponent
