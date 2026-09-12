"use client";
import Link from "next/link";
import { FaceitTab } from "@/components/player/FaceitTab";
import { SkillGroupsTab } from "@/components/player/SkillGroupsTab";
import { getOfficialMapAsset, getOfficialFaceitBadge, OFFICIAL_SKILL_GROUPS } from "@/lib/cs2-assets";
import React, { useState, useEffect, useMemo } from "react";
import { 
  Activity, 
  Briefcase, 
  Users, 
  Trophy, 
  Gamepad2, 
  ShieldCheck, 
  ShieldAlert, 
  ExternalLink, 
  Info, 
  Award, 
  Loader2,
  Tag,
  Eye,
  Search,
  Swords,
  Crosshair,
  Medal,
  Package,
  Layers,
  Sparkles,
  Hand,
  Disc,
  Wrench,
  UserCheck,
  Flame,
  Target,
  Pin,
  Paintbrush
} from "lucide-react";

type TabKey = "overview" | "ranks" | "faceit" | "valve" | "inventory" | "friends";

function getRarityStyle(color?: string) {
  const hex = (color || "").replace("#", "").toLowerCase();
  
  if (hex === "ffd700" || hex === "e4ae39" || hex.includes("ffd")) {
    return {
      bar: "bg-[#ffd700]",
      border: "hover:border-[#ffd700]",
      glow: "hover:shadow-[0_0_16px_rgba(255,215,0,0.25)]",
      name: "text-[#ffd700]",
      label: "Extraordinary",
      bgGlow: "rgba(255, 215, 0, 0.08)",
    };
  }
  if (hex === "eb4b4b" || hex.includes("eb4")) {
    return {
      bar: "bg-[#eb4b4b]",
      border: "hover:border-[#eb4b4b]",
      glow: "hover:shadow-[0_0_16px_rgba(235,75,75,0.25)]",
      name: "text-[#eb4b4b]",
      label: "Covert",
      bgGlow: "rgba(235, 75, 75, 0.08)",
    };
  }
  if (hex === "d32ce6" || hex.includes("d32")) {
    return {
      bar: "bg-[#d32ce6]",
      border: "hover:border-[#d32ce6]",
      glow: "hover:shadow-[0_0_16px_rgba(211,44,230,0.25)]",
      name: "text-[#d32ce6]",
      label: "Classified",
      bgGlow: "rgba(211, 44, 230, 0.08)",
    };
  }
  if (hex === "8847ff" || hex.includes("884")) {
    return {
      bar: "bg-[#8847ff]",
      border: "hover:border-[#8847ff]",
      glow: "hover:shadow-[0_0_16px_rgba(136,71,255,0.25)]",
      name: "text-[#8847ff]",
      label: "Restricted",
      bgGlow: "rgba(136, 71, 255, 0.08)",
    };
  }
  if (hex === "4b69ff" || hex.includes("4b6")) {
    return {
      bar: "bg-[#4b69ff]",
      border: "hover:border-[#4b69ff]",
      glow: "hover:shadow-[0_0_16px_rgba(75,105,255,0.25)]",
      name: "text-[#5e7eff]",
      label: "Mil-Spec Grade",
      bgGlow: "rgba(75, 105, 255, 0.08)",
    };
  }
  if (hex === "5e98d9") {
    return {
      bar: "bg-[#5e98d9]",
      border: "hover:border-[#5e98d9]",
      glow: "hover:shadow-[0_0_16px_rgba(94,152,217,0.25)]",
      name: "text-[#5e98d9]",
      label: "Industrial Grade",
      bgGlow: "rgba(94, 152, 217, 0.08)",
    };
  }

  return {
    bar: "bg-[#b0c3d9]",
    border: "hover:border-[#b0c3d9]",
    glow: "",
    name: "text-[#b0c3d9]",
    label: "Consumer Grade",
    bgGlow: "rgba(176, 195, 217, 0.05)",
  };
}

export function DossierTabs({ data }: { data: any }) {
  const [activeTab, setActiveTab] = useState<TabKey>("inventory");

  const [invCategory, setInvCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [statTrakOnly, setStatTrakOnly] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const [friendFilter, setFriendFilter] = useState<"all" | "banned" | "clean">("all");

  const [friends, setFriends] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [combatStats, setCombatStats] = useState<any>(null);
  const [mapRanks, setMapRanks] = useState<any[]>([]);
  const [faceitIntel, setFaceitIntel] = useState<any>(null);
  const [loadingFaceit, setLoadingFaceit] = useState(false);
  
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [loadingRanks, setLoadingRanks] = useState(false);

  const steamId64 = data?.steam?.steamId64 || data?.steamId64 || "";

  useEffect(() => {
    if (!steamId64) return;
    fetch(`/api/player/stats?steamId64=${steamId64}`)
      .then((res) => res.json())
      .then((res) => {
        if (res && !res.error) setCombatStats(res);
      })
      .catch(() => {});
  }, [steamId64]);

  useEffect(() => {
    if (!steamId64 || activeTab !== "inventory" || inventory.length > 0) return;
    setLoadingInventory(true);
    fetch(`/api/inventory?steamId64=${steamId64}`)
      .then((res) => res.json())
      .then((res) => {
        const list = Array.isArray(res.items) ? res.items : Array.isArray(res) ? res : [];
        setInventory(list);
        if (list.length > 0 && !selectedItem) {
          setSelectedItem(list[0]);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingInventory(false));
  }, [activeTab, steamId64, inventory.length, selectedItem]);

  useEffect(() => {
    if (!steamId64 || activeTab !== "friends" || friends.length > 0) return;
    setLoadingFriends(true);
    fetch(`/api/friends?steamId64=${steamId64}`)
      .then((res) => res.json())
      .then((res) => {
        const list = Array.isArray(res.friends) ? res.friends : Array.isArray(res) ? res : [];
        setFriends(list);
      })
      .catch(() => {})
      .finally(() => setLoadingFriends(false));
  }, [activeTab, steamId64, friends.length]);

  useEffect(() => {
    if (!steamId64 || activeTab !== "faceit" || faceitIntel) return;
    setLoadingFaceit(true);
    fetch(`/api/faceit/intel?steamId64=${steamId64}`)
      .then((res) => res.json())
      .then((res) => {
        if (res && res.linked) setFaceitIntel(res);
      })
      .catch(() => {})
      .finally(() => setLoadingFaceit(false));
  }, [activeTab, steamId64, faceitIntel]);

  useEffect(() => {
    if (!steamId64 || activeTab !== "ranks" || mapRanks.length > 0) return;
    setLoadingRanks(true);
    fetch(`/api/gc/player-rank?steamId64=${steamId64}`)
      .then((res) => res.json())
      .then((res) => {
        const list = Array.isArray(res.ranks) ? res.ranks : Array.isArray(res) ? res : [];
        setMapRanks(list);
      })
      .catch(() => {})
      .finally(() => setLoadingRanks(false));
  }, [activeTab, steamId64, mapRanks.length]);

  useEffect(() => {
    if (!steamId64 || activeTab !== "valve" || matches.length > 0) return;
    setLoadingMatches(true);
    fetch(`/api/valve-history?steamId64=${steamId64}`)
      .then((res) => res.json())
      .then((res) => {
        const list = Array.isArray(res.matches) ? res.matches : Array.isArray(res) ? res : [];
        setMatches(list);
      })
      .catch(() => {})
      .finally(() => setLoadingMatches(false));
  }, [activeTab, steamId64, matches.length]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: inventory.length,
      knife: 0,
      gloves: 0,
      rifle: 0,
      sniper: 0,
      pistol: 0,
      smg: 0,
      heavy: 0,
      agent: 0,
      medal: 0,
      pin: 0,
      case: 0,
      capsule: 0,
      musickit: 0,
      graffiti: 0,
      utility: 0,
    };
    inventory.forEach((i: any) => {
      const t = i.type || "other";
      if (counts[t] !== undefined) counts[t]++;
      else counts.utility++;
    });
    return counts;
  }, [inventory]);

  const distinctCategories = [
    { id: "all", label: "All Items", icon: Layers, count: categoryCounts.all },
    { id: "knife", label: "Knives", icon: Swords, count: categoryCounts.knife, color: "text-[#ffd700]" },
    { id: "gloves", label: "Gloves", icon: Hand, count: categoryCounts.gloves, color: "text-[#ffd700]" },
    { id: "rifle", label: "Rifles", icon: Crosshair, count: categoryCounts.rifle },
    { id: "sniper", label: "Snipers", icon: Target, count: categoryCounts.sniper },
    { id: "pistol", label: "Pistols", icon: Flame, count: categoryCounts.pistol },
    { id: "smg", label: "SMGs", icon: Crosshair, count: categoryCounts.smg },
    { id: "heavy", label: "Shotguns & LMGs", icon: Crosshair, count: categoryCounts.heavy },
    { id: "agent", label: "Agents", icon: UserCheck, count: categoryCounts.agent },
    { id: "medal", label: "Service Medals", icon: Medal, count: categoryCounts.medal },
    { id: "pin", label: "Collectible Pins", icon: Pin, count: categoryCounts.pin },
    { id: "case", label: "Weapon Cases", icon: Package, count: categoryCounts.case },
    { id: "capsule", label: "Sticker Capsules", icon: Package, count: categoryCounts.capsule },
    { id: "musickit", label: "Music Kits", icon: Disc, count: categoryCounts.musickit },
    { id: "graffiti", label: "Graffiti", icon: Paintbrush, count: categoryCounts.graffiti },
    { id: "utility", label: "Utilities & Charms", icon: Wrench, count: categoryCounts.utility },
  ];

  const filteredInventory = useMemo(() => {
    return inventory.filter((item: any) => {
      if (invCategory !== "all" && item.type !== invCategory) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (item.name || "").toLowerCase().includes(q);
        const matchesWear = (item.wear || "").toLowerCase().includes(q);
        const matchesTag = (item.nametag || "").toLowerCase().includes(q);
        if (!matchesName && !matchesWear && !matchesTag) return false;
      }

      if (statTrakOnly && !(item.name || "").includes("StatTrak™")) return false;

      if (rarityFilter !== "all") {
        const colorHex = (item.rarityColor || "").replace("#", "").toLowerCase();
        if (rarityFilter === "gold" && !["ffd700", "e4ae39"].includes(colorHex)) return false;
        if (rarityFilter === "covert" && colorHex !== "eb4b4b") return false;
        if (rarityFilter === "classified" && colorHex !== "d32ce6") return false;
        if (rarityFilter === "restricted" && colorHex !== "8847ff") return false;
        if (rarityFilter === "milspec" && colorHex !== "4b69ff") return false;
      }

      return true;
    });
  }, [inventory, invCategory, searchQuery, statTrakOnly, rarityFilter]);

  const bans = data?.steam?.bans || data?.bans || {};
  const isVacBanned = Boolean(bans?.vacBanned || bans?.numberOfVacBans > 0);
  const numVacBans = bans?.numberOfVacBans ?? 0;
  const isCommunityBanned = Boolean(bans?.communityBanned);
  const economyBan = bans?.economyBan || "none";

  let trustPercentage = 100;
  if (isVacBanned) trustPercentage -= 60;
  if (isCommunityBanned) trustPercentage -= 30;
  if (economyBan !== "none") trustPercentage -= 15;
  if (trustPercentage < 0) trustPercentage = 0;

  const trustRatingLabel = 
    trustPercentage >= 90 ? "EXCELLENT RATING" :
    trustPercentage >= 70 ? "GOOD STANDING" :
    trustPercentage >= 40 ? "SUSPECT RECORD" : "UNTRUSTED / BANNED";

  const trustColor =
    trustPercentage >= 80 ? "text-emerald-400" :
    trustPercentage >= 50 ? "text-amber-400" : "text-rose-400";

  const faceit = data?.faceit || {};

  const tabs: { id: TabKey; label: string; icon: any }[] = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "ranks", label: "Skill Groups", icon: Trophy },
    { id: "faceit", label: "FACEIT Intel", icon: Award },
    { id: "valve", label: "Valve Matches", icon: Gamepad2 },
    { id: "inventory", label: "Inventory", icon: Briefcase },
    { id: "friends", label: "Friends", icon: Users },
  ];

  return (
    <div className="space-y-6 font-mono">
      <div className="w-full border-b border-white/[0.08] bg-[#070b12]/90 backdrop-blur-md rounded-lg p-1.5 flex items-center justify-start overflow-x-auto no-scrollbar gap-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap active:scale-95 ${
                isActive
                  ? "bg-cyan-500/10 border border-cyan-400/50 text-cyan-300 shadow-[0_0_12px_rgba(0,255,204,0.15)]"
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.03] border border-transparent"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-gray-500"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="min-h-[440px]">
        {activeTab === "inventory" && (
          <div className="rounded-lg bg-[#060a10]/95 border border-white/[0.08] p-5 lg:p-6 space-y-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/[0.08] gap-3">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-base font-black text-white uppercase tracking-wider">
                    Counter-Strike 2 Weapon Storage
                  </h3>
                  <span className="px-2.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/40 text-[10px] text-cyan-300 font-bold">
                    {filteredInventory.length} ITEMS
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Discrete item classifications • Direct Steam CDN assets
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1.5 pt-0.5">
              {distinctCategories
                .filter((cat) => cat.id === "all" || cat.count > 0)
                .map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = invCategory === cat.id;

                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setInvCategory(cat.id);
                        const match = inventory.find((i: any) => cat.id === "all" || i.type === cat.id);
                        if (match) setSelectedItem(match);
                      }}
                      className={`group flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-bold uppercase transition-all whitespace-nowrap select-none active:scale-95 shrink-0 ${
                        isSelected
                          ? "bg-cyan-500/15 border-cyan-400 text-white shadow-[0_0_12px_rgba(0,255,204,0.2)]"
                          : "bg-[#090e17] border-white/[0.08] text-gray-400 hover:text-gray-200 hover:border-white/20"
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-cyan-400" : cat.color || "text-gray-500 group-hover:text-gray-300"}`} />
                      <span>{cat.label}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                        isSelected 
                          ? "bg-cyan-400/20 text-cyan-300 border border-cyan-400/40" 
                          : "bg-white/[0.04] text-gray-500"
                      }`}>
                        {cat.count}
                      </span>
                    </button>
                  );
                })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#080d15] p-2.5 rounded-md border border-white/[0.06]">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter by skin name, wear, or nametag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded bg-black/50 border border-white/[0.08] focus:border-cyan-400 text-xs text-gray-200 placeholder-gray-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStatTrakOnly(!statTrakOnly)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] font-black uppercase border transition-all ${
                    statTrakOnly
                      ? "bg-[#cf6a32]/20 border-[#cf6a32] text-[#cf6a32] shadow-[0_0_10px_rgba(207,106,50,0.3)]"
                      : "bg-black/30 border-white/[0.08] text-gray-400 hover:text-white"
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-[#cf6a32]" />
                  <span>StatTrak™ Only</span>
                </button>

                <select
                  value={rarityFilter}
                  onChange={(e) => setRarityFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded bg-black/50 border border-white/[0.08] focus:border-cyan-400 text-xs text-gray-300 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Rarities</option>
                  <option value="gold">Extraordinary (Gold)</option>
                  <option value="covert">Covert (Red)</option>
                  <option value="classified">Classified (Pink)</option>
                  <option value="restricted">Restricted (Purple)</option>
                  <option value="milspec">Mil-Spec (Blue)</option>
                </select>
              </div>
            </div>

            {loadingInventory ? (
              <div className="py-24 flex flex-col items-center justify-center gap-3 text-cyan-400">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="text-xs tracking-widest uppercase">Streaming CS2 inventory pipeline...</span>
              </div>
            ) : filteredInventory.length === 0 ? (
              <div className="py-20 text-center text-gray-500 text-xs">
                No items match the selected category or filter criteria.
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                <div 
                  className="xl:col-span-8 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[720px] overflow-y-auto pr-2"
                  style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: "rgba(0, 229, 255, 0.3) rgba(255, 255, 255, 0.02)",
                  }}
                >
                  {filteredInventory.map((item: any, idx: number) => {
                    const rarity = getRarityStyle(item.rarityColor);
                    const isSelected = selectedItem?.id === item.id || selectedItem?.name === item.name;
                    const isStatTrak = (item.name || "").includes("StatTrak™");
                    const isSouvenir = (item.name || "").includes("Souvenir");

                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedItem(item)}
                        className={`relative group cursor-pointer aspect-[1/1.05] rounded-md bg-gradient-to-b from-[#111722] to-[#070b10] border transition-all duration-150 flex flex-col justify-between overflow-hidden select-none ${
                          isSelected
                            ? "border-cyan-400 ring-2 ring-cyan-400/40 shadow-[0_0_20px_rgba(0,255,204,0.3)] scale-[1.02]"
                            : "border-white/[0.08] hover:border-white/30"
                        } ${rarity.glow}`}
                      >
                        <div className="absolute top-1.5 left-1.5 flex items-center gap-1 z-10">
                          {isStatTrak && (
                            <span className="px-1.5 py-0.2 rounded bg-[#cf6a32]/30 border border-[#cf6a32]/80 text-[8px] font-black text-[#cf6a32]">
                              ST™
                            </span>
                          )}
                          {isSouvenir && (
                            <span className="px-1.5 py-0.2 rounded bg-[#ffd700]/30 border border-[#ffd700]/80 text-[8px] font-black text-[#ffd700]">
                              SV
                            </span>
                          )}
                          {item.nametag && (
                            <span className="p-0.5 rounded bg-black/60 border border-white/20 text-gray-300" title={`"${item.nametag}"`}>
                              <Tag className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>

                        <div className="w-full h-full flex items-center justify-center p-3 relative">
                          <div 
                            className="absolute inset-0 opacity-20 pointer-events-none rounded-t-md"
                            style={{ background: `radial-gradient(circle, ${rarity.bgGlow} 0%, transparent 70%)` }}
                          />
                          {item.icon ? (
                            <img
                              src={item.icon}
                              alt={item.name}
                              className="max-h-[85%] max-w-[85%] object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.9)] group-hover:scale-110 transition-transform duration-200"
                              loading="lazy"
                            />
                          ) : (
                            <span className="text-[9px] text-gray-600">No Asset</span>
                          )}
                        </div>

                        <div className="px-2 pb-2 pt-1 z-10 bg-gradient-to-t from-black/95 via-black/60 to-transparent">
                          <p className="text-[10px] font-bold text-gray-200 truncate leading-tight">
                            {item.name}
                          </p>
                          <p className="text-[8px] text-gray-500 truncate mt-0.5">
                            {item.wear}
                          </p>
                        </div>

                        <div className={`w-full h-1.5 ${rarity.bar}`} />
                      </div>
                    );
                  })}
                </div>

                <div className="xl:col-span-4 sticky top-6 rounded-lg bg-[#090d15] border border-white/[0.1] p-5 flex flex-col justify-between shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
                  {selectedItem ? (
                    (() => {
                      const selRarity = getRarityStyle(selectedItem.rarityColor);
                      const isStatTrak = (selectedItem.name || "").includes("StatTrak™");

                      return (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest flex items-center gap-1.5">
                              <Eye className="w-3.5 h-3.5 text-cyan-400" />
                              INSPECT TELEMETRY
                            </span>
                            <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.1] ${selRarity.name}`}>
                              {selRarity.label}
                            </span>
                          </div>

                          <div 
                            className="relative w-full h-56 rounded-md border border-white/[0.08] flex items-center justify-center p-4 overflow-hidden"
                            style={{
                              background: `radial-gradient(circle, ${selRarity.bgGlow} 0%, #05080e 100%)`,
                            }}
                          >
                            {selectedItem.icon ? (
                              <img
                                src={selectedItem.icon}
                                alt={selectedItem.name}
                                className="max-h-[92%] max-w-[92%] object-contain drop-shadow-[0_16px_28px_rgba(0,0,0,0.95)] scale-110"
                              />
                            ) : (
                              <span className="text-xs text-gray-500">Asset Missing</span>
                            )}
                          </div>

                          <div>
                            <h4 className={`text-base font-black leading-snug ${selRarity.name}`}>
                              {selectedItem.name}
                            </h4>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {selectedItem.wear || "Standard Condition"}
                            </p>

                            {selectedItem.nametag && (
                              <div className="mt-2 flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-950/40 border border-amber-500/30 text-amber-300 text-[11px]">
                                <Tag className="w-3 h-3 text-amber-400 shrink-0" />
                                <span className="font-semibold">&quot;{selectedItem.nametag}&quot;</span>
                              </div>
                            )}

                            {selectedItem.stickers && (
                              <div className="mt-2 p-2 rounded bg-white/[0.03] border border-white/[0.08] text-[10px] text-gray-400">
                                <span className="text-gray-500 font-bold block mb-0.5">APPLIED STICKERS:</span>
                                <span>{selectedItem.stickers}</span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2 pt-3 border-t border-white/[0.08] text-xs">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-500 text-[11px]">Item Class</span>
                              <span className="text-gray-200 font-bold uppercase">{selectedItem.weapon || selectedItem.type}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-500 text-[11px]">Wear State</span>
                              <span className="text-gray-200 font-bold">{selectedItem.wear || "Vanilla"}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-500 text-[11px]">StatTrak™ Certified</span>
                              <span className={`font-bold ${isStatTrak ? "text-[#cf6a32]" : "text-gray-500"}`}>
                                {isStatTrak ? "YES" : "NO"}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-500 text-[11px]">Valve Rarity</span>
                              <span className={`font-bold ${selRarity.name}`}>{selRarity.label}</span>
                            </div>
                          </div>

                          <div className="pt-2">
                            <a
                              href={`https://steamcommunity.com/market/listings/730/${encodeURIComponent(selectedItem.name)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] hover:border-cyan-400 text-xs font-bold text-gray-200 hover:text-white transition-all active:scale-98"
                            >
                              <span>Inspect on Steam Market</span>
                              <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                            </a>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-gray-500">
                      Select an item from the inventory grid to inspect
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>
        )}

        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-3 rounded-lg bg-[#070b12]/95 border border-white/[0.08] p-5 flex flex-col justify-between shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    TRUST SCORE <Info className="w-3 h-3 text-gray-500" />
                  </span>
                  {isVacBanned ? (
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  )}
                </div>

                <div className="my-6 text-center">
                  <div className={`text-6xl font-black ${trustColor} tracking-tight drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]`}>
                    {trustPercentage}<span className="text-3xl">%</span>
                  </div>
                  <span className={`inline-block mt-2 px-3 py-0.5 rounded border text-[10px] font-bold uppercase tracking-widest ${
                    isVacBanned
                      ? "bg-rose-950/80 border-rose-500/40 text-rose-300"
                      : "bg-emerald-950/80 border-emerald-500/40 text-emerald-300"
                  }`}>
                    {trustRatingLabel}
                  </span>
                </div>

                <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden mb-6">
                  <div 
                    className={`h-full ${isVacBanned ? "bg-rose-500" : "bg-gradient-to-r from-emerald-500 to-cyan-400"}`}
                    style={{ width: `${trustPercentage}%` }}
                  />
                </div>

                <div className="space-y-3 pt-2 border-t border-white/[0.06] text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-[11px]">• VAC Violations</span>
                    <span className={`font-bold ${numVacBans > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                      {numVacBans}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-[11px]">• Community Lock</span>
                    <span className={`font-bold ${isCommunityBanned ? "text-rose-400" : "text-emerald-400"}`}>
                      {isCommunityBanned ? "RESTRICTED" : "CLEAN"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-[11px]">• Economy Status</span>
                    <span className={`font-bold uppercase ${economyBan !== "none" ? "text-rose-400" : "text-emerald-400"}`}>
                      {economyBan}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-[11px]">• Profile Visibility</span>
                    <span className="text-cyan-400 font-bold uppercase">
                      {data?.steam?.isPublic ? "PUBLIC" : "PRIVATE"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-9 space-y-6">
              <div className="rounded-lg bg-[#070b12]/95 border border-white/[0.08] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.06]">
                  <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">
                    COMBAT TELEMETRY
                  </span>
                  <span className="text-[11px] text-cyan-400/80 bg-cyan-950/40 px-2.5 py-0.5 rounded border border-cyan-500/30">
                    {combatStats ? "LIVE BUFFER" : "SYNCING WITH GC..."}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded bg-white/[0.02] border border-white/[0.05]">
                    <span className="text-[10px] text-gray-400 uppercase font-bold">K/D RATIO</span>
                    <div className="text-2xl font-black text-white mt-1">
                      {combatStats?.kdRatio ? Number(combatStats.kdRatio).toFixed(2) : "—"}
                    </div>
                  </div>
                  <div className="p-3 rounded bg-white/[0.02] border border-white/[0.05]">
                    <span className="text-[10px] text-gray-400 uppercase font-bold">ADR</span>
                    <div className="text-2xl font-black text-white mt-1">
                      {combatStats?.adr ? Number(combatStats.adr).toFixed(1) : "—"}
                    </div>
                  </div>
                  <div className="p-3 rounded bg-white/[0.02] border border-white/[0.05]">
                    <span className="text-[10px] text-gray-400 uppercase font-bold">HEADSHOT %</span>
                    <div className="text-2xl font-black text-white mt-1">
                      {combatStats?.headshotPct ? `${combatStats.headshotPct}%` : "—"}
                    </div>
                  </div>
                  <div className="p-3 rounded bg-white/[0.02] border border-white/[0.05]">
                    <span className="text-[10px] text-gray-400 uppercase font-bold">TOTAL KILLS</span>
                    <div className="text-2xl font-black text-white mt-1">
                      {combatStats?.totalKills ? combatStats.totalKills.toLocaleString() : "—"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "ranks" && (
          <SkillGroupsTab data={{ ...data, ...(Array.isArray(mapRanks) ? { mapRanks } : mapRanks) }} />
        )}

        {activeTab === "faceit" && <FaceitTab data={data} />}

        {activeTab === "valve" && (
          <div className="rounded-lg bg-[#070b12]/95 border border-white/[0.08] p-6 space-y-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
              <h3 className="text-base font-black text-white uppercase tracking-wider">
                Valve Match History &amp; Share Codes
              </h3>
              <span className="text-xs text-gray-500">Ingested via Valve Match Buffer</span>
            </div>

            {loadingMatches ? (
              <div className="py-16 flex flex-col items-center justify-center gap-3 text-cyan-400">
                <Loader2 className="w-7 h-7 animate-spin" />
                <span className="text-xs">LOADING RECORDED MATCHES...</span>
              </div>
            ) : matches.length === 0 ? (
              <div className="py-14 text-center text-gray-500 text-xs">
                No recent matches stored in the buffer. Click &quot;Sync Telemetry&quot; above to query new matches.
              </div>
            ) : (
              <div className="space-y-2">
                {matches.map((m: any, idx: number) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded bg-white/[0.02] border border-white/[0.05] hover:border-cyan-500/30 transition-colors gap-3">
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase ${
                        m.result === "VICTORY" || m.win
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-500/40"
                          : "bg-rose-950 text-rose-400 border border-rose-500/40"
                      }`}>
                        {m.result || (m.win ? "VICTORY" : "DEFEAT")}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-white uppercase">{m.map || "Competitive Match"} • {m.score || "—"}</div>
                        <div className="text-[10px] text-gray-500">{m.date || "Match Record"}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      {m.shareCode && (
                        <button 
                          onClick={() => navigator.clipboard.writeText(m.shareCode)}
                          className="px-2 py-1 rounded bg-white/[0.04] hover:bg-cyan-950/60 border border-white/[0.08] hover:border-cyan-400/40 text-[10px] text-gray-300 hover:text-cyan-300 transition-all"
                        >
                          Copy Share Code
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "friends" && (
          <div className="rounded-lg bg-[#060a10]/95 border border-white/[0.08] p-5 lg:p-6 space-y-5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            {/* Header with Metrics & Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.08] gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-base font-black text-white uppercase tracking-wider">
                    Friends Network Audit
                  </h3>
                  <span className="px-2.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/40 text-[10px] text-cyan-300 font-bold">
                    {friends.length} OPERATIVES
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Full Steam network scan • Real-time Valve anti-cheat enforcement detection
                </p>
              </div>

              {/* Segmented Filter Pills */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setFriendFilter("all")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-bold uppercase transition-all whitespace-nowrap ${
                    friendFilter === "all"
                      ? "bg-cyan-500/15 border border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(0,255,204,0.15)]"
                      : "bg-[#090e17] border border-white/[0.08] text-gray-400 hover:text-white hover:border-white/20"
                  }`}
                >
                  <span>All</span>
                  <span className="px-1.5 py-0.2 rounded bg-white/[0.06] text-[10px] text-gray-300 font-mono">
                    {friends.length}
                  </span>
                </button>

                <button
                  onClick={() => setFriendFilter("banned")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-bold uppercase transition-all whitespace-nowrap ${
                    friendFilter === "banned"
                      ? "bg-rose-950/40 border border-rose-500 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.25)]"
                      : "bg-[#090e17] border border-white/[0.08] text-gray-400 hover:text-rose-300 hover:border-rose-500/30"
                  }`}
                >
                  <span className="text-rose-400">●</span>
                  <span>Banned</span>
                  <span className="px-1.5 py-0.2 rounded bg-rose-950/80 text-[10px] text-rose-400 border border-rose-500/30 font-mono font-black">
                    {friends.filter((f) => f.isBanned || f.vacBanned).length}
                  </span>
                </button>

                <button
                  onClick={() => setFriendFilter("clean")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-bold uppercase transition-all whitespace-nowrap ${
                    friendFilter === "clean"
                      ? "bg-emerald-950/40 border border-emerald-500 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                      : "bg-[#090e17] border border-white/[0.08] text-gray-400 hover:text-emerald-300 hover:border-emerald-500/30"
                  }`}
                >
                  <span className="text-emerald-400">●</span>
                  <span>Clean</span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-950/80 text-[10px] text-emerald-400 border border-emerald-500/30 font-mono font-bold">
                    {friends.filter((f) => !f.isBanned && !f.vacBanned).length}
                  </span>
                </button>
              </div>
            </div>

            {loadingFriends ? (
              <div className="py-24 flex flex-col items-center justify-center gap-3 text-cyan-400">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="text-xs tracking-widest uppercase">
                  Batch-auditing friend network for VAC sanctions...
                </span>
              </div>
            ) : friends.length === 0 ? (
              <div className="py-20 text-center text-gray-500 text-xs">
                No friends returned or Steam profile network privacy is restricted.
              </div>
            ) : (
              <div 
                className="space-y-2 max-h-[720px] overflow-y-auto pr-2"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgba(0, 229, 255, 0.3) rgba(255, 255, 255, 0.02)",
                }}
              >
                {friends
                  .filter((f) => {
                    const hasBan = Boolean(f.isBanned || f.vacBanned || f.communityBanned);
                    if (friendFilter === "banned") return hasBan;
                    if (friendFilter === "clean") return !hasBan;
                    return true;
                  })
                  .map((f: any, idx: number) => {
                    const hasBan = Boolean(f.isBanned || f.vacBanned || f.communityBanned);

                    return (
                      <div 
                        key={idx}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-all select-none ${
                          hasBan 
                            ? "bg-[#14080b]/60 border-rose-500/30 hover:border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.06)]" 
                            : "bg-[#090d14]/70 border-white/[0.06] hover:border-white/20 hover:bg-[#0c121d]"
                        }`}
                      >
                        {/* Left: Avatar + Structured Name & Tenure */}
                        <Link href={`/player/${f.steamid}`} className="flex items-center gap-3.5 min-w-0 flex-1 cursor-pointer group">
                          <div className={`relative w-10 h-10 rounded-md border overflow-hidden flex items-center justify-center font-bold text-sm text-white shrink-0 bg-black/60 shadow-md group-hover:scale-105 transition-transform ${
                            hasBan ? "border-rose-500/60 ring-1 ring-rose-500/30" : "border-white/[0.12] group-hover:border-cyan-400"
                          }`}>
                            {f.avatar ? (
                              <img src={f.avatar} alt={f.personaname || "User"} className="w-full h-full object-cover" loading="lazy" />
                            ) : (
                              (f.personaname || "?")[0]
                            )}
                          </div>

                          <div className="min-w-0 flex flex-col justify-center gap-1">
                            <div className="text-sm font-black text-gray-100 group-hover:text-cyan-300 transition-colors truncate max-w-[280px] sm:max-w-md leading-none">
                              {f.personaname || "Steam User"}
                            </div>
                            
                            <div className="flex items-center gap-2 text-[11px] text-gray-500">
                              <span className="text-gray-400">
                                {f.relationship || "Friend"}
                              </span>
                              <span className="text-gray-700">•</span>
                              <span className="font-mono text-gray-500 text-[10px] group-hover:text-cyan-400 transition-colors">
                                {f.steamid}
                              </span>
                            </div>
                          </div>
                        </Link>

                        {/* Right: Clean Separated Badges & Action */}
                        <div className="flex items-center gap-3 shrink-0 ml-3">
                          {hasBan ? (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-950/80 border border-rose-500/50 text-rose-300 text-[10px] font-black uppercase tracking-wider">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                              <span>{f.banType || "BANNED"}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              <span>CLEAN</span>
                            </div>
                          )}

                          <a
                            href={f.profileurl || `https://steamcommunity.com/profiles/${f.steamid}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-md bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.08] hover:border-cyan-400/50 text-gray-400 hover:text-white transition-all active:scale-95"
                            title="Open Steam Profile"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}