import type { ReactNode } from 'react';

/**
 * Picture sets for Kindergarten–Grade 2 prompts: three numbered panels drawn from simple
 * shapes, so they load instantly and need no image licences. The prompt's `description`
 * (also sent to the evaluator) is split into one text alternative per panel.
 */

const INK = '#2b2f36';
const SKIN = ['#f1c27d', '#c68642', '#8d5524'];

function Kid({ x, y, shirt = '#e4572e', skin = 0, arm = 'down', s = 1 }: { x: number; y: number; shirt?: string; skin?: number; arm?: 'down' | 'up' | 'out'; s?: number }) {
  const armY = arm === 'up' ? -22 : arm === 'out' ? -8 : 2;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke={INK} strokeWidth={2} strokeLinecap="round">
      <line x1={-5} y1={0} x2={-7} y2={16} />
      <line x1={5} y1={0} x2={7} y2={16} />
      <line x1={-8} y1={-16} x2={-17} y2={-16 + armY} />
      <line x1={8} y1={-16} x2={17} y2={-16 + armY} />
      <rect x={-9} y={-22} width={18} height={24} rx={6} fill={shirt} />
      <circle cx={0} cy={-31} r={9} fill={SKIN[skin]} />
      <circle cx={-3} cy={-32} r={1} fill={INK} stroke="none" />
      <circle cx={3} cy={-32} r={1} fill={INK} stroke="none" />
      <path d="M -3 -27 Q 0 -25 3 -27" fill="none" strokeWidth={1.5} />
    </g>
  );
}

function Dog({ x, y, s = 1, color = '#b5835a' }: { x: number; y: number; s?: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} stroke={INK} strokeWidth={2}>
      <line x1={-10} y1={4} x2={-10} y2={14} />
      <line x1={8} y1={4} x2={8} y2={14} />
      <ellipse cx={0} cy={2} rx={16} ry={9} fill={color} />
      <path d="M -16 -2 q -6 -8 -2 -12" fill="none" />
      <circle cx={16} cy={-6} r={8} fill={color} />
      <ellipse cx={20} cy={-12} rx={3} ry={6} fill="#7a5233" />
      <circle cx={18} cy={-7} r={1.2} fill={INK} stroke="none" />
      <circle cx={24} cy={-4} r={1.6} fill={INK} stroke="none" />
    </g>
  );
}

const Sun = ({ x = 135, y = 22 }: { x?: number; y?: number }) => <circle cx={x} cy={y} r={11} fill="#ffcf3f" stroke="#e8a900" strokeWidth={2} />;
const Cloud = ({ x, y }: { x: number; y: number }) => (
  <g fill="#ffffff" stroke="#c8d3e0" strokeWidth={1.5}>
    <ellipse cx={x} cy={y} rx={16} ry={8} />
    <ellipse cx={x + 12} cy={y - 4} rx={10} ry={7} />
  </g>
);
const Ground = ({ color = '#7cc36b', y = 92 }: { color?: string; y?: number }) => <rect x={0} y={y} width={160} height={120 - y} fill={color} />;
const Sky = ({ color = '#d8efff' }: { color?: string }) => <rect x={0} y={0} width={160} height={120} fill={color} />;
const Tree = ({ x, y = 92, s = 1, leaves = '#3f9b4b' }: { x: number; y?: number; s?: number; leaves?: string }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke={INK} strokeWidth={2}>
    <rect x={-5} y={-38} width={10} height={38} fill="#8b5a2b" />
    <circle cx={0} cy={-50} r={22} fill={leaves} />
  </g>
);
const Flower = ({ x, y, h = 30, petal = '#ffd23f' }: { x: number; y: number; h?: number; petal?: string }) => (
  <g stroke={INK} strokeWidth={2}>
    <line x1={x} y1={y} x2={x} y2={y - h} stroke="#3f9b4b" strokeWidth={3} />
    <path d={`M ${x} ${y - h / 2} q 10 -6 14 2`} fill="#7cc36b" stroke="#3f9b4b" />
    {[0, 72, 144, 216, 288].map((a) => (
      <ellipse key={a} cx={x} cy={y - h - 7} rx={4} ry={7} fill={petal} transform={`rotate(${a} ${x} ${y - h})`} />
    ))}
    <circle cx={x} cy={y - h} r={4} fill="#e4572e" />
  </g>
);
const Mitten = ({ x, y, r = 0 }: { x: number; y: number; r?: number }) => (
  <g transform={`translate(${x} ${y}) rotate(${r})`} stroke={INK} strokeWidth={2} fill="#e23d3d">
    <path d="M -6 8 L -6 -6 Q -6 -12 0 -12 Q 6 -12 6 -6 L 6 8 Z" />
    <path d="M -6 -1 Q -12 -3 -10 -8 Q -8 -10 -6 -6" />
    <rect x={-7} y={6} width={14} height={4} fill="#ffffff" />
  </g>
);
const Snow = () => (
  <g fill="#ffffff">
    <rect x={0} y={90} width={160} height={30} fill="#f4f8fc" />
    {[[20, 18], [55, 30], [90, 12], [120, 40], [145, 25], [35, 55], [75, 60], [130, 70]].map(([x, y]) => (
      <circle key={`${x}-${y}`} cx={x} cy={y} r={2.2} stroke="#c8d3e0" strokeWidth={0.8} />
    ))}
  </g>
);
const Window = ({ rain = true }: { rain?: boolean }) => (
  <g>
    <rect x={100} y={10} width={50} height={40} fill="#9fb8cc" stroke={INK} strokeWidth={2} />
    <line x1={125} y1={10} x2={125} y2={50} stroke={INK} strokeWidth={2} />
    {rain && [[106, 16], [116, 30], [132, 18], [142, 34], [110, 40], [136, 42]].map(([x, y]) => <line key={`${x}-${y}`} x1={x} y1={y} x2={x - 2} y2={y + 6} stroke="#3d6fb6" strokeWidth={2} strokeLinecap="round" />)}
  </g>
);
const Floor = () => <rect x={0} y={92} width={160} height={28} fill="#e6cfa7" />;
const Wall = () => <rect x={0} y={0} width={160} height={120} fill="#fdf3e1" />;
const Water = ({ y = 70 }: { y?: number }) => <rect x={0} y={y} width={160} height={120 - y} fill="#7cc3e8" />;

const PANELS: Record<string, ReactNode[]> = {
  playground: [
    <g key="1"><Sky /><Ground /><Sun />
      <g stroke={INK} strokeWidth={2}><line x1={50} y1={92} x2={50} y2={30} /><line x1={60} y1={92} x2={60} y2={30} />{[40, 55, 70, 85].map((y) => <line key={y} x1={50} y1={y} x2={60} y2={y} />)}<path d="M 60 30 L 120 92" stroke="#e4572e" strokeWidth={6} /></g>
      <Kid x={58} y={44} s={0.7} shirt="#3d6fb6" arm="up" /></g>,
    <g key="2"><Sky /><Ground /><Cloud x={30} y={22} />
      <g stroke={INK} strokeWidth={2.5}><path d="M 25 92 L 45 25 L 115 25 L 135 92" fill="none" stroke="#8b5a2b" strokeWidth={4} /><line x1={60} y1={25} x2={55} y2={70} /><line x1={74} y1={25} x2={79} y2={70} /><line x1={96} y1={25} x2={96} y2={74} /><line x1={110} y1={25} x2={110} y2={74} /></g>
      <rect x={52} y={68} width={30} height={5} fill="#e4572e" stroke={INK} /><rect x={92} y={72} width={22} height={5} fill="#3d6fb6" stroke={INK} />
      <Kid x={67} y={70} s={0.7} shirt="#ffcf3f" arm="up" skin={1} /></g>,
    <g key="3"><Sky /><Ground /><Sun x={25} />
      <rect x={30} y={76} width={100} height={30} fill="#f2d48f" stroke="#8b5a2b" strokeWidth={4} rx={3} />
      <path d="M 70 92 L 74 76 L 90 76 L 94 92 Z" fill="#3d6fb6" stroke={INK} strokeWidth={2} /><path d="M 76 76 Q 82 66 88 76" fill="none" stroke={INK} strokeWidth={2} />
      <line x1={108} y1={70} x2={112} y2={92} stroke={INK} strokeWidth={3} /><path d="M 104 92 L 118 92 L 114 98 L 108 98 Z" fill="#e4572e" stroke={INK} strokeWidth={2} /></g>,
  ],
  'lost-mitten': [
    <g key="1"><Sky color="#e3ecf5" /><Snow /><Tree x={130} leaves="#2f7a3b" />
      <Kid x={60} y={88} shirt="#3d6fb6" /><Mitten x={78} y={100} r={30} /></g>,
    <g key="2"><Sky color="#e3ecf5" /><Snow /><Mitten x={95} y={100} r={30} /><Dog x={70} y={98} /></g>,
    <g key="3"><Sky color="#e3ecf5" /><Snow /><Kid x={55} y={88} shirt="#3d6fb6" arm="out" /><Dog x={95} y={98} /><Mitten x={118} y={88} r={-10} /></g>,
  ],
  'seed-growing': [
    <g key="1"><Sky /><Ground color="#8b5a2b" y={80} /><Sun />
      <ellipse cx={80} cy={95} rx={6} ry={4} fill="#c9a26b" stroke={INK} strokeWidth={2} />
      <g transform="rotate(-30 50 50)"><rect x={30} y={40} width={30} height={18} rx={4} fill="#3d6fb6" stroke={INK} strokeWidth={2} /><line x1={60} y1={46} x2={74} y2={46} stroke={INK} strokeWidth={3} /></g>
      {[[70, 66], [76, 72], [82, 66]].map(([x, y]) => <line key={x} x1={x} y1={y} x2={x} y2={y + 6} stroke="#3d6fb6" strokeWidth={2.5} strokeLinecap="round" />)}</g>,
    <g key="2"><Sky /><Ground color="#8b5a2b" y={80} /><Sun />
      <path d="M 80 80 L 80 62" stroke="#3f9b4b" strokeWidth={3} /><path d="M 80 66 q -12 -6 -14 -14 q 10 0 14 10" fill="#7cc36b" stroke="#3f9b4b" strokeWidth={2} /><path d="M 80 64 q 12 -6 14 -14 q -10 0 -14 10" fill="#7cc36b" stroke="#3f9b4b" strokeWidth={2} /></g>,
    <g key="3"><Sky /><Ground color="#8b5a2b" y={80} /><Sun /><Flower x={80} y={80} h={45} /></g>,
  ],
  'making-sandwich': [
    <g key="1"><Wall /><rect x={0} y={80} width={160} height={40} fill="#c8a27a" />
      {[45, 100].map((x) => <rect key={x} x={x - 22} y={50} width={44} height={40} rx={10} fill="#f5d9a8" stroke="#b07a3c" strokeWidth={4} />)}</g>,
    <g key="2"><Wall /><rect x={0} y={80} width={160} height={40} fill="#c8a27a" />
      <rect x={30} y={50} width={44} height={40} rx={10} fill="#f5d9a8" stroke="#b07a3c" strokeWidth={4} /><rect x={36} y={56} width={32} height={28} rx={6} fill="#b8264f" />
      <rect x={100} y={48} width={26} height={34} rx={4} fill="#b8264f" stroke={INK} strokeWidth={2} /><rect x={98} y={42} width={30} height={8} fill="#e8e8e8" stroke={INK} strokeWidth={2} />
      <line x1={62} y1={40} x2={88} y2={20} stroke="#9aa3ad" strokeWidth={5} strokeLinecap="round" /></g>,
    <g key="3"><Wall /><rect x={0} y={80} width={160} height={40} fill="#c8a27a" /><ellipse cx={80} cy={92} rx={52} ry={10} fill="#ffffff" stroke={INK} strokeWidth={2} />
      <path d="M 40 88 L 76 52 L 76 88 Z" fill="#f5d9a8" stroke="#b07a3c" strokeWidth={4} /><path d="M 86 88 L 86 52 L 122 88 Z" fill="#f5d9a8" stroke="#b07a3c" strokeWidth={4} />
      <line x1={76} y1={56} x2={76} y2={86} stroke="#b8264f" strokeWidth={4} /><line x1={86} y1={56} x2={86} y2={86} stroke="#b8264f" strokeWidth={4} /></g>,
  ],
  'fruit-choice': [
    <g key="1"><Wall /><circle cx={80} cy={68} r={28} fill="#e23d3d" stroke={INK} strokeWidth={2} /><path d="M 80 40 q 2 -10 8 -14" fill="none" stroke="#8b5a2b" strokeWidth={3} /><path d="M 84 34 q 12 -8 18 0 q -10 6 -18 0" fill="#3f9b4b" /></g>,
    <g key="2"><Wall /><path d="M 40 50 Q 60 100 120 70 Q 126 64 122 60 Q 70 82 50 44 Z" fill="#ffd23f" stroke={INK} strokeWidth={2} /><line x1={46} y1={47} x2={42} y2={40} stroke="#6b4e16" strokeWidth={4} /></g>,
    <g key="3"><Wall /><line x1={80} y1={30} x2={80} y2={40} stroke="#3f9b4b" strokeWidth={3} />
      {[[70, 46], [90, 46], [60, 60], [80, 60], [100, 60], [70, 74], [90, 74], [80, 88]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r={9} fill="#7b3fa0" stroke={INK} strokeWidth={1.5} />)}</g>,
  ],
  seasons: [
    <g key="1"><Sky /><Water y={60} /><rect x={0} y={88} width={160} height={32} fill="#f2d48f" /><Sun x={30} y={25} />
      <line x1={110} y1={95} x2={110} y2={45} stroke={INK} strokeWidth={2} /><path d="M 82 52 Q 110 25 138 52 Z" fill="#e4572e" stroke={INK} strokeWidth={2} /><Kid x={70} y={100} s={0.8} shirt="#ffcf3f" arm="up" skin={2} /></g>,
    <g key="2"><Sky color="#f6e7c8" /><Ground color="#c99a4a" /><Tree x={45} leaves="#e07b2a" /><Tree x={115} leaves="#d1492a" s={0.8} />
      {[[70, 50], [85, 70], [95, 40], [140, 30], [20, 75]].map(([x, y]) => <ellipse key={`${x}${y}`} cx={x} cy={y} rx={4} ry={2.5} fill="#e07b2a" transform={`rotate(30 ${x} ${y})`} />)}</g>,
    <g key="3"><Sky color="#e3ecf5" /><Snow /><g stroke={INK} strokeWidth={2} fill="#ffffff"><circle cx={80} cy={86} r={16} /><circle cx={80} cy={60} r={11} /></g><path d="M 80 60 l 9 2 l -9 2 z" fill="#f08a24" /><rect x={71} y={44} width={18} height={6} fill={INK} /><rect x={74} y={34} width={12} height={11} fill={INK} /></g>,
  ],
  'rainy-day': [
    <g key="1"><Wall /><Window /><Floor />
      {[[40, 82], [56, 82], [72, 82], [48, 66], [64, 66], [56, 50]].map(([x, y], i) => <rect key={i} x={x - 8} y={y} width={16} height={16} fill={['#e4572e', '#3d6fb6', '#ffcf3f', '#3f9b4b', '#7b3fa0', '#e4572e'][i]} stroke={INK} strokeWidth={2} />)}<Kid x={96} y={98} s={0.8} arm="out" /></g>,
    <g key="2"><Wall /><Window /><Floor /><g stroke={INK} strokeWidth={2}><line x1={40} y1={100} x2={55} y2={40} /><line x1={80} y1={100} x2={65} y2={40} /><rect x={36} y={40} width={48} height={40} fill="#ffffff" /></g>
      <circle cx={50} cy={58} r={7} fill="#3d6fb6" /><path d="M 60 70 q 8 -14 18 -4" stroke="#e4572e" strokeWidth={4} fill="none" /><Kid x={100} y={98} s={0.8} arm="out" skin={1} shirt="#3f9b4b" /></g>,
    <g key="3"><Wall /><Window /><Floor /><ellipse cx={70} cy={100} rx={34} ry={10} fill="#e4572e" stroke={INK} strokeWidth={2} /><Kid x={70} y={95} s={0.8} arm="out" skin={2} shirt="#ffcf3f" />
      <path d="M 54 74 L 70 78 L 86 74 L 86 90 L 70 94 L 54 90 Z" fill="#3d6fb6" stroke={INK} strokeWidth={2} /></g>,
  ],
  'pet-choice': [
    <g key="1"><Wall /><rect x={0} y={96} width={160} height={24} fill="#c8a27a" /><ellipse cx={80} cy={70} rx={36} ry={30} fill="#bfe6f7" stroke={INK} strokeWidth={2} />
      <ellipse cx={78} cy={72} rx={12} ry={8} fill="#f08a24" stroke={INK} strokeWidth={1.5} /><path d="M 90 72 l 10 -7 l 0 14 z" fill="#f08a24" stroke={INK} strokeWidth={1.5} /><circle cx={73} cy={70} r={1.5} fill={INK} /></g>,
    <g key="2"><Wall /><rect x={0} y={96} width={160} height={24} fill="#c8a27a" /><ellipse cx={80} cy={86} rx={34} ry={14} fill="#9aa3ad" stroke={INK} strokeWidth={2} /><circle cx={52} cy={80} r={12} fill="#9aa3ad" stroke={INK} strokeWidth={2} />
      <path d="M 44 72 l 2 -10 l 6 7 M 60 72 l -2 -10 l -6 7" fill="#9aa3ad" stroke={INK} strokeWidth={2} /><path d="M 48 80 q 2 2 4 0 M 54 80 q 2 2 4 0" stroke={INK} fill="none" strokeWidth={1.5} /><path d="M 112 86 q 14 -2 12 -18" stroke={INK} strokeWidth={4} fill="none" /></g>,
    <g key="3"><Sky /><Ground /><Dog x={70} y={86} s={1.2} color="#e8c39e" /><circle cx={118} cy={96} r={8} fill="#e23d3d" stroke={INK} strokeWidth={2} /></g>,
  ],
  'frog-life': [
    <g key="1"><Water y={0} />{[[60, 60], [72, 54], [84, 62], [70, 70], [90, 50], [96, 66], [80, 76]].map(([x, y]) => <g key={`${x}${y}`}><circle cx={x} cy={y} r={7} fill="#e9f3e3" stroke="#6f9a63" strokeWidth={1.5} /><circle cx={x} cy={y} r={2.5} fill={INK} /></g>)}</g>,
    <g key="2"><Water y={0} /><ellipse cx={70} cy={60} rx={14} ry={10} fill="#4b5d3a" stroke={INK} strokeWidth={2} /><path d="M 84 60 q 20 -10 34 6 q -16 -2 -34 0" fill="#4b5d3a" stroke={INK} strokeWidth={2} /><circle cx={64} cy={56} r={2} fill="#ffffff" /></g>,
    <g key="3"><Water y={0} /><ellipse cx={80} cy={86} rx={44} ry={14} fill="#3f9b4b" stroke={INK} strokeWidth={2} />
      <ellipse cx={80} cy={70} rx={20} ry={13} fill="#6cc04a" stroke={INK} strokeWidth={2} /><circle cx={70} cy={57} r={6} fill="#6cc04a" stroke={INK} strokeWidth={2} /><circle cx={90} cy={57} r={6} fill="#6cc04a" stroke={INK} strokeWidth={2} /><circle cx={70} cy={57} r={2} fill={INK} /><circle cx={90} cy={57} r={2} fill={INK} /><path d="M 72 72 q 8 5 16 0" stroke={INK} fill="none" strokeWidth={2} /></g>,
  ],
  'brush-teeth': [
    <g key="1"><Wall /><rect x={30} y={54} width={80} height={10} rx={4} fill="#3d6fb6" stroke={INK} strokeWidth={2} /><rect x={100} y={44} width={16} height={12} rx={3} fill="#ffffff" stroke={INK} strokeWidth={2} />
      <path d="M 104 44 q 6 -10 -6 -14" stroke="#7cc3e8" strokeWidth={6} fill="none" strokeLinecap="round" /><rect x={30} y={78} width={70} height={18} rx={6} fill="#ffffff" stroke={INK} strokeWidth={2} /><rect x={94} y={82} width={16} height={10} fill="#e23d3d" stroke={INK} strokeWidth={2} /></g>,
    <g key="2"><Wall /><Kid x={80} y={100} s={1.5} shirt="#7b3fa0" skin={1} arm="out" /><rect x={92} y={50} width={30} height={5} rx={2} fill="#3d6fb6" stroke={INK} strokeWidth={1.5} /><rect x={88} y={47} width={6} height={9} fill="#ffffff" stroke={INK} strokeWidth={1.5} /></g>,
    <g key="3"><Wall /><Kid x={70} y={100} s={1.5} shirt="#7b3fa0" skin={1} arm="out" /><path d="M 92 54 L 108 54 L 105 78 L 95 78 Z" fill="#bfe6f7" stroke={INK} strokeWidth={2} /></g>,
  ],
  'block-tower': [
    <g key="1"><Wall /><Floor />{[0, 1, 2, 3, 4].map((i) => <rect key={i} x={52} y={78 - i * 14} width={22} height={14} fill={['#e4572e', '#3d6fb6', '#ffcf3f', '#3f9b4b', '#7b3fa0'][i]} stroke={INK} strokeWidth={2} />)}<Kid x={105} y={98} s={0.9} arm="up" /></g>,
    <g key="2"><Wall /><Floor />{[[40, 96, 20], [62, 100, -10], [84, 94, 35], [56, 84, 5], [100, 102, -25]].map(([x, y, r], i) => <rect key={i} x={x} y={y} width={18} height={12} fill={['#e4572e', '#3d6fb6', '#ffcf3f', '#3f9b4b', '#7b3fa0'][i]} stroke={INK} strokeWidth={2} transform={`rotate(${r} ${x} ${y})`} />)}<Kid x={130} y={98} s={0.9} /></g>,
    <g key="3"><Wall /><Floor />{[0, 1, 2, 3, 4].map((i) => <rect key={i} x={70} y={78 - i * 14} width={22} height={14} fill={['#e4572e', '#3d6fb6', '#ffcf3f', '#3f9b4b', '#7b3fa0'][i]} stroke={INK} strokeWidth={2} />)}<Kid x={45} y={98} s={0.9} arm="out" /><Kid x={118} y={98} s={0.9} arm="out" shirt="#3f9b4b" skin={2} /></g>,
  ],
  'kite-day': [
    <g key="1"><Sky /><Ground /><Cloud x={25} y={20} /><path d="M 110 22 l 14 14 l -14 14 l -14 -14 z" fill="#e4572e" stroke={INK} strokeWidth={2} /><path d="M 110 50 q 8 10 0 20 q -8 10 0 18" stroke={INK} fill="none" /><line x1={110} y1={50} x2={58} y2={66} stroke={INK} /><Kid x={50} y={88} arm="up" skin={2} /></g>,
    <g key="2"><Sky /><Ground /><Tree x={90} s={1.3} /><path d="M 98 30 l 12 12 l -12 12 l -12 -12 z" fill="#e4572e" stroke={INK} strokeWidth={2} /><Kid x={40} y={88} arm="up" skin={2} /></g>,
    <g key="3"><Sky /><Ground /><Tree x={130} s={0.9} /><Kid x={45} y={88} arm="up" skin={2} /><Kid x={80} y={88} s={1.3} shirt="#3d6fb6" arm="out" /><path d="M 60 18 l 12 12 l -12 12 l -12 -12 z" fill="#e4572e" stroke={INK} strokeWidth={2} /><line x1={60} y1={42} x2={36} y2={66} stroke={INK} /></g>,
  ],
  'puppy-bath': [
    <g key="1"><Sky /><Ground /><ellipse cx={80} cy={100} rx={40} ry={10} fill="#7a5233" /><Dog x={78} y={88} color="#e8c39e" />{[[50, 76], [108, 74], [96, 66]].map(([x, y]) => <circle key={x} cx={x} cy={y} r={3} fill="#7a5233" />)}</g>,
    <g key="2"><Wall /><path d="M 30 70 L 130 70 L 122 104 L 38 104 Z" fill="#ffffff" stroke={INK} strokeWidth={2} /><Dog x={80} y={64} color="#e8c39e" />
      {[[44, 66], [56, 62], [104, 64], [118, 66], [70, 60], [90, 58]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r={6} fill="#e7f6ff" stroke="#7cc3e8" strokeWidth={1.5} />)}</g>,
    <g key="3"><Wall /><Floor /><Dog x={60} y={92} color="#e8c39e" />{[[40, 70], [36, 82], [84, 70], [90, 82], [62, 66]].map(([x, y]) => <line key={`${x}${y}`} x1={x} y1={y} x2={x + (x < 60 ? -6 : 6)} y2={y - 4} stroke="#3d6fb6" strokeWidth={2.5} strokeLinecap="round" />)}<Kid x={120} y={98} arm="up" skin={1} /></g>,
  ],
  'bird-nest': [
    <g key="1"><Sky /><Cloud x={40} y={28} /><g transform="translate(90 60)" stroke={INK} strokeWidth={2}><ellipse cx={0} cy={0} rx={16} ry={10} fill="#5b8bd6" /><circle cx={14} cy={-8} r={7} fill="#5b8bd6" /><path d="M 20 -8 l 7 2 l -7 2 z" fill="#f0a020" /><path d="M -6 -4 q -10 -14 -20 -6" fill="#3d6fb6" /></g><line x1={112} y1={54} x2={140} y2={44} stroke="#8b5a2b" strokeWidth={3} /></g>,
    <g key="2"><Sky /><path d="M 0 80 Q 80 60 160 76" stroke="#8b5a2b" strokeWidth={8} fill="none" /><ellipse cx={80} cy={66} rx={30} ry={12} fill="#a67c52" stroke={INK} strokeWidth={2} />{[-20, -8, 4, 16].map((d) => <line key={d} x1={80 + d - 6} y1={60} x2={80 + d + 8} y2={72} stroke="#6b4a2b" strokeWidth={2} />)}</g>,
    <g key="3"><Sky /><path d="M 0 80 Q 80 60 160 76" stroke="#8b5a2b" strokeWidth={8} fill="none" /><ellipse cx={80} cy={66} rx={30} ry={12} fill="#a67c52" stroke={INK} strokeWidth={2} />{[68, 80, 92].map((x) => <ellipse key={x} cx={x} cy={58} rx={6} ry={8} fill="#cfe8f5" stroke={INK} strokeWidth={1.5} />)}</g>,
  ],
};

function panelLabels(description: string): string[] {
  const parts = description.split(/\s?\d\)\s/).slice(1).map((p) => p.replace(/[;,.]\s*$/, '').trim());
  return parts.length === 3 ? parts : [description, description, description];
}

export default function PictureSet({ id, description, compact = false }: { id: string; description: string; compact?: boolean }) {
  const panels = PANELS[id];
  if (!panels) return null;
  const labels = panelLabels(description);
  return (
    <ol className="lw-pictures" data-compact={compact || undefined} aria-label="Pictures for this task">
      {panels.map((panel, i) => (
        <li key={i}>
          <svg viewBox="0 0 160 120" role="img" aria-label={`Picture ${i + 1}: ${labels[i]}`}>
            {panel}
          </svg>
          <span className="lw-picture-num" aria-hidden="true">{i + 1}</span>
        </li>
      ))}
    </ol>
  );
}
