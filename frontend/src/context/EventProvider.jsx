import { EventContext } from "./EventContext";
import api from "../api";

function EventProvider({children}){


    const createEvent = async(name, description, tripId, date, location) => {
        let event = await api.put('/events/create', {name:name, description:description, trip_id:tripId, date:date, location:location } ).then( (res)=>{return res.data} );
        return event;
    }
    

    // date is a string or some unspecified format??? TODO: no
    const getEventsByDate = async(date) => {
        let events = await api.get(`/events/${date}`);
        return events;
    }
    
    const getEventById = async(eventId) => {
        let events = await api.get(`/events/${eventId}`);
        return events;
    }

    const getEventsByTrip = async(eventId) => {
        let events = await api.get(`/events/${eventId}`);
        return events;
    }
    

    const deleteEvent = async(eventId) => {
        let res = await api.delete(`/events/${eventId}`);
        if(res && res.data.detail){
            if(res.data.detail != "Event deleted successfully"){
                console.error(`Failed to delete event with id ${eventId}`);
            }
        }

    }


    const updateEvent = async(eventId, name, description, tripId, date, location) => {
        let event = await api.put(`/events/${eventId}`, 
            {id: eventId, name:name, description:description, trip_id:tripId, date:date, location:location} ).then( (res)=>{return res.data} );
        return event;
    }
    

    return (
        <EventContext.Provider value={{createEvent, getEventById, getEventsByDate, getEventsByTrip, deleteEvent, updateEvent}}>
          {children}
        </EventContext.Provider>
    );
}

export default EventProvider;