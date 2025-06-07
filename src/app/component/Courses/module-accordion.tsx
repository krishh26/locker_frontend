import React, { useState } from 'react'
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  Typography,
  Box,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Button,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { modulesTableColumn } from 'src/app/contanst'

type ModuleType = 'knowledge' | 'behaviours' | 'skills'

const moduleLabels: Record<ModuleType, string> = {
  knowledge: 'Knowledge',
  behaviours: 'Behaviours',
  skills: 'Skills',
}

const ModuleAccordion: React.FC = () => {
  const [expanded, setExpanded] = useState<ModuleType | false>(false)
  const [checkedItems, setCheckedItems] = useState<Record<ModuleType, boolean>>(
    {
      knowledge: false,
      behaviours: false,
      skills: false,
    }
  )

  const handleAccordionChange =
    (panel: ModuleType) =>
    (_event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false)
    }

  const handleCheckboxChange = (type: ModuleType) => {
    setCheckedItems((prev) => ({
      ...prev,
      [type]: !prev[type],
    }))
  }

  return (
    <Box sx={{ border: '1px solid #ccc', borderRadius: 2, p: 2 }}>
      <Typography variant='subtitle1' fontWeight={600} mb={1}>
        Modules
      </Typography>

      {Object.keys(moduleLabels).map((type) => {
        const key = type as ModuleType
        return (
          <Accordion
            key={key}
            expanded={expanded === key}
            onChange={handleAccordionChange(key)}
            sx={{
              backgroundColor: '#f5f5f5',
              boxShadow: 'none',
              mb: 1,
              border: '1px solid #ddd',
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography className='font-bold'>{moduleLabels[key]}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div className='flex mb-10 items-end justify-end'>
                <Button
                  variant='contained'
                  className='rounded-md'
                  color='primary'
                >
                  Add New
                </Button>
              </div>
              <TableContainer
                sx={{
                  minHeight: 250,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <Table stickyHeader aria-label='sticky table' size='small'>
                  <TableHead>
                    <TableRow>
                      {modulesTableColumn?.map((column) => (
                        <TableCell
                          key={column.id}
                          align={column.align}
                          //   style={{ minWidth: column.minWidth }}
                          sx={{ backgroundColor: '#FFFF' }}
                        >
                          {column.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* {rows?.map((row) => {
                      return (
                        <TableRow
                          hover
                          role='checkbox'
                          tabIndex={-1}
                          key={row.course_id}
                        >
                          {modulesTableColumn?.map((column) => {
                            const value = row[column.id]
                            if (column.id === 'actions') {
                              return (
                                <TableCell
                                  key={column.id}
                                  align={column.align}
                                  sx={{ borderBottom: '2px solid #F8F8F8' }}
                                >
                                  <IconButton
                                    size='small'
                                    sx={{
                                      color: '#5B718F',
                                      marginRight: '4px',
                                    }}
                                    onClick={(e) => openMenu(e, row.course_id)}
                                  >
                                    <MoreHorizIcon fontSize='small' />
                                  </IconButton>
                                </TableCell>
                              )
                            }
                            if (column.id === 'course_core_type') {
                              return (
                                <TableCell
                                  key={column.id}
                                  align={column.align}
                                  sx={{ borderBottom: '2px solid #F8F8F8' }}
                                >
                                  <span
                                    style={{
                                      padding: '4px 8px',
                                      borderRadius: '4px',
                                      backgroundColor:
                                        value === 'Qualification'
                                          ? '#e3f2fd'
                                          : value === 'Standard'
                                          ? '#e8f5e9'
                                          : value === 'Gateway'
                                          ? '#fff3e0'
                                          : '#f5f5f5',
                                      color:
                                        value === 'Qualification'
                                          ? '#1976d2'
                                          : value === 'Standard'
                                          ? '#388e3c'
                                          : value === 'Gateway'
                                          ? '#f57c00'
                                          : '#757575',
                                    }}
                                  >
                                    {value || 'Unknown'}
                                  </span>
                                </TableCell>
                              )
                            }
                            return (
                              <TableCell
                                key={column.id}
                                align={column.align}
                                sx={{ borderBottom: '2px solid #F8F8F8' }}
                              >
                                <div className={Style.avatar}>
                                  {column.id === 'first_name' ? (
                                    <>
                                      <Avatar
                                        alt={value}
                                        src={row?.avatar?.url}
                                        sx={{
                                          marginRight: '8px',
                                          width: '24px',
                                          height: '24px',
                                          backgroundColor: getRandomColor(
                                            row?.user_name
                                              ?.toLowerCase()
                                              .charAt(0)
                                          ),
                                        }}
                                      />
                                      {value} {row['last_name']}
                                    </>
                                  ) : (
                                    value || 'Active'
                                  )}
                                </div>
                              </TableCell>
                            )
                          })}
                        </TableRow>
                      )
                    })} */}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        )
      })}
    </Box>
  )
}

export default ModuleAccordion
