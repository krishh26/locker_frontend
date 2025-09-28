import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
  Button,
  Card,
  CardContent,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { selectUser } from 'app/store/userSlice';

const SafeguardingContact = () => {
  const dispatch = useDispatch();
  const user = JSON.parse(sessionStorage.getItem('learnerToken'))?.user || useSelector(selectUser)?.data;

  const [formData, setFormData] = useState({
    telNumber: '02081912616',
    mobileNumber: '07830295875',
    emailAddress: 'safeguarding@p4t.co.uk',
    additionalInfo: 'Designated Safeguarding Officer is Vijy Khimani'
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Here you would typically make an API call to save the data
      console.log('Saving safeguarding contact data:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message or handle success
      alert('Safeguarding contact information saved successfully!');
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Error saving data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: '#333' }}>
        Safeguarding Contact
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        <Grid container spacing={4}>
          {/* Left Column - Contact Details */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: '600', color: '#555' }}>
              Contact Details
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                label="Safeguarding Officer Tel Number"
                value={formData.telNumber}
                onChange={handleInputChange('telNumber')}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#6D81A3',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#6D81A3',
                    },
                  },
                }}
              />
              
              <TextField
                fullWidth
                label="Safeguarding Officer Mobile Number"
                value={formData.mobileNumber}
                onChange={handleInputChange('mobileNumber')}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#6D81A3',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#6D81A3',
                    },
                  },
                }}
              />
              
              <TextField
                fullWidth
                label="Safeguarding Officer Email Address"
                value={formData.emailAddress}
                onChange={handleInputChange('emailAddress')}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#6D81A3',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#6D81A3',
                    },
                  },
                }}
              />
            </Box>
          </Grid>

          {/* Right Column - Additional Information */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: '600', color: '#555' }}>
              Additional Information
            </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={8}
              label="Safeguarding Additional Information"
              value={formData.additionalInfo}
              onChange={handleInputChange('additionalInfo')}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#6D81A3',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#6D81A3',
                  },
                },
              }}
            />
          </Grid>
        </Grid>

        {/* Save Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={isLoading}
            sx={{
              backgroundColor: '#4CAF50',
              color: 'white',
              px: 4,
              py: 1.5,
              borderRadius: 1,
              fontWeight: '600',
              '&:hover': {
                backgroundColor: '#45a049',
              },
              '&:disabled': {
                backgroundColor: '#cccccc',
                color: '#666666',
              },
            }}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default SafeguardingContact;
