import {
	Table,
	Column,
	Model,
	DataType,
	BelongsToMany,
} from 'sequelize-typescript';
import { Curso } from './Curso';
import { RecursoCurso } from './RecursoCurso';

@Table({ tableName: 'recursos', timestamps: false })
export class Recurso extends Model {
	@Column({
		type: DataType.UUID,
		defaultValue: DataType.UUIDV4,
		primaryKey: true,
	})
	declare id: string;

	@Column({ type: DataType.TEXT, allowNull: false, unique: true })
	codigo!: string;

	@Column({ type: DataType.TEXT, allowNull: false })
	titulo!: string;

	@Column({ type: DataType.TEXT })
	descripcion!: string;

	@Column({ type: DataType.TEXT, allowNull: false })
	asignatura!: string;

	@Column({ type: DataType.TEXT, allowNull: false })
	url!: string;

	@Column({ type: DataType.TEXT })
	autor!: string;

	@Column({ type: DataType.DATE, defaultValue: DataType.NOW })
	creado_en!: Date;

	// Relación Muchos a Muchos con Cursos
	@BelongsToMany(() => Curso, () => RecursoCurso)
	cursos!: Curso[];
}
