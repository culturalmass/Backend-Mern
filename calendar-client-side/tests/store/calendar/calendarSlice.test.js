import {calendarWithActiveEventState, calendarWithEventsState, events, initialState } from "../../fixtures/calendarStates";
import { calendarSlice, onAddNewEvent, onDeleteEvent, onLoadEvents, onLogoutCalendar, onSetActiveEvent, onUpdateEvent } from "../../../src/store/calendar/calendarSlice";


describe('Prueas en calendarSlice', () => {
    test('debe de regresar el estado por defecto', () => {
        const state = calendarSlice.getInitialState();
        expect(state).toEqual(initialState)
    });
    test('onSetActiveEvent debe de activar el evento', () => {
        const state = calendarSlice.reducer(calendarWithEventsState, onSetActiveEvent(events[0]));
        expect(state.activeEvent).toEqual(events[0]);
    });
    test('onAddNewEvent debe de agregar el evento', () => {
        const newEvent = 
        {
            id: '3',
            start: new Date('2022-10-21 13:00:00'),
            end: new Date('2022-10-21 15:00:00'),
            title: 'Cumpleaños de Fernado-Nueva nota',
            notes: 'Alguna nota-nueva nota test',
        };
        const state = calendarSlice.reducer(calendarWithEventsState, onAddNewEvent(newEvent));
        expect(state.events).toEqual([...events, newEvent]);
    });
    test('onUpdateEvent debe de actualizar el evento', () => {
        const updateEvent = 
        {
            id: '1',
            start: new Date('2022-10-21 13:00:00'),
            end: new Date('2022-10-21 15:00:00'),
            title: 'Cumpleaños de Fernado-Editado',
            notes: 'Alguna nota-Editado',
        };
        const state = calendarSlice.reducer(calendarWithEventsState, onUpdateEvent(updateEvent));
        expect(state.events).toContain(updateEvent);
    });
    test('onDeleteEvent dee de borrar el evento activo', () => {
        const state = calendarSlice.reducer(calendarWithActiveEventState, onDeleteEvent());
        expect(state.activeEvent).toBe(null);
        expect(state.events).not.toContain(events[0]);
    });
    test('onLoadEvents debe de establecer los eventos', () => {
        const state = calendarSlice.reducer(initialState, onLoadEvents(events));
        expect(state.isLoadingEvents).toBeFalsy();
        expect(state.events).toEqual(events);

        const newState = calendarSlice.reducer(state,onLoadEvents(events));
        expect(state.events.length).toBe(events.length);
    });
    test('onLogoutCalendar debe de limpiar el estado', () => {
        const state = calendarSlice.reducer(calendarWithActiveEventState, onLogoutCalendar());
        expect(state).toEqual(initialState);
    });
});