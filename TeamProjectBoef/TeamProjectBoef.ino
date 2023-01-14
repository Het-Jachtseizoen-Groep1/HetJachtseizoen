#include <MFRC522.h>
#include <SPI.h>
#include <FastLED.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <WiFi.h>
#include <MQTT.h>
#include "pitches.h"
#include "CustomWiFiAuth.h"
/*"CustomWiFiAuth.h"
const char ssid[] = "xxx";
const char pass[] = "xxx";
*/

#define numLeds 12
#define SS_PIN 5
#define RST_PIN 0
#define BUZZER_PIN 18

bool ledStatus = 0;
byte ledOff[] = {10, 11, 12};

byte nuidPICC[4] = {0, 0, 0, 0};

CRGB leds[numLeds];

MFRC522::MIFARE_Key key;
MFRC522 rfid = MFRC522(SS_PIN, RST_PIN);

WiFiClient wifi;
MQTTClient mqttClient;

// pwm settings
int freq = 2000;
int channel = 0;
int resolution = 8;

int melody[] = {
    NOTE_D6, NOTE_CS6, NOTE_C6, NOTE_B5};
int duration[] = {750, 750, 750, 1500};

void setup()
{
  Serial.begin(115200);

  WiFi.begin(ssid, pass);
  mqttClient.begin("brokerURL", wifi);

  Wire.begin();
  FastLED.addLeds<NEOPIXEL, 13>(leds, numLeds);

  // pwm for buzzer
  ledcSetup(channel, freq, resolution);
  ledcAttachPin(18, channel);
}

void loop()
{
  // mqtt code
  /*
  if (!mqttClient.connected())
  {
   starConnection();
  }

  mqttClient.loop();

   client.publish("/{key}", value);
  */
  PlayerTagged();

  //  ReadRFID();
  //  LedLoad();
  //  if (RFIDTagged())
  //  {
  //    PlayerTagged();
  //  }
  //
}

void startConnection()
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
  while (!mqttClient.connect("client", "user", "pass"))
  {
    Serial.print('.');
    delay(500);
  }
  Serial.println("connected");
}

void ReadRFID()
{
  // Read RFID card

  for (byte i = 0; i < 6; i++)
  {
    key.keyByte[i] = 0xFF;
  }
  // Look for new 1 cards
  if (!rfid.PICC_IsNewCardPresent())
    return;

  // Verify if the NUID has been readed
  if (!rfid.PICC_ReadCardSerial())
    return;

  // Store NUID into nuidPICC array
  for (byte i = 0; i < 4; i++)
  {
    nuidPICC[i] = rfid.uid.uidByte[i];
  }

  Serial.print(F("RFID In dec: "));
  // printDec(rfid.uid.uidByte, rfid.uid.size);
  Serial.println();

  // Halt PICC
  rfid.PICC_HaltA();

  // Stop encryption on PCD
  rfid.PCD_StopCrypto1();
}

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

void Buzzer()
{
}

bool RFIDTagged()
{
  // code here
  bool tagged = 1;
  return tagged;
}

void PlayerTagged()
{
  // publishData
  //  client.publish("/gameEnd", 1);
  // LED Flash red
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
    delay(150);
  }
}
