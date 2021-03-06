import request from "supertest";
import { app } from "../../app";
import { users } from "../../test/setup";
const addFriend = async (
  user: {
    id: string;
    email?: string;
    phone?: string;
  },
  friend: {
    email?: string;
    phone?: string;
  }
) => {
  const { id, token } = await global.signin(user.id, user.email, user.phone);
  const res = await request(app)
    .put(`/api/user/friends`)
    .set("authorization", `Bearer ${token}`)
    .send({ email: friend.email, phone: friend.phone })
    .expect(200);
};
it("should send a list of user's friends", async () => {
  const user = users[0];
  const { id, token } = await global.signin(user.id, user.email, user.phone);
  await addFriend(users[0], users[1]);
  await addFriend(users[0], users[2]);
  await addFriend(users[0], users[3]);
  const res = await request(app)
    .get("/api/user/friends")
    .set("authorization", `Bearer ${token}`)
    .send()
    .expect(200);
  expect(res.body).toBeDefined();
  expect(res.body.friends).toBeDefined();
  expect(res.body.friends.length).toBe(3);
});

it("should NOT send a list of user's friends with invalid token", async () => {
  await addFriend(users[0], users[1]);
  await addFriend(users[0], users[2]);
  await addFriend(users[0], users[3]);
  const res = await request(app)
    .get("/api/user/friends")
    .set("authorization", `Bearer hgsajhgsajhgsjagsj`)
    .send()
    .expect(401);
});
