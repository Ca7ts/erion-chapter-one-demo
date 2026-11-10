// One original painted effect per species. No shared main texture or old palette fallback.
export const designs={
 'cliff-petrel':{kind:'scissor',uv:[.48,.42],color:[.65,.88,1],note:'雙翼交錯剪風，銀刃切面向前掠出'},
 'cliff-ram':{kind:'salt-ram',uv:[.23,.32],color:[1,.54,.34],note:'鹽晶角蓄壓，楔形碎晶隨突撞前射'},
 'cliff-limpet':{kind:'scrape',uv:[.26,.77],color:[.78,.61,1],note:'掀殼後貼地弧刮，碎殼與鹽屑低空飛散'},
 'cliff-windhorn':{kind:'horns',uv:[.17,.18],uv2:[.53,.18],color:[1,.89,.62],note:'雙角交錯共鳴，疊出兩道干涉音壓'},
 'harbor-crab':{kind:'ceramic-sweep',uv:[.18,.7],color:[1,.61,.3],note:'巨螯橫掃，陶質碎片沿接觸弧爆出'},
 'harbor-eel':{kind:'tar-bind',uv:[.48,.62],color:[.49,.68,.67],note:'多股焦油鐵索拉開後向中心絞緊'},
 'harbor-float':{kind:'three-pecks',uv:[.09,.39],color:[1,.81,.67],note:'三段俯啄，各有獨立高速穿刺爆點'},
 'harbor-keel':{kind:'prow',uv:[.16,.62],color:[.38,.88,.88],note:'艏柱前衝，船艏形水牆向兩側劈開'},
 'reef-mantis':{kind:'cavitation',uv:[.17,.56],uv2:[.32,.59],color:[.51,1,.84],note:'雙拳短促彈射，虹彩空泡先壓縮再炸開'},
 'reef-urchin':{kind:'spines',uv:[.5,.5],color:[.65,.84,1],note:'收刺後全向放射，黑曜尖針穿過海水'},
 'reef-anemone':{kind:'corolla',uv:[.5,.43],color:[1,.48,.55],note:'花冠展開蓄勢，肉質觸瓣向內合咬'},
 'reef-murex':{kind:'mouth-tide',uv:[.9,.68],color:[.73,.63,1],note:'嘴部向前鳴擊，三重音壓推起紫銀海潮'},
 'seabed-skate':{kind:'sand-whip',uv:[.79,.29],color:[1,.78,.43],note:'刺尾揮出 S 形沙刃，砂礫隨重力落下'},
 'seabed-shard':{kind:'pearls',uv:[.24,.59],color:[.89,.78,1],note:'張殼噴吐虹彩珍珠，連續彈射後留下水珠尾跡'},
 'seabed-bone':{kind:'fish-bones',uv:[.15,.63],color:[1,.9,.7],note:'三批長短彎曲不同的魚骨刺散射'},
 'seabed-oath':{kind:'ground-tide',uv:[.54,.88],color:[.45,.89,1],note:'腹底中心落壓，環形海浪向四周擴散消散'},
 'gate-gunnel':{kind:'reef-ram',uv:[.2,.43],color:[.4,.84,1],note:'黑曜撞角破開逆流，撞點迸出礁岩碎片'},
 'gate-chiton':{kind:'plate-roll',uv:[.5,.52],color:[1,.68,.43],note:'鎖甲逐層翻轉，七段甲片錯拍滾擊'},
 'gate-siphon':{kind:'multi-jet',uv:[.39,.32],color:[.4,.94,1],note:'五個嘴同步高壓噴水，各自方向與嘴部位置連動'},
 'gate-horse':{kind:'twin-hooves',uv:[.16,.8],uv2:[.28,.85],color:[.64,.9,1],note:'雙蹄落壓，兩道分流浪牆截斷潮水'},
 'temple-lamp':{kind:'ash-wings',uv:[.49,.45],color:[1,.52,.23],note:'雙翼振出層疊灰潮，暗灰飛屑與餘燼離散'},
 'temple-mask':{kind:'salt-tears',uv:[.43,.29],uv2:[.61,.3],color:[.91,.65,1],note:'雙眼凝聚晶鹽淚，兩束晶滴射出後墜落'},
 'temple-egret':{kind:'rust-pierce',uv:[.84,.18],color:[1,.58,.29],note:'長喙精準單刺，鏽銅刨屑拖出狹長破空'},
 'temple-ewer':{kind:'ritual-pour',uv:[.14,.42],color:[1,.51,.26],note:'盂口隨傾倒噴出黏稠祭液，落地潑濺'},
 'core-nautilus':{kind:'reverse-spiral',uv:[.57,.5],color:[.65,.73,1],note:'殼室逆時針聚水，再以反向推力送出螺旋潮'},
 'core-ring':{kind:'wedge-bite',uv:[.32,.2],color:[.54,1,.77],note:'銅楔節甲絞緊，雙毒牙相向反咬'},
 'core-votive':{kind:'crystal-feet',uv:[.46,.84],color:[1,.38,.45],note:'多足依次踏出赤晶爆裂，碎晶向上反彈'},
 'core-seal':{kind:'jade-closure',uv:[.53,.46],color:[.5,.95,1],note:'錯位玉玦反向輪轉，合環瞬間釋放重力潮'}
};
export const clamp=x=>Math.max(0,Math.min(1,x));
export const burst=x=>1-Math.pow(1-clamp(x),4);
export function waveEnvelope(age){return{radius:age<0?0:burst(age/.95),alpha:age<0||age>1.25?0:Math.pow(1-clamp(age/1.25),1.35)};}
export function fishBoneParticles(age){return Array.from({length:36},(_,i)=>{const seed=((i*73+19)%101)/101,delay=Math.floor(i/12)*.065,life=(age-delay)/.64;return{i,cell:i%6,life,angle:Math.PI+(seed-.5)*.85,scale:.65+seed*.9,speed:.6+seed*.55,alpha:life>=0&&life<1?1-clamp((life-.65)/.35):0};});}
export function pearlParticles(age){return Array.from({length:5},(_,i)=>({i,life:(age-i*.075)/.62,angle:Math.PI-.05+(i-2)*.11,scale:1-i*.07})).map(p=>({...p,alpha:p.life>=0&&p.life<1?1-clamp((p.life-.82)/.18):0}));}
