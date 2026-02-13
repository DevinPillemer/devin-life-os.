export const COURSES = [
  { id: 'course-1', title: 'Good to Great', author: 'Jim Collins', publicationDate: '2001', description: 'Explores why some companies make the leap from good to great and sustain excellence.', category: 'Business/Leadership', status: 'completed', modules: [
    { title: 'Level 5 Leadership', content: 'How humility and fierce resolve combine in top leaders.', key_insights: ['Personal humility enables team trust', 'Professional will drives execution', 'Leadership style compounds long-term results'] },
    { title: 'First Who, Then What', content: 'The importance of getting the right people on the bus first.', key_insights: ['Talent before strategy', 'Role fit matters deeply', 'Great teams adapt faster'] },
    { title: 'The Hedgehog Concept', content: 'Finding the intersection of passion, capability, and economics.', key_insights: ['Clarity improves decisions', 'Focus beats diversification', 'Simple concepts are scalable'] },
    { title: 'Culture of Discipline', content: 'Disciplined people and processes create consistent outcomes.', key_insights: ['Freedom within a framework', 'Accountability is cultural', 'Systems outperform heroics'] }
  ] },
  { id: 'course-2', title: 'The Art of War', author: 'Sun Tzu', publicationDate: '5th Century BCE', description: 'Classic strategic treatise on preparation, positioning, and winning without unnecessary conflict.', category: 'Strategy', status: 'completed', modules: [
    { title: 'Laying Plans', content: 'Evaluating conditions before action.', key_insights: ['Know terrain and timing', 'Assess strengths honestly', 'Preparation reduces risk'] },
    { title: 'Waging War', content: 'The cost of conflict and speed in campaigns.', key_insights: ['Prolonged conflict is costly', 'Momentum is strategic', 'Logistics decide outcomes'] },
    { title: 'Attack by Stratagem', content: 'Winning with intelligence and alliances.', key_insights: ['Best victory avoids battle', 'Break resistance through strategy', 'Use information advantage'] }
  ] },
  { id: 'course-3', title: 'The Alchemist', author: 'Paulo Coelho', publicationDate: '1988', description: 'A symbolic journey about purpose, courage, and listening to one’s heart.', category: 'Philosophy', status: 'completed', modules: [
    { title: 'The Personal Legend', content: 'Discovering one’s calling through discomfort and curiosity.', key_insights: ['Purpose requires risk', 'Dreams need action', 'Fear blocks growth'] },
    { title: 'Omens and Intuition', content: 'Recognizing signs while staying grounded.', key_insights: ['Pay attention to patterns', 'Intuition grows with practice', 'Courage clarifies direction'] },
    { title: 'The Treasure Within', content: 'Understanding that the real reward is transformation.', key_insights: ['Journey changes identity', 'Value often starts at home', 'Meaning outlasts possessions'] }
  ] },
  { id: 'course-4', title: 'Letters from a Stoic', author: 'Seneca', publicationDate: '65 AD', description: 'Practical letters on resilience, virtue, and disciplined living.', category: 'Philosophy', status: 'completed', modules: [
    { title: 'Time as a Moral Resource', content: 'Treating time as life’s most valuable asset.', key_insights: ['Guard your attention', 'Busyness is not progress', 'Intentional routines build character'] },
    { title: 'Managing Emotion', content: 'Responding thoughtfully rather than reacting impulsively.', key_insights: ['Pause before judgment', 'Emotion can be trained', 'Perspective reduces anxiety'] },
    { title: 'Virtue and Simplicity', content: 'Living according to principles over comfort.', key_insights: ['Character over status', 'Simplicity strengthens freedom', 'Consistency builds trust'] }
  ] },
  { id: 'course-5', title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', publicationDate: '2011', description: 'A deep look at cognitive biases and two systems of thinking.', category: 'Psychology', status: 'completed', modules: [
    { title: 'System 1 vs System 2', content: 'Automatic intuition versus deliberate reasoning.', key_insights: ['Intuition is fast but fallible', 'Deliberation is effortful', 'Use both systems intentionally'] },
    { title: 'Biases and Heuristics', content: 'Common mental shortcuts and their errors.', key_insights: ['Availability skews risk', 'Anchoring distorts estimates', 'Loss aversion affects choices'] },
    { title: 'Decision Architecture', content: 'Designing choices for better outcomes.', key_insights: ['Defaults shape behavior', 'Framing changes perception', 'Checklists reduce mistakes'] }
  ] },
  { id: 'course-6', title: 'The Power of Now', author: 'Eckhart Tolle', publicationDate: '1997', description: 'Guide to presence, awareness, and freedom from compulsive thought.', category: 'Spirituality', status: 'completed', modules: [
    { title: 'Observing the Mind', content: 'Separating awareness from thought patterns.', key_insights: ['You are not your thoughts', 'Attention creates space', 'Observation reduces reactivity'] },
    { title: 'The Pain-Body', content: 'Recognizing emotional patterns before they hijack behavior.', key_insights: ['Triggers are learnable', 'Presence interrupts cycles', 'Acceptance enables healing'] },
    { title: 'Practicing Presence', content: 'Simple habits to stay grounded in now.', key_insights: ['Breath restores focus', 'Embodied awareness calms stress', 'Presence improves relationships'] }
  ] },
  { id: 'course-7', title: 'Calm Your Baby', author: 'Harvey Karp', publicationDate: '2003', description: 'Parenting strategies to soothe infants and improve sleep rhythms.', category: 'Parenting', status: 'completed', modules: [
    { title: 'Understanding Crying Cycles', content: 'Why babies cry and what patterns are normal.', key_insights: ['Crying has developmental purpose', 'Patterns reduce panic', 'Context guides response'] },
    { title: 'The 5 S’s Method', content: 'Step-by-step calming approach for infants.', key_insights: ['Structure improves soothing', 'Consistency builds trust', 'Technique lowers stress'] },
    { title: 'Sleep and Routine Basics', content: 'Creating predictable sleep cues and timing.', key_insights: ['Routines support regulation', 'Environment affects sleep quality', 'Small adjustments matter'] }
  ] },
  { id: 'course-8', title: 'Meditations', author: 'Marcus Aurelius', publicationDate: '2nd Century AD', description: 'Private reflections on duty, perspective, and inner steadiness.', category: 'Philosophy', status: 'completed', modules: [
    { title: 'Control and Acceptance', content: 'Focusing effort on what can be controlled.', key_insights: ['Distinguish control clearly', 'Acceptance reduces suffering', 'Action remains essential'] },
    { title: 'Duty and Service', content: 'Living for contribution rather than ego.', key_insights: ['Service creates meaning', 'Discipline is a practice', 'Humility sustains leadership'] },
    { title: 'Impermanence', content: 'Using mortality awareness to prioritize wisely.', key_insights: ['Time is finite', 'Perspective beats triviality', 'Urgency can be calm'] }
  ] },
  { id: 'course-9', title: "Man's Search for Meaning", author: 'Viktor Frankl', publicationDate: '1946', description: 'Memoir and psychology text on meaning as the core of human resilience.', category: 'Psychology', status: 'completed', modules: [
    { title: 'Meaning in Suffering', content: 'How purpose can sustain people in hardship.', key_insights: ['Attitude remains a freedom', 'Meaning strengthens endurance', 'Hope requires direction'] },
    { title: 'Logotherapy Principles', content: 'Therapeutic framework centered on responsibility and purpose.', key_insights: ['Purpose can be chosen', 'Responsibility empowers change', 'Values orient recovery'] },
    { title: 'Applying Meaning Daily', content: 'Practical ways to align action with values.', key_insights: ['Daily commitments matter', 'Relationships deepen meaning', 'Small acts create dignity'] }
  ] },
  { id: 'course-10', title: 'The 7 Habits of Highly Effective People', author: 'Stephen R. Covey', publicationDate: '1989', description: 'Principle-centered framework for personal and interpersonal effectiveness.', category: 'Self-Help', status: 'completed', modules: [
    { title: 'Private Victory Habits', content: 'Be proactive, begin with the end, put first things first.', key_insights: ['Responsibility precedes results', 'Vision directs execution', 'Priorities require boundaries'] },
    { title: 'Public Victory Habits', content: 'Think win-win, seek first to understand, synergize.', key_insights: ['Empathy builds trust', 'Collaboration beats compromise', 'Communication drives outcomes'] },
    { title: 'Renewal Habit', content: 'Sharpening the saw for sustainable growth.', key_insights: ['Rest is strategic', 'Balanced renewal prevents burnout', 'Continuous improvement compounds'] }
  ] },
  { id: 'course-11', title: 'How Not to Hate Your Husband After Kids', author: 'Jancee Dunn', publicationDate: '2018', description: 'Relationship-focused insights for parenting partnerships and household equity.', category: 'Relationships', status: 'completed', modules: [
    { title: 'Invisible Labor', content: 'Identifying mental load and hidden household tasks.', key_insights: ['Name the unseen work', 'Shared ownership reduces resentment', 'Systems beat assumptions'] },
    { title: 'Conflict Scripts', content: 'Replacing blame cycles with constructive communication.', key_insights: ['Use clear requests', 'Stay on one issue', 'Repair quickly after conflict'] },
    { title: 'Partnership Rituals', content: 'Building consistent habits for connection and teamwork.', key_insights: ['Regular check-ins help', 'Small appreciation matters', 'Rituals stabilize busy seasons'] }
  ] },
  { id: 'course-12', title: 'The 21 Irrefutable Laws of Leadership', author: 'John C. Maxwell', publicationDate: '1998', description: 'Leadership playbook covering influence, growth, and team development.', category: 'Leadership', status: 'completed', modules: [
    { title: 'Law of the Lid', content: 'Leadership ability determines organizational effectiveness.', key_insights: ['Leadership caps results', 'Develop leaders deliberately', 'Self-awareness is foundational'] },
    { title: 'Law of Influence', content: 'True leadership is influence, not position.', key_insights: ['Trust earns followership', 'Credibility is cumulative', 'Influence requires service'] },
    { title: 'Law of Legacy', content: 'Long-term leaders build successors.', key_insights: ['Train replacements early', 'Multiply impact through others', 'Legacy is intentional'] }
  ] },
  { id: 'course-13', title: 'Never Split the Difference', author: 'Chris Voss', publicationDate: '2016', description: 'Negotiation tactics grounded in tactical empathy and calibrated questions.', category: 'Negotiation', status: 'in_progress', modules: [
    { title: 'Tactical Empathy', content: 'Listening techniques that de-escalate tension and reveal needs.', key_insights: ['Label emotions precisely', 'Mirror to build rapport', 'Empathy improves leverage'] },
    { title: 'Calibrated Questions', content: 'Questions that move discussions toward practical agreement.', key_insights: ['How/what questions unlock options', 'Avoid yes/no traps', 'Guide without dictating'] },
    { title: 'Bargaining Frameworks', content: 'Structuring concessions and deadlines effectively.', key_insights: ['Anchor strategically', 'Protect downside', 'Seek implementation clarity'] }
  ] },
  { id: 'course-14', title: 'Mastering Human Relations', author: 'Dale Carnegie', publicationDate: '1936', description: 'Communication principles for influence, trust, and collaboration.', category: 'Communication', status: 'in_progress', modules: [
    { title: 'Principles of Influence', content: 'Core habits for positive interpersonal impact.', key_insights: ['Avoid needless criticism', 'Give honest appreciation', 'Appeal to shared interests'] },
    { title: 'Conversation Skills', content: 'Practical approaches for better listening and dialogue.', key_insights: ['Ask better questions', 'Remember names and details', 'Be genuinely curious'] },
    { title: 'Resolving Tension', content: 'Navigating disagreement without damaging relationships.', key_insights: ['Disagree respectfully', 'Acknowledge other viewpoints', 'Focus on common goals'] }
  ] },
  { id: 'course-15', title: 'Think and Grow Rich', author: 'Napoleon Hill', publicationDate: '1937', description: 'Mindset and planning principles for wealth creation and persistence.', category: 'Finance', status: 'in_progress', modules: [
    { title: 'Definite Purpose', content: 'Setting clear financial goals and timelines.', key_insights: ['Clarity drives action', 'Written goals increase focus', 'Desire requires structure'] },
    { title: 'Autosuggestion & Belief', content: 'Using repetition and identity to reinforce commitment.', key_insights: ['Thoughts shape habits', 'Belief supports persistence', 'Environment affects confidence'] },
    { title: 'Mastermind Principle', content: 'Leveraging collaboration for better outcomes.', key_insights: ['Networks create opportunities', 'Accountability raises standards', 'Shared intelligence scales faster'] }
  ] },
  { id: 'course-16', title: 'Atomic Habits', author: 'James Clear', publicationDate: '2018', description: 'Systematic model for behavior change through identity and small improvements.', category: 'Self-Help', status: 'in_progress', modules: [
    { title: 'The Habit Loop', content: 'Cue, craving, response, reward model for daily behavior.', key_insights: ['Make cues obvious', 'Reduce friction for good habits', 'Track consistency over intensity'] },
    { title: 'Identity-Based Habits', content: 'Building behaviors from identity statements.', key_insights: ['Become the type of person first', 'Votes for identity compound', 'Process over outcomes'] },
    { title: 'Environment Design', content: 'Shaping context to make desired actions automatic.', key_insights: ['Design beats willpower', 'Visibility drives behavior', 'Remove triggers for bad habits'] }
  ] },
  { id: 'course-17', title: 'The Whole-Brain Child', author: 'Daniel J. Siegel', publicationDate: '2011', description: 'Neuroscience-informed parenting framework for emotional development.', category: 'Parenting', status: 'not_started', modules: [
    { title: 'Upstairs/Downstairs Brain', content: 'Understanding emotional and logical brain integration.', key_insights: ['Regulate before teaching', 'Connection precedes correction', 'Development is stage-based'] },
    { title: 'Name it to Tame it', content: 'Helping children process emotions through storytelling.', key_insights: ['Narrative supports regulation', 'Validation reduces escalation', 'Language builds self-awareness'] },
    { title: 'Integrated Parenting Tactics', content: 'Day-to-day exercises for resilient kids.', key_insights: ['Practice calm routines', 'Model emotional skills', 'Consistency improves outcomes'] }
  ] },
  { id: 'course-18', title: 'Sapiens: A Brief History of Humankind', author: 'Yuval Noah Harari', publicationDate: '2011', description: 'Big-picture history of human evolution, culture, and systems.', category: 'History', status: 'not_started', modules: [
    { title: 'Cognitive Revolution', content: 'How shared myths enabled large-scale cooperation.', key_insights: ['Stories coordinate groups', 'Language scales complexity', 'Belief systems shape institutions'] },
    { title: 'Agricultural and Scientific Revolutions', content: 'Tradeoffs and gains from major societal transitions.', key_insights: ['Progress has costs', 'Technology reshapes values', 'Power follows knowledge'] },
    { title: 'Human Futures', content: 'Ethical and social implications of modern innovation.', key_insights: ['Innovation outpaces ethics', 'Systems require governance', 'Long-term thinking is critical'] }
  ] },
  { id: 'course-19', title: 'The AI-Driven Leader', author: 'Geoff Woods', publicationDate: '2024', description: 'Leadership playbook for integrating AI into strategy, execution, and teams.', category: 'AI/Technology', status: 'not_started', modules: [
    { title: 'AI Strategy Foundations', content: 'Framing business problems for AI-enhanced decisions.', key_insights: ['Start with outcomes', 'Map workflows before tools', 'Governance is non-negotiable'] },
    { title: 'AI-Enabled Teams', content: 'Operating models for human + AI collaboration.', key_insights: ['Define human judgment points', 'Standardize prompts and reviews', 'Train teams continuously'] },
    { title: 'Execution and Measurement', content: 'Tracking ROI and scaling AI initiatives responsibly.', key_insights: ['Pilot fast, scale proven wins', 'Measure value, not hype', 'Iterate based on real usage'] }
  ] }
]

export const GOALS = [
  { id: 'goal-1', title: 'Get a good pair of tefillin', area: 'Learning', status: 'todo', credits: 10 }, { id: 'goal-2', title: 'Goals for the new year', area: 'Learning', status: 'in_progress', credits: 10 }, { id: 'goal-3', title: 'Request UK police certificate', area: 'Learning', status: 'done', credits: 10 }, { id: 'goal-4', title: 'Green card', area: 'Learning', status: 'in_progress', credits: 10 }, { id: 'goal-5', title: "Mom's apartment in Israel", area: 'Family_Life', status: 'in_progress', credits: 10 }, { id: 'goal-6', title: 'Set Interview Lior Panahi', area: 'Family_Life', status: 'in_progress', credits: 10 }, { id: 'goal-7', title: 'Claude Code', area: 'Learning', status: 'todo', credits: 10 }, { id: 'goal-8', title: 'Order Fan / Watch (Amazon)', area: 'Learning', status: 'in_progress', credits: 10 }, { id: 'goal-9', title: 'Fan refund (Agent call)', area: 'Finance', status: 'in_progress', credits: 10 }, { id: 'goal-10', title: 'Budget: Personal & Family', area: 'Finance', status: 'done', credits: 10 }, { id: 'goal-11', title: 'Mita Party <> Logistics', area: 'Learning', status: 'done', credits: 10 }, { id: 'goal-12', title: 'fup: Parking Ticket', area: 'Finance', status: 'done', credits: 10 }, { id: 'goal-13', title: 'Rami Levy: Sim & Account', area: 'Finance', status: 'done', credits: 10 }, { id: 'goal-14', title: 'Send bank details to employer', area: 'Career', status: 'done', credits: 10 }, { id: 'goal-15', title: 'AI: Subscriptions: Review', area: 'Finance', status: 'in_progress', credits: 10 }, { id: 'goal-16', title: "What's the plan, IL vs US", area: 'Career', status: 'done', credits: 10 }, { id: 'goal-17', title: 'Fun: Nest: 1k deposit', area: 'Family_Life', status: 'done', credits: 10 }, { id: 'goal-18', title: 'Next Move: AE <> Job search', area: 'Career', status: 'in_progress', credits: 10 }, { id: 'goal-19', title: 'Fup: Lease', area: 'Family_Life', status: 'in_progress', credits: 10 }, { id: 'goal-20', title: 'Financial Consulting (done)', area: 'Family_Life', status: 'done', credits: 10 }, { id: 'goal-21', title: 'US: Itinerary Planning', area: 'Family_Life', status: 'in_progress', credits: 10 }, { id: 'goal-22', title: 'Buy USD for trip August', area: 'Finance', status: 'in_progress', credits: 10 }, { id: 'goal-23', title: 'Website/ WP', area: 'Learning', status: 'todo', credits: 10 }, { id: 'goal-24', title: 'Sunday Morning Challenge', area: 'Learning', status: 'in_progress', credits: 10 }
]

export const INCENTIVE_CONFIG = { totalBaseBudget: 1000, totalMaxBudget: 1200, sections: { learning: { base: 200, accelerator: 40, max: 240 }, dailyHabits: { base: 200, accelerator: 40, max: 240 }, health: { base: 200, accelerator: 40, max: 240 }, goals: { base: 200, accelerator: 40, max: 240 }, finance: { base: 200, accelerator: 40, max: 240 } }, healthRate: 5, learningRate: 10, goalsRate: 10 }

export const HABIT_CATEGORY_MAP = { 'Weight Training': { category: 'Health', points: 15 }, Swim: { category: 'Health', points: 15 }, Neck: { category: 'Health', points: 15 }, 'Electrolytes and vitamins': { category: 'Health', points: 15 }, Prayer: { category: 'Spiritual', points: 10 }, Meditation: { category: 'Spiritual', points: 10 }, Charity: { category: 'Spiritual', points: 10 }, 'Wake up: 7am': { category: 'Focus', points: 12 }, 'In bed: 10:30pm': { category: 'Focus', points: 12 }, 'Budget Check': { category: 'Focus', points: 12 }, 'Cat Shit': { category: 'Focus', points: 12 }, 'Read Before Bed': { category: 'Learning', points: 12 }, Blinkist: { category: 'Learning', points: 12 }, Podcast: { category: 'Learning', points: 12 }, 'Innovation with AI': { category: 'Learning', points: 12 }, 'Meat Night': { category: 'Lifestyle', points: 10 } }

export const HEALTH_DATA = [
  { weekId: '2025-W45', swims: 5, hiit: 4, incentiveValue: 225 },
  { weekId: '2025-W46', swims: 5, hiit: 4, incentiveValue: 225 },
  { weekId: '2025-W47', swims: 5, hiit: 4, incentiveValue: 225 },
  { weekId: '2025-W48', swims: 6, hiit: 4, incentiveValue: 250 },
  { weekId: '2025-W49', swims: 5, hiit: 4, incentiveValue: 225 },
  { weekId: '2025-W50', swims: 5, hiit: 4, incentiveValue: 225 },
  { weekId: '2025-W51', swims: 4, hiit: 1, incentiveValue: 125 }
]
