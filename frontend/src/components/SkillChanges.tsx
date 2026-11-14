'use client';

import { describeChanges, type BridgeMetrics } from '@/lib/skillBridge';
import { trackEvent } from '@/lib/analytics';

/**
 * Shown after a rewrite: each measurable difference between the draft and the rewrite, the
 * revision skill behind it, and the free Writing Studio lesson that teaches that skill. The two
 * "check" rows are always present, because no metric can confirm a claim kept its caution or a
 * citation survived. Lessons open in a new tab so the draft stays on screen.
 */
export default function SkillChanges({ before, after }: { before: BridgeMetrics; after: BridgeMetrics }) {
  const changes = describeChanges(before, after);
  return (
    <div className="skill-changes">
      <p className="skill-changes-title">What changed, and the skill behind it</p>
      <p className="skill-changes-note">
        Each edit is a revision skill you can learn. The lessons are free in Natural Quill Writing Studio and open in a new tab.
      </p>
      <ul>
        {changes.map(({ skill, change, check }) => (
          <li key={skill.id} data-check={check ? 'true' : undefined}>
            <span className="skill-changes-skill">{check ? `Check: ${skill.skill.toLowerCase()}` : skill.skill}</span>
            <span className="skill-changes-change">{change}</span>
            <a
              href={skill.lesson.href}
              target="_blank"
              rel="noopener"
              onClick={() => trackEvent('natural_quill_skill_lesson_click', { skill: skill.id, lesson: skill.lesson.href })}
            >
              <span>{skill.lesson.kind}</span>
              {skill.lesson.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
