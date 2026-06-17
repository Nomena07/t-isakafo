const db = require('../database/db');

const now = new Date().toISOString();
const existing = db.get('dishes').value();
let maxId = Math.max(...existing.map(d => d.id), 0);

const newDishes = [
  // ═══════════════════════════════════════════
  // 🥪 SANDWICHS (manquant)
  // ═══════════════════════════════════════════
  { emoji:'🥪', image:'https://images.unsplash.com/photo-1539252554453-80ab60640ccb?w=400&h=300&fit=crop', name:'Sandwich Poulet Grillé', desc:'Poulet mariné, salade, sauce maison', price:5000, available:true, platJour:false, category:'plat', tags:'Plats principaux,Sandwichs,Poulet,Cuisine française,Peu épicé,Déjeuner,Snack' },
  { emoji:'🥪', image:'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=400&h=300&fit=crop', name:'Sandwich Thon Crudités', desc:'Thon, cornichons, salade, mayonnaise', price:4500, available:true, platJour:false, category:'plat', tags:'Plats principaux,Sandwichs,Poissons et fruits de mer,Cuisine française,Non épicé,Déjeuner,Snack' },
  { emoji:'🥪', image:'https://images.unsplash.com/photo-1481070414801-51fd732d7184?w=400&h=300&fit=crop', name:'Sandwich Bœuf Kitoza', desc:'Kitoza de bœuf, oignons, sauce piment', price:5500, available:true, platJour:false, category:'plat', tags:'Plats principaux,Sandwichs,Viandes,Cuisine malgache,Épicé,Déjeuner,Snack' },
  { emoji:'🥪', image:'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=400&h=300&fit=crop', name:'Sandwich Végétarien Avocat', desc:'Avocat, hummus, crudités, pain complet', price:4000, available:true, platJour:false, category:'plat', tags:'Plats principaux,Sandwichs,Végétarien,Végan,Cuisine française,Non épicé,Déjeuner,Brunch,Snack' },
  { emoji:'🌯', image:'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop', name:'Wrap Poulet Curry', desc:'Poulet curry, riz, salade dans une galette', price:5500, available:true, platJour:false, category:'plat', tags:'Plats principaux,Sandwichs,Poulet,Cuisine indienne,Épicé,Déjeuner,Snack' },
  { emoji:'🥖', image:'https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=400&h=300&fit=crop', name:'Baguette Jambon-Fromage', desc:'Jambon, gruyère, beurre, cornichons', price:4000, available:true, platJour:false, category:'plat', tags:'Plats principaux,Sandwichs,Cuisine française,Végétarien,Non épicé,Déjeuner,Snack' },

  // ═══════════════════════════════════════════
  // 🔥 GRILLADES (manquant)
  // ═══════════════════════════════════════════
  { emoji:'🥩', image:'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop', name:'Brochette de Bœuf', desc:'Brochettes marinées au charbon, riz', price:8000, available:true, platJour:false, category:'plat', tags:'Plats principaux,Grillades,Viandes,Cuisine malgache,Épicé,Déjeuner' },
  { emoji:'🍗', image:'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400&h=300&fit=crop', name:'Poulet Braisé', desc:'Poulet entier braisé au feu de bois', price:7500, available:true, platJour:false, category:'plat', tags:'Plats principaux,Grillades,Poulet,Cuisine malgache,Épicé,Meilleures ventes,Déjeuner' },
  { emoji:'🐟', image:'https://images.unsplash.com/photo-1534766555764-ce878a5e3a2b?w=400&h=300&fit=crop', name:'Thon Grillé Citron', desc:'Steak de thon grillé, citron, herbes', price:9000, available:true, platJour:false, category:'plat', tags:'Plats principaux,Grillades,Poissons et fruits de mer,Cuisine malgache,Non épicé,Dîner' },
  { emoji:'🍖', image:'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop', name:'Côtes d\'Agneau Grillées', desc:'Côtes d\'agneau, romarin, ail, frites', price:16000, available:true, platJour:false, category:'plat', tags:'Plats principaux,Grillades,Viandes,Cuisine française,Épicé,Recommandations du chef,Dîner' },
  { emoji:'🦐', image:'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400&h=300&fit=crop', name:'Brochettes de Crevettes', desc:'Crevettes grillées à l\'ail et citron vert', price:11000, available:true, platJour:false, category:'plat', tags:'Plats principaux,Grillades,Poissons et fruits de mer,Cuisine malgache,Peu épicé,Dîner' },

  // ═══════════════════════════════════════════
  // 🥡 CUISINE CHINOISE (manquant)
  // ═══════════════════════════════════════════
  { emoji:'🥡', image:'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=300&fit=crop', name:'Riz Saucisse Chinois', desc:'Riz sauté aux légumes, œuf, soja', price:6000, available:true, platJour:false, category:'plat', tags:'Plats principaux,Riz,Cuisine chinoise,Peu épicé,Déjeuner' },
  { emoji:'🥡', image:'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&h=300&fit=crop', name:'Poulet Aigre-Doux', desc:'Poulet croustillant, sauce aigre-douce', price:7500, available:true, platJour:false, category:'plat', tags:'Plats principaux,Poulet,Cuisine chinoise,Peu épicé,Meilleures ventes,Déjeuner' },
  { emoji:'🥡', image:'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop', name:'Nouilles Chow Mein', desc:'Nouilles sautées au bœuf et légumes', price:6500, available:true, platJour:false, category:'plat', tags:'Plats principaux,Pâtes,Cuisine chinoise,Viandes,Peu épicé,Déjeuner' },
  { emoji:'🥟', image:'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400&h=300&fit=crop', name:'Raviolis Chinois Vapeur', desc:'Raviolis farcis à la crevette (x8)', price:5500, available:true, platJour:false, category:'plat', tags:'Plats principaux,Poissons et fruits de mer,Cuisine chinoise,Non épicé,Déjeuner,Snack' },
  { emoji:'🥡', image:'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=300&fit=crop', name:'Canard Laqué', desc:'Canard rôti à la chinoise, sauce hoisin', price:12000, available:true, platJour:false, category:'plat', tags:'Plats principaux,Viandes,Cuisine chinoise,Peu épicé,Recommandations du chef,Dîner' },
  { emoji:'🥡', image:'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&h=300&fit=crop', name:'Légumes Sautés Tofu', desc:'Tofu sauté, brocoli, carottes, sauce soja', price:5000, available:true, platJour:false, category:'plat', tags:'Plats principaux,Végan,Cuisine chinoise,Végétarien,Non épicé,Déjeuner' },

  // ═══════════════════════════════════════════
  // 🌶️ TRÈS ÉPICÉ (manquant)
  // ═══════════════════════════════════════════
  { emoji:'🔥', image:'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop', name:'Hen\'omby Sakay Malagasy', desc:'Bœuf très épicé aux piments rouges', price:8500, available:true, platJour:false, category:'plat', tags:'Plats principaux,Viandes,Cuisine malgache,Très épicé,Déjeuner' },
  { emoji:'🔥', image:'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop', name:'Poulet Boucané Piment', desc:'Poulet fumé épicé, riz pimenté', price:7500, available:true, platJour:false, category:'plat', tags:'Plats principaux,Poulet,Cuisine malgache,Très épicé,Déjeuner' },
  { emoji:'🌶️', image:'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop', name:'Vindal Poulet', desc:'Poulet au curry très épicé, riz basmati', price:8000, available:true, platJour:false, category:'plat', tags:'Plats principaux,Poulet,Cuisine indienne,Très épicé,Recommandations du chef,Déjeuner' },
  { emoji:'🔥', image:'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop', name:'Saucisse Pimentée', desc:'Saucisse grillée sauce piment rouge', price:6000, available:true, platJour:false, category:'plat', tags:'Plats principaux,Viandes,Cuisine malgache,Très épicé,Snack,Apéritif' },
  { emoji:'🌶️', image:'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&h=300&fit=crop', name:'Tacos Très Épicé', desc:'Bœuf, piment habanero, fromage, crème', price:8000, available:true, platJour:false, category:'plat', tags:'Plats principaux,Viandes,Cuisine mexicaine,Très épicé,Snack' },

  // ═══════════════════════════════════════════
  // 🥗 VÉGÉTARIEN / VÉGAN / SAN Gluten (régime manquant)
  // ═══════════════════════════════════════════
  { emoji:'🥗', image:'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop', name:'Bowl Quinoa Légumes', desc:'Quinoa, avocat, tomate, concombre, citron', price:6000, available:true, platJour:false, category:'plat', tags:'Plats principaux,Riz,Cuisine française,Végétarien,Végan,Sans gluten,Faible en calories,Déjeuner' },
  { emoji:'🥙', image:'https://images.unsplash.com/photo-1529006557810-274b9b3fc259?w=400&h=300&fit=crop', name:'Falafels Pois Chiches', desc:'Falafels croustillants, houmous, salade', price:5500, available:true, platJour:false, category:'plat', tags:'Plats principaux,Végan,Cuisine africaine,Sans gluten,Déjeuner' },
  { emoji:'🍲', image:'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop', name:'Curry Légumes Coco', desc:'Légumes de saison au lait de coco', price:6000, available:true, platJour:false, category:'plat', tags:'Plats principaux,Végan,Cuisine indienne,Épicé,Déjeuner' },
  { emoji:'🥗', image:'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop', name:'Salade César Végétarienne', desc:'Laitue, croûtons, parmesan, sauce césar', price:5000, available:true, platJour:false, category:'plat', tags:'Plats principaux,Salades,Végétarien,Cuisine française,Non épicé,Déjeuner' },
  { emoji:'🍛', image:'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop', name:'Dahl Lentilles', desc:'Lentilles mijotées au curry, riz basmati', price:5000, available:true, platJour:false, category:'plat', tags:'Plats principaux,Végan,Cuisine indienne,Épicé,Sans gluten,Déjeuner' },
  { emoji:'🌯', image:'https://images.unsplash.com/photo-1543353071-873f17a7a088?w=400&h=300&fit=crop', name:'Galettes de Sarrasin', desc:'Galettes sans gluten, garniture fromage', price:4500, available:true, platJour:false, category:'plat', tags:'Plats principaux,Végétarien,Cuisine française,Sans gluten,Brunch,Déjeuner' },
  { emoji:'🥙', image:'https://images.unsplash.com/photo-1529006557810-274b9b3fc259?w=400&h=300&fit=crop', name:'Houmous Crudités', desc:'Houmous maison, bâtonnets de légumes', price:4000, available:true, platJour:false, category:'entree', tags:'Entrées,Végan,Cuisine africaine,Sans gluten,Snack,Apéritif' },
  { emoji:'🍲', image:'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop', name:'Soupe Miso Tofu', desc:'Bouillon miso, tofu, algues, oignon', price:3500, available:true, platJour:false, category:'entree', tags:'Entrées,Soupes,Végan,Cuisine japonaise,Sans gluten,Non épicé,Déjeuner' },

  // ═══════════════════════════════════════════
  // 🍳 BRUNCH (manquant)
  // ═══════════════════════════════════════════
  { emoji:'🍳', image:'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=300&fit=crop', name:'Oeufs Brouillés Avocat', desc:'Oeufs brouillés moelleux, avocat toast', price:5000, available:true, platJour:false, category:'plat', tags:'Plats principaux,Végétarien,Cuisine française,Non épicé,Brunch,Petit-déjeuner' },
  { emoji:'🥞', image:'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop', name:'Pancakes Maison', desc:'Pancakes moelleux, sirop d\'érable, fruits', price:4500, available:true, platJour:false, category:'plat', tags:'Plats principaux,Végétarien,Cuisine américaine,Non épicé,Brunch,Petit-déjeuner' },
  { emoji:'🥑', image:'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=300&fit=crop', name:'Avocat Toastoeuf', desc:'Pain complet, avocat écrasé, œuf poché', price:5500, available:true, platJour:false, category:'plat', tags:'Plats principaux,Végétarien,Cuisine française,Non épicé,Brunch,Petit-déjeuner,Nouveautés' },
  { emoji:'🧇', image:'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop', name:'Gaufres Liégeoises', desc:'Gaufres caramélisées, glace vanille', price:5000, available:true, platJour:false, category:'dessert', tags:'Desserts,Cuisine française,Végétarien,Non épicé,Brunch' },
  { emoji:'🍳', image:'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=300&fit=crop', name:'Omelette aux Champignons', desc:'Omelette garnie, champignons, fromage', price:4500, available:true, platJour:false, category:'plat', tags:'Plats principaux,Végétarien,Cuisine française,Non épicé,Brunch,Déjeuner' },
  { emoji:'🥓', image:'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=300&fit=crop', name:'Full Breakfast Anglais', desc:'Oeufs, bacon, saucisses, haricots, toast', price:7500, available:true, platJour:false, category:'plat', tags:'Plats principaux,Viandes,Cuisine américaine,Non épicé,Brunch,Petit-déjeuner' },

  // ═══════════════════════════════════════════
  // 🏷️ NOUVEAUTÉS / PROMOTIONS / PLAT DU JOUR
  // ═══════════════════════════════════════════
  { emoji:'🆕', image:'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop', name:'Bowl Poké Thon', desc:'Thon frais, avocat, edamame, riz sushi', price:9000, available:true, platJour:false, category:'plat', tags:'Plats principaux,Poissons et fruits de mer,Cuisine japonaise,Non épicé,Nouveautés,Déjeuner' },
  { emoji:'🆕', image:'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop', name:'Tacos Bowl Mexicain', desc:'Riz, bœuf, maïs, guacamole, salsa', price:7000, available:true, platJour:false, category:'plat', tags:'Plats principaux,Viandes,Cuisine mexicaine,Épicé,Nouveautés,Déjeuner' },
  { emoji:'🆕', image:'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop', name:'Burger BBQ Bacon', desc:'Bœuf, bacon croustillant, sauce BBQ, oignons', price:10000, available:true, platJour:false, category:'plat', tags:'Plats principaux,Burgers,Cuisine américaine,Épicé,Nouveautés,Meilleures ventes,Déjeuner' },
  { emoji:'🏷️', image:'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop', name:'Pizza Quatre Fromages', desc:'Mozzarella, gorgonzola, parmesan, chèvre', price:8500, available:true, platJour:false, category:'plat', tags:'Plats principaux,Pizza,Cuisine italienne,Végétarien,Non épicé,Promotions,Déjeuner' },
  { emoji:'🏷️', image:'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop', name:'Poulet Grillé Promo', desc:'Poulet entier grillé, frites, salade', price:6000, available:true, platJour:false, category:'plat', tags:'Plats principaux,Poulet,Cuisine malgache,Non épicé,Promotions,Meilleures ventes,Déjeuner' },

  // ═══════════════════════════════════════════
  // 🍖 HALAL / RÉGIMES SUPPLÉMENTAIRES
  // ═══════════════════════════════════════════
  { emoji:'🍖', image:'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop', name:'Couscous Agneau Halal', desc:'Couscous Royal, agneau mijoté, légumes', price:9000, available:true, platJour:false, category:'plat', tags:'Plats principaux,Viandes,Cuisine africaine,Halal,Épicé,Déjeuner' },
  { emoji:'🍗', image:'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop', name:'Tandoori Poulet Halal', desc:'Poulet mariné yogurt, épices, riz', price:8000, available:true, platJour:false, category:'plat', tags:'Plats principaux,Poulet,Cuisine indienne,Halal,Épicé,Recommandations du chef,Déjeuner' },
  { emoji:'🧆', image:'https://images.unsplash.com/photo-1529006557810-274b9b3fc259?w=400&h=300&fit=crop', name:'Chawarma Poulet Halal', desc:'Poulet rôti, pain pita, sauce blanche', price:6500, available:true, platJour:false, category:'plat', tags:'Plats principaux,Poulet,Cuisine africaine,Halal,Peu épicé,Déjeuner,Snack' },

  // ═══════════════════════════════════════════
  // 🍕 PIZZA SUPPLÉMENTAIRES
  // ═══════════════════════════════════════════
  { emoji:'🍕', image:'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop', name:'Pizza Pepperoni', desc:'Pepperoni, mozzarella, sauce tomate', price:8500, available:true, platJour:false, category:'plat', tags:'Plats principaux,Pizza,Cuisine italienne,Viandes,Non épicé,Déjeuner,Snack' },
  { emoji:'🍕', image:'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop', name:'Pizza Végétarienne', desc:'Poivrons, champignons, olives, oignon', price:8000, available:true, platJour:false, category:'plat', tags:'Plats principaux,Pizza,Cuisine italienne,Végétarien,Non épicé,Déjeuner' },
  { emoji:'🍕', image:'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop', name:'Pizza Reine', desc:'Jambon, champignons, œuf, mozzarella', price:9000, available:true, platJour:false, category:'plat', tags:'Plats principaux,Pizza,Cuisine italienne,Viandes,Non épicé,Déjeuner' },

  // ═══════════════════════════════════════════
  // 🍔 BURGERS SUPPLÉMENTAIRES
  // ═══════════════════════════════════════════
  { emoji:'🍔', image:'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop', name:'Chicken Burger Pané', desc:'Filet de poulet pané, salade, mayo', price:8000, available:true, platJour:false, category:'plat', tags:'Plats principaux,Burgers,Poulet,Cuisine américaine,Peu épicé,Déjeuner,Snack' },
  { emoji:'🍔', image:'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop', name:'Veggie Burger', desc:'Steak de haricots, avocat, tomate, pain complet', price:7500, available:true, platJour:false, category:'plat', tags:'Plats principaux,Burgers,Végétarien,Cuisine américaine,Non épicé,Déjeuner,Snack' },
  { emoji:'🍔', image:'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop', name:'Double Cheeseburger', desc:'Double steak, double cheddar, cornichons', price:11000, available:true, platJour:false, category:'plat', tags:'Plats principaux,Burgers,Cuisine américaine,Viandes,Non épicé,Meilleures ventes,Déjeuner' },

  // ═══════════════════════════════════════════
  // 🍜 SOUPES SUPPLÉMENTAIRES
  // ═══════════════════════════════════════════
  { emoji:'🍜', image:'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop', name:'Ramen Japonais', desc:'Bouillon riche, nouilles, œuf, porc, algae', price:7000, available:true, platJour:false, category:'plat', tags:'Plats principaux,Soupes,Pâtes,Cuisine japonaise,Peu épicé,Recommandations du chef,Déjeuner' },
  { emoji:'🍲', image:'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop', name:'Pho Bo Vietnamien', desc:'Soupe de nouilles au bœuf, herbes fraîches', price:6500, available:true, platJour:false, category:'plat', tags:'Plats principaux,Soupes,Pâtes,Cuisine chinoise,Peu épicé,Déjeuner' },
  { emoji:'🥣', image:'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop', name:'Gaspacho Andalou', desc:'Soupe froide tomate, concombre, ail', price:3500, available:true, platJour:false, category:'entree', tags:'Entrées,Soupes,Cuisine espagnole,Végétarien,Végan,Sans gluten,Non épicé,Déjeuner' },

  // ═══════════════════════════════════════════
  // 🌮 MEXICAIN SUPPLÉMENTAIRE
  // ═══════════════════════════════════════════
  { emoji:'🌮', image:'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&h=300&fit=crop', name:'Burrito Poulet', desc:'Riz, poulet, haricots, guacamole, crème', price:7000, available:true, platJour:false, category:'plat', tags:'Plats principaux,Sandwichs,Poulet,Cuisine mexicaine,Peu épicé,Déjeuner,Snack' },
  { emoji:'🫔', image:'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&h=300&fit=crop', name:'Quesadilla Végétarienne', desc:'Tortilla, fromage, poivrons, maïs', price:5500, available:true, platJour:false, category:'plat', tags:'Plats principaux,Végétarien,Cuisine mexicaine,Non épicé,Déjeuner,Snack' },
  { emoji:'🌮', image:'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&h=300&fit=crop', name:'Nachos Suprême', desc:'Chips, fromage, jalapeños, guacamole, crème', price:5000, available:true, platJour:false, category:'entree', tags:'Entrées,Végétarien,Cuisine mexicaine,Épicé,Snack,Apéritif' },

  // ═══════════════════════════════════════════
  // 🍗 POULET SUPPLÉMENTAIRE
  // ═══════════════════════════════════════════
  { emoji:'🍗', image:'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop', name:'Poulet Teriyaki', desc:'Poulet laqué teriyaki, riz, légumes vapeur', price:8000, available:true, platJour:false, category:'plat', tags:'Plats principaux,Poulet,Cuisine japonaise,Peu épicé,Déjeuner' },
  { emoji:'🍗', image:'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop', name:'Poulet Tikka Masala', desc:'Poulet au curry crémeux, riz basmati', price:8500, available:true, platJour:false, category:'plat', tags:'Plats principaux,Poulet,Cuisine indienne,Épicé,Recommandations du chef,Déjeuner' },
  { emoji:'🍗', image:'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop', name:'Poulet Frit Croustillant', desc:'Poulet pané croustillant, frites, salade', price:7000, available:true, platJour:false, category:'plat', tags:'Plats principaux,Poulet,Cuisine américaine,Non épicé,Meilleures ventes,Déjeuner,Snack' },

  // ═══════════════════════════════════════════
  // 🐄 VIANDES SUPPLÉMENTAIRES
  // ═══════════════════════════════════════════
  { emoji:'🥩', image:'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop', name:'Entrecôte Grillée', desc:'Entrecôte 300g, sauce au poivre, frites', price:18000, available:true, platJour:false, category:'plat', tags:'Plats principaux,Viandes,Cuisine française,Grillades,Épicé,Recommandations du chef,Dîner' },
  { emoji:'🥩', image:'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop', name:'Filet de Boeuf Rossini', desc:'Filet mignon, foie gras, truffe, pommes', price:22000, available:true, platJour:false, category:'plat', tags:'Plats principaux,Viandes,Cuisine française,Grillades,Non épicé,Recommandations du chef,Dîner' },
  { emoji:'🍖', image:'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop', name:'Saucisse de Toulouse', desc:'Saucisse fraîche grille, pommes aligot', price:8000, available:true, platJour:false, category:'plat', tags:'Plats principaux,Viandes,Cuisine française,Grillades,Non épicé,Déjeuner' },

  // ═══════════════════════════════════════════
  // 🐟 POISSONS SUPPLÉMENTAIRES
  // ═══════════════════════════════════════════
  { emoji:'🐟', image:'https://images.unsplash.com/photo-1534766555764-ce878a5e3a2b?w=400&h=300&fit=crop', name:'Risotto aux Fruits de Mer', desc:'Riz crémeux, crevettes, moules, encornets', price:12000, available:true, platJour:false, category:'plat', tags:'Plats principaux,Poissons et fruits de mer,Riz,Cuisine italienne,Non épicé,Dîner' },
  { emoji:'🐟', image:'https://images.unsplash.com/photo-1534766555764-ce878a5e3a2b?w=400&h=300&fit=crop', name:'Filet de Sole Meunière', desc:'Filet de sole beurre citron, haricots verts', price:14000, available:true, platJour:false, category:'plat', tags:'Plats principaux,Poissons et fruits de mer,Cuisine française,Non épicé,Recommandations du chef,Dîner' },
  { emoji:'🦐', image:'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400&h=300&fit=crop', name:'Crevettes Sautées Gambas', desc:'Gambas sautées à l\'ail, vin blanc, persil', price:11000, available:true, platJour:false, category:'plat', tags:'Plats principaux,Poissons et fruits de mer,Cuisine espagnole,Peu épicé,Dîner' },

  // ═══════════════════════════════════════════
  // 🍝 PÂTES SUPPLÉMENTAIRES
  // ═══════════════════════════════════════════
  { emoji:'🍝', image:'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=300&fit=crop', name:'Pâtes Bolognaise', desc:'Sauce tomate au bœuf, parmesan', price:6500, available:true, platJour:false, category:'plat', tags:'Plats principaux,Pâtes,Cuisine italienne,Viandes,Non épicé,Déjeuner' },
  { emoji:'🍝', image:'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=300&fit=crop', name:'Pâtes au Pesto', desc:'Pesto basilic, pignons, parmesan', price:6000, available:true, platJour:false, category:'plat', tags:'Plats principaux,Pâtes,Cuisine italienne,Végétarien,Non épicé,Déjeuner' },
  { emoji:'🍝', image:'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=300&fit=crop', name:'Pâtes Alfredo Poulet', desc:'Sauce crémeuse, poulet grillé, parmesan', price:7500, available:true, platJour:false, category:'plat', tags:'Plats principaux,Pâtes,Poulet,Cuisine italienne,Non épicé,Déjeuner' },
];

// Check for duplicates by name
const existingNames = new Set(existing.map(d => d.name));
let added = 0;
newDishes.forEach(d => {
  if (!existingNames.has(d.name)) {
    d.id = ++maxId + added;
    d.createdAt = now;
    db.get('dishes').push(d).write();
    added++;
  }
});

console.log(`[SEED+] ${added} nouveaux plats ajoutés ! Total: ${db.get('dishes').value().length}`);
