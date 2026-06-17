// database/db.js
const low      = require('lowdb');
const path     = require('path');
const bcrypt   = require('bcryptjs');
const fs       = require('fs');

const isVercel = !!process.env.VERCEL;

let adapter, db;

if (isVercel) {
  const Memory = require('lowdb/adapters/Memory');
  adapter = new Memory();
  db = low(adapter);
  console.log('[DB] Mode Vercel → mémoire (données temporaires)');
} else {
  const FileSync = require('lowdb/adapters/FileSync');
  const DB_DIR = path.join(__dirname, 'data');
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
  adapter = new FileSync(path.join(DB_DIR, 'restaurant.json'));
  db = low(adapter);
  console.log('[DB] Mode local → fichier restaurant.json');
}

db.defaults({
  meta: { orderCounter: 9, tableCounter: 8, reservationCounter: 0, createdAt: new Date().toISOString(),
    delivery: { restaurantLat:-19.82396, restaurantLng:47.06214, feePerKm:1500, minFee:3000 },
    phone: process.env.RESTO_PHONE || '0388451402'
  },
  users: [],
  tables: [
    { id:1,  name:'T1',  seats:2,  x:1, y:1, zone:'Terrasse',  status:'free',     orderId:null },
    { id:2,  name:'T2',  seats:2,  x:2, y:1, zone:'Terrasse',  status:'occupied', orderId:1 },
    { id:3,  name:'T3',  seats:4,  x:1, y:2, zone:'Intérieur', status:'occupied', orderId:2 },
    { id:4,  name:'T4',  seats:4,  x:2, y:2, zone:'Intérieur', status:'free',     orderId:null },
    { id:5,  name:'T5',  seats:6,  x:3, y:1, zone:'Terrasse',  status:'reserved', orderId:null },
    { id:6,  name:'T6',  seats:6,  x:3, y:2, zone:'Intérieur', status:'free',     orderId:null },
    { id:7,  name:'T7',  seats:8,  x:1, y:3, zone:'VIP',       status:'free',     orderId:null },
    { id:8,  name:'T8',  seats:10, x:2, y:3, zone:'VIP',       status:'free',     orderId:null },
  ],
  reservations: [],
  payments: [],
  landing: {
    hero: {
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&h=900&fit=crop',
      tag: 'Cuisine Malgache d\'Exception',
      title: 'L\'Art du Goût, Tradition & Passion',
      subtitle: 'Une expérience gastronomique où chaque ingrédient raconte une histoire de savoir-faire ancestral et de produits frais du terroir malgache.',
    },
    story: {
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=500&fit=crop',
      tag: 'Depuis 2020',
      title: 'Notre Histoire',
      desc1: 'Chez T-isakafo, nous croyons que la cuisine est une forme d\'art qui se vit au quotidien. Notre approche est celle d\'un artisan : respect du produit brut, précision du geste et amour du détail.',
      desc2: 'Chaque matin, nos chefs sélectionnent les meilleurs produits auprès de producteurs locaux passionnés pour vous offrir une table sincère et mémorable.',
      quote: '« La cuisine malgache est un héritage vivant. Chaque plat porte en lui l\'âme de notre terre et la chaleur de notre peuple. »',
    },
    cta: {
      title: 'Prêt à Commander ?',
      desc: 'Créez votre compte en quelques secondes et profitez d\'une commande rapide et simple.',
    },
    footer: {
      text: '© 2025 T-isakafo. Tous droits réservés.',
      links: ['Menu', 'Réservation', 'À propos', 'Contact'],
    },
    auth: {
      image: 'images.jpe',
      quote: '"Une grande cuisine ne se limite pas aux ingrédients — elle raconte une histoire."',
      attrib: '— T-isakafo',
    },
  },
  dishes: [
    { id:1, emoji:'🥘', image:'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&h=300&fit=crop', name:"Ravitoto sy Hen'omby",  desc:'Feuilles de manioc & bœuf mijoté',  price:6500, available:true,  platJour:false, category:'plat',    tags:'Plats principaux,Viandes,Cuisine malgache,Épicé', createdAt:new Date().toISOString() },
    { id:2, emoji:'🍗', image:'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop', name:'Poulet Rôti aux Herbes', desc:'Mariné aux herbes locales',          price:7500, available:true,  platJour:true,  category:'plat',    tags:'Plats principaux,Poulet,Cuisine malgache,Peu épicé,Recommandations du chef', createdAt:new Date().toISOString() },
    { id:3, emoji:'🍲', image:'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop', name:"Vary amin'Anana",        desc:'Riz avec brèdes malgaches',          price:4000, available:true,  platJour:false, category:'plat',    tags:'Plats principaux,Riz,Cuisine malgache,Végétarien,Non épicé', createdAt:new Date().toISOString() },
    { id:4, emoji:'🥣', image:'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop', name:'Ro Mazava',              desc:'Bouillon de légumes clair',          price:3500, available:true,  platJour:false, category:'entree',  tags:'Entrées,Soupes,Cuisine malgache,Végétarien,Non épicé,Déjeuner', createdAt:new Date().toISOString() },
    { id:5, emoji:'🫓', image:'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop', name:'Mofo Gasy',              desc:'Pain traditionnel malgache',         price:1500, available:true,  platJour:false, category:'accomp',  tags:'Accompagnements,Cuisine malgache,Végétarien,Non épicé,Petit-déjeuner,Snack', createdAt:new Date().toISOString() },
    { id:6, emoji:'🍜', image:'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop', name:'Lasopy',                 desc:'Soupe de légumes variés',            price:3000, available:true,  platJour:false, category:'entree',  tags:'Entrées,Soupes,Cuisine malgache,Végétarien,Non épicé,Déjeuner', createdAt:new Date().toISOString() },
    { id:7, emoji:'🍌', image:'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400&h=300&fit=crop', name:'Akondro Mafana',         desc:'Banane flambée sucrée',              price:2500, available:false, platJour:false, category:'dessert', tags:'Desserts,Cuisine malgache,Végétarien,Peu épicé,Snack', createdAt:new Date().toISOString() },
    { id:8, emoji:'🥤', image:'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&h=300&fit=crop', name:'Jus de Fruits Frais',    desc:'Mangue, Papaye ou Ananas',           price:2000, available:true,  platJour:false, category:'boisson', tags:'Boissons,Cuisine malgache,Végétarien,Végan,Non épicé,Snack', createdAt:new Date().toISOString() },
  ],
  orders: [
    { id:1, client:'Rasoa Berthine',   clientId:null, items:["Ravitoto sy Hen'omby",'Mofo Gasy'], status:'ready',     type:'dine',     time:'08:12', price:8000,  isFirst:true,  address:null, deliveryStep:0, note:'', tableNumber:2, createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() },
    { id:2, client:'Rakoto Jean',      clientId:null, items:['Poulet Rôti aux Herbes'],           status:'preparing', type:'dine',     time:'08:24', price:7500,  isFirst:false, address:null, deliveryStep:0, note:'', tableNumber:3, createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() },
    { id:3, client:'Randriamanana T.', clientId:null, items:['Ro Mazava',"Vary amin'Anana"],      status:'pending',   type:'dine',     time:'08:31', price:7500,  isFirst:false, address:null, deliveryStep:0, note:'', tableNumber:null, createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() },
    { id:4, client:'Rabe Sylvie',      clientId:null, items:['Poulet Rôti aux Herbes','Lasopy'],  status:'delivery',  type:'delivery', time:'08:05', price:10500, isFirst:false, address:'Lot 12 Ambatonakanga', deliveryStep:2, note:'', tableNumber:null, createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() },
    { id:5, client:'Andriantsoa M.',   clientId:null, items:['Mofo Gasy','Ro Mazava'],            status:'done',      type:'dine',     time:'07:55', price:4500,  isFirst:false, address:null, deliveryStep:0, note:'', tableNumber:null, createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() },
  ],
}).write();

// Créer admin si inexistant
if (!db.get('users').find({ role:'admin' }).value()) {
  db.get('users').push({ id:1, username:'admin', password:bcrypt.hashSync(process.env.ADMIN_PASSWORD||'admin123',10), role:'admin', name:'Gérant', phone:'', createdAt:new Date().toISOString() }).write();
  console.log('[DB] Admin créé → admin / admin123');
}

module.exports = db;
