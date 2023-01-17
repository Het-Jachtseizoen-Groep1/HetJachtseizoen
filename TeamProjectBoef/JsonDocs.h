#include <ArduinoJson.h>
  

#include "GameVariables.h"

const byte topicCount = 3;
const char *topics[topicCount] = {"hetJachtSeizoen/gameInfo", "hetJachtSeizoen/gameResults", "hetJachtSeizoen/deviceAvailability"};

// receive
//> Game info (start and stop)
DynamicJsonDocument gameInfo(1024);
char jsonGameInfoDeser[128];  // Deserialized
char jsonGameInfoSer[128]; // Seriailized

//> Device availability
DynamicJsonDocument deviceAvailability(1024);
char jsonDeviceAvailabilityDeser[128];	 // Deserialized
char jsonDeviceAvailabilitySer[128]; // Seriailized

// send
//> Game results
DynamicJsonDocument gameResults(1024);
char jsonGameResultsDeser[128];  // Deserialized
char jsonGameResultsSer[128]; // Seriailized

/*
json doc samples
// receive gameInfo, start setting runTime and send. when runtime >= timelimit stop tagged, boeven winnen (game over)
gameInfo:
{
 "inProgress": false, //<< boolean, true = game is running (start game), false = game is not running (stop game)
 "runTime": 0, //<< integer, time in seconds
 "TimeLimit": 0, //<< integer, time in seconds
}

// when tagged or time runs out, send gameResults
gameResults:
{
	"duration": 0, //<< integer, time in seconds
	"winner": 0, //<< integer, 0 = boeven, 1 = jagers
}

// check which devices are available and how many players are connected
deviceAvailability:
{
	type: "request", //<< string, request = request for device availability, response = response to request for device availability
	"name": "esp32", //<< string, name of the device
	"available": false, //<< boolean, true = device is available, false = device is not available
}
*/

// update
void UpdateGameInfo(bool p_inProgress, long p_currDuration, long p_timeLimit)
{
	// update gameInfo
	gameInfo["inProgress"] = p_inProgress;
	gameInfo["runTime"] = p_currDuration;
	gameInfo["timeLimit"] = p_timeLimit;

	// serialize
	serializeJson(gameInfo, jsonGameInfoSer);
}

void UpdateGameResults(long p_duration, bool p_winner)
{
	// update gameResults
	gameResults["duration"] = p_duration;
	gameResults["winner"] = p_winner;

	// serialize
	serializeJson(gameResults, jsonGameResultsSer);
}

void UpdateDeviceAvailability(bool p_available)
{
	// update deviceAvailability
	deviceAvailability["type"] = "response";
	deviceAvailability["available"] = p_available;

	// serialize
	serializeJson(deviceAvailability, jsonDeviceAvailabilitySer);
}
