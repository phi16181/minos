const API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o';
const API_KEY = process.env.REACT_APP_OPENAI_API_KEY || '';

export interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function callClaude(
  messages: AnthropicMessage[],
  system: string,
  maxTokens: number = 1000
): Promise<string> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: system },
        ...messages
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response from API');
  return text;
}

export async function generatePlanAndLevels(scope: string): Promise<{ optimalPlan: string; levels: any[] }> {
  const system = `You are an expert software architect creating an educational challenge sequence.

Generate EXACTLY this JSON structure (no markdown, no extra text):
{
  "optimalPlan": "A comprehensive 400-600 word architecture recommendation covering: chosen pattern with justification, specific tech stack choices and why, database strategy, scalability approach, security considerations, key tradeoffs made, and what a student should understand after completing this. Be opinionated and specific.",
  "levels": [
    {
      "id": 1,
      "title": "Short challenge title (4-6 words)",
      "difficulty": "Easy",
      "topics": ["topic1", "topic2"],
      "situation": "2-3 sentences grounding the student in a concrete moment in the project. Name specific constraints from their app. Make it feel real.",
      "task": "One open-ended question requiring genuine reasoning. Should not hint at the answer. Student must explain their thinking, not just name a technology.",
      "optimalAnswer": "Internal rubric: what does a strong answer include? List 3-4 key reasoning points the student should hit.",
      "socratiqueHint": "A single question that exposes a gap or forces a new angle WITHOUT giving away the answer.",
      "commonMistake": "The most seductive wrong answer and why students fall for it."
    }
  ]
}

Generate exactly 6 levels following this arc:
1. Core architecture pattern — id:1, difficulty:"Easy"
2. Data model and database strategy — id:2, difficulty:"Easy"  
3. Scalability and performance — id:3, difficulty:"Medium"
4. API design and service contracts — id:4, difficulty:"Medium"
5. Security, auth, and reliability — id:5, difficulty:"Hard"
6. Deployment, observability, and ops — id:6, difficulty:"Hard"

Each level must be specific to the student's actual application. Generic levels fail.`;

  const raw = await callClaude(
    [{ role: 'user', content: `Application to architect:\n\n${scope}` }],
    system,
    2500
  );

  let clean = raw.trim();
  if (clean.startsWith('```json')) clean = clean.slice(7);
  if (clean.startsWith('```')) clean = clean.slice(3);
  if (clean.endsWith('```')) clean = clean.slice(0, -3);
  clean = clean.trim();

  return JSON.parse(clean);
}

export async function evaluateAnswer(
  answer: string,
  level: any,
  scope: string,
  history: AnthropicMessage[]
): Promise<{ response: string; verdict: 'CONTINUE' | 'COMPLETE' }> {
  const system = `You are Minos — a Socratic architecture mentor who guards the path through the maze. You never give answers directly. You force students to reason their way to clarity.

RULES (non-negotiable):
- Never state the correct answer, even partially
- Never say "you should use X" or "the right approach is Y"
- If answer is incomplete: ask ONE probing question that targets the specific gap
- If answer is off-track: ask a question that reveals the contradiction without naming it
- If answer is strong: push deeper — edge cases, failure modes, future consequences
- Be terse. 2-4 sentences max, then your question. No preamble.
- Write like someone who has seen a thousand projects fail in predictable ways

Only mark COMPLETE when the student has demonstrated understanding of:
${level.optimalAnswer}

After your response, output exactly one line:
VERDICT: CONTINUE
or
VERDICT: COMPLETE

Student's application: ${scope}
Current challenge: ${level.title}
Task: ${level.task}
Watch for this mistake: ${level.commonMistake}`;

  const messages: AnthropicMessage[] = [
    ...history,
    { role: 'user', content: answer }
  ];

  const raw = await callClaude(messages, system, 500);

  const verdictMatch = raw.match(/VERDICT:\s*(CONTINUE|COMPLETE)/);
  const verdict = verdictMatch?.[1] === 'COMPLETE' ? 'COMPLETE' : 'CONTINUE';
  const response = raw.replace(/\nVERDICT:.*$/s, '').trim();

  return { response, verdict };
}

export async function generateHint(
  level: any,
  history: AnthropicMessage[],
  scope: string
): Promise<string> {
  const system = `You are a Socratic mentor giving a single hint. Output ONLY the hint — one sentence, phrased as a question. Do not give away the answer. Make the student reconsider one assumption.

Pre-written hint for this level: "${level.socratiqueHint}"

Adapt it to what the student has said so far. If they haven't said much, use the pre-written hint verbatim.`;

  const histText = history.length > 0
    ? history.map(m => `${m.role}: ${m.content}`).join('\n\n')
    : 'Student has not answered yet.';

  return callClaude(
    [{ role: 'user', content: `${histText}\n\nTask: ${level.task}\nApplication: ${scope}` }],
    system,
    120
  );
}

export async function generateJourneySummary(
  decisions: { level: number; title: string; summary: string }[],
  scope: string
): Promise<string> {
  const system = `You are a mentor writing a brief, warm reflection on a student's architectural reasoning journey. 3-4 sentences. Be specific about what you observed. Don't repeat the optimal plan — focus on their growth and the moments where their thinking sharpened. Write in second person ("You...").`;

  const decisionText = decisions.map(d => `Level ${d.level} (${d.title}): ${d.summary}`).join('\n');

  return callClaude(
    [{ role: 'user', content: `Application: ${scope}\n\nJourney:\n${decisionText}` }],
    system,
    300
  );
}