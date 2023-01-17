#include "libraries.h"

#define numLeds 12
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

int melody[] = {NOTE_E4, NOTE_E4, NOTE_D4, NOTE_CS4};

int beat = 200;
int duration[] = {3.1 * beat, 3.1 * beat, 2 * beat, 5 * beat};

// general operations
void connect()
{
  Serial.println("connecting to WiFi");
  // verbind met wifi
  while (WiFi.status() != WL_CONNECTED)
  {
    Serial.print('.');
    delay(500);
  }
  Serial.println("connected");

  // connect to MQTT
  Serial.println("connecting to MQTT Broker");
  // get client, user and pass from your broker
  while (!client.connect("esp", "", ""))
  {
    Serial.print('.');
    delay(500);
  }

  for (byte i = 0; i < topicCount; i++) // loop through all topics (< topicCount because start counting at 0)
  {
    client.subscribe(topics[i]);
  }

  Serial.println("connected");
}

void MessageReceived(String &topic, String &payload)
{
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
  client.publish("connect", "1");
}

void loop()
{
  if (client.connected())
  {
    client.loop();
    RFIDTagged();
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

void RFIDTagged()
{
  if (gameInProgress)
  {
    if (mfrc522.PICC_IsNewCardPresent())
    {
      gameInProgress = 0;
      winner = 1;
    }
    else
    {
      for (byte i = 0; i <= numLeds; i++)
      {
        leds[i] = CRGB(0, 255, 0);
      }
      FastLED.show();
    }
  }
  else
  {
    if (winner) // jagers winnen
    {
      publishGameResults(1);
      WinSequence();
    }
    else // jagers verliezen
    {
      publishGameResults(0);
      LosingSequence();
    }
  }
}

void LosingSequence()
{
  ledcWrite(channel, 255);
  for (int thisNote = 0; thisNote < 4; thisNote++)
  {
    ledcWriteTone(channel, melody[thisNote]);
    for (byte i = 0; i <= numLeds; i++)
    {
      leds[i] = CRGB(255, 0, 0);
    }
    FastLED.show();
    delay(duration[thisNote]);

    ledcWriteTone(channel, 0);
    for (byte i = 0; i <= numLeds; i++)
    {
      leds[i] = CRGB(0, 0, 0);
    }
    FastLED.show();
    delay(50);
  }
}

void publishGameResults(bool winner)
{
  UpdateGameResults(millis(), winner);
  serializeJson(gameResults, jsonGameResultsSer);
  client.publish("gameResults", jsonGameResultsSer);
}

void ProcessMessage(byte index, String &payload)
{
  switch (index)
  {
  case 0:
    deserializeJson(gameInfo, payload);
    if (gameInfo["inProgress"] == true)
    {
      timeLimit = gameInfo["timeLimit"];
      currDuration = gameInfo["runTime"];
      Serial.println("Game started");
    }
    else
    {
      // we'll see what we do here
    }
    break;

  case 1:
    // shouldn't do anything as far as i know
    break;

  case 2:
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

// remeber to write code to force win and loss for demo