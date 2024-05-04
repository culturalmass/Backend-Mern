import { useState } from "react"
import { Calendar } from "react-big-calendar"
import { Navbar, CalendarEvent, CalendarModal, FabAddNew, FabDelete } from ".."
import "react-big-calendar/lib/css/react-big-calendar.css"
import { localizer, getMessageES } from "../../helpers"
import { useUiStore, useCalendarStore, useAuthStore } from "../../hooks"
import { useEffect } from "react"

export const CalendarPage = () => {
  const { user } = useAuthStore()
  const { openDateModal } = useUiStore()
  const { events, setActiveEvent, startLoadingEvents } = useCalendarStore()
  const [lastView, setlastView] = useState(
    localStorage.getItem("lastView") || "week"
  )
  const eventStyleGetter = (event, start, end, isSelected) => {
    const isMyEvent = user.uid === event.user._id || user.uid === event.user.uid

    const style = {
      backgroundColor: isMyEvent ? "#347CF7" : "#465660",
      borderRadius: "0px",
      opacity: 0.8,
      color: "white",
    }
    return {
      style,
    }
  }
  const onDoubleClick = (event) => {
    // console.log({doubleClick:event});
    openDateModal()
  }
  const onSelect = (event) => {
    setActiveEvent(event)
  }
  const onViewChanged = (event) => {
    localStorage.setItem("lastView", event)
  }
  useEffect(() => {
    startLoadingEvents()
  }, [])

  return (
    <>
      <Navbar />

      <Calendar
        culture="es"
        localizer={localizer}
        events={events}
        defaultView={lastView}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "calc(100vh - 80px)" }}
        messages={getMessageES()}
        eventPropGetter={eventStyleGetter}
        components={{
          event: CalendarEvent,
        }}
        onDoubleClickEvent={onDoubleClick}
        onSelectEvent={onSelect}
        onView={onViewChanged}
      />

      <CalendarModal />
      <FabAddNew />
      <FabDelete />
    </>
  )
}
