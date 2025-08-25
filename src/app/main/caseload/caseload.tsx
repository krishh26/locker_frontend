'use client'
import { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Chip,
  TextField,
  Button,
  Pagination,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Paper,
  Stack,
  Badge,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { styled } from '@mui/material/styles'
import {
  Search as SearchIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import jsPDF from 'jspdf'
import { applyPlugin } from 'jspdf-autotable'
import { useGetCaseloadListQuery } from 'app/store/api/caseload-api'
import { themeHelpers } from '../../utils/themeUtils'

applyPlugin(jsPDF)

// Styled Components
const ThemedBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.primary,
}))

const ThemedPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: themeHelpers.getShadow(theme, 1),
}))

const ThemedCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: themeHelpers.getShadow(theme, 2),
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: themeHelpers.getShadow(theme, 4),
    transform: 'translateY(-2px)',
  },
}))

const ThemedCardHeader = styled(CardHeader)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  '& .MuiCardHeader-title': {
    color: theme.palette.text.primary,
  },
  '& .MuiCardHeader-subheader': {
    color: theme.palette.text.secondary,
  },
}))

const ThemedCardContent = styled(CardContent)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
}))

const ThemedTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    '& fieldset': {
      borderColor: theme.palette.divider,
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
    '&.Mui-focused': {
      color: theme.palette.primary.main,
    },
  },
}))

const ThemedButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: themeHelpers.getShadow(theme, 1),
  '&:hover': {
    boxShadow: themeHelpers.getShadow(theme, 3),
  },
}))

const ThemedPrimaryButton = styled(ThemedButton)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}))

const ThemedOutlinedButton = styled(ThemedButton)(({ theme }) => ({
  borderColor: theme.palette.primary.main,
  color: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: themeHelpers.withOpacity(theme.palette.primary.main, 0.08),
  },
}))

const ThemedIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: themeHelpers.withOpacity(theme.palette.primary.main, 0.08),
  },
  '&:active': {
    backgroundColor: themeHelpers.withOpacity(theme.palette.primary.main, 0.12),
  },
}))

const ThemedTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
}))

const ThemedChip = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  '&.MuiChip-colorSuccess': {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
  },
  '&.MuiChip-colorWarning': {
    backgroundColor: theme.palette.warning.main,
    color: theme.palette.warning.contrastText,
  },
  '&.MuiChip-colorInfo': {
    backgroundColor: theme.palette.info.main,
    color: theme.palette.info.contrastText,
  },
  '&.MuiChip-colorDefault': {
    backgroundColor: theme.palette.grey[300],
    color: theme.palette.text.primary,
  },
}))

const ThemedListItem = styled(ListItem)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(0.5),
  '&:hover': {
    backgroundColor: themeHelpers.withOpacity(theme.palette.primary.main, 0.04),
  },
}))

const ThemedDivider = styled(Divider)(({ theme }) => ({
  borderColor: theme.palette.divider,
}))

export default function CaseloadPage() {
  const theme = useTheme()
  const [filterName, setFilterName] = useState('')
  const [expandedManager, setExpandedManager] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const rowsPerPage = 6

  // API call with params
  const { data, isLoading, isError, refetch } = useGetCaseloadListQuery({
    search: filterName,
    page,
    limit: rowsPerPage,
    meta: true,
  })

  // Data handling
  const lineManagers = data?.data || []
  console.log('🚀 ~ CaseloadPage ~ lineManagers:', lineManagers)
  const totalCount = data?.meta_data?.total_line_managers || 0
  const totalPages = Math.ceil(totalCount / rowsPerPage)

  // Handle manager expansion - only expand the clicked card
  const handleManagerToggle = (managerId: string) => {
    console.log('🚀 ~ handleManagerToggle ~ managerId:', managerId)
    setExpandedManager(expandedManager === managerId ? null : managerId)
  }

  // Export PDF
  const handleExportPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text('Caseload Management Report', 14, 20)
    doc.setFontSize(12)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)

    let yPosition = 45
    lineManagers.forEach((manager, idx) => {
      if (yPosition > 250) {
        doc.addPage()
        yPosition = 20
      }

      doc.setFontSize(14)
      doc.text(`${idx + 1}. ${manager.line_manager.full_name}`, 14, yPosition)
      doc.setFontSize(10)
      doc.text(`Email: ${manager.line_manager.email}`, 20, yPosition + 8)
      doc.text(
        `Active Users: ${manager.statistics.active_users}`,
        20,
        yPosition + 16
      )
      doc.text(
        `Total Learners: ${manager.statistics.total_managed_learners}`,
        20,
        yPosition + 24
      )
      doc.text(
        `Total Users: ${manager.statistics.total_managed_users}`,
        20,
        yPosition + 32
      )

      if (manager.managed_users?.length > 0) {
        ;(doc as any).autoTable({
          startY: yPosition + 40,
          head: [['Name', 'Email', 'Role']],
          body: manager.managed_users.map((u: any) => [
            `${u.first_name} ${u.last_name}`,
            u.email,
            u.role || 'User',
          ]),
          theme: 'grid',
          margin: { left: 20 },
        })
        yPosition = (doc as any).lastAutoTable.finalY + 20
      } else {
        yPosition += 50
      }
    })

    doc.save('caseload-report.pdf')
  }

  // Export CSV
  const handleExportCSV = () => {
    // Create CSV content
    const csvHeaders = [
      'Line Manager Name',
      'Managed User Email',
      'Active Users',
      'Total Learners',
      'Total Users',
    ]

    let csvContent = csvHeaders.join(',') + '\n'

    lineManagers.forEach((manager) => {
      // Get all managed user emails as a comma-separated string
      let managedUserEmails = ''
      if (manager.managed_users && manager.managed_users.length > 0) {
        managedUserEmails = manager.managed_users
          .map((user: any) => user.email)
          .join(',')
      }

      const rowData = [
        manager.line_manager.full_name,
        managedUserEmails,
        manager.statistics.active_users,
        manager.statistics.total_managed_learners,
        manager.statistics.total_managed_users,
      ]
      
      csvContent += rowData.map(field => `"${field}"`).join(',') + '\n'
    })

    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `caseload-report-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Get status color
  const getStatusColor = (count: number) => {
    if (count === 0) return 'default'
    if (count < 5) return 'warning'
    if (count < 10) return 'info'
    return 'success'
  }

  return (
    <ThemedBox
      sx={{
        p: 3,
        height: 'calc(100vh - 100px)',
        overflowY: 'auto',
      }}
    >
      {/* Header Section */}
      <ThemedPaper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box
          display='flex'
          justifyContent='space-between'
          alignItems='center'
          mb={2}
        >
          <Box>
            <ThemedTypography
              variant='h4'
              fontWeight='bold'
              color='primary'
              gutterBottom
            >
              Caseload Management
            </ThemedTypography>
            <ThemedTypography variant='body1' color='text.secondary'>
              Manage and view line managers and their assigned users
            </ThemedTypography>
          </Box>
          <Stack direction='row' spacing={2}>
            <Tooltip title='Refresh Data'>
              <ThemedIconButton
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshIcon />
              </ThemedIconButton>
            </Tooltip>
            <ThemedOutlinedButton
              variant='outlined'
              startIcon={<DownloadIcon />}
              onClick={handleExportCSV}
              sx={{
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                '&:hover': {
                  borderColor: theme.palette.primary.dark,
                  backgroundColor: themeHelpers.withOpacity(theme.palette.primary.main, 0.08),
                  transition: 'all 0.3s ease',
                },
              }}
              disabled={isLoading || lineManagers.length === 0}
            >
              Export CSV
            </ThemedOutlinedButton>
            <ThemedPrimaryButton
              variant='contained'
              startIcon={<DownloadIcon />}
              onClick={handleExportPDF}
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                  transition: 'all 0.3s ease',
                },
              }}
              disabled={isLoading || lineManagers.length === 0}
            >
              Export PDF
            </ThemedPrimaryButton>
          </Stack>
        </Box>

        {/* Search Bar */}
        <Box display='flex' gap={2} alignItems='center'>
          <ThemedTextField
            fullWidth
            placeholder='Search line managers by name or email...'
            variant='outlined'
            size='small'
            value={filterName}
            onChange={(e) => {
              setPage(1)
              setFilterName(e.target.value)
            }}
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ mr: 1, color: theme.palette.text.secondary }} />
              ),
            }}
            sx={{ maxWidth: 400 }}
          />
          {filterName && (
            <ThemedOutlinedButton
              variant='outlined'
              onClick={() => {
                setFilterName('')
                setPage(1)
              }}
            >
              Clear
            </ThemedOutlinedButton>
          )}
        </Box>
      </ThemedPaper>

      {/* Loading State */}
      {isLoading && (
        <Box display='flex' justifyContent='center' alignItems='center' py={8}>
          <CircularProgress size={40} sx={{ color: theme.palette.primary.main }} />
          <ThemedTypography variant='h6' ml={2}>
            Loading caseload data...
          </ThemedTypography>
        </Box>
      )}

      {/* Error State */}
      {isError && (
        <Alert severity='error' sx={{ mb: 3 }}>
          Failed to load caseload data. Please try again.
        </Alert>
      )}

      {/* Line Managers Grid */}
      {!isLoading && !isError && (
        <Grid container spacing={3}>
          {lineManagers.map((manager: any) => (
            <Grid item xs={12} md={6} lg={4} key={manager.line_manager.user_id}>
              <ThemedCard elevation={2}>
                {/* Manager Header */}
                <ThemedCardHeader
                  avatar={
                    <Avatar
                      sx={{
                        bgcolor: theme.palette.primary.main,
                        width: 56,
                        height: 56,
                        fontSize: '1.2rem',
                      }}
                    >
                      {getInitials(manager.line_manager.full_name)}
                    </Avatar>
                  }
                  action={
                    <ThemedIconButton
                      onClick={() =>
                        handleManagerToggle(manager.line_manager.user_id)
                      }
                      size='small'
                    >
                      {expandedManager === manager.line_manager.user_id ? (
                        <ExpandLessIcon />
                      ) : (
                        <ExpandMoreIcon />
                      )}
                    </ThemedIconButton>
                  }
                  title={
                    <ThemedTypography variant='h6' fontWeight='bold' noWrap>
                      {manager.line_manager.full_name}
                    </ThemedTypography>
                  }
                  subheader={
                    <Box>
                      <ThemedTypography variant='body2' color='text.secondary' noWrap>
                        <EmailIcon
                          sx={{
                            fontSize: 14,
                            mr: 0.5,
                            verticalAlign: 'middle',
                          }}
                        />
                        {manager.line_manager.email}
                      </ThemedTypography>
                    </Box>
                  }
                />

                {/* Statistics Cards */}
                <ThemedCardContent sx={{ pt: 0 }}>
                  <Grid container spacing={2} mb={2}>
                    <Grid item xs={4}>
                      <ThemedPaper
                        elevation={0}
                        sx={{
                          p: 1.5,
                          textAlign: 'center',
                          bgcolor: theme.palette.primary.main,
                          color: theme.palette.primary.contrastText,
                        }}
                      >
                        <PeopleIcon sx={{ fontSize: 20, mb: 0.5 }} />
                        <ThemedTypography variant='h6' fontWeight='bold'>
                          {manager.statistics.active_users}
                        </ThemedTypography>
                        <ThemedTypography variant='caption'>Active</ThemedTypography>
                      </ThemedPaper>
                    </Grid>
                    <Grid item xs={4}>
                      <ThemedPaper
                        elevation={0}
                        sx={{
                          p: 1.5,
                          textAlign: 'center',
                          bgcolor: theme.palette.secondary.main,
                          color: theme.palette.secondary.contrastText,
                        }}
                      >
                        <SchoolIcon sx={{ fontSize: 20, mb: 0.5 }} />
                        <ThemedTypography variant='h6' fontWeight='bold'>
                          {manager.statistics.total_managed_learners}
                        </ThemedTypography>
                        <ThemedTypography variant='caption'>Learners</ThemedTypography>
                      </ThemedPaper>
                    </Grid>
                    <Grid item xs={4}>
                      <ThemedPaper
                        elevation={0}
                        sx={{
                          p: 1.5,
                          textAlign: 'center',
                          bgcolor: theme.palette.success.main,
                          color: theme.palette.success.contrastText,
                        }}
                      >
                        <PersonIcon sx={{ fontSize: 20, mb: 0.5 }} />
                        <ThemedTypography variant='h6' fontWeight='bold'>
                          {manager.statistics.total_managed_users}
                        </ThemedTypography>
                        <ThemedTypography variant='caption'>Total</ThemedTypography>
                      </ThemedPaper>
                    </Grid>
                  </Grid>

                  {/* Status Indicator */}
                  <Box display='flex' justifyContent='center' mb={2}>
                    <ThemedChip
                      label={`${manager.statistics.active_users} Active Users`}
                      color={getStatusColor(manager.statistics.active_users)}
                      size='small'
                      variant='outlined'
                    />
                  </Box>

                  {/* Expandable User List - Only show for the clicked card */}
                  {expandedManager === manager.line_manager.user_id && (
                    <Box mt={2}>
                      <ThemedDivider sx={{ mb: 2 }} />
                      <ThemedTypography variant='subtitle2' fontWeight='bold' mb={1}>
                        Managed Users ({manager.managed_users?.length || 0})
                      </ThemedTypography>

                      {manager.managed_users &&
                      manager.managed_users.length > 0 ? (
                        <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
                          {manager.managed_users.map(
                            (user: any, index: number) => (
                              <ThemedListItem
                                key={user.user_id}
                                sx={{
                                  px: 1,
                                  borderRadius: 1,
                                  mb: 0.5,
                                  bgcolor: theme.palette.background.default,
                                }}
                              >
                                <ListItemAvatar>
                                  <Avatar
                                    sx={{
                                      width: 32,
                                      height: 32,
                                      fontSize: '0.8rem',
                                      bgcolor: theme.palette.primary.main,
                                    }}
                                  >
                                    {getInitials(
                                      `${user.first_name} ${user.last_name}`
                                    )}
                                  </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                  primary={
                                    <ThemedTypography
                                      variant='body2'
                                      fontWeight='medium'
                                    >
                                      {user.first_name} {user.last_name}
                                    </ThemedTypography>
                                  }
                                  secondary={
                                    <ThemedTypography
                                      variant='caption'
                                      color='text.secondary'
                                    >
                                      {user.email}
                                    </ThemedTypography>
                                  }
                                />
                                {user.role && (
                                  <ThemedChip
                                    label={user.role}
                                    size='small'
                                    variant='outlined'
                                    sx={{ ml: 1 }}
                                  />
                                )}
                              </ThemedListItem>
                            )
                          )}
                        </List>
                      ) : (
                        <Box
                          textAlign='center'
                          py={3}
                          sx={{
                            bgcolor: theme.palette.background.default,
                            borderRadius: 1,
                          }}
                        >
                          <PeopleIcon
                            sx={{
                              fontSize: 40,
                              color: theme.palette.text.secondary,
                              mb: 1,
                            }}
                          />
                          <ThemedTypography variant='body2' color='text.secondary'>
                            No users assigned yet
                          </ThemedTypography>
                        </Box>
                      )}
                    </Box>
                  )}
                </ThemedCardContent>
              </ThemedCard>
            </Grid>
          ))}
        </Grid>
      )}

      {/* No Data State */}
      {!isLoading && !isError && lineManagers.length === 0 && (
        <ThemedPaper
          elevation={0}
          sx={{
            p: 8,
            textAlign: 'center',
            bgcolor: theme.palette.background.default,
            borderRadius: 2,
          }}
        >
          <PeopleIcon sx={{ fontSize: 80, color: theme.palette.text.secondary, mb: 2 }} />
          <ThemedTypography variant='h5' color='text.secondary' gutterBottom>
            No Line Managers Found
          </ThemedTypography>
          <ThemedTypography variant='body1' color='text.secondary'>
            {filterName
              ? `No line managers match "${filterName}"`
              : 'There are no line managers in the system yet.'}
          </ThemedTypography>
        </ThemedPaper>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box display='flex' justifyContent='center' mt={4}>
          <ThemedPaper elevation={1} sx={{ p: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              color='primary'
              size='large'
              showFirstButton
              showLastButton
            />
          </ThemedPaper>
        </Box>
      )}
    </ThemedBox>
  )
}
