import React from "react";
import Style from "./style.module.css";
import Home from "./home";

const MainPageContent = () => {
  return (
    <>
    <Home/>
      {/* <div>
        <div className="flex flex-col justify-evenly py-24 items-center bg-[#F9F9FD] sm:flex-row">

          <div className="w-full p-4 px-20 sm:w-1/3">
            <p className="font-bold">
              Welcome to{" "}
              <span className="inline-block bg-[#6D81A3] p-4 rounded text-white">
                LOCKER
              </span>
            </p>

            <h2 className="text-3xl font-extrabold mt-12 sm:text-4xl lg:text-5xl">
              NEXT GENERATION <br/>E-PORTFOLIO SOFTWARE
            </h2>

            <p className="mt-12 text-justify break-words">
            Locker is an electronic collection of a learner’s skills and knowledge, which is assessed by their tutor against a training standard or qualification and replaces paper portfolios.
            </p>
          </div>

          <div className="w-full p-4 px-20 sm:w-1/3">
            <img
              src="assets/images/svgImage/landing1.svg"
              alt="img1"
              className="w-full h-auto"
            />
          </div>
        </div>

        <div className="flex flex-col-reverse justify-evenly py-24 items-center sm:flex-row">
          <div className="w-full p-4 px-20 sm:w-1/4">
            <img
              src="assets/images/svgImage/landing2.svg"
              alt="img1"
              className="w-full h-auto"
            />
          </div>
          <div className="w-full p-4 px-20 sm:w-2/4">
            <h2 className="text-3xl font-extrabold mt-2 sm:text-4xl lg:text-5xl">
            Trainer and tutor can track learner progress dynamically
            </h2>

            <p className="mt-12 text-justify">
            Empower educators with comprehensive tools for dynamic learner progress monitoring, ensuring timely completion of educational milestones. Our platform provides real-time insights, enabling proactive guidance and support to optimize learning outcomes effectively. With intuitive features and robust analytics, educators can efficiently track progress and intervene when needed, fostering a conducive environment for student success.
            </p>

          </div>
        </div>

        <div className={Style.features_container} id="features">
          <div className={Style.features_list}>
            <div className={Style.features}>
              <h2>Features</h2>
            </div>
            <ol>
              <li>Bespoke Management Reporting</li>
              <li>Online Enrolments- Free template provided</li>
              <li>Form creations- ILP, Reviews, Learning Plans</li>
              <li>Video Teaching and Learning Resources for all courses</li>
              <li>Robust IQA functionality</li>
              <li>API Integration</li>
              <li>Easy-to-use platform can be accessed on multiple devices</li>
              <li>Progress tracking with visual gap analysis</li>
              <li>Intuitive Layout that is user-friendly</li>
              <li>Learner Forums</li>
            </ol>
          </div>
          <div className={Style.features_img_div}>
            <img
              src="assets/images/svgImage/landing3.svg"
              alt="Features"
              className={Style.features_img}
            />
          </div>
        </div>
        <div className={Style.whylocker_container}>
          <div className={Style.why_img_div}>
            <img
              src="assets/images/svgImage/landing4.svg"
              alt="Why Locker"
              className={Style.why_img}
            />
          </div>
          <div className={Style.whylocker_list} id="why-locker">
            <div className={Style.whylocker}>
              <h2>Why Locker?</h2>
            </div>
            <ol>
              <li>Ofsted and ESFA compliance</li>
              <li>Real time skills assessment</li>
              <li>Engaging all users</li>
              <li>Created by industry experts</li>
            </ol>
          </div>
        </div>
      </div> */}
    </>
  );
};

export default MainPageContent;
