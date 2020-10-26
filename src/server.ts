import express, { NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";

import cors from "cors";
import { createConnection } from "typeorm";
import User from "./entities/User";
import Log, { LogConfig } from "./entities/Log";
(async () => {
  const app = express();
  await createConnection({
    type: "sqlite",
    database: "db.sqlite",
    synchronize: true,
    entities: [User, Log],
  });

  app.use(cors());

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  app.use(express.static("public"));

  //Actual app routes

  // manage users

  //CREATE
  app.post("/api/exercise/new-user", async (req, res) => {
    const user = new User(req.body.username);
    await user.save();
    res.json({ username: user.username, _id: user._id });
  });

  //READ
  app.get("/api/exercise/user/:id", async (req, res) => {
    let user = await User.findOne({ _id: parseInt(req.params.id) });
    if (user) {
      res.json({ username: user.username, _id: user._id });
    } else {
      res.send("error");
    }
  });

  app.get("/api/exercise/user", async (req, res) => {
    console.log(req.params);
    let users = await User.find();
    res.json(users.map((u) => ({ username: u.username, _id: u._id })));
  });

  //manage logs

  //CREATE

  const parseDate = (dateInput: string) => {
    let split = dateInput.split("-");
    let date = new Date();
    let arr = split.map((s) => parseInt(s));
    date.setFullYear(arr[0]);
    date.setMonth(arr[1]);
    date.setDate(arr[2]);
    return date;
  };

  app.post("/api/exercise/add", async (req, res) => {
    let user = await User.findOne({ _id: parseInt(req.body.userId) });
    if (!user) {
      res.send("could not find user");
      return;
    }

    let config: LogConfig = {
      description: req.body.description,
      duration: parseInt(req.body.duration),
      date: parseDate(req.body.date),
      user,
    };
    let log = new Log(config);
    await log.save();
    let logsForUser = await Log.find({ where: { user: user } });
    res.json({
      ...user,
      logs: logsForUser.map((l) => ({ ...l, date: l.formattedDate })),
    });
  });

  app.get("/api/exercise/log/:userId", async (req, res) => {
    let user = await User.findOne({ _id: parseInt(req.params.userId) });
    let logsForUser = await Log.find({ user: user });
    res.json(logsForUser.map((l) => ({ ...l, date: l.formattedDate })));
  });
  // Not found middleware
  app.use((_req, _res, next) => {
    return next({ status: 404, message: "not found" });
  });

  // Error Handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    let errCode, errMessage;
    console.log("error");

    if (err.errors) {
      // mongoose validation error
      errCode = 400; // bad request
      const keys = Object.keys(err.errors);
      // report the first validation error
      errMessage = err.errors[keys[0]].message;
    } else {
      // generic or custom error
      errCode = err.status || 500;
      errMessage = err.message || "Internal Server Error";
    }
    res.status(errCode).type("txt").send(errMessage);
  });

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log("Your app is listening on port " + port);
  });
})();
