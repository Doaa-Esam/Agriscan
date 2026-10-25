require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is missing from .env");
}
// AUTHENTICATION MIDDLEWARE
function authenticateToken(req, res, next) {

    const authHeader =
        req.headers.authorization;

    const token =
        authHeader &&
        authHeader.split(" ")[1];


    // NO TOKEN
    if (!token) {

        return res.status(401).json({
            error: "Authentication required"
        });

    }


    // VERIFY TOKEN
    jwt.verify(
        token,
        JWT_SECRET,
        (err, user) => {

            if (err) {

                return res.status(403).json({
                    error: "Invalid or expired token"
                });

            }


            // SAVE USER DATA IN REQUEST
            req.user = user;

            next();

        }
    );

}

app.use(cors());
app.use(express.json());

// IMAGES
app.use("/images", express.static(path.join(__dirname, "images")));


// DATABASE CONNECTION
const isCloudDatabase = process.env.DB_HOST &&
    process.env.DB_HOST !== "localhost";

const db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || (isCloudDatabase ? 4000 : 3306)),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "agriscan",
    ...(isCloudDatabase ? {
        ssl: { minVersion: "TLSv1.2" }
    } : {}),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

db.getConnection((err, connection) => {
    if (err) {
        console.error("MySQL connection failed:", err);
        return;
    }

    console.log("MySQL connected successfully!");
    connection.release();
});

// HOME
app.get("/", (req, res) => {
    res.send("AgriScan Backend is running!");
});

// SCANS

// SAVE NEW SCAN
// Device authenticated using X-Device-Code
app.post(
    "/api/scans",
    (req, res) => {

        const {
            farm_id,
            scan_request_id,
            moisture,
            temperature,
            ph,
            nitrogen,
            phosphorus,
            potassium
        } = req.body;


        // GET DEVICE CODE
        const deviceCode =
            req.headers["x-device-code"];


        // CHECK DEVICE CODE
        if (!deviceCode) {

            return res.status(401).json({
                error: "Device authentication required"
            });

        }


        // CHECK FARM ID
        if (
            farm_id === undefined ||
            farm_id === null ||
            Number(farm_id) <= 0
        ) {

            return res.status(400).json({
                error: "Valid farm_id is required"
            });

        }


        // CHECK SCAN REQUEST ID
        if (
            scan_request_id === undefined ||
            scan_request_id === null ||
            Number(scan_request_id) <= 0
        ) {

            return res.status(400).json({
                error: "Valid scan_request_id is required"
            });

        }


        // CHECK MOISTURE
        if (
            moisture === undefined ||
            moisture === null ||
            !Number.isFinite(Number(moisture))
        ) {

            return res.status(400).json({
                error: "Valid moisture value is required"
            });

        }


        const moistureValue =
            Number(moisture);


        if (
            moistureValue < 0 ||
            moistureValue > 100
        ) {

            return res.status(400).json({
                error: "Moisture must be between 0 and 100"
            });

        }


        // CHECK TEMPERATURE
        if (
            temperature === undefined ||
            temperature === null ||
            !Number.isFinite(Number(temperature))
        ) {

            return res.status(400).json({
                error: "Valid temperature value is required"
            });

        }


        const temperatureValue =
            Number(temperature);


        // CHECK OPTIONAL MEASUREMENTS
        const optionalMeasurements = {
            ph,
            nitrogen,
            phosphorus,
            potassium
        };


        for (
            const [parameter, value]
            of Object.entries(optionalMeasurements)
        ) {

            if (
                value !== undefined &&
                value !== null &&
                !Number.isFinite(Number(value))
            ) {

                return res.status(400).json({
                    error:
                        `${parameter} must be a valid number`
                });

            }

        }


        // CONVERT OPTIONAL VALUES
        const phValue =
            ph === undefined || ph === null
                ? null
                : Number(ph);


        const nitrogenValue =
            nitrogen === undefined || nitrogen === null
                ? null
                : Number(nitrogen);


        const phosphorusValue =
            phosphorus === undefined || phosphorus === null
                ? null
                : Number(phosphorus);


        const potassiumValue =
            potassium === undefined || potassium === null
                ? null
                : Number(potassium);


        // CHECK DEVICE + FARM CONNECTION
        const deviceSql = `
            SELECT
                devices.id,
                devices.device_code,
                devices.name,
                devices.status,
                devices.farm_id,
                farms.name AS farm_name,
                farms.crop_id

            FROM devices

            INNER JOIN farms
                ON devices.farm_id = farms.id

            WHERE
                devices.device_code = ?
                AND devices.farm_id = ?
                AND devices.status = 'CONNECTED'
        `;


        db.query(
            deviceSql,
            [
               deviceCode,
               Number(farm_id)
            ],
            (err, deviceResults) => {

                if (err) {

                    console.error(
                        "Failed to verify device:",
                        err
                    );

                    return res.status(500).json({
                        error:
                            "Failed to verify device"
                    });

                }


                // DEVICE NOT AUTHORIZED
                if (
                    deviceResults.length === 0
                ) {

                    return res.status(403).json({
                        error:
                            "Device is not connected to this farm"
                    });

                }


                const device =
                    deviceResults[0];


                // CHECK SCAN REQUEST
                const requestSql = `
                    SELECT
                        id,
                        device_id,
                        farm_id,
                        status

                    FROM scan_requests

                    WHERE
                        id = ?
                        AND device_id = ?
                        AND farm_id = ?
                        AND status = 'PROCESSING'

                    LIMIT 1
                `;


                db.query(
                    requestSql,
                    [
                        Number(scan_request_id),
                        device.id,
                        device.farm_id
                    ],
                    (err, requestResults) => {

                        if (err) {

                            console.error(
                                "Failed to verify scan request:",
                                err
                            );

                            return res.status(500).json({
                                error:
                                    "Failed to verify scan request"
                            });

                        }


                        // SCAN REQUEST NOT VALID
                        if (
                            requestResults.length === 0
                        ) {

                            return res.status(409).json({
                                error:
                                    "Scan request is not valid or is no longer processing"
                            });

                        }


                        // START DATABASE TRANSACTION
                        db.beginTransaction(
                            (err) => {

                                if (err) {

                                    console.error(
                                        "Failed to start transaction:",
                                        err
                                    );

                                    return res.status(500).json({
                                        error:
                                            "Failed to start scan transaction"
                                    });

                                }


                                // SAVE SCAN
                                const scanSql = `
                                    INSERT INTO scans (
                                        farm_id,
                                        device_id,
                                        moisture,
                                        temperature,
                                        ph,
                                        nitrogen,
                                        phosphorus,
                                        potassium,
                                        status,
                                        recommendation
                                    )

                                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                                `;


                                db.query(
                                    scanSql,
                                    [
                                        device.farm_id,
                                        device.id,
                                        moistureValue,
                                        temperatureValue,
                                        phValue,
                                        nitrogenValue,
                                        phosphorusValue,
                                        potassiumValue,

                                        // NO AUTOMATIC EVALUATION
                                        "PENDING_EVALUATION",

                                        "Evaluation pending"
                                    ],
                                    (err, result) => {

                                        if (err) {

                                            console.error(
                                                "Failed to save scan:",
                                                err
                                            );

                                            return db.rollback(
                                                () => {

                                                    res.status(500).json({
                                                        error:
                                                            "Failed to save scan"
                                                    });

                                                }
                                            );

                                        }


                                        // COMPLETE SCAN REQUEST
                                        const completeRequestSql = `
                                            UPDATE scan_requests

                                            SET
                                                status = 'COMPLETED',
                                                completed_at = NOW()

                                            WHERE
                                                id = ?
                                                AND device_id = ?
                                                AND farm_id = ?
                                                AND status = 'PROCESSING'
                                        `;


                                        db.query(
                                            completeRequestSql,
                                            [
                                                Number(scan_request_id),
                                                device.id,
                                                device.farm_id
                                            ],
                                            (err, updateResult) => {

                                                if (err) {

                                                    console.error(
                                                        "Failed to complete scan request:",
                                                        err
                                                    );

                                                    return db.rollback(
                                                        () => {

                                                            res.status(500).json({
                                                                error:
                                                                    "Failed to complete scan request"
                                                            });

                                                        }
                                                    );

                                                }


                                                // REQUEST WAS NOT UPDATED
                                                if (
                                                    updateResult.affectedRows === 0
                                                ) {

                                                    console.error(
                                                        "Scan request could not be completed."
                                                    );

                                                    return db.rollback(
                                                        () => {

                                                            res.status(409).json({
                                                                error:
                                                                    "Scan request could not be completed"
                                                            });

                                                        }
                                                    );

                                                }


                                                // COMMIT TRANSACTION
                                                db.commit(
                                                    (err) => {

                                                        if (err) {

                                                            console.error(
                                                                "Failed to commit scan transaction:",
                                                                err
                                                            );

                                                            return db.rollback(
                                                                () => {

                                                                    res.status(500).json({
                                                                        error:
                                                                            "Failed to complete scan transaction"
                                                                    });

                                                                }
                                                            );

                                                        }


                                                        // SUCCESS
                                                        console.log(
                                                            "Scan measurements saved successfully."
                                                        );


                                                        res.status(201).json({

                                                            message:
                                                                "Scan measurements saved successfully",

                                                            id:
                                                                result.insertId,

                                                            scan_request_id:
                                                                Number(
                                                                    scan_request_id
                                                                ),

                                                            farm_id:
                                                                device.farm_id,

                                                            farm_name:
                                                                device.farm_name,

                                                            crop_id:
                                                                device.crop_id,

                                                            device_id:
                                                                device.id,

                                                            device_code:
                                                                device.device_code,

                                                            device_name:
                                                                device.name,

                                                            status:
                                                                "PENDING_EVALUATION"

                                                        });

                                                    }
                                                );

                                            }
                                        );

                                    }
                                );

                            }
                        );

                    }
                );

            }
        );

    }
);


// GET SCAN HISTORY
// User can only access scans of their farms
app.get(
    "/api/scans",
    authenticateToken,
    (req, res) => {

        const userId =
            req.user.userId;

        const farmId =
            req.query.farm_id;

        let sql = `
            SELECT
                scans.id,
                scans.farm_id,
                scans.device_id,
                devices.device_code,
                devices.name AS device_name,
                farms.name AS farm_name,
                farms.crop_id,
                crops.name AS crop_name,
                scans.moisture,
                scans.temperature,
                scans.ph,
                scans.nitrogen,
                scans.phosphorus,
                scans.potassium,
                scans.status,
                scans.recommendation,
                scans.created_at
            FROM scans
            INNER JOIN farms
            ON scans.farm_id = farms.id

            LEFT JOIN devices
            ON scans.device_id = devices.id

            LEFT JOIN crops
                ON farms.crop_id = crops.id

            WHERE farms.user_id = ?
        `;

        const values = [
            userId
        ];

        if (farmId) {

            sql += `
                AND scans.farm_id = ?
            `;

            values.push(farmId);

        }

        sql += `
            ORDER BY scans.created_at DESC
        `;

        db.query(
            sql,
            values,
            (err, results) => {

                if (err) {

                    console.error(
                        "Failed to get scans:",
                        err
                    );

                    return res.status(500).json({
                        error:
                            "Failed to get scans"
                    });

                }

                res.json(results);

            }
        );

    }
);


// EVALUATE SOIL PARAMETER
app.get(
    "/api/scans/:scanId/evaluation/:parameterId",
    authenticateToken,
    (req, res) => {

        const scanId =
            req.params.scanId;

        const parameterId =
            req.params.parameterId;


        // VALIDATE IDS
        if (
            !Number.isInteger(Number(scanId)) ||
            !Number.isInteger(Number(parameterId))
        ) {

            return res.status(400).json({
                error:
                    "Invalid scan ID or parameter ID"
            });
        }


        const sql = `
            SELECT
                scans.id AS scan_id,
                scans.farm_id,

                farms.user_id,
                farms.crop_id,

                crops.name AS crop_name,

                scans.ph,
                scans.moisture,
                scans.temperature,
                scans.nitrogen,
                scans.phosphorus,
                scans.potassium,

                crop_soil_requirements.parameter_id,

                soil_parameters.name AS parameter_name,

                crop_soil_requirements.min_value,
                crop_soil_requirements.max_value,
                crop_soil_requirements.unit,
                crop_soil_requirements.measurement_method,
                crop_soil_requirements.source,
                crop_soil_requirements.notes

            FROM scans

            INNER JOIN farms
                ON scans.farm_id = farms.id

            INNER JOIN crops
                ON farms.crop_id = crops.id

            INNER JOIN crop_soil_requirements
                ON crop_soil_requirements.crop_id =
                   farms.crop_id

            INNER JOIN soil_parameters
                ON soil_parameters.id =
                   crop_soil_requirements.parameter_id

            WHERE
                scans.id = ?
                AND farms.user_id = ?
                AND crop_soil_requirements.parameter_id = ?
        `;


        db.query(
            sql,
            [
                Number(scanId),
                req.user.userId,
                Number(parameterId)
            ],
            (err, results) => {

                if (err) {

                    console.error(
                        "Evaluation error:",
                        err
                    );

                    return res.status(500).json({
                        error:
                            "Failed to evaluate soil parameter"
                    });
                }


                // NO REQUIREMENT FOUND
                if (results.length === 0) {

                    return res.status(404).json({
                        error:
                            "No soil requirement found for this parameter and crop"
                    });
                }


                const data =
                    results[0];


                // GET ACTUAL SCAN VALUE
                let value =
                    null;


                switch (
                    Number(parameterId)
                ) {

                    case 1:

                        value =
                            data.ph;

                        break;


                    case 2:

                        value =
                            data.moisture;

                        break;


                    case 3:

                        value =
                            data.temperature;

                        break;


                    case 4:

                        value =
                            data.nitrogen;

                        break;


                    case 5:

                        value =
                            data.phosphorus;

                        break;


                    case 6:

                        value =
                            data.potassium;

                        break;


                    default:

                        value =
                            null;
                }


                // CONVERT VALUES TO NUMBERS
                const numericValue =
                    value !== null
                        ? Number(value)
                        : null;

                const minValue =
                    data.min_value !== null
                        ? Number(data.min_value)
                        : null;

                const maxValue =
                    data.max_value !== null
                        ? Number(data.max_value)
                        : null;


                // DEFAULT STATUS
                let status =
                    "UNKNOWN";


                // EVALUATE PARAMETER
                if (
                    numericValue !== null &&
                    !Number.isNaN(numericValue) &&
                    minValue !== null &&
                    !Number.isNaN(minValue) &&
                    maxValue !== null &&
                    !Number.isNaN(maxValue)
                ) {

                    if (
                        numericValue >= minValue &&
                        numericValue <= maxValue
                    ) {

                        status =
                            "OPTIMAL";

                    } else if (
                        numericValue < minValue
                    ) {

                        status =
                            "BELOW_RANGE";

                    } else if (
                        numericValue > maxValue
                    ) {

                        status =
                            "ABOVE_RANGE";
                    }
                }


                // RESPONSE
                res.json({

                    scan_id:
                        data.scan_id,

                    crop: {

                        id:
                            data.crop_id,

                        name:
                            data.crop_name
                    },

                    parameter: {

                        id:
                            data.parameter_id,

                        name:
                            data.parameter_name,

                        value:
                            numericValue,

                        min:
                            minValue,

                        max:
                            maxValue,

                        unit:
                            data.unit,

                        status:
                            status,

                        measurement_method:
                            data.measurement_method,

                        source:
                            data.source,

                        notes:
                            data.notes
                    }
                });
            }
        );
    }
);

// EVALUATE ALL SOIL PARAMETERS
app.get(
    "/api/scans/:scanId/evaluation",
    authenticateToken,
    (req, res) => {

        const scanId =
            req.params.scanId;


        // VALIDATE SCAN ID
        if (
            !Number.isInteger(Number(scanId))
        ) {

            return res.status(400).json({
                error:
                    "Invalid scan ID"
            });
        }


        // GET SCAN + CROP + ALL PARAMETERS
        const sql = `
            SELECT

                scans.id AS scan_id,

                farms.crop_id,

                crops.name AS crop_name,


                soil_parameters.id AS parameter_id,

                soil_parameters.name AS parameter_name,

                soil_parameters.unit AS parameter_default_unit,


                scans.ph,

                scans.moisture,

                scans.temperature,

                scans.nitrogen,

                scans.phosphorus,

                scans.potassium,


                crop_soil_requirements.min_value,

                crop_soil_requirements.max_value,

                crop_soil_requirements.unit
                    AS requirement_unit,

                crop_soil_requirements.measurement_method,

                crop_soil_requirements.source,

                crop_soil_requirements.notes


            FROM scans


            INNER JOIN farms
                ON scans.farm_id =
                   farms.id


            INNER JOIN crops
                ON farms.crop_id =
                   crops.id


            CROSS JOIN soil_parameters


            LEFT JOIN crop_soil_requirements
                ON crop_soil_requirements.crop_id =
                   farms.crop_id

                AND crop_soil_requirements.parameter_id =
                    soil_parameters.id


            WHERE
                scans.id = ?

                AND farms.user_id = ?


            ORDER BY
                soil_parameters.id
        `;


        db.query(
            sql,
            [
                Number(scanId),
                req.user.userId
            ],
            (err, results) => {

                // DATABASE ERROR
                if (err) {

                    console.error(
                        "Overall evaluation error:",
                        err
                    );

                    return res.status(500).json({
                        error:
                            "Failed to evaluate soil parameters"
                    });
                }


                // SCAN NOT FOUND
                if (
                    results.length === 0
                ) {

                    return res.status(404).json({
                        error:
                            "Scan not found"
                    });
                }


                // FIRST ROW
                const firstRow =
                    results[0];


                // MAP PARAMETER ID TO SCAN VALUE
                const getScanValue =
                    (parameterId) => {

                        switch (
                            Number(parameterId)
                        ) {

                            case 1:

                                return firstRow.ph;


                            case 2:

                                return firstRow.moisture;


                            case 3:

                                return firstRow.temperature;


                            case 4:

                                return firstRow.nitrogen;


                            case 5:

                                return firstRow.phosphorus;


                            case 6:

                                return firstRow.potassium;


                            default:

                                return null;
                        }
                    };


                // BUILD PARAMETERS RESULT
                const parameters =
                    results.map(
                        (row) => {

                            const rawValue =
                                getScanValue(
                                    row.parameter_id
                                );


                            const value =
                                rawValue !== null &&
                                rawValue !== undefined
                                    ? Number(rawValue)
                                    : null;


                            const min =
                                row.min_value !== null
                                    ? Number(
                                        row.min_value
                                    )
                                    : null;


                            const max =
                                row.max_value !== null
                                    ? Number(
                                        row.max_value
                                    )
                                    : null;


                            // DEFAULT STATUS
                            let status =
                                "UNKNOWN";


                            // EVALUATE ONLY WHEN
                            // A COMPLETE RANGE EXISTS
                            if (
                                value !== null &&
                                !Number.isNaN(value) &&

                                min !== null &&
                                !Number.isNaN(min) &&

                                max !== null &&
                                !Number.isNaN(max)
                            ) {

                                if (
                                    value >= min &&
                                    value <= max
                                ) {

                                    status =
                                        "OPTIMAL";

                                } else if (
                                    value < min
                                ) {

                                    status =
                                        "BELOW_RANGE";

                                } else if (
                                    value > max
                                ) {

                                    status =
                                        "ABOVE_RANGE";
                                }
                            }


                            return {

                                id:
                                    row.parameter_id,

                                name:
                                    row.parameter_name,

                                value:
                                    value,

                                min:
                                    min,

                                max:
                                    max,

                                unit:
                                    row.requirement_unit ||
                                    row.parameter_default_unit ||
                                    null,

                                status:
                                    status,

                                measurement_method:
                                    row.measurement_method ||
                                    null,

                                source:
                                    row.source ||
                                    null,

                                notes:
                                    row.notes ||
                                    null
                            };
                        }
                    );


                // RESPONSE
                res.json({

                    scan_id:
                        firstRow.scan_id,

                    crop: {

                        id:
                            firstRow.crop_id,

                        name:
                            firstRow.crop_name
                    },

                    parameters:
                        parameters
                });
            }
        );
    }
);

// CROPS

// Get all crops
app.get("/api/crops", (req, res) => {

    const sql = `
        SELECT *
        FROM crops
        ORDER BY name
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error(err);

            return res.status(500).json({
                error: "Failed to get crops"
            });
        }

        res.json(results);
    });
});


// Get one crop
app.get("/api/crops/:id", (req, res) => {

    const cropId = req.params.id;

    const sql = `
        SELECT *
        FROM crops
        WHERE id = ?
    `;

    db.query(sql, [cropId], (err, results) => {

        if (err) {
            console.error(err);

            return res.status(500).json({
                error: "Failed to get crop"
            });
        }

        if (results.length === 0) {

            return res.status(404).json({
                error: "Crop not found"
            });
        }

        res.json(results[0]);
    });
});


// DISEASES

// Get all diseases
app.get("/api/diseases", (req, res) => {

    const sql = `
        SELECT *
        FROM diseases
        ORDER BY name
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error(err);

            return res.status(500).json({
                error: "Failed to get diseases"
            });
        }

        res.json(results);
    });
});


// Get diseases for a specific crop
app.get("/api/diseases/crop/:cropId", (req, res) => {

    const cropId = req.params.cropId;

    const sql = `
        SELECT *
        FROM diseases
        WHERE crop_id = ?
        ORDER BY name
    `;

    db.query(sql, [cropId], (err, results) => {

        if (err) {
            console.error(err);

            return res.status(500).json({
                error: "Failed to get crop diseases"
            });
        }

        res.json(results);
    });
});


// Get one disease
app.get("/api/diseases/:id", (req, res) => {

    const diseaseId = req.params.id;

    const sql = `
        SELECT *
        FROM diseases
        WHERE id = ?
    `;

    db.query(sql, [diseaseId], (err, results) => {

        if (err) {
            console.error(err);

            return res.status(500).json({
                error: "Failed to get disease"
            });
        }

        if (results.length === 0) {

            return res.status(404).json({
                error: "Disease not found"
            });
        }

        res.json(results[0]);
    });
});


// TREATMENTS

// Get all treatments
app.get("/api/treatments", (req, res) => {

    const sql = `
        SELECT *
        FROM treatments
        ORDER BY id
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error(err);

            return res.status(500).json({
                error: "Failed to get treatments"
            });
        }

        res.json(results);
    });
});


// Get treatments for a specific disease
app.get("/api/treatments/disease/:diseaseId", (req, res) => {

    const diseaseId = req.params.diseaseId;

    const sql = `
        SELECT *
        FROM treatments
        WHERE disease_id = ?
        ORDER BY id
    `;

    db.query(sql, [diseaseId], (err, results) => {

        if (err) {
            console.error(err);

            return res.status(500).json({
                error: "Failed to get disease treatments"
            });
        }

        res.json(results);
    });
});


// CROP DETAILS
// Crop + Crop Images + Diseases + Disease Images + Treatments

app.get("/api/crops/:id/details", (req, res) => {

    const cropId = req.params.id;


    // 1. GET CROP
    const cropSql = `
        SELECT *
        FROM crops
        WHERE id = ?
    `;

    db.query(cropSql, [cropId], (err, cropResults) => {

        if (err) {
            console.error(err);

            return res.status(500).json({
                error: "Failed to get crop"
            });
        }

        if (cropResults.length === 0) {

            return res.status(404).json({
                error: "Crop not found"
            });
        }

        const crop = cropResults[0];


        // 2. GET CROP IMAGES
        const cropImagesSql = `
            SELECT
                id,
                image_path,
                view_type
            FROM crop_images
            WHERE crop_id = ?
            ORDER BY id
        `;

        db.query(
            cropImagesSql,
            [cropId],
            (err, cropImages) => {

                if (err) {
                    console.error(err);

                    return res.status(500).json({
                        error: "Failed to get crop images"
                    });
                }


                // 3. GET DISEASES
                const diseasesSql = `
                    SELECT
                        id,
                        name,
                        symptoms
                    FROM diseases
                    WHERE crop_id = ?
                    ORDER BY id
                `;

                db.query(
                    diseasesSql,
                    [cropId],
                    (err, diseases) => {

                        if (err) {
                            console.error(err);

                            return res.status(500).json({
                                error: "Failed to get diseases"
                            });
                        }


                        // لو المحصول ملوش أمراض
                        if (diseases.length === 0) {

                            return res.json({
                                crop: crop,
                                images: cropImages,
                                diseases: []
                            });
                        }


                        let completedDiseases = 0;


                        // 4. GET DATA FOR EACH DISEASE
                        diseases.forEach((disease) => {


                            // DISEASE IMAGES
                            const diseaseImagesSql = `
                                SELECT
                                    id,
                                    image_path,
                                    view_type
                                FROM disease_images
                                WHERE disease_id = ?
                                ORDER BY id
                            `;

                            db.query(
                                diseaseImagesSql,
                                [disease.id],
                                (err, diseaseImages) => {

                                    if (err) {
                                        console.error(err);

                                        return res.status(500).json({
                                            error: "Failed to get disease images"
                                        });
                                    }

                                    disease.images = diseaseImages;


                                    // TREATMENTS
                                    const treatmentSql = `
                                        SELECT
                                            id,
                                            treatment
                                        FROM treatments
                                        WHERE disease_id = ?
                                        ORDER BY id
                                    `;

                                    db.query(
                                        treatmentSql,
                                        [disease.id],
                                        (err, treatments) => {

                                            if (err) {
                                                console.error(err);

                                                return res.status(500).json({
                                                    error: "Failed to get treatments"
                                                });
                                            }

                                            disease.treatments = treatments;

                                            completedDiseases++;


                                            // بعد ما نخلص كل الأمراض
                                            if (
                                                completedDiseases === diseases.length
                                            ) {

                                                res.json({
                                                    crop: crop,
                                                    images: cropImages,
                                                    diseases: diseases
                                                });

                                            }

                                        }
                                    );

                                }
                            );

                        });

                    }
                );

            }
        );

    });

});


// DIAGNOSIS
// Crop + Disease + Images + Symptoms + Treatments

app.post("/api/diagnosis", (req, res) => {

    const { crop_id, disease_id } = req.body;


    // CHECK INPUT

    if (!crop_id || !disease_id) {

        return res.status(400).json({
            error: "crop_id and disease_id are required"
        });

    }


    // GET CROP

    const cropSql = `
        SELECT
            id,
            name,
            description
        FROM crops
        WHERE id = ?
    `;

    db.query(cropSql, [crop_id], (err, cropResults) => {

        if (err) {

            console.error(err);

            return res.status(500).json({
                error: "Failed to get crop"
            });

        }


        if (cropResults.length === 0) {

            return res.status(404).json({
                error: "Crop not found"
            });

        }


        const crop = cropResults[0];


        // GET CROP IMAGES

        const cropImagesSql = `
            SELECT
                id,
                image_path,
                view_type
            FROM crop_images
            WHERE crop_id = ?
            ORDER BY id
        `;

        db.query(
            cropImagesSql,
            [crop_id],
            (err, cropImages) => {

                if (err) {

                    console.error(err);

                    return res.status(500).json({
                        error: "Failed to get crop images"
                    });

                }


                // GET DISEASE

                const diseaseSql = `
                    SELECT
                        id,
                        crop_id,
                        name,
                        symptoms
                    FROM diseases
                    WHERE id = ?
                    AND crop_id = ?
                `;

                db.query(
                    diseaseSql,
                    [disease_id, crop_id],
                    (err, diseaseResults) => {

                        if (err) {

                            console.error(err);

                            return res.status(500).json({
                                error: "Failed to get disease"
                            });

                        }


                        if (diseaseResults.length === 0) {

                            return res.status(404).json({
                                error: "Disease not found for this crop"
                            });

                        }


                        const disease =
                            diseaseResults[0];


                        // GET DISEASE IMAGES

                        const diseaseImagesSql = `
                            SELECT
                                id,
                                image_path,
                                view_type
                            FROM disease_images
                            WHERE disease_id = ?
                            ORDER BY id
                        `;

                        db.query(
                            diseaseImagesSql,
                            [disease_id],
                            (err, diseaseImages) => {

                                if (err) {

                                    console.error(err);

                                    return res.status(500).json({
                                        error: "Failed to get disease images"
                                    });

                                }


                                // GET TREATMENTS

                                const treatmentSql = `
                                    SELECT
                                        id,
                                        treatment
                                    FROM treatments
                                    WHERE disease_id = ?
                                    ORDER BY id
                                `;

                                db.query(
                                    treatmentSql,
                                    [disease_id],
                                    (err, treatments) => {

                                        if (err) {

                                            console.error(err);

                                            return res.status(500).json({
                                                error: "Failed to get treatments"
                                            });

                                        }


                                        // FINAL RESULT

                                        res.json({

                                            crop: {

                                                id: crop.id,

                                                name: crop.name,

                                                description:
                                                    crop.description,

                                                images:
                                                    cropImages

                                            },

                                            diagnosis: {

                                                disease_id:
                                                    disease.id,

                                                disease_name:
                                                    disease.name,

                                                symptoms:
                                                    disease.symptoms,

                                                images:
                                                    diseaseImages,

                                                treatments:
                                                    treatments

                                            }

                                        });

                                    }
                                );

                            }
                        );

                    }
                );

            }
        );

    });

});


// REGISTER
app.post("/api/auth/register", async (req, res) => {

    const {
        name,
        email,
        password
    } = req.body;


    // CHECK INPUT

    if (!name || !email || !password) {

        return res.status(400).json({
            error: "Name, email and password are required"
        });

    }


    // NORMALIZE EMAIL

    const normalizedEmail =
        email.trim().toLowerCase();


    // CHECK IF EMAIL ALREADY EXISTS

    const checkSql = `
        SELECT id
        FROM users
        WHERE email = ?
    `;

    db.query(
        checkSql,
        [normalizedEmail],
        async (err, results) => {

            if (err) {

                console.error(
                    "Failed to check user:",
                    err
                );

                return res.status(500).json({
                    error: "Failed to check user"
                });

            }


            if (results.length > 0) {

                return res.status(409).json({
                    error: "Email already exists"
                });

            }


            try {

                // HASH PASSWORD

                const hashedPassword =
                    await bcrypt.hash(password, 10);


                // CREATE USER

                const insertSql = `
                    INSERT INTO users
                    (name, email, password)
                    VALUES (?, ?, ?)
                `;

                db.query(
                    insertSql,
                    [
                        name.trim(),
                        normalizedEmail,
                        hashedPassword
                    ],
                    (err, result) => {

                        if (err) {

                            console.error(
                                "Failed to register user:",
                                err
                            );

                            return res.status(500).json({
                                error: "Failed to register user"
                            });

                        }


                        res.status(201).json({

                            message:
                                "User registered successfully",

                            user: {
                                id: result.insertId,
                                name: name.trim(),
                                email: normalizedEmail
                            }

                        });

                    }
                );

            } catch (error) {

                console.error(
                    "Password hashing failed:",
                    error
                );

                return res.status(500).json({
                    error: "Failed to secure password"
                });

            }

        }
    );

});

// LOGIN
app.post("/api/auth/login", async (req, res) => {

    const {
        email,
        password
    } = req.body;


    // CHECK REQUIRED DATA
    if (!email || !password) {

        return res.status(400).json({
            error: "Email and password are required"
        });

    }


    // NORMALIZE EMAIL
    const normalizedEmail =
        email.trim().toLowerCase();


    // FIND USER
    const sql = `
        SELECT
            id,
            name,
            email,
            password
        FROM users
        WHERE email = ?
    `;


    db.query(
        sql,
        [normalizedEmail],
        async (err, results) => {

            if (err) {

                console.error(
                    "Failed to find user:",
                    err
                );

                return res.status(500).json({
                    error: "Failed to login"
                });

            }

            // USER NOT FOUND
            if (results.length === 0) {

                return res.status(401).json({
                    error: "Invalid email or password"
                });

            }


            const user =
                results[0];


            try {

                // COMPARE PASSWORD
                const passwordMatch =
                    await bcrypt.compare(
                        password,
                        user.password
                    );


                if (!passwordMatch) {

                    return res.status(401).json({
                        error: "Invalid email or password"
                    });

                }


                // CREATE JWT TOKEN
                const token =
                    jwt.sign(
                        {
                            userId: user.id,
                            email: user.email
                        },
                        JWT_SECRET,
                        {
                            expiresIn: "7d"
                        }
                    );


                // LOGIN SUCCESS
                res.json({

                    message:
                        "Login successful",

                    token: token,

                    user: {

                        id: user.id,

                        name: user.name,

                        email: user.email

                    }

                });

            } catch (error) {

                console.error(
                    "Login failed:",
                    error
                );

                return res.status(500).json({
                    error: "Failed to login"
                });

            }

        }
    );

});


// CURRENT USER
app.get(
    "/api/auth/me",
    authenticateToken,
    (req, res) => {

        const sql = `
            SELECT
                id,
                name,
                email
            FROM users
            WHERE id = ?
        `;


        db.query(
            sql,
            [req.user.userId],
            (err, results) => {

                if (err) {

                    console.error(
                        "Failed to get current user:",
                        err
                    );

                    return res.status(500).json({
                        error:
                            "Failed to get current user"
                    });

                }


                if (results.length === 0) {

                    return res.status(404).json({
                        error:
                            "User not found"
                    });

                }


                const user =
                    results[0];


                res.json({

                    userId: user.id,

                    name: user.name,

                    email: user.email

                });

            }
        );

    }
);


// CHANGE PASSWORD
app.post(
    "/api/auth/change-password",
    authenticateToken,
    async (req, res) => {

        const {
            currentPassword,
            newPassword
        } = req.body;


        // CHECK REQUIRED DATA
        if (
            !currentPassword ||
            !newPassword
        ) {

            return res.status(400).json({
                error:
                    "Current password and new password are required"
            });

        }


        // CHECK NEW PASSWORD
        if (
            typeof newPassword !== "string" ||
            newPassword.length < 8
        ) {

            return res.status(400).json({
                error:
                    "New password must be at least 8 characters"
            });

        }


        // GET CURRENT USER PASSWORD
        const sql = `
            SELECT
                id,
                password
            FROM users
            WHERE id = ?
        `;


        db.query(
            sql,
            [req.user.userId],
            async (err, results) => {

                if (err) {

                    console.error(
                        "Failed to get user password:",
                        err
                    );

                    return res.status(500).json({
                        error:
                            "Failed to change password"
                    });

                }


                if (results.length === 0) {

                    return res.status(404).json({
                        error:
                            "User not found"
                    });

                }


                const user =
                    results[0];


                try {

                    // VERIFY CURRENT PASSWORD
                    const passwordMatch =
                        await bcrypt.compare(
                            currentPassword,
                            user.password
                        );


                    if (!passwordMatch) {

                        return res.status(401).json({
                            error:
                                "Current password is incorrect"
                        });

                    }


                    // CHECK SAME PASSWORD
                    const samePassword =
                        await bcrypt.compare(
                            newPassword,
                            user.password
                        );


                    if (samePassword) {

                        return res.status(400).json({
                            error:
                                "New password must be different"
                        });

                    }


                    // HASH NEW PASSWORD
                    const hashedPassword =
                        await bcrypt.hash(
                            newPassword,
                            10
                        );


                    // UPDATE PASSWORD
                    const updateSql = `
                        UPDATE users
                        SET password = ?
                        WHERE id = ?
                    `;


                    db.query(
                        updateSql,
                        [
                            hashedPassword,
                            user.id
                        ],
                        (err, result) => {

                            if (err) {

                                console.error(
                                    "Failed to update password:",
                                    err
                                );

                                return res.status(500).json({
                                    error:
                                        "Failed to change password"
                                });

                            }


                            if (
                                result.affectedRows === 0
                            ) {

                                return res.status(404).json({
                                    error:
                                        "Password was not updated"
                                });

                            }


                            return res.json({

                                message:
                                    "Password changed successfully"

                            });

                        }
                    );

                } catch (error) {

                    console.error(
                        "Password change failed:",
                        error
                    );

                    return res.status(500).json({
                        error:
                            "Failed to secure new password"
                    });

                }

            }
        );

    }
);

// FARMS

// GET ALL FARMS FOR CURRENT USER
app.get(
    "/api/farms",
    authenticateToken,
    (req, res) => {

        const userId =
            req.user.userId;


        const sql = `
            SELECT
                farms.id,
                farms.name,
                farms.location,
                farms.area,
                farms.crop_id,
                crops.name AS crop_name,
                farms.created_at,
                COUNT(scans.id) AS scans_count

            FROM farms

            LEFT JOIN crops
                ON farms.crop_id = crops.id

            LEFT JOIN scans
                ON farms.id = scans.farm_id

            WHERE farms.user_id = ?

            GROUP BY
                farms.id,
                farms.name,
                farms.location,
                farms.area,
                farms.crop_id,
                crops.name,
                farms.created_at

            ORDER BY farms.id DESC
        `;


        db.query(
            sql,
            [userId],
            (err, results) => {

                if (err) {

                    console.error(
                        "Failed to get user farms:",
                        err
                    );

                    return res.status(500).json({
                        error: "Failed to get farms"
                    });

                }


                res.json(results);

            }
        );

    }
);


// GET ONE FARM FOR CURRENT USER
app.get(
    "/api/farms/:id",
    authenticateToken,
    (req, res) => {

        const farmId =
            req.params.id;

        const userId =
            req.user.userId;


        const sql = `
            SELECT
                farms.id,
                farms.name,
                farms.location,
                farms.area,
                farms.crop_id,
                crops.name AS crop_name,
                farms.created_at

            FROM farms

            LEFT JOIN crops
                ON farms.crop_id = crops.id

            WHERE
                farms.id = ?
                AND farms.user_id = ?
        `;


        db.query(
            sql,
            [
                farmId,
                userId
            ],
            (err, results) => {

                if (err) {

                    console.error(
                        "Failed to get farm:",
                        err
                    );

                    return res.status(500).json({
                        error: "Failed to get farm"
                    });

                }


                if (results.length === 0) {

                    return res.status(404).json({
                        error: "Farm not found"
                    });

                }


                res.json(results[0]);

            }
        );

    }
);


// GET FARM DETAILS + RECENT SCANS
// FOR CURRENT USER
app.get(
    "/api/farms/:id/details",
    authenticateToken,
    (req, res) => {

        const farmId =
            req.params.id;

        const userId =
            req.user.userId;


        // GET FARM
        const farmSql = `
            SELECT
                farms.id,
                farms.name,
                farms.location,
                farms.area,
                farms.crop_id,
                crops.name AS crop_name,
                farms.created_at

            FROM farms

            LEFT JOIN crops
                ON farms.crop_id = crops.id

            WHERE
                farms.id = ?
                AND farms.user_id = ?
        `;


        db.query(
            farmSql,
            [
                farmId,
                userId
            ],
            (err, farmResults) => {

                if (err) {

                    console.error(
                        "Failed to get farm details:",
                        err
                    );

                    return res.status(500).json({
                        error:
                            "Failed to get farm details"
                    });

                }


                // FARM NOT FOUND / NOT OWNED
                if (
                    farmResults.length === 0
                ) {

                    return res.status(404).json({
                        error:
                            "Farm not found"
                    });

                }


                const farm =
                    farmResults[0];


                // GET TOTAL SCAN COUNT
                const countSql = `
                    SELECT
                        COUNT(*) AS total_scans

                    FROM scans

                    INNER JOIN farms
                        ON scans.farm_id =
                           farms.id

                    WHERE
                        scans.farm_id = ?
                        AND farms.user_id = ?
                `;


                db.query(
                    countSql,
                    [
                        farmId,
                        userId
                    ],
                    (countError, countResults) => {

                        if (countError) {

                            console.error(
                                "Failed to count scans:",
                                countError
                            );

                            return res.status(500).json({
                                error:
                                    "Failed to count scans"
                            });

                        }


                        const totalScans =
                            Number(
                                countResults[0]
                                    ?.total_scans || 0
                            );


                        // GET RECENT SCANS
                        const scansSql = `
                            SELECT
                                scans.id,
                                scans.farm_id,
                                scans.device_id,

                                devices.device_code,
                                devices.name AS device_name,

                                scans.moisture,
                                scans.temperature,
                                scans.ph,
                                scans.nitrogen,
                                scans.phosphorus,
                                scans.potassium,

                                scans.status,
                                scans.recommendation,
                                scans.created_at

                            FROM scans

                            LEFT JOIN devices
                                ON scans.device_id =
                                   devices.id

                            INNER JOIN farms
                                ON scans.farm_id =
                                   farms.id

                            WHERE
                                scans.farm_id = ?
                                AND farms.user_id = ?

                            ORDER BY
                                scans.created_at DESC

                            LIMIT 10
                        `;


                        db.query(
                            scansSql,
                            [
                                farmId,
                                userId
                            ],
                            (scansError, scans) => {

                                if (scansError) {

                                    console.error(
                                        "Failed to get farm scans:",
                                        scansError
                                    );

                                    return res.status(500).json({
                                        error:
                                            "Failed to get farm scans"
                                    });

                                }


                                // RESPONSE
                                res.json({

                                    farm: farm,

                                    total_scans:
                                        totalScans,

                                    scans:
                                        scans

                                });

                            }
                        );

                    }
                );

            }
        );

    }
);


// ADD NEW FARM FOR CURRENT USER
app.post(
    "/api/farms",
    authenticateToken,
    (req, res) => {

        const userId =
            req.user.userId;


        const {
            name,
            location,
            area,
            crop_id
        } = req.body;


        // CHECK REQUIRED DATA
        if (!name) {

            return res.status(400).json({
                error: "Farm name is required"
            });

        }


        // INSERT FARM
        const sql = `
            INSERT INTO farms
            (
                user_id,
                name,
                location,
                area,
                crop_id
            )
            VALUES (?, ?, ?, ?, ?)
        `;


        db.query(
            sql,
            [
                userId,
                name.trim(),
                location || null,
                area || null,
                crop_id || null
            ],
            (err, result) => {

                if (err) {

                    console.error(
                        "Failed to add farm:",
                        err
                    );

                    return res.status(500).json({
                        error: "Failed to add farm"
                    });

                }


                res.status(201).json({

                    message:
                        "Farm added successfully",

                    id:
                        result.insertId

                });

            }
        );

    }
);


// DELETE FARM FOR CURRENT USER
app.delete(
    "/api/farms/:id",
    authenticateToken,
    (req, res) => {

        const farmId =
            req.params.id;

        const userId =
            req.user.userId;


        const sql = `
            DELETE FROM farms
            WHERE
                id = ?
                AND user_id = ?
        `;


        db.query(
            sql,
            [
                farmId,
                userId
            ],
            (err, result) => {

                if (err) {

                    console.error(
                        "Failed to delete farm:",
                        err
                    );

                    return res.status(500).json({
                        error: "Failed to delete farm"
                    });

                }


                if (result.affectedRows === 0) {

                    return res.status(404).json({
                        error: "Farm not found"
                    });

                }


                res.json({
                    message: "Farm deleted successfully"
                });

            }
        );

    }
);

// GET DEVICE LINKED TO THE LOGGED-IN USER
app.get(
    "/api/devices/my-device",
    authenticateToken,
    (req, res) => {
        const sql = `
            SELECT
                devices.id,
                devices.device_code,
                devices.name,
                devices.status,
                devices.connected_at,
                farms.name AS farm_name
            FROM devices
            INNER JOIN farms
                ON devices.farm_id = farms.id
            WHERE farms.user_id = ?
            ORDER BY devices.id ASC
            LIMIT 1
        `;

        db.query(
            sql,
            [req.user.userId],
            (err, results) => {
                if (err) {
                    console.error(
                        "Error loading user device:",
                        err
                    );

                    return res.status(500).json({
                        message: "تعذر تحميل بيانات الجهاز"
                    });
                }

                if (results.length === 0) {
                    return res.status(404).json({
                        message: "لا يوجد جهاز مرتبط بمزارع حسابك"
                    });
                }

                return res.json(results[0]);
            }
        );
    }
);

// DEVICES

// GET DEVICE BY CODE
app.get("/api/devices/:deviceCode", (req, res) => {

    const deviceCode = req.params.deviceCode;

    const sql = `
        SELECT
            devices.id,
            devices.device_code,
            devices.name,
            devices.status,
            devices.farm_id,
            farms.name AS farm_name,
            devices.connected_at
        FROM devices
        LEFT JOIN farms
            ON devices.farm_id = farms.id
        WHERE devices.device_code = ?
    `;

    db.query(sql, [deviceCode], (err, results) => {

        if (err) {

            console.error(
                "Failed to get device:",
                err
            );

            return res.status(500).json({
                error: "Failed to get device"
            });

        }

        if (results.length === 0) {

            return res.status(404).json({
                error: "Device not found"
            });

        }

        res.json(results[0]);

    });

});

// CONNECT DEVICE TO FARM
app.post(
    "/api/devices/connect",
    authenticateToken,
    (req, res) => {

        const {
            device_code,
            farm_id
        } = req.body;


        // CHECK INPUT
        if (!device_code || !farm_id) {

            return res.status(400).json({
                error:
                    "device_code and farm_id are required"
            });

        }


        // NORMALIZE FARM ID
        const farmId =
            Number(farm_id);


        if (
            !Number.isInteger(farmId) ||
            farmId <= 0
        ) {

            return res.status(400).json({
                error:
                    "farm_id must be a valid number"
            });

        }


        // GET USER ID FROM JWT
        const userId =
            req.user.userId;


        // CHECK DEVICE
        const deviceSql = `
            SELECT
                id,
                device_code,
                name,
                status,
                farm_id
            FROM devices
            WHERE
                device_code = ?
        `;

        db.query(
            deviceSql,
            [device_code],
            (err, deviceResults) => {

                if (err) {

                    console.error(
                        "Failed to check device:",
                        err
                    );

                    return res.status(500).json({
                        error:
                            "Failed to check device"
                    });

                }


                if (
                    deviceResults.length === 0
                ) {

                    return res.status(404).json({
                        error:
                            "Device not found"
                    });

                }


                const device =
                    deviceResults[0];


                // CHECK FARM OWNERSHIP
                const farmSql = `
                    SELECT
                        id,
                        name
                    FROM farms
                    WHERE
                        id = ?
                        AND user_id = ?
                `;

                db.query(
                    farmSql,
                    [
                        farmId,
                        userId
                    ],
                    (err, farmResults) => {

                        if (err) {

                            console.error(
                                "Failed to check farm:",
                                err
                            );

                            return res.status(500).json({
                                error:
                                    "Failed to check farm"
                            });

                        }


                        if (
                            farmResults.length === 0
                        ) {

                            return res.status(403).json({
                                error:
                                    "You do not have access to this farm"
                            });

                        }


                        const farm =
                            farmResults[0];


                        // DEVICE ALREADY CONNECTED
                        // TO THE SAME FARM

                        if (
                            device.farm_id === farmId &&
                            device.status === "CONNECTED"
                        ) {

                            return res.json({

                                message:
                                    "Device is already connected to this farm",

                                device_id:
                                    device.id,

                                device_code:
                                    device.device_code,

                                device_name:
                                    device.name,

                                farm_id:
                                    farm.id,

                                farm_name:
                                    farm.name,

                                status:
                                    "CONNECTED"

                            });

                        }


                        // CHECK ACTIVE SCAN REQUESTS
                        // BEFORE MOVING DEVICE
                        const requestSql = `
                            SELECT
                                id,
                                farm_id,
                                status,
                                created_at,
                                started_at
                            FROM scan_requests
                            WHERE
                                device_id = ?
                                AND status IN (
                                    'PENDING',
                                    'PROCESSING'
                                )
                            ORDER BY id DESC
                            LIMIT 1
                        `;

                        db.query(
                            requestSql,
                            [device.id],
                            (err, requestResults) => {

                                if (err) {

                                    console.error(
                                        "Failed to check active scan requests:",
                                        err
                                    );

                                    return res.status(500).json({
                                        error:
                                            "Failed to check active scan requests"
                                    });

                                }


                                // ACTIVE REQUEST FOUND
                                if (
                                    requestResults.length > 0
                                ) {

                                    const activeRequest =
                                        requestResults[0];


                                    // SAME FARM
                                    if (
                                        activeRequest.farm_id === farmId
                                    ) {

                                        return res.json({

                                            message:
                                                "Device is already connected to this farm",

                                            device_id:
                                                device.id,

                                            device_code:
                                                device.device_code,

                                            device_name:
                                                device.name,

                                            farm_id:
                                                farm.id,

                                            farm_name:
                                                farm.name,

                                            status:
                                                "CONNECTED",

                                            scan_request_id:
                                                activeRequest.id,

                                            scan_request_status:
                                                activeRequest.status

                                        });

                                    }


                                    // DIFFERENT FARM
                                    return res.status(409).json({

                                        error:
                                            "Device has an active scan request and cannot be moved to another farm",

                                        scan_request_id:
                                            activeRequest.id,

                                        scan_request_status:
                                            activeRequest.status,

                                        current_farm_id:
                                            activeRequest.farm_id

                                    });

                                }


                                // CONNECT DEVICE
                                const updateSql = `
                                    UPDATE devices
                                    SET
                                        farm_id = ?,
                                        status = 'CONNECTED',
                                        connected_at = NOW()
                                    WHERE
                                        device_code = ?
                                `;

                                db.query(
                                    updateSql,
                                    [
                                        farmId,
                                        device_code
                                    ],
                                    (err, result) => {

                                        if (err) {

                                            console.error(
                                                "Failed to connect device:",
                                                err
                                            );

                                            return res.status(500).json({
                                                error:
                                                    "Failed to connect device"
                                            });

                                        }


                                        // VERIFY UPDATE
                                        if (
                                            result.affectedRows === 0
                                        ) {

                                            return res.status(500).json({
                                                error:
                                                    "Device connection was not updated"
                                            });

                                        }


                                        // SUCCESS
                                        return res.json({

                                            message:
                                                "Device connected successfully",

                                            device_id:
                                                device.id,

                                            device_code:
                                                device.device_code,

                                            device_name:
                                                device.name,

                                            farm_id:
                                                farm.id,

                                            farm_name:
                                                farm.name,

                                            status:
                                                "CONNECTED"

                                        });

                                    }
                                );

                            }
                        );

                    }
                );

            }
        );

    }
);


// CREATE SCAN REQUEST
app.post(
    "/api/scan-requests",
    authenticateToken,
    (req, res) => {

        const {
            device_code,
            farm_id
        } = req.body;


        // CHECK INPUT
        if (!device_code || !farm_id) {

            return res.status(400).json({
                error:
                    "device_code and farm_id are required"
            });

        }


        // NORMALIZE FARM ID
        const farmId =
            Number(farm_id);


        if (
            !Number.isInteger(farmId) ||
            farmId <= 0
        ) {

            return res.status(400).json({
                error:
                    "farm_id must be a valid number"
            });

        }


        // GET USER ID FROM JWT
        const userId =
            req.user.userId;


        // CHECK FARM OWNERSHIP
        const farmSql = `
            SELECT
                id,
                name
            FROM farms
            WHERE
                id = ?
                AND user_id = ?
        `;

        db.query(
            farmSql,
            [
                farmId,
                userId
            ],
            (err, farmResults) => {

                if (err) {

                    console.error(
                        "Failed to check farm:",
                        err
                    );

                    return res.status(500).json({
                        error:
                            "Failed to check farm"
                    });

                }


                if (
                    farmResults.length === 0
                ) {

                    return res.status(403).json({
                        error:
                            "You do not have access to this farm"
                    });

                }


                const farm =
                    farmResults[0];


                // CHECK DEVICE
                const deviceSql = `
                    SELECT
                        id,
                        device_code,
                        name,
                        status,
                        farm_id
                    FROM devices
                    WHERE
                        device_code = ?
                        AND farm_id = ?
                        AND status = 'CONNECTED'
                `;

                db.query(
                    deviceSql,
                    [
                        device_code,
                        farmId
                    ],
                    (err, deviceResults) => {

                        if (err) {

                            console.error(
                                "Failed to check device:",
                                err
                            );

                            return res.status(500).json({
                                error:
                                    "Failed to check device"
                            });

                        }


                        if (
                            deviceResults.length === 0
                        ) {

                            return res.status(400).json({
                                error:
                                    "Device is not connected to this farm"
                            });

                        }


                        const device =
                            deviceResults[0];


                        // CHECK EXISTING REQUEST
                        const requestSql = `
                            SELECT
                                id,
                                status
                            FROM scan_requests
                            WHERE
                                device_id = ?
                                AND farm_id = ?
                                AND status IN (
                                    'PENDING',
                                    'PROCESSING'
                                )
                            ORDER BY id DESC
                            LIMIT 1
                        `;

                        db.query(
                            requestSql,
                            [
                                device.id,
                                farmId
                            ],
                            (err, requestResults) => {

                                if (err) {

                                    console.error(
                                        "Failed to check scan request:",
                                        err
                                    );

                                    return res.status(500).json({
                                        error:
                                            "Failed to check scan request"
                                    });

                                }

                                // SCAN ALREADY IN PROGRESS
                                if (
                                    requestResults.length > 0
                                ) {

                                    return res.status(409).json({

                                        error:
                                            "A scan is already in progress",

                                        scan_request_id:
                                            requestResults[0].id,

                                        status:
                                            requestResults[0].status

                                    });

                                }


                                // CREATE REQUEST
                                const insertSql = `
                                    INSERT INTO scan_requests (
                                        device_id,
                                        farm_id,
                                        status
                                    )
                                    VALUES (
                                        ?,
                                        ?,
                                        'PENDING'
                                    )
                                `;

                                db.query(
                                    insertSql,
                                    [
                                        device.id,
                                        farmId
                                    ],
                                    (err, result) => {

                                        if (err) {

                                            console.error(
                                                "Failed to create scan request:",
                                                err
                                            );

                                            return res.status(500).json({
                                                error:
                                                    "Failed to create scan request"
                                            });

                                        }


                                        // SUCCESS
                                        return res.status(201).json({

                                            message:
                                                "Scan request created successfully",

                                            scan_request_id:
                                                result.insertId,

                                            device_id:
                                                device.id,

                                            device_code:
                                                device.device_code,

                                            device_name:
                                                device.name,

                                            farm_id:
                                                farm.id,

                                            farm_name:
                                                farm.name,

                                            status:
                                                "PENDING"

                                        });

                                    }
                                );

                            }
                        );

                    }
                );

            }
        );

    }
);


// GET PENDING SCAN REQUEST FOR DEVICE
app.get(
    "/api/scan-requests/device/:deviceCode",
    (req, res) => {

        const deviceCode =
            req.params.deviceCode;


        // CHECK DEVICE
        const deviceSql = `
            SELECT
                id,
                device_code,
                name,
                status,
                farm_id
            FROM devices
            WHERE
                device_code = ?
                AND status = 'CONNECTED'
        `;

        db.query(
            deviceSql,
            [
                deviceCode
            ],
            (err, deviceResults) => {

                if (err) {

                    console.error(
                        "Failed to get device:",
                        err
                    );

                    return res.status(500).json({
                        error:
                            "Failed to get device"
                    });

                }


                if (
                    deviceResults.length === 0
                ) {

                    return res.status(404).json({
                        error:
                            "Connected device not found"
                    });

                }


                const device =
                    deviceResults[0];


                // GET PENDING REQUEST
                const requestSql = `
                    SELECT
                        id,
                        device_id,
                        farm_id,
                        status,
                        created_at
                    FROM scan_requests
                    WHERE
                        device_id = ?
                        AND farm_id = ?
                        AND status = 'PENDING'
                    ORDER BY id ASC
                    LIMIT 1
                `;

                db.query(
                    requestSql,
                    [
                        device.id,
                        device.farm_id
                    ],
                    (err, requestResults) => {

                        if (err) {

                            console.error(
                                "Failed to get scan request:",
                                err
                            );

                            return res.status(500).json({
                                error:
                                    "Failed to get scan request"
                            });

                        }


                        // NO PENDING REQUEST
                        if (
                            requestResults.length === 0
                        ) {

                            return res.status(204).send();

                        }


                        const request =
                            requestResults[0];


                        // MARK AS PROCESSING
                        const updateSql = `
                            UPDATE scan_requests
                            SET
                                status = 'PROCESSING',
                                started_at = NOW()
                            WHERE
                                id = ?
                                AND status = 'PENDING'
                        `;

                        db.query(
                            updateSql,
                            [
                                request.id
                            ],
                            (err, result) => {

                                if (err) {

                                    console.error(
                                        "Failed to update scan request:",
                                        err
                                    );

                                    return res.status(500).json({
                                        error:
                                            "Failed to update scan request"
                                    });

                                }


                                // REQUEST ALREADY TAKEN
                                if (
                                    result.affectedRows === 0
                                ) {

                                    return res.status(409).json({
                                        error:
                                            "Scan request is already being processed"
                                    });

                                }


                                // RETURN REQUEST
                                res.json({

                                    scan_request_id:
                                        request.id,

                                    device_id:
                                        device.id,

                                    device_code:
                                        device.device_code,

                                    device_name:
                                        device.name,

                                    farm_id:
                                        request.farm_id,

                                    status:
                                        "PROCESSING"

                                });

                            }
                        );

                    }
                );

            }
        );

    }
);

// SERVER

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`AgriScan Backend running on port ${PORT}`);
});