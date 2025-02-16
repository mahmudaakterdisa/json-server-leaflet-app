## Leaflet Map Application
A React-based Leaflet Map application with a JSON Server backend to visualize road evaluations using interactive maps, tables, and charts.
This project is fully containerized using Docker and Docker Compose, allowing you to easily build and run both the frontend (React/Vite) and backend (JSON Server) in separate containers.

### Features
- Frontend: React (Vite) + Leaflet.js for interactive mapping
- Backend: JSON Server for managing road & TODO data (db.json)
- Containerized: Easily deploy using Docker & Docker Compose

### Prerequisites
Install `Docker`

### Folder Structure

```
leaflet-map-app/
│── json-server/          # JSON Server backend
│   ├── db.json           # Road & TODOs data
│   ├── package.json      # Dependencies
│   ├── Dockerfile        # Backend Docker configuration
│── leaflet-map/          # React frontend
│   ├── src/              # Source code
│   ├── package.json      # Dependencies
│   ├── Dockerfile        # Frontend Docker configuration
│── docker-compose.yml    # Defines both services (frontend & backend)
│── README.md             # Project documentation
```
### Running the App with Docker Compose
Use `Docker Compose` to manage both services (frontend + backend) together.

### Start the Application
Run the following command in the root directory:
`docker-compose up --build`

### This will:
- Build and start the frontend (`http://localhost:5173`)
- Build and start the backend (`http://localhost:3000`)
