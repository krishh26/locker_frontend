import {
  Card,
  Dialog,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Menu,
  Tooltip,
  Box,
  useTheme,
  Chip,
  Paper,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { SecondaryButton } from "src/app/component/Buttons";
import CourseUploadDialog from "src/app/component/Dialogs/courseUploadDialog";
import { courseManagementTableColumn } from "src/app/contanst";
import { useSelector } from "react-redux";
import CourseManagementTable from "src/app/component/Table/CourseManagementTable";
import SearchIcon from "@mui/icons-material/Search";
import DataNotFound from "src/app/component/Pages/dataNotFound";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  fetchCourseAPI,
  selectCourseManagement,
  resetCourseData,
} from "app/store/courseManagement";
import FuseLoading from "@fuse/core/FuseLoading";
import Close from "@mui/icons-material/Close";
import Style from "./style.module.css";
import { selectGlobalUser } from "app/store/globalUser";
import AddIcon from "@mui/icons-material/Add";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useThemeColors, themeHelpers } from "../../utils/themeUtils";
import { styled } from "@mui/material/styles";

// Styled components for theme integration
const ThemedCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: themeHelpers.getShadow(theme, 1),
  transition: 'all 0.3s ease',
  height: '100%',
  overflowY: 'auto',
  
  '&:hover': {
    boxShadow: themeHelpers.getShadow(theme, 2),
  },
}));

const ThemedPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: themeHelpers.getShadow(theme, 1),
}));

const ThemedTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius * 1.5,
    transition: 'all 0.2s ease',
    
    '&:hover': {
      backgroundColor: themeHelpers.withOpacity(theme.palette.primary.main, 0.02),
    },
    
    '&.Mui-focused': {
      backgroundColor: theme.palette.background.paper,
      boxShadow: `0 0 0 3px ${themeHelpers.withOpacity(theme.palette.primary.main, 0.1)}`,
    },
  },
  
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
    fontWeight: 500,
  },
  
  '& .MuiOutlinedInput-input': {
    color: theme.palette.text.primary,
  },
}));

const ThemedFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius * 1.5,
    transition: 'all 0.2s ease',
    
    '&:hover': {
      backgroundColor: themeHelpers.withOpacity(theme.palette.primary.main, 0.02),
    },
    
    '&.Mui-focused': {
      backgroundColor: theme.palette.background.paper,
      boxShadow: `0 0 0 3px ${themeHelpers.withOpacity(theme.palette.primary.main, 0.1)}`,
    },
  },
  
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
    fontWeight: 500,
  },
  
  '& .MuiSelect-select': {
    color: theme.palette.text.primary,
  },
}));

const ThemedIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.primary.main,
  transition: 'all 0.2s ease',
  
  '&:hover': {
    backgroundColor: themeHelpers.withOpacity(theme.palette.primary.main, 0.1),
    transform: 'scale(1.1)',
  },
}));

const ThemedChip = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.contrastText,
  borderRadius: theme.shape.borderRadius * 2,
  fontWeight: 600,
  fontSize: '12px',
  height: '24px',
  transition: 'all 0.2s ease',
  
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: themeHelpers.getShadow(theme, 1),
  },
  
  '& .MuiChip-label': {
    px: 1.5,
    py: 0.5,
  },
}));

const CourseBuilder = () => {
  const theme = useTheme();
  const colors = useThemeColors();
  
  const { dataUpdatingLoadding, meta_data, data, dataFetchLoading } =
    useSelector(selectCourseManagement);
  const dispatch: any = useDispatch();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [coreTypeFilter, setCoreTypeFilter] = useState("");
  const { pagination } = useSelector(selectGlobalUser)

  // Main course types for filtering
  const mainCourseTypes = [
    'Qualification', 'Standard', 'Gateway'
  ];

  // Course type descriptions for tooltips
  const courseTypeDescriptions = {
    'Qualification': 'Create a qualification course with units and criteria',
    'Standard': 'Create a standard course with modules and topics',
    'Gateway': 'Create a gateway course for assessments'
  };

  const fetchCourse = (a = searchKeyword, page = 1, coreType = coreTypeFilter) => {
    dispatch(fetchCourseAPI({ page, page_size: pagination?.page_size }, a, "", coreType));
  }

  useEffect(() => {
    fetchCourse()
  }, [dispatch, pagination]);

  const navigate = useNavigate();

  // State for file upload dialog
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  // State for course type dropdown menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCreateCourse = (courseCoreType = "Qualification") => {
    // Reset course data in Redux store before navigating
    dispatch(resetCourseData());

    // Always include the course core type in the URL as a query parameter
    navigate(`/courseBuilder/course?type=${courseCoreType}`);
    handleMenuClose();
  };

  const searchAPIHandler = () => {
    fetchCourse(searchKeyword, 1, coreTypeFilter);
  };

  const searchByKeywordUser = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      searchAPIHandler();
    }
  };

  const searchHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
    if (e.target.value === "") {
      searchAPIHandler();
    }
  };

  const handleCoreTypeChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setCoreTypeFilter(value);
    fetchCourse(searchKeyword, 1, value);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    fetchCourse(searchKeyword, newPage, coreTypeFilter)
  };

  return (
    <>
      <ThemedCard sx={{ mx: 5, my: 2 }}>
        {/* Header Section */}
        <Box sx={{ p: 3, borderBottom: `1px solid ${colors.divider}` }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700,
              color: colors.text.primary,
              mb: 1,
            }}
          >
            Course Builder
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: colors.text.secondary,
              mb: 2,
            }}
          >
            Create, manage, and organize your courses with ease
          </Typography>
          
          {/* Active Filters Display */}
          {(searchKeyword || coreTypeFilter) && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
              {searchKeyword && (
                <ThemedChip
                  label={`Search: "${searchKeyword}"`}
                  onDelete={() => {
                    setSearchKeyword("");
                    fetchCourse("", 1, coreTypeFilter);
                  }}
                  size="small"
                />
              )}
              {coreTypeFilter && (
                <ThemedChip
                  label={`Type: ${coreTypeFilter}`}
                  onDelete={() => {
                    setCoreTypeFilter("");
                    fetchCourse(searchKeyword, 1, "");
                  }}
                  size="small"
                />
              )}
            </Box>
          )}
        </Box>

        {/* Search and Filter Section */}
        <Box sx={{ p: 3, backgroundColor: colors.background.default }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 3, 
            flexWrap: 'wrap',
            '@media (max-width: 600px)': {
              flexDirection: 'column',
              alignItems: 'stretch',
            }
          }}>
            <Box sx={{ flex: 1, minWidth: 300 }}>
              <ThemedTextField
                label="Search by keyword"
                fullWidth
                size="small"
                onKeyDown={searchByKeywordUser}
                onChange={searchHandler}
                value={searchKeyword}
                placeholder="Search courses by title, description, or keywords..."
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {searchKeyword ? (
                        <ThemedIconButton
                          onClick={() => {
                            setSearchKeyword("");
                            fetchCourse("")
                          }}
                          size="small"
                        >
                          <Close fontSize="small" />
                        </ThemedIconButton>
                      ) : (
                        <ThemedIconButton
                          onClick={() => searchAPIHandler()}
                          size="small"
                        >
                          <SearchIcon fontSize="small" />
                        </ThemedIconButton>
                      )}
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Box sx={{ minWidth: 200 }}>
              <ThemedFormControl fullWidth size="small">
                <InputLabel id="core-type-filter-label">Course Type</InputLabel>
                <Select
                  labelId="core-type-filter-label"
                  id="core-type-filter"
                  value={coreTypeFilter}
                  label="Course Type"
                  onChange={handleCoreTypeChange}
                >
                  <MenuItem value="">All Types</MenuItem>
                  {mainCourseTypes.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </ThemedFormControl>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <SecondaryButton
                name="Upload File"
                startIcon={
                  <img
                    src="assets/images/svgimage/uploadfileicon.svg"
                    alt="Upload File"
                    className="w-5 h-5"
                  />
                }
                onClick={handleOpen}
                sx={{
                  backgroundColor: colors.secondary.main,
                  color: colors.secondary.contrastText,
                  '&:hover': {
                    backgroundColor: colors.secondary.dark,
                    transform: 'translateY(-1px)',
                    boxShadow: themeHelpers.getShadow(theme, 2),
                  },
                }}
              />

              {/* Create Course Button with Dropdown */}
              <SecondaryButton
                id="create-course-button"
                name="Create Course"
                aria-controls={openMenu ? 'create-course-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={openMenu ? 'true' : undefined}
                onClick={handleMenuClick}
                startIcon={
                  <img
                    src="assets/images/svgimage/createcourseicon.svg"
                    alt="Create Course"
                    className="w-5 h-5"
                  />
                }
                endIcon={<KeyboardArrowDownIcon />}
                sx={{
                  backgroundColor: colors.primary.main,
                  color: colors.primary.contrastText,
                  '&:hover': {
                    backgroundColor: colors.primary.dark,
                    transform: 'translateY(-1px)',
                    boxShadow: themeHelpers.getShadow(theme, 2),
                  },
                }}
              />
              <Menu
                id="create-course-menu"
                anchorEl={anchorEl}
                open={openMenu}
                onClose={handleMenuClose}
                MenuListProps={{
                  'aria-labelledby': 'create-course-button',
                }}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                sx={{
                  '& .MuiPaper-root': {
                    backgroundColor: colors.background.paper,
                    color: colors.text.primary,
                    border: `1px solid ${colors.divider}`,
                    borderRadius: theme.shape.borderRadius * 2,
                    boxShadow: themeHelpers.getShadow(theme, 3),
                    mt: 1,
                  },
                }}
              >
                {mainCourseTypes.map((type) => (
                  <Tooltip key={type} title={courseTypeDescriptions[type]} placement="left">
                    <MenuItem 
                      onClick={() => handleCreateCourse(type)}
                      sx={{
                        '&:hover': {
                          backgroundColor: themeHelpers.withOpacity(colors.primary.main, 0.1),
                        },
                      }}
                    >
                      <AddIcon fontSize="small" sx={{ mr: 1, color: colors.primary.main }} />
                      {type}
                    </MenuItem>
                  </Tooltip>
                ))}
              </Menu>
            </Box>
          </Box>
        </Box>

        {/* Content Section */}
        <Box sx={{ p: 3 }}>
          {dataFetchLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <FuseLoading />
            </Box>
          ) : data?.length ? (
            <CourseManagementTable
              columns={courseManagementTableColumn}
              rows={data}
              meta_data={meta_data}
              dataUpdatingLoadding={dataUpdatingLoadding}
              handleChangePage={handleChangePage}
            />
          ) : (
            <ThemedPaper sx={{ p: 4 }}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center', 
                gap: 3, 
                py: 6 
              }}>
                <DataNotFound width="20%" />
                <Typography 
                  variant="h5" 
                  sx={{ 
                    color: colors.text.primary,
                    fontWeight: 600,
                  }}
                >
                  No courses found
                </Typography>

                {searchKeyword || coreTypeFilter ? (
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      textAlign: 'center',
                      color: colors.text.secondary,
                      maxWidth: 400,
                    }}
                  >
                    No courses match your search criteria. Try adjusting your filters or create a new course.
                  </Typography>
                ) : (
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      textAlign: 'center',
                      color: colors.text.secondary,
                      maxWidth: 400,
                    }}
                  >
                    There are no courses available. Get started by creating your first course.
                  </Typography>
                )}

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
                  <SecondaryButton
                    name="Upload File"
                    startIcon={
                      <img
                        src="assets/images/svgimage/uploadfileicon.svg"
                        alt="Upload File"
                        className="w-5 h-5"
                      />
                    }
                    onClick={handleOpen}
                    sx={{
                      backgroundColor: colors.secondary.main,
                      color: colors.secondary.contrastText,
                      '&:hover': {
                        backgroundColor: colors.secondary.dark,
                        transform: 'translateY(-1px)',
                        boxShadow: themeHelpers.getShadow(theme, 2),
                      },
                    }}
                  />

                  <SecondaryButton
                    id="create-course-button-empty"
                    name="Create Course"
                    aria-controls={openMenu ? 'create-course-menu-empty' : undefined}
                    aria-haspopup="true"
                    aria-expanded={openMenu ? 'true' : undefined}
                    onClick={handleMenuClick}
                    startIcon={
                      <img
                        src="assets/images/svgimage/createcourseicon.svg"
                        alt="Create Course"
                        className="w-5 h-5"
                      />
                    }
                    endIcon={<KeyboardArrowDownIcon />}
                    sx={{
                      backgroundColor: colors.primary.main,
                      color: colors.primary.contrastText,
                      '&:hover': {
                        backgroundColor: colors.primary.dark,
                        transform: 'translateY(-1px)',
                        boxShadow: themeHelpers.getShadow(theme, 2),
                      },
                    }}
                  />
                </Box>
              </Box>
            </ThemedPaper>
          )}
        </Box>
      </ThemedCard>

      <Dialog
        open={open}
        onClose={handleClose}
        sx={{
          ".MuiDialog-paper": {
            borderRadius: theme.shape.borderRadius * 2,
            backgroundColor: colors.background.paper,
            boxShadow: themeHelpers.getShadow(theme, 4),
          },
        }}
      >
        <CourseUploadDialog dialogFn={{ handleClose }} />
      </Dialog>
    </>
  );
};

export default CourseBuilder;
