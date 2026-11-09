/* HD backgrounds only. World coordinates and independent interactive layers stay unchanged. */
window.CHAPTER_TWO_MAP_HD=Object.fromEntries(['cliff','cliff-restored','harbor','harbor-restored','reef','seabed','gate','temple','core'].map(id=>[id,'https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-map-hd-20261026/'+id+'.webp']));
for(const id of ['harbor','harbor-restored','reef','seabed','gate','temple']){
 const entry=window.WORLD_PROP_CATALOG?.['c2:'+id];if(entry)entry.hd=window.CHAPTER_TWO_MAP_HD[id];
}
// Preserve the approved ultra-wide map framing; discard generation-only black padding at render time.
CHAPTER_TWO_MAP_HD.seabed='https://raw.githubusercontent.com/Ca7ts/erion-chapter-one-demo/c1e68aba7da01c0ceaac6df2b719fd9d48a03316/chapter-two/assets/chapter-two-map-hd-20261026/seabed-letterbox.webp';
if(window.WORLD_PROP_CATALOG?.['c2:seabed'])Object.assign(WORLD_PROP_CATALOG['c2:seabed'],{hd:CHAPTER_TWO_MAP_HD.seabed,hdCrop:[0,55,2172,614]});
