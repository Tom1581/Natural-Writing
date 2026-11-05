import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { verifiedAdultEmail, type Actor } from '../auth/supabase-auth.guard';
import { AccessService } from './access.service';
import { AuditService } from './audit.service';
import { getFramework, localGradeLabel, type FrameworkId } from './content';
import {
  ClassEntity,
  ClassMemberEntity,
  LearnerAuthorizationEntity,
  LearnerEntity,
  OrganizationEntity,
  OrgMemberEntity,
} from './entities';
import {
  CreateOrgDto,
  InviteMemberDto,
  LEARNING_NOTICE_VERSION,
  RosterImportDto,
} from './learning.dto';
import { StudentAccessService } from './student-access.service';

/**
 * Schools: admins invite teachers by email; an invitation becomes active when that person signs
 * in with the same verified email. Removing a member ends their access to the school's
 * students and classes immediately. Roster import creates school profiles under the school's
 * authority and gives each student a sign-in code.
 */
@Injectable()
export class OrgService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(OrganizationEntity)
    private readonly orgs: Repository<OrganizationEntity>,
    @InjectRepository(OrgMemberEntity)
    private readonly members: Repository<OrgMemberEntity>,
    @InjectRepository(LearnerEntity)
    private readonly learners: Repository<LearnerEntity>,
    @InjectRepository(ClassEntity)
    private readonly classes: Repository<ClassEntity>,
    private readonly access: AccessService,
    private readonly audit: AuditService,
    private readonly studentAccess: StudentAccessService,
  ) {}

  private email(actor: Actor) {
    this.access.requireAdult(actor);
    const email = verifiedAdultEmail(actor);
    if (!email)
      throw new BadRequestException(
        'Sign in with an email address to use school accounts.',
      );
    return email;
  }

  private async requireRole(
    actor: Actor,
    organizationId: string,
    role?: 'admin',
  ) {
    const m = await this.access.membership(actor, organizationId);
    if (!m) throw new NotFoundException('School not found.');
    if (role && m.role !== role)
      throw new ForbiddenException('Only a school admin can do this.');
    return m;
  }

  async create(actor: Actor, dto: CreateOrgDto) {
    const email = this.email(actor);
    const org = await this.dataSource.transaction(async (m) => {
      const created = await m.save(
        m.create(OrganizationEntity, {
          name: dto.name.trim(),
          curriculum: dto.curriculum,
          createdBySubject: actor.subject,
        }),
      );
      await m.save(
        m.create(OrgMemberEntity, {
          organizationId: created.id,
          email,
          subject: actor.subject,
          role: 'admin',
          status: 'active',
          invitedBySubject: actor.subject,
          joinedAt: new Date(),
          removedAt: null,
        }),
      );
      return created;
    });
    await this.audit.record(actor, org.id, 'school.created');
    return this.detail(actor, org.id);
  }

  /** Schools the adult belongs to, and invitations waiting for their email. */
  async mine(actor: Actor) {
    const email = this.email(actor);
    const rows = await this.members.find({
      where: [
        { subject: actor.subject, status: 'active' },
        { email, status: 'invited' },
      ],
    });
    const orgs = rows.length
      ? await this.orgs.find({
          where: { id: In(rows.map((r) => r.organizationId)) },
        })
      : [];
    const name = (id: string) =>
      orgs.find((o) => o.id === id)?.name ?? 'School';
    return {
      schools: rows
        .filter((r) => r.status === 'active')
        .map((r) => ({
          id: r.organizationId,
          name: name(r.organizationId),
          role: r.role,
        })),
      invitations: rows
        .filter((r) => r.status === 'invited')
        .map((r) => ({
          organizationId: r.organizationId,
          name: name(r.organizationId),
          role: r.role,
        })),
    };
  }

  async detail(actor: Actor, organizationId: string) {
    const me = await this.requireRole(actor, organizationId);
    const org = await this.orgs.findOneByOrFail({ id: organizationId });
    const [members, learnerCount, classes] = await Promise.all([
      this.members.find({
        where: { organizationId },
        order: { createdAt: 'ASC' },
      }),
      this.learners.count({ where: { organizationId } }),
      this.classes.find({
        where: { organizationId },
        order: { createdAt: 'ASC' },
      }),
    ]);
    return {
      id: org.id,
      name: org.name,
      curriculum: org.curriculum,
      myRole: me.role,
      students: learnerCount,
      classes: classes
        .filter((c) => me.role === 'admin' || c.ownerSubject === actor.subject)
        .map((c) => ({
          id: c.id,
          name: c.name,
          mine: c.ownerSubject === actor.subject,
        })),
      members: members
        .filter((m) => m.status !== 'removed')
        .map((m) => ({
          id: m.id,
          email: m.email,
          role: m.role,
          status: m.status,
          joinedAt: m.joinedAt,
          isMe: m.subject === actor.subject,
        })),
    };
  }

  async invite(actor: Actor, organizationId: string, dto: InviteMemberDto) {
    await this.requireRole(actor, organizationId, 'admin');
    const email = dto.email.trim().toLowerCase();
    const existing = await this.members.findOneBy({ organizationId, email });
    if (existing?.status === 'active')
      throw new BadRequestException('That person is already a member.');
    if (existing) {
      await this.members.update(
        { id: existing.id },
        {
          role: dto.role,
          status: 'invited',
          subject: null,
          removedAt: null,
          invitedBySubject: actor.subject,
        },
      );
    } else {
      await this.members.save(
        this.members.create({
          organizationId,
          email,
          role: dto.role,
          status: 'invited',
          subject: null,
          invitedBySubject: actor.subject,
          joinedAt: null,
          removedAt: null,
        }),
      );
    }
    await this.audit.record(
      actor,
      organizationId,
      'member.invited',
      { type: 'email', id: email },
      `role: ${dto.role}`,
    );
    return this.detail(actor, organizationId);
  }

  async accept(actor: Actor, organizationId: string) {
    const email = this.email(actor);
    const invite = await this.members.findOneBy({
      organizationId,
      email,
      status: 'invited',
    });
    if (!invite)
      throw new NotFoundException('No invitation for your email address.');
    await this.members.update(
      { id: invite.id },
      { status: 'active', subject: actor.subject, joinedAt: new Date() },
    );
    await this.audit.record(
      actor,
      organizationId,
      'member.joined',
      { type: 'member', id: invite.id },
      `role: ${invite.role}`,
    );
    return this.detail(actor, organizationId);
  }

  async remove(actor: Actor, organizationId: string, memberId: string) {
    await this.requireRole(actor, organizationId, 'admin');
    const member = await this.members.findOneBy({
      id: memberId,
      organizationId,
    });
    if (!member || member.status === 'removed')
      throw new NotFoundException('Member not found.');
    if (member.role === 'admin' && member.status === 'active') {
      const admins = await this.members.count({
        where: { organizationId, role: 'admin', status: 'active' },
      });
      if (admins <= 1)
        throw new BadRequestException(
          'A school needs at least one admin. Add another admin first.',
        );
    }
    await this.members.update(
      { id: member.id },
      { status: 'removed', removedAt: new Date() },
    );
    await this.audit.record(
      actor,
      organizationId,
      'member.removed',
      { type: 'member', id: member.id },
      `email: ${member.email}`,
    );
    return this.detail(actor, organizationId);
  }

  /** Creates school profiles from a roster (names and grades only) and a sign-in code for each. */
  async importRoster(
    actor: Actor,
    organizationId: string,
    dto: RosterImportDto,
  ) {
    await this.requireRole(actor, organizationId);
    if (!dto.agreeToNotice || dto.noticeVersion !== LEARNING_NOTICE_VERSION) {
      throw new BadRequestException(
        'Please confirm the school has authorized this use and agree to the current learning notice.',
      );
    }
    const org = await this.orgs.findOneByOrFail({ id: organizationId });
    const curriculum = (dto.curriculum ?? org.curriculum) as FrameworkId;
    const fw = getFramework(curriculum)!;
    const rows = dto.students.map((s) => ({
      displayName: s.displayName.trim(),
      localGrade: s.localGrade.trim(),
      grade: fw.localToGrade[s.localGrade.trim().toUpperCase()],
    }));
    const bad = rows.filter((r) => !r.displayName || !r.grade);
    if (bad.length) {
      throw new BadRequestException(
        `Check these rows (name and a supported ${fw.gradeWord.toLowerCase()}): ${bad
          .map((b) => b.displayName || '(no name)')
          .slice(0, 5)
          .join(', ')}`,
      );
    }
    const cls = dto.classId
      ? await this.access.manageableClass(actor, dto.classId)
      : null;
    if (cls && cls.organizationId !== organizationId)
      throw new BadRequestException(
        'That class belongs to a different school.',
      );

    const created = await this.dataSource.transaction(async (m) => {
      const out: LearnerEntity[] = [];
      for (const r of rows) {
        const learner = await m.save(
          m.create(LearnerEntity, {
            ownerSubject: actor.subject,
            organizationId,
            displayName: r.displayName,
            gradeLevel: r.grade,
            curriculum,
            accessCodeHash: null,
            accessCodeCreatedAt: null,
          }),
        );
        await m.save(
          m.create(LearnerAuthorizationEntity, {
            learnerId: learner.id,
            grantedBySubject: actor.subject,
            relationship: 'school',
            noticeVersion: dto.noticeVersion,
            revokedAt: null,
          }),
        );
        if (cls)
          await m.save(
            m.create(ClassMemberEntity, {
              classId: cls.id,
              learnerId: learner.id,
            }),
          );
        out.push(learner);
      }
      return out;
    });

    const results: {
      learnerId: string;
      displayName: string;
      gradeLabel: string;
      code: string | null;
    }[] = [];
    for (const l of created) {
      const code = await this.studentAccess
        .createCode(actor, l.id)
        .then((r) => r.code)
        .catch(() => null);
      results.push({
        learnerId: l.id,
        displayName: l.displayName,
        gradeLabel: localGradeLabel(curriculum, l.gradeLevel),
        code,
      });
    }
    await this.audit.record(
      actor,
      organizationId,
      'roster.imported',
      cls ? { type: 'class', id: cls.id } : undefined,
      `${created.length} students`,
    );
    return {
      created: results,
      codesEnabled: results.every((r) => r.code !== null),
    };
  }

  async auditLog(actor: Actor, organizationId: string) {
    await this.requireRole(actor, organizationId, 'admin');
    const events = await this.audit.forOrganization(organizationId);
    const people = await this.members.find({ where: { organizationId } });
    return events.map((e) => ({
      action: e.action,
      actor:
        people.find((p) => p.subject === e.actorSubject)?.email ??
        'former member',
      targetType: e.targetType,
      detail: e.detail,
      createdAt: e.createdAt,
    }));
  }
}
