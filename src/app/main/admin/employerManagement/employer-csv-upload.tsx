import React, { useState } from 'react'
import { FileUploader } from 'react-drag-drop-files'
import { useDispatch } from 'react-redux'
import Papa from 'papaparse'
import { useNavigate } from 'react-router-dom'
import {
  SecondaryButton,
  SecondaryButtonOutlined,
} from 'src/app/component/Buttons'
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

// Function to download sample CSV
const downloadSampleCSV = () => {
  const headers = [
    'CompanyName',
    'MSIEmployerID',
    'BusinessDepartment',
    'BusinessLocation',
    'BranchCode',
    'Address1',
    'Address2',
    'City',
    'County',
    'Country',
    'Postcode',
    'BusinessCategory',
    'NumberOfEmployees',
    'Telephone',
    'Website',
    'KeyContactName',
    'KeyContactNumber',
    'Email',
    'BusinessDescription',
    'Comments',
    'AssessmentDate',
    'AssessmentRenewalDate',
    'InsuranceRenewalDate',
  ]

  const sampleData = [
    'ABC Company Ltd - Test',
    'MSI001',
    'IT Department',
    'London Office',
    'LON001',
    '123 Business Street',
    'Suite 100',
    'London',
    'Greater London',
    'United Kingdom',
    'SW1A 1AA',
    'Technology',
    '50-100',
    '+44 20 7123 4567',
    'https://www.abccompany.com',
    'John Smith',
    '+44 20 7123 4568',
    'contactTest@abccompany.com',
    'Leading technology solutions provider',
    'Regular client with good payment history',
    '01-01-2024',
    '01-01-2025',
    '01-01-2025',
  ]

  const csvContent = [headers, sampleData]
    .map((row) => row.map((field) => `"${field}"`).join(','))
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', 'employer_sample.csv')
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const UploadEmployerDialog = ({ handleClose, refetchEmployer }) => {
  const dispatch: any = useDispatch()
  const navigate = useNavigate()
  const fileTypes = ['CSV']
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<any[]>([])
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const requiredFields = ['CompanyName', 'MSIEmployerID']

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
            'Some employer details are missing. Please check that every row includes Company Name, MSIEmployerID.'
          )
          setParsedData([])
        } else {
          setError('')
          setParsedData(
            rows.map((row) => {
              return {
                employer_name: row['CompanyName'],
                msi_employer_id: row['MSIEmployerID'] || '',
                business_department: row['BusinessDepartment'] || '',
                business_location: row['BusinessLocation'] || '',
                branch_code: row['BranchCode'] || '',
                address_1: row['Address1'] || '',
                address_2: row['Address2'] || '',
                city: row['City'] || '',
                county: row['County'] || '',
                country: row['Country'] || '',
                postal_code: row['Postcode'] || '',
                business_category: row['BusinessCategory'] || '',
                number_of_employees: row['NumberOfEmployees'] || '',
                telephone: row['Telephone'],
                website: row['Website'] || '',
                key_contact_name: row['KeyContactName'] || '',
                key_contact_number: row['KeyContactNumber'] || '',
                email: row['Email'],
                business_description: row['BusinessDescription'] || '',
                comments: row['Comments'] || '',
                assessment_date: convertDateFormat(row['AssessmentDate'] || ''),
                assessment_renewal_date: convertDateFormat(
                  row['AssessmentRenewalDate'] || ''
                ),
                insurance_renewal_date: convertDateFormat(
                  row['InsuranceRenewalDate'] || ''
                ),
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

    setIsLoading(true)

    try {
      // Try bulk upload first
      const { bulkCreateEmployerAPI } = await import('app/store/employer')
      const payload = {
        employers: parsedData,
      }

      const response = await dispatch(bulkCreateEmployerAPI(payload))

      if (response && response.status) {
        dispatch(
          showMessage({
            variant: 'success',
            message: `Successfully uploaded ${parsedData.length} employers.`,
          })
        )
        handleClose()
        refetchEmployer()
      } 
    } catch (err) {
      console.error('Error uploading file:', err)
      dispatch(showMessage({ message: 'File upload failed', variant: 'error' }))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 p-[20px] rounded-xl border border-gray-200 dark:border-gray-700 max-w-3xl w-full shadow-2xl z-50 backdrop-blur-sm'>
      {/* Header */}
      <div className='flex items-center justify-between mb-8'>
        <div>
          <h2 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>
            Upload Employer CSV
          </h2>
          <p className='text-gray-600 dark:text-gray-400 text-base'>
            Upload employer data in bulk using CSV format
          </p>
        </div>
        <button
          onClick={handleClose}
          className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-200 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full'
        >
          <svg
            className='w-[20px] h-[20px]'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M6 18L18 6M6 6l12 12'
            />
          </svg>
        </button>
      </div>

      {/* Sample CSV Download */}
      <div className='bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6 mb-8 shadow-sm'>
        <div className='flex items-center justify-between'>
          <div className='flex items-start gap-4 w-1/2'>
            <div className='bg-blue-100 dark:bg-blue-800 p-3 rounded-lg'>
              <svg
                className='w-[20px] h-[20px] text-blue-600 dark:text-blue-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                />
              </svg>
            </div>
            <div>
              <h3 className='font-bold text-blue-900 dark:text-blue-100 text-lg mb-2'>
                Need a sample CSV?
              </h3>
              <p className='text-blue-700 dark:text-blue-300 text-sm leading-relaxed'>
                Download our template with all required fields and sample data
                to ensure proper formatting
              </p>
            </div>
          </div>
          <button
            onClick={downloadSampleCSV}
            className='bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
          >
            <svg
              className='w-[20px] h-[20px]'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
              />
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
                    <p className='text-lg font-semibold text-green-800 dark:text-green-200'>
                      {file.name}
                    </p>
                  </div>
                </div>
              ) : (
                <div className='space-y-4'>
                  <h3 className='text-xl font-semibold text-gray-800 dark:text-gray-200'>
                    Drag and drop your CSV file here or{' '}
                    <span className='text-blue-600 dark:text-blue-400 font-bold'>
                      Browse
                    </span>
                  </h3>
                  <p className='text-gray-600 dark:text-gray-400 text-base'>
                    Max 10MB files are allowed
                  </p>
                  <div className='flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400'>
                    <svg
                      className='w-[20px] h-[20px]'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                      />
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
              <svg
                className='w-[20px] h-[20px] text-red-600 dark:text-red-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            </div>
            <p className='text-red-700 dark:text-red-300 text-sm font-medium'>
              {error}
            </p>
          </div>
        </div>
      )}

      {/* File Info */}
      {file && parsedData.length > 0 && (
        <div className='bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-xl p-5 mb-6 shadow-sm'>
          <div className='flex items-center gap-3'>
            <div className='bg-green-100 dark:bg-green-800 p-2 rounded-lg'>
              <svg
                className='w-[20px] h-[20px] text-green-600 dark:text-green-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M5 13l4 4L19 7'
                />
              </svg>
            </div>
            <div>
              <p className='text-green-700 dark:text-green-300 text-sm font-medium'>
                <span className='font-bold text-lg'>{parsedData.length}</span>{' '}
                employers found and ready to upload
              </p>
              <p className='text-green-600 dark:text-green-400 text-xs mt-1'>
                All required fields are properly formatted
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className='flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700'>
        <SecondaryButtonOutlined name='Cancel' onClick={handleClose} />
        <SecondaryButton
          name={isLoading ? 'Uploading...' : 'Upload Employers'}
          onClick={uploadHandler}
          disable={!file || parsedData.length === 0 || isLoading}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}

export default UploadEmployerDialog
