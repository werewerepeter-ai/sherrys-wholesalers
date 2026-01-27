const products = [
  // ========== HOME APPLIANCES ==========
  
  // Major Appliances
  {
  id: 1,
  name: "Samsung Double Door Fridge 380L",
  category: "Home Appliances",
  subcategory: "Refrigerators",
  price: 85000,
  oldPrice: 95000,
  image: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400",
  details: {
    description: "Premium Samsung double door refrigerator with advanced cooling technology and energy-efficient design. Perfect for families who need reliable food storage.",
    features: [
      "380L total capacity",
      "Multi Air Flow cooling system",
      "Energy efficient - saves on electricity bills",
      "Adjustable shelves for flexible storage",
      "Frost-free technology",
      "Vegetable crisper drawer",
      "LED interior lighting"
    ],
    specifications: {
      "Capacity": "380 Liters",
      "Type": "Double Door",
      "Energy Rating": "A+",
      "Dimensions": "170cm x 70cm x 65cm",
      "Warranty": "1 Year Manufacturer Warranty",
      "Color": "Silver"
    }
  }
},
{
  id: 2,
  name: "LG Single Door Fridge 220L",
    category: "Home Appliances",
    subcategory: "Refrigerators",
    price: 45000,
    oldPrice: 52000,
    image: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400"
  },
  {
    id: 3,
    name: "Deep Freezer 300L",
    category: "Home Appliances",
    subcategory: "Freezers",
    price: 38000,
    oldPrice: 42000,
    image: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400"
  },
  {
    id: 4,
    name: "LG 7kg Front Load Washing Machine",
    category: "Home Appliances",
    subcategory: "Washing Machines",
    price: 45000,
    oldPrice: 52000,
    image: "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=400"
  },
  {
    id: 5,
    name: "Samsung 9kg Top Load Washer",
    category: "Home Appliances",
    subcategory: "Washing Machines",
    price: 52000,
    oldPrice: 58000,
    image: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400"
  },
  {
    id: 6,
    name: "4-Burner Gas Cooker with Oven",
    category: "Home Appliances",
    subcategory: "Cookers & Ovens",
    price: 28000,
    oldPrice: 32000,
    image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400"
  },
  {
    id: 7,
    name: "Built-in Electric Oven",
    category: "Home Appliances",
    subcategory: "Cookers & Ovens",
    price: 35000,
    oldPrice: 40000,
    image: "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=400"
  },
  {
    id: 8,
    name: "Samsung Microwave 28L",
    category: "Home Appliances",
    subcategory: "Microwaves",
    price: 12500,
    oldPrice: 15000,
    image: "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=400"
  },
  {
    id: 9,
    name: "LG Microwave Oven 32L",
    category: "Home Appliances",
    subcategory: "Microwaves",
    price: 16000,
    oldPrice: 18500,
    image: "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=400"
  },

  // Electronics
  {
    id: 10,
    name: "Samsung 43\" Smart LED TV",
    category: "Home Appliances",
    subcategory: "TVs",
    price: 38000,
    oldPrice: 42000,
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400"
  },
  {
    id: 11,
    name: "LG 55\" 4K UHD Smart TV",
    category: "Home Appliances",
    subcategory: "TVs",
    price: 62000,
    oldPrice: 70000,
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400"
  },
  {
    id: 12,
    name: "Sony 65\" OLED TV",
    category: "Home Appliances",
    subcategory: "TVs",
    price: 125000,
    oldPrice: 140000,
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400"
  },
  {
    id: 13,
    name: "5.1 Home Theatre System",
    category: "Home Appliances",
    subcategory: "Home Theatres",
    price: 28000,
    oldPrice: 32000,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"
  },
  {
    id: 14,
    name: "Sony Sound Bar 2.1 Channel",
    category: "Home Appliances",
    subcategory: "Sound Systems",
    price: 18500,
    oldPrice: 22000,
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400"
  },

  // Small Appliances
  {
    id: 15,
    name: "Ramtons Blender 1.5L",
    category: "Home Appliances",
    subcategory: "Blenders",
    price: 3500,
    oldPrice: 4200,
    image: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=400"
  },
  {
    id: 16,
    name: "Electric Kettle 1.8L",
    category: "Home Appliances",
    subcategory: "Kettles",
    price: 2200,
    oldPrice: 2800,
    image: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=400"
  },
  {
    id: 17,
    name: "Dry Iron Box",
    category: "Home Appliances",
    subcategory: "Irons",
    price: 1500,
    oldPrice: 1800,
    image: "https://images.unsplash.com/photo-1580507754330-48b0099bc8c8?w=400"
  },
  {
    id: 18,
    name: "Steam Iron",
    category: "Home Appliances",
    subcategory: "Irons",
    price: 2800,
    oldPrice: 3200,
    image: "https://images.unsplash.com/photo-1580507754330-48b0099bc8c8?w=400"
  },
  {
    id: 19,
    name: "4-Slice Toaster",
    category: "Home Appliances",
    subcategory: "Toasters",
    price: 3200,
    oldPrice: 3800,
    image: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=400"
  },
  {
    id: 20,
    name: "Hand Mixer",
    category: "Home Appliances",
    subcategory: "Mixers",
    price: 2500,
    oldPrice: 3000,
    image: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=400"
  },

  // Climate & Utility
  {
    id: 21,
    name: "Standing Fan 18\"",
    category: "Home Appliances",
    subcategory: "Fans",
    price: 4500,
    oldPrice: 5200,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"
  },
  {
    id: 22,
    name: "Wall-Mounted Fan 16\"",
    category: "Home Appliances",
    subcategory: "Fans",
    price: 3800,
    oldPrice: 4500,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"
  },
  {
    id: 23,
    name: "Room Heater 2000W",
    category: "Home Appliances",
    subcategory: "Heaters",
    price: 5500,
    oldPrice: 6500,
    image: "https://images.unsplash.com/photo-1545259742-24f940091eba?w=400"
  },
  {
    id: 24,
    name: "Hot & Cold Water Dispenser",
    category: "Home Appliances",
    subcategory: "Water Dispensers",
    price: 12000,
    oldPrice: 14000,
    image: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400"
  },

  // ========== KITCHEN PRODUCTS ==========
  
  {
    id: 25,
    name: "Non-Stick Cookware Set 12pcs",
    category: "Kitchen",
    subcategory: "Cookware Sets",
    price: 8500,
    oldPrice: 10000,
    image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400"
  },
  {
    id: 26,
    name: "Stainless Steel Pot Set 5pcs",
    category: "Kitchen",
    subcategory: "Pots & Pans",
    price: 6200,
    oldPrice: 7500,
    image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400"
  },
  {
    id: 27,
    name: "Ceramic Frying Pan 28cm",
    category: "Kitchen",
    subcategory: "Pots & Pans",
    price: 2800,
    oldPrice: 3500,
    image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400"
  },
  {
    id: 28,
    name: "Dinner Plate Set 24pcs",
    category: "Kitchen",
    subcategory: "Plates, Bowls & Cups",
    price: 4500,
    oldPrice: 5500,
    image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400"
  },
  {
    id: 29,
    name: "Glass Cup Set 12pcs",
    category: "Kitchen",
    subcategory: "Plates, Bowls & Cups",
    price: 2200,
    oldPrice: 2800,
    image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400"
  },
  {
    id: 30,
    name: "Stainless Steel Cutlery Set 24pcs",
    category: "Kitchen",
    subcategory: "Cutlery",
    price: 3800,
    oldPrice: 4500,
    image: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=400"
  },
  {
    id: 31,
    name: "Food Storage Container Set 10pcs",
    category: "Kitchen",
    subcategory: "Food Storage",
    price: 2500,
    oldPrice: 3200,
    image: "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=400"
  },
  {
    id: 32,
    name: "13kg Gas Cylinder (Empty)",
    category: "Kitchen",
    subcategory: "Gas Cylinders",
    price: 4200,
    oldPrice: 5000,
    image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400"
  },
  {
    id: 33,
    name: "Gas Cylinder Regulator",
    category: "Kitchen",
    subcategory: "Gas Regulators",
    price: 800,
    oldPrice: 1200,
    image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400"
  },
  {
    id: 34,
    name: "Stainless Steel Kitchen Sink",
    category: "Kitchen",
    subcategory: "Kitchen Sinks",
    price: 6500,
    oldPrice: 7800,
    image: "https://images.unsplash.com/photo-1584622781794-8825e0b6a46c?w=400"
  },
  {
    id: 35,
    name: "Dish Rack Stainless Steel",
    category: "Kitchen",
    subcategory: "Dish Racks",
    price: 2200,
    oldPrice: 2800,
    image: "https://images.unsplash.com/photo-1584622781794-8825e0b6a46c?w=400"
  },
  {
    id: 36,
    name: "Kitchen Knife Set 6pcs",
    category: "Kitchen",
    subcategory: "Kitchen Knives",
    price: 3200,
    oldPrice: 4000,
    image: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=400"
  },

  // ========== BEDROOM PRODUCTS ==========
  
  {
    id: 37,
    name: "Queen Size Bed (Wooden Frame)",
    category: "Bedroom",
    subcategory: "Beds",
    price: 28000,
    oldPrice: 32000,
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400"
  },
  {
    id: 38,
    name: "King Size Bed (Upholstered)",
    category: "Bedroom",
    subcategory: "Beds",
    price: 45000,
    oldPrice: 52000,
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400"
  },
  {
    id: 39,
    name: "Orthopedic Mattress 6x6",
    category: "Bedroom",
    subcategory: "Mattresses",
    price: 22000,
    oldPrice: 26000,
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400"
  },
  {
    id: 40,
    name: "Memory Foam Mattress 5x6",
    category: "Bedroom",
    subcategory: "Mattresses",
    price: 18000,
    oldPrice: 22000,
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400"
  },
  {
    id: 41,
    name: "Pillows Set (4pcs)",
    category: "Bedroom",
    subcategory: "Pillows & Duvets",
    price: 3500,
    oldPrice: 4200,
    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400"
  },
  {
    id: 42,
    name: "Heavy Duvet (King Size)",
    category: "Bedroom",
    subcategory: "Pillows & Duvets",
    price: 5500,
    oldPrice: 6500,
    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400"
  },
  {
    id: 43,
    name: "Cotton Bed Sheets Set",
    category: "Bedroom",
    subcategory: "Bed Sheets",
    price: 2800,
    oldPrice: 3500,
    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400"
  },
  {
    id: 44,
    name: "3-Door Wardrobe",
    category: "Bedroom",
    subcategory: "Wardrobes",
    price: 35000,
    oldPrice: 42000,
    image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400"
  },
  {
    id: 45,
    name: "Sliding Door Wardrobe",
    category: "Bedroom",
    subcategory: "Wardrobes",
    price: 48000,
    oldPrice: 55000,
    image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400"
  },
  {
    id: 46,
    name: "Wooden Bedside Table",
    category: "Bedroom",
    subcategory: "Bedside Tables",
    price: 6500,
    oldPrice: 8000,
    image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400"
  },
  {
    id: 47,
    name: "Mosquito Net (Double)",
    category: "Bedroom",
    subcategory: "Mosquito Nets",
    price: 1500,
    oldPrice: 2000,
    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400"
  },
  {
    id: 48,
    name: "Bedside Lamp",
    category: "Bedroom",
    subcategory: "Bedroom Lamps",
    price: 2200,
    oldPrice: 2800,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400"
  },

  // ========== LIVING ROOM PRODUCTS ==========
  
  {
    id: 49,
    name: "6-Seater Fabric Sofa",
    category: "Living Room",
    subcategory: "Sofas",
    price: 62000,
    oldPrice: 70000,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400"
  },
  {
    id: 50,
    name: "L-Shaped Leather Sofa",
    category: "Living Room",
    subcategory: "Sofas",
    price: 85000,
    oldPrice: 95000,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400"
  },
  {
    id: 51,
    name: "3-Seater Recliner Sofa",
    category: "Living Room",
    subcategory: "Sofas",
    price: 58000,
    oldPrice: 65000,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400"
  },
  {
    id: 52,
    name: "Glass Top Coffee Table",
    category: "Living Room",
    subcategory: "Coffee Tables",
    price: 12000,
    oldPrice: 15000,
    image: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=400"
  },
  {
    id: 53,
    name: "Wooden Coffee Table",
    category: "Living Room",
    subcategory: "Coffee Tables",
    price: 9500,
    oldPrice: 12000,
    image: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=400"
  },
  {
    id: 54,
    name: "Modern TV Stand",
    category: "Living Room",
    subcategory: "TV Stands",
    price: 18000,
    oldPrice: 22000,
    image: "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=400"
  },
  {
    id: 55,
    name: "Wall Unit with Display",
    category: "Living Room",
    subcategory: "Wall Units",
    price: 42000,
    oldPrice: 48000,
    image: "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=400"
  },
  {
    id: 56,
    name: "Persian Carpet 6x8",
    category: "Living Room",
    subcategory: "Carpets & Rugs",
    price: 15000,
    oldPrice: 18000,
    image: "https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?w=400"
  },
  {
    id: 57,
    name: "Shaggy Rug 5x7",
    category: "Living Room",
    subcategory: "Carpets & Rugs",
    price: 8500,
    oldPrice: 10500,
    image: "https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?w=400"
  },
  {
    id: 58,
    name: "Blackout Curtains (Pair)",
    category: "Living Room",
    subcategory: "Curtains & Blinds",
    price: 6500,
    oldPrice: 8000,
    image: "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400"
  },
  {
    id: 59,
    name: "Venetian Blinds",
    category: "Living Room",
    subcategory: "Curtains & Blinds",
    price: 4500,
    oldPrice: 5500,
    image: "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400"
  },
  {
    id: 60,
    name: "LED Ceiling Light",
    category: "Living Room",
    subcategory: "Decorative Lighting",
    price: 5500,
    oldPrice: 6800,
    image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400"
  },
  {
    id: 61,
    name: "Wall Art Canvas Set",
    category: "Living Room",
    subcategory: "Wall Décor",
    price: 3500,
    oldPrice: 4500,
    image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400"
  }
];

// Get unique categories
const categories = [...new Set(products.map(p => p.category))];

// Get subcategories by category
function getSubcategories(category) {
  return [...new Set(products.filter(p => p.category === category).map(p => p.subcategory))];
}

// Filter products
function filterProducts(category = null, subcategory = null, searchTerm = null) {
  let filtered = products;
  
  if (category) {
    filtered = filtered.filter(p => p.category === category);
  }
  
  if (subcategory) {
    filtered = filtered.filter(p => p.subcategory === subcategory);
  }
  
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term) ||
      p.subcategory.toLowerCase().includes(term)
    );
  }
  
  return filtered;
}