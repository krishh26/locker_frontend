import React from "react";
import { Card } from "src/app/component/Cards";
import { HomePageData } from "src/app/contanst";
import Style from "./style.module.css";
import TableEQA1 from "./tableEQA1";
import TableEQA2 from "./tableEQA2";
import Portfolio from "../portfolio/portfolio";
import { useCurrentUser } from "src/app/utils/userHelpers";

const Home = () => {
  const user = useCurrentUser();

  const role = user?.role;
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
        {HomePageData?.map((item, index) => (
          <Card
            name={item?.name}
            isIcon={item?.isIcon}
            title={item?.title}
            color={item?.color}
            textColor={item?.textColor}
            radiusColor={item?.radiusColor}
            key={index.toString()}
          />
        ))}
      </div>
    </>
  );
};

export default Home;
