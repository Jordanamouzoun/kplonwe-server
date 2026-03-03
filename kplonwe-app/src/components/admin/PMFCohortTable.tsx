import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import {
    TrendingUp, Target, RefreshCw,
    BarChart2, ChevronRight, Info
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from 'recharts';

interface Cohort {
    weekKey: string;       // "2025-12-30" (lundi ISO)
    totalParents: number;
    weekColumns: (number | null)[]; // [pct_S0, ..., pct_S8]
}

interface PMFData {
    cohorts: Cohort[];
    maxWeeks: number;      // 8
    pmfTarget: number;     // 70
    pmfWeekWindow: number; // 5 (S+5 = 6ème semaine)
}

function formatWeekLabel(weekKey: string): string {
    const date = new Date(weekKey + 'T00:00:00Z');
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit', timeZone: 'UTC' });
}

function cellColor(pct: number | null, target: number, isPmfWeek: boolean): string {
    if (pct === null) return 'bg-gray-50 text-gray-400';
    if (isPmfWeek) {
        if (pct >= target) return 'bg-emerald-500 text-white font-bold ring-2 ring-emerald-600 ring-offset-1';
        if (pct >= target * 0.7) return 'bg-amber-400 text-white font-bold';
        return 'bg-rose-500 text-white font-bold';
    }
    if (pct >= target) return 'bg-emerald-100 text-emerald-800 font-semibold';
    if (pct >= target * 0.7) return 'bg-amber-50 text-amber-700';
    if (pct > 0) return 'bg-rose-50 text-rose-600';
    return 'bg-gray-50 text-gray-400';
}

export function PMFCohortTable() {
    const [data, setData] = useState<PMFData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

    useEffect(() => { load(); }, []);

    async function load() {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/admin/pmf-cohorts');
            setData(res.data.data);
            setLastRefresh(new Date());
        } catch {
            setError('Impossible de charger les données PMF');
        } finally {
            setLoading(false);
        }
    }

    // ── Préparation des données pour le graphique ──────────────────────────────
    const chartData = (() => {
        if (!data || data.cohorts.length === 0) return [];

        const maxWeeks = data.maxWeeks;
        const items = [];

        for (let w = 0; w <= maxWeeks; w++) {
            const entry: any = { name: `S+${w}` };
            let sum = 0;
            let count = 0;

            data.cohorts.forEach((cohort) => {
                const val = cohort.weekColumns[w];
                if (val !== null) {
                    entry[formatWeekLabel(cohort.weekKey)] = val;
                    sum += val;
                    count++;
                }
            });

            if (count > 0) {
                entry.Moyenne = Math.round(sum / count);
            }
            items.push(entry);
        }
        return items;
    })();

    const colors = [
        '#4f46e5', '#10b981', '#f59e0b', '#ef4444',
        '#8b5cf6', '#06b6d4', '#ec4899', '#71717a'
    ];

    return (
        <section className="mt-10 space-y-6" aria-labelledby="pmf-section-heading">
            <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
                <div className="space-y-1">
                    <h2
                        id="pmf-section-heading"
                        className="text-xl font-extrabold text-gray-900 flex items-center gap-2"
                    >
                        <BarChart2 size={24} className="text-indigo-600" />
                        Analyse PMF & Rétention par Cohortes
                    </h2>
                    <p className="text-sm text-gray-500">
                        Objectif : <span className="font-bold text-gray-700">{data?.pmfTarget ?? 70}%</span> de conversion dès la <span className="font-bold text-gray-700">1ère semaine</span> (S+0).
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold uppercase tracking-wider">
                        <Target size={14} />
                        KPI : 70% @ S+0
                    </span>
                    <button
                        onClick={load}
                        disabled={loading}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 shadow-sm transition-all active:scale-95"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        Actualiser
                    </button>
                </div>
            </div>

            {!loading && !error && data && data.cohorts.length > 0 && (
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-700 mb-6 flex items-center gap-2">
                        <TrendingUp size={16} className="text-indigo-500" />
                        Courbe de conversion cumulée
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    unit="%"
                                    domain={[0, 100]}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                />
                                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />

                                <ReferenceLine
                                    y={data.pmfTarget}
                                    stroke="#ef4444"
                                    strokeDasharray="5 5"
                                    label={{ value: 'Cible PMF', position: 'insideRight', fill: '#ef4444', fontSize: 10, fontWeight: 'bold' }}
                                />

                                <Line
                                    type="monotone"
                                    dataKey="Moyenne"
                                    stroke="#4f46e5"
                                    strokeWidth={4}
                                    dot={{ r: 6, fill: '#4f46e5', strokeWidth: 0 }}
                                    activeDot={{ r: 8, strokeWidth: 0 }}
                                />

                                {data.cohorts.map((cohort, idx) => (
                                    <Line
                                        key={cohort.weekKey}
                                        type="monotone"
                                        dataKey={formatWeekLabel(cohort.weekKey)}
                                        stroke={colors[idx % colors.length]}
                                        strokeWidth={1}
                                        strokeOpacity={0.4}
                                        dot={false}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {data && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                        <p className="text-xs font-medium text-gray-500 mb-1">Total Parents</p>
                        <p className="text-2xl font-black text-gray-900">{data.cohorts.reduce((s, c) => s + c.totalParents, 0)}</p>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                        <p className="text-xs font-medium text-gray-500 mb-1">Fenêtre PMF</p>
                        <p className="text-2xl font-black text-indigo-600">1 Semaine</p>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                        <p className="text-xs font-medium text-gray-500 mb-1">Cohortes</p>
                        <p className="text-2xl font-black text-gray-900">{data.cohorts.length}</p>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 shadow-sm">
                        <p className="text-xs font-medium text-emerald-600 mb-1">Status</p>
                        <p className="text-lg font-black text-emerald-700 flex items-center gap-1">
                            Live Tracker <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                        </p>
                    </div>
                </div>
            )}

            {loading && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                    <RefreshCw size={32} className="animate-spin mx-auto mb-4 text-indigo-500" />
                    <p className="text-gray-500 font-medium">Analyse des cohortes en cours...</p>
                </div>
            )}

            {error && !loading && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-600 flex items-center gap-3">
                    <Info size={24} />
                    <p className="font-medium">{error}</p>
                </div>
            )}

            {!loading && !error && data && data.cohorts.length > 0 && (
                <>
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h3 className="text-sm font-bold text-gray-700">Matrice de conversion S+0 à S+8</h3>
                            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Atteint</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> En cours</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> Risque</span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="bg-white text-gray-400 text-[11px] font-bold uppercase tracking-wider">
                                        <th className="px-6 py-4 text-left font-bold text-gray-500 sticky left-0 bg-white z-10 border-r border-gray-50">
                                            Cohorte
                                        </th>
                                        <th className="px-6 py-4 text-center">Taille</th>
                                        {Array.from({ length: 9 }).map((_, i) => (
                                            <th key={i} className={`px-4 py-4 text-center min-w-[70px] ${i === data.pmfWeekWindow ? 'bg-indigo-50/50 text-indigo-600' : ''}`}>
                                                S+{i} {i === data.pmfWeekWindow && <Target size={10} className="inline ml-1 mb-0.5" />}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {data.cohorts.map((cohort) => (
                                        <tr key={cohort.weekKey} className="group hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-gray-900 sticky left-0 bg-white z-10 border-r border-gray-50 whitespace-nowrap group-hover:bg-gray-50/50">
                                                {formatWeekLabel(cohort.weekKey)}
                                            </td>
                                            <td className="px-6 py-4 text-center font-medium text-gray-400">
                                                {cohort.totalParents}
                                            </td>
                                            {Array.from({ length: 9 }).map((_, wi) => {
                                                const pct = cohort.weekColumns[wi];
                                                return (
                                                    <td key={wi} className="px-2 py-3 text-center">
                                                        <div className={`
                              w-12 h-8 mx-auto flex items-center justify-center rounded-lg text-xs transition-transform hover:scale-110
                              ${cellColor(pct, data.pmfTarget, wi === data.pmfWeekWindow)}
                            `}>
                                                            {pct !== null ? `${pct}%` : '—'}
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-indigo-900 text-indigo-100 p-6 rounded-2xl mt-4 flex items-start gap-4">
                        <div className="bg-indigo-800 p-2 rounded-lg">
                            <ChevronRight size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold mb-1">Lecture PMF</h4>
                            <p className="text-sm opacity-80 leading-relaxed">
                                La colonne <span className="underline font-bold">S+0</span> est le point de vérité pour notre plateforme.
                                Si une cohorte atteint <span className="font-black">70%</span> de conversion cumulée dès son inscription (cellule verte),
                                nous avons validé notre <span className="italic">Product Market Fit</span> pour ce groupe d'utilisateurs.
                            </p>
                        </div>
                    </div>
                    <p className="text-center text-[10px] text-gray-300 italic">Dernière actualisation : {lastRefresh.toLocaleTimeString()}</p>
                </>
            )}
        </section>
    );
}
