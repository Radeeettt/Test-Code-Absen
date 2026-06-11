import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('attendances')
export class Attendance {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id' })
  userId!: number;

  @Column({ type: 'date' })
  date!: string;

  @Column({ name: 'clock_in_time', type: 'time' })
  clockInTime!: string;

  @Column({ name: 'clock_out_time', type: 'time', nullable: true })
  clockOutTime?: string;

  @Column({ name: 'clock_in_photo' })
  clockInPhoto!: string;

  @Column({ name: 'clock_out_photo', nullable: true })
  clockOutPhoto?: string;

  @Column({ default: 'present' })
  status!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
