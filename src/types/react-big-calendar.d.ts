// src/types/react-big-calendar.d.ts
declare module 'react-big-calendar' {
  import * as React from 'react';

  export type View = 'month' | 'week' | 'work_week' | 'day' | 'agenda';

  export interface Event {
    id?: string | number;
    title?: string;
    start: Date;
    end: Date;
    allDay?: boolean;
    resource?: any;
  }

  export interface CalendarProps {
    events: Event[];
    localizer: any;
    startAccessor?: string | ((event: Event) => Date);
    endAccessor?: string | ((event: Event) => Date);
    view?: View;
    defaultView?: View;
    defaultDate?: Date;
    onNavigate?: (date: Date) => void;
    onView?: (view: View) => void;
    components?: any;
    [key: string]: any;
  }

  export class Calendar extends React.Component<CalendarProps> {}

  export function momentLocalizer(momentInstance: any): any;

  export const Views: {
    MONTH: View;
    WEEK: View;
    WORK_WEEK: View;
    DAY: View;
    AGENDA: View;
  };
}
