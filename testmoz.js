const OLLAMA_API_URL = "http://localhost:11434/api/generate"; // Ollama API endpoint

/**
 * Fetches an AI-generated answer from Ollama for a given question.
 * @param {string} questionText - The question to ask.
 * @returns {Promise<string>} - The AI-generated answer or an error message.
 */
async function getAnswerFromOllama(questionText) {
    try {
        console.log(`🔍 [FETCH] Sending request to Ollama for question: "${questionText}"`);

        const response = await fetch(OLLAMA_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "llama3.2:1b", // Use the exact model name you have installed
                prompt: `Provide a concise response to the following question as if filling out a Google Form. Do not explain the question, and do not include phrases like "The correct answer is" or "The following answer is." Just give the direct answer: Question: "${questionText}"`,
                stream: false, // Set to true if you want streaming responses
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`❌ [ERROR] API Request Failed: HTTP ${response.status} - ${errorBody}`);
            return "API Error";
        }

        const data = await response.json();

        if (!data?.response) {
            console.error("❌ [ERROR] Invalid response structure:", data);
            return "Invalid response format";
        }

        console.log(`✅ [AI RESPONSE] Answer received: "${data.response.trim()}"`);
        return data.response.trim(); // Return the cleaned-up answer
    } catch (error) {
        console.error("❌ [ERROR] Fetch failed:", error);
        return "Connection error - make sure Ollama is running";
    }
}

/**
 * Processes all questions on the page and fills their corresponding input fields with AI-generated answers.
 */
async function processQuestions() {
    console.log("🚀 [START] Processing questions...");

    const questions = document.querySelectorAll(".question");
    const extractedData = [];

    if (questions.length === 0) {
        console.warn("⚠️ [WARNING] No questions found on the page!");
        return;
    }

    console.log(`📌 [INFO] Found ${questions.length} questions on the page.`);

    for (let index = 0; index < questions.length; index++) {
        const question = questions[index];
        const questionText = question.textContent.trim();
        const questionNumber = `Q${index + 1}: `;

        console.log(`\n🎯 [QUESTION ${index + 1}] Processing: "${questionText}"`);

        // Update the question's text content to include the question number
        question.textContent = questionNumber + questionText;
        console.log(`📝 [UPDATE] Question text updated to: "${question.textContent}"`);

        // Find the closest parent with the "data-question-id" attribute
        const parentComponent = question.closest(".component");
        const formEntryId = parentComponent ? parentComponent.getAttribute("data-question-id") : null;

        if (!formEntryId) {
            console.warn(`⚠️ [WARNING] No form entry ID found for question ${index + 1}. Skipping...`);
            continue;
        }

        console.log(`📌 [INFO] Found form entry ID: ${formEntryId}`);

        // Find the input field for the answer within the same component
        const answerInput = parentComponent ? parentComponent.querySelector('input[type="text"]') : null;

        extractedData.push({ id: formEntryId, question: questionNumber + questionText });

        if (answerInput) {
            console.log(`⌛ [WAIT] Fetching AI-generated answer for question ${index + 1}...`);

            // Fetch and fill the AI-generated answer
            const answer = await getAnswerFromOllama(questionText);
            answerInput.value = answer; // Fill the input field with the AI-generated answer
            console.log(`✅ [SUCCESS] AI-generated answer filled: "${answer}"`);
        } else {
            console.warn(`⚠️ [WARNING] No answer input field found for question ${index + 1}.`);
        }
    }

    console.log("✅ [COMPLETE] All questions processed.");
    console.log("📊 [FINAL DATA]", extractedData);
}

// Run the function
processQuestions();