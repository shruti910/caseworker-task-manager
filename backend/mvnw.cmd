@REM ----------------------------------------------------------------------------
@REM Maven Wrapper Windows Script
@REM ----------------------------------------------------------------------------

@IF "%DEBUG%"=="" @ECHO OFF
@SETLOCAL

where mvn >nul 2>nul
@IF %ERRORLEVEL% EQU 0 (
  mvn %*
  exit /B %ERRORLEVEL%
)

@ECHO Maven is not installed on PATH.
exit /B 1

