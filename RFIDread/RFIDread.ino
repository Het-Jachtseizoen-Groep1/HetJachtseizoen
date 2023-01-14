#include <MFRC522.h> //library responsible for communicating with the module RFID-RC522
#include <SPI.h>     //library responsible for communicating of SPI bus

#define SS_PIN 21
#define RST_PIN 22
#define SIZE_BUFFER 18
#define MAX_SIZE_BLOCK 16

// used in authentication
MFRC522::MIFARE_Key key;
// authentication return status code
MFRC522::StatusCode status;
// Defined pins to module RC522
MFRC522 mfrc522(SS_PIN, RST_PIN);

bool gameOver = 0;

void setup()
{
  // put your setup code here, to run once:
  Serial.begin(9600);
  SPI.begin();
  mfrc522.PCD_Init();
  Serial.println("Approach your reader card...");
  Serial.println();
}

void loop()
{
  delay(50);
  GameOver();

  // instructs the PICC when in the ACTIVE state to go to a "STOP" state
  mfrc522.PICC_HaltA();
  // "stop" the encryption of the PCD, it must be called after communication with authentication, otherwise new communications can not be initiated
  mfrc522.PCD_StopCrypto1();

}

bool GameOver()
{
  if (!gameOver)
  {
      if (mfrc522.PICC_IsNewCardPresent() )
  {
    Serial.println("game over");
    gameOver = 1;
  }
  else
  {
    Serial.println('.');
  }
  }

}
