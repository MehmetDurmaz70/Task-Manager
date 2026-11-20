Mehmet Durmaz - 2024502045

# Assignment 3: Task Manager with a Reducer

A Task Manager built with React, TypeScript, Vite, and `useReducer`.

## Running the Project

```bash
npm install
npm run dev
npm run build
npm test
```

## Bonus 1: Undo
The reducer state is shaped as `{ tasks: Task[]; filter: Filter; past: Task[][] }`, where `past` acts as a history stack of previous task arrays. Whenever an action actually changes `tasks` (`add`, `advance`, `remove`, or `clearDone`), the reducer pushes the old `state.tasks` array onto `past` before returning the updated list. Dispatching `undo` pops the most recent snapshot back into `tasks` without touching `filter`, and changing the filter with `setFilter` does not add an entry to `past`.

## Bonus 2: Tests
Automated unit tests are written with Vitest in `src/taskReducer.test.ts` and `src/filter.test.ts`, covering all reducer actions, immutability with `Object.freeze`, filter helpers, undo behavior, and edge cases.

```text
> task-manager-assignment3@0.0.0 test
> vitest run

 RUN  v5.1.1

 ✓ src/filter.test.ts (5 tests) 10ms
 ✓ src/taskReducer.test.ts (9 tests) 14ms

 Test Files  2 passed (2)
      Tests  14 passed (14)
```

## Bonus 3: Explain your reducer
A reducer needs to be a pure function because React relies on shallow reference checks (`Object.is`) to decide whether state actually changed. If a reducer mutates the existing state object or pushes directly into `state.tasks` and returns the same reference, React assumes nothing changed and skips re-rendering, leaving the UI out of date. Pure functions also keep state transitions predictable for testing and allow React StrictMode to run the reducer twice in development without side effects.

For the same reason, `crypto.randomUUID()` is called in `AddForm` rather than inside `taskReducer`. Generating a random ID is non-deterministic: calling the reducer twice with the exact same state and action would produce different results, breaking purity and making unit tests harder to write.

The visible task list and the filter counts are derived during render with `filterTasks` and `countByFilter` instead of being stored in state. Storing them would duplicate the same source of truth in multiple places. A typical bug this causes is forgetting to update the stored counts or filtered array in one action—for instance, removing completed items in `clearDone` while accidentally leaving `counts.done` or the visible list stale on screen.

Moving `filter` into the reducer state instead of keeping a separate `useState` made `App.tsx` simpler because every state update flows through a single `dispatch` function. The small trade-off was having to be deliberate when adding Undo so that `setFilter` updates the view without pushing a new snapshot onto `past`.

## Bonus 4: Git repository
https://github.com/MehmetDurmaz70/Task-Manager