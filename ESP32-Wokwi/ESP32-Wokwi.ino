#include <WiFi.h>
#include <WebServer.h>
#include <DHT.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>

// AGRISCAN - ESP32

// WIFI
const char* ssid = "Wokwi-GUEST";
const char* password = "";

// DEVICE
const char* deviceCode = "AG-001";

const char* backendURL =
    "https://accelerator-standard-giraffe.abasthan.app";

const char* serverURL =
    "https://accelerator-standard-giraffe.abasthan.app/api/scans";

// PINS
#define STEP_PIN 18
#define DIR_PIN 19
#define BUTTON_PIN 23

// SENSORS
#define SOIL_PIN 34
#define PH_PIN 35
#define NITROGEN_PIN 32
#define PHOSPHORUS_PIN 33
#define POTASSIUM_PIN 36
#define DHT_PIN 27

// DHT
#define DHT_TYPE DHT22
DHT dht(DHT_PIN, DHT_TYPE);

WebServer server(80);

// MOVE STEPPER MOTOR
void moveMotor(int steps) {
    digitalWrite(DIR_PIN, HIGH);

    for (int i = 0; i < steps; i++) {
        digitalWrite(STEP_PIN, HIGH);
        delayMicroseconds(800);
        digitalWrite(STEP_PIN, LOW);
        delayMicroseconds(800);
    }
}

// GET DEVICE FARM ID
int getDeviceFarmId() {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("WiFi is not connected!");
        return -1;
    }

    WiFiClientSecure client;
    client.setInsecure();

    HTTPClient http;

    String deviceURL =
        String(backendURL) +
        "/api/devices/" +
        String(deviceCode);

    Serial.println();
    Serial.println("Checking device connection...");
    Serial.print("Device: ");
    Serial.println(deviceCode);

    if (!http.begin(client, deviceURL)) {
        Serial.println("Failed to initialize device request.");
        return -1;
    }

    int httpCode = http.GET();

    if (httpCode > 0) {
        Serial.print("Device API response code: ");
        Serial.println(httpCode);

        String response = http.getString();

        Serial.println("Device API response:");
        Serial.println(response);

        if (httpCode == 200) {
            int farmIdPosition = response.indexOf("\"farm_id\":");

            if (farmIdPosition != -1) {
                int start = farmIdPosition + 10;
                int end = response.indexOf(",", start);

                if (end == -1) {
                    end = response.indexOf("}", start);
                }

                if (end != -1) {
                    String farmIdString =
                        response.substring(start, end);

                    farmIdString.trim();

                    int farmId = farmIdString.toInt();

                    Serial.print("Current Farm ID: ");
                    Serial.println(farmId);

                    http.end();
                    return farmId;
                }
            }
        }
    } else {
        Serial.print("Device request failed: ");
        Serial.println(http.errorToString(httpCode));
    }

    http.end();
    return -1;
}

// CHECK FOR PENDING SCAN REQUEST
bool checkForScanRequest(int &farmId, int &scanRequestId) {
    if (WiFi.status() != WL_CONNECTED) {
        return false;
    }

    WiFiClientSecure client;
    client.setInsecure();

    HTTPClient http;

    String requestURL =
        String(backendURL) +
        "/api/scan-requests/device/" +
        String(deviceCode);

    if (!http.begin(client, requestURL)) {
        Serial.println("Failed to initialize scan request.");
        return false;
    }

    int httpCode = http.GET();

    // NO SCAN REQUEST
    if (httpCode == 204) {
        http.end();
        return false;
    }

    // SCAN REQUEST FOUND
    if (httpCode == 200) {
        String response = http.getString();

        Serial.println();
        Serial.println("================================");
        Serial.println("Scan request received!");
        Serial.println("================================");
        Serial.println(response);

        // GET SCAN REQUEST ID
        int requestIdPosition =
            response.indexOf("\"scan_request_id\":");

        if (requestIdPosition != -1) {
            int start = requestIdPosition + 18;
            int end = response.indexOf(",", start);

            if (end == -1) {
                end = response.indexOf("}", start);
            }

            if (end != -1) {
                String requestIdString =
                    response.substring(start, end);

                requestIdString.trim();
                scanRequestId = requestIdString.toInt();

                Serial.print("Scan Request ID: ");
                Serial.println(scanRequestId);
            }
        }

        // GET FARM ID
        int farmIdPosition =
            response.indexOf("\"farm_id\":");

        if (farmIdPosition != -1) {
            int start = farmIdPosition + 10;
            int end = response.indexOf(",", start);

            if (end == -1) {
                end = response.indexOf("}", start);
            }

            if (end != -1) {
                String farmIdString =
                    response.substring(start, end);

                farmIdString.trim();
                farmId = farmIdString.toInt();

                Serial.print("Scan Farm ID: ");
                Serial.println(farmId);
            }
        }

        http.end();

        return (farmId > 0 && scanRequestId > 0);
    }

    // REQUEST ERROR
    if (httpCode > 0) {
        Serial.print("Scan request response code: ");
        Serial.println(httpCode);
    } else {
        Serial.print("Scan request failed: ");
        Serial.println(http.errorToString(httpCode));
    }

    http.end();
    return false;
}

// SEND SCAN TO BACKEND
bool sendScanToBackend(
    int farmId,
    int scanRequestId,
    int moisture,
    float temperature
) {
    if (WiFi.status() != WL_CONNECTED || farmId <= 0 || scanRequestId <= 0) {
        Serial.println("Invalid WiFi, farm ID, or scan request ID.");
        return false;
    }

    WiFiClientSecure client;
    client.setInsecure();

    HTTPClient http;

    if (!http.begin(client, serverURL)) {
        Serial.println("Failed to initialize backend request.");
        return false;
    }

    http.addHeader("Content-Type", "application/json");
    http.addHeader("X-Device-Code", deviceCode);

    String jsonData = "{";
    jsonData += "\"farm_id\":" + String(farmId) + ",";
    jsonData += "\"scan_request_id\":" + String(scanRequestId) + ",";
    jsonData += "\"moisture\":" + String(moisture) + ",";
    jsonData += "\"temperature\":" + String(temperature, 2) + ",";
    jsonData += "\"ph\":null,";
    jsonData += "\"nitrogen\":null,";
    jsonData += "\"phosphorus\":null,";
    jsonData += "\"potassium\":null";
    jsonData += "}";

    Serial.println("Sending real measurements to backend...");
    Serial.println(jsonData);

    int httpCode = http.POST(jsonData);

    bool success = false;

    if (httpCode > 0) {
        Serial.print("Backend response code: ");
        Serial.println(httpCode);

        String response = http.getString();
        Serial.println(response);

        success = (httpCode == 201);
    } else {
        Serial.println(http.errorToString(httpCode));
    }

    http.end();
    return success;
}

// SETUP
void setup() {
    Serial.begin(115200);

    // STEPPER
    pinMode(STEP_PIN, OUTPUT);
    pinMode(DIR_PIN, OUTPUT);

    // BUTTON
    pinMode(BUTTON_PIN, INPUT_PULLUP);

    // ANALOG INPUTS
    pinMode(SOIL_PIN, INPUT);
    pinMode(PH_PIN, INPUT);
    pinMode(NITROGEN_PIN, INPUT);
    pinMode(PHOSPHORUS_PIN, INPUT);
    pinMode(POTASSIUM_PIN, INPUT);

    // DHT
    dht.begin();

    // WIFI
    WiFi.begin(ssid, password);

    Serial.print("Connecting to WiFi");

    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }

    Serial.println();
    Serial.println("WiFi connected!");

    WiFiClientSecure testClient;
testClient.setInsecure();

HTTPClient testHttp;
testHttp.setTimeout(15000);
testHttp.setConnectTimeout(15000);

Serial.println("Testing HTTPS connection...");

if (testHttp.begin(testClient, "https://www.google.com")) {
    int code = testHttp.GET();
    Serial.print("Google HTTPS result: ");
    Serial.println(code);
    testHttp.end();
}

WiFiClientSecure backendClient;
backendClient.setInsecure();

HTTPClient backendHttp;
backendHttp.setTimeout(15000);
backendHttp.setConnectTimeout(15000);

Serial.println("Testing Abasthan HTTPS...");

if (backendHttp.begin(backendClient, "https://accelerator-standard-giraffe.abasthan.app/")) {
    int code = backendHttp.GET();
    Serial.print("Abasthan HTTPS result: ");
    Serial.println(code);
    Serial.println(backendHttp.getString());
    backendHttp.end();
}

WiFiClientSecure scanTestClient;
scanTestClient.setInsecure();

HTTPClient scanTestHttp;
scanTestHttp.setReuse(false);
scanTestHttp.setTimeout(20000);
scanTestHttp.setConnectTimeout(20000);

String scanTestURL = String(backendURL) +
    "/api/scan-requests/device/" + deviceCode;

Serial.println("Testing actual scan request endpoint...");

if (scanTestHttp.begin(scanTestClient, scanTestURL)) {
    int code = scanTestHttp.GET();

    Serial.print("Scan endpoint HTTP code: ");
    Serial.println(code);

    Serial.println("Scan endpoint response:");
    Serial.println(scanTestHttp.getString());

    scanTestHttp.end();
}

scanTestClient.stop();

    Serial.print("ESP32 IP: ");
    Serial.println(WiFi.localIP());

    // TEST CONNECTION TO AGRISCAN BACKEND
Serial.println();
Serial.println("Testing AgriScan backend connection...");

IPAddress backendIP;

if (WiFi.hostByName("accelerator-standard-giraffe.abasthan.app", backendIP)) {
    Serial.print("Backend IP: ");
    Serial.println(backendIP);

    WiFiClientSecure testClient;
    testClient.setInsecure();

    if (testClient.connect("accelerator-standard-giraffe.abasthan.app", 443)) {
    Serial.println("HTTPS connection successful!");
    testClient.stop();
} else {
    Serial.println("HTTPS connection failed!");

    char errorBuffer[160];
    testClient.lastError(errorBuffer, sizeof(errorBuffer));

    Serial.print("TLS Error: ");
    Serial.println(errorBuffer);
}
} else {
    Serial.println("DNS resolution failed!");
}

    // LOCAL ESP32 WEB SERVER
    server.on("/", []() {
        server.send(
            200,
            "text/plain",
            "AgriScan ESP32 is working!"
        );
    });

    server.begin();

    // READY
    Serial.println("AgriScan Ready");
    Serial.print("Device Code: ");
    Serial.println(deviceCode);
}

// LOOP
void loop() {
    server.handleClient();

    // CHECK FOR SCAN REQUEST
    int requestedFarmId = -1;
    int scanRequestId = -1;

    if (checkForScanRequest(requestedFarmId, scanRequestId)) {
        Serial.println();
        Serial.println("================================");
        Serial.println("Starting soil scan...");
        Serial.println("================================");

        int farmId = requestedFarmId;

        Serial.print("Scan will be saved for Farm ID: ");
        Serial.println(farmId);

        Serial.print("Scan Request ID: ");
        Serial.println(scanRequestId);

        // MOVE DEVICE
        moveMotor(200);

        // READ MOISTURE
        int soilRaw = analogRead(SOIL_PIN);

        int moisture = map(
            soilRaw,
            4095,
            0,
            0,
            100
        );

        moisture = constrain(moisture, 0, 100);

        // READ TEMPERATURE
        float temperature = dht.readTemperature();

        if (isnan(temperature)) {
            Serial.println("ERROR: DHT22 reading failed. Scan not submitted.");
            delay(1000);
            return;
        }

        // PRINT REAL MEASUREMENTS
        Serial.println();
        Serial.println("================================");
        Serial.println("SCAN MEASUREMENTS");
        Serial.println("================================");

        Serial.print("Farm ID: ");
        Serial.println(farmId);

        Serial.print("Scan Request ID: ");
        Serial.println(scanRequestId);

        Serial.print("Moisture: ");
        Serial.print(moisture);
        Serial.println("%");

        Serial.print("Temperature: ");
        Serial.print(temperature, 2);
        Serial.println(" C");

        Serial.println("pH: Unavailable - no real sensor");
        Serial.println("Nitrogen: Unavailable - no real sensor");
        Serial.println("Phosphorus: Unavailable - no real sensor");
        Serial.println("Potassium: Unavailable - no real sensor");

        bool submitted = sendScanToBackend(
            farmId,
            scanRequestId,
            moisture,
            temperature
        );

        Serial.println();

        if (submitted) {
            Serial.println("Scan submitted successfully.");
        } else {
            Serial.println("Scan submission failed.");
        }
    }

    // WAIT BEFORE CHECKING AGAIN
    delay(1000);
}