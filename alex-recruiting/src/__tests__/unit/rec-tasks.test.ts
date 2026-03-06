import { describe, it, expect, beforeEach } from 'vitest';

describe('REC Task System', () => {
  beforeEach(async () => {
    const { clearTasks } = await import('@/lib/rec/tasks');
    clearTasks();
  });

  it('createTask assigns to team member', async () => {
    const { createTask, getAllTasks } = await import('@/lib/rec/tasks');
    const task = createTask({
      assignedTo: 'trey',
      title: 'Draft 3 posts for Tuesday',
      description: 'Training clip + character post + film share',
      priority: 3,
    });
    expect(task.id).toBeDefined();
    expect(task.assignedTo).toBe('trey');
    expect(task.status).toBe('pending');
    expect(task.createdAt).toBeDefined();
    expect(task.completedAt).toBeNull();
    expect(getAllTasks()).toHaveLength(1);
  });

  it('getTasksForMember filters correctly', async () => {
    const { createTask, getTasksForMember } = await import('@/lib/rec/tasks');
    createTask({ assignedTo: 'nina', title: 'Research Iowa coach', description: '', priority: 2 });
    createTask({ assignedTo: 'trey', title: 'Draft post', description: '', priority: 3 });
    createTask({ assignedTo: 'nina', title: 'Draft DM', description: '', priority: 1 });
    expect(getTasksForMember('nina')).toHaveLength(2);
    expect(getTasksForMember('trey')).toHaveLength(1);
  });

  it('updateTask sets completedAt when status changes to completed', async () => {
    const { createTask, updateTask } = await import('@/lib/rec/tasks');
    const task = createTask({
      assignedTo: 'jordan',
      title: 'Optimize highlight reel',
      description: '',
      priority: 2,
    });
    const updated = updateTask(task.id, { status: 'completed', output: 'Optimized 5 clips' });
    expect(updated?.status).toBe('completed');
    expect(updated?.completedAt).toBeDefined();
    expect(updated?.output).toBe('Optimized 5 clips');
  });

  it('updateTask returns undefined for unknown id', async () => {
    const { updateTask } = await import('@/lib/rec/tasks');
    expect(updateTask('nonexistent', { status: 'completed' })).toBeUndefined();
  });
});
