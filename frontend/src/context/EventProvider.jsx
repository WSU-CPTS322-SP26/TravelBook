import { EventContext } from "./EventContext";
import api from "../api";

function EventProvider({children}){

    // class Event(SQLModel, table=True):
    // id: Optional[int] = Field(default=None, primary_key=True)
    // name: str
    // description: Optional[str] = None
    // trip_id: Optional[int] = Field(default=1, foreign_key="trip.id")
    // date: datetime = Field(sa_column=Column(TIMESTAMP(timezone=True)))
    // location: dict = Field(sa_column=Column(JSON, nullable=False))
    // trip: "Trip" = Relationship(back_populates="events")

    const createEvent = async(name, description, tripId, date, location) => {
        let event = await api.post('/events/create', {name: name, description: description, trip_id: tripId, date:date, location:location } ).then( (res)=>{return res.data} );
        return event;
    }
    

    const getEventsByDate = async(date) => {
        let events = await api.get(`/events/by-date/${date}`).then( (res) => {return res.data; } );
        return events;
    }
    
    const getEventById = async(eventId) => {
        let events = await api.get(`/events/by-id/${eventId}`).then( (res) => {return res.data; } );
        return events;
    }

    const getEventsByTrip = async(tripId) => {
        let events = await api.get(`/events/by-trip/${tripId}`).then( (res) => {return res.data; } );
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
            {name:name, description:description, trip_id:tripId, date:date, location:location} ).then( (res)=>{return res.data} );
        return event;
    }
    

    return (
        <EventContext.Provider value={{createEvent, getEventById, getEventsByDate, getEventsByTrip, deleteEvent, updateEvent}}>
          {children}
        </EventContext.Provider>
    );
}

export default EventProvider;