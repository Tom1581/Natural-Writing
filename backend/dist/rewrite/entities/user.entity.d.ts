import { ManuscriptEntity } from './manuscript.entity';
import { ProjectEntity } from './project.entity';
export declare class UserEntity {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: Date;
    manuscripts: ManuscriptEntity[];
    projects: ProjectEntity[];
}
