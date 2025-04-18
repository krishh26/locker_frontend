import React, { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./calendarStyle.css";
import { useDispatch, useSelector } from "react-redux";
import { selectGlobalUser } from "app/store/globalUser";
import { getMonthByTimeLogData, selectTimeLog } from "app/store/timeLog";
import { Tooltip } from "@mui/material";

const colors = [
  'AliceBlue', 'Beige', 'Cornsilk', 'FloralWhite', 'Gainsboro',
  'HoneyDew', 'Ivory', 'LavenderBlush', 'MintCream', 'OldLace',
  'PapayaWhip', 'MistyRose', 'Lavender', 'LightYellow', 'LemonChiffon',
  'LightCyan', 'Linen', 'LightGoldenRodYellow', 'PaleGoldenRod', 'PaleTurquoise',
  'PaleGreen', 'PeachPuff', 'SeaShell', 'Lavender', 'Thistle', 'Azure'
];

const atoz = "abcdefghijklmnopqrstuvwxyz";

function CalendarComponent(props) {
  const { calenderData } = useSelector(selectTimeLog);
  const { currentUser, selectedUser, selected } = useSelector(selectGlobalUser);

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
      dispatch(getMonthByTimeLogData(currentYear, currentMonth, selected ? selectedUser?.user_id : currentUser?.user_id));
    }
  }, [dispatch, currentYear, currentMonth, selected ? selectedUser?.user_id : currentUser?.user_id]);

  const transformEventData = (data) => {
    return calenderData.map(event => ({
      title: event.activity_type,
      start: event.activity_date,
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
          return (
            <div style={{ backgroundColor: colors[atoz.indexOf(eventInfo.event.title.charAt(0).toLowerCase())], width: "100%" }}>
              <Tooltip title={eventInfo.event.title}>
                <div className="overflow-hidden text-ellipsis whitespace-nowrap">{eventInfo.event.title}</div>
              </Tooltip>
            </div>
          );
        }}
      />
    </div>
  );
}

export default CalendarComponent;
