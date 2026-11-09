'use strict';
// Only the left/right sectors of the existing eight-direction hero gain speed.
// Keep front/back/diagonals and the residents' independent cadence unchanged.
window.heroDirectionSpeed=function(dx,dy){
 if(!Number.isFinite(dx)||!Number.isFinite(dy)||Math.abs(dx)<1e-8)return 1;
 return Math.abs(dy)<Math.abs(dx)*Math.tan(Math.PI/8)?1.30:1;
};
