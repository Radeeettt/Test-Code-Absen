import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('attendances')
export class Attendance {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id' })
  userId!: number;

  @Column({ type: 'date' })
  date!: string; // Format: YYYY-MM-DD

  @Column({ name: 'clock_in_time', type: 'time' })
  clockInTime!: string; // Format: HH:MM:SS

  @Column({ name: 'clock_out_time', type: 'time', nullable: true })
  clockOutTime?: string; // Format: HH:MM:SS

  @Column({ name: 'clock_in_photo' })
  clockInPhoto!: string; // Uploaded file path

  @Column({ name: 'clock_out_photo', nullable: true })
  clockOutPhoto?: string; // Uploaded file path

  @Column({ default: 'present' })
  status!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
