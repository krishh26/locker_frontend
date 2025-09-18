import React from 'react'
import { SecondaryButtonOutlined } from 'src/app/component/Buttons'

interface ActionButtonsProps {
  onCreatePassword: () => void
  onEmailReset: () => void
  onCreateEmployer: () => void
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onCreatePassword,
  onEmailReset,
  onCreateEmployer,
}) => {
  return (
    <div className='flex gap-5 items-center justify-start'>
      <SecondaryButtonOutlined
        className='bg-[#46c2c5] !text-white hover:bg-[#37a1a3]'
        name='Create New Password'
        onClick={onCreatePassword}
      />
      <SecondaryButtonOutlined
        className='bg-[#46c2c5] !text-white hover:bg-[#37a1a3]'
        name='Email Password Reset'
        onClick={onEmailReset}
      />
      {/* <SecondaryButtonOutlined
        className='bg-[#46c2c5] !text-white hover:bg-[#37a1a3]'
        name='Create Employer'
        onClick={onCreateEmployer}
      /> */}
    </div>
  )
}

export default ActionButtons
