import { Link } from 'wouter';
import { MapPin, Users, Trophy } from 'lucide-react';
import type { College } from '@/data/colleges';
import { TIER_LABELS } from '@/data/colleges';

const tierStyles: Record<string, { bg: string; text: string; dot: string }> = {
  championship: { bg: 'bg-gold/15', text: 'text-gold-dark', dot: 'bg-gold' },
  playoff: { bg: 'bg-navy/8', text: 'text-navy', dot: 'bg-navy' },
  competitive: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
};

export default function CollegeCard({ college }: { college: College }) {
  const tier = tierStyles[college.tier] ?? tierStyles.competitive;
  const topBadge = college.badges[0];

  return (
    <Link href={`/colleges/${college.slug}`}>
      <article className="group cursor-pointer">
        {/* Photo */}
        <div className="relative rounded-2xl overflow-hidden aspect-[4/3] mb-3 bg-gray-100">
          <img
            src={college.imageUrl}
            alt={`${college.name} campus`}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
          {/* Affiliation chip */}
          <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-dark text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-sm">
            {college.affiliation}
          </span>
          {/* Championship badge */}
          {topBadge && (
            <span className="absolute bottom-3 left-3 right-3 inline-flex items-center gap-1.5 text-white text-[11px] font-semibold">
              <Trophy size={12} className="text-gold flex-shrink-0" />
              <span className="truncate">{topBadge}</span>
            </span>
          )}
        </div>

        {/* Body */}
        <div className="px-0.5">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-heading font-semibold text-[15px] text-dark leading-snug group-hover:text-navy transition-colors">
              {college.name}
            </h3>
          </div>
          <p className="flex items-center gap-1 text-xs text-gray-400 mb-2">
            <MapPin size={11} /> {college.location}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 ${tier.bg} ${tier.text} text-[11px] font-semibold px-2.5 py-1 rounded-lg`}>
              <span className={`w-1.5 h-1.5 rounded-full ${tier.dot}`} />
              {TIER_LABELS[college.tier]}
            </span>
            {college.draftPicks >= 2 && (
              <span className="text-[11px] text-gray-500 font-medium">{college.draftPicks} MLR picks</span>
            )}
          </div>
          <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-2.5 pt-2.5 border-t border-gray-50">
            <span className="flex items-center gap-1"><Users size={11} /> {(college.enrollment / 1000).toFixed(1)}k students</span>
            <span className="w-0.5 h-0.5 rounded-full bg-gray-300" />
            <span>{college.conference}</span>
            <span className="w-0.5 h-0.5 rounded-full bg-gray-300" />
            <span>{college.programType}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
