# TravelBook
## Project summary
### One-sentence description of the project
TravelBook is a web application used to organize trips with friends including group chats, destination finding and calendar planning.
### Additional information about the project
TODO: Write a compelling/creative/informative project description / summary
In TravelBook users create an account, build trips with custom names and descriptions, and invite friends to collaborate. Each trip gets its own group chat so conversations stay organized around the trip itself. A built-in map view lets you browse and pin destinations, while the calendar keeps everyone aligned on dates and events. When you're ready to commit, the trip planner lets you finalize your saved locations into a named trip stored in the database. TravelBook uses a FastAPI + PostgreSQL backend with JWT-based authentication, and a React + Vite frontend with protected routes and persistent login state. The two communicate over a clean REST API.
## Installation
### Prerequisites
Git
Node.js (v18+) and npm
Python 3.13
uv — Python package and environment manager (docs.astral.sh/uv)
macOS/Linux: curl -LsSf https://astral.sh/uv/install.sh | sh
Windows: powershell -c "irm https://astral.sh/uv/install.ps1 | more"
PostgreSQL a running PostgreSQL instance with a database created for this project
Google Maps API Key with the Maps JavaScript API and Places API enabled
### Add-ons
Backend (installed with pip install -r requirements.txt)
fastapiWeb: framework for the REST API
uvicornASGI: server to run FastAPI
sqlmodelORM: for defining and querying database models
psycopg2PostgreSQL: database driver
bcrypt / passlib: Password hashing
pyJWT: JSON Web Token creation and validation
python-multipart: Form data parsing (used for OAuth2 login form)
websockets: WebSocket support for real-time chat
pydantic: Data validation
python-dotenv (dotenv): Loads environment variables from .env
pytest / httpx: Testing framework and async HTTP client for tests

Frontend (installed with npm install)
react / react-dom: UI framework
react-router-dom: Client-side routing
axios: HTTP client for API requests
vite: Frontend build tool and dev server

### Installation Steps
1. Clone the repo
git clone https://github.com/your-username/TravelBook.git
cd TravelBook

2. Set up backend
cd backend
uv python install 3.13
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt

create a .env file inside the backend folder with your database credentials

Run main.py to start the backend
The API will be available at http://localhost:8000

3. Set up the Frontend in new terminal
cd frontend
npm install
Open src/hooks/useGoogleMaps.jsx and replace the empty string with your Google Maps API Key
const GOOGLE_MAPS_API_KEY = "YOUR_API_KEY_HERE";
Then start the server
npm run dev
The app will be available at http://localhost:5173

## Functionality
1. Register and Log In
Navigate to http://localhost:5173. You'll be redirected to the Login page. Create a new account by registering with a username, email, and password. Once registered, log in to access the app.

2. Create a Trip
Click "Plan Trip" in the navbar to create a new trip. Enter a name for your trip and hit Save Trip. This creates the trip in the database and automatically provisions a group conversation for it.

3. Set Your Active Trip
Go to the Trips page to see all your saved trips. Click "Set Active" on any trip to make it the current working trip. The active trip is used by the Map, Calendar, and Chat pages.

4. Add Events on the Map
Navigate to the Map page. Use the search bar to find a location, or click anywhere on the map to drop a pin. Once a location is selected, fill in the event name, description, and date, then save it to your active trip.

5. View Your Itinerary on the Calendar
Go to the Calendar page. Set the start and end dates for your trip, and all your saved events will be mapped to their respective days. You can also assign events to specific days using the day slots.

6. Chat with Your Group
Open the Chat page to access the real-time group conversation linked to your active trip. Type a message and press Enter or click Send. You'll see a typing indicator when other group members are composing a message. Chat history is loaded when you open the page.

## Known Problems
- Avatar stack in Chat is hardcoded. The group member avatars displayed in the ChatPage header are static placeholder initials (A, S, E, M) and do not reflect actual trip participants. See frontend/src/pages/ChatPage.jsx

- Trip locations are not fetched from events. On the Trips page, each trip always shows "0 saved locations" because the location-fetching logic is marked as a TODO and not yet implemented. See the _fetchTrips function in frontend/src/pages/TripsPage.jsx

- Google Maps API key is hardcoded. The API key in frontend/src/hooks/useGoogleMaps.jsx is an empty string by default and must be manually inserted before the map features will work. Ideally this should be sourced from an environment variable

## Contributing
TODO: Leave the steps below if you want others to contribute to your project.
1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D
## Additional Documentation
TODO: Provide links to additional documentation that may exist in the repo, e.g.,
* Sprint reports
* User links
## License
If you haven't already, add a file called `LICENSE.txt` with the text of the
appropriate license.
We recommend using the MIT license: <https://choosealicense.com/licenses/mit/>
