import { COURSE_JSON_SCHEMA, gradeAnswer, gradeQuiz, gradeWrittenExercise } from '@/data/learningModule'
import { COURSE_GENERATOR_PROMPT, QUIZ_GRADER_PROMPT, SYSTEM_PROMPT, TUTOR_FLOW_PROMPT } from '@/data/learningPrompts'
import { llmConfig, isLLMConfigured } from '@/config/llmConfig'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const withTimeout = async (promise, timeoutMs = llmConfig.timeoutMs) => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await promise(controller.signal)
  } finally {
    clearTimeout(timer)
  }
}

const tryParseJson = (content) => {
  if (!content) return null
  try {
    return JSON.parse(content)
  } catch {
    const match = content.match(/\{[\s\S]*\}/)
    if (!match) return null
    try {
      return JSON.parse(match[0])
    } catch {
      return null
    }
  }
}

const normalizeId = (value) =>
  String(value || 'course').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const makeFallbackCourse = ({ title, author, sourceTitle, modules = [], insights = [], difficulty = 'beginner', focusAreas = '' }) => {
  const chapters = (modules.length ? modules : [{ title: 'Core Concepts', content: sourceTitle, key_insights: insights.slice(0, 4) }]).slice(0, 5)
  const outline = chapters.map((module, chapterIndex) => {
    const keyInsights = (module.key_insights || insights || []).slice(0, 4)
    const sectionIdBase = chapterIndex + 1
    return {
      chapter: chapterIndex + 1,
      title: module.title || `Chapter ${chapterIndex + 1}`,
      minutes: 8,
      sections: [
        {
          section_id: `${sectionIdBase}.1`,
          type: 'teach',
          title: `${module.title || 'Concept'} essentials`,
          minutes: 4,
          content_blocks: [
            { block_type: 'short_paragraph', text: module.content || `Overview for ${module.title || sourceTitle}.` },
            { block_type: 'bullet_list', text: keyInsights.length ? keyInsights : ['Capture the key idea', 'Connect to daily decisions', 'Apply with one simple action'] }
          ],
          interactive_questions: [
            {
              question_id: `Q-${sectionIdBase}-1`,
              format: 'short_answer',
              prompt: `What is the most important idea from ${module.title || 'this chapter'}?`,
              answer_key: keyInsights[0] || 'Explain the core concept in your own words.',
              why_this_matters: 'Summarizing sharpens recall and application.'
            }
          ]
        },
        {
          section_id: `${sectionIdBase}.2`,
          type: 'reflection',
          title: `${module.title || 'Concept'} in practice`,
          minutes: 4,
          content_blocks: [
            {
              block_type: 'bullet_list',
              text: [
                `Focus area: ${focusAreas || 'execution'}`,
                `Difficulty level: ${difficulty}`,
                `Apply one idea from ${module.title || 'this chapter'} this week.`
              ]
            }
          ],
          interactive_questions: [
            {
              question_id: `Q-${sectionIdBase}-2`,
              format: 'multiple_choice',
              prompt: `Which next step best applies ${module.title || 'the idea'}?`,
              choices: ['Pick one small action and schedule it', 'Wait for more motivation', 'Memorize without practice', 'Skip planning'],
              answer_key: 'Pick one small action and schedule it',
              why_this_matters: 'Behavior change requires a concrete next step.'
            }
          ]
        }
      ]
    }
  })

  const idBase = normalizeId(`${title}-${author}`)
  const quizQuestions = outline.flatMap((chapter) => chapter.sections.flatMap((section) => section.interactive_questions)).slice(0, 10)

  return {
    course: {
      id: `${idBase || 'generated'}-micro-course`,
      title: title || 'Generated Course',
      tagline: `Practical course generated from ${sourceTitle || title || 'your content'}.`,
      source_type: 'blink_summary',
      source_title: sourceTitle || `${title || 'Untitled'}${author ? ` by ${author}` : ''}`,
      estimated_total_minutes: outline.reduce((sum, c) => sum + c.minutes, 0),
      difficulty,
      prerequisites: ['No prerequisites required'],
      learning_objectives: [
        'Understand the core principles from the source content.',
        'Apply at least one tactic in a real scenario.',
        'Use reflection and quiz feedback to improve retention.'
      ],
      key_terms: (insights.slice(0, 6).map((line, idx) => ({ term: `Key Idea ${idx + 1}`, definition: line }))).concat([{ term: 'Application', definition: 'Turning insight into a specific action.' }]).slice(0, 8),
      course_outline: outline,
      quiz: {
        pass_score_percent: 70,
        time_limit_minutes: 8,
        questions: Array.from({ length: 10 }).map((_, idx) => {
          const fromPool = quizQuestions[idx % Math.max(1, quizQuestions.length)]
          const isMcq = idx < 7
          return {
            qid: `Z${idx + 1}`,
            format: isMcq ? 'mcq' : 'short_answer',
            prompt: fromPool?.prompt || `Question ${idx + 1} about applying the source ideas.`,
            choices: isMcq ? ['Apply one concrete action', 'Postpone indefinitely', 'Ignore evidence', 'Wait passively'] : undefined,
            answer_key: isMcq ? 'Apply one concrete action' : fromPool?.answer_key || 'Describe the core concept and a practical application.',
            explanation: fromPool?.why_this_matters || 'This checks understanding and practical execution.'
          }
        })
      },
      written_exercise: {
        title: 'Apply the Book to Your Week',
        timebox_minutes: 12,
        prompt: 'Write a short implementation memo with one objective, three actions, potential risks, and a recovery plan.',
        deliverable_format: 'memo',
        grading_rubric: [
          { criterion: 'Clarity', what_good_looks_like: 'Clear objective and context.', points: 25 },
          { criterion: 'Actionability', what_good_looks_like: 'Specific steps with timing.', points: 25 },
          { criterion: 'Evidence use', what_good_looks_like: 'References ideas from the course.', points: 25 },
          { criterion: 'Reflection', what_good_looks_like: 'Shows tradeoffs and follow-through.', points: 25 }
        ],
        example_high_quality_answer_outline: ['Objective', 'Actions', 'Risks', 'Recovery trigger and follow-up check-in']
      },
      certificate: {
        name: 'Floopify Certificate of Completion',
        requirements: { quiz_passed: true, written_exercise_submitted: true },
        certificate_text_template: 'This certifies that {{user_name}} completed {{course_title}} on {{date}} with a quiz score of {{quiz_score}}%.'
      },
      recommended_next_lesson: 'Continue with a related title from your library.'
    }
  }
}

const validateCourseJson = (payload) => {
  const topKey = COURSE_JSON_SCHEMA.required_top_level[0]
  if (!payload || typeof payload !== 'object' || !payload[topKey]) return false
  const course = payload.course
  const requiredFields = ['id', 'title', 'course_outline', 'quiz', 'written_exercise', 'certificate']
  if (requiredFields.some((field) => !course[field])) return false
  return Array.isArray(course.course_outline) && Array.isArray(course.quiz.questions) && Array.isArray(course.written_exercise.grading_rubric)
}

const getTextFromGemini = (data) => data?.candidates?.[0]?.content?.parts?.map((part) => part.text).join('\n') || ''
const getTextFromOpenAI = (data) => data?.choices?.[0]?.message?.content || ''

async function callProvider(messages) {
  const bodyForOpenAI = {
    model: llmConfig.model,
    temperature: 0.3,
    messages
  }

  const performCall = async (signal) => {
    if (llmConfig.provider === 'openai') {
      const response = await fetch(llmConfig.openAiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${llmConfig.apiKey}` },
        body: JSON.stringify(bodyForOpenAI),
        signal
      })
      if (!response.ok) throw new Error(`OpenAI request failed (${response.status})`)
      return getTextFromOpenAI(await response.json())
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${llmConfig.model}:generateContent?key=${llmConfig.apiKey}`
    const geminiBody = {
      systemInstruction: { parts: [{ text: messages[0].content }] },
      contents: [{ role: 'user', parts: [{ text: messages[1].content }] }],
      generationConfig: { temperature: 0.3 }
    }

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiBody),
      signal
    })
    if (!response.ok) throw new Error(`Gemini request failed (${response.status})`)
    return getTextFromGemini(await response.json())
  }

  let lastError
  for (let attempt = 0; attempt < llmConfig.maxRetries; attempt += 1) {
    try {
      return await withTimeout(performCall)
    } catch (error) {
      lastError = error
      if (attempt < llmConfig.maxRetries - 1) await sleep(500 * (2 ** attempt))
    }
  }

  throw lastError
}

const extractFromRawText = (rawText = '') => {
  const lines = rawText.split('\n').map((line) => line.trim()).filter(Boolean)
  const firstLine = lines[0] || 'Untitled source'
  const titleMatch = firstLine.match(/^(title|book)\s*[:\-]\s*(.+)$/i)
  const title = titleMatch?.[2] || firstLine.slice(0, 80)
  const modules = lines.slice(1, 8).map((line, idx) => ({
    title: `Topic ${idx + 1}`,
    content: line,
    key_insights: [line]
  }))

  return { title, source_title: title, modules, key_insights: lines.slice(0, 10) }
}

export async function generateCourse(input, mode = 'book') {
  const difficulty = input?.difficulty || 'beginner'
  const focusAreas = input?.focusAreas || ''
  const bookData = mode === 'book' ? input.bookData : extractFromRawText(input.rawText)

  const fallback = makeFallbackCourse({
    title: bookData?.title,
    author: bookData?.author,
    sourceTitle: bookData?.source_title || `${bookData?.title || 'Untitled'}${bookData?.author ? ` by ${bookData.author}` : ''}`,
    modules: bookData?.modules,
    insights: bookData?.key_insights || bookData?.modules?.flatMap((module) => module.key_insights || []),
    difficulty,
    focusAreas
  })

  if (!isLLMConfigured()) return { courseJson: fallback, meta: { source: 'local_fallback' } }

  const sourcePayload = {
    mode,
    difficulty,
    focus_areas: focusAreas,
    book_data: bookData
  }

  const userPrompt = `${COURSE_GENERATOR_PROMPT}\n\nSOURCE_INPUT_JSON:\n${JSON.stringify(sourcePayload, null, 2)}`

  try {
    const content = await callProvider([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ])
    let parsed = tryParseJson(content)
    if (!validateCourseJson(parsed)) {
      const repair = await callProvider([
        { role: 'system', content: `${SYSTEM_PROMPT} You fix invalid JSON to match schema exactly.` },
        { role: 'user', content: `Repair this JSON to valid course schema. Return JSON only.\n${content}` }
      ])
      parsed = tryParseJson(repair)
    }

    if (validateCourseJson(parsed)) return { courseJson: parsed, meta: { source: 'llm' } }
    return { courseJson: fallback, meta: { source: 'local_fallback_invalid_llm_json' } }
  } catch {
    return { courseJson: fallback, meta: { source: 'local_fallback_error' } }
  }
}

export async function evaluateAnswer(courseJson, sessionState, userAnswer) {
  const localQuestion = courseJson?.course_outline?.[sessionState.currentChapterIndex]?.sections?.[sessionState.currentSectionIndex]?.interactive_questions?.[sessionState.currentQuestionIndex]
  const local = localQuestion ? gradeAnswer(localQuestion, userAnswer) : null
  if (!isLLMConfigured() || !localQuestion) {
    return {
      evaluation: {
        is_correct: Boolean(local?.isCorrect),
        feedback: local?.feedback || 'Answer recorded.',
        confidence: local?.score || 50,
        rationale_bullets: local?.bullets || []
      },
      micro_remediation: sessionState.wrongStreak >= 1 && !local?.isCorrect ? ['Restate the core concept in one sentence.', 'Tie your answer to a concrete example.'] : null,
      source: 'local_fallback'
    }
  }

  try {
    const prompt = TUTOR_FLOW_PROMPT
      .replace('{{COURSE_JSON}}', JSON.stringify(courseJson))
      .replace('{{SESSION_STATE_JSON}}', JSON.stringify(sessionState))
      .replace('{{USER_ANSWER}}', JSON.stringify(userAnswer))

    const content = await callProvider([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ])
    const parsed = tryParseJson(content)
    if (!parsed?.evaluation) throw new Error('Missing evaluation')
    return { ...parsed, source: 'llm' }
  } catch {
    return {
      evaluation: {
        is_correct: Boolean(local?.isCorrect),
        feedback: local?.feedback || 'Answer recorded.',
        confidence: local?.score || 50,
        rationale_bullets: local?.bullets || []
      },
      micro_remediation: sessionState.wrongStreak >= 1 && !local?.isCorrect ? ['Restate the idea in your own words.', 'Use a specific example before submitting.'] : null,
      source: 'local_fallback'
    }
  }
}

export async function gradeWithLLM(courseJson, quizAnswers, exerciseSubmission) {
  const localQuiz = gradeQuiz(courseJson, quizAnswers)
  const localExercise = gradeWrittenExercise(courseJson, exerciseSubmission)

  if (!isLLMConfigured()) {
    return { quiz: localQuiz, exercise: localExercise, source: 'local_fallback' }
  }

  try {
    const prompt = QUIZ_GRADER_PROMPT
      .replace('{{COURSE_JSON}}', JSON.stringify(courseJson))
      .replace('{{QUIZ_ANSWERS}}', JSON.stringify(quizAnswers))
      .replace('{{WRITTEN_EXERCISE_SUBMISSION}}', JSON.stringify(exerciseSubmission || ''))

    const content = await callProvider([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ])
    const parsed = tryParseJson(content)

    const quiz = parsed?.quiz_results
      ? {
          scorePercent: parsed.quiz_results.score_percent,
          passed: parsed.quiz_results.passed,
          breakdown: (parsed.quiz_results.per_question || []).map((item, idx) => ({
            qid: item.qid || `Q${idx + 1}`,
            prompt: item.prompt || localQuiz.breakdown[idx]?.prompt || '',
            userAnswer: item.user_answer || localQuiz.breakdown[idx]?.userAnswer || '',
            answerKey: item.answer_key || localQuiz.breakdown[idx]?.answerKey || '',
            isCorrect: item.is_correct,
            explanation: item.explanation || localQuiz.breakdown[idx]?.explanation || ''
          })),
          submittedAt: new Date().toISOString()
        }
      : localQuiz

    const exercise = parsed?.exercise_results
      ? {
          scorePercent: parsed.exercise_results.score_percent,
          passed: parsed.exercise_results.score_percent >= 70,
          rubricBreakdown: (parsed.exercise_results.rubric_breakdown || []).map((row, idx) => ({
            criterion: row.criterion || localExercise.rubricBreakdown[idx]?.criterion || `Criterion ${idx + 1}`,
            points: row.points || 0,
            maxPoints: row.max_points || localExercise.rubricBreakdown[idx]?.maxPoints || 25,
            feedback: row.feedback || ''
          })),
          suggestions: parsed.exercise_results.improvement_suggestions || localExercise.suggestions,
          submittedAt: new Date().toISOString(),
          submission: exerciseSubmission || ''
        }
      : localExercise

    return { quiz, exercise, source: 'llm' }
  } catch {
    return { quiz: localQuiz, exercise: localExercise, source: 'local_fallback' }
  }
}
