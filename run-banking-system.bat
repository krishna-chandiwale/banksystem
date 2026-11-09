@echo off
setlocal
cd /d "%~dp0"

echo ===================================================================
echo   Banking Management System - Launch Script
echo ===================================================================

REM 1. Use the bundled Java 21 runtime when available.
if exist "%~dp0.jdk\jdk-21.0.5+11\bin\java.exe" (
    set "JAVA_HOME=%~dp0.jdk\jdk-21.0.5+11"
    set "PATH=%JAVA_HOME%\bin;%PATH%"
)

REM 2. Use the embedded local database; production MySQL settings remain unchanged.
set "SPRING_PROFILES_ACTIVE=local"

REM 3. Run Spring Boot application
echo Starting Banking Management System...
echo Access Portal: http://localhost:8080
echo.
call .\mvnw.cmd spring-boot:run

pause
