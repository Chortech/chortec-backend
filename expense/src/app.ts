import express from "express";

// this library helps throwing errors from async request handlers
// we dont need to write next(err) each we want to send an error
// to our error handling middleware.
import "express-async-errors";
import helmet from "helmet";
import { NotFoundError, errorHandler } from "@chortec/common";
import { router as createExpenseRouter } from "./routes/create-expense";
import { router as getExpensesRouter } from "./routes/get-expenses";
import { router as getExpenseRouter } from "./routes/get-expense";
import { router as removeExpenseRouter } from "./routes/remove-expense";
import { router as addCommentRouter } from "./routes/add-comment";
import { router as getCommentsRouter } from "./routes/get-comments";
import { router as updateExpenseRouter } from "./routes/update-expense";
import { router as getFriendsExpensesRouter } from "./routes/get-friends-expense";
import { router as getFriendExpensesRouter } from "./routes/get-friend-expense";
import { router as getGroupBalanceRouter } from "./routes/get-group-balance";
import { router as getGroupsExpenseRouter } from "./routes/get-groups-expense";

// setting up express
const app = express();
app.use(express.json());
app.use(helmet());

// adding route handlers to express
app.use("/api/expenses", createExpenseRouter);
app.use("/api/expenses", getExpensesRouter);
// new
app.use("/api/expenses/friends", getFriendsExpensesRouter);
app.use("/api/expenses/friends/:id", getFriendExpensesRouter);
app.use("/api/expenses/groups", getGroupsExpenseRouter);
app.use("/api/expenses/groups/:id", getGroupBalanceRouter);
// end new
app.use("/api/expenses/:id", getExpenseRouter);
app.use("/api/expenses/:id", removeExpenseRouter);
app.use("/api/expenses/:id", updateExpenseRouter);
app.use("/api/expenses/:id/comments", addCommentRouter);
app.use("/api/expenses/:id/comments", getCommentsRouter);

// if any of the above route handlers failed to run we need to show a 404 status code
app.get("*", (req, res) => {
  throw new NotFoundError();
});

// adding the error handling middleware
app.use(errorHandler);

// exporting app so we could run the server in different place
// this is mostly for making the test easier
export { app };
