import { Card, FormControl, Grid, MenuItem, Select, Typography } from '@mui/material'
import { selectLearnerManagement } from 'app/store/learnerManagement';
import { selectSkillsScan } from 'app/store/skillsScan';
import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux';
import { SecondaryButton } from 'src/app/component/Buttons';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import generatePDF, { Resolution, Margin, Options } from "react-to-pdf";


const pdfOptions: Options = {
    filename: "Learner-Skill-Scan.pdf",
    method: "save",
    resolution: Resolution.MEDIUM,
    page: {
        margin: Margin.SMALL,
        format: "letter",
        orientation: "landscape"
    },
    canvas: {
        mimeType: "image/jpeg",
        qualityRatio: 1
    },
    overrides: {
        pdf: {
            compress: true
        },
        canvas: {
            useCORS: true
        }
    }
};

const LineChart = ({ data }) => {
    console.log(data)
    const labels = data.map(a => a.name)

    const chartData = {
        labels,
        datasets: [
            {
                label: 'Your rating',
                data: data.map(a => a.rating),
                fill: false,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 1)',
                tension: 0.1,
                pointBackgroundColor: 'rgba(75, 192, 192, 1)',
                pointBorderColor: 'rgba(75, 192, 192, 1)',
            },
        ],
    };

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
                                return '☹️';
                            case 2:
                                return '😖';
                            case 3:
                                return '🙂';
                            case 4:
                                return '😁';
                            default:
                                return value;
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
    };

    return (
        <div>
            <Line data={chartData} options={options} />
        </div>
    );
};

const getTargetElement = () => document.getElementById("results-container");

const downloadPdf = () => generatePDF(getTargetElement, pdfOptions);

const ViewResults = () => {

    const { singleData } = useSelector(selectSkillsScan);
    const { courseData } = useSelector(selectLearnerManagement);


    const [result, setResult] = useState([]);

    const handleChangeYear = (data) => {
        setResult(data.subUnit)
    }
    return (
        <Grid className=' m-10 px-10 pt-10'>
            <Grid >
                <Typography className='h3'>Results chart for Daniel Stefan Ciapa</Typography>
            </Grid>
            <Grid className=' flex gap-28'>
                <Grid className='w-1/2'>
                    <FormControl fullWidth size="small" className='pt-20'>
                        <Select
                            labelId="year-select-label"
                            id="year-select"
                            name="year"
                        >
                            {courseData.units?.map((row) => (
                                <MenuItem key={row} value={row?.title}
                                    onClick={() => handleChangeYear(row)}
                                >
                                    {row?.title}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <div id="results-container">
                        <Card className=' mt-20 rounded-0 p-10 bg-grey-200'>
                            <Typography className='h4 font-600'>Gap Analysis</Typography>
                        </Card>

                        <LineChart data={result.map(a => ({ rating: a.rating, name: a.subTitle }))} />
                    </div>

                    <div id="results-container">
                        <Card className=' mt-20 rounded-0 p-10 bg-grey-200'>
                            <Typography className='h4 font-600'>Gap Analysis</Typography>
                        </Card>

                        <LineChart data={result.map(a => ({ rating: a.rating, name: a.subTitle }))} />
                    </div>

                </Grid>
                <Grid className='w-1/2' >
                    <Grid className="flex justify-start items-end my-20 mr-24 gap-10">
                        <Grid>
                            <SecondaryButton name="Save" />
                        </Grid>
                        <Grid>
                            <SecondaryButton name="Next" />
                        </Grid>
                        <Grid>
                            <SecondaryButton name="Download PDF" onClick={downloadPdf} />
                        </Grid>
                    </Grid>
                    <Card className=' mt-20 rounded-0 p-10 bg-grey-200'>
                        <Typography className='h4 font-600'>Resources</Typography>
                    </Card>
                    <Grid>
                        <Card className=' mt-20 rounded-0 p-10 bg-grey-200'>
                            <Typography className='h4 font-600'>Legend</Typography>
                        </Card>
                        <Card className='rounded-0 p-10'>
                            {courseData.units?.map((row) => (
                                <Grid>
                                    <Typography>{row?.title}</Typography>
                                </Grid>
                            ))}
                        </Card>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    )
}

export default ViewResults