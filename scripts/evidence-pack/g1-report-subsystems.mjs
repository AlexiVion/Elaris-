// Local engineering analysis only. Source/derived real values are SENSITIVE.
// Group summaries are observational and cannot imply health, fault, or safety.
const GROUPS=Object.freeze([
  {id:"LEGS",label:"Piernas (OEM 0–11)",min:0,max:11},
  {id:"WAIST",label:"Cintura (OEM 12–14)",min:12,max:14},
  {id:"UPPER",label:"Miembros superiores (OEM 15–28)",min:15,max:28}
]);
const isnum=x=>typeof x==="number"&&Number.isFinite(x);
const from=(x,k)=>x&&Object.prototype.hasOwnProperty.call(x,k)?x[k]:null;
export function analyzeG1Subsystems(source) {
  if(!source?.phases?.some(p=>p.phaseId==="IDLE_BASELINE"))
    throw new Error("Same-session idle reference required");
  const phases=source.phases.filter(p=>p.phaseId!=="IDLE_BASELINE");
  const results=[];
  for(const phase of phases){
    for(const group of GROUPS){
      const entries=phase.components.filter(c=>c.oemIndex>=group.min&&c.oemIndex<=group.max);
      if(entries.length!==group.max-group.min+1)
        throw new Error("Incomplete anatomical mapping in "+phase.phaseId);
      const eligible=[],excluded=[];
      for(const joint of entries){
        const signal=joint.signals?.["joint.torque_estimate"];
        const s=signal?.summary;
        const cmp=joint.comparisonsToIdle?.["joint.torque_estimate"];
        const good=joint.availability==="OBSERVED" &&
          joint.slotStatus==="OBSERVED_USABLE" &&
          signal?.semanticsStatus==="NORMALIZED_ESTIMATE" &&
          isnum(s?.absP95)&&isnum(s?.coverage)&&s.coverage>0&&s.coverage<=1 &&
          Number.isSafeInteger(s?.samples)&&s.samples>0 &&
          isnum(cmp?.baselineAbsP95)&&isnum(cmp?.observedAbsP95)&&
          isnum(cmp?.absP95Delta);
        if(!good){
          excluded.push({componentId:joint.componentId,oemIndex:joint.oemIndex,
            reason:joint.slotStatus!=="OBSERVED_USABLE"?"UNRESOLVED_OR_INACTIVE_SLOT":
              signal?.semanticsStatus!=="NORMALIZED_ESTIMATE"?"SEMANTICS_UNCONFIRMED":
              "MISSING_OR_INVALID_MEASUREMENT"});
          continue;
        }
        eligible.push({
          componentId:joint.componentId,componentName:joint.componentName,
          oemIndex:joint.oemIndex,
          idleAbsP95:cmp.baselineAbsP95,
          observedAbsP95:cmp.observedAbsP95,
          signedDelta:cmp.absP95Delta,
          coverage:s.coverage,samples:s.samples,
          unit:s.unit??null,
          sourceRef:"/phases/"+source.phases.indexOf(phase)+
            "/components/"+phase.components.indexOf(joint)+
            "/comparisonsToIdle/joint.torque_estimate"
        });
      }
      const positive=eligible.filter(x=>x.signedDelta>0)
        .sort((a,b)=>b.signedDelta-a.signedDelta||a.oemIndex-b.oemIndex);
      const negative=eligible.filter(x=>x.signedDelta<0)
        .sort((a,b)=>a.signedDelta-b.signedDelta||a.oemIndex-b.oemIndex);
      const sorted=eligible.map(x=>x.signedDelta).sort((a,b)=>a-b);
      const median=sorted.length?sorted.length%2?
        sorted[(sorted.length-1)/2]:
        (sorted[sorted.length/2-1]+sorted[sorted.length/2])/2:null;
      results.push({
        phaseId:phase.phaseId,groupId:group.id,groupLabel:group.label,
        expectedSlots:entries.length,comparableSlots:eligible.length,
        excludedSlots:excluded.length,
        status:eligible.length?"DESCRIPTIVE_COMPARISON":"NOT_COMPARABLE",
        medianSignedDelta:median,
        largestPositive:positive[0]??null,
        largestNegative:negative[0]??null,
        topPositive:positive.slice(0,3),
        topNegative:negative.slice(0,3),
        excluded,
        interpretation:"Solo contraste intra-sesión de torque ESTIMADO; no comparar tareas como pruebas equivalentes.",
        limitations:["Sin diagnóstico ni umbral OEM","No sumar torques de articulaciones para estimar carga del grupo",
          "Exclusión explícita de componentes cuya semántica o observabilidad no está resuelta"]
      });
    }
  }
  if(results.length!==21)throw new Error("Expected 7 phases × 3 groups");
  return {
    schemaVersion:"elaris-g1-subsystem-evidence/v01",
    classification:"SENSITIVE",exportApproval:"NOT_APPROVED",
    reference:"SAME_SESSION_IDLE_PRIMARY",humanReview:"PENDING",
    noDiagnostics:true,rows:results
  };
}
