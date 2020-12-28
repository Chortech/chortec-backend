import request from 'supertest';
import { app } from '../../app';
import { users } from '../../test/setup';
import Group from '../../models/group';


it('should add a member to the group', async () => {
  const { id, token } = await global.signin(
    users[0].id,
    users[0].email,
    users[0].phone
  );

  const res = await request(app)
    .post('/api/group')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'hello', picture: 'hello.png' })
    .expect(201);
  
  const response = await request(app)
    .put(`/api/group/${res.body.id}`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      members: [
        users[1].id,
        users[2].id,
        users[3].id
      ]
    });
  
  expect(response.status).toBe(200);
  
  const group = await Group.findById(response.body.id);
  expect(group?.members.length).toBe(4);
});


it('should not add a member to a group that does not exist', async () => {
  const { id, token } = await global.signin(
    users[0].id,
    users[0].email,
    users[0].phone
  );

  const res = await request(app)
    .post('/api/group')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'hello', picture: 'hello.png' })
    .expect(201);
  
  const response = await request(app)
    .put(`/api/group/${id}`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      members: [
        users[1].id,
        users[2].id,
        users[3].id
      ]
    });
  
  expect(response.status).toBe(404);
  
  const group = await Group.findById(res.body.id);
  expect(group?.members.length).toBe(1);
});


it('should not add a member to the group if you are not a member in the said group', async () => {
  const { id, token } = await global.signin(
    users[0].id,
    users[0].email,
    users[0].phone
  );

  const res = await request(app)
    .post('/api/group')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'hello', picture: 'hello.png' })
    .expect(201);

  const user = await global.signin(
    users[1].id,
    users[1].email,
    users[1].phone
  );
  
  const response = await request(app)
    .put(`/api/group/${res.body.id}`)
    .set('Authorization', `Bearer ${user.token}`)
    .send({
      members: [
        users[2].id,
        users[3].id
      ]
    });
  
  expect(response.status).toBe(400);
  
  const group = await Group.findById(res.body.id);
  expect(group?.members.length).toBe(1);
});


it('should not add a member to the group with wrong member ids', async () => {
  const { id, token } = await global.signin(
    users[0].id,
    users[0].email,
    users[0].phone
  );

  const res = await request(app)
    .post('/api/group')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'hello', picture: 'hello.png' })
    .expect(201);

  const user = await global.signin(
    users[1].id,
    users[1].email,
    users[1].phone
  );
  
  const response = await request(app)
    .put(`/api/group/${res.body.id}`)
    .set('Authorization', `Bearer ${user.token}`)
    .send({
      members: [
        '234567ajhfdkasafdaas',
        'falksjfoieo4u1o42ukj'        
      ]
    });
  
  expect(response.status).toBe(400);
  
  const group = await Group.findById(res.body.id);
  expect(group?.members.length).toBe(1);
});