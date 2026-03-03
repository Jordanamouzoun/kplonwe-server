import { Link } from 'react-router-dom';
import { GraduationCap, School, Compass } from 'lucide-react';
import type { Child } from '@/types';

interface ChildCardProps { child: Child; }

export function ChildCard({ child }: ChildCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md" style={{ border:'1px solid #f1f5f9' }}>
      <div className="flex items-start gap-4" style={{ marginBottom:18 }}>
        <div className="flex-shrink-0 w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center">
          <span className="text-xl font-bold text-primary-600">
            {child.firstName[0]}{child.lastName[0]}
          </span>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900">{child.firstName} {child.lastName}</h3>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
            {child.level && (
              <div className="flex items-center gap-1"><GraduationCap size={14}/><span>{child.level}</span></div>
            )}
            {child.school && (
              <div className="flex items-center gap-1"><School size={14}/><span>{child.school}</span></div>
            )}
          </div>
        </div>
      </div>

      <Link to={`/orientation/${child.id}`} style={{ textDecoration:'none' }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',background:'linear-gradient(135deg,#0a0f1e,#1e3a8a)',borderRadius:10,padding:'11px 15px',cursor:'pointer',transition:'opacity .2s' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity='0.85'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity='1'}
        >
          <div style={{ display:'flex',alignItems:'center',gap:9 }}>
            <Compass size={16} color="#f59e0b"/>
            <span style={{ color:'white',fontWeight:600,fontSize:'0.85rem' }}>Voir l'orientation de {child.firstName}</span>
          </div>
          <span style={{ background:'rgba(245,158,11,0.15)',color:'#f59e0b',fontSize:9,fontWeight:700,padding:'2px 7px',borderRadius:100 }}>NOUVEAU</span>
        </div>
      </Link>
    </div>
  );
}
