@echo off
echo Setting up HubCEFET with Docker Compose...

:: Check if .env file exists
if not exist .env (
    echo Error: .env file not found. Please create one based on .env.example
    exit /b 1
)

:: Build and start all services
echo Building and starting services...
docker compose up --build -d
if errorlevel 1 exit /b %errorlevel%

echo Waiting for services to be ready...
timeout /t 30 /nobreak >nul

:: Run database migrations
echo Running database migrations...
docker compose run --rm migrate
if errorlevel 1 exit /b %errorlevel%

:: Run database seeds
echo Running database seeds...
docker compose run --rm seed
if errorlevel 1 exit /b %errorlevel%

echo.
echo Setup complete!
echo.
echo Your application is now running:
echo Frontend: http://localhost:4330
echo API: http://localhost:4330/api
echo Adminer: http://localhost:8080
echo.
echo To view logs: docker compose logs -f
echo To stop: docker compose down
echo To restart: docker compose restart

pause
