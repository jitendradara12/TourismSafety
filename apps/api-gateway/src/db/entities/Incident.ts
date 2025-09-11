import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'incidents' })
@Index(['status', 'severity', 'created_at'])
export class Incident {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('text')
  type!: string;

  @Column('text')
  severity!: 'low' | 'medium' | 'high' | 'critical';

  @Column('text')
  status!: 'open' | 'triaged' | 'closed';

  @Column('double precision')
  lat!: number;

  @Column('double precision')
  lon!: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;
}
