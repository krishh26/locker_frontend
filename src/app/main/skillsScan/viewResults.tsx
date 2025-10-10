import AssessmentIcon from '@mui/icons-material/Assessment'
import BarChartIcon from '@mui/icons-material/BarChart'
import DownloadIcon from '@mui/icons-material/Download'
import ListIcon from '@mui/icons-material/List'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import VisibilityIcon from '@mui/icons-material/Visibility'
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Fade,
  FormControl,
  MenuItem,
  Paper,
  Select,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material'
import { selectLearnerManagement } from 'app/store/learnerManagement'
import { selectSkillsScan } from 'app/store/skillsScan'
import 'chart.js/auto'
import html2canvas from 'html2canvas'
import html2pdf from 'html2pdf.js'
import { forwardRef, useRef, useState } from 'react'
import { Line } from 'react-chartjs-2'
import { useSelector } from 'react-redux'
import { SecondaryButton } from 'src/app/component/Buttons'
import { useCurrentUser } from 'src/app/utils/userHelpers'
import LearnerProgressChart from './LearnerProgressChart'

interface LineChartProps {
  data: { rating: any; name: any }[]
}

const LineChart = forwardRef<any, LineChartProps>(({ data }, ref) => {
  const labels = data.map((a) => a.name)

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Your rating',
        data: data.map((a) => a.rating),
        fill: false,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1,
        pointBackgroundColor: 'rgba(75, 192, 192, 1)',
        pointBorderColor: 'rgba(75, 192, 192, 1)',
      },
    ],
  }

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        min: 1,
        max: 4,
        ticks: {
          stepSize: 1,
          callback: (value) => {
            switch (value) {
              case 1:
                return '☹️'
              case 2:
                return '😖'
              case 3:
                return '🙂'
              case 4:
                return '😁'
              default:
                return value
            }
          },
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
    },
  }

  return (
    <div>
      <Line ref={ref} data={chartData} options={options} />
    </div>
  )
})

const ViewResults = () => {
  const theme = useTheme()
  const selectedUser = useCurrentUser()
  const { courseData } = useSelector(selectLearnerManagement)
  const { selectedCourse } = useSelector(selectSkillsScan)
  const chartRef = useRef<any>(null)

  const legendData = courseData?.units?.map((row) => row?.title)
  const [result, setResult] = useState([])
  const [subTitle, setSubTitle] = useState('')
  const [selectedTopic, setSelectedTopic] = useState(legendData?.[0])

  const handleChangeTopic = (data) => {
    setResult(data.subUnit)
    setSelectedTopic(data.title)
    setSubTitle(data.title)
  }

  const downloadPdf = async () => {
    if (chartRef.current) {
      const canvas = await html2canvas(chartRef.current)
      const chartImage = canvas.toDataURL('image/png')

      const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>A4 Sized Results Chart</title>
                <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
                <style>
                    .a4-container {
                        background-color: white;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                        display: flex;
                        flex-direction: column;
                        justify-content: space-between;
                    }
                    .chart-placeholder {
                        background: #f5f5f5;
                        height: 200px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border: 1px solid #ccc;
                    }
                    .legend-item {
                        color: #f5a623;
                    }
                    li {
                        font-size: 10px;
                        padding-bottom: 0.5rem;
                    }
                    .footer {
                        border-top: 1px solid #e5e5e5;
                        padding-top: 8px;
                        text-align: left;
                        color: #6b7280;
                        font-size: 12px;
                    }
                    .footer a {
                        color: #4f46e5;
                        font-size: 15px;
                    }
                    h2 {
                        font-size: 16px;
                    }
                    h3 {
                        font-size: 14px;
                    }
                    p {
                        font-size: 12px;
                    }
                    .text-lg {
                        font-size: 14px;
                    }
                    .text-base {
                        font-size: 12px;
                    }
                    .text-sm {
                        font-size: 10px;
                    }
                    .header-box {
                        height: 3.25rem;
                    }
                </style>
            </head>
            <body class="bg-gray-100 flex justify-center items-center">
                <div class="a4-container">
                    <div class="mb-6">
                        <p class="text-base font-semibold">Results Chart for ${
                          selectedUser?.first_name +
                          ' ' +
                          selectedUser.last_name
                        }</p>
                        <p class="text-sm text-gray-600 mt-2">${subTitle}</p>
                    </div>
                    <div class="flex gap-8 w-full">
                        <div class="w-1/2">
                            <div class="header-box bg-gray-200 p-2 border border-gray-300 rounded">
                                <h4 class="text-sm font-semibold">Gap Analysis</h4>
                            </div>
                            <div class="chart-placeholder mt-4">
                                <img src="${chartImage}" alt="Chart Image" />
                            </div>
                        </div>
                        <div class="w-1/2">
                            <div class="header-box bg-gray-200 p-2 border border-gray-300 rounded-0">
                                <h4 class="text-sm font-semibold">Legend</h4>
                            </div>
                          <div class="p-4 border border-gray-300 rounded-lg bg-white shadow-sm" id="data-show">
  ${courseData?.units
    ?.map(
      (row) => `
        <div class="mb-4">
          <p class="font-semibold text-gray-900">${row?.title}</p>
          <ul class="list-disc list-inside text-gray-800 space-y-2">
            ${row?.subUnit
              ?.map((item) => `<li>${item?.subTitle}</li>`)
              .join('')}
          </ul>
        </div>
      `
    )
    .join('')}
</div>

                        </div>
                    </div>
                    <div class="footer my-8 flex justify-between text-sm">
                        <div>
                           <p class="mb-8 text-sm">© Copyright 2024 Locker: Next Generation E-portfolio Software</p>
                            <div class="mt-1 flex gap-4">
                               <a href="https://www.linkedin.com" target="_blank" class="text-gray-500 hover:text-blue-700">
                                    <img src="/assets/icons/icon_linkedin_over.gif" alt="LinkedIn" class="w-6 h-6">
                                </a>
                                <a href="https://twitter.com" target="_blank" class="text-gray-500 hover:text-blue-500">
                                    <img src="/assets/icons/icon_twitter_over.gif" alt="Twitter" class="w-6 h-6">
                                </a>
                            </div>
                        </div>
                        <div>
                            Locker LLP
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `

      const element = document.createElement('div')
      element.innerHTML = htmlContent

      const opt = {
        margin: 0.5,
        filename: 'ResultsChart.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'A4', orientation: 'portrait' },
      }

      html2pdf().from(element).set(opt).save()
    }
  }

  const totalSkills = courseData?.units?.reduce((sum, unit) => sum + (unit.subUnit?.length || 0), 0) || 0
  const completedSkills = courseData?.units?.reduce((sum, unit) => 
    sum + (unit.subUnit?.filter(sub => 
      sub.quarter_review?.induction && 
      sub.quarter_review?.first && 
      sub.quarter_review?.second && 
      sub.quarter_review?.third
    ).length || 0), 0) || 0

  return (
    <Box>
      {/* Header */}
      <Card
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 2,
          background: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          overflow: "hidden"
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <VisibilityIcon sx={{ 
                fontSize: 28, 
                color: theme.palette.primary.main,
                mr: 2,
                opacity: 0.8
              }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Assessment Results
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip
                icon={<TrendingUpIcon />}
                label={`${completedSkills}/${totalSkills} Skills Assessed`}
                size="small"
                sx={{
                  backgroundColor: theme.palette.success.light,
                  color: theme.palette.success.contrastText,
                  fontWeight: 600
                }}
              />
              <Tooltip title="Download results as PDF">
                <SecondaryButton
                  name='Download PDF'
                  startIcon={<DownloadIcon />}
                  onClick={downloadPdf}
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    }
                  }}
                />
              </Tooltip>
            </Box>
          </Box>
          <Divider />
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', gap: 3, minHeight: '600px' }}>
        {/* Chart Section */}
        <Box sx={{ flexGrow: 1 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 2,
              background: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              overflow: "hidden"
            }}
          >
            <CardContent sx={{ p: 0 }}>
              {/* Topic Selection */}
              <Box sx={{ 
                p: 3, 
                background: theme.palette.mode === 'light' 
                  ? theme.palette.grey[50] 
                  : theme.palette.background.default,
                borderBottom: `1px solid ${theme.palette.divider}`
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <BarChartIcon sx={{ 
                    fontSize: 24, 
                    color: theme.palette.primary.main
                  }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Select Topic for Analysis
                  </Typography>
                </Box>
                <FormControl fullWidth size='small' sx={{ mt: 2 }}>
                  <Select
                    labelId='topic-select-label'
                    id='topic-select'
                    name='topic'
                    value={selectedTopic || ''}
                    onChange={(e) => {
                      const selectedRow = courseData?.units?.find(
                        (row) => row.title === e.target.value
                      )
                      if (selectedRow) {
                        handleChangeTopic(selectedRow)
                      }
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: theme.palette.background.paper,
                        '& fieldset': {
                          borderColor: theme.palette.divider,
                        },
                        '&:hover fieldset': {
                          borderColor: theme.palette.primary.light,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.palette.primary.main,
                        },
                      }
                    }}
                  >
                    {courseData?.units?.map((row) => (
                      <MenuItem key={row.id} value={row?.title}>
                        {row?.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Chart Area */}
              <Box sx={{ p: 3 }}>
                {selectedTopic ? (
                  <Fade in timeout={300}>
                    <Box>
                      <Box sx={{ 
                        p: 2, 
                        mb: 2,
                        background: theme.palette.mode === 'light' 
                          ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                          : `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                        color: theme.palette.primary.contrastText,
                        borderRadius: 2
                      }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                          Gap Analysis: {selectedTopic}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Skills assessment visualization
                        </Typography>
                      </Box>
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 2, 
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 2,
                          backgroundColor: theme.palette.background.paper
                        }}
                      >
                        <div ref={chartRef}>
                          <LearnerProgressChart
                            learnerData={selectedCourse?.course}
                            selectedTopic={selectedTopic}
                          />
                        </div>
                      </Paper>
                    </Box>
                  </Fade>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <AssessmentIcon sx={{ 
                      fontSize: 64, 
                      color: theme.palette.action.disabled,
                      mb: 2
                    }} />
                    <Typography variant="h6" sx={{ mb: 1, color: theme.palette.text.secondary }}>
                      No Topic Selected
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      Please select a topic to view the gap analysis chart
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Legend Section */}
        <Card
          elevation={0}
          sx={{
            width: '350px',
            borderRadius: 2,
            background: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            overflow: "hidden",
            height: 'fit-content',
            position: 'sticky',
            top: 20
          }}
        >
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ 
              p: 2, 
              background: theme.palette.mode === 'light' 
                ? theme.palette.grey[50] 
                : theme.palette.background.default,
              borderBottom: `1px solid ${theme.palette.divider}`
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ListIcon sx={{ 
                  fontSize: 20, 
                  color: theme.palette.primary.main
                }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Skills Legend
                </Typography>
              </Box>
            </Box>
            <Box sx={{ maxHeight: '500px', overflowY: 'auto', p: 2 }}>
              {courseData?.units?.map((row, index) => (
                <Box key={row.id} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Chip
                      label={index + 1}
                      size="small"
                      sx={{
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                        fontWeight: 600,
                        minWidth: '24px',
                        height: '24px'
                      }}
                    />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {row?.title}
                    </Typography>
                  </Box>
                  <Box sx={{ pl: 3 }}>
                    {row?.subUnit?.map((item, subIndex) => (
                      <Box 
                        key={item.id} 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1, 
                          mb: 0.5,
                          p: 0.5,
                          borderRadius: 1,
                          backgroundColor: theme.palette.mode === 'light' 
                            ? theme.palette.grey[50] 
                            : theme.palette.background.default,
                          '&:hover': {
                            backgroundColor: theme.palette.action.hover
                          }
                        }}
                      >
                        <Box sx={{ 
                          width: 6, 
                          height: 6, 
                          borderRadius: '50%', 
                          backgroundColor: theme.palette.primary.main,
                          flexShrink: 0
                        }} />
                        <Typography variant="body2" sx={{ fontSize: '1rem', lineHeight: 1.3 }}>
                          {item?.subTitle}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}

export default ViewResults
