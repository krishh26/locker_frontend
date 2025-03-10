import { selectCourseManagement } from 'app/store/courseManagement';
import { fetchResourceByCourseAPI, resourceAccess, selectResourceManagement } from 'app/store/resourcesManagement';
import { selectUser } from 'app/store/userSlice';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography, IconButton } from '@mui/material';
import { OpenInNew } from '@mui/icons-material';
import axiosInstance from 'src/utils/axios';
import { roles } from 'src/app/contanst';

const ResourceData = () => {
  const dispatch: any = useDispatch();
  const user = useSelector(selectUser).data;
  const { singleData } = useSelector(selectCourseManagement);
  const resource = useSelector(selectResourceManagement);

  useEffect(() => {
    if (singleData?.course?.course_id && user?.user_id) {
      dispatch(fetchResourceByCourseAPI(singleData.course.course_id, user.user_id));
    }
  }, [dispatch, singleData, user]);

  const handleOpenInNewTab = async (url, id) => {
    if (user?.role === "Learner") {
      dispatch(resourceAccess(id, user?.user_id));
    }
    window.open(url, '_blank');
  };

  return (
    <div className="container mx-auto p-4">
      <Typography variant="h3" className="text-center font-bold mb-8 text-blue-700">
        Course Resources
      </Typography>

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
            {resource.singleData.map((row) => (
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
                    onClick={() => !row.isAccessed && handleOpenInNewTab(row?.url?.url, row?.resource_id)} // Assuming `row.url` contains the URL
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
