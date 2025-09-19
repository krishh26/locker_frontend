import React from 'react';
import { TextField, Typography, Autocomplete, Box } from '@mui/material';
import Style from './style.module.css';

interface QualificationFormProps {
  courseData: any;
  courseHandler: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleAutocompleteChange: (field: string, value: string | null) => void;
  validationErrors: any;
  edit: string;
  courseType: string[];
  courseLevels: string[];
}

const QualificationForm: React.FC<QualificationFormProps> = ({
  courseData,
  courseHandler,
  handleAutocompleteChange,
  validationErrors,
  edit,
  courseType,
  courseLevels
}) => {
  return (
    <>
      <Box className="m-12 flex flex-col justify-between gap-12 sm:flex-row">
        <div className="w-1/3">
          <Typography
            sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
            className={Style.name}
          >
            Course Name<sup>*</sup>
          </Typography>
          <TextField
            name="course_name"
            size="small"
            placeholder="Enter Course Name"
            required
            fullWidth
            value={courseData.course_name}
            onChange={courseHandler}
            disabled={edit === "view"}
            className={Style.input_feald}
            error={validationErrors.course_name}
            helperText={validationErrors.course_name ? "Course name is required" : ""}
          />
        </div>
        <div className="w-1/3">
          <Typography
            sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
            className={Style.name}
          >
            Course Code<sup>*</sup>
          </Typography>
          <TextField
            name="course_code"
            size="small"
            placeholder="Enter Course Code"
            required
            fullWidth
            value={courseData.course_code}
            onChange={courseHandler}
            disabled={edit === "view"}
            className={Style.input_feald}
            error={validationErrors.course_code}
            helperText={validationErrors.course_code ? "Course code is required" : ""}
          />
        </div>
        <div className="w-1/3">
          {/* <Typography
            sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
            className={Style.name}
          >
            LAD Code
          </Typography>
          <TextField
            name="lad_code"
            size="small"
            placeholder="Enter LAD Code"
            fullWidth
            value={courseData.lad_code || ""}
            onChange={courseHandler}
            disabled={edit === "view"}
            className={Style.last2_input_feald}
          /> */}
        </div>
      </Box>

      {/* Course Guidance */}
      <Box className="m-12">
        <Typography
          sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
          className={Style.name}
        >
          Course Guidance<sup>*</sup>
        </Typography>
        <TextField
          name="brand_guidelines"
          multiline
          rows={4}
          placeholder="Enter Course Guidance"
          required
          fullWidth
          value={courseData.brand_guidelines}
          onChange={courseHandler}
          disabled={edit === "view"}
          className={Style.input_feald}
          error={validationErrors.brand_guidelines}
          helperText={validationErrors.brand_guidelines ? "Course guidance is required" : ""}
        />
      </Box>

      {/* Course Type, Level, Expiration Date */}
      <Box className="m-12 flex flex-col justify-between gap-12 sm:flex-row">
        <div className="w-1/3">
          <Typography
            sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
            className={Style.name}
          >
            Course Type<sup>*</sup>
          </Typography>
          <Autocomplete
            size="small"
            value={courseData?.course_type || null}
            onChange={(_, newValue) => handleAutocompleteChange('course_type', newValue)}
            disabled={edit === "view"}
            options={courseType}
            className={Style.last2_input_feald}
            isOptionEqualToValue={(option, value) => option === value}
            renderInput={(params) => <TextField {...params} placeholder="Course Type" error={validationErrors.course_type} helperText={validationErrors.course_type ? "Course type is required" : ""} />}
          />
        </div>
        <div className="w-1/3">
          <Typography
            sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
            className={Style.name}
          >
            Course Level<sup>*</sup>
          </Typography>
          <Autocomplete
            size="small"
            value={courseData?.level || null}
            onChange={(_, newValue) => handleAutocompleteChange('level', newValue)}
            disabled={edit === "view"}
            options={courseLevels}
            className={Style.last2_input_feald}
            isOptionEqualToValue={(option, value) => option === value}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Select a Course Level..."
                error={validationErrors.level}
                helperText={validationErrors.level ? "Course level is required" : ""}
              />
            )}
          />
        </div>
        <div className="w-1/3">
          <Typography
            sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
            className={Style.name}
          >
            Expiration Date
          </Typography>
          <TextField
            name="operational_start_date"
            size="small"
            type="date"
            fullWidth
            value={courseData.operational_start_date}
            onChange={courseHandler}
            disabled={edit === "view"}
            className={Style.last2_input_feald}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </div>
      </Box>

      {/* Sector */}
      <Box className="m-12 flex flex-col justify-between gap-12 sm:flex-row">
        <div className="w-1/3">
          <Typography
            sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
            className={Style.name}
          >
            Sector
          </Typography>
          <TextField
            name="sector"
            size="small"
            placeholder="Enter Sector"
            fullWidth
            value={courseData.sector}
            onChange={courseHandler}
            disabled={edit === "view"}
            className={Style.input_feald}
          />
        </div>
        <div className="w-1/3">
          <Typography
            sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
            className={Style.name}
          >
            Total Credits
          </Typography>
          <TextField
            name="total_credits"
            size="small"
            type="number"
            placeholder="Enter Total Credits"
            fullWidth
            value={courseData.total_credits}
            onChange={courseHandler}
            disabled={edit === "view"}
            className={Style.input_feald}
          />
        </div>
        <div className="w-1/3">
          <Typography
            sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
            className={Style.name}
          >
            Guided Learning Hours
          </Typography>
          <TextField
            name="guided_learning_hours"
            size="small"
            type="number"
            placeholder="Enter Guided Learning Hours"
            fullWidth
            value={courseData.guided_learning_hours}
            onChange={courseHandler}
            disabled={edit === "view"}
            className={Style.input_feald}
          />
        </div>
      </Box>

      {/* Total Credits, Guided Learning Hours, Recommended Minimum Age */}
      <Box className="m-12 flex flex-col justify-between gap-12 sm:flex-row">
        <div className="w-1/3">
          <Typography
            sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
            className={Style.name}
          >
            Recommended Minimum Age
          </Typography>
          <TextField
            name="recommended_minimum_age"
            size="small"
            type="number"
            placeholder="Enter Recommended Minimum Age"
            fullWidth
            value={courseData.recommended_minimum_age}
            onChange={courseHandler}
            disabled={edit === "view"}
            className={Style.input_feald}
          />
        </div>
        <div className="w-1/3">
          <Typography
            sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
            className={Style.name}
          >
            Overall Grading Type
          </Typography>
          <TextField
            name="overall_grading_type"
            size="small"
            placeholder="Enter Overall Grading Type"
            fullWidth
            value={courseData.overall_grading_type}
            onChange={courseHandler}
            disabled={edit === "view"}
            className={Style.input_feald}
          />
        </div>
        <div className="w-1/3">
          <Typography
            sx={{ fontSize: "0.9vw", marginBottom: "0.5rem" }}
            className={Style.name}
          >
            Select Awarding Body
          </Typography>
          <Autocomplete
            size="small"
            value={courseData?.awarding_body || null}
            onChange={(_, newValue) => handleAutocompleteChange('awarding_body', newValue)}
            disabled={edit === "view"}
            options={["No Awarding Body",'other']}
            className={Style.last2_input_feald}
            isOptionEqualToValue={(option, value) => option === value}
            renderInput={(params) => <TextField {...params} placeholder="Select Awarding Body" />}
          />
        </div>
      </Box>
     
    </>
  );
};

export default QualificationForm;
