# Project Maze: Minos

A Bandit-style, Socratic software architecture learning system. Students describe a real application, receive six locked challenge levels, and must reason their way to the optimal architecture — never being told the answer directly.

---

## How it works

1. **Student describes their application** — scale, users, constraints, key features
2. **System generates in secret:** a comprehensive optimal architecture plan (locked) + six challenge levels
3. **Student works through levels one by one** — reasoning in free text, receiving only Socratic questions back
4. **Mistakes compound** — early decisions shape later challenges
5. **Final level complete** → optimal plan is revealed for comparison

---

## Setup

### 1. Install
```bash
npm install
```

### 2. Set your Anthropic API key
```bash
cp .env.example .env
# Edit .env:  REACT_APP_ANTHROPIC_API_KEY=sk-ant-...
```

> This app calls the Anthropic API directly from the browser. Fine for classroom/local use. For production, proxy through a backend.

### 3. Run
```bash
npm start        # dev server at localhost:3000
npm run build    # production build → /build
```

---

## Project structure

```
src/
├── api.ts              — All Anthropic API calls
├── types.ts            — TypeScript interfaces
├── App.tsx             — Root component, phase state machine
├── TopBar.tsx          — Sticky nav with progress bar
├── ScopePhase.tsx      — Level 0: describe your application
├── GeneratingPhase.tsx — Loading while plan + levels are built
├── ChallengePhase.tsx  — Main gameplay: 6 levels, Socratic conversation
└── CompletePhase.tsx   — Vault opens: optimal plan + journey summary
```

---

## Level arc

| Level | Topic | Difficulty |
|-------|-------|------------|
| 1 | Core architecture pattern | Easy |
| 2 | Data model and database strategy | Easy |
| 3 | Scalability and performance | Medium |
| 4 | API design and service contracts | Medium |
| 5 | Security, auth, and reliability | Hard |
| 6 | Deployment, observability, and ops | Hard |

All six levels are generated dynamically for each student's specific application.

---

## Pedagogical design

**Socratic only** — Minos never states the correct answer. Every response triggers a probing question. Students must reason, not pattern-match.

**Level-locked** — like OverTheWire Bandit, you can't skip. Each level builds on previous decisions. Pick microservices in Level 1 and Level 2 will confront you with distributed transaction complexity.

**Hidden answer key** — the optimal plan is generated first, then sealed. The AI evaluates against this specific target. Students only see it at the end to compare.

**Hints are questions** — each level has one hint available. It's always phrased as a question that forces a different angle, never an answer.

---

## Customization

**Strictness** — edit the `VERDICT: COMPLETE` criteria in `evaluateAnswer()` inside `api.ts`.

**Level count/arc** — edit the system prompt in `generatePlanAndLevels()`.

**Persistence** — serialize `AppState` to `localStorage` or POST to a backend after each level. Hook into `onUpdate({ decisions })` in `ChallengePhase.tsx`.

**Canvas/LMS** — same hook point. POST `state.decisions` to your Canvas API after each level completes.

---

## Migration from original Python/Streamlit app

| Original | This app |
|----------|----------|
| `PlanningAgent` | `generatePlanAndLevels()` in `api.ts` |
| `TradeoffAnalystAgent` + `TechDebtAgent` + `RequirementsDriftAgent` | Merged into `evaluateAnswer()` Minos persona, focus shifts per level topic |
| `SocraticAgent` | The `VERDICT: CONTINUE/COMPLETE` loop in `evaluateAnswer()` |
| `StateManager` | React `useState` (add persistence as needed) |
| `ScenarioEngine` | Dynamic level generation per student scope |
