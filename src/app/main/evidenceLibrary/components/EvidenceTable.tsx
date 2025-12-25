import { FC, useMemo } from 'react'
import {
  alpha,
  Avatar,
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  IconButton,
  Link as MuiLink,
  TablePagination,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'
import DescriptionIcon from '@mui/icons-material/Description'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  ColumnDef,
} from '@tanstack/react-table'
import FuseLoading from '@fuse/core/FuseLoading'
import DataNotFound from 'src/app/component/Pages/dataNotFound'
import { EvidenceData, CourseOption } from '../types'
import { formatDate, getStatusColor, displayValue, truncateText, getUnitMappingStatus } from '../utils/evidenceHelpers'

const columnHelper = createColumnHelper<EvidenceData>()

interface EvidenceTableProps {
  data: EvidenceData[]
  isLoading: boolean
  searchQuery: string
  onClearSearch: () => void
  pagination: { pageIndex: number; pageSize: number }
  onPageChange: (event: unknown, newPage: number) => void
  onPageSizeChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  totalItems: number
  totalPages: number
  selectedCourseFilter: CourseOption | null
  learnerCourses: CourseOption[]
  onOpenMenu: (e: React.MouseEvent<HTMLElement>, evidence: EvidenceData) => void
}

const EvidenceTable: FC<EvidenceTableProps> = ({
  data,
  isLoading,
  searchQuery,
  onClearSearch,
  pagination,
  onPageChange,
  onPageSizeChange,
  totalItems,
  totalPages,
  selectedCourseFilter,
  learnerCourses,
  onOpenMenu
}) => {
  const theme = useTheme()

  // Column definitions
  const columns = useMemo<ColumnDef<EvidenceData>[]>(() => {
    const baseColumns: ColumnDef<EvidenceData>[] = [
      columnHelper.accessor('title', {
        header: 'Title',
        cell: (info) => {
          const value = info.getValue()
          return (
            <Tooltip title={String(value || '')}>
              <Typography 
                variant='body2' 
                sx={{ 
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {truncateText(String(value), 30)}
              </Typography>
            </Tooltip>
          )
        },
      }),
      columnHelper.accessor('description', {
        header: 'Description',
        cell: (info) => {
          const value = info.getValue()
          return (
            <Tooltip title={String(value || '')}>
              <Typography 
                variant='body2' 
                sx={{ 
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {truncateText(String(value), 30)}
              </Typography>
            </Tooltip>
          )
        },
      }),
      columnHelper.accessor('file', {
        header: 'Files',
        cell: (info) => {
          const file = info.getValue()
          if (file) {
            return (
              <Tooltip title={file.name}>
                <MuiLink
                  href={file.url}
                  target='_blank'
                  rel='noopener'
                  sx={{ textDecoration: 'none' }}
                >
                  <Avatar
                    sx={{
                      backgroundColor: theme.palette.primary.main,
                      width: 40,
                      height: 40,
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                        transform: 'scale(1.05)',
                        transition: 'all 0.2s ease-in-out'
                      }
                    }}
                  >
                    <DescriptionIcon sx={{ color: 'white' }} />
                  </Avatar>
                </MuiLink>
              </Tooltip>
            )
          }
          return (
            <Typography variant='body2' color='text.secondary'>
              -
            </Typography>
          )
        },
      }),
      columnHelper.accessor('trainer_feedback', {
        header: 'Trainer Feedback',
        cell: (info) => {
          const value = info.getValue()
          return (
            <Typography variant='body2' color='text.secondary'>
              {displayValue(String(value))}
            </Typography>
          )
        },
      }),
      columnHelper.accessor('learner_comments', {
        header: 'Learner Comments',
        cell: (info) => {
          const value = info.getValue()
          return (
            <Typography variant='body2' color='text.secondary'>
              {displayValue(String(value))}
            </Typography>
          )
        },
      }),
      columnHelper.accessor('created_at', {
        header: 'Created Date',
        cell: (info) => {
          const value = info.getValue()
          return (
            <Typography variant='body2' color='text.secondary'>
              {value ? formatDate(String(value)) : '-'}
            </Typography>
          )
        },
      }),
    ]

    // If "All" is selected, show course name columns instead of unit columns
    const isAllSelected = selectedCourseFilter?.course_id === ''
    
    if (isAllSelected) {
      // Use learnerCourses array (filter out "All" option)
      const courses = learnerCourses
        .filter((course) => course.course_id !== '' && typeof course.course_id === 'number')
        .sort((a, b) => a.course_name.localeCompare(b.course_name))
      
      // Create columns for each course from learner.course array
      courses.forEach((course) => {
          baseColumns.push(
            columnHelper.display({
              id: `course_${course.course_id}`,
              header: () => (
                <Tooltip title={course.course_name} arrow>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      cursor: 'help',
                      textAlign: 'center',
                      width: '100%'
                    }}
                  >
                    {course.course_name}
                  </Typography>
                </Tooltip>
              ),
              cell: (info) => {
                const row = info.row.original
                // Check if this evidence belongs to this course using mappings array
                // Check all mappings, not just the first one
                const belongsToCourse = row.mappings && Array.isArray(row.mappings)
                  ? row.mappings.some((mapping) => mapping.course?.course_id === course.course_id)
                  : false
                
                return (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Checkbox
                      checked={belongsToCourse}
                      disabled
                      size="small"
                      sx={{
                        padding: '4px',
                        '&.Mui-disabled': {
                          color: belongsToCourse ? theme.palette.primary.main : theme.palette.action.disabled,
                        }
                      }}
                    />
                  </Box>
                )
              },
            })
          )
        })
    } else if (selectedCourseFilter?.units && Array.isArray(selectedCourseFilter.units)) {
      // Add dynamic unit columns if selectedCourseFilter has units
      selectedCourseFilter.units.forEach((unit: any) => {
        if (unit.subUnit && Array.isArray(unit.subUnit) && unit.subUnit.length > 0) {
          unit.subUnit.forEach((subUnit: any) => {
            const subUnitId = subUnit.id
            const subUnitCode = subUnit.code || String(subUnitId)
            const subUnitTitle = subUnit.title || `SubUnit ${subUnitCode}`
            
            baseColumns.push(
              columnHelper.display({
                id: `unit_${subUnitId}`,
                header: () => (
                  <Tooltip title={subUnitTitle} arrow>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        cursor: 'help',
                        textAlign: 'center',
                        width: '100%'
                      }}
                    >
                      {subUnitCode}
                    </Typography>
                  </Tooltip>
                ),
                cell: (info) => {
                  const row = info.row.original
                  // For subunits, pass the subUnitId and mark as isSubUnit=true
                  const mappingStatus = getUnitMappingStatus(row, subUnitId, subUnitCode, true)
                  const isMapped = mappingStatus.learnerMap || mappingStatus.trainerMap || mappingStatus.signedOff
                  
                  let checkboxColor = theme.palette.action.disabled
                  if (mappingStatus.signedOff) {
                    checkboxColor = theme.palette.success.main
                  } else if (mappingStatus.trainerMap) {
                    checkboxColor = theme.palette.warning.main
                  } else if (mappingStatus.learnerMap) {
                    checkboxColor = 'inherit'
                  }
                  
                  return (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <Checkbox
                        checked={isMapped}
                        disabled
                        size="small"
                        sx={{
                          padding: '4px',
                          '&.Mui-disabled': {
                            color: checkboxColor,
                          }
                        }}
                      />
                    </Box>
                  )
                },
              })
            )
          })
        } else {
          const unitId = unit.id
          const unitCode = unit.code || String(unitId)
          const unitTitle = unit.title || `Unit ${unitCode}`
          
          baseColumns.push(
            columnHelper.display({
              id: `unit_${unitId}`,
              header: () => (
                <Tooltip title={unitTitle} arrow>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      cursor: 'help',
                      textAlign: 'center',
                      width: '100%'
                    }}
                  >
                    {unitCode}
                  </Typography>
                </Tooltip>
              ),
              cell: (info) => {
                const row = info.row.original
                // For units, pass the unitId and unitCode, isSubUnit=false
                const mappingStatus = getUnitMappingStatus(row, unitId, unitCode, false)
                const isMapped = mappingStatus.learnerMap || mappingStatus.trainerMap || mappingStatus.signedOff
                
                let checkboxColor = theme.palette.action.disabled
                if (mappingStatus.signedOff) {
                  checkboxColor = theme.palette.success.main
                } else if (mappingStatus.trainerMap) {
                  checkboxColor = theme.palette.warning.main
                } else if (mappingStatus.learnerMap) {
                  checkboxColor = 'inherit'
                }
                
                return (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Checkbox
                      checked={isMapped}
                      disabled
                      size="small"
                      sx={{
                        padding: '4px',
                        '&.Mui-disabled': {
                          color: checkboxColor,
                        }
                      }}
                    />
                  </Box>
                )
              },
            })
          )
        }
      })
    }

    baseColumns.push(
      columnHelper.display({
        id: 'action',
        header: 'Actions',
        cell: (info) => {
          const row = info.row.original
          return (
            <Tooltip title="More actions">
              <IconButton
                size='small'
                onClick={(e) => onOpenMenu(e, row)}
                sx={{ 
                  color: theme.palette.text.secondary,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main
                  }
                }}
              >
                <MoreHorizIcon fontSize='small' />
              </IconButton>
            </Tooltip>
          )
        },
      })
    )

    return baseColumns
  }, [theme, selectedCourseFilter?.units, selectedCourseFilter?.course_id, learnerCourses, onOpenMenu])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: totalPages,
    state: {
      pagination: {
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
      },
    },
  })

  return (
    <Card 
      sx={{ 
        boxShadow: theme.shadows[1],
        borderRadius: 2,
        overflow: 'hidden',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
      }}
    >
      <Box
        sx={{
          maxHeight: 600,
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: alpha(theme.palette.grey[300], 0.1),
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: alpha(theme.palette.grey[400], 0.5),
            borderRadius: '4px',
            '&:hover': {
              background: alpha(theme.palette.grey[400], 0.7),
            },
          },
        }}
      >
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <FuseLoading />
          </Box>
        ) : data?.length > 0 ? (
          <Box
            component="table"
            sx={{
              width: '100%',
              borderCollapse: 'collapse',
              tableLayout: 'auto',
              '& th': {
                position: 'sticky',
                top: 0,
                zIndex: 100,
                backgroundColor: theme.palette.background.paper,
                fontWeight: 600,
                color: theme.palette.text.primary,
                borderBottom: `2px solid ${theme.palette.divider}`,
                padding: theme.spacing(2),
                textAlign: 'left',
                fontSize: '1.5rem',
                boxShadow: `0 2px 4px ${alpha(theme.palette.common.black, 0.1)}`,
              },
              '& td': {
                padding: theme.spacing(2),
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                fontSize: '0.875rem',
              },
              '& tbody tr': {
                '&:nth-of-type(odd)': {
                  backgroundColor: alpha(theme.palette.action.hover, 0.02),
                },
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  cursor: 'pointer',
                },
              },
            }}
          >
            <Box component="thead">
              {table.getHeaderGroups().map(headerGroup => (
                <Box component="tr" key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <Box
                      component="th"
                      key={header.id}
                      sx={{
                        cursor: header.column.getCanSort() ? 'pointer' : 'default',
                        userSelect: 'none',
                      }}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {header.isPlaceholder ? null : (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                          }}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: ' ↑',
                            desc: ' ↓',
                          }[header.column.getIsSorted() as string] ?? null}
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              ))}
            </Box>
            <Box component="tbody">
              {table.getRowModel().rows.map(row => (
                <Box
                  component="tr"
                  key={row.id}
                >
                  {row.getVisibleCells().map(cell => (
                    <Box
                      component="td"
                      key={cell.id}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </Box>
                  ))}
                </Box>
              ))}
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 8,
              px: 4
            }}
          >
            <DataNotFound width='25%' />
            <Typography variant='h5' sx={{ mt: 3, mb: 1, fontWeight: 500 }}>
              {searchQuery ? 'No Results Found' : 'No Evidence Found'}
            </Typography>
            <Typography 
              variant='body2' 
              color='text.secondary'
              sx={{ textAlign: 'center', maxWidth: 400 }}
            >
              {searchQuery 
                ? `No evidence matches your search "${searchQuery}". Try adjusting your search terms or clear the search to see all evidence.`
                : "You haven't uploaded any evidence yet. Click \"Add Evidence\" to get started with your portfolio."
              }
            </Typography>
            {searchQuery && (
              <Button
                variant="outlined"
                color="primary"
                onClick={onClearSearch}
                startIcon={<ClearIcon />}
                sx={{
                  mt: 3,
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 600,
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                  }
                }}
              >
                Clear Search
              </Button>
            )}
          </Box>
        )}
      </Box>
      
      {data && data.length > 0 && (
        <TablePagination
          component="div"
          count={totalItems}
          page={pagination.pageIndex}
          onPageChange={onPageChange}
          rowsPerPage={pagination.pageSize}
          onRowsPerPageChange={onPageSizeChange}
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          sx={{
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            backgroundColor: alpha(theme.palette.grey[50], 0.3),
            '& .MuiTablePagination-toolbar': {
              px: 3,
              py: 2,
            },
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              fontWeight: 500,
              color: theme.palette.text.secondary,
            },
            '& .MuiTablePagination-select': {
              borderRadius: 1,
              px: 1,
              '&:focus': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              }
            },
            '& .MuiTablePagination-actions': {
              '& .MuiIconButton-root': {
                borderRadius: 1,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                }
              }
            }
          }}
          labelRowsPerPage="Items per page:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
          }
        />
      )}
    </Card>
  )
}

export default EvidenceTable

