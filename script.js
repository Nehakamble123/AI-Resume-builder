// ==========================================
// AI RESUME BUILDER - COMPLETE JAVASCRIPT
// ==========================================

// ==========================================
// 1. COMMON FUNCTIONS
// ==========================================

// Get input value safely
function getFieldValue(id) {
    const element = document.getElementById(id);

    return element ? element.value.trim() : "";
}

// All resume fields
const resumeFields = [
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
// 2. RESUME FORM
// ==========================================

const resumeForm = document.getElementById("resumeForm");

if (resumeForm) {

    resumeForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        // Collect all resume information
        const resumeData = {};

        resumeFields.forEach(function (field) {
            resumeData[field] = getFieldValue(field);
        });

        // Validate required fields
        if (!resumeData.fullName || !resumeData.email) {
            alert("Please enter your name and email.");
            return;
        }

        const submitButton = resumeForm.querySelector(
            'button[type="submit"]'
        );

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Saving Resume...";
        }

        try {

            // Save resume data for preview
            sessionStorage.setItem(
                "resumeData",
                JSON.stringify(resumeData)
            );

            // Save photo if available
            const photoPreview =
                document.getElementById("photoPreview");

            if (
                photoPreview &&
                photoPreview.src.startsWith("data:image/")
            ) {
                sessionStorage.setItem(
                    "resumePhoto",
                    photoPreview.src
                );
            }

            // Check edit mode
            const urlParams = new URLSearchParams(
                window.location.search
            );

            const isEditing =
                urlParams.get("edit") === "true";

            const resumeId =
                sessionStorage.getItem("resumeId");

            const apiUrl = isEditing && resumeId
                ? `/api/resumes/${resumeId}`
                : "/api/resumes";

            const httpMethod = isEditing && resumeId
                ? "PUT"
                : "POST";

            // Send resume to backend
            const response = await fetch(apiUrl, {

                method: httpMethod,

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(resumeData)

            });

            const responseText = await response.text();

            let result;

            try {
                result = JSON.parse(responseText);
            } catch (error) {
                throw new Error(
                    "Server returned HTML instead of JSON. Check backend API."
                );
            }

            if (!response.ok) {
                throw new Error(
                    result.message || "Unable to save resume."
                );
            }

            // Save MongoDB resume ID
            const savedId =
                result.resumeId ||
                result.resume?._id ||
                result._id;

            if (savedId) {
                sessionStorage.setItem(
                    "resumeId",
                    savedId
                );
            }

            alert("Resume saved successfully!");

            // Open preview page
            window.location.href = "preview.html";

        } catch (error) {

            console.error("Resume Save Error:", error);

            alert("Error: " + error.message);

        } finally {

            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = "Generate Resume";
            }

        }

    });

}


// ==========================================
// 3. EDIT RESUME
// ==========================================

const urlParams = new URLSearchParams(
    window.location.search
);

const editMode = urlParams.get("edit") === "true";

if (editMode && resumeForm) {

    const savedResume =
        sessionStorage.getItem("resumeData");

    if (savedResume) {

        try {

            const data = JSON.parse(savedResume);

            resumeFields.forEach(function (field) {

                const input =
                    document.getElementById(field);

                if (input) {
                    input.value = data[field] || "";
                }

            });

            // Update career-specific form labels
            const careerField =
                document.getElementById("careerField");

            if (careerField) {
                careerField.dispatchEvent(
                    new Event("change")
                );
            }

        } catch (error) {

            console.error(
                "Error loading resume:",
                error
            );

        }

    }

}


// ==========================================
// 4. PROFILE PHOTO UPLOAD
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const profilePhoto =
        document.getElementById("profilePhoto");

    const photoPreview =
        document.getElementById("photoPreview");

    if (!profilePhoto || !photoPreview) {
        return;
    }

    // Restore saved photo while editing
    if (editMode) {

        const savedPhoto =
            sessionStorage.getItem("resumePhoto");

        if (savedPhoto) {
            photoPreview.src = savedPhoto;
            photoPreview.style.display = "block";
        }

    }

    profilePhoto.addEventListener("change", function () {

        const file = this.files[0];

        if (!file) return;

        // Accept JPG and PNG only
        if (
            !["image/jpeg", "image/png"].includes(file.type)
        ) {

            alert("Please select JPG or PNG image.");

            this.value = "";
            return;

        }

        // Maximum photo size: 2 MB
        if (file.size > 2 * 1024 * 1024) {

            alert("Image must be less than 2 MB.");

            this.value = "";
            return;

        }

        const reader = new FileReader();

        reader.onload = function (event) {

            const photoData = event.target.result;

            photoPreview.src = photoData;

            photoPreview.style.display = "block";

            sessionStorage.setItem(
                "resumePhoto",
                photoData
            );

        };

        reader.readAsDataURL(file);

    });

    // Clear photo when form is reset
    resumeForm?.addEventListener("reset", function () {

        sessionStorage.removeItem("resumePhoto");

        photoPreview.removeAttribute("src");

        photoPreview.style.display = "none";

    });

});


// ==========================================
// 5. RESUME ANALYZER
// ==========================================

const analyzeBtn =
    document.getElementById("analyzeBtn");

if (analyzeBtn) {

    analyzeBtn.addEventListener("click", function () {

        const savedData =
            sessionStorage.getItem("resumeData");

        if (!savedData) {

            alert("Please create your resume first.");

            window.location.href = "create_resume.html";

            return;

        }

        let data;

        try {
            data = JSON.parse(savedData);
        } catch (error) {
            alert("Saved resume data is invalid.");
            return;
        }

        let score = 0;

        const suggestions = [];

        // Name
        if (data.fullName) {
            score += 10;
        } else {
            suggestions.push("Add your full name.");
        }

        // Email
        if (data.email) {
            score += 10;
        } else {
            suggestions.push("Add your email address.");
        }

        // Phone
        if (data.phone) {
            score += 10;
        } else {
            suggestions.push("Add your phone number.");
        }

        // Professional summary
        if (
            data.objective &&
            data.objective.trim().length >= 50
        ) {
            score += 15;
        } else {
            suggestions.push(
                "Write a professional summary of at least 50 characters."
            );
        }

        // Education
        if (data.degree && data.college) {
            score += 15;
        } else {
            suggestions.push(
                "Complete your education details."
            );
        }

        // Skills
        if (
            data.skills &&
            data.skills.trim().length >= 10
        ) {
            score += 15;
        } else {
            suggestions.push(
                "Add relevant professional skills."
            );
        }

        // Projects
        if (
            data.projects &&
            data.projects.trim().length >= 20
        ) {
            score += 15;
        } else {
            suggestions.push(
                "Describe a relevant project or achievement."
            );
        }

        // Experience, internship or certification
        if (
            data.experience ||
            data.internships ||
            data.certifications
        ) {
            score += 10;
        } else {
            suggestions.push(
                "Add experience, internship or certifications if available."
            );
        }

        // Display score
        const resumeScore =
            document.getElementById("resumeScore");

        if (resumeScore) {
            resumeScore.textContent = score + "/100";
        }

        // Display score message
        const scoreMessage =
            document.getElementById("scoreMessage");

        if (scoreMessage) {

            if (score >= 80) {
                scoreMessage.textContent =
                    "Excellent! Your resume has good completeness.";
            } else if (score >= 60) {
                scoreMessage.textContent =
                    "Good! Your resume can be improved further.";
            } else {
                scoreMessage.textContent =
                    "Your resume needs improvement.";
            }

        }

        // Display suggestions
        const suggestionsList =
            document.getElementById("suggestionsList");

        if (suggestionsList) {

            suggestionsList.innerHTML = "";

            if (suggestions.length === 0) {

                const li = document.createElement("li");

                li.textContent =
                    "All checked sections meet the basic requirements.";

                suggestionsList.appendChild(li);

            } else {

                suggestions.forEach(function (suggestion) {

                    const li = document.createElement("li");

                    li.textContent = suggestion;

                    suggestionsList.appendChild(li);

                });

            }

        }

        // Show analyzer results
        const analysisResult =
            document.getElementById("analysisResult");

        if (analysisResult) {
            analysisResult.style.display = "block";
        }

    });

}

// ==========================================
// END OF SCRIPT
// ==========================================