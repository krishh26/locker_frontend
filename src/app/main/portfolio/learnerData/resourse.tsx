import { OpenInNew, Search } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import {
  FormControlLabel,
  IconButton,
  InputAdornment,
  Paper,
  Switch,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField,
  Typography
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { selectCourseManagement } from 'app/store/courseManagement';
import { selectstoreDataSlice } from 'app/store/reloadData';
import { fetchResourceByCourseAPI, resourceAccess, selectResourceManagement } from 'app/store/resourcesManagement';
import { useCurrentUser } from 'src/app/utils/userHelpers';

const ResourceData = () => {
  const dispatch: any = useDispatch();
  const navigate = useNavigate();

  const user = useCurrentUser();
  const { singleData } = useSelector(selectCourseManagement);
  const resource = useSelector(selectResourceManagement);
  const { user_id } = useSelector(selectstoreDataSlice);

  const [searchKeyword, setSearchKeyword] = useState('');
  const [jobType, setJobType] = useState<'On' | 'Off' | null>(null);
  const jobTypeRef = useRef(jobType);

  useEffect(() => {
    jobTypeRef.current = jobType;
  }, [jobType]);

  useEffect(() => {
    if (singleData?.course?.course_id && user?.user_id) {
      dispatch(fetchResourceByCourseAPI(singleData.course.course_id, user_id || user.user_id, searchKeyword, jobType));
    }
  }, [dispatch, searchKeyword, jobType]);

  const handleOpenInNewTab = async (url: string, id: number) => {
    if (user?.role === "Learner") {
      dispatch(resourceAccess(id, user?.user_id));
    }
    window.open(url, '_blank');
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      dispatch(fetchResourceByCourseAPI(singleData.course.course_id, user.user_id, searchKeyword, jobType));
    }
  };

  const handleJobTypeToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newJobType = e.target.checked ? 'On' : 'Off';
    setJobType(newJobType);
    dispatch(fetchResourceByCourseAPI(singleData.course.course_id, user.user_id, searchKeyword, newJobType));
  };

  const clearSearch = () => {
    setSearchKeyword('');
    dispatch(fetchResourceByCourseAPI(singleData.course.course_id, user.user_id, '', jobType));
  };

  return (
    <div className="container mx-auto p-4">
      <div className='flex justify-between items-center mx-20'>
        <div></div>
        <Typography variant="h3" className="text-center font-bold mb-8 text-blue-700">
          Course Resources
        </Typography>
        <button onClick={handleBack} className='mb-10 text-[#5b718f]'>
          <KeyboardBackspaceIcon /> Back
        </button>
      </div>

      {/* Filters Section */}
      <div className="flex items-center gap-10 mx-20 mb-6">
        <TextField
          label="Search by name or description"
          value={searchKeyword}
          onChange={handleSearchChange}
          onKeyDown={handleSearchKeyDown}
          size="small"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {searchKeyword ? (
                  <CloseIcon
                    onClick={clearSearch}
                    style={{ cursor: 'pointer', fontSize: 18 }}
                  />
                ) : (
                  <Search fontSize="small" />
                )}
              </InputAdornment>
            ),
          }}
        />
        <FormControlLabel
          control={
            <Switch
              checked={jobType === 'On'}
              onChange={handleJobTypeToggle}
              color="primary"
            />
          }
          label={`Job Type: ${jobType ?? 'On/Off'}`}
        />
      </div>

      {/* Resource Table */}
      <TableContainer component={Paper} style={{ borderRadius: 8, overflow: 'hidden' }}>
        <Table aria-label="resource table">
          <TableHead>
            <TableRow>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Description</strong></TableCell>
              <TableCell><strong>Hours</strong></TableCell>
              <TableCell><strong>Minutes</strong></TableCell>
              <TableCell><strong>Job Type</strong></TableCell>
              <TableCell><strong>Access</strong></TableCell>
              <TableCell><strong>Action</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {resource.singleData?.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.description}</TableCell>
                <TableCell>{row.hours}</TableCell>
                <TableCell>{row.minute}</TableCell>
                <TableCell>{row.job_type}</TableCell>
                <TableCell>{row.isAccessed ? "Opened" : "Not Opened"}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => !row.isAccessed && handleOpenInNewTab(row?.url?.url, row?.resource_id)}
                  >
                    <OpenInNew />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default ResourceData;
