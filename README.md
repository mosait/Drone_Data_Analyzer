<div align="center">
    <a href="https://github.com/mosait/Drone_Data_Analyzer" />
        <img alt="Drone" height="200px" src="./frontend/public/drone.png">
    </a>
</div>

# Drone Analytics

### Architecture

- Framework: React
- Build Tool: Vite
- Variant: TypeScript
- Backend: FastAPI

### Run Application

#### Docker (Recommended)

Using Docker, run the following command in the root directory of the project:

```
docker-compose -f ./docker/docker-compose.yml up --build
```

Than navigate to `http://localhost:3000` to access the application.

#### No Docker

If you want to run the application without Docker, you need two terminals.

In the first terminal, run the following command to start the backend server:

```
cd ./backend
python -m venv venv

Windows  : .\venv\Scripts\activate
Linux/Mac: source ./venv/bin/activate

pip install -r requirements.txt
python ./run_backend
```

In the second terminal, run the following command to start the frontend server:

```
cd ./frontend
npm install
npm run dev
```

Then navigate to `http://localhost:5173/` to access the application.
