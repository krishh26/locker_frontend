import { Box, maxWidth } from "@mui/system";
import React, { useEffect, useState } from "react";
import {
  LoadingButton,
  SecondaryButton,
  SecondaryButtonOutlined,
} from "../Buttons";
import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  Grid,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import axios from "axios";
import { roles } from "src/app/contanst";
import { useSelector } from "react-redux";
import { selectUser } from "app/store/userSlice";
import { useNavigate } from "react-router-dom";
import { createAssignmentAPI, selectAssignment, updateAssignmentAPI } from "app/store/assignment";
import { useDispatch } from "react-redux";
import { fetchCourseById, selectCourseManagement } from "app/store/courseManagement";
import styles from './style.module.css';

const assessmentMethod = [
  { value: 'WO', title: 'Workplace Observation' },
  { value: 'WP', title: 'Workplace Projects/Projects away from Work' },
  { value: 'PW', title: 'Portfolio of Work' },
  { value: 'VI', title: 'Viva' },
  { value: 'LB', title: 'Log Book/Assignments' },
  { value: 'PD', title: 'Professional Discussions' },
  { value: 'PT', title: 'Practical Test' },
  { value: 'TE', title: 'Tests/Examinations' },
  { value: 'RJ', title: 'Reflective Journal' },
  { value: 'OT', title: 'Other' },
  { value: 'RPL', title: 'Recognised Prior Learning' },
];

const UploadedEvidenceFile = (props) => {
  const { setFormData, formData, handleChange, handleCheckboxChange, edit = "Save" } = props;

  const { handleClose } = props.dialogFn || {};
  const dispatch: any = useDispatch();
  const { singleData, dataUpdatingLoadding } = useSelector(selectAssignment)

  const navigate = useNavigate();
  const singleCouse = useSelector(selectCourseManagement);

  useEffect(() => {
    if (singleData?.course_id)
      dispatch(fetchCourseById(singleData?.course_id));
  }, [dispatch, singleData?.course_id]);

  const handleSubmit = async () => {
    try {
      let response;
      let id = singleData.assignment_id;
      response = await dispatch(updateAssignmentAPI(id, formData));
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      handleClose();
    }

  };

  const handleCheckbox = (event, method) => {
    let updatedData = formData.assessment_method || [];
    if (updatedData.find(item => item === method)) {
      updatedData = updatedData.filter(item => item !== method);
    } else {
      updatedData = [...updatedData, method];
    }
    handleChange({ target: { name: 'assessment_method', value: updatedData } });
  };

  const handleCheckboxUnits = (event, method) => {
    console.log(method, formData)
    let updatedData = formData.units || []
    if (formData?.units?.find(item => item.id === method.id)) {
      updatedData = formData.units.filter(item => item.id !== method.id)
    } else {
      updatedData = [...(formData.units || []), method];
    }
    handleChange({ target: { name: 'units', value: updatedData } });
  };


  const user = useSelector(selectUser);

  const formatDate = (date) => {
    if (!date) return "";
    const dateStr = date instanceof Date ? date.toISOString() : String(date);
    const formattedDate = dateStr.substring(0, 16);
    return formattedDate;
  };

  const learnerMapHandler = (row) => {
    const copyObject = JSON.parse(JSON.stringify(formData));
    const unit = copyObject?.units?.find(item => item.subUnit.find(i => i.id === row.id))?.subUnit?.find(item => item.id === row.id);
    if (unit) {
      if (unit.learnerMap) {
        unit.learnerMap = !unit.learnerMap
      } else {
        unit.learnerMap = true
      }
    }
    setFormData(copyObject)

  }

  const trainerMapHandler = (row) => {
    const copyObject = JSON.parse(JSON.stringify(formData));
    const unit = copyObject?.units?.find(item => item.subUnit.find(i => i.id === row.id))?.subUnit?.find(item => item.id === row.id);
    if (unit) {
      if (unit.trainerMap) {
        unit.trainerMap = !unit.trainerMap
      } else {
        unit.trainerMap = true
      }
    }
    setFormData(copyObject)
  }

  const commentHandler = (e, id) => {
    const copyObject = JSON.parse(JSON.stringify(formData));
    const unit = copyObject?.units?.find(item => item.subUnit.find(i => i.id === id))?.subUnit?.find(item => item.id === id);
    if (unit) {
      unit.comment = e.target.value
    }
    setFormData(copyObject)
  }

  return (
    <div>
      <div>
        <Box className="m-12 flex flex-col justify-between gap-12">
          <div className="w-full">
            <Typography sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}>
              Title
            </Typography>
            <TextField
              name="title"
              size="small"
              placeholder={"Enter Title"}
              fullWidth
              value={formData?.title}
              onChange={handleChange}
              disabled={user.data.role !== "Learner" || edit === "view"}
              style={user.data.role !== "Learner" ? { backgroundColor: "whitesmoke" } : {}}
            />
          </div>

          <div className="w-full">
            <Typography sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}>
              Description
            </Typography>
            <TextField
              name="description"
              size="small"
              placeholder="Enter description"
              fullWidth
              multiline
              rows={5}
              value={formData?.description}
              onChange={handleChange}
              disabled={user.data.role !== "Learner" || edit === "view"}
              style={user.data.role !== "Learner" ? { backgroundColor: "whitesmoke" } : {}}
            />
          </div>

          <div className="w-full">
            <Typography sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}>
              Trainer Feedback
            </Typography>
            <TextField
              name="trainer_feedback"
              size="small"
              placeholder="Enter your feedback"
              fullWidth
              multiline
              rows={5}
              value={formData?.trainer_feedback}
              onChange={handleChange}
              disabled={user.data.role !== "Trainer" || edit === "view"}
              style={user.data.role !== "Trainer" ? { backgroundColor: "whitesmoke" } : {}}
            />
          </div>

          <div className="w-full">
            <Typography sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}>
              Learner Comments
            </Typography>
            <TextField
              name="learner_comments"
              size="small"
              placeholder="lorem ipsum is just dummy context...."
              fullWidth
              multiline
              rows={5}
              value={formData?.learner_comments}
              onChange={handleChange}
              disabled={user.data.role !== "Learner" || edit === "view"}
              style={user.data.role !== "Learner" ? { backgroundColor: "whitesmoke" } : {}}
            />
          </div>
          <div className="w-full">
            <Typography sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}>
              Points for Improvement
            </Typography>
            <TextField
              name="points_for_improvement"
              size="small"
              placeholder="lorem ipsum is just dummy context...."
              fullWidth
              multiline
              rows={5}
              value={formData?.points_for_improvement}
              onChange={handleChange}
              disabled={user.data.role !== "Trainer" || edit === "view"}
              style={user.data.role !== "Trainer" ? { backgroundColor: "whitesmoke" } : {}}
            />
          </div>

          <Grid className='w-full'>
            <Typography sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}>
              Select Unit
            </Typography>
            <FormGroup className="flex flex-row">
              {singleCouse?.unitData?.map((method) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData?.units?.find((unit) => unit.id === method.id)}
                      onChange={(e) => handleCheckboxUnits(e, method)}
                      name="units"
                      disabled={user.data.role !== "Learner" || edit === "view"}
                      style={user.data.role !== "Learner" ? { backgroundColor: "whitesmoke" } : {}}
                    />
                  }
                  label={method.title}
                />
              ))}
            </FormGroup>
            {formData?.units?.map((units) => {
              return (
                <Box key={units.id} className="flex flex-col gap-2">
                  <Typography variant="h5">
                    {units.title}
                  </Typography>
                  <TableContainer>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table" size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell style={{ width: 130 }} align="center">Learner's Map</TableCell>
                          <TableCell style={{ width: 400 }}>Subunit name</TableCell>
                          <TableCell style={{ width: 400 }}>Trainer Commnet</TableCell>
                          <TableCell align="left" style={{ width: 1 }}>Gap</TableCell>
                          <TableCell style={{ width: 130 }} align="center">Trainer's Map</TableCell>

                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {units?.subUnit?.map((row) => (
                          <TableRow
                            key={row.name}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                          >
                            <TableCell align="center"><Checkbox checked={row.learnerMap} onChange={() => learnerMapHandler(row)} /></TableCell>
                            <TableCell>{row?.subTitle}</TableCell>
                            <TableCell>
                              {user.data.role === "Learner" ? row?.comment :
                                (
                                  <TextField size="small" value={row?.comment} onChange={(e) => commentHandler(e, row.id)} />
                                )
                              }</TableCell>
                            <TableCell align="center">
                              <div className={styles.gap}>
                                <div style={{ backgroundColor: (row.learnerMap && row.trainerMap) ? "green" : (row.learnerMap || row.trainerMap) ? "orange" : "maroon", width: "100%", height: "100%" }}></div>
                              </div>
                            </TableCell>
                            <TableCell align="center"><Checkbox checked={row?.trainerMap} disabled={user.data.role === "Learner" || edit === "view"} onChange={() => trainerMapHandler(row)} /></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )
            })}

          </Grid>

          <div className="w-full">
            <Typography sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}>
              Assessment Method
            </Typography>

            <FormGroup className="flex flex-row">
              {assessmentMethod.map((method) => (
                <Tooltip key={method.value} title={method.title}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData?.assessment_method?.find(item => item === method.value)}
                        onChange={(e) => handleCheckbox(e, method.value)}
                        name="assessment_method"
                        disabled={user.data.role !== "Trainer" || edit === "view"}
                      />
                    }
                    label={method.value}
                  />
                </Tooltip>
              ))}

            </FormGroup>
          </div>
        </Box>

        <Box className="m-12 flex flex-col gap-12 sm:flex-row">
          <div className="w-full ">
            <Typography sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}>
              Session
            </Typography>
            <Grid className='w-full flex gap-10'>
              <Grid className='w-full '>
                <TextField
                  name="date"
                  value={formatDate(formData?.session?.date)}
                  size="small"
                  type='datetime-local'
                  placeholder='YYYY-MM-DDTHH:MM'
                  required
                  fullWidth
                  onChange={(e) => {
                    setFormData((prevState) => ({
                      ...prevState,
                      session: { ...prevState.session, date: e.target.value }
                    }));
                  }}
                  disabled={user.data.role !== "Trainer" || edit === "view"}
                  style={user.data.role !== "Trainer" ? { backgroundColor: "whitesmoke" } : {}}
                />

              </Grid>
              <Grid className='w-full flex gap-10'>
                <TextField
                  disabled={user.data.role !== "Trainer" || edit === "view"}
                  style={user.data.role !== "Trainer" ? { backgroundColor: "whitesmoke" } : {}}
                  placeholder='Hours'
                  name="hours"
                  size="small"
                  required
                  type="number"
                  fullWidth
                  value={(formData?.session?.hours)}
                  onChange={(e) => {
                    const value = Number(e.target.value);

                    if (value < 0 || value > 23) {
                      return
                    }

                    setFormData((prevState: any) => ({
                      ...prevState,
                      session: { ...prevState.session, hours: value }
                    }));
                  }}
                />
                <TextField
                  disabled={user.data.role !== "Trainer" || edit === "view"}
                  style={user.data.role !== "Trainer" ? { backgroundColor: "whitesmoke" } : {}}
                  placeholder='Minutes'
                  name="minutes"
                  required
                  size="small"
                  type="number"
                  fullWidth
                  value={(formData?.session?.minutes)}
                  onChange={(e) => {
                    const value = Number(e.target.value);

                    if (value < 0 || value > 59) {
                      return
                    }

                    setFormData((prevState: any) => ({
                      ...prevState,
                      session: { ...prevState.session, minutes: value }
                    }));
                  }}
                />
              </Grid>
            </Grid>
          </div>

          <div className="w-full ">
            <Typography sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}>
              Grade
            </Typography>
            <TextField
              name="grade"
              size="small"
              placeholder="Enter Grade"
              fullWidth
              value={formData?.grade}
              onChange={handleChange}
              disabled={user.data.role !== "Trainer" || edit === "view"}
              style={user.data.role !== "Trainer" ? { backgroundColor: "whitesmoke" } : {}}
            />
          </div>
        </Box>
        <Box className="m-12 flex flex-col justify-between gap-12">
          <div>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData?.declaration}
                  onChange={handleCheckboxChange}
                  name="declaration"
                  color="primary"
                />
              }
              label={
                <Typography sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}>
                  Please tick to confirm.
                  <br /> I declare that all material in this submission is my
                  own work except where there is clear acknowledgement and
                  appropriate reference to the work of others.
                </Typography>
              }
              disabled={edit === "view"}
            />
          </div>
        </Box>
      </div>
      <div className="flex justify-end mr-24 mb-20">
        {dataUpdatingLoadding ?
          <LoadingButton />
          :
          <>
            {edit === "view" ?
              <SecondaryButtonOutlined name="Cancel" className="mr-12" onClick={handleClose} />
              :
              <SecondaryButtonOutlined name="Cancel" className="mr-12" onClick={handleClose} />
            }
            {edit !== "view" &&
              <SecondaryButton name={"Update"} disable={!formData?.declaration || !formData?.title || !formData?.description} onClick={handleSubmit} />
            }
          </>
        }
      </div>
    </div>
  );
};

export default UploadedEvidenceFile;
