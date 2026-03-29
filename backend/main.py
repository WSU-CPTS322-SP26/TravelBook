import sys
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import auth.auth_router as auth_router
import events.events_router as events_router
import messages.messages_router as messages_router
import trips.trips_router as trips_router
import friends.friends_router as friends_router
import messages.messages_websocket as messages_websocket

import os



# Set environment variable for seed regeneration before importing database
# Usage: python main.py --reseed (to regenerate seed data, default is yes)
#        python main.py --no-reseed (to skip seed data regeneration)
if "--no-reseed" in sys.argv:
    os.environ["RESEED_DATABASE"] = "false"
    sys.argv.remove("--no-reseed")
elif "--reseed" in sys.argv:
    os.environ["RESEED_DATABASE"] = "true"
    sys.argv.remove("--reseed")
else:
    # Default to reseeding
    os.environ["RESEED_DATABASE"] = "false"


app = FastAPI(debug=True)

origin = [
    "http://localhost:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origin,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

app.include_router(auth_router.router, prefix="/auth")
app.include_router(messages_router.router, prefix="/messages")
app.include_router(events_router.router, prefix="/events")
app.include_router(trips_router.router, prefix="/trips")
app.include_router(friends_router.router, prefix="/friends")
app.include_router(messages_websocket.router, prefix="/ws")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)


