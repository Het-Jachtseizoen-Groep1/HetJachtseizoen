#include "pitches.h"

int freq = 2000;
int channel = 0;
int resolution = 8;

// chords: C4 D3 C3 G3
int winMelody[] = 
{
  NOTE_DS5, NOTE_DS5, NOTE_DS5, NOTE_AS5, NOTE_B5, NOTE_CS6, NOTE_D6
};

int duration[] = {125, 125, 125, 125, 125, 125, 400};

void setup() {
  
  Serial.begin(115200);
  ledcSetup(channel, freq, resolution);
  ledcAttachPin(15, channel);
  
}
  ////notes d5*3 bm7*2 G5 

void loop() 
{
  
  ledcWrite(channel, 255);
  for (int thisNote = 0; thisNote < 7; thisNote++) {
     ledcWriteTone(channel, winMelody[thisNote]);
     delay(duration[thisNote]);
     ledcWriteTone(channel, 0);
     delay(15);
  }  
  delay(1000);
}
