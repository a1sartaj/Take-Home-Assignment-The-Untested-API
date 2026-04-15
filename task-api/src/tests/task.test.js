const request = require('supertest');
const app = require('../app');


describe('POST /tasks', () => {
    it('should create a task', async () => {
        const res = await request(app)
            .post('/tasks')
            .send({ title: 'First Task', priority: 'high' });

        console.log(res.body); // dekhne ke liye

        expect(res.statusCode).toBe(201);
        expect(res.body.title).toBe('First Task');
    });


    it('should count completed tasks', async () => {
        const create = await request(app)
            .post('/tasks')
            .send({ title: 'Task', priority: 'high' });

        const id = create.body.id;

        await request(app).patch(`/tasks/${id}/complete`);

        const res = await request(app).get('/tasks/stats');

        expect(res.statusCode).toBe(200)
    });


    it('should count overdue tasks', async () => {
        const pastDate = new Date(Date.now() - 10000000).toISOString();

        await request(app)
            .post('/tasks')
            .send({
                title: 'Overdue Task',
                priority: 'high',
                dueDate: pastDate
            });

        const res = await request(app).get('/tasks/stats');

        console.log(res.body);

        expect(res.body.overdue).toBeGreaterThanOrEqual(1);
    });

});

describe('POST /tasks - edge cases', () => {

    it('should fail if title is missing', async () => {
        const res = await request(app)
            .post('/tasks')
            .send({ priority: 'high' });

        console.log(res.body);

        expect(res.statusCode).toBe(400);
    });

    it('should fail for invalid priority', async () => {
        const res = await request(app)
            .post('/tasks')
            .send({ title: 'Test', priority: 'invalid' });

        console.log(res.body);

        expect(res.statusCode).toBe(400);
    });


    it('should return status and priority error', async () => {
        const res = await request(app)
            .post('/tasks')
            .send({
                title: 'Task 4',
                priority: 'Extra High',
                status: 'Completed'
            });


        console.log(res.body);

        expect(res.statusCode).toBe(400);
    });

});

describe('GET /tasks', () => {
    it('It should return the task', async () => {

        await request(app).post('/tasks').send({ title: 'Text 1', priority: 'low' })

        const res = await request(app).get('/tasks')

        console.log(res.body)

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true)
    })


    it('Should filter tasks by status', async () => {
        const res = await request(app).get('/tasks?status=todo');

        console.log(res.body);

        expect(res.statusCode).toBe(200)
    })

    it('should paginate tasks', async () => {
        const res = await request(app).get('/tasks?page=1&limit=1');

        console.log(res.body);

        expect(res.statusCode).toBe(200);
    });

    it('should handle invalid pagination', async () => {
        const res = await request(app).get('/tasks?page=abc&limit=xyz');

        console.log(res.body);

        expect(res.statusCode).toBe(400);
    });

    it('should handle status tasks', async () => {
        const res = await request(app).get('/tasks?status=todo');

        console.log(res.body);

        expect(res.statusCode).toBe(200);
    });

})


// New End Points Test Case
describe('Patch /tasks/:id/assign', () => {
    it('Should assign task', async () => {
        const create = await request(app).post('/tasks').send({ title: 'Task 3', priority: 'high' })

        const id = create.body.id;

        const res = await request(app).patch(`/tasks/${id}/assign`).send({ assignee: 'Sartaj Alam' })

        console.log(res.body);

        expect(res.statusCode).toBe(200);
        expect(res.body.assignee).toBe('Sartaj Alam');
    })

    it('Should throw thow error for empty assignee', async () => {
        const create = await request(app).post('/tasks').send({ title: 'Task 3', priority: 'high' })

        const id = create.body.id;

        const res = await request(app).patch(`/tasks/${id}/assign`).send({ assignee: '  ' })

        console.log(res.body);

        expect(res.statusCode).toBe(400);
    })

    it('Should throw and task not found', async () => {
        const create = await request(app).post('/tasks').send({ title: 'Task 3', priority: 'high' })

        const id = 'abcd';

        const res = await request(app).patch(`/tasks/${id}/assign`).send({ assignee: 'Sartaj' })

        console.log(res.body);

        expect(res.statusCode).toBe(404);
    })


})

describe('GET /tasks/stats', () => {
    it('should return correct counts', async () => {
        await request(app)
            .post('/tasks')
            .send({ title: 'Task 1', priority: 'high' });

        await request(app)
            .post('/tasks')
            .send({ title: 'Task 2', priority: 'low' });

        const res = await request(app).get('/tasks/stats');

        console.log(res.body);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('todo');
        expect(res.body).toHaveProperty('in_progress');
        expect(res.body).toHaveProperty('done');
        expect(res.body).toHaveProperty('overdue');
    });
});

