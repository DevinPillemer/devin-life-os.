const normalize = (value = '') => value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()

/**
 * @typedef {{
 *  course: {
 *    id: string;
 *    title: string;
 *    tagline: string;
 *    source_type: 'blink_summary';
 *    source_title: string;
 *    estimated_total_minutes: number;
 *    difficulty: 'beginner'|'intermediate'|'advanced';
 *    prerequisites: string[];
 *    learning_objectives: string[];
 *    key_terms: {term: string; definition: string}[];
 *    course_outline: {
 *      chapter: number;
 *      title: string;
 *      minutes: number;
 *      sections: {
 *        section_id: string;
 *        type: 'teach'|'check_understanding'|'example'|'reflection';
 *        title: string;
 *        minutes: number;
 *        content_blocks: ({block_type: 'bullet_list'; text: string[]} | {block_type: 'short_paragraph'; text: string})[];
 *        interactive_questions: {
 *          question_id: string;
 *          format: 'short_answer'|'multiple_choice';
 *          prompt: string;
 *          choices?: string[];
 *          answer_key: string;
 *          why_this_matters: string;
 *        }[];
 *      }[];
 *    }[];
 *    quiz: {
 *      pass_score_percent: number;
 *      time_limit_minutes: number;
 *      questions: {
 *        qid: string;
 *        format: 'mcq'|'short_answer';
 *        prompt: string;
 *        choices?: string[];
 *        answer_key: string;
 *        explanation: string;
 *      }[];
 *    };
 *    written_exercise: {
 *      title: string;
 *      timebox_minutes: number;
 *      prompt: string;
 *      deliverable_format: 'bullet_plan'|'memo'|'checklist';
 *      grading_rubric: {criterion: string; what_good_looks_like: string; points: number}[];
 *      example_high_quality_answer_outline: string[];
 *    };
 *    certificate: {
 *      name: string;
 *      requirements: {quiz_passed: boolean; written_exercise_submitted: boolean};
 *      certificate_text_template: string;
 *    };
 *    recommended_next_lesson: string;
 *  }
 * }} CourseSchema
 */
export const COURSE_JSON_SCHEMA = {
  description: 'Schema reference for Learning Module course payload.',
  required_top_level: ['course']
}

/**
 * @typedef {{
 *  courseId: string;
 *  startedAt: string|null;
 *  completedAt: string|null;
 *  currentChapterIndex: number;
 *  currentSectionIndex: number;
 *  currentQuestionIndex: number;
 *  wrongStreak: number;
 *  completedSections: string[];
 *  completedChapters: number[];
 *  answers: {questionId: string; userAnswer: string; isCorrect: boolean; timestamp: string}[];
 * }} SessionStateSchema
 */
export const SESSION_STATE_SCHEMA = {
  description: 'Schema reference for interactive tutor session state.'
}

/** @type {CourseSchema} */
export const SEED_COURSE = {
  course: {
    id: 'atomic-habits-micro-course',
    title: 'Atomic Habits: Build Systems That Stick',
    tagline: 'Turn tiny behavior changes into compounding results.',
    source_type: 'blink_summary',
    source_title: 'Atomic Habits by James Clear',
    estimated_total_minutes: 45,
    difficulty: 'beginner',
    prerequisites: ['Willingness to track one daily behavior for 7 days'],
    learning_objectives: [
      'Explain why habits compound over time and beat one-time goals.',
      'Use the 4 Laws of Behavior Change to design a habit loop.',
      'Apply identity-based habits to reinforce long-term behavior change.',
      'Create an environment and recovery strategy for consistency.'
    ],
    key_terms: [
      { term: 'Habit Loop', definition: 'Cue, craving, response, reward cycle that drives repeated behavior.' },
      { term: 'Identity-Based Habit', definition: 'A habit built to prove who you want to become, not just what you want to achieve.' },
      { term: 'Habit Stacking', definition: 'Pairing a new habit with an existing routine to make it easier to remember.' },
      { term: 'Environment Design', definition: 'Structuring your surroundings so desired habits are obvious and easy.' },
      { term: 'Plateau of Latent Potential', definition: 'Delayed visible results while habits are compounding in the background.' }
    ],
    course_outline: [
      {
        chapter: 1,
        title: 'Small Habits, Big Outcomes',
        minutes: 10,
        sections: [
          {
            section_id: '1.1',
            type: 'teach',
            title: 'Why tiny habits matter',
            minutes: 5,
            content_blocks: [
              { block_type: 'short_paragraph', text: 'James Clear argues that habits are the compound interest of self-improvement. Tiny gains repeated daily create dramatic differences over time.' },
              { block_type: 'bullet_list', text: ['1% better each day compounds.', 'Systems drive outcomes more reliably than motivation.', 'Good habits deliver delayed rewards.'] }
            ],
            interactive_questions: [
              { question_id: 'Q1', format: 'short_answer', prompt: 'In one sentence, why do tiny habits beat dramatic one-off efforts?', answer_key: 'They compound over time and become automatic systems.', why_this_matters: 'You need this mindset before building any behavior system.' },
              { question_id: 'Q2', format: 'multiple_choice', prompt: 'What does Atomic Habits suggest you focus on first?', choices: ['Big goals', 'Systems and daily process', 'More willpower', 'External rewards'], answer_key: 'Systems and daily process', why_this_matters: 'Process-first thinking keeps progress stable even when motivation drops.' }
            ]
          },
          {
            section_id: '1.2',
            type: 'check_understanding',
            title: 'Plateau of latent potential',
            minutes: 5,
            content_blocks: [
              { block_type: 'short_paragraph', text: 'Results are often delayed. People quit because they expect immediate feedback, but the habit curve is exponential.' },
              { block_type: 'bullet_list', text: ['Expect a valley before visible progress.', 'Track adherence, not outcomes.', 'Consistency precedes breakthrough.'] }
            ],
            interactive_questions: [
              { question_id: 'Q3', format: 'multiple_choice', prompt: 'What is the “valley of disappointment”?', choices: ['When your strategy fails permanently', 'When early efforts have little visible payoff', 'When habits become easy', 'When goals are too small'], answer_key: 'When early efforts have little visible payoff', why_this_matters: 'This helps you persist when results lag.' },
              { question_id: 'Q4', format: 'short_answer', prompt: 'Name one metric to track during the plateau period.', answer_key: 'Track consistency or number of habit reps completed.', why_this_matters: 'Tracking leading indicators keeps you engaged in slow phases.' }
            ]
          }
        ]
      },
      {
        chapter: 2,
        title: 'Identity and the Habit Loop',
        minutes: 11,
        sections: [
          {
            section_id: '2.1',
            type: 'teach',
            title: 'Identity-based habits',
            minutes: 6,
            content_blocks: [
              { block_type: 'short_paragraph', text: 'The most durable habits are identity-driven: every action is a vote for the type of person you want to become.' },
              { block_type: 'bullet_list', text: ['Outcome goal: run a marathon.', 'Identity goal: become a runner.', 'Actions should reinforce identity.'] }
            ],
            interactive_questions: [
              { question_id: 'Q5', format: 'short_answer', prompt: 'Rewrite this outcome goal as an identity goal: “Read 20 books this year.”', answer_key: 'I am the kind of person who reads every day.', why_this_matters: 'Identity language creates behavior that lasts beyond deadlines.' },
              { question_id: 'Q6', format: 'multiple_choice', prompt: 'Which statement is identity-first?', choices: ['I need to lose 10kg fast.', 'I never miss workouts.', 'I hope to be healthier someday.', 'I need better luck.'], answer_key: 'I never miss workouts.', why_this_matters: 'Identity-first statements drive repeatable actions.' }
            ]
          },
          {
            section_id: '2.2',
            type: 'example',
            title: 'Cue-craving-response-reward',
            minutes: 5,
            content_blocks: [
              { block_type: 'short_paragraph', text: 'Every habit has four stages: cue triggers attention, craving creates desire, response is action, reward closes loop.' },
              { block_type: 'bullet_list', text: ['Make cues obvious.', 'Make actions easy.', 'Make rewards satisfying.', 'Repeat until automatic.'] }
            ],
            interactive_questions: [
              { question_id: 'Q7', format: 'multiple_choice', prompt: 'Which is a cue in a workout habit?', choices: ['Feeling proud after gym', 'Placing shoes by your bed', 'Doing squats', 'Tracking reps'], answer_key: 'Placing shoes by your bed', why_this_matters: 'Correctly identifying cues helps you design reliable triggers.' },
              { question_id: 'Q8', format: 'short_answer', prompt: 'Give one example of a satisfying reward for a study habit.', answer_key: 'Check off tracker and enjoy a short break after study block.', why_this_matters: 'Immediate rewards improve habit retention.' }
            ]
          }
        ]
      },
      {
        chapter: 3,
        title: 'The 4 Laws in Practice',
        minutes: 12,
        sections: [
          {
            section_id: '3.1',
            type: 'teach',
            title: 'Build good habits with the 4 laws',
            minutes: 6,
            content_blocks: [
              { block_type: 'bullet_list', text: ['Law 1: Make it obvious.', 'Law 2: Make it attractive.', 'Law 3: Make it easy.', 'Law 4: Make it satisfying.'] },
              { block_type: 'short_paragraph', text: 'Each law removes friction from starting and repeating desired behavior.' }
            ],
            interactive_questions: [
              { question_id: 'Q9', format: 'multiple_choice', prompt: 'Habit stacking best supports which law?', choices: ['Make it obvious', 'Make it satisfying', 'Make it hard', 'Make it invisible'], answer_key: 'Make it obvious', why_this_matters: 'Habit stacking is one of the fastest implementation tools.' },
              { question_id: 'Q10', format: 'short_answer', prompt: 'How can you make a new habit “easy” in under 2 minutes?', answer_key: 'Shrink the habit to a 2-minute starter version.', why_this_matters: 'Reducing scope beats procrastination and builds momentum.' }
            ]
          },
          {
            section_id: '3.2',
            type: 'reflection',
            title: 'Break bad habits with inversion',
            minutes: 6,
            content_blocks: [
              { block_type: 'short_paragraph', text: 'To reduce bad habits invert the laws: make it invisible, unattractive, hard, and unsatisfying.' },
              { block_type: 'bullet_list', text: ['Hide cues for bad habits.', 'Increase friction.', 'Add accountability.', 'Attach immediate consequence.'] }
            ],
            interactive_questions: [
              { question_id: 'Q11', format: 'multiple_choice', prompt: 'Which action makes social media less attractive?', choices: ['Follow more accounts', 'Turn phone grayscale', 'Keep notifications on', 'Use phone in bed'], answer_key: 'Turn phone grayscale', why_this_matters: 'You must actively reduce bad-habit desirability.' },
              { question_id: 'Q12', format: 'short_answer', prompt: 'Name one way to make a bad habit hard.', answer_key: 'Add friction such as logging out or removing app from home screen.', why_this_matters: 'Friction interrupts autopilot behavior.' }
            ]
          }
        ]
      },
      {
        chapter: 4,
        title: 'Consistency, Tracking, and Recovery',
        minutes: 12,
        sections: [
          {
            section_id: '4.1',
            type: 'teach',
            title: 'Use tracking to stay consistent',
            minutes: 6,
            content_blocks: [
              { block_type: 'short_paragraph', text: 'Habit tracking gives immediate evidence of progress and reinforces identity through visible streaks.' },
              { block_type: 'bullet_list', text: ['Track completion daily.', 'Review trends weekly.', 'Use streaks as motivation, not identity.'] }
            ],
            interactive_questions: [
              { question_id: 'Q13', format: 'multiple_choice', prompt: 'Main purpose of habit tracking?', choices: ['Perfection', 'Immediate feedback and accountability', 'Public ranking', 'Replacing planning'], answer_key: 'Immediate feedback and accountability', why_this_matters: 'Tracking keeps attention on execution.' },
              { question_id: 'Q14', format: 'short_answer', prompt: 'What does “never miss twice” mean?', answer_key: 'Missing once is normal, but recover immediately next opportunity.', why_this_matters: 'Recovery is key to long-term consistency.' }
            ]
          },
          {
            section_id: '4.2',
            type: 'reflection',
            title: 'Create your 7-day habit launch plan',
            minutes: 6,
            content_blocks: [
              { block_type: 'bullet_list', text: ['Pick one identity-based habit.', 'Define cue, 2-minute action, reward.', 'Set environment support and backup plan.'] },
              { block_type: 'short_paragraph', text: 'The goal is repeatability, not intensity. A sustainable baseline outperforms heroic bursts.' }
            ],
            interactive_questions: [
              { question_id: 'Q15', format: 'short_answer', prompt: 'Write your chosen 2-minute starter habit.', answer_key: 'Any realistic two-minute version of the target habit.', why_this_matters: 'Action clarity increases execution likelihood.' },
              { question_id: 'Q16', format: 'multiple_choice', prompt: 'Best response when you miss a day?', choices: ['Restart next month', 'Quit streak tracking', 'Resume next day with minimum version', 'Double workload immediately'], answer_key: 'Resume next day with minimum version', why_this_matters: 'Resilience protects long-term outcomes.' }
            ]
          }
        ]
      }
    ],
    quiz: {
      pass_score_percent: 80,
      time_limit_minutes: 7,
      questions: [
        { qid: 'Z1', format: 'mcq', prompt: 'Why are systems more effective than goals?', choices: ['Goals are permanent', 'Systems shape daily behavior', 'Goals remove uncertainty', 'Systems need no effort'], answer_key: 'Systems shape daily behavior', explanation: 'Goals set direction; systems create repeated action.' },
        { qid: 'Z2', format: 'mcq', prompt: 'Which reflects identity-based habit design?', choices: ['Train to win one race', 'Become a person who trains daily', 'Wait for motivation spikes', 'Copy random routines'], answer_key: 'Become a person who trains daily', explanation: 'Identity framing sustains habits after milestones.' },
        { qid: 'Z3', format: 'mcq', prompt: 'Habit stacking formula is best described as:', choices: ['After [current habit], I will [new habit]', 'Before sleep, set 3 big goals', 'Track only outcomes', 'Punish failure heavily'], answer_key: 'After [current habit], I will [new habit]', explanation: 'The new action is anchored to an existing cue.' },
        { qid: 'Z4', format: 'mcq', prompt: 'To break a bad habit, first step is often to:', choices: ['Make cue invisible', 'Increase reward', 'Lower friction', 'Set larger goals'], answer_key: 'Make cue invisible', explanation: 'You remove triggers to reduce automatic behavior.' },
        { qid: 'Z5', format: 'mcq', prompt: '“Never miss twice” emphasizes:', choices: ['Perfection', 'Rapid recovery', 'More punishment', 'Longer breaks'], answer_key: 'Rapid recovery', explanation: 'Consistency is built by bouncing back quickly.' },
        { qid: 'Z6', format: 'mcq', prompt: 'What is a 2-minute rule example for reading?', choices: ['Read 100 pages nightly', 'Read one page after breakfast', 'Buy more books', 'Join 5 clubs'], answer_key: 'Read one page after breakfast', explanation: 'Make start friction extremely low.' },
        { qid: 'Z7', format: 'mcq', prompt: 'A satisfying reward should be:', choices: ['Delayed and unclear', 'Immediate and reinforcing', 'Expensive', 'Social-media dependent'], answer_key: 'Immediate and reinforcing', explanation: 'Immediate satisfaction wires behavior loops.' },
        { qid: 'Z8', format: 'short_answer', prompt: 'Define the plateau of latent potential in your own words.', answer_key: 'Early results are not visible even though habits are compounding.', explanation: 'Progress is often delayed before breakthrough.' },
        { qid: 'Z9', format: 'short_answer', prompt: 'Give one way to make a study habit obvious.', answer_key: 'Put study materials in visible place and pair with existing cue.', explanation: 'Visible cues increase recall and initiation.' },
        { qid: 'Z10', format: 'short_answer', prompt: 'Write one identity statement for a health habit.', answer_key: 'I am the type of person who trains daily / eats intentionally.', explanation: 'Identity statements reinforce repeated action.' }
      ]
    },
    written_exercise: {
      title: 'Design Your 14-Day Habit System',
      timebox_minutes: 10,
      prompt: 'Choose one professional or personal habit. Build a 14-day execution memo including: identity statement, cue, 2-minute starter, environment changes, tracking plan, and your miss-once recovery rule.',
      deliverable_format: 'memo',
      grading_rubric: [
        { criterion: 'Identity clarity', what_good_looks_like: 'Clear “I am the type of person who…” statement aligned to habit.', points: 30 },
        { criterion: 'Execution design', what_good_looks_like: 'Specific cue + starter action + reward sequence.', points: 30 },
        { criterion: 'Environment and tracking', what_good_looks_like: 'Concrete environmental changes and daily measurement method.', points: 20 },
        { criterion: 'Recovery strategy', what_good_looks_like: 'Credible never-miss-twice fallback plan.', points: 20 }
      ],
      example_high_quality_answer_outline: [
        'Identity: I am a consistent writer who ships daily.',
        'Cue: After morning coffee, open writing document.',
        '2-minute start: Write one paragraph headline draft.',
        'Environment: Phone on airplane mode; notebook on desk.',
        'Tracking: Mark completion in habit tracker by 9:00 AM.',
        'Recovery: If missed, complete minimum version before lunch next day.'
      ]
    },
    certificate: {
      name: 'Floopify Certificate of Completion',
      requirements: {
        quiz_passed: true,
        written_exercise_submitted: true
      },
      certificate_text_template: 'This certifies that {{user_name}} completed {{course_title}} on {{date}} with a quiz score of {{quiz_score}}%.'
    },
    recommended_next_lesson: 'none'
  }
}

export function getProgressForCourse(course, sessionState) {
  const totalSections = course.course_outline.reduce((sum, chapter) => sum + chapter.sections.length, 0)
  const completed = sessionState?.completedSections?.length || 0
  const percent = totalSections ? Math.round((completed / totalSections) * 100) : 0
  const status = percent === 0 ? 'not_started' : percent >= 100 ? 'completed' : 'in_progress'
  return { totalSections, completedSections: completed, percent, status }
}

export function getNextQuestion(course, sessionState) {
  const chapter = course.course_outline[sessionState.currentChapterIndex]
  if (!chapter) return null
  const section = chapter.sections[sessionState.currentSectionIndex]
  if (!section) return null
  return section.interactive_questions[sessionState.currentQuestionIndex] || null
}

export function gradeAnswer(question, userAnswer) {
  const normalizedAnswer = normalize(userAnswer)
  const normalizedKey = normalize(question.answer_key)
  const keywordPool = normalizedKey.split(' ').filter(Boolean)
  const keywordHits = keywordPool.filter((word) => normalizedAnswer.includes(word)).length
  const isCorrect = question.format === 'multiple_choice'
    ? userAnswer === question.answer_key
    : normalizedAnswer.length > 0 && (normalizedAnswer.includes(normalizedKey) || keywordHits >= Math.max(2, Math.ceil(keywordPool.length * 0.4)))

  return {
    isCorrect,
    score: isCorrect ? 100 : Math.min(70, keywordHits * 20),
    feedback: isCorrect ? 'Correct. Great recall and application.' : 'Not quite. Revisit the core principle and retry with concrete wording.',
    bullets: [
      `Expected concept: ${question.answer_key}`,
      `Why this matters: ${question.why_this_matters}`,
      isCorrect ? 'You are ready to continue.' : 'Tip: use identity, cue, and action language in your answer.'
    ]
  }
}

export function gradeQuiz(course, answers) {
  const questions = course.quiz.questions
  const breakdown = questions.map((question) => {
    const userAnswer = answers?.[question.qid] || ''
    const result = gradeAnswer(
      {
        format: question.format === 'mcq' ? 'multiple_choice' : 'short_answer',
        answer_key: question.answer_key,
        why_this_matters: question.explanation
      },
      userAnswer
    )

    return {
      qid: question.qid,
      prompt: question.prompt,
      userAnswer,
      answerKey: question.answer_key,
      isCorrect: result.isCorrect,
      explanation: question.explanation
    }
  })

  const correct = breakdown.filter((item) => item.isCorrect).length
  const scorePercent = Math.round((correct / questions.length) * 100)
  const passed = scorePercent >= course.quiz.pass_score_percent

  return {
    scorePercent,
    passed,
    correct,
    total: questions.length,
    breakdown,
    submittedAt: new Date().toISOString()
  }
}

export function gradeWrittenExercise(course, submission) {
  const text = submission?.trim() || ''
  const normalized = normalize(text)
  const keywords = ['identity', 'cue', 'minute', 'environment', 'track', 'recover', 'habit']
  const hits = keywords.filter((word) => normalized.includes(word)).length
  const lengthScore = Math.min(40, Math.round((text.length / 900) * 40))
  const keywordScore = Math.min(35, hits * 5)
  const structureScore = text.includes('\n') ? 25 : 10
  const scorePercent = Math.min(100, lengthScore + keywordScore + structureScore)

  const rubricBreakdown = course.written_exercise.grading_rubric.map((rule) => {
    const earned = Math.max(5, Math.round((scorePercent / 100) * rule.points))
    return { criterion: rule.criterion, points: earned, maxPoints: rule.points }
  })

  return {
    scorePercent,
    passed: scorePercent >= 70,
    rubricBreakdown,
    suggestions: [
      hits < 5 ? 'Add explicit cue-action-reward details.' : 'Good mechanics: maintain specificity.',
      text.length < 350 ? 'Expand with concrete calendar/timing commitments.' : 'Depth is strong; keep execution measurable.',
      normalized.includes('recover') ? 'Recovery rule included—excellent resilience planning.' : 'Add a never-miss-twice recovery clause.'
    ],
    submittedAt: new Date().toISOString(),
    submission: text
  }
}

export function issueCertificate({ userName, courseTitle, quizScore, courseId }) {
  const date = new Date().toLocaleDateString()
  return {
    id: `${courseId}-${Date.now()}`,
    userName: userName || 'Floopify Learner',
    courseId,
    courseTitle,
    quizScore,
    date,
    issuedAt: new Date().toISOString(),
    text: `This certifies that ${userName || 'Floopify Learner'} completed ${courseTitle} on ${date} with a quiz score of ${quizScore}%.`
  }
}
