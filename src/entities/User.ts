import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import Log from "./Log";
@Entity()
export default class User extends BaseEntity {
  constructor(username: string) {
    super();
    this.username = username;
  }
  @PrimaryGeneratedColumn()
  _id: number;

  @Column()
  username: string;

  @OneToMany(() => Log, (log) => log.user)
  logs: Log[];
}
