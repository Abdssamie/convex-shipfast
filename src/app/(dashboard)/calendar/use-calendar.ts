"use client"

import { useState, useCallback } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { type CalendarEvent } from "./types"
import { toast } from "sonner"
import { Id } from "@/convex/_generated/dataModel"

export interface UseCalendarState {
  selectedDate: Date
  showEventForm: boolean
  editingEvent: CalendarEvent | null
  showCalendarSheet: boolean
  events: CalendarEvent[]
  isLoading: boolean
}

export interface UseCalendarActions {
  setSelectedDate: (date: Date) => void
  setShowEventForm: (show: boolean) => void
  setEditingEvent: (event: CalendarEvent | null) => void
  setShowCalendarSheet: (show: boolean) => void
  handleDateSelect: (date: Date) => void
  handleNewEvent: () => void
  handleNewCalendar: () => void
  handleSaveEvent: (eventData: Partial<CalendarEvent>) => Promise<void>
  handleDeleteEvent: (eventId: Id<"events">) => Promise<void>
  handleEditEvent: (event: CalendarEvent) => void
}

export interface UseCalendarReturn extends UseCalendarState, UseCalendarActions {}

export function useCalendar(): UseCalendarReturn {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [showEventForm, setShowEventForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [showCalendarSheet, setShowCalendarSheet] = useState(false)

  // Fetch events from Convex
  const eventsData = useQuery(api.events.list)
  const createEvent = useMutation(api.events.create)
  const updateEvent = useMutation(api.events.update)
  const deleteEvent = useMutation(api.events.remove)

  // Convert Convex events to CalendarEvent format
  const events: CalendarEvent[] = eventsData
    ? eventsData.map((event) => ({
        ...event,
        date: new Date(event.date),
      }))
    : []

  const isLoading = eventsData === undefined

  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date)
    setShowCalendarSheet(false)
  }, [])

  const handleNewEvent = useCallback(() => {
    setEditingEvent(null)
    setShowEventForm(true)
  }, [])

  const handleNewCalendar = useCallback(() => {
    toast.info("Calendar management coming soon")
  }, [])

  const handleSaveEvent = useCallback(
    async (eventData: Partial<CalendarEvent>) => {
      try {
        if (editingEvent?._id) {
          // Update existing event
          await updateEvent({
            id: editingEvent._id,
            title: eventData.title,
            date: eventData.date?.getTime(),
            time: eventData.time,
            duration: eventData.duration,
            type: eventData.type,
            attendees: eventData.attendees,
            location: eventData.location,
            color: eventData.color,
            description: eventData.description,
          })
          toast.success("Event updated successfully")
        } else {
          // Create new event
          if (!eventData.title || !eventData.date || !eventData.time || !eventData.duration || !eventData.type || !eventData.attendees || !eventData.location || !eventData.color) {
            toast.error("Please fill in all required fields")
            return
          }
          await createEvent({
            title: eventData.title,
            date: eventData.date.getTime(),
            time: eventData.time,
            duration: eventData.duration,
            type: eventData.type,
            attendees: eventData.attendees,
            location: eventData.location,
            color: eventData.color,
            description: eventData.description,
          })
          toast.success("Event created successfully")
        }
        setShowEventForm(false)
        setEditingEvent(null)
      } catch (error) {
        console.error("Error saving event:", error)
        toast.error("Failed to save event")
      }
    },
    [editingEvent, createEvent, updateEvent]
  )

  const handleDeleteEvent = useCallback(
    async (eventId: Id<"events">) => {
      try {
        await deleteEvent({ id: eventId })
        toast.success("Event deleted successfully")
        setShowEventForm(false)
        setEditingEvent(null)
      } catch (error) {
        console.error("Error deleting event:", error)
        toast.error("Failed to delete event")
      }
    },
    [deleteEvent]
  )

  const handleEditEvent = useCallback((event: CalendarEvent) => {
    setEditingEvent(event)
    setShowEventForm(true)
  }, [])

  return {
    // State
    selectedDate,
    showEventForm,
    editingEvent,
    showCalendarSheet,
    events,
    isLoading,
    // Actions
    setSelectedDate,
    setShowEventForm,
    setEditingEvent,
    setShowCalendarSheet,
    handleDateSelect,
    handleNewEvent,
    handleNewCalendar,
    handleSaveEvent,
    handleDeleteEvent,
    handleEditEvent,
  }
}
