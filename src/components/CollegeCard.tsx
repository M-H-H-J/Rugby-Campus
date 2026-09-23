import { Link } from 'wouter';
import type { College } from '@/data/colleges';
import { TIER_LABELS } from '@/data/colleges';

const tierDot: Record<string, string> = {
  championship: 'bg-gold',
  playoff: 'bg-navy',
  competitive: 'bg-faint',
};

export default function CollegeCard({ college, variant = 'tool' }: { college: College; variant?: 'tool' | 'editorial' }) {
  const topBadge = college.badges[0];
  const isToolCard = variant === 'tool';

  return (
    <Link href={`/colleges/${college.slug}`}>
      <article className={`group cursor-pointer ${isToolCard ? 'bg-white border border-line rounded-lg overflow-hidden' : ''}`}>
        <div className={`relative overflow-hidden aspect-[4/3] ${isToolCard ? '' : 'rounded-lg mb-4'} bg-[#eef1f5]`}>
          <img
            src={college.imageUrl}
            alt={`${college.name} campus`}
            loading="lazy"
            className="card-img w-full h-full object-cover"
          />
          {topBadge && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-dark/75 to-transparent pt-8 pb-3 px-4">
              <span className="text-white/95 text-[12px] font-medium">{topBadge}</span>
            </div>
          )}
        </div>

        <div className={isToolCard ? 'p-4' : ''}>
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-caps text-faint mb-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${tierDot[college.tier]}`} />
            {TIER_LABELS[college.tier]}
            <span className="normal-case tracking-normal font-normal text-faint">· {college.affiliation}</span>
          </p>
          <h3 className="font-heading text-[20px] leading-snug text-ink group-hover:text-navy transition-colors mb-1">
            {college.name}
          </h3>
          <p className="text-[13px] text-muted">
            {college.location} · {college.conference} · {college.programType}
            {college.draftPicks >= 2 && <span className="text-gold-dark font-medium"> · {college.draftPicks} MLR picks</span>}
          </p>
        </div>
      </article>
    </Link>
  );
}
