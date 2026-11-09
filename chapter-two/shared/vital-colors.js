(function(root){'use strict';
 function band(value,max,kind='hp'){const ratio=Math.max(0,Math.min(1,Number(value)/Math.max(1,Number(max)||1)));return kind==='mp'?(ratio<=.35?'mp-low':'mp'):ratio<=.35?'low':ratio>=.7?'high':'mid';}
 function apply(node,value,max,kind='hp'){if(!node)return;const next=band(value,max,kind);if(node.dataset.vitalBand!==next)node.dataset.vitalBand=next;}
 const api={band,apply};if(typeof module!=='undefined')module.exports=api;else root.VitalColors=api;
})(typeof window!=='undefined'?window:globalThis);
