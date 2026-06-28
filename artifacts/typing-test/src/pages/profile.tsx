import { useState } from "react";
import { useUser, useAuth } from "@clerk/react";
import { useQueryClient } from "@tanstack/react-query";
import { AppHeader } from "@/components/app-header";
import { PageTransition } from "@/components/page-transition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  useGetMyStats,
  useListAchievements,
  getGetMyStatsQueryKey,
  getListAchievementsQueryKey,
} from "@workspace/api-client-react";
import { User, Pencil, Check, X, Zap, Target, Trophy, Flame } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [editingUsername, setEditingUsername] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [firstNameInput, setFirstNameInput] = useState("");
  const [lastNameInput, setLastNameInput] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: stats, isLoading: statsLoading } = useGetMyStats({
    query: { enabled: !!userId, queryKey: getGetMyStatsQueryKey() },
  });

  const { data: achievements } = useListAchievements({
    query: { enabled: !!userId, queryKey: getListAchievementsQueryKey() },
  });

  const earnedCount = achievements?.filter((a) => a.earned).length ?? 0;

  const startEditUsername = () => {
    setUsernameInput(user?.username ?? "");
    setEditingUsername(true);
  };

  const startEditName = () => {
    setFirstNameInput(user?.firstName ?? "");
    setLastNameInput(user?.lastName ?? "");
    setEditingName(true);
  };

  const saveUsername = async () => {
    if (!user || !usernameInput.trim()) return;
    setSaving(true);
    try {
      await user.update({ username: usernameInput.trim() });
      setEditingUsername(false);
      queryClient.invalidateQueries({ queryKey: getGetMyStatsQueryKey() });
      toast({ title: "Username updated!" });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to update username";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const saveName = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await user.update({
        firstName: firstNameInput.trim() || undefined,
        lastName: lastNameInput.trim() || undefined,
      });
      setEditingName(false);
      toast({ title: "Name updated!" });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to update name";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const statItems = [
    { label: "Best WPM", value: stats?.bestWpm ?? 0, icon: Zap, color: "text-primary" },
    { label: "Avg WPM", value: stats?.averageWpm ?? 0, icon: Target, color: "text-chart-4" },
    { label: "Total Tests", value: stats?.totalTests ?? 0, icon: Trophy, color: "text-chart-5" },
    { label: "Streak", value: `${stats?.currentStreak ?? 0}d`, icon: Flame, color: "text-destructive" },
  ];

  const container = {
    animate: { transition: { staggerChildren: 0.07 } },
  };
  const item = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-20 md:pb-0">
      <AppHeader />
      <PageTransition>
        <main className="flex-1 container mx-auto px-4 py-6 md:py-8 max-w-2xl space-y-6">
          <h1 className="font-mono text-xl md:text-2xl font-bold uppercase tracking-widest text-primary">
            Profile
          </h1>

          {/* Avatar + identity */}
          <motion.div variants={container} initial="initial" animate="animate">
            <motion.div variants={item}>
              <Card className="border-border/50 bg-card/50">
                <CardContent className="p-5 md:p-6">
                  <div className="flex items-start gap-4 md:gap-6">
                    <Avatar className="h-16 w-16 md:h-20 md:w-20 border-2 border-primary/20 shrink-0">
                      <AvatarImage src={user?.imageUrl} alt={user?.username || ""} />
                      <AvatarFallback className="bg-muted text-lg font-mono font-bold">
                        {!isLoaded ? <Skeleton className="h-full w-full rounded-full" /> :
                          (user?.username || user?.firstName || "T").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0 space-y-4">
                      {/* Username */}
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground uppercase tracking-widest font-mono">Username</Label>
                        {editingUsername ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={usernameInput}
                              onChange={(e) => setUsernameInput(e.target.value)}
                              className="font-mono h-8 text-sm"
                              autoFocus
                              onKeyDown={(e) => { if (e.key === "Enter") saveUsername(); if (e.key === "Escape") setEditingUsername(false); }}
                            />
                            <Button size="icon" className="h-8 w-8 shrink-0" onClick={saveUsername} disabled={saving}>
                              <Check className="w-3.5 h-3.5" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => setEditingUsername(false)}>
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-base truncate">
                              {isLoaded ? (user?.username || "—") : <Skeleton className="h-5 w-32" />}
                            </span>
                            <button onClick={startEditUsername} className="text-muted-foreground hover:text-primary transition-colors shrink-0">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Full name */}
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground uppercase tracking-widest font-mono">Display Name</Label>
                        {editingName ? (
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <Input
                                placeholder="First name"
                                value={firstNameInput}
                                onChange={(e) => setFirstNameInput(e.target.value)}
                                className="font-mono h-8 text-sm"
                                autoFocus
                              />
                              <Input
                                placeholder="Last name"
                                value={lastNameInput}
                                onChange={(e) => setLastNameInput(e.target.value)}
                                className="font-mono h-8 text-sm"
                                onKeyDown={(e) => { if (e.key === "Enter") saveName(); if (e.key === "Escape") setEditingName(false); }}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" className="h-7 text-xs" onClick={saveName} disabled={saving}>
                                <Check className="w-3 h-3 mr-1" /> Save
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingName(false)}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm text-muted-foreground truncate">
                              {isLoaded
                                ? ([user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Not set")
                                : <Skeleton className="h-4 w-24" />}
                            </span>
                            <button onClick={startEditName} className="text-muted-foreground hover:text-primary transition-colors shrink-0">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Email (read-only) */}
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground uppercase tracking-widest font-mono">Email</Label>
                        <span className="font-mono text-sm text-muted-foreground truncate block">
                          {isLoaded ? (user?.primaryEmailAddress?.emailAddress || "—") : <Skeleton className="h-4 w-40" />}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Stats summary */}
            <motion.div variants={item} className="mt-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {statItems.map((s) => (
                  <Card key={s.label} className="border-border/50 bg-card/50">
                    <CardContent className="p-4 flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
                        <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">{s.label}</span>
                      </div>
                      {statsLoading ? (
                        <Skeleton className="h-7 w-12" />
                      ) : (
                        <motion.span
                          className={`text-2xl font-bold font-mono ${s.color}`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                          {s.value}
                        </motion.span>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>

            {/* Achievements summary */}
            <motion.div variants={item} className="mt-4">
              <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="font-mono text-sm uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                    <span>Achievements</span>
                    <Badge variant="outline" className="font-mono text-primary border-primary/30">
                      {earnedCount} / {achievements?.length ?? 0}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {achievements?.map((a, i) => (
                      <motion.div
                        key={a.id}
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.04, type: "spring", stiffness: 400, damping: 20 }}
                        title={`${a.title}: ${a.description}`}
                        className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border text-center transition-all ${
                          a.earned
                            ? "border-primary/40 bg-primary/5"
                            : "border-border/30 bg-muted/10 opacity-35 grayscale"
                        }`}
                      >
                        <span className="text-xl md:text-2xl">{a.icon}</span>
                        <span className="text-[10px] font-mono font-medium leading-tight">{a.title}</span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </main>
      </PageTransition>
    </div>
  );
}
