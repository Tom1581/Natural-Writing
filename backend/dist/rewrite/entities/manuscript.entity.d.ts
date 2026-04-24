import { VersionEntity } from './version.entity';
import { ProjectEntity } from './project.entity';
import { UserEntity } from './user.entity';
import { CommentEntity } from './comment.entity';
import { StyleProfileEntity } from './style-profile.entity';
export declare class ManuscriptEntity {
    id: string;
    title: string;
    sourceText: string;
    optimizedText: string;
    metrics: any;
    tone: string;
    strength: string;
    targetGradeLevel: number;
    language: string;
    sectionType: string;
    rating: number;
    createdAt: Date;
    versions: VersionEntity[];
    project: ProjectEntity;
    owner: UserEntity;
    comments: CommentEntity[];
    metadata: any;
    styleProfile: StyleProfileEntity;
}
