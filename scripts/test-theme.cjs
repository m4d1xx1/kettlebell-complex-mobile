// Theme contract independent of native rendering. Device checks remain required.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict'),ts=require('typescript');
let mode='light';const exportsObject={};
const root=path.resolve(__dirname,'..');
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,'src/theme.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{
 exports:exportsObject,require:id=>id==='react'?{useMemo:fn=>fn()}:{useColorScheme:()=>mode},
});
const {palettes,useThemeColors,useThemeStyles}=exportsObject;
const luminance=hex=>{const channel=parseInt(hex.slice(1,3),16)/255;return channel<=0.04045?channel/12.92:((channel+0.055)/1.055)**2.4};
const contrast=(a,b)=>(Math.max(luminance(a),luminance(b))+.05)/(Math.min(luminance(a),luminance(b))+.05);
for(const scheme of ['light','dark']){
 mode=scheme;const colors=useThemeColors();assert.equal(colors,palettes[scheme]);
 for(const [token,hex] of Object.entries(colors))assert.ok(/^#([0-9a-f]{2})\1\1$/i.test(hex),`${scheme}.${token} must be grayscale`);
 for(const surface of ['bg','panel','card','elevated','bodyweightSoft'])for(const foreground of ['text','muted'])assert.ok(contrast(colors[surface],colors[foreground])>=4.5,`${scheme} ${foreground}/${surface} contrast`);
 assert.ok(contrast(colors.accent,colors.accentText)>=4.5);
 assert.ok(contrast(colors.switchThumb,colors.switchTrack)>=3);
 assert.equal(useThemeStyles(c=>({color:c.text})).styles.color,colors.text);
}
mode=null;assert.equal(useThemeColors(),palettes.light,'Unavailable appearance falls back to light');
const config=JSON.parse(fs.readFileSync(path.join(root,'app.json'),'utf8')).expo;
assert.equal(config.userInterfaceStyle,'automatic');assert.ok(config.plugins.includes('expo-system-ui'));
for(const folder of ['app','src/components'])for(const file of fs.readdirSync(path.join(root,folder)).filter(f=>f.endsWith('.tsx'))){
 const source=fs.readFileSync(path.join(root,folder,file),'utf8');
 assert.ok(!/import\s*\{\s*colors\b/.test(source),file+' must subscribe to theme updates');
 for(const [hex] of source.matchAll(/#[0-9a-f]{6}\b/gi))assert.ok(/^#([0-9a-f]{2})\1\1$/i.test(hex),file+' contains a legacy colour');
}
console.log('PASS: grayscale tokens, text/button/switch contrast, theme selection, fallback and automatic native configuration.');
