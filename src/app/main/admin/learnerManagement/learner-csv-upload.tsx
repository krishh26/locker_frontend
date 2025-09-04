import React, { useState } from 'react'
import { FileUploader } from 'react-drag-drop-files'
import { useDispatch } from 'react-redux'
import Papa from 'papaparse'
import { createAssignmentAPI } from 'app/store/assignment'
import { useNavigate } from 'react-router-dom'
import {
  SecondaryButton,
  SecondaryButtonOutlined,
} from 'src/app/component/Buttons'
import { useUploadLearnerDataMutation } from 'app/store/api/learner-plan-api'
import { showMessage } from 'app/store/fuse/messageSlice'

// Function to convert date from DD-MM-YYYY to YYYY-MM-DD format
const convertDateFormat = (dateString: string): string => {
  if (!dateString || typeof dateString !== 'string') return dateString
  
  // Check if the date is already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString
  }
  
  // Convert from DD-MM-YYYY to YYYY-MM-DD
  const parts = dateString.split('-')
  if (parts.length === 3) {
    const [day, month, year] = parts
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }
  
  return dateString
}

// Function to generate password for learners
const generatePassword = (
  firstName: string,
  surname: string,
  mobile: string
): string => {
  const firstInitial = firstName?.charAt(0)?.toUpperCase() || 'U'
  const surnameInitial = surname?.charAt(0)?.toUpperCase() || 'U'
  
  // Extract last 4 digits from mobile number
  const mobileDigits = mobile?.replace(/\D/g, '') || '0000'
  const lastFourDigits = mobileDigits.slice(-4).padStart(4, '0')
  
  // Create password pattern: FirstInitial + SurnameInitial + Last4Digits + @
  // Example: John Smith with mobile 1234567890 becomes "JS7890@"
  return `${firstInitial}${surnameInitial}${lastFourDigits}@`
}

// Function to download sample CSV
const downloadSampleCSV = () => {
  const headers = [
    'FirstNames',
    'Surname', 
    'Email',
    'Mobile',
    'NINumber',
    'Courses',
    'StartDate',
    'ExpectedEnd',
    'TrainerFullName',
    'EmployeeFullName',
    'IQAFullName'
  ]
  
  
  const csvContent = [headers].map(row => 
    row.map(field => `"${field}"`).join(',')
  ).join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', 'learner_sample.csv')
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const UploadWorkDialog = ({ handleClose }) => {
  const dispatch: any = useDispatch()
  const navigate = useNavigate()
  const fileTypes = ['CSV']
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<any[]>([])
  const [error, setError] = useState<string>('')

  const requiredFields = ['FirstNames', 'Surname', 'Courses']

  const [uploadLearnerData, { isLoading }] = useUploadLearnerDataMutation()

  const handleChange = (file: File) => {
    setFile(file)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as any[]

        // ✅ validation for required fields
        const invalidRow = rows.find((row) =>
          requiredFields.some(
            (field) => !row[field] || row[field].toString().trim() === ''
          )
        )

        if (invalidRow) {
          setError(
            'Some learner details are missing. Please check that every row includes First Names, Surname, and Courses.'
          )
          setParsedData([])
        } else {
          setError('')
          setParsedData(
            rows.map((row) => {
              return {
                first_name: row['FirstNames'],
                last_name: row.Surname,
                courses: row.Courses
                  ? row.Courses.split(',').map((course: string) => {
                      return {
                        start_date: convertDateFormat(row.StartDate),
                        course_name: course,
                        end_date: convertDateFormat(row.ExpectedEnd),
                        trainer_name: row.TrainerFullName,
                        iqa_name: row.IQAFullName,
                        employer_name: row?.EmployeeFullName || '',
                      }
                    })
                  : [],
                user_name: `${row['FirstNames']?.toLowerCase() || ''}_${
                  row.Surname?.toLowerCase() || ''
                }`
                  .replace(/\s+/g, '_')
                  .replace(/^_+|_+$/g, ''),
                email: row.Email,
                mobile: row.Mobile,
                password: generatePassword(
                  row['FirstNames'],
                  row.Surname,
                  row.Mobile
                ),
                confirmPassword: generatePassword(
                  row['FirstNames'],
                  row.Surname,
                  row.Mobile
                ),
                national_ins_no: row.NINumber,
                funding_body: '',
                employer_name: row?.EmployeeFullName || '',
              }
            })
          )
        }
      },
    })
  }

  const uploadHandler = async () => {
    if (!file) return
    if (parsedData.length === 0) {
      setError('No valid data found. Please upload a proper CSV file.')
      return
    }

    const payload = {
      learners: parsedData,
    }

    try {
      const response = await uploadLearnerData(payload).unwrap()
      if (response.status) {
        dispatch(
          showMessage({
            variant: 'success',
            message: 'Upload Learner Data Successfully.',
          })
        )
        handleClose()
      }
    } catch {
      console.error('Error uploading file:', 'File upload failed')
      dispatch(showMessage({ message: 'File upload failed', variant: 'error' }))
      return
    }
  }

  return (
    <div className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 p-[20px] rounded-xl border border-gray-200 dark:border-gray-700 max-w-3xl w-full shadow-2xl z-50 backdrop-blur-sm'>
      {/* Header */}
      <div className='flex items-center justify-between mb-8'>
        <div>
          <h2 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>Upload Learner CSV</h2>
          <p className='text-gray-600 dark:text-gray-400 text-base'>Upload learner data in bulk using CSV format</p>
        </div>
        <button
          onClick={handleClose}
          className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-200 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full'
        >
          <svg className='w-[20px] h-[20px]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
          </svg>
        </button>
      </div>

      {/* Sample CSV Download */}
      <div className='bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6 mb-8 shadow-sm'>
        <div className='flex items-center justify-between'>
          <div className='flex items-start gap-4 w-1/2'>
            <div className='bg-blue-100 dark:bg-blue-800 p-3 rounded-lg'>
              <svg className='w-[20px] h-[20px] text-blue-600 dark:text-blue-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
              </svg>
            </div>
            <div>
              <h3 className='font-bold text-blue-900 dark:text-blue-100 text-lg mb-2'>Need a sample CSV?</h3>
              <p className='text-blue-700 dark:text-blue-300 text-sm leading-relaxed'>Download our template with all required fields and sample data to ensure proper formatting</p>
            </div>
          </div>
          <button
            onClick={downloadSampleCSV}
            className='bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
          >
            <svg className='w-[20px] h-[20px]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
            </svg>
            Download Sample CSV
          </button>
        </div>
      </div>

      {/* File Upload Area */}
      <div className='mb-8'>
        <FileUploader
          children={
            <div className='border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-10 text-center hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/10 dark:hover:to-indigo-900/10 transition-all duration-300 cursor-pointer group'>
              <div className='flex justify-center mb-6'>
                <div className='bg-gray-100 dark:bg-gray-800 p-4 rounded-full group-hover:bg-blue-100 dark:group-hover:bg-blue-800 transition-colors duration-300'>
                  <img
                    src='assets/images/svgImage/uploadimage.svg'
                    alt='Upload'
                    className='w-16 h-16 group-hover:scale-110 transition-transform duration-300'
                  />
                </div>
              </div>
              {file ? (
                <div className='space-y-3'>
                  <div className='bg-green-100 dark:bg-green-900/30 p-4 rounded-lg border border-green-200 dark:border-green-700'>
                    <p className='text-lg font-semibold text-green-800 dark:text-green-200'>{file.name}</p>
                    <p className='text-sm text-green-600 dark:text-green-400'>File size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
              ) : (
                <div className='space-y-4'>
                  <h3 className='text-xl font-semibold text-gray-800 dark:text-gray-200'>
                    Drag and drop your CSV file here or{' '}
                    <span className='text-blue-600 dark:text-blue-400 font-bold'>Browse</span>
                  </h3>
                  <p className='text-gray-600 dark:text-gray-400 text-base'>Max 10MB files are allowed</p>
                  <div className='flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400'>
                    <svg className='w-[20px] h-[20px]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                    Supported format: CSV only
                  </div>
                </div>
              )}
            </div>
          }
          handleChange={handleChange}
          name='file'
          types={fileTypes}
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className='bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-700 rounded-xl p-5 mb-6 shadow-sm'>
          <div className='flex items-center gap-3'>
            <div className='bg-red-100 dark:bg-red-800 p-2 rounded-lg'>
              <svg className='w-[20px] h-[20px] text-red-600 dark:text-red-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
            </div>
            <p className='text-red-700 dark:text-red-300 text-sm font-medium'>{error}</p>
          </div>
        </div>
      )}

      {/* File Info */}
      {file && parsedData.length > 0 && (
        <div className='bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-xl p-5 mb-6 shadow-sm'>
          <div className='flex items-center gap-3'>
            <div className='bg-green-100 dark:bg-green-800 p-2 rounded-lg'>
              <svg className='w-[20px] h-[20px] text-green-600 dark:text-green-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
              </svg>
            </div>
            <div>
              <p className='text-green-700 dark:text-green-300 text-sm font-medium'>
                <span className='font-bold text-lg'>{parsedData.length}</span> learners found and ready to upload
              </p>
              <p className='text-green-600 dark:text-green-400 text-xs mt-1'>All required fields are properly formatted</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className='flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700'>
        <SecondaryButtonOutlined
          name='Cancel'
          onClick={handleClose}
        />
        <SecondaryButton
          name={isLoading ? 'Uploading...' : 'Upload Learners'}
          onClick={uploadHandler}
          disable={!file || parsedData.length === 0 || isLoading}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}

export default UploadWorkDialog
