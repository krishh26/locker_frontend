import React, { useEffect } from "react";
import { Card } from "src/app/component/Cards";
import { HomePageData } from "src/app/contanst";
import Style from "./style.module.css";
import TableEQA1 from "./tableEQA1";
import TableEQA2 from "./tableEQA2";
import Portfolio from "../portfolio/portfolio";
import { useCurrentUser } from "src/app/utils/userHelpers";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchHomePageCounts,
  fetchCardData,
  exportCardData,
  selectHomePage,
} from "src/app/store/homePage";

// Mapping of card titles to API types
const cardTypeMapping: { [key: string]: string } = {
  "Active learner": "active_learners_count",
  "Learners on bil": "learners_suspended_count",
  "Overdue learners": "learnersOverDue_count",
  "Overdue progress review": "learnerPlanDue_count",
  "Learners due complete in next 30 days": "learnersCourseDueInNext30Days_count",
  "Learners off track": "assignmentsWithoutMapped_count",
  "Unmapped evidences": "assignmentsWithoutMapped_count",
  "Due IQA action in next 30 days": "sessionLearnerActionDue_count",
  "Due session in next 7 days": "sessionLearnerActionDueInNext7Days_count",
  "Overdue IQA action": "sessionLearnerActionOverdue_count",
  "Outstanding IQA actions": "sessionLearnerActionOverdue_count",
  "Actions due in the next 7 days": "sessionLearnerActionDueInNext7Days_count",
  "Learner all a sampling plan": "learnerPlanDueInNext7Days_count",
  "Learner not all a sampling plan": "learnerPlanDueInNext7Days_count",
};

const Home = () => {
  const user = useCurrentUser();
  const dispatch = useDispatch<any>();
  const { counts, loading, exporting, fetchingData } = useSelector(selectHomePage);
  const role = user?.role;

  // Fetch counts on page load (without type parameter)
  useEffect(() => {
    if (role !== "EQA" && role !== "Learner") {
      dispatch(fetchHomePageCounts());
    }
  }, [role, dispatch]);

  // Handle card click to fetch full data
  const handleCardClick = (title: string) => {
    const apiType = cardTypeMapping[title];
    if (apiType && !fetchingData[apiType]) {
      dispatch(fetchCardData(apiType));
    }
  };

  // Handle export for a specific card
  const handleExport = (title: string, type: string) => {
    dispatch(exportCardData(type, title));
  };

  if (role === "EQA") {
    return (
      <>
        <TableEQA1 />
        <TableEQA2 />
      </>
    );
  }
  if (role === "Learner") {
    return (
      <>
        <Portfolio />
      </>
    );
  }
  return (
    <>
      <div className={Style.home_card}>
        {HomePageData?.map((item, index) => {
          const apiType = cardTypeMapping[item.title];
          // Get count from Redux store, fallback to default name
          const count = apiType && counts[apiType] !== undefined
            ? counts[apiType].toString()
            : (typeof item.name === "string" ? item.name : "0");
          const isExporting = apiType ? exporting[apiType] || false : false;
          const isFetching = apiType ? fetchingData[apiType] || false : false;

          return (
            <Card
              name={loading ? "..." : count}
              isIcon={item?.isIcon}
              title={item?.title}
              color={item?.color}
              textColor={item?.textColor}
              radiusColor={item?.radiusColor}
              key={index.toString()}
              onClick={apiType ? () => handleCardClick(item.title) : undefined}
              onExport={
                apiType
                  ? () => handleExport(item.title, apiType)
                  : undefined
              }
              isExporting={isExporting}
              isFetching={isFetching}
              showExport={!!apiType && counts[apiType] > 0}
            />
          );
        })}
      </div>
    </>
  );
};

export default Home;
