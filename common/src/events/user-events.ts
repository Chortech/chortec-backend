import { Subjects } from "./subjects";

interface IUserCreated {
  subject: Subjects.UserCreated;
  data: {
    id: string;
    phone: string;
    email: string;
    name: string;
  };
}

export { IUserCreated };