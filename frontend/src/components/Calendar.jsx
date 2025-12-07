import React from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const Calendar = ({ events, onSelectSlot, onSelectEvent, selectable = false }) => {
    return (
        <div style={{ height: 500 }}>
            <BigCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
                selectable={selectable}
                onSelectSlot={onSelectSlot}
                onSelectEvent={onSelectEvent}
                defaultView="week"
                views={['week', 'day', 'agenda']}
            />
        </div>
    );
};

export default Calendar;
