import { useState } from "react";
import "./App.css";

function containsAny(text, words) {
  return words.some((word) => text.includes(word));
}

function analyzeText(instruction, explanation) {
  const instructionText = instruction.toLowerCase();
  const explanationText = explanation.toLowerCase();

  const gaps = [];
  const questions = [];

  // 1. FREQUENCY
  const instructionTwice = containsAny(instructionText, [
    "twice daily",
    "twice a day",
    "2 times a day",
    "two times a day",
  ]);

  const instructionOnce = containsAny(instructionText, [
    "once daily",
    "once a day",
    "1 time a day",
  ]);

  const explanationTwice = containsAny(explanationText, [
    "twice daily",
    "twice a day",
    "2 times a day",
    "two times a day",
  ]);

  const explanationOnce = containsAny(explanationText, [
    "once daily",
    "once a day",
    "1 time a day",
  ]);

  if (instructionTwice && explanationOnce) {
    gaps.push(
      "The documented instruction says twice daily, while your explanation says once daily."
    );

    questions.push(
      "How many times should I take this medicine each day?"
    );
  }

  if (instructionOnce && explanationTwice) {
    gaps.push(
      "The documented instruction says once daily, while your explanation says twice daily."
    );

    questions.push(
      "How many times should I take this medicine each day?"
    );
  }

  // 2. BEFORE FOOD VS AFTER FOOD
  const instructionBeforeFood = containsAny(instructionText, [
    "before food",
    "before eating",
    "before meals",
    "before a meal",
  ]);

  const instructionAfterFood = containsAny(instructionText, [
    "after food",
    "after eating",
    "after meals",
    "after a meal",
  ]);

  const explanationBeforeFood = containsAny(explanationText, [
    "before food",
    "before eating",
    "before meals",
    "before a meal",
  ]);

  const explanationAfterFood = containsAny(explanationText, [
    "after food",
    "after eating",
    "after meals",
    "after a meal",
  ]);

  if (instructionBeforeFood && explanationAfterFood) {
    gaps.push(
      "The documented instruction says before food, while your explanation says after food."
    );

    questions.push(
      "Should I take this medicine before or after food?"
    );
  }

  if (instructionAfterFood && explanationBeforeFood) {
    gaps.push(
      "The documented instruction says after food, while your explanation says before food."
    );

    questions.push(
      "Should I take this medicine before or after food?"
    );
  }

  if (
    instructionBeforeFood &&
    !explanationBeforeFood &&
    !explanationAfterFood
  ) {
    gaps.push(
      "The documented instruction says to take it before food, but this was not mentioned in your explanation."
    );

    questions.push(
      "Should I take this medicine before or after food?"
    );
  }

  if (
    instructionAfterFood &&
    !explanationBeforeFood &&
    !explanationAfterFood
  ) {
    gaps.push(
      "The documented instruction says to take it after food, but this was not mentioned in your explanation."
    );

    questions.push(
      "Should I take this medicine before or after food?"
    );
  }

  // 3. MORNING VS NIGHT
  const instructionMorning = containsAny(instructionText, [
    "morning",
    "in the morning",
  ]);

  const instructionNight = containsAny(instructionText, [
    "night",
    "at night",
    "nighttime",
  ]);

  const explanationMorning = containsAny(explanationText, [
    "morning",
    "in the morning",
  ]);

  const explanationNight = containsAny(explanationText, [
    "night",
    "at night",
    "nighttime",
  ]);

  if (instructionMorning && explanationNight) {
    gaps.push(
      "The documented instruction mentions morning, while your explanation mentions night."
    );

    questions.push(
      "Should I take this medicine in the morning or at night?"
    );
  }

  if (instructionNight && explanationMorning) {
    gaps.push(
      "The documented instruction mentions night, while your explanation mentions morning."
    );

    questions.push(
      "Should I take this medicine in the morning or at night?"
    );
  }

  if (
    instructionMorning &&
    !explanationMorning &&
    !explanationNight
  ) {
    gaps.push(
      "The documented instruction mentions morning, but this was not mentioned in your explanation."
    );

    questions.push(
      "Should I take this medicine in the morning or at night?"
    );
  }

  if (
    instructionNight &&
    !explanationMorning &&
    !explanationNight
  ) {
    gaps.push(
      "The documented instruction mentions night, but this was not mentioned in your explanation."
    );

    questions.push(
      "Should I take this medicine in the morning or at night?"
    );
  }

  // 4. WATER REQUIREMENT
  const instructionNeedsWater = containsAny(instructionText, [
    "drink enough water",
    "drink plenty of water",
    "with water",
    "drink water",
    "with a glass of water",
  ]);

  const explanationMentionsWater = containsAny(explanationText, [
    "water",
    "drink",
    "hydration",
  ]);

  if (instructionNeedsWater && !explanationMentionsWater) {
    gaps.push(
      "The documented instruction includes a water requirement, but this was not mentioned in your explanation."
    );

    questions.push(
      "Should I take this medicine with water, and how much water should I drink?"
    );
  }

  const uniqueQuestions = [...new Set(questions)];

  if (gaps.length === 0) {
    return {
      hasGap: false,
      gaps: [],
      questions: [
        "Is there anything about these instructions that you would like to clarify with your healthcare professional?",
      ],
    };
  }

  return {
    hasGap: true,
    gaps,
    questions:
      uniqueQuestions.length > 0
        ? uniqueQuestions
        : [
            "Could you please clarify these points with your healthcare professional?",
          ],
  };
}

function App() {
  const [step, setStep] = useState(1);

  const [instruction, setInstruction] = useState("");
  const [explanation, setExplanation] = useState("");
  const [analysis, setAnalysis] = useState(null);

  const [documentType, setDocumentType] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);

  const [showUploadOptions, setShowUploadOptions] = useState(false);

  const documentExamples = {
    "Medical Summary": {
      icon: "📋",
      summary:
        "The patient was advised to follow the documented care instructions and attend the recommended follow-up consultation.",
      instruction:
        "Follow the documented care instructions and attend the recommended follow-up consultation.",
    },

    Prescription: {
  icon: "💊",
  summary:
    "The prescription contains medication and dosage instructions that have been organized for patient understanding.",
  instruction:
    "Take 5 mL of the prescribed solution three times a day before meals.",
},

    "Discharge Summary": {
      icon: "🏥",
      summary:
        "The discharge information contains post-hospital care instructions, medication guidance and follow-up information.",
      instruction:
        "Take the prescribed medicine twice daily after food, drink enough water, and attend the recommended follow-up consultation.",
    },

    "Lab Report": {
      icon: "🧪",
      summary:
        "The report contains laboratory findings that should be reviewed with the healthcare professional.",
      instruction:
        "Review the laboratory findings with your healthcare professional and follow the documented follow-up instructions.",
    },
  };

  const handleFileUpload = (event, type) => {
    const file = event.target.files[0];

    if (!file) return;

    setUploadedFile(file);
    setDocumentType(type);
    setAnalysis(null);
    setShowUploadOptions(false);

    const example = documentExamples[type];

    if (example) {
      setInstruction(example.instruction);
    }

    setStep(2);
  };

  const analyzeUnderstanding = () => {
    const result = analyzeText(instruction, explanation);

    setAnalysis(result);
    setStep(3);
  };

  const startNewSession = () => {
    setStep(1);
    setInstruction("");
    setExplanation("");
    setAnalysis(null);
    setDocumentType("");
    setUploadedFile(null);
    setShowUploadOptions(false);
  };

  return (
    <div className="app">

      {/* HEADER */}
      <header className="header">
        <div>
          <h1>CareRelay</h1>
          <p>Understand your care. Clarify your questions.</p>
        </div>

        <span className="badge">
          AI-Powered Understanding Assistant
        </span>
      </header>


      <main className="container">

        {/* PROGRESS */}
        <div className="progress">

          <span className={step >= 1 ? "active" : ""}>
            1. Upload
          </span>

          <span className={step >= 2 ? "active" : ""}>
            2. Understand
          </span>

          <span className={step >= 3 ? "active" : ""}>
            3. Identify
          </span>

          <span className={step >= 4 ? "active" : ""}>
            4. Continue
          </span>

        </div>


        {/* =========================
    STEP 1 - ADD MEDICAL INFORMATION
========================= */}

{step === 1 && (
  <section className="card upload-page">

    <div className="icon">🏥</div>

    <h2>Add Medical Information</h2>

    <p className="description">
      Upload a medical document or enter the information provided
      by your healthcare professional.
    </p>


    {/* =========================
        OPTION 1 - TYPE / PASTE
    ========================= */}

    <div className="input-section">

      <div className="section-heading">
        <span>✏️</span>

        <div>
          <h3>Enter Medical Information</h3>
          <p>
            Type or paste the instructions, prescription details,
            or medical summary.
          </p>
        </div>
      </div>


      <textarea
        className="medical-input"
        value={instruction}
        onChange={(e) => setInstruction(e.target.value)}
        placeholder={
          "Example:\nTake 5 mL of the medicine three times a day before meals."
        }
      />


      <button
        className="primary-action"
        onClick={() => {
          if (!instruction.trim()) return;

          setDocumentType("Entered Medical Information");
          setUploadedFile(null);
          setAnalysis(null);
          setStep(2);
        }}
        disabled={!instruction.trim()}
      >
        Continue with This Information →
      </button>

    </div>


    {/* =========================
        DIVIDER
    ========================= */}

    <div className="upload-divider">
      <span>OR</span>
    </div>


    {/* =========================
        OPTION 2 - UPLOAD FILE
    ========================= */}

    <div className="upload-section">

      <div className="section-heading">
        <span>📎</span>

        <div>
          <h3>Upload Medical Document</h3>
          <p>
            Upload a prescription, medical summary,
            discharge summary, or lab report.
          </p>
        </div>
      </div>


      {/* MAIN UPLOAD BUTTON */}

      <button
        className="upload-main-button"
        onClick={() =>
          setShowUploadOptions(!showUploadOptions)
        }
      >
        <span className="plus-symbol">+</span>

        <span>
          Add Medical Document
        </span>
      </button>


      {/* DOCUMENT TYPE OPTIONS */}

      {showUploadOptions && (
        <div className="upload-options">

          {/* MEDICAL SUMMARY */}

          <label className="upload-option">

            <span className="upload-option-icon">
              📋
            </span>

            <div>
              <strong>Medical Summary</strong>

              <small>
                Consultation or medical summary
              </small>
            </div>

            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) =>
                handleFileUpload(
                  e,
                  "Medical Summary"
                )
              }
            />

          </label>


          {/* PRESCRIPTION */}

          <label className="upload-option">

            <span className="upload-option-icon">
              💊
            </span>

            <div>
              <strong>Prescription</strong>

              <small>
                Prescription or medication instructions
              </small>
            </div>

            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) =>
                handleFileUpload(
                  e,
                  "Prescription"
                )
              }
            />

          </label>


          {/* DISCHARGE SUMMARY */}

          <label className="upload-option">

            <span className="upload-option-icon">
              🏥
            </span>

            <div>
              <strong>Discharge Summary</strong>

              <small>
                Hospital discharge document
              </small>
            </div>

            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) =>
                handleFileUpload(
                  e,
                  "Discharge Summary"
                )
              }
            />

          </label>


          {/* LAB REPORT */}

          <label className="upload-option">

            <span className="upload-option-icon">
              🧪
            </span>

            <div>
              <strong>Lab Report</strong>

              <small>
                Laboratory or diagnostic report
              </small>
            </div>

            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) =>
                handleFileUpload(
                  e,
                  "Lab Report"
                )
              }
            />

          </label>

        </div>
      )}

    </div>


    {/* =========================
        PRIVACY
    ========================= */}

    <div className="upload-note">

      <span>🔒</span>

      <div>

        <strong>Privacy & Safety</strong>

        <p>
          CareRelay helps organize healthcare information
          and support understanding. It does not diagnose
          or prescribe.
        </p>

      </div>

    </div>

  </section>
)}
        {/* =========================
            STEP 2 - UNDERSTAND
        ========================= */}

        {step === 2 && (
          <section className="card">

            <div className="icon">
              {documentExamples[documentType]?.icon || "📄"}
            </div>

            <h2>Understand Your Medical Information</h2>

            <p className="description">
              CareRelay organizes the available information into
              simpler sections before checking your understanding.
            </p>


            {/* UPLOADED DOCUMENT */}

            <div className="uploaded-file">

              <strong>Uploaded Document</strong>

              <p>
                {uploadedFile
                  ? uploadedFile.name
                  : "No document selected"}
              </p>

              <span>
                {documentType}
              </span>

            </div>


            {/* PATIENT FRIENDLY SUMMARY */}

            <div className="result-box">

              <h3>Patient-Friendly Summary</h3>

              <p>
                {documentExamples[documentType]?.summary ||
                  "Medical information has been organized for review."}
              </p>

            </div>


            {/* DOCUMENTED INFORMATION */}

            <div className="instruction-box">

              <strong>
                Documented Care Information
              </strong>

              <p>
                {instruction}
              </p>

            </div>


            {/* PATIENT EXPLANATION */}

            <h3 className="section-title">
              What did you understand?
            </h3>

            <p className="description">
              Explain the information in your own words.
              CareRelay will compare your explanation with
              the documented information.
            </p>


            <textarea
              value={explanation}
              onChange={(e) =>
                setExplanation(e.target.value)
              }
              placeholder="Example: I should take the medicine twice daily after food and drink enough water in the morning."
            />


            <button
              onClick={analyzeUnderstanding}
              disabled={!explanation.trim()}
            >
              Check My Understanding →
            </button>

          </section>
        )}


        {/* =========================
            STEP 3 - IDENTIFY
        ========================= */}

        {step === 3 && analysis && (
          <section className="card result-card">

            <div className="icon">
              {analysis.hasGap ? "⚠️" : "✓"}
            </div>

            <h2>
              {analysis.hasGap
                ? "Possible Understanding Gaps Detected"
                : "No Obvious Gap Detected"}
            </h2>

            <p className="description">
              CareRelay compares important concepts from the
              documented information with the patient's own-word
              explanation.
            </p>


            {/* SOURCE DOCUMENT */}

            <div className="uploaded-file">

              <strong>Source Information</strong>

              <p>
                {uploadedFile?.name || "Medical information"}
              </p>

              <span>
                {documentType}
              </span>

            </div>


            {/* GAPS */}

            <div className="result-box">

              <h3>
                {analysis.hasGap
                  ? "Possible Understanding Gaps"
                  : "Comparison Result"}
              </h3>

              {analysis.hasGap ? (
                <ul className="gap-list">

                  {analysis.gaps.map((gap, index) => (
                    <li key={index}>
                      {gap}
                    </li>
                  ))}

                </ul>
              ) : (
                <p>
                  No obvious understanding gap was detected
                  from this text comparison.
                </p>
              )}

            </div>


            {/* QUESTIONS */}

            <div className="question-box">

              <h3>
                {analysis.hasGap
                  ? "Suggested Questions"
                  : "Suggested Follow-up"}
              </h3>

              <ol className="question-list">

                {analysis.questions.map(
                  (question, index) => (
                    <li key={index}>
                      {question}
                    </li>
                  )
                )}

              </ol>

            </div>


            {/* TECHNICAL INFORMATION */}

            <div className="analysis-info">

              <h3>
                How CareRelay Analyzes Understanding
              </h3>

              <p>
                CareRelay compares important concepts from
                the healthcare information with the patient's
                own-word explanation.
              </p>

              <p>
                The current prototype uses lightweight
                NLP-style text and concept matching to identify
                possible differences in areas such as frequency,
                timing and instructions.
              </p>

              <p className="info-note">
                This is a clarification aid, not a medical
                diagnosis or treatment decision.
              </p>

            </div>


            <button onClick={() => setStep(4)}>
              View Care Continuity Summary →
            </button>

          </section>
        )}


        {/* =========================
            STEP 4 - SUMMARY
        ========================= */}

        {step === 4 && analysis && (
          <section className="card summary-card">

            <div className="icon">📋</div>

            <h2>Care Continuity Summary</h2>

            <p className="description">
              A simple summary of the information reviewed,
              your understanding and the points that may need
              clarification.
            </p>


            {/* STATUS */}

            <div
              className={
                analysis.hasGap
                  ? "summary-status gap"
                  : "summary-status clear"
              }
            >

              <strong>
                {analysis.hasGap
                  ? "⚠️ Possible Understanding Gaps Detected"
                  : "✓ No Obvious Gap Detected"}
              </strong>

              <p>
                {analysis.hasGap
                  ? "Review these points with your healthcare professional."
                  : "The patient's explanation matches the key concepts in the documented information."}
              </p>

            </div>


            <div className="summary">

              {/* SOURCE */}

              <div className="summary-item">

                <h3>Source Document</h3>

                <p>
                  {uploadedFile?.name ||
                    "Medical information"}
                </p>

                <small>
                  {documentType}
                </small>

              </div>


              {/* DOCUMENTED INFORMATION */}

              <div className="summary-item">

                <h3>Documented Information</h3>

                <p>
                  {instruction}
                </p>

              </div>


              {/* PATIENT UNDERSTANDING */}

              <div className="summary-item">

                <h3>Patient's Understanding</h3>

                <p>
                  {explanation}
                </p>

              </div>


              {/* CLARIFICATION POINTS */}

              <div className="summary-item">

                <h3>Clarification Points</h3>

                {analysis.hasGap ? (
                  <ul className="gap-list">

                    {analysis.gaps.map(
                      (gap, index) => (
                        <li key={index}>
                          {gap}
                        </li>
                      )
                    )}

                  </ul>
                ) : (
                  <p>
                    No obvious understanding gap
                    was detected.
                  </p>
                )}

              </div>


              {/* QUESTIONS */}

              <div className="summary-item">

                <h3>Questions for Follow-up</h3>

                <ol className="question-list">

                  {analysis.questions.map(
                    (question, index) => (
                      <li key={index}>
                        {question}
                      </li>
                    )
                  )}

                </ol>

              </div>

            </div>


            {/* SAFETY */}

            <div className="info-note">

              <strong>
                Important
              </strong>

              <p>
                CareRelay does not determine whether a
                treatment is medically correct. Any possible
                gap or question should be confirmed with the
                appropriate healthcare professional.
              </p>

            </div>


            <button onClick={startNewSession}>
              Start New CareRelay Session
            </button>

          </section>
        )}

      </main>


      {/* FOOTER */}

      <footer>
        CareRelay supports healthcare communication.
        It does not diagnose or prescribe.
      </footer>

    </div>
  );
}

export default App;