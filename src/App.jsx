import React, { useState } from "react";
import "./App.css";

// Configuration
const API_BASE_URL = ""; // or just use "" (empty string) if you always append the endpoint

const App = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    email: "",
    phone: "",
    language: "eng", // Default language code
    answers: {},
  });

  // Language mapping based on your directory structure
  const languageMap = {
    eng: "English",
    hindi: "Hindi",
    lng_kannada: "Kannada",
    lng_malayalam: "Malayalam",
    lng_marathi: "Marathi",
    lng_punjabi: "Punjabi",
    lng_Tamil: "Tamil",
    lng_telugu: "Telugu",
  };

  // Age group mapping based on your backend structure
  const getAgeGroup = (age) => {
    const ageNum = parseInt(age);
    if (ageNum <= 5) return "age1"; // 3-5 years
    if (ageNum <= 8) return "age2"; // 5-8 years
    return "age3"; // 8-12 years
  };

  const nextStep = async () => {
    if (currentStep === 1) {
      // Validate required fields
      if (
        !formData.name ||
        !formData.age ||
        !formData.email ||
        !formData.phone
      ) {
        alert("Please fill in all required fields");
        return;
      }

      // Store current scroll position
      const currentScrollY = window.scrollY;
      
      // First move to step 2, then fetch questions to avoid scroll jumping
      setCurrentStep(2);
      
      // Fetch questions from backend after a small delay to ensure smooth transition
      setTimeout(async () => {
        await fetchQuestions();
        // Restore scroll position after questions load
        setTimeout(() => {
          window.scrollTo(0, currentScrollY);
        }, 0);
      }, 100);
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, 2));
    }
  };

  const updateFormData = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateAnswer = (questionIndex, value) => {
    setFormData((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionIndex]: value,
      },
    }));
  };

  const fetchQuestions = async () => {
    setLoading(true);
    setError("");

    try {
      const ageGroup = getAgeGroup(formData.age);
      const langCode = formData.language;

      console.log(
        `Fetching questions from ${API_BASE_URL}/survey/${langCode}/${ageGroup}`
      );

      const response = await fetch(
        `${API_BASE_URL}/survey/${langCode}/${ageGroup}`
      );

      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error(`Failed to fetch questions: ${response.status}`);
      }

      const questionsData = await response.json();
      console.log("Raw questionsData:", questionsData);

      // ✅ If your JSON is a direct array, not an object with "questions"
      setQuestions(
        Array.isArray(questionsData)
          ? questionsData
          : questionsData.questions || []
      );
    } catch (err) {
      console.error("Error fetching questions:", err);
      setError("Failed to load questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const submitSurvey = async () => {
    setLoading(true);
    setError("");

    try {
      const ageGroup = getAgeGroup(formData.age);

      // Prepare survey data in the format expected by your backend
      const surveyData = {
        language_code: formData.language,
        age_group: ageGroup,
        user_info: {
          name: formData.name,
          age: formData.age,
          email: formData.email,
          phone: formData.phone,
        },
        survey: Object.entries(formData.answers).map(
          ([questionIndex, optionId]) => ({
            question_id: parseInt(questionIndex),
            option_id: optionId + 1, // Your backend expects 1-based indexing
          })
        ),
      };

      console.log("Submitting survey data:", surveyData);

      const response = await fetch(`${API_BASE_URL}/survey`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(surveyData),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit survey: ${response.status}`);
      }

      const result = await response.json();
      console.log("Survey result:", result);

      // Store the result for display
      setFormData((prev) => ({
        ...prev,
        result: result,
      }));
    } catch (err) {
      console.error("Error submitting survey:", err);
      setError("Failed to submit survey. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="app-content">
        {/* Header */}
        <div className="header">
          <div className="header-content">
            <div className="logo-section">
              <img
                src="assets/img/giftolexia_logo.png"
                alt="Giftolexia Logo"
                className="logo-image"
              />
              <div>
                <h1>Giftolexia</h1>
                <p className="tagline">Early Screening Assessment</p>
              </div>
            </div>

            <div className="header-right">
              <div className="social-links">
                <a
                  href="https://www.linkedin.com/company/giftolexia/posts/?feedView=all"
                  className="social-link linkedin"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a
                  href="https://www.facebook.com/giftolexia"
                  className="social-link facebook"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              </div>

              <div className="grant-info">
                <div className="grant-logo">
                  <div className="grant-image-placeholder">
                    {/* Replace with actual image */}
                    <img src="/assets/img/hdfclogo.png" alt="Grant Logo" />
                  </div>
                </div>
                <div className="grant-text">
                  <p>Supported by</p>
                  <p>
                    <strong>HDFC SmartUP Grant</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* Developer Navigation - Remove in production */}
          {/* <div className="dev-navigation">
            <p>Developer Navigation (Remove in production)</p>
            <div className="dev-nav-buttons">
              <button 
                className={`btn ${currentStep === 1 ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setCurrentStep(1)}
              >
                Step 1: Contact Form
              </button>
              <button 
                className={`btn ${currentStep === 2 ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => {
                  setCurrentStep(2);
                  // Mock some questions for testing if none exist
                  if (questions.length === 0) {
                    setQuestions([
                      "Does your child have difficulty remembering names?",
                      "Does your child confuse similar looking letters?",
                      "Does your child have trouble with rhyming words?"
                    ]);
                  }
                }}
              >
                Step 2: Questionnaire
              </button>
            </div>
          </div> */}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {currentStep === 1 && (
            <ContactForm
              formData={formData}
              updateFormData={updateFormData}
              onNext={nextStep}
              languageMap={languageMap}
            />
          )}

          {currentStep === 2 && (
            <QuestionnairePage
              formData={formData}
              updateAnswer={updateAnswer}
              onNext={nextStep}
              questions={questions}
              loading={loading}
              onSubmit={submitSurvey}
            />
          )}
        </div>
      </div>npm
    </div>
  );
};

const ContactForm = ({ formData, updateFormData, onNext, languageMap }) => {
  return (
    <div className="form-container">
      <div className="welcome-section">
        <h2>Early Screening Checklist</h2>
        <p className="welcome-text">
          Dyslexia is often defined as an unexpected difficulty in reading, for
          an individual’s chronological age. Other learning challenges like
          Dyscalculia and Dysgraphia are also prevalent in children of school
          going age. This results in a substantial gap between a child’s
          potential and academic performance. Early identification and right
          remediation are crucial for the academic success of these children.
         
        </p>
      </div>

      <div className="form-layout">
        {/* Left side - Contact form */}
        <div className="contact-form-section">
          <div className="form-card">
            <h3>Contact Information</h3>

            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData("name", e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="age">Child's Age Group *</label>
              <select
                id="age"
                value={formData.age}
                onChange={(e) => updateFormData("age", e.target.value)}
                required
              >
                <option value="">Select age group</option>
                <option value="4">3-5 years</option>
                <option value="6">5-8 years</option>
                <option value="10">8-12 years</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => updateFormData("email", e.target.value)}
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => updateFormData("phone", e.target.value)}
                placeholder="+91 7406722955"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="language">Preferred Language</label>
              <select
                id="language"
                value={formData.language}
                onChange={(e) => updateFormData("language", e.target.value)}
              >
                {Object.entries(languageMap).map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <button className="btn btn-primary btn-large" onClick={onNext}>
              Start
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const QuestionnairePage = ({
  formData,
  updateAnswer,
  onNext,
  questions,
  loading,
  onSubmit,
}) => {
  const options = ["Never", "Sometimes", "Often"];
  const questionRefs = React.useRef([]);

  const handleSubmit = async (event) => {
    // Prevent any default form submission behavior that might cause scrolling
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // Store current scroll position to prevent jumping
    const currentScrollY = window.scrollY;
    
    // Check if all questions are answered
    const unansweredIndex = questions.findIndex(
      (_, index) => formData.answers[index] === undefined
    );

    if (unansweredIndex !== -1) {
      alert("Please answer all questions before proceeding.");
      // Scroll to the first unanswered question
      if (questionRefs.current[unansweredIndex]) {
        questionRefs.current[unansweredIndex].scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        questionRefs.current[unansweredIndex].focus?.();
      }
      return;
    }

    await onSubmit();
    
    // Restore scroll position after results load
    setTimeout(() => {
      window.scrollTo(0, currentScrollY);
    }, 0);
  };

  if (loading) {
    return (
      <div className="questionnaire-container">
        <div className="loading-message">
          <div>Please wait</div>
        </div>
      </div>
    );
  }

  return (
    <div className="questionnaire-container">
      <div className="questionnaire-header">
        <h2>Early Screening Checklist</h2>
        <p className="questionnaire-subtitle">
          Some general indications are listed below .Please answer all the
          questions. Choose the option that best describes your child&#39;s
          typical behaviour. These may be associated with dyslexia or other
          learning difficulties, if they are unexpected for the child’s age,
          educational level, or cognitive abilities. If many of these are
          observed frequently and the child’s score is high , we request you to
          seek the support of a counsellor.
           <br />
          <br />
          <b>We request you to read about the unique strengths of children with learning challenges.</b>
        </p>
      </div>

      <div className="questions-grid">
        {questions.map((question, index) => (
          <div
            key={index}
            className="question-row"
            ref={(el) => (questionRefs.current[index] = el)}
            tabIndex={-1}
          >
            <div className="question-text">
              <span className="question-number">{index + 1}.</span>
              {typeof question === "string"
                ? question
                : question.text || question.question}
            </div>
            <div className="options-group">
              {options.map((option, optionIndex) => (
                <label key={optionIndex} className="radio-option">
                  <input
                    type="radio"
                    name={`question-${index}`}
                    value={optionIndex}
                    checked={formData.answers[index] === optionIndex}
                    onChange={() => updateAnswer(index, optionIndex)}
                  />
                  <span className="radio-text">{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="navigation-buttons">
        {!formData.result && !loading ? (
          <button
            className="btn btn-primary btn-large"
            onClick={(event) => handleSubmit(event)}
            disabled={loading}
          >
            View Results
          </button>
        ) : loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text-primary">Waiting for results...</p>
            <p className="loading-text-secondary">Please wait while we analyze your responses</p>
          </div>
        ) : (
          // Results displayed right where the button was
          <div className="results-container">
            <div className={`results-card ${formData.result.action === "ok" ? "success" : "warning"}`}>
              <p className={`results-text ${formData.result.action === "ok" ? "success" : "warning"}`}>
                {formData.result.action === "ok" 
                  ? "Based on your responses, your child is not at risk. If you have any questions, please contact us."
                  : "Based on your responses, your child's score is above normal. We recommend that you seek professional guidance. If you have any questions, please contact us."
                }
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Additional Results Information - Only show after results are loaded */}
      {formData.result && (
        <div className="additional-results-section">
          <div className="results-grid">
            {/* Contact Section */}
            <div className="info-card">
              <h3>Contact Us</h3>
              <p>Want to discuss these results with our specialists?</p>
              <div className="contact-info">
                <div className="contact-item">
                  <span className="contact-label">Email:</span>
                  <span>info@giftolexia.com</span>
                </div>
                <div className="contact-item">
                  <span className="contact-label">Phone:</span>
                  <span>91 7406722955</span>
                </div>
              </div>
            </div>

            {/* Next Steps Section */}
            <div className="info-card">
              <h3>Next Steps</h3>
              <div className="next-steps">
                {formData.result.action === "ok" ? (
                  <div>
                    <div className="next-step-item">
                      <span className="next-step-bullet">•</span>
                      Continue monitoring your child's development
                    </div>
                    <div className="next-step-item">
                      <span className="next-step-bullet">•</span>
                      Maintain regular check-ups with your pediatrician
                    </div>
                    <div className="next-step-item">
                      <span className="next-step-bullet">•</span>
                      Encourage reading and learning activities
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="next-step-item">
                      <span className="next-step-bullet">•</span>
                      Consider consulting with a developmental specialist
                    </div>
                    <div className="next-step-item">
                      <span className="next-step-bullet">•</span>
                      Discuss results with your child's pediatrician
                    </div>
                    <div className="next-step-item">
                      <span className="next-step-bullet">•</span>
                      Keep track of your child's progress
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Strengths Section */}
      <div className="strengths-section">
        <div className="strengths-card">
          <h3 className="strengths-title">Some Noticeable Strengths</h3>
          <div className="strengths-list">
            <p>Curiosity</p>
            <p>Great imagination</p>
            <p>Ability to figure things out, gets the gist of things</p>
            <p>Eager to embrace new ideas</p>
            <p>A good understanding of new concepts</p>
            <p>A larger vocabulary than typical for age group</p>
            <p>Enjoys solving puzzles</p>
            <p>Talent for building models</p>
            <p>Good at problem solving</p>
            <p>Excellent comprehension of stories read or told to him</p>
            <p>Empathetic to the needs or feelings of others</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
