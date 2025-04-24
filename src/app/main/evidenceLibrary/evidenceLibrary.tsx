import { Typography, Paper, Container } from '@mui/material';

const EvidenceLibrary = () => {
  return (
    <Container className="mt-32">
      <Paper className="p-24 shadow-lg">
        <Typography variant="h4" className="mb-16 font-bold">
          Evidence Library
        </Typography>
        <Typography variant="body1" className="mb-16">
          Welcome to your Evidence Library. This is where you can store, organize, and access all your evidence documents.
        </Typography>
        <Typography variant="body1">
          This feature is currently under development. More functionality will be added soon.
        </Typography>
      </Paper>
    </Container>
  );
};

export default EvidenceLibrary;
