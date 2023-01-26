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
char jsonDeviceAvailabilityDeser[128];   // Deserialized
char jsonDeviceAvailabilitySer[128]; // Seriailized

// send
//> Game results
DynamicJsonDocument gameResults(1024);
char jsonGameResultsDeser[128];  // Deserialized
char jsonGameResultsSer[128]; // Seriailized

// update
void UpdateGameResults( bool p_winner)
{
  // update gameResults
  gameResults["spelcode"] = gameCode;
  gameResults["jagersWinnen"] = p_winner;
  gameResults["inProgress"] = 0;

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