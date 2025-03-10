import { Avatar, Tooltip } from '@mui/material'
import { fetchAllLearnerByUserAPI, selectCourseManagement } from 'app/store/courseManagement'
import { selectUser } from 'app/store/userSlice'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import DoughnutChart from 'src/app/component/Chart/doughnut'
import { selectstoreDataSlice, slice } from 'app/store/reloadData'
import { slice as courseSlice } from "app/store/courseManagement";
import { portfolioCard } from 'src/app/contanst'
import { PortfolioCard } from 'src/app/component/Cards'
import { getRandomColor } from 'src/utils/randomColor'


const Protfolio = ({ learner, handleClickData, handleClickSingleData }) => {

  return (
    <>
      <div className="m-24 flex flex-col items-center border-1 rounded-8 py-12 bg-[#e8e8e882]">
        <div className="flex w-full justify-evenly items-center border-r-1">
          <div>
            <Avatar sx={{ width: 70, height: 70, bgcolor: getRandomColor(learner?.first_name?.toLowerCase().charAt(0)) }}
              src={learner?.learner_id ? learner?.avatar : learner.data.avatar?.url}
              alt={learner?.first_name?.toUpperCase()?.charAt(0)}
            />
            <div className="mt-10">
              {learner?.first_name} {learner?.last_name}
            </div>
          </div>
          {portfolioCard?.map((value, index) => (
            <PortfolioCard data={value} index={index} key={value.id} learner={learner} handleClickData={handleClickData} />
          ))}
        </div>
        <div className="p-4 flex flex-col items-center w-full">
          {learner?.course?.length ? (
            <>
              <div className="text-center text-xl border-b-1 w-4/5 pb-4">
                Courses
              </div>
              <div className="mt-12 ml-12 mr-auto flex items-center gap-12">
                {learner?.course?.map((value) => (
                  <div className=" w-fit">
                    <Tooltip title={value?.course?.course_name}>
                      <Link
                        to="/portfolio/learnertodata"
                        style={{
                          color: "inherit",
                          textDecoration: "none",
                        }}
                        onClick={(e) => {
                          handleClickSingleData(value)
                          handleClickData(learner.learner_id, learner.user_id)
                        }}
                      >
                        <DoughnutChart value={value} />
                      </Link>
                    </Tooltip>

                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center opacity-50">
              No courses assigned
            </div>
          )}
        </div>
      </div >
    </>
  )
}

const LearnerOverview = () => {

  const { data } = useSelector(selectUser)
  const { learnerOverView } = useSelector(selectCourseManagement)

  const dispatch: any = useDispatch()

  useEffect(() => {
    if (data.user_id && data.role) {
      dispatch(fetchAllLearnerByUserAPI(data.user_id, data.role))
    }
  }, [data]);

  const handleClickData = (id, user_id) => {
    dispatch(slice.setLeanerId({ id, user_id }))
  }

  const handleClickSingleData = (row) => {
    dispatch(courseSlice.setSingleData(row));
  };

  return (
    <div>
      {learnerOverView?.map(item => <Protfolio learner={item} handleClickSingleData={handleClickSingleData} handleClickData={handleClickData} />)}
    </div>
  )
}

export default LearnerOverview
