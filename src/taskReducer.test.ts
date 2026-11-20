import { describe, expect, it } from 'vitest'
import { countByFilter } from './filter'
import { initialState, taskReducer, type State } from './taskReducer'

function stateWithTasks(): State {
  return {
    filter: 'all',
    past: [],
    tasks: [
      { id: '1', title: 'Task A', status: 'todo' },
      { id: '2', title: 'Task B', status: 'in-progress' },
      { id: '3', title: 'Task C', status: 'done' },
    ],
  }
}

describe('taskReducer', () => {
  it('adds a task with todo status', () => {
    const next = taskReducer(initialState, { type: 'add', id: '1', title: 'Buy milk' })
    expect(next.tasks).toEqual([{ id: '1', title: 'Buy milk', status: 'todo' }])
    expect(next.filter).toBe('all')
    expect(next.past).toHaveLength(1)
  })

  it('advances a task through todo -> in-progress -> done -> todo', () => {
    const s1 = taskReducer(initialState, { type: 'add', id: '1', title: 'Cycle me' })
    const s2 = taskReducer(s1, { type: 'advance', id: '1' })
    expect(s2.tasks[0].status).toBe('in-progress')

    const s3 = taskReducer(s2, { type: 'advance', id: '1' })
    expect(s3.tasks[0].status).toBe('done')

    const s4 = taskReducer(s3, { type: 'advance', id: '1' })
    expect(s4.tasks[0].status).toBe('todo')
  })

  it('removes a task and updates derived counts', () => {
    const start = stateWithTasks()
    const next = taskReducer(start, { type: 'remove', id: '2' })
    expect(next.tasks.map((t) => t.id)).toEqual(['1', '3'])
    expect(countByFilter(next.tasks)).toEqual({
      all: 2,
      todo: 1,
      'in-progress': 0,
      done: 1,
    })
  })

  it('updates filter without changing tasks or history', () => {
    const start = stateWithTasks()
    const next = taskReducer(start, { type: 'setFilter', filter: 'done' })
    expect(next.filter).toBe('done')
    expect(next.tasks).toEqual(start.tasks)
    expect(next.past).toEqual([])
  })

  it('clears done tasks while keeping the current filter', () => {
    const start: State = { ...stateWithTasks(), filter: 'in-progress' }
    const next = taskReducer(start, { type: 'clearDone' })
    expect(next.tasks.map((t) => t.id)).toEqual(['1', '2'])
    expect(next.filter).toBe('in-progress')
  })

  it('does not mutate the previous state', () => {
    const task = Object.freeze({ id: '1', title: 'Frozen', status: 'todo' as const })
    const tasks: State['tasks'] = [task]
    Object.freeze(tasks)
    const past: State['past'] = []
    Object.freeze(past)
    const state: State = Object.freeze({
      tasks,
      filter: 'all',
      past,
    })

    const afterAdd = taskReducer(state, { type: 'add', id: '2', title: 'New' })
    const afterAdvance = taskReducer(state, { type: 'advance', id: '1' })
    const afterRemove = taskReducer(state, { type: 'remove', id: '1' })

    expect(state.tasks).toHaveLength(1)
    expect(state.tasks[0].status).toBe('todo')
    expect(afterAdd.tasks).toHaveLength(2)
    expect(afterAdvance.tasks[0].status).toBe('in-progress')
    expect(afterRemove.tasks).toHaveLength(0)
  })

  it('handles edge cases: unknown id and clearDone with no done tasks', () => {
    const onlyTodo: State = {
      filter: 'all',
      past: [],
      tasks: [{ id: '1', title: 'Only todo', status: 'todo' }],
    }

    expect(taskReducer(onlyTodo, { type: 'advance', id: 'missing' })).toBe(onlyTodo)
    expect(taskReducer(onlyTodo, { type: 'remove', id: 'missing' })).toBe(onlyTodo)
    expect(taskReducer(onlyTodo, { type: 'clearDone' })).toBe(onlyTodo)
  })

  it('supports undo for task changes, including clearDone, and ignores setFilter', () => {
    let state = initialState
    state = taskReducer(state, { type: 'add', id: '1', title: 'One' })
    state = taskReducer(state, { type: 'advance', id: '1' })
    state = taskReducer(state, { type: 'advance', id: '1' })
    state = taskReducer(state, { type: 'setFilter', filter: 'done' })
    state = taskReducer(state, { type: 'clearDone' })

    expect(state.tasks).toHaveLength(0)

    state = taskReducer(state, { type: 'undo' })
    expect(state.tasks).toHaveLength(1)
    expect(state.tasks[0].status).toBe('done')
    expect(state.filter).toBe('done')
  })

  it('does nothing on undo when history is empty', () => {
    expect(taskReducer(initialState, { type: 'undo' })).toBe(initialState)
  })
})