/**
 * StadiumBuilderUtils.js - UTILITY FUNKCE A METADATA
 * 
 * OBSAH:
 * - getAvailableElements() - Kompletní seznam všech dostupných prvků s cenami a popisy
 * - getSeatPrices() - Ceny různých typů sedaček (plastic, bench, vip)
 * - getCategories() - Definice kategorií s ikonami a barvami pro UI
 * 
 * KATEGORIE:
 * Stadium: stands, infrastructure, barriers, lighting
 * Terrain: trees, vegetation, rocks, water, paths, decoration
 * Plochy: terrain_tiles (20x20m čtverce)
 * Útvary: terrain_sculpting (kopce, údolí, vulkány)
 * Brushes: terrain_painting (zvedání, snižování terénu)
 * 
 * METADATA: Každý prvek má ID, název, popis, kategorii, cenu a měnu
 * 
 * POZNÁMKA: Při aktualizaci tohoto souboru aktualizuj i tento popis!
 */

export const StadiumBuilderUtils = {

    // 💰 Získání cen sedaček
    getSeatPrices() {
      return {
        plastic: { 
          price: 500, 
          currency: 'coins',
          name: '🪑 Plastová sedačka'
        },
        bench: { 
          price: 1000, 
          currency: 'coins',
          name: '🪑 Dřevěná lavice'
        },
        vip: { 
          price: 5000, 
          currency: 'coins',
          name: '👑 VIP křeslo'
        }
      };
    },
  
    // 🌍 Kategorie pro lepší organizaci + TERRAIN
    getCategories() {
      return {
        // 🏟️ Stadium kategorie
        stands: { name: 'Tribuny', icon: '🏟️', color: '#FF9800' },
        infrastructure: { name: 'Infrastruktura', icon: '🏗️', color: '#607D8B' },
        barriers: { name: 'Zábradlí', icon: '🛡️', color: '#795548' },
        lighting: { name: 'Osvětlení', icon: '💡', color: '#FFC107' },
        
        // 🌲 Terrain kategorie
        trees: { name: 'Stromy', icon: '🌳', color: '#4CAF50' },
        vegetation: { name: 'Vegetace', icon: '🌿', color: '#8BC34A' },
        rocks: { name: 'Skály', icon: '🪨', color: '#9E9E9E' },
        water: { name: 'Vodní prvky', icon: '🌊', color: '#2196F3' },
        paths: { name: 'Cesty', icon: '🛤️', color: '#FF5722' },
        decoration: { name: 'Vybavení', icon: '🪑', color: '#6D4C41' },
        
        // 🗺️ Terrain plochy - ROZŠIŘOVÁNÍ MAPY
        terrain_tiles: { name: 'Terrain Plochy', icon: '🗺️', color: '#795548' },
        
        // 🏔️ Terrain sculpting - KOPCE A TERÉNNÍ ÚTVARY
        terrain_sculpting: { name: 'Terénní útvary', icon: '🏔️', color: '#8D6E63' },
        
        // 🎨 Terrain painting - MANUÁLNÍ ÚPRAVA VÝŠKY
        terrain_painting: { name: 'Terrain Brushes', icon: '🎨', color: '#689F38' }
      };
    },
  
    // 💰 ROZŠÍŘENO: Informace o dostupných prvcích S CENAMI + TERRAIN
    getAvailableElements() {
      return [
        // 🏟️ STADIUM objekty
        {
          id: 'small_stand',
          name: '🏟️ Malá tribuna',
          description: 'Dřevěná tribuna pro 50 lidí',
          category: 'stands',
          price: 50000,
          currency: 'coins'
        },
        {
          id: 'large_stand',
          name: '🏛️ Velká tribuna',
          description: 'Betonová tribuna pro 200 lidí',
          category: 'stands',
          price: 200000,
          currency: 'coins'
        },
        {
          id: 'concrete_stairs',
          name: '🪜 Betonové schody',
          description: 'Rovné betonové schody s konfigurovatelnou velikostí',
          category: 'infrastructure',
          price: 30000,
          currency: 'coins'
        },
        {
          id: 'curved_stairs',
          name: '🌀 Obloukové schody',
          description: 'Rovné betonové schody (stejné jako betonové schody)',
          category: 'infrastructure',
          price: 35000,
          currency: 'coins'
        },
        {
          id: 'turning_stairs',
          name: '🔄 Zatáčecí schody',
          description: 'Schody rozdělené na šířku: pravá strana + střed + levá strana',
          category: 'infrastructure',
          price: 40000,
          currency: 'coins'
        },
        {
          id: 'width_divided_stairs',
          name: '🔄 Široké zatáčecí schody',
          description: 'Schody rozdělené na šířku: pravá strana + střed + levá strana',
          category: 'infrastructure',
          price: 40000,
          currency: 'coins'
        },
        {
          id: 'progressive_turning_stairs',
          name: '🌀 Postupně zatáčecí schody',
          description: 'Každý schod se postupně zatočí o malý úhel',
          category: 'infrastructure',
          price: 45000,
          currency: 'coins'
        },
        {
          id: 'fence',
          name: '🛡️ Zábradlí',
          description: 'Kovové zábradlí 4m',
          category: 'barriers',
          price: 5000,
          currency: 'coins'
        },
        {
          id: 'corner_fence',
          name: '📐 Rohové zábradlí',
          description: 'L-shaped zábradlí pro rohy',
          category: 'barriers',
          price: 7500,
          currency: 'coins'
        },
        {
          id: 'floodlight',
          name: '💡 Reflektor',
          description: 'Vysoký stožár s 4 reflektory',
          category: 'lighting',
          price: 100000,
          currency: 'coins'
        },

        // 🌲 TERRAIN objekty - STROMY
        {
          id: 'tree_oak',
          name: '🌳 Dub',
          description: 'Mohutný listnatý strom',
          category: 'trees',
          price: 2500,
          currency: 'coins'
        },
        {
          id: 'tree_pine',
          name: '🌲 Borovice',
          description: 'Vysoký jehličnatý strom',
          category: 'trees',
          price: 2000,
          currency: 'coins'
        },

        // 🪨 TERRAIN objekty - SKÁLY
        {
          id: 'rock_small',
          name: '🪨 Malý kámen',
          description: 'Skupina malých kamenů',
          category: 'rocks',
          price: 500,
          currency: 'coins'
        },
        {
          id: 'rock_large',
          name: '⛰️ Velká skála',
          description: 'Mohutná skalní formace',
          category: 'rocks',
          price: 1500,
          currency: 'coins'
        },

        // 🌿 TERRAIN objekty - VEGETACE
        {
          id: 'bush_small',
          name: '🌿 Malý keř',
          description: 'Nízký okrasný keř',
          category: 'vegetation',
          price: 300,
          currency: 'coins'
        },
        {
          id: 'bush_large',
          name: '🫐 Velký keř',
          description: 'Rozsáhlý živý plot',
          category: 'vegetation',
          price: 800,
          currency: 'coins'
        },
        {
          id: 'flower_patch',
          name: '🌸 Květinový záhon',
          description: 'Barevný květinový kruh',
          category: 'vegetation',
          price: 1000,
          currency: 'coins'
        },

        // 💧 TERRAIN objekty - VODA
        {
          id: 'water_pond',
          name: '🌊 Malé jezírko',
          description: 'Okrasné vodní prvek',
          category: 'water',
          price: 3000,
          currency: 'coins'
        },

        // 🛤️ TERRAIN objekty - CESTY
        {
          id: 'path_stone',
          name: '🛤️ Kamenná cesta',
          description: 'Dlážděná cesta 4m',
          category: 'paths',
          price: 1200,
          currency: 'coins'
        },
        {
          id: 'path_dirt',
          name: '🌾 Pěšina',
          description: 'Zemní pěšina 3m',
          category: 'paths',
          price: 600,
          currency: 'coins'
        },

        // 🪑 TERRAIN objekty - DOPLŇKY
        {
          id: 'fence_wood',
          name: '🪵 Dřevěný plot',
          description: 'Rustikální dřevěné oplocení',
          category: 'decoration',
          price: 2000,
          currency: 'coins'
        },
        {
          id: 'bench_park',
          name: '🪑 Parková lavička',
          description: 'Dřevěná lavička s opěradlem',
          category: 'decoration',
          price: 1500,
          currency: 'coins'
        },

        // 🗺️ TERRAIN PLOCHY - ROZŠIŘOVÁNÍ MAPY (20x20m čtverce)
        {
          id: 'terrain_grass',
          name: '🌱 Travnatá plocha',
          description: 'Zelená tráva 20x20m',
          category: 'terrain_tiles',
          price: 5000,
          currency: 'coins'
        },
        {
          id: 'terrain_dirt',
          name: '🟤 Zemní plocha',
          description: 'Hnědá hlína 20x20m',
          category: 'terrain_tiles',
          price: 3000,
          currency: 'coins'
        },
        {
          id: 'terrain_sand',
          name: '🟨 Písečná plocha',
          description: 'Žlutý písek 20x20m',
          category: 'terrain_tiles',
          price: 4000,
          currency: 'coins'
        },
        {
          id: 'terrain_snow',
          name: '⬜ Sněhová plocha',
          description: 'Bílý sníh 20x20m',
          category: 'terrain_tiles',
          price: 6000,
          currency: 'coins'
        },
        {
          id: 'terrain_concrete',
          name: '⬛ Betonová plocha',
          description: 'Šedý beton 20x20m',
          category: 'terrain_tiles',
          price: 8000,
          currency: 'coins'
        },
        {
          id: 'terrain_forest',
          name: '🌲 Lesní plocha',
          description: 'Hustý les 20x20m',
          category: 'terrain_tiles',
          price: 10000,
          currency: 'coins'
        },
        {
          id: 'terrain_desert',
          name: '🏜️ Pouštní plocha',
          description: 'Poušť s dunami 20x20m',
          category: 'terrain_tiles',
          price: 7000,
          currency: 'coins'
        },
        {
          id: 'terrain_water',
          name: '🌊 Vodní plocha',
          description: 'Čistá voda 20x20m',
          category: 'terrain_tiles',
          price: 12000,
          currency: 'coins'
        },

        // 🏔️ TERRAIN SCULPTING - KOPCE A TERÉNNÍ ÚTVARY
        {
          id: 'hill_small',
          name: '⛰️ Malý kopec',
          description: 'Travnatý kopec 10x10m',
          category: 'terrain_sculpting',
          price: 8000,
          currency: 'coins'
        },
        {
          id: 'hill_large',
          name: '🏔️ Velký kopec',
          description: 'Mohutný kopec 15x15m',
          category: 'terrain_sculpting',
          price: 15000,
          currency: 'coins'
        },
        {
          id: 'valley_small',
          name: '🕳️ Malé údolí',
          description: 'Mělké údolí 12x8m',
          category: 'terrain_sculpting',
          price: 6000,
          currency: 'coins'
        },
        {
          id: 'plateau',
          name: '🏛️ Plató',
          description: 'Rovná vyvýšenina 15x10m',
          category: 'terrain_sculpting',
          price: 10000,
          currency: 'coins'
        },
        {
          id: 'canyon',
          name: '🏞️ Kaňon',
          description: 'Hluboká strž 20x5m',
          category: 'terrain_sculpting',
          price: 12000,
          currency: 'coins'
        },
        {
          id: 'volcano',
          name: '🌋 Vulkán',
          description: 'Kónický vulkán s kráterem',
          category: 'terrain_sculpting',
          price: 25000,
          currency: 'coins'
        },
        {
          id: 'crater',
          name: '🕳️ Kráter',
          description: 'Velký kráter 12m průměr',
          category: 'terrain_sculpting',
          price: 8000,
          currency: 'coins'
        },
        {
          id: 'ridge',
          name: '⚡ Hřeben',
          description: 'Ostrý horský hřeben 15x3m',
          category: 'terrain_sculpting',
          price: 14000,
          currency: 'coins'
        },

        // 🎨 TERRAIN PAINTING - MANUÁLNÍ ÚPRAVA VÝŠKY
        {
          id: 'terrain_raise',
          name: '⬆️ Zvednout terén',
          description: 'Zvedni terén o +1m (brush 5x5m)',
          category: 'terrain_painting',
          price: 1000,
          currency: 'coins'
        },
        {
          id: 'terrain_lower',
          name: '⬇️ Snížit terén',
          description: 'Sniž terén o -1m (brush 5x5m)',
          category: 'terrain_painting',
          price: 1000,
          currency: 'coins'
        },
        {
          id: 'terrain_raise_large',
          name: '⏫ Zvednout více',
          description: 'Zvedni terén o +2m (brush 8x8m)',
          category: 'terrain_painting',
          price: 2000,
          currency: 'coins'
        },
        {
          id: 'terrain_lower_large',
          name: '⏬ Snížit více',
          description: 'Sniž terén o -2m (brush 8x8m)',
          category: 'terrain_painting',
          price: 2000,
          currency: 'coins'
        },
        {
          id: 'terrain_flatten',
          name: '📏 Srovnat terén',
          description: 'Srovnej na úroveň 0m (brush 6x6m)',
          category: 'terrain_painting',
          price: 1500,
          currency: 'coins'
        },
        {
          id: 'terrain_smooth',
          name: '🌊 Vyhladit terén',
          description: 'Vyhlaď nerovnosti (brush 4x4m)',
          category: 'terrain_painting',
          price: 800,
          currency: 'coins'
        }
      ];
    }
  };