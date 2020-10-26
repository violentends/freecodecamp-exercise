import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import User from "./User";

export interface LogConfig {
  description: string;
  duration: number;
  date?: Date | null;
  user: User;
}

@Entity()
export default class Log extends BaseEntity {
  constructor(config: LogConfig) {
    super();
    if (!config) {
      return;
    }
    this.description = config.description;
    this.duration = config.duration;
    this.user = config.user;
    if (config.date) {
      this.date = config.date;
    } else {
      this.date = new Date();
    }
  }
  @PrimaryGeneratedColumn()
  _id: number;

  @Column()
  description: string;

  @Column()
  duration: number;

  @Column()
  date: Date;

  get formattedDate() {
    return `${pad(this.date.getFullYear(), 4)}-${pad(
      this.date.getMonth(),
      2
    )}-${pad(this.date.getDate(), 2)}`;
  }

  @ManyToOne(() => User, (user) => user.logs)
  user: User;
}
function pad(n: number, len: number) {
  let string = n.toString();
  let diff = len - string.length;
  if(diff <= 0){
     return string;
  }
  let pad = '';
  while(pad.length < diff) {
    pad += "0";
  }
  return pad + string;
}
