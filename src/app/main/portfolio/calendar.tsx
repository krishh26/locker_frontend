import React, { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./calendarStyle.css";
import { useDispatch, useSelector } from "react-redux";
import { getMonthBySessionData, selectSession } from "app/store/session";
import { selectLearnerManagement } from "app/store/learnerManagement";

const colors = [
  'AliceBlue', 'Beige', 'Cornsilk', 'FloralWhite', 'Gainsboro', 
  'HoneyDew', 'Ivory', 'LavenderBlush', 'MintCream', 'OldLace', 
  'PapayaWhip', 'MistyRose', 'Lavender', 'LightYellow', 'LemonChiffon', 
  'LightCyan', 'Linen', 'LightGoldenRodYellow', 'PaleGoldenRod', 'PaleTurquoise', 
  'PaleGreen', 'PeachPuff', 'SeaShell', 'Lavender', 'Thistle', 'Azure'
];

const atoz = "abcdefghijklmnopqrstuvwxyz";

function Calendar() {
  const { learner } = useSelector(selectLearnerManagement);
  const { calenderData } = useSelector(selectSession);

  const dispatch: any = useDispatch();

  const [currentMonth, setCurrentMonth] = useState(null);
  const [currentYear, setCurrentYear] = useState(null);
  const calendarRef = useRef(null);

  const getCurrentMonthAndYear = (calendarApi) => {
    const currentDate = calendarApi.getDate();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    return { month, year };
  };

  const handleDatesSet = (info) => {
    const { month, year } = getCurrentMonthAndYear(info.view.calendar);
    setCurrentMonth(month);
    setCurrentYear(year);
  };

  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      const { month, year } = getCurrentMonthAndYear(calendarApi);
      setCurrentMonth(month);
      setCurrentYear(year);
    }
  }, []);

  useEffect(() => {
    if (currentYear && currentMonth) {
      dispatch(getMonthBySessionData(currentYear, currentMonth, learner.learner_id));
    }
  }, [dispatch, currentYear, currentMonth, learner.learner_id]);

  const transformEventData = (data) => {
    return calenderData.map(event => ({
      title: event.title,
      start: event.startDate,
    }));
  };

  const transformedEvents = transformEventData(calenderData);

  return (
    <div className="w-full max-w-screen-lg mx-auto">
      <FullCalendar
        ref={calendarRef}
        datesSet={handleDatesSet}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={"dayGridMonth"}
        headerToolbar={{
          start: "today prev,next",
          center: "title",
          end: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        height={"90vh"}
        events={transformedEvents}
        eventContent={(eventInfo) => {
          // Formatting event time
          const eventStartTime = new Date(eventInfo.event.start);
          const timeString = eventStartTime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          return (
            <div style={{backgroundColor: colors[atoz.indexOf(eventInfo.event.title.charAt(0))], width:"100%"}}>
              <div>{timeString}</div>
              <div>{eventInfo.event.title}</div>
            </div>
          );
        }}
      />
    </div>
  );
}

export default Calendar;
