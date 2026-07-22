import config from '../../config';
import {
  GeneratedQuestion,
  AnswerAnalysis,
  InterviewFeedbackResult,
  LlmService,
  DOMAIN_LABELS,
} from './llm.types';

const FALLBACK_QUESTIONS: Record<string, Record<string, string[]>> = {
  FRONTEND_DEVELOPER: {
    EASY: [
      'What is the difference between HTML and HTML5?',
      'Explain what CSS Flexbox is and when you would use it.',
      'What is the purpose of the alt attribute on an img tag?',
      'How do you include external JavaScript in an HTML page?',
      'What is responsive web design?',
    ],
    MEDIUM: [
      'Explain the React component lifecycle and hooks equivalent.',
      'What is the virtual DOM and how does React use it?',
      'How would you optimize frontend performance for a large application?',
      'Explain state management options in React applications.',
      'What are CSS preprocessors and have you used any?',
    ],
    HARD: [
      'Design a component architecture for a complex dashboard with real-time data.',
      'Explain how browser rendering works from HTML to pixels.',
      'How would you implement code splitting and lazy loading in a Next.js app?',
      'Discuss accessibility best practices for SPAs.',
      'How do you handle cross-browser compatibility issues?',
    ],
  },
  BACKEND_DEVELOPER: {
    EASY: [
      'What is REST and what are its main principles?',
      'Explain the difference between SQL and NoSQL databases.',
      'What is an API endpoint?',
      'What does HTTP status code 404 mean?',
      'What is authentication vs authorization?',
    ],
    MEDIUM: [
      'Explain database indexing and when it helps performance.',
      'How would you design a rate-limiting system for an API?',
      'What are microservices and what are their trade-offs?',
      'Explain JWT authentication flow.',
      'How do you handle database migrations in production?',
    ],
    HARD: [
      'Design a scalable notification system for millions of users.',
      'Explain CAP theorem with real-world examples.',
      'How would you debug a memory leak in a Node.js service?',
      'Design an idempotent payment processing API.',
      'Discuss strategies for handling distributed transactions.',
    ],
  },
  PYTHON_DEVELOPER: {
    EASY: [
      'What are Python lists vs tuples?',
      'Explain list comprehensions with an example.',
      'What is a virtual environment and why use one?',
      'What is the difference between == and is in Python?',
      'How do you handle exceptions in Python?',
    ],
    MEDIUM: [
      'Explain decorators in Python with a use case.',
      'What are generators and when would you use them?',
      'How does the GIL affect multithreading in Python?',
      'Explain async/await in Python.',
      'What is duck typing?',
    ],
    HARD: [
      'Design a data pipeline using Python for ETL at scale.',
      'Explain memory management and garbage collection in Python.',
      'How would you optimize a slow pandas DataFrame operation?',
      'Discuss metaclasses and practical use cases.',
      'Design a plugin architecture for a Python application.',
    ],
  },
  JAVA_DEVELOPER: {
    EASY: [
      'What is the difference between JDK, JRE, and JVM?',
      'Explain OOP pillars in Java.',
      'What is the difference between ArrayList and LinkedList?',
      'What is an interface vs abstract class?',
      'What is exception handling in Java?',
    ],
    MEDIUM: [
      'Explain Java memory model: heap vs stack.',
      'What are Java Streams and their benefits?',
      'How does Spring Dependency Injection work?',
      'Explain multithreading and synchronization in Java.',
      'What is the difference between HashMap and ConcurrentHashMap?',
    ],
    HARD: [
      'Design a thread-safe cache with TTL in Java.',
      'Explain JVM tuning for a high-throughput service.',
      'How would you migrate a monolith to microservices in Java?',
      'Discuss reactive programming with Project Reactor.',
      'Design a distributed lock mechanism.',
    ],
  },
  MERN_STACK: {
    EASY: [
      'What does MERN stand for?',
      'How does MongoDB store data?',
      'What is Express.js used for?',
      'Explain client vs server rendering.',
      'What is npm and package.json?',
    ],
    MEDIUM: [
      'How would you structure a MERN application?',
      'Explain Mongoose schemas and validation.',
      'How do you secure a MERN REST API?',
      'What is Redux and when is it needed in React?',
      'How do you deploy a MERN stack application?',
    ],
    HARD: [
      'Design real-time chat using MERN with WebSockets.',
      'How would you scale MongoDB for a growing MERN app?',
      'Implement SSR vs CSR trade-offs for a MERN product.',
      'Design role-based access control across the stack.',
      'Handle file uploads securely in a MERN application.',
    ],
  },
  DATA_SCIENCE: {
    EASY: [
      'What is the difference between supervised and unsupervised learning?',
      'Explain mean, median, and mode.',
      'What is a p-value?',
      'What is overfitting and how do you detect it?',
      'What libraries have you used for data analysis?',
    ],
    MEDIUM: [
      'Explain bias-variance tradeoff.',
      'How do you handle missing data in a dataset?',
      'What is cross-validation and why use it?',
      'Explain precision vs recall.',
      'Describe a data cleaning workflow you have used.',
    ],
    HARD: [
      'Design an A/B testing framework for product experiments.',
      'How would you build a recommendation system?',
      'Explain feature engineering for time-series data.',
      'Discuss ethical considerations in ML model deployment.',
      'How do you monitor model drift in production?',
    ],
  },
  MACHINE_LEARNING: {
    EASY: [
      'What is machine learning?',
      'Explain training vs testing data.',
      'What is a neural network at a high level?',
      'What is gradient descent?',
      'Name common ML algorithms you know.',
    ],
    MEDIUM: [
      'Explain backpropagation intuitively.',
      'What is regularization and why is it needed?',
      'Compare Random Forest vs Gradient Boosting.',
      'How do you evaluate a classification model?',
      'What is transfer learning?',
    ],
    HARD: [
      'Design an ML pipeline for real-time inference.',
      'Explain attention mechanism in transformers.',
      'How would you reduce inference latency for a large model?',
      'Discuss federated learning use cases.',
      'How do you handle imbalanced datasets at scale?',
    ],
  },
  DEVOPS: {
    EASY: [
      'What is CI/CD?',
      'Explain what Docker is.',
      'What is version control and why use Git?',
      'What is the difference between a container and a VM?',
      'What is infrastructure as code?',
    ],
    MEDIUM: [
      'Explain Kubernetes pods, services, and deployments.',
      'How would you set up a CI/CD pipeline for a web app?',
      'What monitoring tools have you used?',
      'Explain blue-green vs canary deployments.',
      'How do you manage secrets in production?',
    ],
    HARD: [
      'Design a disaster recovery plan for cloud infrastructure.',
      'How would you troubleshoot high latency in a microservices mesh?',
      'Design auto-scaling for variable traffic patterns.',
      'Explain GitOps workflow in detail.',
      'How do you implement zero-downtime database migrations?',
    ],
  },
  UI_UX: {
    EASY: [
      'What is the difference between UI and UX?',
      'What is a wireframe?',
      'Explain color theory basics for interfaces.',
      'What is usability testing?',
      'What tools do you use for design?',
    ],
    MEDIUM: [
      'Walk through your design process for a new feature.',
      'How do you conduct user research?',
      'Explain design systems and their benefits.',
      'How do you balance aesthetics with accessibility?',
      'What is information architecture?',
    ],
    HARD: [
      'Redesign an onboarding flow for a complex SaaS product.',
      'How do you measure UX success with metrics?',
      'Design for inclusive accessibility (WCAG AA).',
      'Handle conflicting stakeholder feedback in design.',
      'Create a design strategy for multi-platform products.',
    ],
  },
  HR: {
    EASY: [
      'Tell me about yourself.',
      'Why are you interested in this role?',
      'What are your greatest strengths?',
      'Where do you see yourself in 5 years?',
      'Why should we hire you?',
    ],
    MEDIUM: [
      'Describe a time you handled a conflict at work.',
      'Tell me about a project you are proud of.',
      'How do you handle tight deadlines?',
      'Describe a failure and what you learned.',
      'How do you work in a team environment?',
    ],
    HARD: [
      'Describe leading a team through a major organizational change.',
      'Tell me about a difficult decision with incomplete information.',
      'How do you handle giving critical feedback to a peer?',
      'Describe managing competing priorities from multiple stakeholders.',
      'Tell me about a time you had to advocate for an unpopular idea.',
    ],
  },
  MARKETING: {
    EASY: [
      'What is digital marketing?',
      'Explain SEO in simple terms.',
      'What is a marketing funnel?',
      'What social media platforms have you managed?',
      'What is CTR and why does it matter?',
    ],
    MEDIUM: [
      'How would you launch a new product campaign?',
      'Explain content marketing strategy.',
      'How do you measure campaign ROI?',
      'What is A/B testing in marketing?',
      'Describe your experience with Google Analytics.',
    ],
    HARD: [
      'Design a go-to-market strategy for a B2B SaaS product.',
      'How would you reposition a brand losing market share?',
      'Build a marketing plan with limited budget constraints.',
      'Explain attribution modeling for multi-channel campaigns.',
      'How do you align marketing and sales teams?',
    ],
  },
};

function pickFallbackQuestion(
  domain: string,
  difficulty: string,
  previousQuestions: string[]
): GeneratedQuestion {
  const bank = FALLBACK_QUESTIONS[domain] ?? FALLBACK_QUESTIONS.BACKEND_DEVELOPER;
  const pool = bank[difficulty] ?? bank.MEDIUM;
  const available = pool.filter((q) => !previousQuestions.some((pq) => pq.includes(q.slice(0, 30))));
  const questionText = available[0] ?? pool[Math.floor(Math.random() * pool.length)];

  return {
    questionText,
    category: DOMAIN_LABELS[domain] ?? domain,
    difficulty: difficulty as GeneratedQuestion['difficulty'],
  };
}

function analyzeAnswerFallback(question: string, answer: string): AnswerAnalysis {
  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;
  let score = 5;

  if (wordCount >= 30) score += 2;
  if (wordCount >= 80) score += 1;
  if (wordCount < 10) score -= 3;
  if (/example|for instance|such as/i.test(answer)) score += 1;
  if (/because|therefore|as a result/i.test(answer)) score += 0.5;

  score = Math.min(10, Math.max(1, Math.round(score)));

  const suggestedDifficulty: AnswerAnalysis['suggestedDifficulty'] =
    score >= 8 ? 'HARD' : score >= 5 ? 'MEDIUM' : 'EASY';

  return {
    score,
    feedback:
      score >= 7
        ? 'Solid answer with good detail. Consider adding a concrete example to strengthen it further.'
        : score >= 4
          ? 'Adequate response but could use more depth, structure, or specific examples.'
          : 'Answer needs more detail. Try using the STAR method and include measurable outcomes.',
    strengths: score >= 6 ? ['Clear communication', 'Relevant content'] : ['Attempted the question'],
    improvements:
      score >= 7
        ? ['Add quantifiable results where possible']
        : ['Provide more specific examples', 'Structure answer with clear points', 'Expand technical depth'],
    suggestedDifficulty,
  };
}

export class FallbackLlmService implements LlmService {
  async generateQuestion(params: {
    domain: string;
    difficulty: string;
    previousQuestions: string[];
    questionNumber: number;
  }): Promise<GeneratedQuestion> {
    return pickFallbackQuestion(params.domain, params.difficulty, params.previousQuestions);
  }

  async analyzeAnswer(params: {
    question: string;
    answer: string;
  }): Promise<AnswerAnalysis> {
    return analyzeAnswerFallback(params.question, params.answer);
  }

  async generateInterviewFeedback(params: {
    domain: string;
    scores: { overall: number; technical: number; communication: number };
    qaPairs: Array<{ question: string; score: number }>;
  }): Promise<InterviewFeedbackResult> {
    const avgScore = params.scores.overall;
    const weakQuestions = params.qaPairs.filter((q) => q.score < 6);

    return {
      strengths:
        avgScore >= 7
          ? ['Strong technical responses', 'Good communication clarity', 'Demonstrated domain knowledge']
          : avgScore >= 5
            ? ['Completed all interview questions', 'Showed willingness to engage with topics']
            : ['Participated in the full interview session'],
      weaknesses:
        weakQuestions.length > 0
          ? ['Some answers lacked depth or specific examples', 'Room to improve structured responses']
          : ['Continue practicing under timed conditions'],
      topicsToImprove: weakQuestions.slice(0, 3).map((q) => q.question.slice(0, 80)),
      learningResources: getDefaultLearningResources(params.domain),
      performanceSummary: `You scored ${params.scores.overall}% overall with ${params.scores.technical}% technical and ${params.scores.communication}% communication. ${
        avgScore >= 70
          ? 'Strong performance — keep refining advanced topics.'
          : avgScore >= 50
            ? 'Solid foundation — focus on depth and concrete examples.'
            : 'Keep practicing — review fundamentals and use the STAR method.'
      }`,
    };
  }
}

async function callGemini(prompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${config.geminiApiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error: ${response.status} ${err}`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

async function callGroq(prompt: string): Promise<string> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.groqApiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  return data.choices?.[0]?.message?.content ?? '';
}

async function callLlm(prompt: string): Promise<string> {
  if (config.geminiApiKey) {
    try {
      return await callGemini(prompt);
    } catch (error) {
      console.warn('Gemini failed, trying Groq:', error);
    }
  }

  if (config.groqApiKey) {
    return callGroq(prompt);
  }

  throw new Error('No LLM API key configured');
}

function parseJsonFromLlm<T>(text: string): T | null {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    return JSON.parse(jsonMatch[0]) as T;
  } catch {
    return null;
  }
}

function getDefaultLearningResources(domain: string): InterviewFeedbackResult['learningResources'] {
  const resources: Record<string, InterviewFeedbackResult['learningResources']> = {
    FRONTEND_DEVELOPER: [
      { title: 'React Documentation', url: 'https://react.dev', type: 'Documentation' },
      { title: 'JavaScript.info', url: 'https://javascript.info', type: 'Tutorial' },
      { title: 'Frontend Mentor', url: 'https://www.frontendmentor.io', type: 'Practice' },
    ],
    BACKEND_DEVELOPER: [
      { title: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer', type: 'Guide' },
      { title: 'Node.js Docs', url: 'https://nodejs.org/docs', type: 'Documentation' },
    ],
    HR: [
      { title: 'STAR Method Guide', url: 'https://www.themuse.com/advice/star-interview-method', type: 'Guide' },
      { title: 'Behavioral Interview Prep', url: 'https://www.indeed.com/career-advice/interviewing/behavioral-interview-questions', type: 'Practice' },
    ],
  };

  return (
    resources[domain] ?? [
      { title: 'LeetCode', url: 'https://leetcode.com', type: 'Practice' },
      { title: 'Interviewing.io', url: 'https://interviewing.io', type: 'Mock Interviews' },
      { title: 'Pramp', url: 'https://www.pramp.com', type: 'Peer Practice' },
    ]
  );
}

export class UnifiedLlmService implements LlmService {
  private fallback = new FallbackLlmService();

  async generateQuestion(params: {
    domain: string;
    domainLabel: string;
    difficulty: string;
    resumeContext?: string;
    previousQuestions: string[];
    previousAnswers: Array<{ question: string; answer: string; score?: number }>;
    questionNumber: number;
    totalQuestions: number;
  }): Promise<GeneratedQuestion> {
    const hasLlm = config.geminiApiKey || config.groqApiKey;

    if (!hasLlm) {
      return this.fallback.generateQuestion(params);
    }

    const prevContext = params.previousAnswers
      .slice(-3)
      .map(
        (a, i) =>
          `Q${i + 1}: ${a.question}\nA: ${a.answer.slice(0, 300)}${a.score != null ? `\nScore: ${a.score}/10` : ''}`
      )
      .join('\n\n');

    const prompt = `You are an expert technical interviewer. Generate ONE interview question.

Domain: ${params.domainLabel}
Difficulty: ${params.difficulty}
Question ${params.questionNumber} of ${params.totalQuestions}
${params.resumeContext ? `\nCandidate Resume Context:\n${params.resumeContext.slice(0, 1500)}` : ''}

Previous questions (DO NOT repeat similar topics):
${params.previousQuestions.join('\n') || 'None yet'}

Recent Q&A context for adaptive follow-up:
${prevContext || 'None yet'}

Rules:
- Ask exactly ONE question
- Match the difficulty level
- If previous answers were strong (score 7+), increase difficulty slightly
- If previous answers were weak (score <5), ask a clarifying or easier follow-up
- Avoid repeating topics from previous questions
- For HR domain, use behavioral STAR-format questions

Respond ONLY with valid JSON:
{"questionText":"...","category":"Technical|Behavioral|System Design|Domain Specific","difficulty":"EASY|MEDIUM|HARD"}`;

    try {
      const text = await callLlm(prompt);
      const parsed = parseJsonFromLlm<GeneratedQuestion>(text);
      if (parsed?.questionText) {
        return {
          questionText: parsed.questionText,
          category: parsed.category ?? params.domainLabel,
          difficulty: (parsed.difficulty as GeneratedQuestion['difficulty']) ?? params.difficulty as GeneratedQuestion['difficulty'],
        };
      }
    } catch (error) {
      console.warn('LLM question generation failed, using fallback:', error);
    }

    return this.fallback.generateQuestion(params);
  }

  async analyzeAnswer(params: {
    question: string;
    answer: string;
    domain: string;
    difficulty: string;
  }): Promise<AnswerAnalysis> {
    const hasLlm = config.geminiApiKey || config.groqApiKey;

    if (!hasLlm) {
      return this.fallback.analyzeAnswer(params);
    }

    const prompt = `Analyze this interview answer.

Domain: ${params.domain}
Difficulty: ${params.difficulty}
Question: ${params.question}
Answer: ${params.answer}

Score 1-10 based on: relevance, depth, clarity, examples, technical accuracy.

Respond ONLY with valid JSON:
{
  "score": 7,
  "feedback": "2-3 sentence constructive feedback",
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "suggestedDifficulty": "EASY|MEDIUM|HARD"
}`;

    try {
      const text = await callLlm(prompt);
      const parsed = parseJsonFromLlm<AnswerAnalysis>(text);
      if (parsed?.score != null) {
        return {
          score: Math.min(10, Math.max(1, parsed.score)),
          feedback: parsed.feedback ?? 'Answer recorded.',
          strengths: parsed.strengths ?? [],
          improvements: parsed.improvements ?? [],
          suggestedDifficulty: parsed.suggestedDifficulty ?? 'MEDIUM',
        };
      }
    } catch (error) {
      console.warn('LLM answer analysis failed, using fallback:', error);
    }

    return this.fallback.analyzeAnswer(params);
  }

  async generateInterviewFeedback(params: {
    domain: string;
    domainLabel: string;
    difficulty: string;
    qaPairs: Array<{ question: string; answer: string; score: number; category?: string }>;
    scores: {
      overall: number;
      technical: number;
      communication: number;
      confidence: number;
      problemSolving: number;
      resumeMatch: number;
      behavioral: number;
    };
    resumeUsed: boolean;
  }): Promise<InterviewFeedbackResult> {
    const hasLlm = config.geminiApiKey || config.groqApiKey;
    if (!hasLlm) {
      return this.fallback.generateInterviewFeedback({
        domain: params.domain,
        scores: params.scores,
        qaPairs: params.qaPairs,
      });
    }

    const qaSummary = params.qaPairs
      .map((q, i) => `Q${i + 1} (${q.category ?? 'General'}, score ${q.score}/10): ${q.question}\nA: ${q.answer.slice(0, 200)}`)
      .join('\n\n');

    const prompt = `You are an expert interview coach. Generate comprehensive interview feedback.

Domain: ${params.domainLabel}
Difficulty: ${params.difficulty}
Resume used: ${params.resumeUsed ? 'Yes' : 'No'}

Scores (0-100):
- Overall: ${params.scores.overall}
- Technical: ${params.scores.technical}
- Communication: ${params.scores.communication}
- Confidence: ${params.scores.confidence}
- Problem Solving: ${params.scores.problemSolving}
- Resume Match: ${params.scores.resumeMatch}
- Behavioral: ${params.scores.behavioral}

Q&A Summary:
${qaSummary}

Respond ONLY with valid JSON:
{
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "topicsToImprove": ["topic1", "topic2", "topic3"],
  "learningResources": [
    {"title": "Resource Name", "url": "https://...", "type": "Documentation|Course|Practice|Guide"}
  ],
  "performanceSummary": "3-5 sentence overall performance summary"
}`;

    try {
      const text = await callLlm(prompt);
      const parsed = parseJsonFromLlm<InterviewFeedbackResult>(text);
      if (parsed?.performanceSummary) {
        return {
          strengths: parsed.strengths ?? [],
          weaknesses: parsed.weaknesses ?? [],
          topicsToImprove: parsed.topicsToImprove ?? [],
          learningResources: parsed.learningResources?.length
            ? parsed.learningResources
            : getDefaultLearningResources(params.domain),
          performanceSummary: parsed.performanceSummary,
        };
      }
    } catch (error) {
      console.warn('LLM feedback generation failed, using fallback:', error);
    }

    return this.fallback.generateInterviewFeedback({
      domain: params.domain,
      scores: params.scores,
      qaPairs: params.qaPairs,
    });
  }
}

export const llmService: LlmService = new UnifiedLlmService();
