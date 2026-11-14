import { BRIDGE_SKILLS, type BridgeSkillId } from '@/lib/skillBridge';

/**
 * Cards that pair a revision skill with the Writing Studio lesson and practice set that teach
 * it. Used on the humanizer's pages so each edit points at the skill behind it. Links are plain
 * anchors because Writing Studio lives under a different root layout (a full page load).
 */
export default function SkillBridge({ only, showEdit = true }: { only?: BridgeSkillId[]; showEdit?: boolean }) {
  const skills = only ? only.map((id) => BRIDGE_SKILLS.find((s) => s.id === id)!) : BRIDGE_SKILLS;
  return (
    <ul className="skill-bridge">
      {skills.map((s) => (
        <li key={s.id}>
          <h3>{s.skill}</h3>
          {showEdit && <p>{s.edit}</p>}
          <p className={showEdit ? 'skill-bridge-hand' : undefined}>
            {showEdit && <strong>By hand: </strong>}
            {s.byHand}
          </p>
          <p className="skill-bridge-links">
            {[s.lesson, s.practice].map(
              (l) =>
                l && (
                  <a key={l.href} href={l.href}>
                    <span>{l.kind}</span>
                    {l.title}
                  </a>
                ),
            )}
          </p>
        </li>
      ))}
    </ul>
  );
}
