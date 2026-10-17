#include <WiFi.h>
#include <WebServer.h>
#include <DHT.h>
#include <HTTPClient.h>


// AGRISCAN - ESP32


// WIFI

const char* ssid = "Wokwi-GUEST";
const char* password = "";


// DEVICE

const char* deviceCode = "AG-001";

const char* backendURL =
    "http://host.wokwi.internal:3000";

const char* serverURL =
    "http://host.wokwi.internal:3000/api/scans";


// PINS
#define STEP_PIN 18
#define DIR_PIN 19
#define BUTTON_PIN 23

// Moisture
#define SOIL_PIN 34

// pH
#define PH_PIN 35

// Nitrogen
#define NITROGEN_PIN 32

// Phosphorus
#define PHOSPHORUS_PIN 33

// Potassium
#define POTASSIUM_PIN 36

// Temperature
#define DHT_PIN 27


// DHT
#define DHT_TYPE DHT22

DHT dht(
    DHT_PIN,
    DHT_TYPE
);


WebServer server(80);


// MOVE STEPPER MOTOR
void moveMotor(int steps) {

    digitalWrite(
        DIR_PIN,
        HIGH
    );

    for (int i = 0; i < steps; i++) {

        digitalWrite(
            STEP_PIN,
            HIGH
        );

        delayMicroseconds(800);

        digitalWrite(
            STEP_PIN,
            LOW
        );

        delayMicroseconds(800);
    }
}



// GET DEVICE FARM ID
int getDeviceFarmId() {

    if (
        WiFi.status() !=
        WL_CONNECTED
    ) {

        Serial.println(
            "WiFi is not connected!"
        );

        return -1;
    }


    HTTPClient http;


    String deviceURL =
        String(backendURL) +
        "/api/devices/" +
        String(deviceCode);


    Serial.println();

    Serial.println(
        "Checking device connection..."
    );


    Serial.print(
        "Device: "
    );

    Serial.println(
        deviceCode
    );


    http.begin(
        deviceURL
    );


    int httpCode =
        http.GET();


    if (httpCode > 0) {

        Serial.print(
            "Device API response code: "
        );

        Serial.println(
            httpCode
        );


        String response =
            http.getString();


        Serial.println(
            "Device API response:"
        );

        Serial.println(
            response
        );


        if (httpCode == 200) {

            int farmIdPosition =
                response.indexOf(
                    "\"farm_id\":"
                );


            if (
                farmIdPosition != -1
            ) {

                int start =
                    farmIdPosition +
                    10;


                int end =
                    response.indexOf(
                        ",",
                        start
                    );


                if (end == -1) {

                    end =
                        response.indexOf(
                            "}",
                            start
                        );
                }


                String farmIdString =
                    response.substring(
                        start,
                        end
                    );


                farmIdString.trim();


                int farmId =
                    farmIdString.toInt();


                Serial.print(
                    "Current Farm ID: "
                );

                Serial.println(
                    farmId
                );


                http.end();


                return farmId;
            }
        }

    } else {

        Serial.print(
            "Device request failed: "
        );

        Serial.println(
            http.errorToString(
                httpCode
            )
        );
    }


    http.end();


    return -1;
}


// CHECK FOR PENDING SCAN REQUEST
bool checkForScanRequest(
    int &farmId,
    int &scanRequestId
) {

    if (
        WiFi.status() !=
        WL_CONNECTED
    ) {

        return false;
    }


    HTTPClient http;


    String requestURL =
        String(backendURL) +
        "/api/scan-requests/device/" +
        String(deviceCode);


    http.begin(
        requestURL
    );


    int httpCode =
        http.GET();


    // NO SCAN REQUEST
    if (httpCode == 204) {

        http.end();

        return false;
    }


    // SCAN REQUEST FOUND
    if (httpCode == 200) {

        String response =
            http.getString();


        Serial.println();

        Serial.println(
            "================================"
        );

        Serial.println(
            "Scan request received!"
        );

        Serial.println(
            "================================"
        );


        Serial.println(
            response
        );


    
        // GET SCAN REQUEST ID
        int requestIdPosition =
            response.indexOf(
                "\"scan_request_id\":"
            );


        if (
            requestIdPosition != -1
        ) {

            int start =
                requestIdPosition +
                18;


            int end =
                response.indexOf(
                    ",",
                    start
                );


            if (end == -1) {

                end =
                    response.indexOf(
                        "}",
                        start
                    );
            }


            String requestIdString =
                response.substring(
                    start,
                    end
                );


            requestIdString.trim();


            scanRequestId =
                requestIdString.toInt();


            Serial.print(
                "Scan Request ID: "
            );

            Serial.println(
                scanRequestId
            );
        }


        // GET FARM ID
        int farmIdPosition =
            response.indexOf(
                "\"farm_id\":"
            );


        if (
            farmIdPosition != -1
        ) {

            int start =
                farmIdPosition +
                10;


            int end =
                response.indexOf(
                    ",",
                    start
                );


            if (end == -1) {

                end =
                    response.indexOf(
                        "}",
                        start
                    );
            }


            String farmIdString =
                response.substring(
                    start,
                    end
                );


            farmIdString.trim();


            farmId =
                farmIdString.toInt();


            Serial.print(
                "Scan Farm ID: "
            );

            Serial.println(
                farmId
            );
        }


        http.end();


        return (
            farmId > 0 &&
            scanRequestId > 0
        );
    }


    // REQUEST ERROR
    if (httpCode > 0) {

        Serial.print(
            "Scan request response code: "
        );

        Serial.println(
            httpCode
        );

    } else {

        Serial.print(
            "Scan request failed: "
        );

        Serial.println(
            http.errorToString(
                httpCode
            )
        );
    }


    http.end();


    return false;
}


// SEND SCAN TO BACKEND
void sendScanToBackend(
    int farmId,
    int scanRequestId,
    int moisture,
    float temperature,
    float ph,
    float nitrogen,
    float phosphorus,
    float potassium
) {

    if (
        WiFi.status() !=
        WL_CONNECTED
    ) {

        Serial.println(
            "WiFi is not connected!"
        );

        return;
    }


    if (farmId <= 0) {

        Serial.println(
            "No valid farm is connected to this device."
        );

        return;
    }


    if (scanRequestId <= 0) {

        Serial.println(
            "No valid scan request ID."
        );

        return;
    }


    HTTPClient http;


    http.begin(
        serverURL
    );


    http.addHeader(
        "Content-Type",
        "application/json"
    );

    http.addHeader(
        "X-Device-Code",
        deviceCode
    );


    String jsonData = "{";


    // FARM ID
    jsonData +=
        "\"farm_id\":" +
        String(farmId) +
        ",";


    // SCAN REQUEST ID
    jsonData +=
        "\"scan_request_id\":" +
        String(scanRequestId) +
        ",";


    // MOISTURE
    jsonData +=
        "\"moisture\":" +
        String(moisture) +
        ",";


    // TEMPERATURE
    jsonData +=
        "\"temperature\":" +
        String(temperature, 2) +
        ",";


    // pH
    jsonData +=
        "\"ph\":" +
        String(ph, 2) +
        ",";


    // NITROGEN
    jsonData +=
        "\"nitrogen\":" +
        String(nitrogen, 2) +
        ",";


    // PHOSPHORUS
    jsonData +=
        "\"phosphorus\":" +
        String(phosphorus, 2) +
        ",";


    // POTASSIUM
    jsonData +=
        "\"potassium\":" +
        String(potassium, 2);


    jsonData += "}";


    // SEND DATA
    Serial.println();

    Serial.println(
        "Sending scan measurements to backend..."
    );


    Serial.println(
        jsonData
    );


    int httpCode =
        http.POST(
            jsonData
        );


    if (httpCode > 0) {

        Serial.print(
            "Backend response code: "
        );

        Serial.println(
            httpCode
        );


        String response =
            http.getString();


        Serial.println(
            "Backend response:"
        );


        Serial.println(
            response
        );

    } else {

        Serial.print(
            "Backend request failed: "
        );

        Serial.println(
            http.errorToString(
                httpCode
            )
        );
    }


    http.end();
}


// SETUP
void setup() {

    Serial.begin(
        115200
    );



    // STEPPER
    pinMode(
        STEP_PIN,
        OUTPUT
    );


    pinMode(
        DIR_PIN,
        OUTPUT
    );


    // BUTTON
    pinMode(
        BUTTON_PIN,
        INPUT_PULLUP
    );


    // ANALOG INPUTS
    pinMode(
        SOIL_PIN,
        INPUT
    );


    pinMode(
        PH_PIN,
        INPUT
    );


    pinMode(
        NITROGEN_PIN,
        INPUT
    );


    pinMode(
        PHOSPHORUS_PIN,
        INPUT
    );


    pinMode(
        POTASSIUM_PIN,
        INPUT
    );



    // DHT
    dht.begin();


    // WIFI
    WiFi.begin(
        ssid,
        password
    );


    Serial.print(
        "Connecting to WiFi"
    );


    while (
        WiFi.status() !=
        WL_CONNECTED
    ) {

        delay(500);

        Serial.print(
            "."
        );
    }


    Serial.println();

    Serial.println(
        "WiFi connected!"
    );


    Serial.print(
        "ESP32 IP: "
    );

    Serial.println(
        WiFi.localIP()
    );


    
    // WEB SERVER
    server.on(
        "/",
        []() {

            server.send(
                200,
                "text/plain",
                "AgriScan ESP32 is working!"
            );

        }
    );


    server.begin();


    // READY
    Serial.println(
        "AgriScan Ready"
    );


    Serial.print(
        "Device Code: "
    );

    Serial.println(
        deviceCode
    );
}


// LOOP
void loop() {

    server.handleClient();


    // CHECK FOR SCAN REQUEST
    int requestedFarmId = -1;

    int scanRequestId = -1;


    if (
        checkForScanRequest(
            requestedFarmId,
            scanRequestId
        )
    ) {

        Serial.println();

        Serial.println(
            "================================"
        );

        Serial.println(
            "Starting soil scan..."
        );

        Serial.println(
            "================================"
        );


        int farmId =
            requestedFarmId;


        Serial.print(
            "Scan will be saved for Farm ID: "
        );

        Serial.println(
            farmId
        );


        Serial.print(
            "Scan Request ID: "
        );

        Serial.println(
            scanRequestId
        );


        // MOVE DEVICE
        moveMotor(
            200
        );


        // READ MOISTURE
        int soilRaw =
            analogRead(
                SOIL_PIN
            );


        int moisture =
            map(
                soilRaw,
                4095,
                0,
                0,
                100
            );


        moisture =
            constrain(
                moisture,
                0,
                100
            );


        // READ TEMPERATURE
        float temperature =
            dht.readTemperature();


        if (
            isnan(
                temperature
            )
        ) {

            temperature =
                25.0;

            Serial.println(
                "DHT22 reading failed. Using fallback temperature: 25.00"
            );
        }



        // READ pH
        int phRaw =
            analogRead(
                PH_PIN
            );


        float ph =
            3.0 +
            (
                (float)phRaw /
                4095.0
            ) * 6.0;


        ph =
            constrain(
                ph,
                3.0,
                9.0
            );


        // READ NITROGEN
        int nitrogenRaw =
            analogRead(
                NITROGEN_PIN
            );


        float nitrogen =
            (
                (float)nitrogenRaw /
                4095.0
            ) * 100.0;


        nitrogen =
            constrain(
                nitrogen,
                0.0,
                100.0
            );


        // READ PHOSPHORUS
        int phosphorusRaw =
            analogRead(
                PHOSPHORUS_PIN
            );


        float phosphorus =
            (
                (float)phosphorusRaw /
                4095.0
            ) * 100.0;


        phosphorus =
            constrain(
                phosphorus,
                0.0,
                100.0
            );


        // READ POTASSIUM
        int potassiumRaw =
            analogRead(
                POTASSIUM_PIN
            );


        float potassium =
            (
                (float)potassiumRaw /
                4095.0
            ) * 100.0;


        potassium =
            constrain(
                potassium,
                0.0,
                100.0
            );


        // PRINT MEASUREMENTS
        Serial.println();

        Serial.println(
            "================================"
        );

        Serial.println(
            "SCAN MEASUREMENTS"
        );

        Serial.println(
            "================================"
        );


        Serial.print(
            "Farm ID: "
        );

        Serial.println(
            farmId
        );


        Serial.print(
            "Scan Request ID: "
        );

        Serial.println(
            scanRequestId
        );


        Serial.print(
            "Moisture: "
        );

        Serial.print(
            moisture
        );

        Serial.println(
            "%"
        );


        Serial.print(
            "Temperature: "
        );

        Serial.print(
            temperature,
            2
        );

        Serial.println(
            " C"
        );


        Serial.print(
            "pH: "
        );

        Serial.println(
            ph,
            2
        );


        Serial.print(
            "Nitrogen: "
        );

        Serial.println(
            nitrogen,
            2
        );


        Serial.print(
            "Phosphorus: "
        );

        Serial.println(
            phosphorus,
            2
        );


        Serial.print(
            "Potassium: "
        );

        Serial.println(
            potassium,
            2
        );


        // SEND MEASUREMENTS TO BACKEND
        sendScanToBackend(
            farmId,
            scanRequestId,
            moisture,
            temperature,
            ph,
            nitrogen,
            phosphorus,
            potassium
        );


        Serial.println();

        Serial.println(
            "Soil scan completed."
        );

        Serial.println();
    }


    // WAIT BEFORE CHECKING AGAIN
    delay(
        1000
    );
}