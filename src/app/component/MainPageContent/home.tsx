import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { CardActionArea } from "@mui/material";
import Style from "./style.module.css";
import { Button } from "@mui/material";

const Home = () => {
  return (
    <>
      <div className={Style.home_img}>
        <div className={Style.home_text}>
          <div className="w-full p-4">
            <p className="font-semibold`">
              Welcome to{" "}
              <span className="w-96 text-center font-bold text-lg inline-block bg-[#ffffff] p-4 rounded text-black">
                LOCKER
              </span>
            </p>

            <h2 className="text-3xl font-extrabold mt-12 sm:text-4xl lg:text-5xl">
              SMART APPRENTICES MANAGEMENT SOFTWARE
            </h2>

            <p className="text-base mt-12 text-justify break-words">
              Supporting apprentices from enrollment to assessment with a top-tier ePortfolio platform, empowering tutors and assessors to deliver exceptional training and tracking.
            </p>

          </div>
        </div>
      </div>

      <div className="flex flex-col relative justify-evenly py-24 items-center overflow-hidden bg-[#ffffff] sm:flex-row">
        <div className="top-0 left-0 absolute z-10">
          <img
            src="assets/images/svgImage/bg-design.svg"
            alt="img1"
            className="w-3/4 "
          />
        </div>

        <div className="w-full p-4 px-20 sm:w-1/4 relative z-20">
          <img
            src="assets/images/homePage/meeting.svg"
            alt="img1"
            className="w-full h-auto"
          />
        </div>

        <div className="w-full p-4 px-20 sm:w-2/5">
          <h2 className=" uppercase text-3xl font-bold mt-12 sm:text-3xl lg:text-3xl">
            Empower Your Management with Custom Insights
          </h2>

          <p className="mt-12 text-justify break-words">
            Discover the power of personalized management reporting with our platform. Our bespoke analytics and detailed reports provide deep insights tailored to your specific business needs. By offering actionable data and trends, our system helps you make informed decisions that drive growth and efficiency. Empower your management team with the tools they need to optimize performance and achieve strategic goals
          </p>

          <div className={`${Style.icons} py-20`}>
            <div className="flex flex-row items-center pr-20">
              <div className={`${Style.icons_svg}w-full p-14 pr-20 sm:w-1/4`}>
                <img
                  src="assets/icons/shoping.svg"
                  alt="img1"
                  className="w-full h-auto"
                />
              </div>

              <div className="w-3/5">
                <h2 className="text-base font-bold mt-12">
                  Lorem ipsum context
                </h2>

                <p className="text-sm mt-12 text-justify break-words">
                  Explode your sales by working closely with our experienced.
                </p>
              </div>
            </div>

            <div className="flex flex-row items-center">
              <div className={`${Style.icons_svg}w-full p-14 pr-20 sm:w-1/4`}>
                <img
                  src="assets/icons/store.svg"
                  alt="img1"
                  className="w-full h-auto"
                />
              </div>

              <div className="w-3/5">
                <h2 className="text-base font-bold mt-12">
                  Lorem ipsum context
                </h2>

                <p className="text-sm mt-12 text-justify break-words">
                  Explode your sales by working closely with our experienced.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`${Style.features} text-white relative flex flex-col justify-evenly py-24 items-center bg-[#6D81A3] sm:flex-row`}
      >
        <div className="bottom-0 left-0 absolute">
          <img
            src="assets/images/svgImage/bg-design1.svg"
            alt="img1"
            className="h-full"
          />
        </div>

        <div className="absolute top-0 right-0 ">
          <img src="assets/images/svgImage/bg-design2.svg" alt="img1" />
        </div>

        <div className="w-full p-4 px-20 sm:w-2/5">

          <h2 className=" uppercase text-3xl font-bold mt-12 sm:text-3xl lg:text-3xl">
            Features
          </h2>
          <ul className="list-disc list-outside">
            <li className="p-5">Bespoke Management Reporting</li>
            <li className="p-5">Online Enrolments- Free template provided</li>
            <li className="p-5">
              Form creations- ILP, Reviews, Learning Plans
            </li>
            <li className="p-5">
              Video Teaching and Learning Resources for all courses
            </li>
            <li className="p-5">Robust IQA functionality</li>
            <li className="p-5">API Integration</li>
            <li className="p-5">
              Easy-to-use platform can be accessed on multiple devices
            </li>
            <li className="p-5">Progress tracking with visual gap analysis</li>
            <li className="p-5">Intuitive Layout that is user-friendly</li>
            <li className="p-5">Learner Forums</li>
          </ul>
        </div>

        <div className={`${Style.hidden_img}w-full relative sm:w-2/5 h-5/6`}>
          <div className="w-8/12 top-0 left-0 absolute">
            <img
              src="assets/images/homePage/multicultural.jpeg"
              alt="img1"
              className="rounded-2xl"
            />
          </div>

          <div className="w-8/12 absolute bottom-0 right-0">
            <img
              src="assets/images/homePage/woman-working.jpeg"
              alt="img1"
              className="rounded-2xl"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center py-52 items-center bg-[#F9F9FD] sm:flex-col gap-40 ">
        <div className="text-center w-full py-24 px-20 sm:w-3/5">

          <h2 className=" uppercase text-3xl font-bold mt-12 sm:text-3xl lg:text-3xl">
            Seamless Enrollment Process Made Simple
          </h2>

          <p className="mt-12 text-justify break-words">
            Streamline your online registration and enrollment process with ease. Our platform offers a user-friendly system that simplifies student data management, making it easy to organize and track enrolments. With free templates and automated processes, you can reduce administrative burdens and ensure a smooth experience for both students and staff.
          </p>
        </div>

        <div className={`${Style.color_2_cards} gap-96`}>
          <div
            className={`${Style.color_card} bg-[#B9FCFF] flex items-center w-2/5 h-xs relative`}
          >
            <div
              className={`w-1/2 flex flex-col justify-around h-full p-12 ${Style.color_card_text}`}
            >
              <h3 className="text-xl font-bold">
                Flexible Forms for All Your Educational Needs
              </h3>

              <p className="text-justify break-words">
                Create and manage a wide range of forms with our versatile platform, designed to meet all your educational and administrative requirements. Whether you need Individual Learning Plans (ILP), progress reviews, or custom forms, our tool offers flexibility and ease of use. Our intuitive interface allows you to design and deploy forms quickly.
              </p>
            </div>

            <div
              className={`bg-[#D2FDFF] w-1/2 h-full flex items-center relative z-20 ${Style.color_card_img}`}
            >
              <img
                src="assets/images/homePage/computer.png"
                alt="img1"
                width="100%"
                height="100%"
              />
            </div>

            <div
              className={`w-1/2 h-full bg-[#E3FEFF] absolute -right-14 -top-14 z-10 ${Style.hidden_img}`}
            ></div>
          </div>

          <div
            className={`${Style.color_card2} bg-[#FFD5C2] mt-60 flex items-center w-2/5 h-xs relative`}
          >
            <div
              className={`w-1/2 flex flex-col justify-around h-full p-12 ${Style.color_card_text}`}
            >
              <h3 className="text-xl font-bold">
                Engaging Video Content for Every Course
              </h3>

              <p className="text-justify break-words">
                Enrich your curriculum with high-quality video teaching and learning resources available for every course. Our extensive library offers engaging content that caters to various learning styles, enhancing the educational experience for students. From instructional videos to interactive tutorials, our resources are designed to support effective learning and retention.
              </p>
            </div>

            <div
              className={`bg-[#FFE4D8] w-1/2 h-full flex items-center relative z-20 ${Style.color_card_img}`}
            >
              <img
                src="assets/images/homePage/computer.png"
                alt="img1"
                width="100%"
                height="100%"
              />
            </div>

            <div
              className={`w-1/2 h-full bg-[#FFEEE7] absolute -right-14 -top-14 z-10 ${Style.hidden_img}`}
            ></div>
          </div>
        </div>

        <div className={`${Style.color_2_cards} gap-96`}>
          <div
            className={`${Style.color_card} bg-[#DFBDF4] flex items-center w-2/5 h-xs relative`}
          >
            <div
              className={`w-1/2 flex flex-col justify-around h-full p-12 ${Style.color_card_text}`}
            >
              <h3 className="text-xl font-bold">
                Maintain Excellence with Comprehensive Quality Assurance
              </h3>

              <p className="text-justify break-words">
                Ensure your educational programs maintain the highest standards with our robust (IQA) tools. Our platform offers comprehensive monitoring capabilities, helping you stay compliant and uphold excellence. From detailed evaluations to regular audits, provides insights needed to identify areas for improvement and implement effective strategies.
              </p>
            </div>

            <div
              className={` bg-[#F5E5FF] w-1/2 h-full flex items-center relative z-20 ${Style.color_card_img} `}
            >
              <img
                src="assets/images/homePage/computer.png"
                alt="img1"
                width="100%"
                height="100%"
              />
            </div>

            <div
              className={`w-1/2 h-full bg-[hsl(278,100%,98%)] absolute -right-14 -top-14 z-10 ${Style.hidden_img}`}
            ></div>
          </div>

          <div
            className={`${Style.color_card2} bg-[#9CCC76] mt-60 flex items-center w-2/5 h-xs relative`}
          >
            <div
              className={`w-1/2 flex flex-col justify-around h-full p-12 ${Style.color_card_text}`}
            >
              <h3 className="text-xl font-bold">
                Visualize Progress and Identify Learning Gaps
              </h3>

              <p className="text-justify break-words">
                Monitor and track student progress with our advanced visual gap analysis tools. Our platform provides intuitive visualizations, helping educators and administrators quickly identify strengths and areas for improvement. With detailed charts and reports, you can analyze performance, track outcomes, and implement targeted interventions.
              </p>

            </div>

            <div
              className={`bg-[#E5FFD0] w-1/2 h-full flex items-center relative z-20 ${Style.color_card_img}`}
            >
              <img
                src="assets/images/homePage/computer.png"
                alt="img1"
                width="100%"
                height="100%"
              />
            </div>

            <div
              className={`w-1/2 h-full bg-[#EFFFE2] absolute -right-14 -top-14 z-10 ${Style.hidden_img}`}
            ></div>
          </div>
        </div>
      </div>

      <div className="flex items-center flex-col py-52 gap-10 ">
        <div
          className={`flex items-center justify-center w-11/12 gap-10 ${Style.mui_card}`}
        >
          <div
            className={`rounded w-2/6 p-4 py-28 px-28 sm:w-1/4 flex flex-col ${Style.mui_text_box} `}
          >

            <h2 className="text-xl font-bold mt-12">
              Integrate Seamlessly with Existing Systems
            </h2>

            <p className="mt-12 text-justify break-words">
              Maximize efficiency with our platform's seamless API integration capabilities. Designed to work harmoniously with your existing systems, our platform allows for smooth data exchange and workflow optimization. Enjoy a unified and efficient experience that enhances productivity and simplifies administrative tasks.
            </p>
          </div>

          <Card
            sx={{ maxWidth: 345 }}
            className={`${Style.card} w-2/6 p-4 items-center text-center sm:w-2/6 flex flex-col rounded `}
          >
            <CardMedia
              className="w-1/4 sm:w-1/4 px-12 pt-12 "
              component="img"
              height="140"
              image="assets/images/svgImage/freelancer.svg"
              alt="green iguana"
            />
            <CardContent>
              <Typography
                gutterBottom
                variant="h5"
                component="div"
                className="text-xl font-bold"
              >
                Access Anytime,<br /> Anywhere on Any Device
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                className="mt-12 text-justify break-words"
              >
                Experience the flexibility of our platform, designed for accessibility on any device, including desktops, tablets, and smartphones. Whether you're at the office, at home, or on the go, our platform ensures you can stay connected and productive.
              </Typography>
            </CardContent>
          </Card>

          <Card
            sx={{ maxWidth: 345 }}
            className={`${Style.card} w-2/6 p-4 items-center text-center sm:w-2/6 flex flex-col rounded `}
          >
            <CardMedia
              className="w-1/5 sm:w-1/5 px-12 pt-12 pb-8 "
              component="img"
              height="140"
              image="assets/images/svgImage/startsup.svg"
              alt="green iguana"
            />
            <CardContent>
              <Typography
                gutterBottom
                variant="h5"
                component="div"
                className="text-xl font-bold"
              >
                User-Friendly Design for Effortless Navigation
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                className="mt-12 text-justify break-words"
              >
                Our intuitive interface makes it simple to access the tools and resources you need, enhancing efficiency and productivity. Whether you're managing courses, tracking student progress, or handling administrative tasks, our platform's clear layout.
              </Typography>
            </CardContent>
          </Card>
        </div>

        <div
          className={`flex items-center justify-center w-11/12 gap-10 ${Style.mui_card}`}
        >
          <div
            className={`rounded ${Style.bg_enterprise} w-2/6 p-4 text-center py-28 px-28 sm:w-1/4 flex flex-col `}
          >
            <div className="flex justify-center">
              <div className="flex flex-row">
                <div className="w-full sm:w-full">
                  <img
                    src="assets/images/svgImage/enterprise.svg"
                    alt="img1"
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>

            <h2 className="text-xl text-white font-bold mt-12">
              Discover the Locker Advantage
            </h2>

            <p className="mt-12 text-white text-justify break-words">
              Our platform combines cutting-edge features, a user-friendly interface, and robust support to provide a seamless experience for educators and administrators. From custom reporting to flexible form creation, our solutions are designed to streamline operations and enhance the learning experience.
            </p>
          </div>

          <Card
            sx={{ maxWidth: 345 }}
            className={`${Style.card} w-2/6 p-4 items-center text-center sm:w-2/6 flex flex-col rounded `}
          >
            <CardMedia
              className="w-1/4 sm:w-1/4 px-12 pt-12 "
              component="img"
              height="140"
              image="assets/images/svgImage/freelancer.svg"
              alt="green iguana"
            />
            <CardContent>
              <Typography
                gutterBottom
                variant="h5"
                component="div"
                className="text-xl font-bold"
              >
                Connect and Collaborate in Vibrant Learner Forums
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                className="mt-12 text-justify break-words"
              >
                Our platform encourages students to engage with peers, share knowledge, and participate in meaningful discussions. Whether discussing course content, seeking help with assignments, or sharing experiences, our forums provide a space for learners to connect and grow together.
              </Typography>
            </CardContent>
          </Card>

          <Card
            sx={{ maxWidth: 345 }}
            className={`${Style.card} w-2/6 p-4 items-center text-center sm:w-2/6 flex flex-col rounded `}
          >
            <CardMedia
              className="w-1/4 sm:w-1/4 px-12 pt-12 "
              component="img"
              height="140"
              image="assets/images/svgImage/freelancer.svg"
              alt="green iguana"
            />
            <CardContent>
              <Typography
                gutterBottom
                variant="h5"
                component="div"
                className="text-xl font-bold"
              >
                A Trusted Solution for Modern Educational Needs
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                className="mt-12 text-justify break-words"
              >
                Our platform leverages the latest technologies to provide efficient and scalable solutions that cater to diverse educational needs. Whether you're managing courses, tracking student progress, or engaging with learners, Locker offers the tools and support you need to succeed.
              </Typography>
            </CardContent>
          </Card>
        </div>
      </div>

      <div
        className={`text-white relative flex flex-col w-full ml-auto justify-end py-52 items-center bg-[#ffffff] sm:flex-row ${Style.why_locker}`}
      >
        <div className="absolute top-0 right-0 ">
          <img src="assets/images/svgImage/bg-design3.svg" alt="img1" />
        </div>
        <div
          className={`${Style.hidden_img} rounded w-2/6 text-center sm:w-2/6 flex flex-col `}
        >
          <img
            src="assets/images/homePage/writing.jpeg"
            alt="img1"
            className="w-full h-auto"
          />
        </div>

        <div
          className={`text-white flex flex-col justify-center py-20 items-left bg-[#6D81A3] sm:flex-col w-full pl-52 sm:w-1/2 ${Style.why_locker_text}`}
        >

          <h2 className=" uppercase text-3xl font-bold mt-12 sm:text-3xl lg:text-3xl">
            WHY LOCKER?
          </h2>

          <ul className="list-disc list-outside">
            <li className="p-5">
              Comprehensive Features for All Educational Needs
            </li>
            <li className="p-5">
              User-Friendly Interface for Effortless Navigation
            </li>
            <li className="p-5">
              Seamless Integration with Existing Systems
            </li>
            <li className="p-5">
              Robust Quality Assurance Tools and Compliance
            </li>
            <li className="p-5">
              Accessible Anywhere, Anytime on Any Device
            </li>
            <li className="p-5">
              Collaborative Learning Environment with Forums
            </li>
            <li className="p-5">
              Trusted and Proven Solution for Modern Education
            </li>
          </ul>

        </div>
      </div>
    </>
  );
};

export default Home;
