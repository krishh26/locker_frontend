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

applyPlugin(jsPDF)

export default function CaseloadPage() {
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
    <Box
      sx={{
        p: 3,
      
        height: 'calc(100vh - 100px)',
        overflowY: 'auto',
      }}
    >
      {/* Header Section */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2 ,  backgroundColor: '#f5f5f5'}}>
        <Box
          display='flex'
          justifyContent='space-between'
          alignItems='center'
          mb={2}
        >
          <Box>
            <Typography
              variant='h4'
              fontWeight='bold'
              color='primary'
              gutterBottom
            >
              Caseload Management
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              Manage and view line managers and their assigned users
            </Typography>
          </Box>
          <Stack direction='row' spacing={2}>
            <Tooltip title='Refresh Data'>
              <IconButton
                onClick={() => refetch()}
                color='primary'
                disabled={isLoading}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant='outlined'
              startIcon={<DownloadIcon />}
              onClick={handleExportCSV}
              sx={{
                borderColor: '#000',
                color: '#000',
                '&:hover': {
                  borderColor: '#333',
                  backgroundColor: '#f5f5f5',
                  transition: 'all 0.3s ease',
                },
              }}
              disabled={isLoading || lineManagers.length === 0}
            >
              Export CSV
            </Button>
            <Button
              variant='contained'
              startIcon={<DownloadIcon />}
              onClick={handleExportPDF}
              sx={{
                backgroundColor: '#000',
                color: '#fff',
                '&:hover': {
                  backgroundColor: '#333',
                  transition: 'all 0.3s ease',
                },
              }}
              disabled={isLoading || lineManagers.length === 0}
            >
              Export PDF
            </Button>
          </Stack>
        </Box>

        {/* Search Bar */}
        <Box display='flex' gap={2} alignItems='center'>
          <TextField
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
                <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              ),
            }}
            sx={{ maxWidth: 400 }}
          />
          {filterName && (
            <Button
              variant='outlined'
              onClick={() => {
                setFilterName('')
                setPage(1)
              }}
            >
              Clear
            </Button>
          )}
        </Box>
      </Paper>

      {/* Loading State */}
      {isLoading && (
        <Box display='flex' justifyContent='center' alignItems='center' py={8}>
          <CircularProgress size={40} />
          <Typography variant='h6' ml={2}>
            Loading caseload data...
          </Typography>
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
              <Card
                elevation={2}
                sx={{
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    elevation: 4,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                {/* Manager Header */}
                <CardHeader
                  avatar={
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        width: 56,
                        height: 56,
                        fontSize: '1.2rem',
                      }}
                    >
                      {getInitials(manager.line_manager.full_name)}
                    </Avatar>
                  }
                  action={
                    <IconButton
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
                    </IconButton>
                  }
                  title={
                    <Typography variant='h6' fontWeight='bold' noWrap>
                      {manager.line_manager.full_name}
                    </Typography>
                  }
                  subheader={
                    <Box>
                      <Typography variant='body2' color='text.secondary' noWrap>
                        <EmailIcon
                          sx={{
                            fontSize: 14,
                            mr: 0.5,
                            verticalAlign: 'middle',
                          }}
                        />
                        {manager.line_manager.email}
                      </Typography>
                    </Box>
                  }
                />

                {/* Statistics Cards */}
                <CardContent sx={{ pt: 0 }}>
                  <Grid container spacing={2} mb={2}>
                    <Grid item xs={4}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.5,
                          textAlign: 'center',
                          bgcolor: 'primary.light',
                          color: 'white',
                        }}
                      >
                        <PeopleIcon sx={{ fontSize: 20, mb: 0.5 }} />
                        <Typography variant='h6' fontWeight='bold'>
                          {manager.statistics.active_users}
                        </Typography>
                        <Typography variant='caption'>Active</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={4}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.5,
                          textAlign: 'center',
                          bgcolor: 'secondary.light',
                          color: 'white',
                        }}
                      >
                        <SchoolIcon sx={{ fontSize: 20, mb: 0.5 }} />
                        <Typography variant='h6' fontWeight='bold'>
                          {manager.statistics.total_managed_learners}
                        </Typography>
                        <Typography variant='caption'>Learners</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={4}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.5,
                          textAlign: 'center',
                          bgcolor: 'success.light',
                          color: 'white',
                        }}
                      >
                        <PersonIcon sx={{ fontSize: 20, mb: 0.5 }} />
                        <Typography variant='h6' fontWeight='bold'>
                          {manager.statistics.total_managed_users}
                        </Typography>
                        <Typography variant='caption'>Total</Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  {/* Status Indicator */}
                  <Box display='flex' justifyContent='center' mb={2}>
                    <Chip
                      label={`${manager.statistics.active_users} Active Users`}
                      color={getStatusColor(manager.statistics.active_users)}
                      size='small'
                      variant='outlined'
                    />
                  </Box>

                  {/* Expandable User List - Only show for the clicked card */}
                  {expandedManager === manager.line_manager.user_id && (
                    <Box mt={2}>
                      <Divider sx={{ mb: 2 }} />
                      <Typography variant='subtitle2' fontWeight='bold' mb={1}>
                        Managed Users ({manager.managed_users?.length || 0})
                      </Typography>

                      {manager.managed_users &&
                      manager.managed_users.length > 0 ? (
                        <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
                          {manager.managed_users.map(
                            (user: any, index: number) => (
                              <ListItem
                                key={user.user_id}
                                sx={{
                                  px: 1,
                                  borderRadius: 1,
                                  mb: 0.5,
                                  bgcolor: 'grey.50',
                                }}
                              >
                                <ListItemAvatar>
                                  <Avatar
                                    sx={{
                                      width: 32,
                                      height: 32,
                                      fontSize: '0.8rem',
                                      bgcolor: 'primary.main',
                                    }}
                                  >
                                    {getInitials(
                                      `${user.first_name} ${user.last_name}`
                                    )}
                                  </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                  primary={
                                    <Typography
                                      variant='body2'
                                      fontWeight='medium'
                                    >
                                      {user.first_name} {user.last_name}
                                    </Typography>
                                  }
                                  secondary={
                                    <Typography
                                      variant='caption'
                                      color='text.secondary'
                                    >
                                      {user.email}
                                    </Typography>
                                  }
                                />
                                {user.role && (
                                  <Chip
                                    label={user.role}
                                    size='small'
                                    variant='outlined'
                                    sx={{ ml: 1 }}
                                  />
                                )}
                              </ListItem>
                            )
                          )}
                        </List>
                      ) : (
                        <Box
                          textAlign='center'
                          py={3}
                          sx={{
                            bgcolor: 'grey.50',
                            borderRadius: 1,
                          }}
                        >
                          <PeopleIcon
                            sx={{
                              fontSize: 40,
                              color: 'text.secondary',
                              mb: 1,
                            }}
                          />
                          <Typography variant='body2' color='text.secondary'>
                            No users assigned yet
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* No Data State */}
      {!isLoading && !isError && lineManagers.length === 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 8,
            textAlign: 'center',
            bgcolor: 'grey.50',
            borderRadius: 2,
          }}
        >
          <PeopleIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant='h5' color='text.secondary' gutterBottom>
            No Line Managers Found
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            {filterName
              ? `No line managers match "${filterName}"`
              : 'There are no line managers in the system yet.'}
          </Typography>
        </Paper>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box display='flex' justifyContent='center' mt={4}>
          <Paper elevation={1} sx={{ p: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              color='primary'
              size='large'
              showFirstButton
              showLastButton
            />
          </Paper>
        </Box>
      )}
    </Box>
  )
}
