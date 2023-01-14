#include "pitches.h"

int freq = 2000;
int channel = 0;
int resolution = 8;

// chords: C4 D3 C3 G3
int melody[] = {
  NOTE_D6, NOTE_CS6, NOTE_C6, NOTE_B5
  };
int duration[] = {750, 750, 750, 1500};

void setup() {
  
  Serial.begin(115200);
  ledcSetup(channel, freq, resolution);
  ledcAttachPin(18, channel);
  
}
  
void loop() {
  
  ledcWrite(channel, 255);
  for (int thisNote = 0; thisNote < 4; thisNote++) {
     ledcWriteTone(channel, melody[thisNote]);
     delay(duration[thisNote]);
     ledcWriteTone(channel, 0);
     delay(150);
  }  
}
