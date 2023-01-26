#define deviceName "esp32"
const char* gameCode = "0000-0000";
//long gameCode = 0;
bool deviceAvailable = false;

// booleans
bool gameInProgress = 0;
bool gameOver = 0;
bool winner = 0;

// longs
long startTime = 0;
long timeLimit = 10000;
long currDuration = 0;