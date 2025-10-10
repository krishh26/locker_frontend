import { useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  useTheme,
  Card,
  CardContent,
  Chip,
  Divider,
  Fade,
  Skeleton
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import capitalize from "@mui/utils/capitalize";
import withReducer from "app/store/withReducer";
import { showMessage } from "app/store/fuse/messageSlice";
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';

import EditableTable from "./EditableTable";
import {
  selectCpdLearner,
  getCpdLearnerListAPI,
  createCpdLearnerEntryAPI,
  updateCpdLearnerEntryAPI,
  deleteCpdLearnerEntryAPI,
  CpdLearnerEntry
} from "app/store/cpdLearner";
import reducer from "app/store/cpdLearner";

import { selectLearnerManagement } from "app/store/learnerManagement";
import { useCurrentUser } from "src/app/utils/userHelpers";

const Cpd = () => {
  const dispatch: any = useDispatch();
  const { data, dataFetchLoading } = useSelector(selectCpdLearner);
  const user = useCurrentUser();
  const { learner } = useSelector(selectLearnerManagement);
  
  const theme = useTheme();

  useEffect(() => {
    dispatch(getCpdLearnerListAPI());
  }, [dispatch]);

  const mapRow = (row: Partial<CpdLearnerEntry>) => ({
    what_training: row.activity || "",
    date: row.date || "",
    how_you_did: row.method || "",
    what_you_learned: row.learning || "",
    how_it_improved_work: row.impact || ""
  });

  const handleAddRow = async (newRow: Partial<CpdLearnerEntry>): Promise<boolean> => {
    const mappedRow = mapRow(newRow);

    if (Object.values(mappedRow).every(val => !val)) return true;

    try {
      const result = await dispatch(createCpdLearnerEntryAPI(mappedRow));
      if (result) dispatch(showMessage({ message: "CPD entry added successfully", variant: "success" }));
      return result;
    } catch {
      dispatch(showMessage({ message: "Failed to add CPD entry", variant: "error" }));
      return false;
    }
  };

  const handleUpdateRow = async (rowId: string, updatedRow: Partial<CpdLearnerEntry>): Promise<boolean> => {
    try {
      const result = await dispatch(updateCpdLearnerEntryAPI(rowId, mapRow(updatedRow)));
      if (result) dispatch(showMessage({ message: "CPD entry updated successfully", variant: "success" }));
      return result;
    } catch {
      dispatch(showMessage({ message: "Failed to update CPD entry", variant: "error" }));
      return false;
    }
  };

  const handleDeleteRow = async (rowId: string): Promise<boolean> => {
    try {
      const result = await dispatch(deleteCpdLearnerEntryAPI(rowId));
      if (result) dispatch(showMessage({ message: "CPD entry deleted successfully", variant: "success" }));
      return result;
    } catch {
      dispatch(showMessage({ message: "Failed to delete CPD entry", variant: "error" }));
      return false;
    }
  };

  const formattedData = (data || []).map((item: CpdLearnerEntry) => ({
    id: item.id,
    activity: item.what_training,
    date: item.date,
    method: item.how_you_did,
    learning: item.what_you_learned,
    impact: item.how_it_improved_work
  }));

  return (
    <Box sx={{ 
      width: "100%", 
      p: { xs: 1, sm: 2, md: 3 },
      minHeight: '100vh',
      background: theme.palette.mode === 'light' 
        ? `linear-gradient(135deg, ${theme.palette.grey[50]} 0%, ${theme.palette.grey[100]} 100%)`
        : `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`
    }}>
      <Fade in timeout={800}>
        <Box>
          {/* Header Card */}
          <Card
            elevation={0}
            sx={{
              mb: 3,
              borderRadius: 3,
              background: theme.palette.mode === 'light'
                ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                : `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
              color: theme.palette.primary.contrastText,
              overflow: "hidden",
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                zIndex: 1
              }
            }}
          >
            <CardContent sx={{ position: 'relative', zIndex: 2, p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <SchoolIcon sx={{ fontSize: 40, mr: 2, opacity: 0.9 }} />
                <Typography 
                  variant="h3" 
                  fontWeight={700}
                  sx={{ 
                    textAlign: "center",
                    background: `linear-gradient(45deg, ${theme.palette.primary.contrastText}, rgba(255,255,255,0.8))`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  Continuing Professional Development
                </Typography>
              </Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  textAlign: "center", 
                  opacity: 0.9,
                  fontWeight: 400,
                  letterSpacing: '0.5px'
                }}
              >
                Learning Log & Development Tracker
              </Typography>
            </CardContent>
          </Card>

          {/* User Information Card */}
          <Card
            elevation={0}
            sx={{
              mb: 3,
              borderRadius: 2,
              background: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              overflow: "hidden",
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: theme.shadows[4],
                transform: 'translateY(-2px)'
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 2, 
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <PersonIcon sx={{ mr: 1, fontSize: 20 }} />
                Learner Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(auto-fit, minmax(250px, 1fr))" },
                  gap: 2,
                  alignItems: "center"
                }}
              >
                {[
                  { 
                    label: "Name", 
                    value: capitalize(user.first_name + " " + user.last_name || ""), 
                    icon: <PersonIcon sx={{ fontSize: 16 }} />,
                    color: theme.palette.primary.main
                  },
                  { 
                    label: "Job Title", 
                    value: learner?.job_title || "Not specified", 
                    icon: <WorkIcon sx={{ fontSize: 16 }} />,
                    color: theme.palette.secondary.main
                  },
                  { 
                    label: "Employer", 
                    value: learner?.employer_name || "Not specified", 
                    icon: <WorkIcon sx={{ fontSize: 16 }} />,
                    color: theme.palette.success.main
                  }
                ].map(({ label, value, icon, color }) => (
                  <Box 
                    key={label} 
                    sx={{ 
                      display: "flex", 
                      alignItems: "center",
                      p: 2,
                      borderRadius: 2,
                      background: theme.palette.mode === 'light' 
                        ? theme.palette.grey[50] 
                        : theme.palette.background.default,
                      border: `1px solid ${theme.palette.divider}`,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: theme.palette.mode === 'light' 
                          ? theme.palette.grey[100] 
                          : theme.palette.background.paper,
                        transform: 'translateY(-1px)'
                      }
                    }}
                  >
                    <Chip
                      icon={icon}
                      label={label}
                      size="small"
                      sx={{ 
                        mr: 2,
                        backgroundColor: color,
                        color: theme.palette.getContrastText(color),
                        fontWeight: 600,
                        minWidth: 'fit-content'
                      }}
                    />
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontWeight: 500,
                        color: theme.palette.text.primary,
                        wordBreak: 'break-word'
                      }}
                    >
                      {value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Loading State */}
          {dataFetchLoading ? (
            <Card elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <CardContent sx={{ p: 3 }}>
                <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
              </CardContent>
            </Card>
          ) : (
            <EditableTable
              data={formattedData}
              onAddRow={handleAddRow}
              onUpdateRow={handleUpdateRow}
              onDeleteRow={handleDeleteRow}
              loading={dataFetchLoading}
            />
          )}
        </Box>
      </Fade>
    </Box>
  );
};

export default withReducer("cpdLearner", reducer)(Cpd);
