import { TripContext } from "./TripContext";
import { useState } from "react";
import api from "../api";

/*
    class Trip(SQLModel, table=True):
      id: Optional[int] = Field(default=1, primary_key=True)
      name: str
      description: Optional[str] = None
      user_id: int = Field(foreign_key="user.id")
      conversation_id: Optional[int] = Field(default=1, foreign_key="conversation.id")
      conversation: Optional["Conversation"] = Relationship(back_populates="trip")
      events: List["Event"] = Relationship(back_populates="trip")
      albums: List["Album"] = Relationship(back_populates="trip")
*/

export function TripProvider({children}){
  let [activeTrip, setActiveTrip] = useState(null);

  const createTrip = async (name, conversationId, description) => {
    await api.post("/trips/create", {name:name, conversation_id:conversationId, description:description});
  };

  const getTrips = async() =>{
    let res = await api.get("/trips/getTrips");
    return res.data;
  }

  const getTrip = async(trip_id) =>{
    let res = await api.get(`/trips/${trip_id}`);
    return res.data;
  }

  const deleteTrip = async(tripId) => {
    await api.delete(`/trips/${tripId}`).then( () => {
      if(activeTrip && tripId == activeTrip.id) setActiveTrip(null);
    } )    
  }

  const setTripDate = async(tripId, start, end) => {
    let oldTrip = await getTrip(tripId);
    console.log(`start:{${start}}, end{${end}}`)
    let res = await api.put(`/trips/${tripId}`, {name: oldTrip.name, description: oldTrip.description, start_date:start, end_date:end})
    if(activeTrip && activeTrip.id == tripId){
      setActiveTrip(res.data); 
    }
    return res.data;
  }

  return (
      <TripContext.Provider value={{activeTrip, createTrip, getTrips, deleteTrip, setActiveTrip, setTripDate, getTrip}}>
        {children}
      </TripContext.Provider>
  );
}

export default TripProvider;