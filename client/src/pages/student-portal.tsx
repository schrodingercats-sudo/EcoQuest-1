import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WasteSortingGame } from "@/components/games/waste-sorting-game";
import { WaterSaverGame } from "@/components/games/water-saver-game";
import { PlantTreeGame } from "@/components/games/plant-tree-game";
import { EcoFactModal } from "@/components/eco-fact-modal";
import { doc, updateDoc, increment, arrayUnion, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BadgeType } from "@shared/schema";

const ECO_FACTS = [
  {
    title: "Every minute, one million plastic bottles are purchased worldwide!",
    description: "By reducing single-use plastics, you can help save marine life and reduce ocean pollution."
  },
  {
    title: "A single tree can absorb 48 pounds of CO2 per year!",
    description: "Planting trees is one of the most effective ways to combat climate change."
  },
  {
    title: "Turning off the tap while brushing teeth saves 8 gallons of water!",
    description: "Small water-saving habits can make a huge environmental impact."
  }
];

export default function StudentPortal() {
  const { user, loading } = useAuth();
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const [showEcoFact, setShowEcoFact] = useState(false);
  const [currentFact, setCurrentFact] = useState(ECO_FACTS[0]);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;
    
    try {
      const userDoc = await getDoc(doc(db, "users", user.id));
      if (userDoc.exists()) {
        setUserData({ id: user.id, ...userDoc.data() });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleGameComplete = async (gameType: string, score: number) => {
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.id);
      
      // Update user score
      await updateDoc(userRef, {
        totalPoints: increment(score),
        lastActive: new Date()
      });

      // Award badges based on game and score
      let badgeEarned: BadgeType | null = null;
      if (gameType === "waste_sorting" && score >= 50) {
        badgeEarned = "waste_warrior";
      } else if (gameType === "water_saver" && score >= 25) {
        badgeEarned = "water_saver";
      } else if (gameType === "plant_tree" && score >= 100) {
        badgeEarned = "green_thumb";
      }

      if (badgeEarned && userData && !userData.badges?.includes(badgeEarned)) {
        await updateDoc(userRef, {
          badges: arrayUnion(badgeEarned)
        });
      }

      // Show random eco fact
      const randomFact = ECO_FACTS[Math.floor(Math.random() * ECO_FACTS.length)];
      setCurrentFact(randomFact);
      setShowEcoFact(true);

      // Reset game and refresh user data
      setCurrentGame(null);
      fetchUserData();
    } catch (error) {
      console.error("Error updating game completion:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || user.role !== "student") {
    return <LoginForm role="student" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Student Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{user.name}</h2>
                    <p className="text-muted-foreground">Planet Hero Level {userData?.level || 1}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6 mt-4 md:mt-0">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{userData?.totalPoints || 0}</div>
                    <div className="text-sm text-muted-foreground">Total Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent">{userData?.badges?.length || 0}</div>
                    <div className="text-sm text-muted-foreground">Badges</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Current Game Display */}
        {currentGame && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            {currentGame === "waste_sorting" && (
              <WasteSortingGame 
                onGameComplete={(score) => handleGameComplete("waste_sorting", score)} 
              />
            )}
            {currentGame === "water_saver" && (
              <WaterSaverGame 
                onGameComplete={(score) => handleGameComplete("water_saver", score)} 
              />
            )}
            {currentGame === "plant_tree" && (
              <PlantTreeGame 
                onGameComplete={(score) => handleGameComplete("plant_tree", score)} 
              />
            )}
            <div className="text-center mt-4">
              <Button 
                variant="outline" 
                onClick={() => setCurrentGame(null)}
                data-testid="button-exit-game"
              >
                Exit Game
              </Button>
            </div>
          </motion.div>
        )}

        {/* Badges Section */}
        {!currentGame && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-trophy text-accent mr-2"></i>
                  Your Planet Hero Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {(userData?.badges || []).map((badge: BadgeType, index: number) => (
                    <motion.div
                      key={badge}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gradient-to-br from-accent to-yellow-400 p-4 rounded-xl text-center group hover:scale-110 transition-all duration-300"
                    >
                      <i className={`fas ${getBadgeIcon(badge)} text-2xl text-white mb-2`}></i>
                      <p className="text-xs font-semibold text-white">{getBadgeName(badge)}</p>
                    </motion.div>
                  ))}
                  {Array.from({ length: Math.max(0, 6 - (userData?.badges?.length || 0)) }).map((_, index) => (
                    <div
                      key={`placeholder-${index}`}
                      className="bg-muted/30 border-2 border-dashed border-muted-foreground/30 p-4 rounded-xl text-center opacity-60"
                    >
                      <i className="fas fa-lock text-2xl text-muted-foreground mb-2"></i>
                      <p className="text-xs text-muted-foreground">Coming Soon</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Games Section */}
        {!currentGame && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <h3 className="text-2xl font-bold text-foreground mb-6">🎮 Planet Hero Challenges</h3>
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Waste Sorting Game */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card className="overflow-hidden cursor-pointer group" onClick={() => setCurrentGame("waste_sorting")}>
                  <div className="h-64 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                    <div className="text-center">
                      <i className="fas fa-recycle text-6xl text-green-600 mb-4 group-hover:scale-110 transition-transform"></i>
                      <p className="text-green-800 font-semibold">Waste Sorting Challenge</p>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h4 className="text-xl font-bold text-foreground mb-2">♻️ Waste Sorting Hero</h4>
                    <p className="text-muted-foreground text-sm mb-4">
                      Drag and drop items into the correct recycling bins. Master waste segregation and save the planet!
                    </p>
                    <Button className="w-full bg-gradient-to-r from-primary to-green-600" data-testid="button-play-waste-sorting">
                      <i className="fas fa-play mr-2"></i>Start Challenge
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Water Saver Game */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card className="overflow-hidden cursor-pointer group" onClick={() => setCurrentGame("water_saver")}>
                  <div className="h-64 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                    <div className="text-center">
                      <i className="fas fa-tint text-6xl text-blue-600 mb-4 group-hover:scale-110 transition-transform"></i>
                      <p className="text-blue-800 font-semibold">Water Saver Challenge</p>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h4 className="text-xl font-bold text-foreground mb-2">💧 Water Saver Hero</h4>
                    <p className="text-muted-foreground text-sm mb-4">
                      Click to stop dripping taps before the bucket overflows! Every drop saved counts toward saving our planet.
                    </p>
                    <Button className="w-full bg-gradient-to-r from-secondary to-blue-600" data-testid="button-play-water-saver">
                      <i className="fas fa-play mr-2"></i>Start Challenge
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Plant Tree Game */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card className="overflow-hidden cursor-pointer group" onClick={() => setCurrentGame("plant_tree")}>
                  <div className="h-64 bg-gradient-to-br from-amber-100 to-green-200 flex items-center justify-center">
                    <div className="text-center">
                      <i className="fas fa-seedling text-6xl text-green-600 mb-4 group-hover:scale-110 transition-transform"></i>
                      <p className="text-green-800 font-semibold">Tree Planting Challenge</p>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h4 className="text-xl font-bold text-foreground mb-2">🌱 Tree Planting Hero</h4>
                    <p className="text-muted-foreground text-sm mb-4">
                      Click to water your tree and watch it grow through 3 stages. Nurture life and become a Green Thumb hero!
                    </p>
                    <Button className="w-full bg-gradient-to-r from-accent to-green-600" data-testid="button-play-plant-tree">
                      <i className="fas fa-play mr-2"></i>Start Challenge
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Eco Fact Modal */}
        <EcoFactModal
          isOpen={showEcoFact}
          onClose={() => setShowEcoFact(false)}
          fact={currentFact}
        />
      </div>
    </div>
  );
}

function getBadgeIcon(badge: BadgeType): string {
  const icons = {
    waste_warrior: "fa-recycle",
    water_saver: "fa-tint",
    green_thumb: "fa-seedling",
    eco_champion: "fa-leaf",
    planet_protector: "fa-globe",
    carbon_crusher: "fa-industry"
  };
  return icons[badge] || "fa-medal";
}

function getBadgeName(badge: BadgeType): string {
  const names = {
    waste_warrior: "Waste Warrior",
    water_saver: "Water Saver",
    green_thumb: "Green Thumb",
    eco_champion: "Eco Champion",
    planet_protector: "Planet Protector",
    carbon_crusher: "Carbon Crusher"
  };
  return names[badge] || badge;
}
