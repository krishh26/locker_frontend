import { FC } from 'react'
import {
  alpha,
  Autocomplete,
  Box,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  useTheme
} from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'
import SchoolIcon from '@mui/icons-material/School'
import SearchIcon from '@mui/icons-material/Search'
import { CourseOption } from '../types'

interface SearchAndFilterProps {
  searchQuery: string
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onClearSearch: () => void
  selectedCourseFilter: CourseOption | null
  onCourseFilterChange: (event: any, newValue: CourseOption | null) => void
  learnerCourses: CourseOption[]
}

const SearchAndFilter: FC<SearchAndFilterProps> = ({
  searchQuery,
  onSearchChange,
  onClearSearch,
  selectedCourseFilter,
  onCourseFilterChange,
  learnerCourses
}) => {
  const theme = useTheme()

  return (
    <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <TextField
        sx={{
          flex: 1,
          minWidth: 250,
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.background.paper, 1),
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.02),
            },
            '&.Mui-focused': {
              backgroundColor: alpha(theme.palette.primary.main, 0.02),
            },
          },
        }}
        variant="outlined"
        placeholder="Search by title"
        value={searchQuery}
        onChange={onSearchChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: theme.palette.text.secondary }} />
            </InputAdornment>
          ),
          endAdornment: searchQuery && (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={onClearSearch}
                sx={{
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.error.main, 0.1),
                    color: theme.palette.error.main
                  }
                }}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <Autocomplete
        sx={{ flex: 1, minWidth: 250 }}
        options={learnerCourses}
        getOptionLabel={(option) => option.course_name || ''}
        value={selectedCourseFilter}
        onChange={onCourseFilterChange}
        disableClearable
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Filter by course"
            variant="outlined"
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <>
                  <InputAdornment position="start">
                    <SchoolIcon sx={{ color: theme.palette.text.secondary }} />
                  </InputAdornment>
                  {params.InputProps.startAdornment}
                </>
              ),
              endAdornment: params.InputProps.endAdornment,
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.background.paper, 1),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.02),
                },
                '&.Mui-focused': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.02),
                },
              },
            }}
          />
        )}
        renderOption={(props, option) => (
          <Box component="li" {...props} key={option.course_id}>
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {option.course_name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Code: {option.course_code}
              </Typography>
            </Box>
          </Box>
        )}
        noOptionsText="No courses found"
        isOptionEqualToValue={(option, value) => option.course_id === value.course_id}
      />
    </Box>
  )
}

export default SearchAndFilter

