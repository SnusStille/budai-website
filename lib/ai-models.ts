/** Server-selected allowlist for the tiers already documented in .env.example.
 * Clients receive only public tier IDs/labels, never keys or private model names.
 */
export type ModelTier = "quality"|"fast"|"deep";
type Env=Record<string,string|undefined>;
const clean=(value:string|undefined)=>value?.trim()&&!value.includes("your-")?value.trim():undefined;
export function configuredModels(env:Env=process.env) {
  return {quality:clean(env.ANTHROPIC_MODEL)||"claude-sonnet-4-20250514",fast:clean(env.ANTHROPIC_MODEL_FAST),deep:clean(env.ANTHROPIC_MODEL_DEEP)};
}
export function publicModelOptions(env:Env=process.env) {
  const models=configuredModels(env);
  return (["quality","fast","deep"] as const).filter(id=>!!models[id]).map(id=>({id,label:id==="quality"?"Quality":id==="fast"?"Fast":"Deep"}));
}
export function resolveModelTier(value:unknown,env:Env=process.env) {
  const id=value===undefined||value===null?"quality":value;
  if(id!=="quality"&&id!=="fast"&&id!=="deep")return null;
  return configuredModels(env)[id]??null;
}
