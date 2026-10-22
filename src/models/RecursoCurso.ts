import {
	Table,
	Column,
	Model,
	DataType,
	ForeignKey,
} from 'sequelize-typescript';
import { Curso } from './Curso';
import { Recurso } from './Recurso';

@Table({ tableName: 'recursos_curso', timestamps: false })
export class RecursoCurso extends Model {
	@ForeignKey(() => Curso)
	@Column({
		type: DataType.UUID,
		primaryKey: true,
	})
	curso_id!: string;

	@ForeignKey(() => Recurso)
	@Column({
		type: DataType.UUID,
		primaryKey: true,
	})
	recurso_id!: string;

	@Column({
		type: DataType.DATE,
		defaultValue: DataType.NOW,
	})
	asignado_en!: Date;
}
