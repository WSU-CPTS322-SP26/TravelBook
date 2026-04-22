import { TripContext } from "./TripContext";
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
    await api.delete(`/trips/${tripId}`);
  }

  const updateTrip = async (tripId, updates = {}) => {
    const oldTrip = await getTrip(tripId);
    const payload = {
      name: updates.name ?? oldTrip.name,
      description: updates.description ?? oldTrip.description,
      conversation_id: oldTrip.conversation_id,
      start_date: updates.start_date ?? oldTrip.start_date,
      end_date: updates.end_date ?? oldTrip.end_date,
    };

    const res = await api.put(`/trips/${tripId}`, payload);
    return res.data;
  };

  const setTripDate = async(tripId, start, end) => {
    return await updateTrip(tripId, { start_date: start, end_date: end });
  }

  return (
      <TripContext.Provider value={{createTrip, getTrips, deleteTrip, setTripDate, getTrip, updateTrip}}>
        {children}
      </TripContext.Provider>
  );
}

export default TripProvider;