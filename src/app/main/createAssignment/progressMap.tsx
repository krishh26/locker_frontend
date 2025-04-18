import React, { useState, useEffect } from 'react';
import { Autocomplete, TextField, Container, Card, CardContent, Typography, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { getLearnerDetails, selectLearnerManagement } from 'app/store/learnerManagement';
import { useSelector } from 'react-redux';
import styles from './style.module.css';
import { selectstoreDataSlice } from 'app/store/reloadData';
import { useDispatch } from 'react-redux';

const ProgressMap = () => {
  const { learner } = useSelector(selectLearnerManagement);

  const [selectedCourse, setSelectedCourse] = useState(
    (learner?.course && learner.course?.length > 0) ? learner.course[0] : {}
  );

  const [selectedUnit, setSelectedUnit] = useState(
    (learner?.course && learner.course?.length > 0 && learner.course[0]?.units && learner.course[0].units?.length > 0)
      ? learner.course[0].units[0]
      : {}
  );

  const learnerData = useSelector(selectstoreDataSlice);

  const dispatch: any = useDispatch();

  useEffect(() => {
    if (learner?.course && learner.course?.length > 0) {
      setSelectedCourse(learner.course[0]);
      if (learner.course[0]?.units && learner.course[0].units?.length > 0) {
        setSelectedUnit(learner.course[0].units[0]);
      } else {
        setSelectedUnit({}); // Fallback if no units are available
      }
    } else {
      setSelectedCourse({});
      setSelectedUnit({}); // Fallback if no course is available
    }
  }, [learner?.course]);

  useEffect(() => {
    if (learnerData?.learner_id) {
      dispatch(getLearnerDetails(learnerData.learner_id));
    }
  }, [learnerData?.learner_id]);

  useEffect(() => {
    if (selectedCourse?.units && selectedCourse.units?.length > 0) {
      setSelectedUnit(selectedCourse.units[0]);
    } else {
      setSelectedUnit({}); // Fallback if no units are available
    }
  }, [selectedCourse]);


  return (
    <div style={{ padding: 16, width: '100%' }}>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h5" component="div" gutterBottom>
            Learner Details
          </Typography>
          <div className='grid grid-cols-2 gap-5'>
            <Typography variant="body1"><strong>Name:</strong> {learner?.first_name} {learner?.last_name}</Typography>
            <Typography variant="body1"><strong>Username:</strong> {learner?.user_name}</Typography>
          </div>
          <div className='grid grid-cols-2 gap-5'>
            <Typography variant="body1"><strong>Email:</strong> {learner?.email}</Typography>
            <Typography variant="body1"><strong>Mobile:</strong> {learner?.mobile}</Typography>
          </div>
        </CardContent>
      </Card>

      {/* Grid for course and unit selection */}
      <Grid container spacing={2} sx={{ marginTop: 4, alignItems: 'center' }}>
        <Grid item xs={12} md={6}>
          <Autocomplete
            // value={selectedCourse || ""}
            size='small'
            onChange={(event, newValue) => {
              setSelectedCourse(newValue);
            }}
            options={learner?.course}
            getOptionLabel={(option: any) => option?.course?.course_name}
            renderInput={(params) => <TextField {...params} label="Select Course" variant="outlined" />}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          {selectedCourse && (
            <Autocomplete
              // value={selectedUnit || ""}
              size='small'
              onChange={(event, newValue) => {
                setSelectedUnit(newValue);
              }}
              options={selectedCourse?.course?.units}
              getOptionLabel={(option: any) => option?.title}
              renderInput={(params) => <TextField {...params} label="Select Unit" variant="outlined" />}
            />
          )}
        </Grid>
      </Grid>

      {/* Display Selected Unit Details in a Table */}
      {selectedUnit && (
        <TableContainer component={Paper} sx={{ marginTop: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>SubUnit Title</TableCell>
                <TableCell>Learner Map</TableCell>
                <TableCell>Trainer Map</TableCell>
                <TableCell>Gap</TableCell>
                <TableCell>Comment</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedUnit?.subUnit?.map((subUnit) => (
                <TableRow key={subUnit.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>{subUnit.subTitle}</TableCell>
                  <TableCell>{subUnit.learnerMap ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{subUnit.trainerMap ? 'Yes' : 'No'}</TableCell>
                  <TableCell align="center">
                    <div className={styles.gap}>
                      <div style={{ backgroundColor: (subUnit.learnerMap && subUnit.trainerMap) ? "green" : (subUnit.learnerMap || subUnit.trainerMap) ? "orange" : "maroon", width: "100%", height: "100%" }}></div>
                    </div>
                  </TableCell>
                  <TableCell>{subUnit.comment}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};

export default ProgressMap;
