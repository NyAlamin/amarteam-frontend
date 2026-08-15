"use client";

import { useEffect, useState } from "react";
import { paymentsAPI } from "@/lib/api";
import Loading from "@/components/ui/loading";

const tk = (n: number) => `৳${Number(n || 0).toLocaleString()}`;

export default function EarningsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentsAPI.myEarnings()
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  const matches = data?.matches ?? [];
  const t = data?.totals ?? { earned: 0, received: 0, toCollect: 0 };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">My Earnings</h1>
        <p className="text-white/40 text-sm mt-1">
          Amounts appear once the hirer has paid their advance.
        </p>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-3 gap-3">
        <Total label="Total earned" value={tk(t.earned)} />
        <Total label="Received" value={tk(t.received)} accent="text-primary-400" />
        <Total label="To collect" value={tk(t.toCollect)} accent="text-yellow-400" />
      </div>

      {matches.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-4xl mb-3">💰</p>
          <p className="text-white/40 text-sm">No confirmed matches yet.</p>
          <p className="text-white/25 text-xs mt-1">
            Your fee shows here after the hirer confirms and pays the advance.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map((m: any) => (
            <div key={`${m.refType}-${m.refId}`} className="glass rounded-2xl p-4">

              {/* Header */}
              <div className="flex justify-between items-start gap-3 mb-3">
                <div className="min-w-0">
                  <p className="font-bold text-white text-sm truncate">
                    {m.tournament || "Match"}
                  </p>
                  <p className="text-xs text-white/40 mt-0.5">
                    {m.matchDate}{m.location ? ` • ${m.location}` : ""}
                  </p>
                  {m.hirerName && (
                    <p className="text-xs text-white/30 mt-0.5">Hirer: {m.hirerName}</p>
                  )}
                </div>
                {m.refType === "teamRequest" && (
                  <span className="bg-primary-900/40 text-primary-400 border border-primary-800 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0">
                    Team
                  </span>
                )}
              </div>

              {m.feeAssigned === false ? (
                <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-xl p-3">
                  <p className="text-yellow-400 text-xs font-semibold">
                    Your fee hasn't been set yet
                  </p>
                  <p className="text-white/40 text-[11px] mt-0.5">
                    Admin will confirm the amount shortly.
                  </p>
                </div>
              ) : (
                <>
                  {/* Money breakdown */}
                  <div className="bg-dark-card rounded-xl p-3 space-y-2 mb-3">
                    <Row label="Your fee" value={tk(m.fee)} />
                    <Row
                      label={`Platform commission (${m.commissionRate}%)`}
                      value={`− ${tk(m.commission)}`}
                      muted
                    />
                    <div className="border-t border-dark-border pt-2 flex justify-between items-center">
                      <span className="text-xs font-semibold text-white/70">You receive</span>
                      <span className="text-base font-bold text-primary-400">
                        {tk(m.youReceive)}
                      </span>
                    </div>
                  </div>

                  {/* Payment progress */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-primary-900/20 border border-primary-800/40 rounded-xl p-3">
                      <p className="text-[10px] text-white/40 mb-0.5">Already paid to you</p>
                      <p className="font-bold text-primary-400 text-sm">{tk(m.paidToYou)}</p>
                    </div>
                    <div className={`rounded-xl p-3 border ${
                      m.collectFromHirer > 0
                        ? "bg-yellow-900/20 border-yellow-800/40"
                        : "bg-dark-card border-dark-border"
                    }`}>
                      <p className="text-[10px] text-white/40 mb-0.5">Collect from hirer</p>
                      <p className={`font-bold text-sm ${
                        m.collectFromHirer > 0 ? "text-yellow-400" : "text-white/30"
                      }`}>
                        {tk(m.collectFromHirer)}
                      </p>
                    </div>
                  </div>

                  {m.collectFromHirer > 0 && (
                    <p className="text-[11px] text-white/30 mt-2">
                      Collect this from the hirer on match day
                      {m.hirerPhone ? " — " : "."}
                      {m.hirerPhone && (
                        <a href={`tel:${m.hirerPhone}`} className="text-primary-400 font-semibold">
                          {m.hirerPhone}
                        </a>
                      )}
                    </p>
                  )}
                </>
              )}

              {/* Teammates */}
              {m.teammates?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-dark-border">
                  <p className="text-[10px] text-white/40 mb-2">
                    Also going from Amar Team
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {m.teammates.map((p: any, i: number) => (
                      <span key={i}
                        className="bg-dark-card border border-dark-border rounded-full pl-1 pr-2.5 py-1 flex items-center gap-1.5">
                        {p.photo ? (
                          <img src={p.photo} alt="" className="w-5 h-5 rounded-full object-cover" />
                        ) : (
                          <span className="w-5 h-5 rounded-full bg-primary-900 flex items-center justify-center text-[9px] font-bold text-primary-400">
                            {p.name?.charAt(0) || "?"}
                          </span>
                        )}
                        <span className="text-[11px] text-white/70 font-medium">{p.name}</span>
                        {p.position && (
                          <span className="text-[9px] text-white/30">{p.position}</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Total({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="glass rounded-2xl p-3">
      <p className="text-[10px] text-white/40 mb-1">{label}</p>
      <p className={`font-bold text-sm sm:text-lg ${accent || "text-white"}`}>{value}</p>
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-white/50">{label}</span>
      <span className={`text-xs font-semibold ${muted ? "text-white/40" : "text-white"}`}>
        {value}
      </span>
    </div>
  );
}