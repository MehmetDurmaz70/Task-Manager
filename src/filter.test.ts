import { describe, expect, it } from 'vitest'
import { countByFilter, filterTasks } from './filter'
import type { Task } from './taskReducer'

const sampleTasks: Task[] = [
  { id: '1', title: 'Read slides', status: 'todo' },
  { id: '2', title: 'Write reducer', status: 'in-progress' },
  { id: '3', title: 'Push code', status: 'done' },
  { id: '4', title: 'Write tests', status: 'todo' },
]

describe('filterTasks', () => {
  it('returns all tasks when filter is all', () => {
    expect(filterTasks(sampleTasks, 'all')).toEqual(sampleTasks)
  })

  it('returns only tasks matching the chosen status', () => {
    expect(filterTasks(sampleTasks, 'todo').map((t) => t.id)).toEqual(['1', '4'])
    expect(filterTasks(sampleTasks, 'in-progress').map((t) => t.id)).toEqual(['2'])
    expect(filterTasks(sampleTasks, 'done').map((t) => t.id)).toEqual(['3'])
  })

  it('returns an empty array for an empty task list', () => {
    expect(filterTasks([], 'all')).toEqual([])
    expect(filterTasks([], 'done')).toEqual([])
  })
})

describe('countByFilter', () => {
  it('counts tasks for each filter category', () => {
    expect(countByFilter(sampleTasks)).toEqual({
      all: 4,
      todo: 2,
      'in-progress': 1,
      done: 1,
    })
  })

  it('returns all zeros for an empty list', () => {
    expect(countByFilter([])).toEqual({
      all: 0,
      todo: 0,
      'in-progress': 0,
      done: 0,
    })
  })
})