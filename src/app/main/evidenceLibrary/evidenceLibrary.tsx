import { FC, useState } from 'react'
import { Typography, Paper, Container, Button, Dialog } from '@mui/material'
import ReactUploadFile from 'src/app/component/react-upload-files'

const EvidenceLibrary: FC = () => {
  const [isOpenFileUpload, setIsOpenFileUpload] = useState<boolean>(false)

  const handleClose = () => {
    setIsOpenFileUpload(false)
  }
  
  return (
    <Container sx={{ mt: 8 }}>
      <div className='flex items-center justify-between mb-4'>
        <Typography variant='h4' component='h1' gutterBottom>
          Evidence Library
        </Typography>
        <Button
          variant='contained'
          className='rounded-md'
          color='primary'
          sx={{ mb: 2 }}
          onClick={() => setIsOpenFileUpload(true)}
          startIcon={<i className='material-icons'>upload</i>}
        >
          Add Evidence
        </Button>
      </div>

      <Dialog
        open={isOpenFileUpload}
        onClose={() => setIsOpenFileUpload(false)}
        sx={{
          '.MuiDialog-paper': {
            borderRadius: '4px',
            padding: '1rem',
          },
        }}
      >
        <ReactUploadFile handleClose={handleClose} />
      </Dialog>
    </Container>
  )
}

export default EvidenceLibrary
