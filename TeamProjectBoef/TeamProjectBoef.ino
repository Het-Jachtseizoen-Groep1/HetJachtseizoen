#include "libraries.h"
/*"CustomWiFiAuth.h"
const char ssid[] = "xxx";
const char pass[] = "xxx";
*/

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
  Serial.begin(9600);

  WiFi.begin(ssid, pass);
  mqttClient.begin("brokerURL", wifi);

//  Wire.begin();
  FastLED.addLeds<NEOPIXEL, 4>(leds, numLeds);

  // pwm for buzzer
  ledcSetup(channel, freq, resolution);
  ledcAttachPin(BUZZER_PIN, channel);
  //LedLoad();
  SPI.begin();
  mfrc522.PCD_Init();

   for (byte i = 0; i <= numLeds; i++)
      {
        leds[i] = CRGB(0, 0, 0);
      }
      FastLED.show();
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
  
  
  RFIDTagged();
  mfrc522.PICC_HaltA();
  mfrc522.PCD_StopCrypto1();
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

    if (!gameOver)
  {
      if (mfrc522.PICC_IsNewCardPresent() )
  {
    
       PlayerTagged();
    
    gameOver = 1;
  }
  else
  {
    {
       for (byte i = 0; i <= numLeds; i++)
      {
        leds[i] = CRGB(0, 255, 0);
      }
      FastLED.show();
    }
}
}
else{
  delay(2500);
  gameOver=0;
}
}

void PlayerTagged()
{
  // publishData
  //  client.publish("/gameEnd", 1);
  
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
