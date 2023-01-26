#include "libraries.h"

#define numLeds 12 // on pin 4
//
#define SS_PIN 21
#define RST_PIN 22
#define SIZE_BUFFER 18
#define MAX_SIZE_BLOCK 16
//
#define BUZZER_PIN 15

bool ledStatus = 0;
byte ledOff[] = {10, 11, 12};

CRGB leds[numLeds];

MFRC522::MIFARE_Key key;
MFRC522 mfrc522(SS_PIN, RST_PIN);

WiFiClient net;
MQTTClient client;

// pwm settings
int freq = 2000;
int channel = 0;
int resolution = 8;

int loseMelody[] = {NOTE_E4, NOTE_E4, NOTE_D4, NOTE_CS4};
int winMelody[] =
    {
        NOTE_A5, NOTE_A5, NOTE_A5, NOTE_AS5, NOTE_B5, NOTE_CS6, NOTE_D6};

int beat = 500;
int quarterBeat = 0.25 * beat;
int duration[] = {4 * quarterBeat, 4 * quarterBeat, 3 * quarterBeat, 2 * beat}; // beat 200
int winDuration[] = {quarterBeat, quarterBeat, quarterBeat, quarterBeat, quarterBeat, quarterBeat, 2 * beat};

// general operations
void connect()
{
  Serial.println("connecting to WiFi");
  // verbind met wifi
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(10);
    LedLoad();
  }
  Serial.println("connected");

  // connect to MQTT
  Serial.println("connecting to MQTT Broker");
  // get client, user and pass from your broker
  while (!client.connect("esp", "", ""))
  {
    delay(10);
    LedLoad();
  }

  for (byte i = 0; i < topicCount; i++) // loop through all topics (< topicCount because start counting at 0)
  {
    client.subscribe(topics[i]);
  }

  Serial.println("connected");
}

void MessageReceived(String &topic, String &payload)
{
  Serial.println(topic);
  Serial.println(payload);

  for (byte i = 0; i < topicCount; i++) // loop through all topics (< topicCount because start counting at 0)
  {
    if (topic == topics[i])
    {
      ProcessMessage(i, payload);
    }
  }
}

void initLEDs()
{
  FastLED.addLeds<NEOPIXEL, 4>(leds, numLeds);
  // turnoff all leds
  for (byte i = 0; i <= numLeds; i++)
  {
    leds[i] = CRGB(0, 0, 0);
  }
  FastLED.show();
}

void initBuzzer()
{
  ledcSetup(channel, freq, resolution);
  ledcAttachPin(BUZZER_PIN, channel);
}

void initRFID()
{
  SPI.begin();
  mfrc522.PCD_Init();
}

// Main part
void setup()
{
  // beging Serial
  Serial.begin(115200);
  WiFi.begin(ssid, pass);
  client.begin(IP, net);
  client.onMessage(MessageReceived);
  initLEDs();
  initBuzzer();
  initRFID();
  connect();
}

void loop()
{
  if (client.connected())
  {
    client.loop();
    RunGame();
    mfrc522.PICC_HaltA();
    mfrc522.PCD_StopCrypto1();
  }
  else
  {
    UpdateDeviceAvailability(client.connected());
    connect();
  }
}

// functions
void LedLoad()
{
  int pBright = 255;

  for (byte j = 0; j < numLeds; j++)
  {
    for (byte i = 0; i < 4; i++)
    {
      leds[ledOff[i]] = CRGB(0, 0, 0);
      byte led = j + i;
      if (led >= numLeds)
      {
        led -= numLeds;
      }
      leds[led] = CRGB(0, pBright, 0);
      ledOff[i] = j;
    }
    delay(50);
    FastLED.show();
  }
}

void RunGame()
{
  if (gameInProgress)
  {
    gameOver = 0;
    if (mfrc522.PICC_IsNewCardPresent())
    {
      winner = 1;
      // gameInProgress = 0;
      publishGameResults(winner);
      gameOver = 1;
      Serial.println("test lose");
    }
    else
    {
      Serial.print('.');
      for (byte i = 0; i <= numLeds; i++)
      {
        leds[i] = CRGB(0, 255, 0);
      }
      FastLED.show();
    }
  }

  else if (gameOver)
  {
    gameOver = 0;
    if (winner) // jagers winnen
    {
      LosingSequence();
    }
    else // jagers verliezen
    {
      Serial.println("win");
      WinSequence();
    }
  }
}

void WinSequence()
{
  ledcWrite(channel, 255);
  for (int thisNote = 0; thisNote < 7; thisNote++)
  {
    ledcWriteTone(channel, winMelody[thisNote]);
    FillLedsClr(0, 255, 0);
    delay(winDuration[thisNote]);
    FillLedsClr(0, 0, 0);
    ledcWriteTone(channel, 0);
    delay(20);
  }
}

void LosingSequence()
{
  ledcWrite(channel, 255);
  for (int thisNote = 0; thisNote < 4; thisNote++)
  {
    ledcWriteTone(channel, loseMelody[thisNote]);
    FillLedsClr(255, 0, 0);
    delay(duration[thisNote]);

    ledcWriteTone(channel, 0);
    FillLedsClr(0, 0, 0);
    FastLED.show();
    delay(50);
  }
}

void publishGameResults(bool winner)
{
  UpdateGameResults(winner);
  serializeJson(gameResults, jsonGameResultsSer);
  client.publish("hetJachtSeizoen/gameResults", jsonGameResultsSer);
}

void ProcessMessage(byte index, String &payload)
{
  switch (index)
  {
  case 0: // GameInfo on start up
    if (!gameInProgress)
    {
      deserializeJson(gameInfo, payload);
      gameInProgress = gameInfo["inProgress"]; // should be 1
      gameCode = gameInfo["spelcode"];
      //      Serial.print();
      Serial.println("game info processed");
    }
    break;

  case 1: // game Results
    deserializeJson(gameResults, payload);
    if (1) // DO NOT REMOVE OR CODE BREAKS
    {
      const char *rcvdGameCode = gameResults["spelcode"];
      Serial.println(rcvdGameCode);
      Serial.println(gameCode);
      if (String(gameCode) == String(rcvdGameCode))
      {
        Serial.println("logic works");
        winner = gameResults["jagersWinnen"];
        gameInProgress = gameResults["inProgress"]; // should be 0
        gameOver = 1;
      }
    }
    Serial.println("game results processed");
    break;

  case 2: // device availability
    deserializeJson(deviceAvailability, payload);
    const char *msgType = deviceAvailability["type"];

    Serial.println("Device availability requested");
    Serial.println(payload);
    UpdateDeviceAvailability(client.connected());
    if (String(msgType) == "request")
    {
      Serial.print("passed");
      client.publish(topics[index], jsonDeviceAvailabilitySer);
    }
    break;
  }
}

void FillLedsClr(byte red, byte green, byte blue)
{
  for (byte i = 0; i <= numLeds; i++)
  {
    leds[i] = CRGB(red, green, blue);
  }
  FastLED.show();
}