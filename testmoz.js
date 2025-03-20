const OLLAMA_API_URL = "http://localhost:11434/api/generate"; // Adjust if needed

async function getAnswerFromOllama(questionText) {
    try {
        console.log(`🔍 [FETCH] Sending request to Ollama for question: "${questionText}"`);

        const response = await fetch(OLLAMA_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama3",  // Change model if needed
                prompt: `Answer this question concisely: ${questionText}`,
                stream: false
            })
        });

        if (!response.ok) {
            console.error(`❌ [ERROR] API Request Failed: HTTP ${response.status} - ${response.statusText}`);
            return "API Error";
        }

        const data = await response.json();
        
        if (!data || !data.response) {
            console.error("❌ [ERROR] Invalid response from Ollama:", data);
            return "Invalid AI Response";
        }

        console.log(`✅ [AI RESPONSE] Answer received: "${data.response.trim()}"`);
        return data.response.trim(); // Extract and clean the answer

    } catch (error) {
        console.error("❌ [ERROR] Fetching AI answer failed:", error);
        return "AI Error"; // Fallback answer
    }
}

async function processQuestions() {
    console.log("🚀 [START] Processing questions...");

    const questions = document.querySelectorAll('.question');
    const extractedData = [];

    if (questions.length === 0) {
        console.warn("⚠️ [WARNING] No questions found on the page!");
        return;
    }

    console.log(`📌 [INFO] Found ${questions.length} questions on the page.`);

    for (let index = 0; index < questions.length; index++) {
        let question = questions[index];
        let questionText = question.textContent.trim();
        let questionNumber = `Q${index + 1}: `;

        console.log(`\n🎯 [QUESTION ${index + 1}] Processing: "${questionText}"`);

        // Update the question's text content to include the question number
        question.textContent = questionNumber + questionText;
        console.log(`📝 [UPDATE] Question text updated to: "${question.textContent}"`);

        // Find the closest parent with the "data-question-id" attribute
        let parentComponent = question.closest('.component');
        let formEntryId = parentComponent ? parentComponent.getAttribute('data-question-id') : null;

        if (!formEntryId) {
            console.warn(`⚠️ [WARNING] No form entry ID found for question ${index + 1}. Skipping...`);
            continue;
        }

        console.log(`📌 [INFO] Found form entry ID: ${formEntryId}`);

        // Find the input field for the answer within the same component
        let answerInput = parentComponent ? parentComponent.querySelector('input[type="text"]') : null;

        extractedData.push({ id: formEntryId, question: questionNumber + questionText });

        if (answerInput) {
            console.log(`⌛ [WAIT] Fetching AI-generated answer for question ${index + 1}...`);

            // ✅ Await the AI-generated answer before proceeding
            const answer = await getAnswerFromOllama(questionText);
            answerInput.value = answer; // Fill the input field with AI-generated answer
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