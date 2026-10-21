// ==========================================
// AI RESUME BUILDER - EXPRESS BACKEND
// ==========================================

const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

const Resume = require("./models/Resume");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({
    limit: "1mb"
}));

// ==========================================
// TEST API
// ==========================================

app.get("/api/test", (req, res) => {

    res.json({
        message: "AI Resume Builder Backend is Working!"
    });

});


// ==========================================
// ALLOWED RESUME FIELDS
// ==========================================

const allowedFields = [

    "careerField",
    "fullName",
    "email",
    "phone",
    "address",
    "objective",
    "degree",
    "college",
    "graduationYear",
    "skills",
    "softSkills",
    "skillLevel",
    "experience",
    "internships",
    "volunteer",
    "projects",
    "linkedin",
    "portfolio",
    "achievements",
    "certifications",
    "workshops",
    "languages",
    "highlights"

];


// ==========================================
// VALIDATE RESUME
// ==========================================

function validateResume(body) {

    if (
        !body ||
        typeof body !== "object" ||
        Array.isArray(body)
    ) {

        return {
            error: "Invalid resume data."
        };

    }

    const { fullName, email } = body;

    if (
        typeof fullName !== "string" ||
        !fullName.trim() ||
        typeof email !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {

        return {
            error: "Valid name and email are required."
        };

    }

    const resumeData = {};

    for (const field of allowedFields) {

        const value = body[field];

        if (value !== undefined) {

            if (
                typeof value !== "string" ||
                value.length > 5000
            ) {

                return {
                    error: `Invalid value for ${field}.`
                };

            }

            resumeData[field] = value.trim();

        }

    }

    return { resumeData };

}


// ==========================================
// SAVE RESUME
// ==========================================

app.post("/api/resumes", async (req, res) => {

    try {

        const { resumeData, error } =
            validateResume(req.body);

        if (error) {

            return res.status(400).json({
                message: error
            });

        }

        const newResume = new Resume(resumeData);

        await newResume.save();

        res.status(201).json({

            message: "Resume saved successfully!",
            resumeId: newResume._id

        });

    } catch (error) {

        console.error("Save Error:", error);

        res.status(500).json({
            message: "Unable to save resume."
        });

    }

});


// ==========================================
// UPDATE RESUME
// ==========================================

app.put("/api/resumes/:id", async (req, res) => {

    try {

        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {

            return res.status(400).json({
                message: "Invalid resume ID."
            });

        }

        const { resumeData, error } =
            validateResume(req.body);

        if (error) {

            return res.status(400).json({
                message: error
            });

        }

        const updatedResume =
            await Resume.findByIdAndUpdate(

                id,

                resumeData,

                {
                    new: true,
                    runValidators: true
                }

            );

        if (!updatedResume) {

            return res.status(404).json({
                message: "Resume not found."
            });

        }

        res.json({

            message: "Resume updated successfully!",
            resumeId: updatedResume._id

        });

    } catch (error) {

        console.error("Update Error:", error);

        res.status(500).json({
            message: "Unable to update resume."
        });

    }

});


// ==========================================
// FRONTEND FILES
// ==========================================

app.use(express.static(path.join(__dirname)));

app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "index.html")
    );

});

// Unknown API routes
app.use("/api", (req, res) => {

    res.status(404).json({
        message: "API route not found."
    });

});


// ==========================================
// CONNECT MONGODB
// ==========================================

async function startServer() {

    try {

        if (!process.env.MONGO_URI) {
            throw new Error(
                "MONGO_URI is missing in .env file."
            );
        }

        await mongoose.connect(
            process.env.MONGO_URI
        );

        console.log(
            "MongoDB Connected Successfully!"
        );

        app.listen(PORT, "127.0.0.1", () => {

            console.log(
                `Server running on http://localhost:${PORT}`
            );

        });

    } catch (error) {

        console.error(
            "MongoDB Connection Error:",
            error.message
        );

        process.exit(1);

    }

}

startServer();