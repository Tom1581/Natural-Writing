import { TeamEntity } from './team.entity';
export declare class OrganizationEntity {
    id: string;
    name: string;
    domain: string;
    teams: TeamEntity[];
}
